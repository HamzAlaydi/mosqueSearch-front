"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { locationSchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  incomeRanges,
  marriageTimelineOptions,
} from "@/shared/constants/signupData";
import CountrySelect from "@/components/common/CountrySelect";

const animatedComponents = makeAnimated();

// Add marriage timeline options

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
            <label>Citizenship*</label>
            <CountrySelect
              name="citizenship"
              value={values.citizenship}
              onChange={setFieldValue}
              placeholder="Search for your citizenship country"
              isRequired={true}
            />
            <ErrorMessage
              name="citizenship"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Country of Origin*</label>
            <CountrySelect
              name="originCountry"
              value={values.originCountry}
              onChange={setFieldValue}
              placeholder="Search for your country of origin"
              isRequired={true}
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
            <label>Looking to marry within</label>
            <Select
              options={marriageTimelineOptions}
              value={marriageTimelineOptions.find(
                (opt) => opt.value === values.marriageWithin
              )}
              onChange={(option) =>
                setFieldValue("marriageWithin", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your marriage timeline"
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
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
