// components/auth/signup/SignupForm.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateFormData, resetForm, setStep } from "@/redux/form/formSlice";
import { useSignupMutation } from "@/redux/auth/authAPI";
import SignupStep1 from "./SignupStep1";
import SignupStep2 from "./SignupStep2";
import SignupStep3 from "./SignupStep3";
import SignupStep4 from "./SignupStep4";
import SignupStep5 from "./SignupStep5";
import SignupStep6 from "./SignupStep6";
import SignupStep7 from "./SignupStep7";
import SignupStep8 from "./SignupStep8";
import ProgressBar from "@/shared/ui/ProgressBar";
import Link from "next/link";
import { rootRoute } from "@/shared/constants/backendLink";

const SignupForm = () => {
  const dispatch = useDispatch();
  const { formData, currentStep } = useSelector((state) => state.form);
  const [signup, { isLoading }] = useSignupMutation();
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const totalSteps = 8;

  const nextStep = () => dispatch(setStep(currentStep + 1)); 
  const prevStep = () => dispatch(setStep(currentStep - 1));

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const finalData = { ...formData, ...values };
      const formDataToSend = new FormData();
      console.log({formDataToSend});

      Object.keys(finalData).forEach((key) => {
        if (key === "profilePicture" && finalData[key]) {
          formDataToSend.append(key, finalData[key]);
        } else if (typeof finalData[key] !== 'undefined' && finalData[key] !== null) {
          // Only append values that are defined
          formDataToSend.append(key, finalData[key]);
        }
      });
      console.log({formDataToSend});
      

      const response = await signup({
        url: `${rootRoute}/auth/signup`,
        body: formDataToSend,
      }).unwrap();

      if (response.success) {
        setSuccessMessage(response.message);
        dispatch(resetForm());
      }
    } catch (error) {
      setErrors({
        email: " ",
        password: error.data?.message || "Signup failed",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleStepSubmit = (values) => {
    dispatch(updateFormData(values));
    nextStep();
  };

  useEffect(() => {
    return () => dispatch(resetForm());
  }, [dispatch]);

  if (successMessage) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Verify Your Email</h3>
            <p>{successMessage}</p>
            <button className="auth-button" onClick={() => router.push("/")}>
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{currentStep === 1 ? "Create Account" : "Complete Your Profile"}</h1>
          <p>
            Step {currentStep} of {totalSteps}
          </p>
          <ProgressBar step={currentStep} totalSteps={totalSteps} />
        </div>

        {currentStep === 1 && <SignupStep1 nextStep={handleStepSubmit} formData={formData} />}
        {currentStep === 2 && (
          <SignupStep2 nextStep={handleStepSubmit} prevStep={prevStep} formData={formData} />
        )}
        {currentStep === 3 && (
          <SignupStep3 nextStep={handleStepSubmit} prevStep={prevStep} formData={formData} />
        )}
        {currentStep === 4 && (
          <SignupStep4 nextStep={handleStepSubmit} prevStep={prevStep} formData={formData} />
        )}
        {currentStep === 5 && (
          <SignupStep5 nextStep={handleStepSubmit} prevStep={prevStep} formData={formData} />
        )}
        {currentStep === 6 && (
          <SignupStep6 nextStep={handleStepSubmit} prevStep={prevStep} formData={formData} />
        )}
        {currentStep === 7 && (
          <SignupStep7 nextStep={handleStepSubmit} prevStep={prevStep} formData={formData} />
        )}
        {currentStep === 8 && (
          <SignupStep8
            onSubmit={handleSubmit}
            prevStep={prevStep}
            isLoading={isLoading}
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