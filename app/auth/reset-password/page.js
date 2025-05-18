"use client";

import { useState, useEffect } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useResetPasswordMutation } from "@/redux/auth/authAPI";
import { useRouter, useParams } from "next/navigation";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPassword = () => {
  const router = useRouter();
  const params = useParams();
  const [token, setToken] = useState("");
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const [resetComplete, setResetComplete] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Extract token from URL parameters or query string
    const urlToken = params?.token;
    if (urlToken) {
      setToken(urlToken);
    } else {
      // Handle the case where token is not provided
      setStatusMessage("Reset token is missing or invalid");
    }
  }, [params]);

  const handleSubmit = async (values, { setSubmitting }) => {
    if (!token) {
      setStatusMessage("Reset token is missing or invalid");
      setSubmitting(false);
      return;
    }

    try {
      await resetPassword({
        token,
        password: values.password,
      }).unwrap();

      setResetComplete(true);
      setStatusMessage("Your password has been reset successfully!");
    } catch (error) {
      setStatusMessage(
        error?.data?.message ||
          "Failed to reset password. The token may be invalid or expired."
      );
    }
    setSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800">Reset Password</h1>
          <p className="text-gray-600 mt-2">Enter your new password below</p>
        </div>

        {resetComplete ? (
          <div className="flex flex-col items-center text-center py-6">
            <div className="w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-green-500"
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
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Password Reset Complete
            </h3>
            <p className="text-gray-600 mb-6">{statusMessage}</p>
            <div className="flex flex-col w-full gap-4">
              <Link
                href="/auth/login"
                className="w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Go to Login
              </Link>
            </div>
          </div>
        ) : (
          <Formik
            initialValues={{
              password: "",
              confirmPassword: "",
            }}
            validationSchema={ResetPasswordSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    New Password
                  </label>
                  <Field
                    type="password"
                    name="password"
                    id="password"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your new password"
                  />
                  <ErrorMessage
                    name="password"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Confirm Password
                  </label>
                  <Field
                    type="password"
                    name="confirmPassword"
                    id="confirmPassword"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Confirm your new password"
                  />
                  <ErrorMessage
                    name="confirmPassword"
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                {statusMessage && !resetComplete && (
                  <div className="text-red-600 text-sm">{statusMessage}</div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading || !token}
                    className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isSubmitting || isLoading
                      ? "Processing..."
                      : "Reset Password"}
                  </button>
                </div>

                <div className="text-center">
                  <Link
                    href="/auth/login"
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Back to Login
                  </Link>
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
