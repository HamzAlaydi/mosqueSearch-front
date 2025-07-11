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
        blurPhotoForEveryone:
          typeof formData.blurPhotoForEveryone === "boolean"
            ? formData.blurPhotoForEveryone
            : true,
      }}
      validationSchema={finalStepSchema}
      onSubmit={(values) => {
        nextStep({
          ...values,
          profilePicture: values.profilePicture || null,
          blurPhotoForEveryone: values.blurPhotoForEveryone,
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
                blurPhotoForEveryone: values.blurPhotoForEveryone,
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
            <div className="flex items-center mt-2">
              <label
                htmlFor="blurPhotoForEveryone"
                className="mr-2 text-sm font-medium"
              >
                Blur my photo for everyone (except approved users)
              </label>
              <Field name="blurPhotoForEveryone">
                {({ field, form }) => (
                  <label className="signup-toggle-switch">
                    <input
                      type="checkbox"
                      id="blurPhotoForEveryone"
                      checked={field.value}
                      onChange={() =>
                        form.setFieldValue("blurPhotoForEveryone", !field.value)
                      }
                      aria-label="Blur my photo for everyone (except approved users)"
                    />
                    <span className="signup-toggle-slider" />
                  </label>
                )}
              </Field>
            </div>
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
              <label htmlFor="terms" className="ml-2">
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
