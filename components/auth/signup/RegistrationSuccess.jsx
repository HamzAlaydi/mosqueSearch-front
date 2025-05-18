"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSuccessMessage,
  clearSuccessMessage,
} from "@/redux/form/formSlice";
import Link from "next/link";

const RegistrationSuccess = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const successMessage = useSelector(selectSuccessMessage);
  const [timeRemaining, setTimeRemaining] = useState(10);

  useEffect(() => {
    // Set up countdown timer
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Clear success message from Redux store
          dispatch(clearSuccessMessage());
          // Redirect to login page
          router.push("/auth/login");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Cleanup timer on unmount
    return () => {
      clearInterval(timer);
      dispatch(clearSuccessMessage());
    };
  }, [successMessage, router, dispatch]);

  // Manually navigate to login
  const handleLoginClick = () => {
    dispatch(clearSuccessMessage());
    router.push("/auth/login");
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 mx-4 flex flex-col items-center gap-6">
        {/* Success Icon */}
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
          Registration Successful!
        </h1>

        {/* Email Verification Box */}
        <div className="w-full bg-blue-50 rounded-lg p-6 flex items-start gap-4 border-l-4 border-blue-500">
          <div className="text-blue-600 flex-shrink-0">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-blue-700 mb-2">
              Verify Your Email
            </h2>
            <p className="text-gray-600 leading-relaxed">
              We've sent a verification link to your email address. Please check
              your inbox and click the link to activate your account.
            </p>
          </div>
        </div>

        {/* Verification Note */}
        <div className="w-full bg-yellow-50 rounded-lg p-4 text-sm">
          <p className="text-yellow-800">
            <strong>Note:</strong> If you don't see the email in your inbox,
            please check your spam folder.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-4">
          <button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
            onClick={handleLoginClick}
          >
            Go to Login
          </button>

          <Link
            href="/auth/resend-verification"
            className="text-blue-600 hover:text-blue-800 text-center py-2 text-sm"
          >
            Didn't receive an email?
          </Link>
        </div>

        {/* Redirect Notice */}
        <div className="text-sm text-gray-500 mt-2">
          <p>
            Redirecting to login in{" "}
            <span className="font-bold text-blue-600">{timeRemaining}</span>{" "}
            seconds
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccess;
