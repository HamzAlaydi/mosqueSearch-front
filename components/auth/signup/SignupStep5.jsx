"use client";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { familySchema } from "@/shared/constants/validationSchemas";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import {
  maritalStatuses,
  childrenOptions,
  livingArrangements,
} from "@/shared/constants/signupData";

const animatedComponents = makeAnimated();

const SignupStep5 = ({ nextStep, prevStep, formData }) => {
  return (
    <Formik
      initialValues={{
        maritalStatus: formData.maritalStatus || "",
        childrenDesire: formData.childrenDesire || "",
        hasChildren: formData.hasChildren || "",
        livingArrangement: formData.livingArrangement || "",
        height: formData.height || "",
      }}
      validationSchema={familySchema}
      onSubmit={(values) => {
        nextStep(values);
      }}
    >
      {({ setFieldValue, values, isSubmitting }) => (
        <Form className="auth-form">
          <div className="form-group">
            <label>Marital Status</label>
            <Select
              options={maritalStatuses}
              value={maritalStatuses.find(
                (opt) => opt.value === values.maritalStatus
              )}
              onChange={(option) =>
                setFieldValue("maritalStatus", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your marital status"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="maritalStatus"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Would you like to have children?</label>
            <Select
              options={childrenOptions}
              value={childrenOptions.find(
                (opt) => opt.value === values.childrenDesire
              )}
              onChange={(option) =>
                setFieldValue("childrenDesire", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your preference"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="childrenDesire"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label>Do you have children?</label>
            <Select
              options={childrenOptions}
              value={childrenOptions.find(
                (opt) => opt.value === values.hasChildren
              )}
              onChange={(option) =>
                setFieldValue("hasChildren", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select if you have children"
              isClearable
              className="react-select-container"
              classNamePrefix="react-select"
            />
          </div>

          <div className="form-group">
            <label>Living Arrangements</label>
            <Select
              options={livingArrangements}
              value={livingArrangements.find(
                (opt) => opt.value === values.livingArrangement
              )}
              onChange={(option) =>
                setFieldValue("livingArrangement", option?.value || "")
              }
              components={animatedComponents}
              placeholder="Select your living arrangement"
              className="react-select-container"
              classNamePrefix="react-select"
            />
            <ErrorMessage
              name="livingArrangement"
              component="div"
              className="error-message"
            />
          </div>

          <div className="form-group">
            <label htmlFor="height">Height (cm)</label>
            <Field
              type="number"
              name="height"
              id="height"
              className="form-input"
              placeholder="Enter your height in cm"
              min="100"
              max="250"
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

export default SignupStep5;
