"use client";
import { useState, useEffect, useCallback } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import MapContainer from "./step9Components/MapContainer";
import LocationSearch from "./step9Components/LocationSearch";
import DistanceSlider from "./step9Components/DistanceSlider";
import SelectedMosquesList from "./step9Components/SelectedMosquesList";
import FormNavigation from "./step9Components/FormNavigation";
import { GOOGLE_API } from "@/shared/constants/backendLink";

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

  // Toggle mosque attachment
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
        const updatedValues = {
          ...values,
          attachedMosques: attachedMosques,
        };
        onSubmit(updatedValues, actions);
      }}
    >
      {({ setFieldValue, values, isSubmitting, errors, touched }) => {
        useEffect(() => {
          setFieldValue("attachedMosques", attachedMosques);
        }, [attachedMosques, setFieldValue]);

        return (
          <Form className="auth-form">
            <div className="form-group">
              <h2 className="text-lg font-medium">Find Mosques Near You</h2>
              <p className="text-sm text-gray-600 mb-4">
                Search for mosques in your area and select ones you'd like to
                connect with.
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <LocationSearch
                userLocation={userLocation}
                setUserLocation={setUserLocation}
                setError={setError}
              />

              <DistanceSlider
                values={values}
                errors={errors}
                touched={touched}
                setFieldValue={setFieldValue}
              />

              <MapContainer
                userLocation={userLocation}
                distance={values.distance}
                attachedMosques={attachedMosques}
                toggleMosqueAttachment={toggleMosqueAttachment}
                setError={setError}
              />

              <SelectedMosquesList
                attachedMosques={attachedMosques}
                toggleMosqueAttachment={toggleMosqueAttachment}
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
