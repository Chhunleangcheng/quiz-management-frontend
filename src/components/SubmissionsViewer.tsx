import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  listSubmissions,
  updateSubmissionScore,
  getErrorMessage,
} from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import type { SubmissionResponse } from "../types/api";

interface SubmissionsViewerProps {
  taskId: number;
  taskType: string;
}

const SubmissionsViewer: React.FC<SubmissionsViewerProps> = ({
  taskId,
  taskType,
}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [selectedSubmission, setSelectedSubmission] =
    useState<SubmissionResponse | null>(null);
  const [score, setScore] = useState("");

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["submissions", taskId],
    queryFn: () => listSubmissions(taskId),
    enabled: !!token,
  });

  const updateScoreMutation = useMutation({
    mutationFn: ({
      submissionId,
      score,
    }: {
      submissionId: number;
      score: number;
    }) => updateSubmissionScore(submissionId, { token: token!, score }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["submissions", taskId] });
      setSelectedSubmission(null);
      setScore("");
    },
    onError: (error) => {
      alert(getErrorMessage(error));
    },
  });

  const handleScoreUpdate = (submissionId: number) => {
    const scoreValue = parseFloat(score);
    if (isNaN(scoreValue)) {
      alert("Please enter a valid score");
      return;
    }
    updateScoreMutation.mutate({ submissionId, score: scoreValue });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        Student Submissions ({submissions?.data?.length || 0})
      </h3>

      {submissions?.data && submissions.data.length > 0 ? (
        <div className="space-y-4">
          {submissions.data.map((submission: SubmissionResponse) => (
            <div
              key={submission.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {submission.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {submission.username}
                      </p>
                      <p className="text-sm text-gray-500">
                        Submitted{" "}
                        {new Date(submission.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Answer Display */}
                  {taskType === "text" && submission.answer_text && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        Answer:
                      </p>
                      <p className="text-gray-900">{submission.answer_text}</p>
                    </div>
                  )}

                  {taskType === "quiz" && submission.quiz_answers && (
                    <div className="bg-gray-50 rounded-lg p-3 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Quiz Answers:
                      </p>
                      <div className="space-y-2">
                        {submission.quiz_answers.map(
                          (answer: any, idx: number) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-700">
                                Q{answer.question_index + 1}:
                              </span>{" "}
                              <span className="text-gray-900">
                                {answer.answer}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Score Section */}
                <div className="ml-4 text-right">
                  {submission.score !== null ? (
                    <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg">
                      <p className="text-sm font-medium">Score</p>
                      <p className="text-2xl font-bold">{submission.score}</p>
                    </div>
                  ) : taskType === "text" ? (
                    <button
                      onClick={() => {
                        setSelectedSubmission(submission);
                        setScore("");
                      }}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm"
                    >
                      Grade
                    </button>
                  ) : (
                    <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg">
                      <p className="text-sm">Auto-graded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-gray-400"
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
          <p>No submissions yet</p>
        </div>
      )}

      {/* Score Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4">
              Grade Submission - {selectedSubmission.username}
            </h4>

            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Student's Answer:
              </p>
              <p className="text-gray-900">{selectedSubmission.answer_text}</p>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score
              </label>
              <input
                type="number"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="Enter score (0-100)"
                min="0"
                max="100"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedSubmission(null);
                  setScore("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleScoreUpdate(selectedSubmission.id)}
                disabled={updateScoreMutation.isPending}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {updateScoreMutation.isPending ? "Saving..." : "Save Score"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsViewer;
