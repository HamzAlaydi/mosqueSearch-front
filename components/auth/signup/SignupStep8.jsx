"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { finalStepSchema } from "@/shared/constants/validationSchemas";
import AvatarUpload from "@/shared/ui/AvatarUpload";
import Link from "next/link";

const SignupStep8 = ({ nextStep, prevStep, formData }) => {
  return (
    <Formik
      initialValues={{
        profilePicture: formData.profilePicture || null,
        profilePicturePreview: formData.profilePicturePreview || "",
        terms: formData.terms || false,
      }}
      validationSchema={finalStepSchema}
      onSubmit={(values) => {
        nextStep({
          ...values,
          profilePicture: values.profilePicture || null,
        });
      }}
      enableReinitialize={true}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Profile Picture (Optional)</label>
            <Field
              name="profilePicture"
              component={AvatarUpload}
              props={{
                preview: values.profilePicturePreview,
                onChange: (file, previewUrl) => {
                  setFieldValue("profilePicture", file);
                  setFieldValue("profilePicturePreview", previewUrl);
                },
                onClear: () => {
                  setFieldValue("profilePicture", null);
                  setFieldValue("profilePicturePreview", "");
                },
              }}
            />
            <ErrorMessage
              name="profilePicture"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-terms">
            <div className="checkbox-group">
              <Field
                type="checkbox"
                id="terms"
                name="terms"
                className="form-checkbox"
                required
              />
              <label htmlFor="terms">
                I agree to the{" "}
                <Link href="/terms" className="auth-link" target="_blank">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="auth-link" target="_blank">
                  Privacy Policy
                </Link>{" "}
                *
              </label>
            </div>
            <ErrorMessage
              name="terms"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-navigation">
            <button
              type="button"
              onClick={() => prevStep(values)}
              className="auth-button secondary"
            >
              Previous
            </button>
            <button
              type="submit"
              className="auth-button primary"
              disabled={isSubmitting}
            >
              Next
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default SignupStep8;
