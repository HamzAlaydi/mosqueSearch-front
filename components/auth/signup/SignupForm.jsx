// Updated SignupForm.jsx to include redirect after success

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  setStep,
  updateFormData,
  resetForm,
  submitRegistration,
  selectSuccessMessage,
} from "@/redux/form/formSlice";
import SignupStep1 from "./SignupStep1";
import SignupStep2 from "./SignupStep2";
import SignupStep3 from "./SignupStep3";
import SignupStep4 from "./SignupStep4";
import SignupStep5 from "./SignupStep5";
import SignupStep6 from "./SignupStep6";
import SignupStep7 from "./SignupStep7";
import SignupStep8 from "./SignupStep8";
import SignupStep9 from "./SignupStep9";
import ProgressBar from "@/shared/ui/ProgressBar";
import Link from "next/link";
import { rootRoute } from "@/shared/constants/backendLink";
import "../auth.css";

const SignupForm = () => {
  const dispatch = useDispatch();
  const { formData, currentStep, error } = useSelector((state) => state.form);
  const successMessage = useSelector(selectSuccessMessage);
  const router = useRouter();

  const totalSteps = 9;

  const nextStep = () => dispatch(setStep(currentStep + 1));
  const prevStep = () => dispatch(setStep(currentStep - 1));

  const handleSubmit = async (values, { setSubmitting }) => {
    await dispatch(submitRegistration(values));
    setSubmitting(false);
  };

  const handleStepSubmit = (values) => {
    dispatch(updateFormData(values));
    nextStep();
  };

  useEffect(() => {
    return () => dispatch(resetForm());
  }, [dispatch]);

  // Add effect to handle success message and redirect
  useEffect(() => {
    if (successMessage) {
      // Redirect to verification page
      router.push("/auth/after-signup-handler");
    }
  }, [successMessage, router]);

  if (error) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => dispatch(resetForm())}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            {currentStep === 1
              ? "Create Account"
              : currentStep === 9
              ? "Connect with Mosques"
              : "Complete Your Profile"}
          </h1>
          <p>
            Step {currentStep} of {totalSteps}
          </p>
          <ProgressBar step={currentStep} totalSteps={totalSteps} />
        </div>

        {currentStep === 9 && (
          <SignupStep1 nextStep={handleStepSubmit} formData={formData} />
        )}
        {currentStep === 2 && (
          <SignupStep2
            nextStep={handleStepSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}
        {currentStep === 3 && (
          <SignupStep3
            nextStep={handleStepSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}
        {currentStep === 4 && (
          <SignupStep4
            nextStep={handleStepSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}
        {currentStep === 5 && (
          <SignupStep5
            nextStep={handleStepSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}
        {currentStep === 6 && (
          <SignupStep6
            nextStep={handleStepSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}
        {currentStep === 7 && (
          <SignupStep7
            nextStep={handleStepSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}
        {currentStep === 8 && (
          <SignupStep8
            nextStep={handleStepSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}
        {currentStep === 1 && (
          <SignupStep9
            onSubmit={handleSubmit}
            prevStep={prevStep}
            formData={formData}
          />
        )}

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link href="/auth/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
