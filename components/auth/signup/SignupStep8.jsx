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
        nextStep(values); // Changed to use nextStep instead of onSubmit
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
              preview={values.profilePicturePreview}
              setFieldValue={setFieldValue}
            />
          </div>

          <div className="form-terms">
            <Field
              type="checkbox"
              id="terms"
              name="terms"
              required
              className="form-checkbox"
            />
            <label htmlFor="terms">
              I agree to the{" "}
              <Link href="/terms" className="auth-link">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="auth-link">
                Privacy Policy
              </Link>
            </label>
            <ErrorMessage
              name="terms"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-navigation">
            <button
              type="button"
              onClick={() => {
                prevStep({
                  profilePicture: values.profilePicture,
                  profilePicturePreview: values.profilePicturePreview,
                  terms: values.terms,
                });
              }}
              className="auth-button secondary"
            >
              Previous
            </button>
            <button
              type="submit"
              className="auth-button"
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
