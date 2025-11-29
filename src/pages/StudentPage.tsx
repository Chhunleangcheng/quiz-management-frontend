import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyGroups,
  joinGroup,
  listTasks,
  submitTask,
  getMySubmission,
  getTask,
  getErrorMessage,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import type { GroupJoin, SubmissionCreate } from "../types/api";

const StudentPage: React.FC = () => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [groupCode, setGroupCode] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [answerText, setAnswerText] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<
    { question_index: number; answer: string }[]
  >([]);

  const { data: groups } = useQuery({
    queryKey: ["myGroups"],
    queryFn: getMyGroups,
    enabled: !!token,
  });

  const joinGroupMutation = useMutation({
    mutationFn: (data: Omit<GroupJoin, "token">) =>
      joinGroup({ ...data, token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      setGroupCode("");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const submitTaskMutation = useMutation({
    mutationFn: (data: Omit<SubmissionCreate, "token">) =>
      submitTask(selectedTaskId!, { ...data, token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["mySubmission", selectedTaskId],
      });
      setAnswerText("");
      setQuizAnswers([]);
      setSelectedTaskId(null);
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const handleJoinGroup = () => {
    joinGroupMutation.mutate({ group_code: groupCode });
  };

  const handleSubmitTask = () => {
    submitTaskMutation.mutate({
      answer_text: answerText || null,
      quiz_answers: quizAnswers.length ? quizAnswers : null,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          Student Dashboard
        </h1>

        {/* Join Group Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
            <svg
              className="w-6 h-6 mr-2 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Join a Class
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={groupCode}
              onChange={(e) => setGroupCode(e.target.value)}
              placeholder="Enter Group Code"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
            />
            <button
              onClick={handleJoinGroup}
              disabled={joinGroupMutation.isPending || !groupCode}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
            >
              {joinGroupMutation.isPending ? "Joining..." : "Join Class"}
            </button>
          </div>
        </div>

        {/* My Groups Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Class</h2>
          {groups?.data && groups.data.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {groups.data.map((group: any) => (
                <div
                  key={group.id}
                  className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {group.title}
                      </h3>
                      <p className="text-gray-600 mt-1">{group.description}</p>
                    </div>
                    <Link
                      to={`/group/${group.id}`}
                      className="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition duration-200 text-sm font-medium"
                    >
                      View Details
                    </Link>
                  </div>
                  <TasksList
                    key={group.id}
                    groupId={group.id}
                    onSelectTask={setSelectedTaskId}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
              <svg
                className="w-16 h-16 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 009.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-600 text-lg">
                You haven't joined any groups yet.
              </p>
              <p className="text-gray-500 mt-2">
                Enter a group code above to get started!
              </p>
            </div>
          )}
        </div>

        {/* Submit Task Modal/Section */}
        {selectedTaskId && (
          <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-blue-500">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Submit Task
            </h2>
            <TaskSubmissionForm
              taskId={selectedTaskId}
              onSubmit={handleSubmitTask}
              answerText={answerText}
              setAnswerText={setAnswerText}
              quizAnswers={quizAnswers}
              setQuizAnswers={setQuizAnswers}
              isPending={submitTaskMutation.isPending}
            />
            <button
              onClick={() => setSelectedTaskId(null)}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition duration-200"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper components
const TasksList: React.FC<{
  groupId: number;
  onSelectTask: (id: number) => void;
}> = ({ groupId, onSelectTask }) => {
  const { data: tasks } = useQuery({
    queryKey: ["tasks", groupId],
    queryFn: () => listTasks(groupId),
  });

  return (
    <div className="mt-4 space-y-3">
      <h4 className="font-semibold text-gray-700 mb-2">Tasks:</h4>
      {tasks?.data && tasks.data.length > 0 ? (
        tasks.data.map((task: any) => (
          <div
            key={task.id}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h5 className="font-semibold text-gray-900">{task.title}</h5>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full mt-1">
                  {task.task_type}
                </span>
                <MySubmissionView taskId={task.id} />
              </div>
              <div className="flex flex-col sm:flex-row gap-2 ml-4">
                <Link
                  to={`/task/${task.id}`}
                  className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-lg hover:bg-indigo-200 transition duration-200 text-sm font-medium text-center"
                >
                  View
                </Link>
                <button
                  onClick={() => onSelectTask(task.id)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg transition duration-200 text-sm font-medium"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        ))
      ) : (
        <p className="text-gray-500 text-sm">No tasks available</p>
      )}
    </div>
  );
};

const TaskSubmissionForm: React.FC<{
  taskId: number;
  onSubmit: () => void;
  answerText: string;
  setAnswerText: (s: string) => void;
  quizAnswers: { question_index: number; answer: string }[];
  setQuizAnswers: (a: { question_index: number; answer: string }[]) => void;
  isPending: boolean;
}> = ({
  taskId,
  onSubmit,
  answerText,
  setAnswerText,
  quizAnswers,
  setQuizAnswers,
  isPending,
}) => {
  const { data: task } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId),
  });

  const handleQuizAnswer = (index: number, answer: string) => {
    const updated = [...quizAnswers];
    const existing = updated.find((a) => a.question_index === index);
    if (existing) {
      existing.answer = answer;
    } else {
      updated.push({ question_index: index, answer });
    }
    setQuizAnswers(updated);
  };

  return (
    <div className="space-y-4">
      {task?.data.task_type === "text" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Your Answer
          </label>
          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
          />
        </div>
      )}
      {task?.data.task_type === "quiz" &&
        task.data.quiz_questions?.map((q: any, i: number) => (
          <div
            key={i}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <p className="font-medium text-gray-900 mb-3">
              {i + 1}. {q.question}
            </p>
            {q.type === "text" && (
              <input
                type="text"
                onChange={(e) => handleQuizAnswer(i, e.target.value)}
                placeholder="Your answer"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
              />
            )}
            {q.type === "multiple_choice" && q.options && (
              <select
                onChange={(e) => handleQuizAnswer(i, e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 outline-none"
              >
                <option value="">Select an answer</option>
                {q.options.map((opt: string, j: number) => (
                  <option key={j} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
      <button
        onClick={onSubmit}
        disabled={isPending}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 shadow-lg hover:shadow-xl"
      >
        {isPending ? "Submitting..." : "Submit Task"}
      </button>
    </div>
  );
};

const MySubmissionView: React.FC<{ taskId: number }> = ({ taskId }) => {
  const { data: submission } = useQuery({
    queryKey: ["mySubmission", taskId],
    queryFn: () => getMySubmission(taskId),
  });

  return (
    <div className="mt-2">
      {submission ? (
        <p className="text-sm text-green-600 font-medium">
          Score:{" "}
          {submission.data.score !== null && submission.data.score !== undefined
            ? submission.data.score
            : "Pending"}
        </p>
      ) : (
        <p className="text-sm text-gray-500">Not submitted</p>
      )}
    </div>
  );
};

export default StudentPage;
