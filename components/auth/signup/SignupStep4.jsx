"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { locationSchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { countries, incomeRanges } from "@/shared/constants/signupData";

const animatedComponents = makeAnimated();

const SignupStep4 = ({ nextStep, prevStep, formData }) => {
  return (
    <Formik
      initialValues={{
        citizenship: formData.citizenship || "",
        originCountry: formData.originCountry || "",
        willingToRelocate: formData.willingToRelocate || false,
        income: formData.income || "",
        marriageWithin: formData.marriageWithin || "",
      }}
      validationSchema={locationSchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Citizenship</label>
            <Select
              options={countries}
              value={countries.find((opt) => opt.value === values.citizenship)}
              onChange={(option) =>
                setFieldValue("citizenship", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your citizenship"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="citizenship"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Country of Origin</label>
            <Select
              options={countries}
              value={countries.find(
                (opt) => opt.value === values.originCountry
              )}
              onChange={(option) =>
                setFieldValue("originCountry", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your country of origin"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="originCountry"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-checkbox-group">
            <Field
              type="checkbox"
              name="willingToRelocate"
              id="willingToRelocate"
              className="form-checkbox"
            />
            <label htmlFor="willingToRelocate">Willing to relocate?</label>
          </div>

          <div className="form-group">
            <label>Income</label>
            <Select
              options={incomeRanges}
              value={incomeRanges.find((opt) => opt.value === values.income)}
              onChange={(option) =>
                setFieldValue("income", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your income range"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="income"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label htmlFor="marriageWithin">Looking to marry within</label>
            <Field
              type="text"
              name="marriageWithin"
              id="marriageWithin"
              className="form-input"
              placeholder="E.g., my community, any Muslim, etc."
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

export default SignupStep4;
