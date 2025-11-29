// API Type Definitions based on OpenAPI Schema

// Auth Types
export interface UserRegister {
  username: string;
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  message: string;
  user: UserResponse;
  token: string;
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

export interface LogoutRequest {
  token: string;
}

export interface LogoutResponse {
  message: string;
}

// Profile Types
export interface ProfileResponse {
  id: number;
  username: string;
  email: string;
  avatar: string | null;
  created_at: string;
}

export interface ProfileUpdate {
  token: string;
  username?: string | null;
  email?: string | null;
}

export interface TokenRequest {
  token: string;
}

// Group Types
export interface GroupCreate {
  token: string;
  title: string;
  description?: string | null;
}

export interface GroupJoin {
  token: string;
  group_code: string;
}

export interface GroupResponse {
  id: number;
  title: string;
  description: string | null;
  owner_id: number;
  group_code: string;
  created_at: string;
  role: string;
}

export interface GroupMemberResponse {
  id: number;
  username: string;
  email: string;
  role: string;
  joined_at: string;
}

// Task Types
export interface QuizQuestion {
  question: string;
  type: string;
  options?: string[] | null;
  answer: string;
  is_required?: boolean;
}

export interface TaskCreate {
  token: string;
  group_id: number;
  title: string;
  description?: string | null;
  task_type: string;
  quiz_questions?: QuizQuestion[] | null;
  is_required?: boolean;
}

export interface TaskResponse {
  id: number;
  group_id: number;
  title: string;
  description: string | null;
  task_type: string;
  quiz_questions: any[] | null;
  is_required: boolean;
  created_at: string;
}

// Submission Types
export interface QuizAnswerItem {
  question_index: number;
  answer: string;
}

export interface SubmissionCreate {
  token: string;
  answer_text?: string | null;
  quiz_answers?: QuizAnswerItem[] | null;
}

export interface SubmissionResponse {
  id: number;
  task_id: number;
  user_id: number;
  group_id: number;
  answer_text: string | null;
  quiz_answers: any[] | null;
  score: number | null;
  submitted_at: string;
  username: string;
  task_title: string;
}

export interface ScoreUpdate {
  token: string;
  score: number;
}

export interface MessageResponse {
  message: string;
}

// Error Types
export interface ValidationError {
  loc: (string | number)[];
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail: ValidationError[];
}

// API Response wrapper
export interface ApiResponse<T> {
  data: T;
}
