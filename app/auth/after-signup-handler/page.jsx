"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { selectSuccessMessage } from "@/redux/form/formSlice";
import RegistrationSuccess from "@/components/auth/signup/RegistrationSuccess";
const AfterSignupHandler = () => {
  const router = useRouter();
  const successMessage = useSelector(selectSuccessMessage);

  // If we have a success message, show the verification screen
  return <RegistrationSuccess />;
};

export default AfterSignupHandler;
