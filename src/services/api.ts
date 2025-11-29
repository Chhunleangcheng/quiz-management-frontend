import axios, { AxiosError } from "axios";
import type {
  UserLogin,
  UserRegister,
  AuthResponse,
  RegisterResponse,
  LogoutRequest,
  LogoutResponse,
  ProfileResponse,
  ProfileUpdate,
  TokenRequest,
  GroupCreate,
  GroupJoin,
  GroupResponse,
  GroupMemberResponse,
  TaskCreate,
  TaskResponse,
  SubmissionCreate,
  SubmissionResponse,
  ScoreUpdate,
  MessageResponse,
} from "../types/api";

const API_BASE = "https://manage-quiz-fastapi.onrender.com";

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.params) {
    config.params = { ...config.params, token };
  } else if (token && !config.params) {
    config.params = { token };
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const login = (data: UserLogin) =>
  api.post<AuthResponse>("/auth/login", data);

export const register = (data: UserRegister) =>
  api.post<RegisterResponse>("/auth/register", data);

export const logout = (token: string) =>
  api.delete<LogoutResponse>("/auth/logout", {
    data: { token } as LogoutRequest,
  });

// Profile APIs
export const getProfile = () => api.get<ProfileResponse>("/profile");

export const updateProfile = (data: ProfileUpdate) =>
  api.put<ProfileResponse>("/profile", data);

export const uploadAvatar = (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  return api.post<ProfileResponse>("/profile/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const deleteAvatar = (token: string) =>
  api.delete<MessageResponse>("/profile/avatar", {
    data: { token } as TokenRequest,
  });

// Group APIs
export const createGroup = (data: GroupCreate) =>
  api.post<GroupResponse>("/group", data);

export const getMyGroups = () => api.get<GroupResponse[]>("/groups");

export const getGroup = (groupId: number) =>
  api.get<GroupResponse>(`/group/${groupId}`);

export const deleteGroup = (groupId: number) =>
  api.delete<MessageResponse>(`/group/${groupId}`);

export const joinGroup = (data: GroupJoin) =>
  api.post<MessageResponse>("/group/join", data);

export const listGroupMembers = (groupId: number) =>
  api.get<GroupMemberResponse[]>(`/group/${groupId}/members`);

// Task APIs
export const createTask = (data: TaskCreate) =>
  api.post<TaskResponse>("/task", data);

export const listTasks = (groupId: number) =>
  api.get<TaskResponse[]>(`/group/${groupId}/tasks`);

export const getTask = (taskId: number) =>
  api.get<TaskResponse>(`/task/${taskId}`);

export const deleteTask = (taskId: number) =>
  api.delete<MessageResponse>(`/task/${taskId}`);

// Submission APIs
export const submitTask = (taskId: number, data: SubmissionCreate) =>
  api.post<SubmissionResponse>(`/task/${taskId}/submit`, data);

export const listSubmissions = (taskId: number) =>
  api.get<SubmissionResponse[]>(`/task/${taskId}/submissions`);

export const getMySubmission = (taskId: number) =>
  api.get<SubmissionResponse>(`/task/${taskId}/my-submission`);

export const updateSubmissionScore = (
  submissionId: number,
  data: ScoreUpdate
) => api.put<MessageResponse>(`/submission/${submissionId}/score`, data);

// Utility function to handle API errors
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.detail;
    if (Array.isArray(message)) {
      return message.map((m: any) => m.msg).join(", ");
    }
    return message || error.message;
  }
  return "An unexpected error occurred";
};
