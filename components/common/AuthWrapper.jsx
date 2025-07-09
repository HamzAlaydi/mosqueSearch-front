"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { setCredentials } from "@/redux/auth/authSlice";

const AuthWrapper = ({ children }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, token, user } = useSelector((state) => state.auth);

  useEffect(() => {
    // If Redux is empty but localStorage has token/user, sync Redux
    if (
      (!isAuthenticated || !token || !user) &&
      typeof window !== "undefined"
    ) {
      const localToken = localStorage.getItem("token");
      const localUser = localStorage.getItem("user");
      if (localToken && localUser) {
        dispatch(
          setCredentials({ token: localToken, user: JSON.parse(localUser) })
        );
      }
    }
  }, [isAuthenticated, token, user, dispatch]);

  useEffect(() => {
    // If after sync, still no token anywhere, redirect to login
    if (
      typeof window !== "undefined" &&
      !isAuthenticated &&
      !token &&
      !localStorage.getItem("token")
    ) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, token, router]);

  // Only redirect if no token anywhere; otherwise, always render children
  if (
    typeof window !== "undefined" &&
    !isAuthenticated &&
    !token &&
    !localStorage.getItem("token")
  ) {
    return null;
  }

  return children;
};

export default AuthWrapper;
