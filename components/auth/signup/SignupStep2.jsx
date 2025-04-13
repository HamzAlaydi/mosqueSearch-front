// components/auth/signup/SignupStep2.jsx
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { educationSchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  educationLevels,
  professions,
  languages,
} from "@/shared/constants/signupData";

const animatedComponents = makeAnimated();

const SignupStep2 = ({ nextStep, prevStep, formData }) => {
  return (
    <Formik
      initialValues={{
        educationLevel: formData.educationLevel || "",
        profession: formData.profession || "",
        jobTitle: formData.jobTitle || "",
        firstLanguage: formData.firstLanguage || "",
        secondLanguage: formData.secondLanguage || "",
      }}
      validationSchema={educationSchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Education Level</label>
            <Select
              options={educationLevels}
              value={educationLevels.find(
                (opt) => opt.value === values.educationLevel
              )}
              onChange={(option) =>
                setFieldValue("educationLevel", option.value)
              }
              components={animatedComponents}
              placeholder="Select education level"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="educationLevel"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Profession</label>
            <Select
              options={professions}
              value={professions.find((opt) => opt.value === values.profession)}
              onChange={(option) => setFieldValue("profession", option.value)}
              components={animatedComponents}
              placeholder="Select your profession"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="profession"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label htmlFor="jobTitle">Job Title</label>
            <Field
              type="text"
              name="jobTitle"
              id="jobTitle"
              className="form-input"
              placeholder="Enter your job title"
            />
            <ErrorMessage
              name="jobTitle"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>First Language</label>
            <Select
              options={languages}
              value={languages.find(
                (opt) => opt.value === values.firstLanguage
              )}
              onChange={(option) =>
                setFieldValue("firstLanguage", option.value)
              }
              components={animatedComponents}
              placeholder="Select your first language"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="firstLanguage"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Second Language</label>
            <Select
              options={languages}
              value={languages.find(
                (opt) => opt.value === values.secondLanguage
              )}
              onChange={(option) =>
                setFieldValue("secondLanguage", option.value)
              }
              components={animatedComponents}
              placeholder="Select your second language"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
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

export default SignupStep2;
