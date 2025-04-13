"use client";
import {
  useVerifyEmailMutation,
  useResendVerificationMutation,
} from "@/redux/auth/authAPI";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const VerifyEmail = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");
  const [verifyEmail, { isLoading: isVerifying }] = useVerifyEmailMutation();
  const [resendVerification, { isLoading: isResending }] =
    useResendVerificationMutation();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (token) {
      verifyEmail({ token })
        .unwrap()
        .then(() => {
          setMessage("Your email has been verified successfully!");
          setTimeout(() => router.push("/login"), 3000);
        })
        .catch((err) => {
          setError(
            err.data?.message ||
              "Verification failed. The link may be invalid or expired."
          );
        });
    }
  }, [token, router, verifyEmail]);

  const handleResend = async () => {
    if (!email) return;
    try {
      await resendVerification(email).unwrap();
      setMessage("A new verification email has been sent to your inbox.");
    } catch (err) {
      setError(err.data?.message || "Failed to resend verification email.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Email Verification</h1>
        </div>

        <div className="verification-message">
          {message ? (
            <>
              <div className="success-icon">
                <i className="fas fa-check-circle"></i>
              </div>
              <p>{message}</p>
              {message.includes("successfully") && (
                <p>Redirecting to login page...</p>
              )}
            </>
          ) : error ? (
            <>
              <div className="error-icon">
                <i className="fas fa-exclamation-circle"></i>
              </div>
              <p className="error-text">{error}</p>
              {email && (
                <button
                  onClick={handleResend}
                  disabled={isResending}
                  className="auth-button"
                >
                  {isResending ? "Sending..." : "Resend Verification Email"}
                </button>
              )}
            </>
          ) : (
            <>
              <div className="loading-icon">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <p>Verifying your email...</p>
            </>
          )}

          <div className="auth-footer">
            <Link href="/" className="auth-link">
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
