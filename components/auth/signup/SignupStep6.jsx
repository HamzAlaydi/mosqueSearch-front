// components/auth/signup/SignupStep6.jsx
"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { physicalSchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  buildTypes,
  ethnicities,
  phoneUsage,
} from "@/shared/constants/signupData";

const animatedComponents = makeAnimated();

const SignupStep6 = ({ nextStep, prevStep, formData }) => {
  const isGenderFemale = formData.gender === "female";

  return (
    <Formik
      initialValues={{
        build: formData.build || "",
        ethnicity: formData.ethnicity || "",
        smokes: formData.smokes || false,
        drinks: formData.drinks || false,
        disability: formData.disability || false,
        phoneUsage: formData.phoneUsage || "",
        wearsHijab: isGenderFemale ? formData.wearsHijab || false : false,
      }}
      validationSchema={physicalSchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Build</label>
            <Select
              options={buildTypes}
              value={buildTypes.find((opt) => opt.value === values.build)}
              onChange={(option) => setFieldValue("build", option?.value || "")}
              components={animatedComponents}
              placeholder="Select your body build"
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="form-group">
            <label>Ethnicity*</label>
            <Select
              options={ethnicities}
              value={ethnicities.find((opt) => opt.value === values.ethnicity)}
              onChange={(option) =>
                setFieldValue("ethnicity", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your ethnicity"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="ethnicity"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-checkbox-group">
            <Field
              type="checkbox"
              name="smokes"
              id="smokes"
              className="form-checkbox"
            />
            <label htmlFor="smokes">Do you smoke?</label>
          </div>

          <div className="form-checkbox-group">
            <Field
              type="checkbox"
              name="drinks"
              id="drinks"
              className="form-checkbox"
            />
            <label htmlFor="drinks">Do you drink alcohol?</label>
          </div>

          <div className="form-checkbox-group">
            <Field
              type="checkbox"
              name="disability"
              id="disability"
              className="form-checkbox"
            />
            <label htmlFor="disability">Do you have any disability?</label>
          </div>

          {isGenderFemale && (
            <div className="form-checkbox-group">
              <Field
                type="checkbox"
                name="wearsHijab"
                id="wearsHijab"
                className="form-checkbox"
              />
              <label htmlFor="wearsHijab">Do you wear hijab?</label>
            </div>
          )}

          <div className="form-group">
            <label>Phone Usage</label>
            <Select
              options={phoneUsage}
              value={phoneUsage.find((opt) => opt.value === values.phoneUsage)}
              onChange={(option) =>
                setFieldValue("phoneUsage", option?.value || "")
              }
              components={animatedComponents}
              placeholder="How long do you spend on your phone daily?"
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

export default SignupStep6;
