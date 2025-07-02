"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";

const TestProtectedPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    console.log("Test Protected Page - Auth Status:", {
      isAuthenticated,
      user,
    });
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Protected Page Test
        </h1>
        <div className="space-y-4">
          <div>
            <strong>Authentication Status:</strong>{" "}
            {isAuthenticated ? "Authenticated" : "Not Authenticated"}
          </div>
          {user && (
            <div>
              <strong>User:</strong> {user.name || user.email}
            </div>
          )}
          <div>
            <strong>Role:</strong> {user?.role || "No role"}
          </div>
          <p className="text-gray-600">
            If you can see this page, you are authenticated. If you were not
            authenticated, you should have been redirected to the login page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestProtectedPage;
