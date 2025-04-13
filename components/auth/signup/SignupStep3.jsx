"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { religiousInfoSchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  religiousnessOptions,
  prayerFrequency,
  quranReading,
} from "@/shared/constants/signupData";

const animatedComponents = makeAnimated();

const SignupStep3 = ({ nextStep, prevStep, formData }) => {
  return (
    <Formik
      initialValues={{
        religiousness: formData.religiousness || "",
        sector: formData.sector || "",
        isRevert: formData.isRevert || false,
        keepsHalal: formData.keepsHalal || false,
        prayerFrequency: formData.prayerFrequency || "",
        quranReading: formData.quranReading || "",
      }}
      validationSchema={religiousInfoSchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Religiousness</label>
            <Select
              options={religiousnessOptions}
              value={religiousnessOptions.find(
                (opt) => opt.value === values.religiousness
              )}
              onChange={(option) =>
                setFieldValue("religiousness", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your religiousness level"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="religiousness"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label htmlFor="sector">Sector</label>
            <Field
              type="text"
              name="sector"
              id="sector"
              className="form-input"
              placeholder="Enter your sector (optional)"
            />
          </div>

          <div className="form-checkbox-group">
            <Field
              type="checkbox"
              name="isRevert"
              id="isRevert"
              className="form-checkbox"
            />
            <label htmlFor="isRevert">Are you a revert?</label>
          </div>

          <div className="form-checkbox-group">
            <Field
              type="checkbox"
              name="keepsHalal"
              id="keepsHalal"
              className="form-checkbox"
            />
            <label htmlFor="keepsHalal">Do you keep halal?</label>
          </div>

          <div className="form-group">
            <label>Prayer Frequency</label>
            <Select
              options={prayerFrequency}
              value={prayerFrequency.find(
                (opt) => opt.value === values.prayerFrequency
              )}
              onChange={(option) =>
                setFieldValue("prayerFrequency", option?.value || "")
              }
              components={animatedComponents}
              placeholder="How often do you pray?"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="prayerFrequency"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Quran Reading</label>
            <Select
              options={quranReading}
              value={quranReading.find(
                (opt) => opt.value === values.quranReading
              )}
              onChange={(option) =>
                setFieldValue("quranReading", option?.value || "")
              }
              components={animatedComponents}
              placeholder="How often do you read Quran?"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="quranReading"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-navigation">
            <button
              type="button"
              onClick={prevStep}
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

export default SignupStep3;
