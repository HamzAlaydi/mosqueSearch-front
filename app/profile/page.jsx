"use client";

import { useState, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  updateUserProfile,
  updateProfilePicture,
  requestUnblurPicture,
  clearSuccess,
  clearError,
  fetchUserProfile,
} from "@/redux/user/userSlice";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  User,
  MapPin,
  Book,
  Briefcase,
  Heart,
  Mail,
  Phone,
  MessageCircle,
  Save,
  Flag,
  Upload,
  Info,
  Calendar,
  Star,
  AlertCircle,
  Loader,
  Check,
  Hand, // For religion section
  Target, // For preferences
} from "lucide-react";
import { calculateAge, getAvatar } from "@/shared/helper/defaultData";
import useCountryFlag from "@/shared/helper/useCountryFlag";
import coverImage from "@/public/images/matches/background.jpg";

// Form Section Component
const FormSection = ({ title, icon, children }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden border border-gray-100">
      <div
        className="flex justify-between items-center px-6 py-4 cursor-pointer select-none"
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-primary-dark">{icon}</span>}
          <h3 className="font-semibold text-lg text-gray-800">{title}</h3>
        </div>
        {isExpanded ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        )}
      </div>
      {isExpanded && (
        <div className="px-6 py-5 border-t border-gray-100">{children}</div>
      )}
    </div>
  );
};

// Form Field Component
const FormField = ({
  label,
  type = "text",
  name,
  value,
  onChange,
  options = [],
  placeholder = "",
  required = false,
}) => {
  if (type === "select") {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required={required}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent min-h-32"
          placeholder={placeholder}
          required={required}
        />
      </div>
    );
  }

  if (type === "checkbox") {
    return (
      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          id={name}
          name={name}
          checked={!!value}
          onChange={(e) =>
            onChange({ target: { name, value: e.target.checked } })
          }
          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
        />
        <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
          {label}
        </label>
      </div>
    );
  }

  if (type === "date") {
    return (
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <input
          type="date"
          name={name}
          value={value ? new Date(value).toISOString().split("T")[0] : ""}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          required={required}
        />
      </div>
    );
  }

  // Default text input
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
};

export default function EditProfile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const { currentUser } = useSelector(
    (state) => ({
      currentUser: state.user.currentUser,
    }),
    shallowEqual
  );
  const { loading, pictureLoading, error, success, unblurRequest } = "ss";

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    tagLine: "",
    about: "",
    lookingFor: "",
    birthDate: "",
    height: "",
    build: "",
    ethnicity: "",
    disability: false,
    currentLocation: "",
    countryOfBirth: "",
    citizenship: "",
    originCountry: "",
    willingToRelocate: false,
    educationLevel: "",
    profession: "",
    jobTitle: "",
    income: "",
    languages: [], // Assuming this is an array of strings
    firstLanguage: "",
    secondLanguage: "",
    maritalStatus: "",
    childrenDesire: "",
    hasChildren: "",
    livingArrangement: "",
    marriageWithin: "",
    religiousness: "",
    sector: "",
    isRevert: false,
    keepsHalal: true,
    prayerFrequency: "",
    quranReading: "",
    smokes: false,
    drinks: false,
    phoneUsage: "",
    // Female-specific fields
    wearsHijab: false,
    wali: {
      name: "",
      phone: "",
      email: "",
    },
    // Male-specific fields
    hasBeard: false,
  });

  const [profileImage, setProfileImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");

  // Options for select inputs
  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "bachelors", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
    { value: "other", label: "Other" },
  ];

  const professionOptions = [
    { value: "education", label: "Education" },
    { value: "healthcare", label: "Healthcare" },
    { value: "technology", label: "Technology" },
    { value: "business", label: "Business" },
    { value: "arts", label: "Arts" },
    { value: "other", label: "Other" },
  ];

  const maritalStatusOptions = [
    { value: "single", label: "Single" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
  ];

  const religionOptions = [
    { value: "very_religious", label: "Very Religious" },
    { value: "religious", label: "Religious" },
    { value: "not_religious", label: "Not Religious" },
  ];

  const sectorOptions = [
    { value: "sunni", label: "Sunni" },
    { value: "shia", label: "Shia" },
    { value: "other", label: "Other" },
  ];

  const prayerFrequencyOptions = [
    { value: "always", label: "Always" },
    { value: "most_of_the_time", label: "Most of the time" },
    { value: "sometimes", label: "Sometimes" },
    { value: "rarely", label: "Rarely" },
    { value: "never", label: "Never" },
  ];

  const quranReadingOptions = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "rarely", label: "Rarely" },
    { value: "never", label: "Never" },
  ];

  const childrenDesireOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
    { value: "maybe", label: "Maybe" },
  ];

  const hasChildrenOptions = [
    { value: "yes", label: "Yes" },
    { value: "no", label: "No" },
  ];

  const livingArrangementOptions = [
    { value: "alone", label: "Living Alone" },
    { value: "family", label: "Living with Family" },
    { value: "roommates", label: "Living with Roommates" },
    { value: "other", label: "Other" },
  ];

  const marriageTimelineOptions = [
    { value: "any_time", label: "Any Time" },
    { value: "6_months", label: "Within 6 months" },
    { value: "1_year", label: "Within 1 year" },
    { value: "2_years", label: "Within 2 years" },
    { value: "not_sure", label: "Not Sure" },
  ];

  const languageOptions = [
    { value: "arabic", label: "Arabic" },
    { value: "english", label: "English" },
    { value: "french", label: "French" },
    { value: "spanish", label: "Spanish" },
    { value: "urdu", label: "Urdu" },
    { value: "turkish", label: "Turkish" },
    { value: "persian", label: "Persian" },
    { value: "other", label: "Other" },
  ];

  const phoneUsageOptions = [
    { value: "1_hour", label: "Less than 1 hour" },
    { value: "1_3_hours", label: "1-3 hours" },
    { value: "3_5_hours", label: "3-5 hours" },
    { value: "5_plus_hours", label: "More than 5 hours" },
  ];

  const buildOptions = [
    { value: "slim", label: "Slim" },
    { value: "athletic", label: "Athletic" },
    { value: "average", label: "Average" },
    { value: "curvy", label: "Curvy" },
    { value: "plus_size", label: "Plus Size" },
  ];

  const ethnicityOptions = [
    { value: "arab", label: "Arab" },
    { value: "asian", label: "Asian" },
    { value: "black", label: "Black" },
    { value: "white", label: "White" },
    { value: "hispanic", label: "Hispanic" },
    { value: "mixed", label: "Mixed" },
    { value: "other", label: "Other" },
  ];

  const incomeOptions = [
    { value: "prefer_not_to_say", label: "Prefer not to say" },
    { value: "under_20k", label: "Under $20K" },
    { value: "20k_50k", label: "$20K - $50K" },
    { value: "50k_100k", label: "$50K - $100K" },
    { value: "100k_plus", label: "Above $100K" },
  ];

  // Get flag for citizenship and origin country
  const citizenshipFlag = useCountryFlag(formData.citizenship);
  const originCountryFlag = useCountryFlag(formData.originCountry);

  useEffect(() => {
    const userString = localStorage.getItem("user");
    if (!currentUser && userString) {
      try {
        const user = JSON.parse(userString);
        const userId = user.id; // or user._id based on your backend
        if (userId) {
          dispatch(fetchUserProfile(userId));
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
  }, [dispatch, currentUser]);

  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      setFormData({
        firstName: currentUser.firstName || "",
        lastName: currentUser.lastName || "",
        tagLine: currentUser.tagLine || "",
        about: currentUser.about || "",
        lookingFor: currentUser.lookingFor || "",
        birthDate: currentUser.birthDate || "",
        height: currentUser.height || "",
        build: currentUser.build || "",
        ethnicity: currentUser.ethnicity || "",
        disability: currentUser.disability || false,
        currentLocation: currentUser.currentLocation || "",
        countryOfBirth: currentUser.countryOfBirth || "",
        citizenship: currentUser.citizenship || "",
        originCountry: currentUser.originCountry || "",
        willingToRelocate: currentUser.willingToRelocate || false,
        educationLevel: currentUser.educationLevel || "",
        profession: currentUser.profession || "",
        jobTitle: currentUser.jobTitle || "",
        income: currentUser.income || "",
        languages: currentUser.languages || [],
        firstLanguage: currentUser.firstLanguage || "",
        secondLanguage: currentUser.secondLanguage || "",
        maritalStatus: currentUser.maritalStatus || "",
        childrenDesire: currentUser.childrenDesire || "",
        hasChildren: currentUser.hasChildren || "",
        livingArrangement: currentUser.livingArrangement || "",
        marriageWithin: currentUser.marriageWithin || "",
        religiousness: currentUser.religiousness || "",
        sector: currentUser.sector || "",
        isRevert: currentUser.isRevert || false,
        keepsHalal:
          currentUser.keepsHalal !== undefined ? currentUser.keepsHalal : true, // Default to true if undefined
        prayerFrequency: currentUser.prayerFrequency || "",
        quranReading: currentUser.quranReading || "",
        smokes: currentUser.smokes || false,
        drinks: currentUser.drinks || false,
        phoneUsage: currentUser.phoneUsage || "",
        wearsHijab: currentUser.wearsHijab || false,
        wali: {
          name: currentUser.wali?.name || "",
          phone: currentUser.wali?.phone || "",
          email: currentUser.wali?.email || "",
        },
        hasBeard: currentUser.hasBeard || false,
      });
    }
  }, [currentUser]);

  // Show success/error notifications
  useEffect(() => {
    if (success) {
      toast.success(success);
      dispatch(clearSuccess());
    }
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [success, error, dispatch]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle nested wali fields
    if (name.startsWith("wali.")) {
      const waliField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        wali: {
          ...prev.wali,
          [waliField]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!profileImage) return;

    const uploadFormData = new FormData();
    uploadFormData.append("profilePicture", profileImage);

    try {
      await dispatch(updateProfilePicture(uploadFormData)).unwrap();
      setProfileImage(null);
      setPreviewImage(null); // Clear preview after successful upload
    } catch (err) {
      console.error("Failed to upload image:", err);
    }
  };

  // Handle unblur request
  const handleUnblurRequest = async () => {
    try {
      await dispatch(requestUnblurPicture()).unwrap();
      // State update for unblurRequest is handled by the Redux slice
      toast.success("Unblur request sent successfully");
    } catch (err) {
      console.error("Failed to request unblur:", err);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Clean up empty strings or default values if necessary before sending
      const dataToSend = { ...formData };
      // Example: Remove empty wali fields if they weren't touched
      if (
        dataToSend.wali &&
        !dataToSend.wali.name &&
        !dataToSend.wali.phone &&
        !dataToSend.wali.email
      ) {
        delete dataToSend.wali;
      }

      await dispatch(updateUserProfile(dataToSend)).unwrap();
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="text-center">
          <AlertCircle size={60} className="mx-auto text-red-400 mb-5" />
          <h2 className="text-xl font-bold mb-2">Not Logged In</h2>
          <p className="text-gray-600 mb-4">
            Please log in to edit your profile
          </p>
          <button
            onClick={() => router.push("/login")}
            className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-dark transition duration-300"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Loading state for profile data fetch
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Hero Background */}
      <div className="h-48 relative w-full">
        <Image
          src={coverImage}
          alt="Cover Image"
          fill
          className="object-cover"
          priority
        />
      </div>

      <div className="container mx-auto px-4 -mt-24 pb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Avatar */}
              <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
                <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl mx-auto md:mx-0 relative">
                  <Image
                    src={
                      previewImage ||
                      (currentUser.profilePicture?.startsWith("http")
                        ? currentUser.profilePicture
                        : getAvatar(currentUser.gender))
                    }
                    alt={`${currentUser?.firstName || "User"}'s profile`}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      // Fallback to default avatar if user picture fails
                      e.target.src = getAvatar(currentUser.gender);
                    }}
                  />

                  {/* Photo Upload Overlay */}
                  <label
                    htmlFor="profile-upload"
                    className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Upload size={24} />
                    <span className="ml-2 text-sm font-medium">Change</span>
                  </label>
                  <input
                    id="profile-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </div>

                {/* Image Upload Controls */}
                {profileImage && (
                  <div className="mt-3 flex flex-col items-center">
                    <button
                      onClick={handleImageUpload}
                      disabled={pictureLoading}
                      className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {pictureLoading ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Photo
                    </button>
                  </div>
                )}

                {/* Unblur Request Status */}
                {currentUser.profilePicture &&
                  currentUser.profilePicture.includes("/blurred/") &&
                  (currentUser.unblurRequest ? (
                    <div className="mt-3 text-center">
                      <p className="text-sm text-yellow-600 flex items-center justify-center gap-1">
                        <Info size={14} />
                        Unblur request pending
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleUnblurRequest}
                      disabled={unblurRequest.loading}
                      className="mt-3 text-primary text-sm font-medium hover:text-primary-dark transition w-full text-center flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {unblurRequest.loading ? (
                        <Loader size={14} className="animate-spin" />
                      ) : (
                        <Star size={14} />
                      )}
                      Request Unblur
                    </button>
                  ))}
              </div>

              {/* User Name & Basic Info */}
              <div className="flex-grow text-center md:text-left">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Edit Your Profile
                </h1>
                <p className="text-gray-600">
                  Update your information to find your perfect match
                </p>

                {/* Badges/Status */}
                <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
                  {currentUser.isVerified && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <Check size={14} className="mr-1" />
                      Verified
                    </span>
                  )}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <User size={14} className="mr-1" />
                    {currentUser.gender === "male" ? "Male" : "Female"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200 px-2 sm:px-6">
            <div className="flex overflow-x-auto scrollbar-hide -mb-px">
              {[
                { id: "personal", label: "Personal" },
                { id: "religion", label: "Religion" },
                { id: "preferences", label: "Preferences" },
                { id: "about", label: "About & Interests" },
                // Show Wali tab only for females
                ...(currentUser.gender === "female"
                  ? [{ id: "wali", label: "Wali Contact" }]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-5 py-4 font-semibold text-sm sm:text-base whitespace-nowrap focus:outline-none transition-colors ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="mt-8">
          <div className="grid grid-cols-1 gap-8">
            {/* Personal Tab */}
            {activeTab === "personal" && (
              <>
                <FormSection
                  title="Basic Information"
                  icon={<User size={20} />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="First Name"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      label="Last Name"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      label="Tagline"
                      name="tagLine"
                      value={formData.tagLine}
                      onChange={handleChange}
                      placeholder="A short description of yourself"
                    />
                    <FormField
                      label="Date of Birth"
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      label="Height"
                      name="height"
                      placeholder="i.e 150cm"
                      value={formData.height}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Build"
                      type="select"
                      name="build"
                      value={formData.build}
                      onChange={handleChange}
                      options={buildOptions}
                    />
                    <FormField
                      label="Ethnicity"
                      type="select"
                      name="ethnicity"
                      value={formData.ethnicity}
                      onChange={handleChange}
                      options={ethnicityOptions}
                    />
                    <FormField
                      label="Disability"
                      type="checkbox"
                      name="disability"
                      value={formData.disability}
                      onChange={handleChange}
                    />
                  </div>
                </FormSection>

                <FormSection title="Location" icon={<MapPin size={20} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Current Location"
                      name="currentLocation"
                      value={formData.currentLocation}
                      onChange={handleChange}
                      placeholder="City, Country"
                      required
                    />
                    <FormField
                      label="Country of Birth"
                      name="countryOfBirth"
                      value={formData.countryOfBirth}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      label="Citizenship"
                      name="citizenship"
                      value={formData.citizenship}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      label="Origin Country"
                      name="originCountry"
                      value={formData.originCountry}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      label="Willing to Relocate"
                      type="checkbox"
                      name="willingToRelocate"
                      value={formData.willingToRelocate}
                      onChange={handleChange}
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Education & Career"
                  icon={<Briefcase size={20} />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Education Level"
                      type="select"
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleChange}
                      options={educationOptions}
                      required
                    />
                    <FormField
                      label="Profession"
                      type="select"
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      options={professionOptions}
                      required
                    />
                    <FormField
                      label="Job Title"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleChange}
                      required
                    />
                    <FormField
                      label="Income Range"
                      type="select"
                      name="income"
                      value={formData.income}
                      onChange={handleChange}
                      options={incomeOptions}
                    />
                  </div>
                </FormSection>

                <FormSection title="Languages" icon={<Book size={20} />}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="First Language"
                      type="select"
                      name="firstLanguage"
                      value={formData.firstLanguage}
                      onChange={handleChange}
                      options={languageOptions}
                      required
                    />
                    <FormField
                      label="Second Language"
                      type="select"
                      name="secondLanguage"
                      value={formData.secondLanguage}
                      onChange={handleChange}
                      options={languageOptions}
                    />
                    {/* Add more languages input if needed, perhaps a multi-select or comma-separated string */}
                  </div>
                </FormSection>
              </>
            )}

            {/* Religion Tab */}
            {activeTab === "religion" && (
              <>
                <FormSection
                  title="Religious Practice"
                  icon={<Hand size={20} />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Religiousness"
                      type="select"
                      name="religiousness"
                      value={formData.religiousness}
                      onChange={handleChange}
                      options={religionOptions}
                      required
                    />
                    <FormField
                      label="Sector"
                      type="select"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      options={sectorOptions}
                    />
                    <FormField
                      label="Is Revert/Convert"
                      type="checkbox"
                      name="isRevert"
                      value={formData.isRevert}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Keeps Halal"
                      type="checkbox"
                      name="keepsHalal"
                      value={formData.keepsHalal}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Prayer Frequency"
                      type="select"
                      name="prayerFrequency"
                      value={formData.prayerFrequency}
                      onChange={handleChange}
                      options={prayerFrequencyOptions}
                      required
                    />
                    <FormField
                      label="Quran Reading Frequency"
                      type="select"
                      name="quranReading"
                      value={formData.quranReading}
                      onChange={handleChange}
                      options={quranReadingOptions}
                    />
                    {currentUser.gender === "male" && (
                      <FormField
                        label="Has Beard"
                        type="checkbox"
                        name="hasBeard"
                        value={formData.hasBeard}
                        onChange={handleChange}
                      />
                    )}
                    {currentUser.gender === "female" && (
                      <FormField
                        label="Wears Hijab"
                        type="checkbox"
                        name="wearsHijab"
                        value={formData.wearsHijab}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                </FormSection>
                <FormSection
                  title="Lifestyle"
                  icon={<MessageCircle size={20} />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      label="Smokes"
                      type="checkbox"
                      name="smokes"
                      value={formData.smokes}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Drinks Alcohol"
                      type="checkbox"
                      name="drinks"
                      value={formData.drinks}
                      onChange={handleChange}
                    />
                    <FormField
                      label="Phone Usage"
                      type="select"
                      name="phoneUsage"
                      value={formData.phoneUsage}
                      onChange={handleChange}
                      options={phoneUsageOptions}
                    />
                  </div>
                </FormSection>
              </>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <FormSection title="Seeking For" icon={<Target size={20} />}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Looking For"
                    type="textarea"
                    name="lookingFor"
                    value={formData.lookingFor}
                    onChange={handleChange}
                    placeholder="Describe what you are looking for in a partner..."
                  />
                  <FormField
                    label="Marital Status"
                    type="select"
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleChange}
                    options={maritalStatusOptions}
                    required
                  />
                  <FormField
                    label="Children Desire"
                    type="select"
                    name="childrenDesire"
                    value={formData.childrenDesire}
                    onChange={handleChange}
                    options={childrenDesireOptions}
                  />
                  <FormField
                    label="Has Children"
                    type="select"
                    name="hasChildren"
                    value={formData.hasChildren}
                    onChange={handleChange}
                    options={hasChildrenOptions}
                  />
                  <FormField
                    label="Living Arrangement"
                    type="select"
                    name="livingArrangement"
                    value={formData.livingArrangement}
                    onChange={handleChange}
                    options={livingArrangementOptions}
                  />
                  <FormField
                    label="Marriage Timeline"
                    type="select"
                    name="marriageWithin"
                    value={formData.marriageWithin}
                    onChange={handleChange}
                    options={marriageTimelineOptions}
                  />
                </div>
              </FormSection>
            )}

            {/* About & Interests Tab */}
            {activeTab === "about" && (
              <FormSection title="About You" icon={<Info size={20} />}>
                <FormField
                  label="About Me"
                  type="textarea"
                  name="about"
                  value={formData.about}
                  onChange={handleChange}
                  placeholder="Tell us about yourself, your hobbies, interests, etc."
                />
                {/* Add fields for interests, hobbies etc. if they exist in formData */}
              </FormSection>
            )}

            {/* Wali Contact Tab (Female Only) */}
            {activeTab === "wali" && currentUser.gender === "female" && (
              <FormSection
                title="Wali Contact Information"
                icon={<Phone size={20} />}
              >
                <p className="text-sm text-gray-600 mb-6">
                  Please provide the contact information for your Wali
                  (guardian). This information will only be shared with
                  potential matches you approve.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    label="Wali Name"
                    name="wali.name"
                    value={formData.wali.name}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Wali Phone"
                    type="tel"
                    name="wali.phone"
                    value={formData.wali.phone}
                    onChange={handleChange}
                  />
                  <FormField
                    label="Wali Email"
                    type="email"
                    name="wali.email"
                    value={formData.wali.email}
                    onChange={handleChange}
                  />
                </div>
              </FormSection>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-8 text-center">
            <button
              type="submit"
              disabled={loading || pictureLoading}
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-primary-dark transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? (
                <Loader size={24} className="animate-spin" />
              ) : (
                <Save size={24} />
              )}
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
