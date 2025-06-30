"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { updateFormData, resetForm, setStep } from "@/redux/form/formSlice";
import { useSignupMutation } from "@/redux/auth/authAPI";
import Link from "next/link";
import ProgressBar from "@/shared/ui/ProgressBar";
import { rootRoute } from "@/shared/constants/backendLink";

// Import Step Components
import ImamSignupStep1 from "@/components/auth/imamSignup/ImamSignupStep1";
import ImamSignupStep2 from "@/components/auth/imamSignup/ImamSignupStep2";
import SuccessMessage from "@/components/common/SuccessMessage";

const ImamSignup = () => {
  const dispatch = useDispatch();
  const { formData, currentStep } = useSelector((state) => state.form);
  const [signup, { isLoading }] = useSignupMutation();
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  const totalSteps = 2;

  useEffect(() => {
    // Reset step to 1 when component mounts
    dispatch(setStep(1));
    return () => dispatch(resetForm());
  }, [dispatch]);

  const nextStep = () => dispatch(setStep(currentStep + 1));
  const prevStep = () => dispatch(setStep(currentStep - 1));

  const handleStepSubmit = (values) => {
    dispatch(updateFormData(values));
    nextStep();
  };

  const handleFinalSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const finalData = { ...formData, ...values };

      // Create mosque details object
      const mosqueData = {
        name: `${finalData.firstName} ${finalData.lastName}`,
        address: finalData.mosqueAddress,
        location: finalData.mosqueLocation || { lat: 0, lng: 0 },
        imam: {
          name: `${finalData.firstName} ${finalData.lastName}`,
          email: finalData.email,
          phone: finalData.phone,
          languages: finalData.languages.map((lang) => lang.value),
          message: finalData.message,
        },
      };

      const formDataToSend = new FormData();

      // Only send the necessary fields for imam signup
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "password",
        "phone",
        "mosqueAddress",
        "message",
        "languages",
        "role",
        "distance",
        "attachedMosques",
        "mosqueLocation",
      ];

      // Add only the required fields
      requiredFields.forEach((key) => {
        if (finalData[key] !== undefined && finalData[key] !== null) {
          if (key === "languages") {
            // Convert languages array to JSON string
            formDataToSend.append(
              key,
              JSON.stringify(finalData[key].map((lang) => lang.value))
            );
          } else if (key === "attachedMosques" && finalData[key]) {
            // Convert attached mosques array to JSON string before sending
            formDataToSend.append(key, JSON.stringify(finalData[key]));
          } else if (key === "mosqueLocation" && finalData[key]) {
            // Convert mosque location to JSON string
            formDataToSend.append(key, JSON.stringify(finalData[key]));
          } else {
            formDataToSend.append(key, finalData[key]);
          }
        }
      });

      // Add role and mosque details
      formDataToSend.append("role", "imam");
      formDataToSend.append("mosqueDetails", JSON.stringify(mosqueData));

      const response = await signup({
        url: `${rootRoute}/auth/imam-signup`,
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

  if (successMessage) {
    return (
      <SuccessMessage
        message={successMessage}
        onRedirect={() => router.push("/")}
      />
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>
            {currentStep === 1 ? "Imam Registration" : "Connect with Mosques"}
          </h1>
          <p>
            Step {currentStep} of {totalSteps}
          </p>
          <ProgressBar step={currentStep} totalSteps={totalSteps} />
        </div>

        {currentStep === 1 && (
          <ImamSignupStep1 onSubmit={handleStepSubmit} formData={formData} />
        )}

        {currentStep === 2 && (
          <ImamSignupStep2
            onSubmit={handleFinalSubmit}
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

export default ImamSignup;
