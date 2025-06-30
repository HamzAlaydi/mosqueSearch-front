"use client";
import { useLoginMutation } from "@/redux/auth/authAPI";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import "./login.css";
import { setCredentials } from "@/redux/auth/authSlice";
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email").required("Required"),
  password: Yup.string().required("Required"),
});

const Login = () => {
  const [showVerifyLink, setShowVerifyLink] = useState(false);

  const [login, { isLoading }] = useLoginMutation();
  const router = useRouter();
  const { token, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Function to get redirect path based on user role
  const getRedirectPath = (userRole) => {
    switch (userRole) {
      case "imam":
        return "/imam";
      case "superadmin":
        return "/superAdmin";
      default:
        return "/mosqueSearch";
    }
  };

  useEffect(() => {
    if (token && user) {
      const redirectPath = getRedirectPath(user.role);
      router.push(redirectPath);
    }
  }, [token, user, router]);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your MosqueMatch account</p>
        </div>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={LoginSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            try {
              const data = await login(values).unwrap();
              dispatch(setCredentials(data));
              document.cookie = `token=${data.token}; path=/;`;

              // Redirect based on user role
              const redirectPath = getRedirectPath(data.user.role);
              router.push(redirectPath);
            } catch (error) {
              const errorMessage =
                error?.data?.message || "Invalid credentials";

              setErrors({
                email: "",
                password: errorMessage,
              });

              if (errorMessage.toLowerCase().includes("verify")) {
                setShowVerifyLink(true);
              }
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ isSubmitting }) => (
            <Form className="auth-form">
              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="form-input"
                  placeholder="Enter your email"
                />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="error-message"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <Field
                  type="password"
                  name="password"
                  id="password"
                  className="form-input"
                  placeholder="Enter your password"
                />
                <ErrorMessage
                  name="password"
                  component="div"
                  className="error-message"
                />
              </div>

              {showVerifyLink && (
                <div className="verify-link-wrapper">
                  <Link
                    href="/auth/resend-verification"
                    className="forgot-password"
                  >
                    Please verify your email — Click here
                  </Link>
                </div>
              )}

              <div className="form-options">
                <div className="remember-me">
                  <Field type="checkbox" id="remember" name="remember" />
                  <label htmlFor="remember">Remember me</label>
                </div>
                <Link href="/auth/forgot-password" className="forgot-password">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? "Signing In..." : "Sign In"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link href="/auth/signup" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
