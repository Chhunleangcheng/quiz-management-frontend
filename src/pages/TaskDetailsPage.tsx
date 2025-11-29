import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTask,
  submitTask,
  getMySubmission,
  getGroup,
  getErrorMessage,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import SubmissionsViewer from "../components/SubmissionsViewer";
import type { QuizAnswerItem } from "../types/api";

const TaskDetailsPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const { token, user } = useAuth();
  const queryClient = useQueryClient();

  const [answerText, setAnswerText] = useState("");
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswerItem[]>([]);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const { data: task } = useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(Number(taskId)),
  });

  const { data: mySubmission } = useQuery({
    queryKey: ["mySubmission", taskId],
    queryFn: () => getMySubmission(Number(taskId)),
    enabled: !!taskId && !!token,
  });

  const { data: group } = useQuery({
    queryKey: ["group", task?.data?.group_id],
    queryFn: () => getGroup(task!.data.group_id),
    enabled: !!task?.data?.group_id,
  });

  const submitTaskMutation = useMutation({
    mutationFn: () =>
      submitTask(Number(taskId), {
        token: token!,
        answer_text: answerText || null,
        quiz_answers: quizAnswers.length > 0 ? quizAnswers : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mySubmission", taskId] });
      setAnswerText("");
      setQuizAnswers([]);
      setShowSubmissionForm(false);
      alert("Submission successful!");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const handleQuizAnswerChange = (questionIndex: number, answer: string) => {
    const existing = quizAnswers.find(
      (a) => a.question_index === questionIndex
    );
    if (existing) {
      setQuizAnswers(
        quizAnswers.map((a) =>
          a.question_index === questionIndex ? { ...a, answer } : a
        )
      );
    } else {
      setQuizAnswers([
        ...quizAnswers,
        { question_index: questionIndex, answer },
      ]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitTaskMutation.mutate();
  };

  const isOwner = group?.data?.role === "owner";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-8 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => window.history.back()}
            className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
          >
            <svg
              className="w-5 h-5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
        </div>

        {task && (
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Task Header */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {task.data.title}
                </h1>
                <p className="text-gray-600 text-lg">{task.data.description}</p>
              </div>
              <div className="ml-4">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                    task.data.task_type === "quiz"
                      ? "bg-purple-100 text-purple-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {task.data.task_type === "quiz" ? "Quiz" : "Text Response"}
                </span>
              </div>
            </div>

            {/* Task Type Icon */}
            <div className="flex items-center justify-center mb-8">
              <div className="bg-blue-100 p-6 rounded-2xl">
                {task.data.task_type === "quiz" ? (
                  <svg
                    className="w-16 h-16 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-16 h-16 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Quiz Questions Section */}
            {task.data.quiz_questions && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Quiz Questions
                </h2>
                <div className="space-y-6">
                  {task.data.quiz_questions.map((q: any, i: number) => (
                    <div
                      key={i}
                      className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100"
                    >
                      <div className="flex items-start">
                        <div className="bg-purple-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3 flex-shrink-0">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <p className="text-lg font-semibold text-gray-900 mb-3">
                            {q.question}
                          </p>

                          <div className="bg-white rounded-lg p-4">
                            <p className="text-sm font-medium text-gray-500 mb-2">
                              Question Type
                            </p>
                            <p className="text-gray-900 capitalize font-medium">
                              {q.type === "multiple_choice"
                                ? "Multiple Choice"
                                : "Text Answer"}
                            </p>
                          </div>

                          {q.options && (
                            <div className="mt-4 bg-white rounded-lg p-4">
                              <p className="text-sm font-medium text-gray-500 mb-3">
                                Options
                              </p>
                              <div className="space-y-2">
                                {q.options.map((opt: string, j: number) => (
                                  <div
                                    key={j}
                                    className="flex items-center space-x-2 text-gray-900"
                                  >
                                    <span className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center text-xs font-medium">
                                      {String.fromCharCode(65 + j)}
                                    </span>
                                    <span>{opt}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {q.is_required && (
                            <div className="mt-3">
                              <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium">
                                Required
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text Task Info */}
            {task.data.task_type === "text" && (
              <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Submission Format
                </h3>
                <p className="text-gray-700">
                  This task requires a text-based response. Students can submit
                  their answers in paragraph form.
                </p>
              </div>
            )}

            {/* Submission Status */}
            {!isOwner && (
              <div className="mt-8">
                {mySubmission?.data ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-center mb-4">
                      <svg
                        className="w-6 h-6 text-green-600 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <h3 className="text-lg font-semibold text-green-900">
                        You have submitted this task
                      </h3>
                    </div>
                    <p className="text-sm text-green-700 mb-2">
                      Submitted:{" "}
                      {new Date(
                        mySubmission.data.submitted_at
                      ).toLocaleString()}
                    </p>
                    {mySubmission.data.score !== null && (
                      <div className="bg-white rounded-lg p-4 mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Your Score:
                        </p>
                        <p className="text-3xl font-bold text-green-600">
                          {mySubmission.data.score}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSubmissionForm(!showSubmissionForm)}
                    className="w-full flex items-center justify-center space-x-2 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-lg font-semibold"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span>
                      {showSubmissionForm
                        ? "Hide Submission Form"
                        : "Submit Task"}
                    </span>
                  </button>
                )}
              </div>
            )}

            {/* Submission Form */}
            {showSubmissionForm && !isOwner && !mySubmission?.data && (
              <div className="mt-6 bg-white border-2 border-blue-500 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Submit Your Answer
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {task.data.task_type === "text" ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Answer
                      </label>
                      <textarea
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={8}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {task.data.quiz_questions?.map(
                        (q: any, index: number) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <p className="font-medium text-gray-900 mb-3">
                              {index + 1}. {q.question}
                            </p>
                            {q.type === "multiple_choice" && q.options ? (
                              <div className="space-y-2">
                                {q.options.map(
                                  (option: string, optIndex: number) => (
                                    <label
                                      key={optIndex}
                                      className="flex items-center space-x-2 cursor-pointer"
                                    >
                                      <input
                                        type="radio"
                                        name={`question-${index}`}
                                        value={option}
                                        onChange={(e) =>
                                          handleQuizAnswerChange(
                                            index,
                                            e.target.value
                                          )
                                        }
                                        required={q.is_required}
                                        className="text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-gray-900">
                                        {option}
                                      </span>
                                    </label>
                                  )
                                )}
                              </div>
                            ) : (
                              <input
                                type="text"
                                onChange={(e) =>
                                  handleQuizAnswerChange(index, e.target.value)
                                }
                                placeholder="Your answer"
                                required={q.is_required}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                              />
                            )}
                          </div>
                        )
                      )}
                    </div>
                  )}

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowSubmissionForm(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitTaskMutation.isPending}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitTaskMutation.isPending
                        ? "Submitting..."
                        : "Submit"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Teacher View: Submissions */}
            {isOwner && taskId && (
              <div className="mt-8">
                <SubmissionsViewer
                  taskId={Number(taskId)}
                  taskType={task.data.task_type}
                />
              </div>
            )}
          </div>
        )}

        {!task && (
          <div className="bg-white rounded-2xl shadow-2xl p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading task details...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDetailsPage;
