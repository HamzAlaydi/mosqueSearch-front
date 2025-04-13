"use client";
import { useSignupMutation } from "@/redux/auth/authAPI";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import "./signup.css";

const animatedComponents = makeAnimated();

const Signup = () => {
  const [step, setStep] = useState(1);
  const [signup, { isLoading }] = useSignupMutation();
  const [successMessage, setSuccessMessage] = useState("");
  const router = useRouter();

  // Dummy data for dropdowns (replace with API calls in real implementation)
  const educationLevels = [
    { value: "preparatory", label: "Preparatory or Junior" },
    { value: "high_school", label: "High School" },
    { value: "bachelor", label: "Bachelor Degree" },
    { value: "master", label: "Master Degree" },
    { value: "phd", label: "PhD" },
  ];

  const professions = [
    {
      value: "construction",
      label: "Construction/Building Trades/Engineering",
    },
    { value: "healthcare", label: "Healthcare" },
    { value: "education", label: "Education" },
    { value: "it", label: "Information Technology" },
    { value: "finance", label: "Finance" },
  ];

  const languages = [
    { value: "arabic", label: "Arabic" },
    { value: "english", label: "English" },
    { value: "dutch", label: "Dutch" },
    { value: "french", label: "French" },
    { value: "urdu", label: "Urdu" },
  ];

  const religiousnessOptions = [
    { value: "very_religious", label: "Very Religious" },
    { value: "religious", label: "Religious" },
    { value: "moderate", label: "Moderate" },
    { value: "secular", label: "Secular" },
  ];

  const prayerFrequency = [
    { value: "always", label: "Always" },
    { value: "often", label: "Often" },
    { value: "sometimes", label: "Sometimes" },
    { value: "rarely", label: "Rarely" },
  ];

  const quranReading = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "rarely", label: "Rarely" },
  ];

  const countries = [
    { value: "us", label: "United States" },
    { value: "uk", label: "United Kingdom" },
    { value: "sa", label: "Saudi Arabia" },
    { value: "ae", label: "UAE" },
    { value: "nl", label: "Netherlands" },
  ];

  const incomeRanges = [
    { value: "under_20k", label: "Under $20,000" },
    { value: "20k_50k", label: "$20,000 - $50,000" },
    { value: "50k_100k", label: "$50,000 - $100,000" },
    { value: "over_100k", label: "Over $100,000" },
  ];

  const maritalStatuses = [
    { value: "single", label: "Single" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];

  const childrenOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "want", label: "Would like to have" },
  ];

  const livingArrangements = [
    { value: "alone", label: "Live alone" },
    { value: "family", label: "With family" },
    { value: "shared", label: "Shared accommodation" },
  ];

  const buildTypes = [
    { value: "slim", label: "Slim" },
    { value: "average", label: "Average" },
    { value: "athletic", label: "Athletic" },
    { value: "heavy", label: "Heavy" },
  ];

  const ethnicities = [
    { value: "arab", label: "Arab" },
    { value: "asian", label: "Asian" },
    { value: "african", label: "African" },
    { value: "european", label: "European" },
    { value: "mixed", label: "Mixed" },
  ];

  const phoneUsage = [
    { value: "1h", label: "Less than 1 hour" },
    { value: "2h", label: "1-2 hours" },
    { value: "3h", label: "2-3 hours" },
    { value: "4h", label: "More than 3 hours" },
  ];

  const SignupSchema = Yup.object().shape({
    // Step 1 fields
    gender: Yup.string().required("Required"),
    email: Yup.string().email("Invalid email").required("Required"),
    password: Yup.string()
      .min(8, "Password must be at least 8 characters")
      .required("Required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Required"),

    // Step 2 fields
    educationLevel: Yup.string().required("Required"),
    profession: Yup.string().required("Required"),
    jobTitle: Yup.string().required("Required"),
    firstLanguage: Yup.string().required("Required"),
    secondLanguage: Yup.string(),

    // Step 3 fields
    religiousness: Yup.string().required("Required"),
    sector: Yup.string(),
    isRevert: Yup.boolean(),
    keepsHalal: Yup.boolean(),
    prayerFrequency: Yup.string().required("Required"),
    quranReading: Yup.string().required("Required"),

    // Step 4 fields
    citizenship: Yup.string().required("Required"),
    originCountry: Yup.string().required("Required"),
    willingToRelocate: Yup.boolean(),
    income: Yup.string().required("Required"),
    marriageWithin: Yup.string(),

    // Step 5 fields
    maritalStatus: Yup.string().required("Required"),
    childrenDesire: Yup.string().required("Required"),
    hasChildren: Yup.string(),
    livingArrangement: Yup.string().required("Required"),
    height: Yup.string(),

    // Step 6 fields
    build: Yup.string(),
    ethnicity: Yup.string().required("Required"),
    smokes: Yup.boolean(),
    drinks: Yup.boolean(),
    disability: Yup.boolean(),
    phoneUsage: Yup.string(),

    // Step 7 fields
    profilePicture: Yup.mixed(),
    terms: Yup.boolean().required("You must accept the terms"),
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{step === 1 ? "Create Account" : "Complete Your Profile"}</h1>
          <p>Step {step} of 7</p>

          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${(step / 7) * 100}%` }}
            ></div>
          </div>
        </div>

        {successMessage ? (
          <div className="success-message">
            <div className="success-icon">
              <i className="fas fa-envelope"></i>
            </div>
            <h3>Verify Your Email</h3>
            <p>{successMessage}</p>
            <button className="auth-button" onClick={() => router.push("/")}>
              Return Home
            </button>
          </div>
        ) : (
          <Formik
            initialValues={{
              gender: "",
              email: "",
              password: "",
              confirmPassword: "",
              educationLevel: "",
              profession: "",
              jobTitle: "",
              firstLanguage: "",
              secondLanguage: "",
              religiousness: "",
              sector: "",
              isRevert: false,
              keepsHalal: false,
              prayerFrequency: "",
              quranReading: "",
              citizenship: "",
              originCountry: "",
              willingToRelocate: false,
              income: "",
              marriageWithin: "",
              maritalStatus: "",
              childrenDesire: "",
              hasChildren: "",
              livingArrangement: "",
              height: "",
              build: "",
              ethnicity: "",
              smokes: false,
              drinks: false,
              disability: false,
              phoneUsage: "",
              profilePicture: null,
              profilePicturePreview: "",
              terms: false,
            }}
            validationSchema={SignupSchema}
            onSubmit={async (values, { setSubmitting, setErrors }) => {
              try {
                // Prepare form data for file upload
                const formData = new FormData();
                Object.keys(values).forEach((key) => {
                  if (key === "profilePicture" && values[key]) {
                    formData.append(key, values[key]);
                  } else {
                    formData.append(key, values[key]);
                  }
                });

                await signup(formData).unwrap();
                setSuccessMessage(
                  `We've sent a verification email to ${values.email}. ` +
                    `Please check your inbox and click the link to verify your account.`
                );
              } catch (error) {
                setErrors({
                  email: " ",
                  password: error.data?.message || "Signup failed",
                });
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, setFieldValue, values }) => (
              <Form className="auth-form">
                {step === 1 && (
                  <>
                    <div className="form-group">
                      <label htmlFor="gender">Gender</label>
                      <Field
                        as="select"
                        name="gender"
                        id="gender"
                        className="form-input"
                      >
                        <option value="">Select your gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Field>
                      <ErrorMessage
                        name="gender"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Email Address</label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className="form-input"
                        placeholder="Enter your email"
                      />
                      <ErrorMessage
                        name="email"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="password">Password</label>
                      <Field
                        type="password"
                        name="password"
                        id="password"
                        className="form-input"
                        placeholder="Create a password"
                      />
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="error-message"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirm Password</label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        className="form-input"
                        placeholder="Confirm your password"
                      />
                      <ErrorMessage
                        name="confirmPassword"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </>
                )}

                {step === 2 && (
                  <>
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
                        onChange={(option) =>
                          setFieldValue("profession", option.value)
                        }
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
                  </>
                )}

                {step === 3 && (
                  <>
                    <div className="form-group">
                      <label>Religiousness</label>
                      <Select
                        options={religiousnessOptions}
                        onChange={(option) =>
                          setFieldValue("religiousness", option.value)
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
                        onChange={(option) =>
                          setFieldValue("prayerFrequency", option.value)
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
                        onChange={(option) =>
                          setFieldValue("quranReading", option.value)
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
                  </>
                )}

                {step === 4 && (
                  <>
                    <div className="form-group">
                      <label>Citizenship</label>
                      <Select
                        options={countries}
                        onChange={(option) =>
                          setFieldValue("citizenship", option.value)
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
                        onChange={(option) =>
                          setFieldValue("originCountry", option.value)
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
                      <label htmlFor="willingToRelocate">
                        Willing to relocate?
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Income</label>
                      <Select
                        options={incomeRanges}
                        onChange={(option) =>
                          setFieldValue("income", option.value)
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
                      <label htmlFor="marriageWithin">
                        Looking to marry within
                      </label>
                      <Field
                        type="text"
                        name="marriageWithin"
                        id="marriageWithin"
                        className="form-input"
                        placeholder="E.g., my community, any Muslim, etc."
                      />
                    </div>
                  </>
                )}

                {step === 5 && (
                  <>
                    <div className="form-group">
                      <label>Marital Status</label>
                      <Select
                        options={maritalStatuses}
                        onChange={(option) =>
                          setFieldValue("maritalStatus", option.value)
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
                        onChange={(option) =>
                          setFieldValue("childrenDesire", option.value)
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
                        onChange={(option) =>
                          setFieldValue("hasChildren", option.value)
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
                        onChange={(option) =>
                          setFieldValue("livingArrangement", option.value)
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
                      />
                    </div>
                  </>
                )}

                {step === 6 && (
                  <>
                    <div className="form-group">
                      <label>Build</label>
                      <Select
                        options={buildTypes}
                        onChange={(option) =>
                          setFieldValue("build", option.value)
                        }
                        components={animatedComponents}
                        placeholder="Select your body build"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>

                    <div className="form-group">
                      <label>Ethnicity</label>
                      <Select
                        options={ethnicities}
                        onChange={(option) =>
                          setFieldValue("ethnicity", option.value)
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
                      <label htmlFor="disability">
                        Do you have any disability?
                      </label>
                    </div>

                    <div className="form-group">
                      <label>Phone Usage</label>
                      <Select
                        options={phoneUsage}
                        onChange={(option) =>
                          setFieldValue("phoneUsage", option.value)
                        }
                        components={animatedComponents}
                        placeholder="How long do you spend on your phone daily?"
                        className="react-select-container"
                        classNamePrefix="react-select"
                      />
                    </div>
                  </>
                )}

                {step === 7 && (
                  <>
                    <div className="form-group">
                      <label>Profile Picture</label>
                      <div className="whatsapp-avatar-upload">
                        <div className="avatar-container">
                          <div
                            className="avatar-preview"
                            style={{
                              backgroundImage: values.profilePicturePreview
                                ? `url(${values.profilePicturePreview})`
                                : "url(/images/default-avatar.jpg)",
                            }}
                          >
                            <div className="edit-overlay">
                              <input
                                type="file"
                                name="profilePicture"
                                id="profilePicture"
                                accept="image/png, image/jpeg"
                                onChange={(event) => {
                                  if (event.currentTarget.files[0]) {
                                    const reader = new FileReader();
                                    reader.onload = (e) => {
                                      setFieldValue(
                                        "profilePicturePreview",
                                        e.target.result
                                      );
                                    };
                                    reader.readAsDataURL(
                                      event.currentTarget.files[0]
                                    );
                                    setFieldValue(
                                      "profilePicture",
                                      event.currentTarget.files[0]
                                    );
                                  }
                                }}
                                className="avatar-input"
                              />
                              <label
                                htmlFor="profilePicture"
                                className="edit-button"
                              >
                                <i className="fas fa-camera"></i>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div className="upload-instructions">
                          <p>Tap to change profile photo</p>
                          {values.profilePicture && (
                            <p className="file-name">
                              {values.profilePicture.name}
                            </p>
                          )}
                        </div>
                      </div>
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
                        <Link href="/terms">Terms of Service</Link> and{" "}
                        <Link href="/privacy">Privacy Policy</Link>
                      </label>
                      <ErrorMessage
                        name="terms"
                        component="div"
                        className="error-message"
                      />
                    </div>
                  </>
                )}

                <div className="form-navigation">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={prevStep}
                      className="auth-button secondary"
                    >
                      Previous
                    </button>
                  )}

                  {step < 7 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="auth-button"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="auth-button"
                      disabled={isSubmitting || isLoading}
                    >
                      {isSubmitting || isLoading
                        ? "Creating Account..."
                        : "Complete Registration"}
                    </button>
                  )}
                </div>
              </Form>
            )}
          </Formik>
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

export default Signup;
