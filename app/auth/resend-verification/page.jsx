"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useResendVerificationMutation } from "@/redux/auth/authAPI";
import Link from "next/link";

const ResendVerification = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const [resendVerification, { isLoading }] = useResendVerificationMutation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    try {
      const response = await resendVerification(email).unwrap();
      setSubmitted(true);
    } catch (err) {
      setError(
        err?.data?.message ||
          "Failed to resend verification email. Please try again."
      );
    }
  };

  const handleBackToLogin = () => {
    router.push("/auth/login");
  };

  if (submitted) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 mx-4 flex flex-col items-center gap-6">
          <div className="text-green-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">
            Verification Email Sent!
          </h1>

          <div className="w-full bg-blue-50 rounded-lg p-6 border-l-4 border-blue-500">
            <div className="verification-message">
              <p className="text-gray-600 leading-relaxed">
                We've sent a new verification email to <strong>{email}</strong>.
                Please check your inbox and click the link to activate your
                account.
              </p>
            </div>
          </div>

          <div className="w-full bg-yellow-50 rounded-lg p-4 text-sm">
            <p className="text-yellow-800">
              <strong>Note:</strong> If you don't see the email in your inbox,
              please check your spam folder.
            </p>
          </div>

          <div className="w-full">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-primary py-3 px-4 rounded-md font-medium transition-colors"
              onClick={handleBackToLogin}
            >
              Return to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 mx-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            Resend Verification Email
          </h1>
          <p className="text-gray-600 mt-2">
            Enter your email address to receive a new verification link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-primary py-3 px-4 rounded-md font-medium transition-colors disabled:bg-blue-400"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Resend Verification Email"}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/auth/login"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResendVerification;
