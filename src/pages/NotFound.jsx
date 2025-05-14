import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-full">
            <FileQuestion className="h-12 w-12 text-primary-600 dark:text-primary-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            404
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">
            Page Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        <div className="flex justify-center gap-4">
          <Button as={Link} to="/dashboard" variant="outline">
            Go to Dashboard
          </Button>
          <Button as={Link} to="/login">
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}
