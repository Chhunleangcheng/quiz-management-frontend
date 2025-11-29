import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask, getErrorMessage } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { TaskCreate, QuizQuestion } from "../types/api";

interface CreateTaskModalProps {
  groupId: number;
  isOpen: boolean;
  onClose: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  groupId,
  isOpen,
  onClose,
}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskType, setTaskType] = useState<"text" | "quiz">("text");
  const [isRequired, setIsRequired] = useState(true);
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [errorMessage, setErrorMessage] = useState("");

  const createTaskMutation = useMutation({
    mutationFn: (data: Omit<TaskCreate, "token">) =>
      createTask({ ...data, token: token! }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", groupId] });
      resetForm();
      onClose();
    },
    onError: (error) => {
      setErrorMessage(getErrorMessage(error));
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setTaskType("text");
    setIsRequired(true);
    setQuizQuestions([]);
    setErrorMessage("");
  };

  const addQuestion = () => {
    setQuizQuestions([
      ...quizQuestions,
      {
        question: "",
        type: "text",
        answer: "",
        is_required: true,
      },
    ]);
  };

  const updateQuestion = (
    index: number,
    field: keyof QuizQuestion,
    value: any
  ) => {
    const updated = [...quizQuestions];
    updated[index] = { ...updated[index], [field]: value };
    setQuizQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTaskMutation.mutate({
      group_id: groupId,
      title,
      description: description || null,
      task_type: taskType,
      quiz_questions: taskType === "quiz" ? quizQuestions : null,
      is_required: isRequired,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h3 className="text-2xl font-bold text-gray-900">Create New Task</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Type *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="text"
                  checked={taskType === "text"}
                  onChange={(e) =>
                    setTaskType(e.target.value as "text" | "quiz")
                  }
                  className="mr-2"
                />
                <span>Text Response</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="quiz"
                  checked={taskType === "quiz"}
                  onChange={(e) =>
                    setTaskType(e.target.value as "text" | "quiz")
                  }
                  className="mr-2"
                />
                <span>Quiz</span>
              </label>
            </div>
          </div>

          {/* Required */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm font-medium text-gray-700">
                This task is required
              </span>
            </label>
          </div>

          {/* Quiz Questions */}
          {taskType === "quiz" && (
            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-900">
                  Quiz Questions
                </h4>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  <svg
                    className="w-5 h-5"
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
                  <span>Add Question</span>
                </button>
              </div>

              {quizQuestions.map((q, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-medium text-gray-900">
                      Question {index + 1}
                    </h5>
                    <button
                      type="button"
                      onClick={() => removeQuestion(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        updateQuestion(index, "question", e.target.value)
                      }
                      placeholder="Question text"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />

                    <select
                      value={q.type}
                      onChange={(e) =>
                        updateQuestion(index, "type", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="text">Text</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="true_false">True/False</option>
                    </select>

                    {q.type === "multiple_choice" && (
                      <textarea
                        value={q.options?.join("\n") || ""}
                        onChange={(e) =>
                          updateQuestion(
                            index,
                            "options",
                            e.target.value.split("\n")
                          )
                        }
                        placeholder="Enter options (one per line)"
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      />
                    )}

                    <input
                      type="text"
                      value={q.answer}
                      onChange={(e) =>
                        updateQuestion(index, "answer", e.target.value)
                      }
                      placeholder="Correct answer"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={q.is_required !== false}
                        onChange={(e) =>
                          updateQuestion(index, "is_required", e.target.checked)
                        }
                        className="mr-2 rounded border-gray-300 text-purple-600"
                      />
                      <span className="text-sm text-gray-700">
                        Required question
                      </span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="text-sm font-medium">{errorMessage}</p>
            </div>
          )}

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createTaskMutation.isPending}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {createTaskMutation.isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;
