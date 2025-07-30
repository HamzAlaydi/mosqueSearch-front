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

const SignupStep9 = ({ onSubmit, prevStep, isLoading, formData }) => {
  const [userLocation, setUserLocation] = useState({
    lat: 51.5074,
    lng: -0.1278,
  });
  const [attachedMosques, setAttachedMosques] = useState(
    formData.attachedMosques || []
  );
  const [error, setError] = useState(null);
  const [isMobileView, setIsMobileView] = useState(false);

  // Check if we're on mobile and handle viewport
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileView(isMobile);
      
      // Set viewport meta tag for mobile
      if (isMobile) {
        const viewport = document.querySelector('meta[name="viewport"]');
        if (viewport) {
          viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => {
      window.removeEventListener('resize', checkMobile);
      // Reset viewport when component unmounts
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
      // Removed: Reset body styles (overflow/height)
    };
  }, []);

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
          setError("");
        }
      );
    }
  }, []);

  // Toggle mosque attachment - memoized to prevent recreation
  const toggleMosqueAttachment = useCallback((mosque) => {
    setAttachedMosques((prev) => {
      const isAttached = prev.some((m) => m.id === mosque.id);

      if (isAttached) {
        // Remove mosque
        return prev.filter((m) => m.id !== mosque.id);
      } else {
        // Add mosque to the TOP of the list for immediate visibility
        return [mosque, ...prev];
      }
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
          <Form
            className="w-full flex flex-col bg-slate-50 overflow-hidden font-sans"
            style={{
              height: window.innerWidth < 768 ? '100vh' : '75vh',
              minHeight: window.innerWidth < 768 ? '100vh' : '75vh',
              maxHeight: window.innerWidth < 768 ? '100vh' : '75vh',
              margin: window.innerWidth < 768 ? '0' : '12.5vh auto',
              maxWidth: '1200px',
            }}
          >
            {/* Show mosque selection error at the top */}
            {errors.attachedMosques && touched.attachedMosques && (
              <div className="bg-gradient-to-br from-red-50 to-red-100 text-red-600 border border-red-300 rounded-lg p-2 mx-2 mt-1 text-xs font-medium shadow-sm flex items-center gap-1 flex-shrink-0">
                <span className="text-sm">⚠</span>
                {errors.attachedMosques}
              </div>
            )}
            {/* Main content area: map + controls */}
            <div
              className={
                'flex flex-col md:flex-row w-full flex-1 overflow-hidden min-h-0' +
                (window.innerWidth < 768 ? ' min-h-0 flex-1' : '')
              }
              style={{
                display: 'flex',
                height: window.innerWidth < 768 ? 'auto' : 'calc(75vh - 80px)',
                minHeight: 0,
                flex: 1,
              }}
            >
              {/* Map Panel */}
              <div
                className="w-full md:w-7/10 lg:w-7/10 bg-white relative overflow-hidden order-2 md:order-1 rounded-md shadow-md min-h-0 flex-1"
                style={{
                  flex: window.innerWidth < 768 ? '1 1 50%' : '0 0 70%',
                  width: window.innerWidth < 768 ? '100%' : '70%',
                  minWidth: window.innerWidth < 768 ? '100%' : '70%',
                  minHeight: 0,
                }}
              >
                <OptimizedMapContainer
                  userLocation={userLocation}
                  distance={values.distance}
                  attachedMosques={attachedMosques}
                  toggleMosqueAttachment={toggleMosqueAttachment}
                  setError={setError}
                />
              </div>
              {/* Controls Panel */}
              <div
                className="w-full md:w-3/10 lg:w-3/10 bg-slate-50 border-t md:border-l md:border-t-0 border-slate-200 flex flex-col overflow-hidden order-1 md:order-2 rounded-md shadow-md min-h-0 flex-1"
                style={{
                  flex: window.innerWidth < 768 ? '1 1 50%' : '0 0 30%',
                  width: window.innerWidth < 768 ? '100%' : '30%',
                  minWidth: window.innerWidth < 768 ? '100%' : '30%',
                  minHeight: 0,
                }}
              >
                <div className="flex flex-col h-full p-2 md:p-3 gap-2 md:gap-3 overflow-auto min-h-0">
                  {error && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 text-red-600 border border-red-300 rounded-md p-2 md:p-3 text-xs font-medium shadow-sm flex-shrink-0">
                      {error}
                    </div>
                  )}
                  {/* Location Search Section */}
                  <div className="bg-white border border-slate-200 rounded-md p-2 md:p-3 shadow-sm flex-shrink-0">
                    <LocationSearch
                      userLocation={userLocation}
                      setUserLocation={setUserLocation}
                      setError={setError}
                    />
                  </div>
                  {/* Distance Slider Section */}
                  <div className="bg-white border border-slate-200 rounded-md p-2 md:p-3 shadow-sm flex-shrink-0">
                    <OptimizedDistanceSlider
                      values={values}
                      errors={errors}
                      touched={touched}
                      setFieldValue={setFieldValue}
                    />
                  </div>
                  {/* Selected Mosques Section */}
                  <div className="bg-white border border-slate-200 rounded-md p-2 md:p-3 shadow-sm flex-1 overflow-hidden min-h-0">
                    <SelectedMosquesList
                      attachedMosques={attachedMosques}
                      toggleMosqueAttachment={toggleMosqueAttachment}
                    />
                  </div>
                </div>
              </div>
            </div>
            {/* Mobile Selected Mosques Card - Only show on mobile, positioned after map and before buttons */}
            {isMobileView && (
              <div
                className="w-full bg-white border border-slate-200 rounded-md p-3 shadow-sm flex-shrink-0"
                style={{
                  minHeight: '100px',
                  maxHeight: '160px',
                  margin: '8px 0',
                  overflowY: 'auto',
                }}
              >
                <SelectedMosquesList
                  attachedMosques={attachedMosques}
                  toggleMosqueAttachment={toggleMosqueAttachment}
                />
              </div>
            )}
            {/* Navigation - Fixed at bottom with proper spacing */}
            <div
              className="h-16 md:h-20 p-2 md:p-3 bg-white border-t border-slate-200 flex-shrink-0 flex items-center justify-between rounded-md shadow-md"
              style={{
                height: '80px',
                minHeight: '80px',
                maxHeight: '80px',
                padding: window.innerWidth < 768 ? '8px 12px' : '12px 16px',
              }}
            >
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
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default SignupStep9;
