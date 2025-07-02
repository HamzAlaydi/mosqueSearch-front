// Updated redux/auth/authAPI.js with verification endpoints
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { setCredentials, logoutUser } from "./authSlice";
import { rootRoute } from "@/shared/constants/backendLink";

export const authAPI = createApi({
  reducerPath: "authAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: rootRoute,
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data)); // Dispatch credentials automatically
        } catch (err) {
          // Handle error
          console.error("Login failed:", err);
        }
      },
    }),
    signup: builder.mutation({
      query: ({ url, body, headers }) => {
        // Check if body is FormData
        const isFormData = body instanceof FormData;

        return {
          url,
          method: "POST",
          body,
          // Use provided headers or set default based on body type
          headers:
            headers ||
            (isFormData ? {} : { "Content-Type": "application/json" }),
        };
      },
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          dispatch(logoutUser());
        } catch (error) {
          // Handle error if needed
        }
      },
    }),
    getUserProfile: builder.query({
      query: () => "/user/profile",
    }),
    forgotPassword: builder.mutation({
      query: (email) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: { email },
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ token, password }) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: { token, password },
      }),
    }),
    // New endpoints for email verification
    verifyEmail: builder.mutation({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: JSON.stringify(data), // Send the entire data object as JSON
        headers: {
          "Content-Type": "application/json", // Specify JSON content type
        },
      }),
    }),
    resendVerification: builder.mutation({
      query: (email) => ({
        url: "/auth/resend-verification",
        method: "POST",
        body: { email },
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useSignupMutation,
  useLogoutMutation,
  useGetUserProfileQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authAPI;
