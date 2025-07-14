"use client";
import { useState, useEffect, useCallback } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import LocationSearch from "./step9Components/LocationSearch";
import OptimizedDistanceSlider from "./step9Components/OptimizedDistanceSlider";
import OptimizedMapContainer from "./step9Components/OptimizedMapContainer";
import SelectedMosquesList from "./step9Components/SelectedMosquesList";
import FormNavigation from "./step9Components/FormNavigation";
import { GOOGLE_API } from "@/shared/constants/backendLink";
import styles from "./SignupStep9.module.css";

const SignupStep9 = ({ onSubmit, prevStep, isLoading, formData }) => {
  const [userLocation, setUserLocation] = useState({
    lat: 51.5074,
    lng: -0.1278,
  });
  const [attachedMosques, setAttachedMosques] = useState(
    formData.attachedMosques || []
  );
  const [error, setError] = useState(null);

  // Validation schema

  const validationSchema = Yup.object().shape({
    distance: Yup.number()
      .required("Distance is required")
      .min(1, "Minimum 1 mile")
      .max(100, "Maximum 100 miles"),
    attachedMosques: Yup.array()
      .min(5, "Please select at least 5 mosques")
      .required("Mosque selection is required"),
  });

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setError("Could not get your location. Using default location.");
        }
      );
    }
  }, []);

  // Toggle mosque attachment - memoized to prevent recreation
  const toggleMosqueAttachment = useCallback((mosque) => {
    setAttachedMosques((prev) => {
      const isAttached = prev.some((m) => m.id === mosque.id);
      return isAttached
        ? prev.filter((m) => m.id !== mosque.id)
        : [...prev, mosque];
    });
  }, []);

  return (
    <Formik
      initialValues={{
        distance: formData.distance || 10,
        attachedMosques: formData.attachedMosques || [],
      }}
      validationSchema={validationSchema}
      onSubmit={(values, actions) => {
        // Touch the attachedMosques field to show validation errors
        actions.setFieldTouched("attachedMosques", true);

        const updatedValues = {
          ...values,
          attachedMosques: attachedMosques,
        };
        onSubmit(updatedValues, actions);
      }}
    >
      {({ setFieldValue, values, isSubmitting, errors, touched }) => {
        // Keep form values in sync with attached mosques
        useEffect(() => {
          setFieldValue("attachedMosques", attachedMosques);
        }, [attachedMosques, setFieldValue]);

        return (
          <Form className={styles.step9FormWrapper}>
            <div className={styles.step9Grid}>
              {/* Left: Selection Controls */}
              <div className={styles.leftPanel}>
                <h2 className={styles.heading}>Find Mosques Near You</h2>
                <p className={styles.subheading}>
                  Search for mosques in your area and select ones you'd like to
                  connect with.
                </p>
                {error && <div className={styles.errorBox}>{error}</div>}
                <LocationSearch
                  userLocation={userLocation}
                  setUserLocation={setUserLocation}
                  setError={setError}
                />
                <OptimizedDistanceSlider
                  values={values}
                  errors={errors}
                  touched={touched}
                  setFieldValue={setFieldValue}
                />
                <SelectedMosquesList
                  attachedMosques={attachedMosques}
                  toggleMosqueAttachment={toggleMosqueAttachment}
                />
                {errors.attachedMosques && touched.attachedMosques && (
                  <div className={styles.validationError}>
                    {errors.attachedMosques}
                  </div>
                )}
              </div>
              {/* Right: Map */}
              <OptimizedMapContainer
                userLocation={userLocation}
                distance={values.distance}
                attachedMosques={attachedMosques}
                toggleMosqueAttachment={toggleMosqueAttachment}
                setError={setError}
              />
            </div>
            <FormNavigation
              prevStep={() =>
                prevStep({
                  distance: values.distance,
                  attachedMosques,
                })
              }
              isSubmitting={isSubmitting}
              isLoading={isLoading}
            />
          </Form>
        );
      }}
    </Formik>
  );
};

export default SignupStep9;
