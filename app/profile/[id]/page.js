"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
// Update the import statement at the top of the file
import {
  MapPin,
  Calendar,
  Book,
  Briefcase,
  Languages,
  Heart,
  Mail,
  Phone,
  MessageCircle,
  UserCheck,
  Share2,
  FileText,
  Star,
  Flag,
  Lock,
  Building,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  User,
  Loader, // Add this import
} from "lucide-react";
import { calculateAge, getAvatar } from "@/shared/helper/defaultData";
import { useDispatch, useSelector } from "react-redux";
import { addInterest, removeInterest } from "@/redux/match/matchSlice";

// Assume these helper functions are defined elsewhere, e.g., in '@/shared/helper/defaultData'
// For re-implementation purposes, I'll define simple versions here.
// NOTE: Ensure your actual helper functions at '@/shared/helper/defaultData'
// are correctly implemented and do not have any external dependencies named 'User'.

const AttributeCard = ({ icon, label, value }) => (
  <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
    <div className="text-primary mb-2">{icon}</div>
    <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
      {label}
    </div>
    <div className="font-semibold text-gray-800">{formatValue(value)}</div>
  </div>
);

const ProfileSection = ({
  title,
  icon,
  children,
  initiallyExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);

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
          <ChevronUp
            size={20}
            className="text-gray-400 group-hover:text-gray-600 transition"
          />
        ) : (
          <ChevronDown
            size={20}
            className="text-gray-400 group-hover:text-gray-600 transition"
          />
        )}
      </div>
      {isExpanded && (
        <div className="px-6 py-5 border-t border-gray-100">{children}</div>
      )}
    </div>
  );
};

const ProfileTag = ({ icon, label, value }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary">
      {icon}
    </div>
    <div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
        {label}
      </div>
      <div className="font-semibold text-gray-800">
        {value || "Not specified"}
      </div>
    </div>
  </div>
);

const ProgressBar = ({ value, max = 100, label }) => {
  const clampedValue = Math.max(0, Math.min(max, value));
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm font-medium text-primary">
          {clampedValue}%
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${clampedValue}%` }}
        ></div>
      </div>
    </div>
  );
};

export default function UserProfile({ userId }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const dispatch = useDispatch();
  const { userInterests } = useSelector((state) => state.matches);
  const [isInterested, setIsInterested] = useState(false);
  const [interestLoading, setInterestLoading] = useState(false);

  useEffect(() => {
    const currentUserId = user?._id;
    setIsInterested(
      currentUserId
        ? userInterests.some((interest) => interest.user?._id === currentUserId)
        : false
    );
  }, [userInterests, user]);

  const handleInterestToggle = async () => {
    if (!user?._id) return;
    setInterestLoading(true);
    try {
      if (isInterested) {
        // Optimistically update local state and dispatch local action
        setIsInterested(false);
        dispatch(removeInterestLocal(user._id));
        await dispatch(removeInterest(user._id)).unwrap();
      } else {
        // Optimistically update local state and dispatch local action
        setIsInterested(true);
        dispatch(addInterestLocal(user));
        await dispatch(addInterest(user._id)).unwrap();
      }
    } catch (error) {
      console.error("Interest toggle failed:", error);
      // Revert optimistic update on error
      setIsInterested(!isInterested);
      if (isInterested) {
        dispatch(addInterestLocal(user));
      } else {
        dispatch(removeInterestLocal(user._id));
      }
    } finally {
      setInterestLoading(false);
    }
  };
  // Fetch user data
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true); // Set loading at the beginning of the fetch attempt
      try {
        // For demo purposes, using mock data
        // In production, replace with API call
        const mockUsers = [
          {
            _id: "6827c45d625af4c59eaecc77",
            firstName: "Rawan",
            lastName: "Alaydi",
            email: "r@r.com",
            gender: "female",
            role: "female",
            tagLine:
              "Software engineer passionate about technology and travel.",
            about:
              "I am a dedicated software engineer with a strong interest in developing innovative solutions. Outside of work, I love exploring new places, reading historical fiction, and spending quality time with my family. I am seeking a partner who shares my values and enjoys intellectual conversations.",
            lookingFor:
              "Seeking a compassionate, kind, and practicing Muslim partner who is serious about marriage. Someone who has a strong sense of purpose and is keen on building a life together based on mutual respect and Islamic principles. A good sense of humor is a definite plus!",
            birthDate: "1994-05-11T21:00:00.000Z",
            height: "170",
            build: "slim",
            ethnicity: "arab",
            disability: false,
            currentLocation: "`Asa Ara`, Djibouti",
            countryOfBirth: "CX",
            citizenship: "MV",
            originCountry: "TL",
            willingToRelocate: true,
            educationLevel: "university",
            profession: "technology",
            jobTitle: "Senior Software Engineer",
            income: "50k_100k",
            languages: ["arabic", "english", "french"],
            firstLanguage: "arabic",
            secondLanguage: "english",
            maritalStatus: "single",
            childrenDesire: "yes",
            hasChildren: "no",
            livingArrangement: "with_family",
            marriageWithin: "1_year",
            religiousness: "religious",
            sector: "sunni",
            isRevert: true,
            keepsHalal: true,
            prayerFrequency: "always",
            quranReading: "weekly",
            smokes: false,
            drinks: false,
            phoneUsage: "3h",
            profilePicture: null,
            isVerified: true,
            attachedMosques: [
              {
                id: "ChIJ_WTueZYDdkgR_iOiXaZYkCI",
                name: "Dulwich Islamic Centre & Mosque",
                address: "23 N Cross Rd, London",
                location: {
                  type: "Point",
                  coordinates: [-0.0726108, 51.4574256],
                },
              },
              {
                id: "ChIJVQCea4oEdkgRyufLt8_Ql0I",
                name: "North Brixton Islamic Cultural Centre",
                address: "182 Brixton Rd, London",
                location: {
                  type: "Point",
                  coordinates: [-0.1129536, 51.4740255],
                },
              },
            ],
            wali: {
              name: "Mr. Abdullah Alaydi",
              email: "wali.rawan@example.com",
              phone: "+1234567890",
              relationship: "Father",
            },
          },
          {
            _id: "682759d25f85f3a874234b3c",
            firstName: "Esraa",
            lastName: "Ahmad",
            email: "esraa@e.com",
            gender: "female",
            role: "female",
            tagLine:
              "Dedicated healthcare professional seeking meaningful connection.",
            about:
              "Passionate about making a difference in people's lives through healthcare. I enjoy reading, hiking, and spending time with family.",
            lookingFor:
              "Looking for a partner who values family, has strong faith, and is committed to personal growth.",
            birthDate: "2000-05-05T21:00:00.000Z",
            height: "180",
            build: "slim",
            ethnicity: "arab",
            disability: false,
            currentLocation:
              "Gaza, Gaza Governorate, Gaza Strip, Palestinian Territory",
            countryOfBirth: "PS",
            citizenship: "TO",
            originCountry: "GR",
            willingToRelocate: true,
            educationLevel: "master",
            profession: "healthcare",
            jobTitle: "Nurse",
            income: "20k_50k",
            languages: ["arabic", "english"],
            firstLanguage: "arabic",
            secondLanguage: "english",
            maritalStatus: "single",
            childrenDesire: "yes",
            hasChildren: "yes",
            livingArrangement: "alone",
            marriageWithin: "any_time",
            religiousness: "very_religious",
            sector: "sunni",
            isRevert: false,
            keepsHalal: true,
            prayerFrequency: "always",
            quranReading: "daily",
            smokes: false,
            drinks: false,
            phoneUsage: "2h",
            profilePicture:
              "https://placehold.co/128x128/d6b3e2/300?text=Esraa",
            isVerified: false,
          },
        ];

        const foundUser = userId
          ? mockUsers.find((u) => u._id === userId)
          : mockUsers[0]; // Default to the first user if no userId

        setUser(foundUser);
        // REMOVED: No longer setting isInterested directly here.
        // The other useEffect (the one depending on [userInterests, user]) will handle it when `user` state updates.
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setUser(null); // Ensure user is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]); // Dependency array now only contains userId.

  const newHandleInterestToggle = async () => {
    if (!user?._id) return;
    setInterestLoading(true);
    try {
      if (isInterested) {
        await dispatch(removeInterest(user._id)).unwrap();
        setIsInterested(false); // Optimistic update
      } else {
        await dispatch(addInterest(user)).unwrap();
        setIsInterested(true); // Optimistic update
      }
    } catch (error) {
      console.error("Interest toggle failed:", error);
      // toast.error("Failed to update interest. Please try again.");
      // If an error occurs, the `isInterested` state might be incorrect if set optimistically.
      // The useEffect listening to `userInterests` will eventually correct it.
    } finally {
      setInterestLoading(false);
    }
  };

  const handleSendMessage = () => {
    if (user?._id) {
      router.push(`/messages/${user._id}`);
    } else {
      console.warn("Cannot send message, user ID is missing.");
      alert("User profile not fully loaded. Please try again.");
    }
  };

  const formatValue = (str) => {
    if (!str) return "Not specified";
    if (str === "very_religious") return "Very Religious";
    if (str === "religious") return "Religious";
    if (str === "not_religious") return "Not Religious";
    if (str === "always") return "Always";
    if (str === "most_of_the_time") return "Most of the time";
    if (str === "sometimes") return "Sometimes";
    if (str === "never") return "Never";
    if (str === "daily") return "Daily";
    if (str === "weekly") return "Weekly";
    if (str === "monthly") return "Monthly";
    if (str === "rarely") return "Rarely";
    if (str === "yes") return "Yes";
    if (str === "no") return "No";
    if (str === "single") return "Single";
    if (str === "married") return "Married";
    if (str === "divorced") return "Divorced";
    if (str === "widowed") return "Widowed";
    if (str.includes("_")) {
      return str
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const profileCompleteness = () => {
    if (!user) return 0;

    const totalFields = 35; // Estimated max score based on fields below

    let filledCount = 0;

    // Fields directly on the user object
    const userFields = [
      "firstName",
      "lastName",
      "gender",
      "tagLine",
      "about",
      "lookingFor",
      "birthDate",
      "height",
      "build",
      "ethnicity",
      "currentLocation",
      "countryOfBirth",
      "citizenship",
      "originCountry",
      "willingToRelocate",
      "educationLevel",
      "profession",
      "jobTitle",
      "income",
      "firstLanguage",
      "secondLanguage",
      "maritalStatus",
      "childrenDesire",
      "hasChildren",
      "livingArrangement",
      "marriageWithin",
      "religiousness",
      "sector",
      "isRevert",
      "keepsHalal",
      "prayerFrequency",
      "quranReading",
      "smokes",
      "drinks",
      "phoneUsage",
      "profilePicture",
    ];

    userFields.forEach((field) => {
      const value = user[field];
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        !(Array.isArray(value) && value.length === 0)
      ) {
        filledCount++;
      }
    });

    // Bonus points for specific sections/data completeness
    if (user.attachedMosques && user.attachedMosques.length > 0) {
      filledCount += 2;
    }
    if (user.wali && (user.wali.name || user.wali.email || user.wali.phone)) {
      filledCount += 2;
    }
    if (user.languages && user.languages.length > 2) {
      filledCount += 1;
    }
    // Add more conditions for other sections like photos, references if applicable

    const percentage = (filledCount / totalFields) * 100;

    return Math.round(Math.min(percentage, 100));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 px-4 max-w-md mx-auto bg-white rounded-xl shadow-lg border border-gray-100 mt-10">
        <AlertCircle size={60} className="mx-auto text-red-400 mb-5" />
        <div className="text-2xl font-bold text-gray-800 mb-3">
          Profile Not Found
        </div>
        <p className="text-gray-600 mb-8">
          The user profile you're looking for doesn't exist or has been removed.
        </p>
        <Link
          href="/mosque-search"
          className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary-dark transition duration-300 inline-flex items-center justify-center shadow-md"
        >
          <MapPin size={18} className="mr-2" /> Browse Matches
        </Link>
      </div>
    );
  }

  const age = calculateAge(user.birthDate);

  return (
    <div className="bg-gray-100 min-h-screen pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-dark to-primary h-48 relative">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      </div>

      <div className="container mx-auto px-4 -mt-24 pb-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
          <div className="p-6 sm:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center">
              {/* Profile Photo */}
              <div className="mb-6 md:mb-0 md:mr-8 flex-shrink-0">
                <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl mx-auto md:mx-0 relative">
                  <Image
                    src={user.profilePicture || getAvatar(user.gender)}
                    alt={`${user.firstName}'s profile`}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = getAvatar(user.gender);
                      e.target.onerror = null;
                    }}
                  />
                  {user.isVerified && (
                    <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 bg-green-500 text-white border-2 border-white rounded-full p-1 shadow-md">
                      <UserCheck size={16} />
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-grow pt-4 md:pt-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {`${user.firstName} ${user.lastName}`}
                      {age !== null && (
                        <span className="ml-3 text-xl font-normal text-gray-500">
                          {age}
                        </span>
                      )}
                    </h1>
                    {user.currentLocation && (
                      <p className="text-gray-600 mt-2 flex items-center justify-center md:justify-start">
                        <MapPin size={18} className="mr-2 text-gray-400" />
                        {user.currentLocation}
                      </p>
                    )}
                    {user.tagLine && (
                      <p className="text-primary-dark font-medium mt-3 text-lg italic">
                        "{user.tagLine}"
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto">
                    <button
                      onClick={newHandleInterestToggle} // Using the version with optimistic updates
                      disabled={interestLoading || !user?._id}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-semibold text-sm transition duration-300 shadow-sm ${
                        isInterested
                          ? "bg-red-50 text-red-600 border-red-300 hover:bg-red-100"
                          : "border-gray-300 text-gray-700 hover:border-primary hover:text-primary hover:bg-gray-50"
                      }`}
                    >
                      {interestLoading ? (
                        <Loader size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Heart
                            size={20}
                            className={
                              isInterested
                                ? "fill-red-500 text-red-500"
                                : "text-gray-500"
                            }
                          />
                          <span>
                            {isInterested ? "Interested" : "Show Interest"}
                          </span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleSendMessage}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition duration-300 shadow-sm"
                    >
                      <MessageCircle size={20} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Attributes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8 border-t border-gray-100 pt-6">
              {user.religiousness && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <Building size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Religion
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(user.religiousness)}
                  </div>
                </div>
              )}
              {user.maritalStatus && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <Heart size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Status
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(user.maritalStatus)}
                  </div>
                </div>
              )}
              {user.educationLevel && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <Book size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Education
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(user.educationLevel)}
                  </div>
                </div>
              )}
              {user.profession && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <Briefcase size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Profession
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(user.profession)}
                  </div>
                </div>
              )}
              {user.height && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <User size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Height
                  </div>
                  <div className="font-semibold text-gray-800">
                    {user.height} cm
                  </div>
                </div>
              )}
              {user.build && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <User size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Build
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(user.build)}
                  </div>
                </div>
              )}
              {user.ethnicity && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <Star size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Ethnicity
                  </div>
                  <div className="font-semibold text-gray-800">
                    {formatValue(user.ethnicity)}
                  </div>
                </div>
              )}
              {user.willingToRelocate !== undefined && (
                <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 text-center">
                  <MapPin size={24} className="text-primary mb-2" />
                  <div className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">
                    Relocate
                  </div>
                  <div className="font-semibold text-gray-800">
                    {user.willingToRelocate ? "Yes" : "No"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-t border-gray-200 px-2 sm:px-6">
            <div className="flex overflow-x-auto scrollbar-hide -mb-px">
              {["about", "mosques", "photos", "references"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-5 py-4 font-semibold text-sm sm:text-base whitespace-nowrap focus:outline-none transition-colors
          ${
            activeTab === tab
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-primary hover:border-b-2 hover:border-primary"
          }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area with Two Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Tab Content */}
            {activeTab === "about" && (
              <>
                {/* Bio Section */}
                <ProfileSection title="About Me" icon={<User size={20} />}>
                  <div className="text-gray-700 leading-relaxed">
                    <p>{user.about || "No information provided yet."}</p>
                  </div>
                </ProfileSection>

                {/* Looking For Section */}
                <ProfileSection title="Looking For" icon={<Heart size={20} />}>
                  <div className="text-gray-700 leading-relaxed">
                    <p>{user.lookingFor || "No preferences specified yet."}</p>
                  </div>
                </ProfileSection>

                {/* Personal Information */}
                <ProfileSection
                  title="Personal Information"
                  icon={<Info size={20} />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileTag
                      icon={<Calendar size={18} />}
                      label="Age"
                      value={age !== null ? `${age} years` : "Not specified"}
                    />
                    <ProfileTag
                      icon={<MapPin size={18} />}
                      label="Current Location"
                      value={user.currentLocation}
                    />
                    <ProfileTag
                      icon={<Flag size={18} />}
                      label="Citizenship"
                      value={user.citizenship || "Not specified"}
                    />
                    <ProfileTag
                      icon={<Flag size={18} />}
                      label="Origin Country"
                      value={user.originCountry || "Not specified"}
                    />
                    <ProfileTag
                      icon={<Languages size={18} />}
                      label="Languages Spoken"
                      value={
                        user.languages && user.languages.length > 0
                          ? user.languages
                              .map((lang) => formatValue(lang))
                              .join(", ")
                          : user.firstLanguage || user.secondLanguage
                          ? `${formatValue(user.firstLanguage)}${
                              user.firstLanguage && user.secondLanguage
                                ? ", "
                                : ""
                            }${formatValue(user.secondLanguage)}`
                          : null
                      }
                    />
                    <ProfileTag
                      icon={<Heart size={18} />}
                      label="Marital Status"
                      value={formatValue(user.maritalStatus)}
                    />
                    <ProfileTag
                      icon={<UserCheck size={18} />}
                      label="Has Children"
                      value={formatValue(user.hasChildren)}
                    />
                    <ProfileTag
                      icon={<Heart size={18} />}
                      label="Children Desire"
                      value={formatValue(user.childrenDesire)}
                    />
                    <ProfileTag
                      icon={<User size={18} />}
                      label="Living Arrangement"
                      value={formatValue(user.livingArrangement)}
                    />
                    <ProfileTag
                      icon={<Calendar size={18} />}
                      label="Marriage Within"
                      value={formatValue(user.marriageWithin)}
                    />
                    <ProfileTag
                      icon={<Briefcase size={18} />}
                      label="Income Range"
                      value={formatValue(user.income)}
                    />
                    <ProfileTag
                      icon={<Info size={18} />}
                      label="Disability"
                      value={user.disability ? "Yes" : "No"}
                    />
                  </div>
                </ProfileSection>

                {/* Religious Background */}
                <ProfileSection
                  title="Religious Background"
                  icon={<Building size={20} />}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileTag
                      icon={<Book size={18} />}
                      label="Religiousness Level"
                      value={formatValue(user.religiousness)}
                    />
                    <ProfileTag
                      icon={<Book size={18} />}
                      label="Islamic Sector"
                      value={formatValue(user.sector)}
                    />
                    <ProfileTag
                      icon={<Building size={18} />}
                      label="Prayer Frequency"
                      value={formatValue(user.prayerFrequency)}
                    />
                    <ProfileTag
                      icon={<Book size={18} />}
                      label="Quran Reading Frequency"
                      value={formatValue(user.quranReading)}
                    />
                    <ProfileTag
                      icon={<Info size={18} />}
                      label="Keeps Halal"
                      value={user.keepsHalal ? "Yes" : "No"}
                    />
                    <ProfileTag
                      icon={<User size={18} />}
                      label="Revert"
                      value={user.isRevert ? "Yes" : "No"}
                    />
                    <ProfileTag
                      icon={<Info size={18} />}
                      label="Smokes"
                      value={user.smokes ? "Yes" : "No"}
                    />
                    <ProfileTag
                      icon={<Info size={18} />}
                      label="Drinks Alcohol"
                      value={user.drinks ? "Yes" : "No"}
                    />
                    <ProfileTag
                      icon={<Phone size={18} />}
                      label="Phone Usage"
                      value={
                        user.phoneUsage
                          ? `${formatValue(user.phoneUsage)} / day`
                          : "Not specified"
                      }
                    />
                  </div>
                </ProfileSection>
              </>
            )}

            {/* Mosques Tab Content */}
            {activeTab === "mosques" && (
              <ProfileSection
                title={`Connected Mosques (${
                  user.attachedMosques?.length || 0
                })`}
                icon={<Building size={20} />}
                initiallyExpanded={true}
              >
                {user.attachedMosques && user.attachedMosques.length > 0 ? (
                  <div className="space-y-4">
                    {user.attachedMosques.map((mosque, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4 hover:border-primary transition duration-200 flex items-center justify-between"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-800">
                            {mosque.name}
                          </h4>
                          <p className="text-sm text-gray-600 flex items-center mt-1">
                            <MapPin size={16} className="mr-2 text-primary" />
                            {mosque.address}
                          </p>
                        </div>
                        <Link
                          href={`/mosque/${mosque.id}`}
                          className="text-primary hover:text-primary-dark transition duration-200 flex items-center text-sm font-medium ml-4 flex-shrink-0"
                        >
                          <span>View Mosque</span>
                          <ExternalLink size={14} className="ml-1" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Building
                      size={48}
                      className="mx-auto text-gray-300 mb-3"
                    />
                    <p>No connected mosques found for this user.</p>
                  </div>
                )}
              </ProfileSection>
            )}

            {/* Photos Tab Content */}
            {activeTab === "photos" && (
              <ProfileSection
                title="Photos"
                icon={<FileText size={20} />}
                initiallyExpanded={true}
              >
                <div className="flex flex-col items-center text-center py-10 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <Lock size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-6 max-w-md">
                    Photos are private and hidden until a mutual interest is
                    established.
                  </p>
                  <button className="bg-white border border-gray-300 px-6 py-3 rounded-lg text-gray-700 font-medium hover:border-primary hover:text-primary hover:bg-gray-100 transition duration-200 flex items-center justify-center gap-2 shadow">
                    <Heart size={18} />
                    Show Interest to View Photos
                  </button>
                </div>
              </ProfileSection>
            )}

            {activeTab === "references" && (
              <ProfileSection
                title="Community References (0)"
                icon={<UserCheck size={20} />}
                initiallyExpanded={true}
              >
                <div className="flex flex-col items-center text-center py-10 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <FileText size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-600 max-w-md">
                    No community references available yet for this user.
                  </p>
                </div>
              </ProfileSection>
            )}
          </div>

          {/* Right Column - Sidebar Information */}
          <div className="space-y-6">
            {/* Wali Contact Information */}
            {user.wali &&
            (user.wali.name || user.wali.email || user.wali.phone) ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Wali Contact
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {user.wali.name && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <UserCheck size={20} className="text-primary mt-1" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Name
                          </div>
                          <div className="font-medium text-gray-800">
                            {user.wali.name}
                          </div>
                          {user.wali.relationship && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              ({user.wali.relationship})
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {user.wali.email && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Mail size={20} className="text-primary mt-1" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Email
                          </div>
                          <div className="font-medium text-gray-800">
                            {user.wali.email}
                          </div>
                        </div>
                      </div>
                    )}
                    {user.wali.phone && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Phone size={20} className="text-primary mt-1" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Phone
                          </div>
                          <div className="font-medium text-gray-800">
                            {user.wali.phone}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mt-6 text-xs text-blue-800 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                    <Info size={18} className="text-blue-600 mt-0.5" />
                    <p>
                      Wali contact details are provided to facilitate formal
                      steps towards marriage after mutual interest. Please use
                      this information respectfully and appropriately according
                      to Islamic guidelines.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Wali Contact
                  </h3>
                </div>
                <div className="p-6 text-center text-gray-500">
                  No Wali contact information provided yet for this user.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
