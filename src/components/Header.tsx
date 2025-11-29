import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { logout } from "../services/api";
import { useMutation } from "@tanstack/react-query";

const Header: React.FC = () => {
  const { token, setToken, setUser } = useAuth();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: () => logout(token!),
    onSuccess: () => {
      setToken(null);
      setUser(null);
      navigate("/");
    },
  });

  return (
    <header className="bg-gradient-to-r from-blue-600 to-indigo-700 shadow-lg">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-white rounded-lg p-2">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <span className="text-white text-xl font-bold hidden sm:block">
              Class Manager
            </span>
          </Link>

          <div className="flex items-center space-x-1 sm:space-x-4">
            <Link
              to="/"
              className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
            >
              Home
            </Link>
            {token && (
              <>
                <Link
                  to="/profile"
                  className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  Profile
                </Link>
                <Link
                  to="/teacher"
                  className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  Teacher
                </Link>
                <Link
                  to="/student"
                  className="text-white hover:bg-white/10 px-3 py-2 rounded-lg transition duration-200 text-sm sm:text-base"
                >
                  Student
                </Link>
                <button
                  onClick={() => logoutMutation.mutate()}
                  disabled={logoutMutation.isPending}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200 disabled:opacity-50 text-sm sm:text-base"
                >
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
