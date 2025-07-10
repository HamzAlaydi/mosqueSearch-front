"use client";

import { useState, useEffect } from "react";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  updateUserProfile,
  updateProfilePicture,
  requestUnblurPicture,
  clearSuccess,
  clearError,
  fetchMyProfile,
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
import {
  revokePhotoAccess,
  revokeWaliAccess,
  fetchUserDetails,
} from "@/redux/user/userSlice";
import {
  blockUser,
  unblockUser,
  fetchBlockedUsers,
} from "@/redux/block/blockSlice";
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
// User Card Component for management lists
const UserCard = ({
  user,
  onAction,
  actionText,
  actionIcon,
  isLoading,
  actionType,
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between hover:shadow-md transition-shadow">
    <div className="flex items-center gap-3">
      <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
        <Image
          src={user.profilePicture || getAvatar(user.gender)}
          alt={`${user.firstName} ${user.lastName}`}
          width={48}
          height={48}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = getAvatar(user.gender);
          }}
        />
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-medium text-gray-900 truncate">
          {user.firstName || "UnKnown"} {user.lastName}
        </h4>
        <p className="text-sm text-gray-500 truncate">
          {user.currentLocation || "Location not specified"}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
            {user.gender === "male" ? "Male" : "Female"}
          </span>
          {user.birthDate && (
            <span className="text-xs text-gray-500">
              Age: {calculateAge(user.birthDate)}
            </span>
          )}
        </div>
      </div>
    </div>

    <button
      onClick={() => onAction(user._id)}
      disabled={isLoading}
      className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors duration-200 flex-shrink-0 shadow-sm ${
        actionType === "block" || actionType === "revoke"
          ? "bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-300"
          : "bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-300"
      } disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none`}
    >
      {isLoading ? <Loader size={16} className="animate-spin" /> : actionIcon}
      <span className="hidden sm:inline">{actionText}</span>
    </button>
  </div>
);
const ManagementSection = ({
  title,
  icon,
  users,
  onAction,
  actionText,
  actionIcon,
  loadingUserId,
  actionType,
  emptyMessage,
}) => (
  <div className="bg-gray-50 rounded-xl p-6">
    <div className="flex items-center gap-3 mb-4">
      {icon}
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <span className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm font-medium">
        {users.length}
      </span>
    </div>

    {users.length === 0 ? (
      <p className="text-gray-500 text-center py-8">{emptyMessage}</p>
    ) : (
      <div className="space-y-3">
        {users.map((user) => (
          <UserCard
            key={user._id}
            user={user}
            onAction={onAction}
            actionText={actionText}
            actionIcon={actionIcon}
            isLoading={loadingUserId === user._id}
            actionType={actionType}
          />
        ))}
      </div>
    )}
  </div>
);
export default function EditProfile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    currentUser,
    loading,
    pictureLoading,
    error,
    success,
    unblurRequest,
    managementUsers,
    managementLoading,
    revokeLoading,
  } = useSelector(
    (state) => ({
      currentUser: state.user.currentUser,
      loading: state.user.loading,
      pictureLoading: state.user.pictureLoading,
      error: state.user.error,
      success: state.user.success,
      unblurRequest: state.user.unblurRequest,
      managementUsers: state.user.managementUsers,
      managementLoading: state.user.managementLoading,
      revokeLoading: state.user.revokeLoading,
    }),
    shallowEqual
  );
  const { blockedUsers, blockingUserId } = useSelector(
    (state) => ({
      blockedUsers: state.block.blockedUsers,
      blockingUserId: state.block.blockingUserId,
    }),
    shallowEqual
  );

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
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Options for select inputs
  const educationOptions = [
    { value: "high_school", label: "High School" },
    { value: "bachelors", label: "Bachelor's Degree" },
    { value: "master", label: "Master's Degree" },
    { value: "phd", label: "PhD" },
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
    { value: "urdu", label: "Urdu" },
    { value: "french", label: "French" },
    { value: "spanish", label: "Spanish" },
    { value: "german", label: "German" },
    { value: "italian", label: "Italian" },
    { value: "portuguese", label: "Portuguese" },
    { value: "dutch", label: "Dutch" },
    { value: "swedish", label: "Swedish" },
    { value: "norwegian", label: "Norwegian" },
    { value: "danish", label: "Danish" },
    { value: "finnish", label: "Finnish" },
    { value: "polish", label: "Polish" },
    { value: "russian", label: "Russian" },
    { value: "turkish", label: "Turkish" },
    { value: "persian", label: "Persian (Farsi)" },
    { value: "bengali", label: "Bengali" },
    { value: "hindi", label: "Hindi" },
    { value: "punjabi", label: "Punjabi" },
    { value: "pashto", label: "Pashto" },
    { value: "dari", label: "Dari" },
    { value: "kurdish", label: "Kurdish" },
    { value: "azerbaijani", label: "Azerbaijani" },
    { value: "kazakh", label: "Kazakh" },
    { value: "uzbek", label: "Uzbek" },
    { value: "tajik", label: "Tajik" },
    { value: "kyrgyz", label: "Kyrgyz" },
    { value: "turkmen", label: "Turkmen" },
    { value: "malay", label: "Malay" },
    { value: "indonesian", label: "Indonesian" },
    { value: "filipino", label: "Filipino (Tagalog)" },
    { value: "thai", label: "Thai" },
    { value: "vietnamese", label: "Vietnamese" },
    { value: "chinese_mandarin", label: "Chinese (Mandarin)" },
    { value: "chinese_cantonese", label: "Chinese (Cantonese)" },
    { value: "japanese", label: "Japanese" },
    { value: "korean", label: "Korean" },
    { value: "mongolian", label: "Mongolian" },
    { value: "swahili", label: "Swahili" },
    { value: "hausa", label: "Hausa" },
    { value: "yoruba", label: "Yoruba" },
    { value: "igbo", label: "Igbo" },
    { value: "amharic", label: "Amharic" },
    { value: "somali", label: "Somali" },
    { value: "albanian", label: "Albanian" },
    { value: "bosnian", label: "Bosnian" },
    { value: "croatian", label: "Croatian" },
    { value: "serbian", label: "Serbian" },
    { value: "bulgarian", label: "Bulgarian" },
    { value: "romanian", label: "Romanian" },
    { value: "hungarian", label: "Hungarian" },
    { value: "czech", label: "Czech" },
    { value: "slovak", label: "Slovak" },
    { value: "slovenian", label: "Slovenian" },
    { value: "latvian", label: "Latvian" },
    { value: "lithuanian", label: "Lithuanian" },
    { value: "estonian", label: "Estonian" },
    { value: "greek", label: "Greek" },
    { value: "hebrew", label: "Hebrew" },
    { value: "armenian", label: "Armenian" },
    { value: "georgian", label: "Georgian" },
    { value: "tamil", label: "Tamil" },
    { value: "telugu", label: "Telugu" },
    { value: "kannada", label: "Kannada" },
    { value: "malayalam", label: "Malayalam" },
    { value: "marathi", label: "Marathi" },
    { value: "gujarati", label: "Gujarati" },
    { value: "sindhi", label: "Sindhi" },
    { value: "kashmiri", label: "Kashmiri" },
    { value: "nepali", label: "Nepali" },
    { value: "sinhala", label: "Sinhala" },
    { value: "dhivehi", label: "Dhivehi (Maldivian)" },
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
    if (userString) {
      try {
        const user = JSON.parse(userString);
        const userId = user.id; // or user._id based on your backend
        if (userId && !currentUser) {
          setHasAttemptedFetch(true);
          dispatch(fetchMyProfile(userId));
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        setHasAttemptedFetch(true);
      }
    } else {
      setHasAttemptedFetch(true);
    }
  }, [dispatch, currentUser]);
  useEffect(() => {
    if (activeTab === "management" && currentUser) {
      // Fetch blocked users
      dispatch(fetchBlockedUsers()).catch((error) => {
        console.error("Failed to fetch blocked users:", error);
        toast.error("Failed to load blocked users");
      });

      // Collect all user IDs that need details
      const userIds = [
        ...(currentUser.blockedUsers || []),
        ...(currentUser.approvedPhotosFor || []),
        ...(currentUser.approvedWaliFor || []),
      ];

      if (userIds.length > 0) {
        const uniqueUserIds = [...new Set(userIds)]; // Remove duplicates
        dispatch(fetchUserDetails(uniqueUserIds)).catch((error) => {
          console.error("Failed to fetch user details:", error);
          toast.error("Failed to load user details");
        });
      }
    }
  }, [activeTab, dispatch, currentUser]);

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
    console.log("File selected:", file);

    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      console.log("File validation passed:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        console.log("Preview image set");
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile image upload
  const handleImageUpload = async () => {
    if (!profileImage) {
      toast.error("Please select an image first");
      return;
    }

    console.log("Starting profile picture upload:", {
      fileName: profileImage.name,
      fileSize: profileImage.size,
      fileType: profileImage.type,
    });

    const uploadFormData = new FormData();
    uploadFormData.append("profilePicture", profileImage);

    try {
      console.log("Dispatching updateProfilePicture action...");
      const result = await dispatch(
        updateProfilePicture(uploadFormData)
      ).unwrap();

      console.log("Profile picture upload successful:", result);
      setProfileImage(null);
      setPreviewImage(null); // Clear preview after successful upload

      // Refresh the user profile to get the updated profile picture
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        console.log("Refreshing user profile...");
        dispatch(fetchMyProfile(user.id));
      }

      toast.success("Profile picture updated successfully!");
    } catch (err) {
      console.error("Failed to upload image:", err);
      toast.error(
        err.message || "Failed to upload profile picture. Please try again."
      );
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
  // Helper functions to filter users by type
  const getBlockedUserDetails = () => {
    return managementUsers.filter((user) =>
      currentUser?.blockedUsers?.includes(user._id)
    );
  };

  const getPhotoApprovedUsers = () => {
    return managementUsers.filter((user) =>
      currentUser?.approvedPhotosFor?.includes(user._id)
    );
  };

  const getWaliApprovedUsers = () => {
    return managementUsers.filter((user) =>
      currentUser?.approvedWaliFor?.includes(user._id)
    );
  };

  // Action handlers
  const handleUnblockUser = async (userId) => {
    try {
      await dispatch(unblockUser(userId)).unwrap();
      toast.success("User unblocked successfully");
      // Refresh the blocked users list
      dispatch(fetchBlockedUsers());
    } catch (error) {
      console.error("Failed to unblock user:", error);
      toast.error("Failed to unblock user");
    }
  };

  const handleRevokePhotoAccess = async (userId) => {
    try {
      await dispatch(revokePhotoAccess(userId)).unwrap();
      toast.success("Photo access revoked successfully");
      // Refresh user profile to update the lists
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        dispatch(fetchMyProfile(user.id));
      }
    } catch (error) {
      console.error("Failed to revoke photo access:", error);
      toast.error("Failed to revoke photo access");
    }
  };

  const handleRevokeWaliAccess = async (userId) => {
    try {
      await dispatch(revokeWaliAccess(userId)).unwrap();
      toast.success("Wali access revoked successfully");
      // Refresh user profile to update the lists
      const userString = localStorage.getItem("user");
      if (userString) {
        const user = JSON.parse(userString);
        dispatch(fetchMyProfile(user.id));
      }
    } catch (error) {
      console.error("Failed to revoke wali access:", error);
      toast.error("Failed to revoke wali access");
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

  console.log("Own profile page state:", {
    loading,
    currentUser,
    error,
    hasAttemptedFetch,
  });
  console.log("Current user details:", {
    hasCurrentUser: !!currentUser,
    currentUserId: currentUser?._id,
    currentUserProfilePicture: currentUser?.profilePicture,
  });

  // Loading state for profile data fetch
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Only show "not logged in" if we've attempted to fetch and there's no currentUser
  if (hasAttemptedFetch && !currentUser) {
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

  // Don't render profile content if currentUser is null
  if (!currentUser) {
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
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <button
                      onClick={handleImageUpload}
                      disabled={pictureLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                      {pictureLoading ? (
                        <Loader size={16} className="animate-spin" />
                      ) : (
                        <Save size={16} />
                      )}
                      Save Photo
                    </button>
                    <button
                      onClick={() => {
                        setProfileImage(null);
                        setPreviewImage(null);
                      }}
                      disabled={pictureLoading}
                      className="text-gray-600 text-sm hover:text-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-1 rounded-md hover:bg-gray-100"
                    >
                      Cancel
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
                      className="mt-3 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors duration-200 w-full text-center flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg shadow-sm"
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
                { id: "mosques", label: "Attached Mosques" },
                { id: "management", label: "Management" },
                ...(currentUser.gender === "female"
                  ? [{ id: "wali", label: "Wali Contact" }]
                  : []),
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-5 py-4 font-semibold text-sm sm:text-base whitespace-nowrap focus:outline-none transition-colors relative ${
                    activeTab === tab.id
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {tab.label}
                  {tab.id === "management" && currentUser && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {(currentUser.blockedUsers?.length || 0) +
                        (currentUser.approvedPhotosFor?.length || 0) +
                        (currentUser.approvedWaliFor?.length || 0)}
                    </span>
                  )}
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
                      name="profession"
                      value={formData.profession}
                      onChange={handleChange}
                      placeholder="Enter your profession"
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

            {/* Attached Mosques Tab */}
            {activeTab === "mosques" && (
              <FormSection
                title="Your Attached Mosques"
                icon={<MapPin size={20} />}
              >
                <div className="space-y-4">
                  {currentUser?.attachedMosques &&
                  currentUser.attachedMosques.length > 0 ? (
                    <div className="grid gap-4">
                      {currentUser.attachedMosques.map((mosque, index) => (
                        <div
                          key={mosque.id || mosque._id || index}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {mosque.name}
                              </h4>
                              {mosque.address && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {mosque.address}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-blue-600" />
                            <span className="text-sm text-gray-500">
                              Attached
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <MapPin
                        size={48}
                        className="text-gray-300 mx-auto mb-4"
                      />
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        No Attached Mosques
                      </h4>
                      <p className="text-gray-600 text-sm mb-4">
                        You haven't attached to any mosques yet. Use the map to
                        find and attach to mosques in your area.
                      </p>
                      <button
                        onClick={() => (window.location.href = "/")}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2 mx-auto"
                      >
                        <MapPin size={16} />
                        Find Mosques
                      </button>
                    </div>
                  )}
                </div>
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
          {activeTab === "management" && (
            <div className="space-y-6">
              {managementLoading ? (
                <div className="flex justify-center py-12">
                  <Loader size={32} className="animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <ManagementSection
                    title="Blocked Users"
                    icon={<Flag size={20} className="text-red-500" />}
                    users={getBlockedUserDetails()}
                    onAction={handleUnblockUser}
                    actionText="Unblock"
                    actionIcon={<Check size={16} />}
                    loadingUserId={blockingUserId}
                    actionType="unblock"
                    emptyMessage="You haven't blocked any users yet."
                  />

                  <ManagementSection
                    title="Photo Access Granted"
                    icon={<User size={20} className="text-blue-500" />}
                    users={getPhotoApprovedUsers()}
                    onAction={handleRevokePhotoAccess}
                    actionText="Revoke Access"
                    actionIcon={<AlertCircle size={16} />}
                    loadingUserId={revokeLoading}
                    actionType="revoke"
                    emptyMessage="You haven't granted photo access to anyone yet."
                  />

                  {currentUser.gender === "female" && (
                    <ManagementSection
                      title="Wali Contact Shared"
                      icon={<Phone size={20} className="text-green-500" />}
                      users={getWaliApprovedUsers()}
                      onAction={handleRevokeWaliAccess}
                      actionText="Revoke Access"
                      actionIcon={<AlertCircle size={16} />}
                      loadingUserId={revokeLoading}
                      actionType="revoke"
                      emptyMessage="You haven't shared wali contact with anyone yet."
                    />
                  )}
                </>
              )}
            </div>
          )}
          {/* Save Button */}
          {activeTab !== "management" && (
            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={loading || pictureLoading}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-md"
              >
                {loading ? (
                  <Loader size={24} className="animate-spin" />
                ) : (
                  <Save size={24} />
                )}
                Save Profile
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
