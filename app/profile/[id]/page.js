"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useDispatch, useSelector, shallowEqual } from "react-redux";
import {
  MapPin,
  Calendar,
  Book,
  Briefcase,
  Heart,
  Mail,
  Phone,
  MessageCircle,
  UserCheck,
  ChevronDown,
  ChevronUp,
  Info,
  AlertCircle,
  User,
  Loader,
  Star,
  Flag,
  Lock,
  Building,
  ExternalLink,
  FileText,
  Search,
  Eye,
} from "lucide-react";
import { calculateAge, getAvatar } from "@/shared/helper/defaultData";
import {
  addInterest,
  removeInterest,
  fetchUserInterests,
} from "@/redux/match/matchSlice";
import {
  requestPhotoAccess,
  getCurrentUser,
  requestWaliAccess,
  findOrCreateConversation,
  setActiveChat,
  fetchChatList,
} from "@/redux/chat/chatSlice";
import { fetchUserProfile, clearViewingUser } from "@/redux/user/userSlice";
import { useParams, useRouter } from "next/navigation";
import coverImage from "@/public/images/matches/background.jpg";
import useCountryFlag from "@/shared/helper/useCountryFlag";
import toast from "react-hot-toast";
import { countryFlags } from "@/shared/helper/flagsData";

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
          <ChevronUp size={20} className="text-gray-400" />
        ) : (
          <ChevronDown size={20} className="text-gray-400" />
        )}
      </div>
      {isExpanded && (
        <div className="px-6 py-5 border-t border-gray-100">{children}</div>
      )}
    </div>
  );
};

const ProfileTag = ({ icon, label, value, flagUrl }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
    {flagUrl ? (
      <div className="relative w-10 h-10 rounded-full overflow-hidden shadow-sm">
        <Image
          src={flagUrl}
          alt={`${label} flag`}
          fill
          className="object-cover"
        />
      </div>
    ) : (
      <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-primary">
        {icon}
      </div>
    )}
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

const formatValue = (str) => {
  if (!str) return "Not specified";
  const mappings = {
    very_religious: "Very Religious",
    religious: "Religious",
    not_religious: "Not Religious",
    always: "Always",
    most_of_the_time: "Most of the time",
    sometimes: "Sometimes",
    never: "Never",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    rarely: "Rarely",
    yes: "Yes",
    no: "No",
    single: "Single",
    married: "Married",
    divorced: "Divorced",
    widowed: "Widowed",
    "20k_50k": "$20K - $50K",
    slim: "Slim",
    arab: "Arab",
    healthcare: "Healthcare",
    master: "Master's Degree",
    alone: "Living Alone",
    any_time: "Any Time",
    sunni: "Sunni",
    arabic: "Arabic",
    english: "English",
  };

  if (mappings[str]) return mappings[str];
  if (str.includes("_")) {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export default function UserProfile() {
  const dispatch = useDispatch();
  const router = useRouter();
  const params = useParams();
  const userId = params?.id;

  const { currentUser, viewingUser, loading, error } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    viewingUser: state.user.viewingUser,
    loading: state.user.loading,
    error: state.user.error,
  }));
  console.log({ loading, error, currentUser, viewingUser, userId });

  const { userInterests, loading: interestsLoading } = useSelector(
    (state) => state.matches
  );
  const [activeTab, setActiveTab] = useState("about");
  const [interestLoading, setInterestLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Determine if we're viewing our own profile or someone else's
  const isOwnProfile = currentUser?._id === userId;
  const profileUser = isOwnProfile ? currentUser : viewingUser;
  console.log({ isOwnProfile, profileUser, currentUser, viewingUser, userId });
  console.log({ loading, interestsLoading, error });
  console.log("Profile user details:", {
    hasProfileUser: !!profileUser,
    profileUserId: profileUser?._id,
    profileUserBirthDate: profileUser?.birthDate,
  });

  const getLoggedInUserId = () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user"));
      return userData?.id || null;
    } catch (error) {
      console.error("Error parsing user from localStorage", error);
      return null;
    }
  };

  const isPhotoApproved = (user) => {
    const loggedInUserId = getLoggedInUserId();
    console.log({ user });
    console.log({ loggedInUserId });

    return user?.approvedPhotosFor?.includes(loggedInUserId);
  };

  const isWaliApproved = (user) => {
    const loggedInUserId = getLoggedInUserId();
    return user?.approvedWaliFor?.includes(loggedInUserId);
  };

  // Fetch profile data and user interests
  useEffect(() => {
    if (userId) {
      setHasAttemptedFetch(true);
      dispatch(fetchUserProfile(userId));
      dispatch(fetchUserInterests());
    }
    return () => dispatch(clearViewingUser());
  }, [dispatch, userId]);

  // Check interest status whenever userInterests or profileUser changes
  useEffect(() => {
    if (profileUser?._id && userInterests) {
      const interested = userInterests.some(
        (user) => user._id === profileUser._id
      );
      setIsInterested(interested);
    } else {
      setIsInterested(false);
    }
  }, [userInterests, profileUser]);

  // Flag hooks
  const citizenshipFlag = profileUser?.citizenship
    ? countryFlags[profileUser.citizenship.toUpperCase()]
    : null;

  const originCountryFlag = profileUser?.originCountry
    ? countryFlags[profileUser.originCountry.toUpperCase()]
    : null;
  const handleInterestToggle = async () => {
    if (!profileUser?._id || interestLoading) return;

    const previousState = isInterested;
    setIsInterested(!previousState); // Optimistic update
    setInterestLoading(true);

    try {
      if (previousState) {
        await dispatch(removeInterest(profileUser._id)).unwrap();
        toast.success("Removed from your interests");
      } else {
        await dispatch(addInterest(profileUser._id)).unwrap();
        toast.success("Added to your interests");
      }
      // Refresh interests list after successful operation
      dispatch(fetchUserInterests());
    } catch (error) {
      setIsInterested(previousState); // Revert on error
      toast.error(error.payload || "Operation failed");
    } finally {
      setInterestLoading(false);
    }
  };

  // Add these handler functions after the existing handlers
  const handleRequestPhoto = async () => {
    try {
      await dispatch(requestPhotoAccess(profileUser._id)).unwrap();
      toast.success(`Photo request sent to ${profileUser.firstName || "User"}`);
    } catch (error) {
      console.error("Failed to request photo access:", error);
      toast.error("Failed to send photo request");
    }
  };

  const handleRequestWali = async () => {
    try {
      await dispatch(requestWaliAccess(profileUser._id)).unwrap();
      toast.success(`Wali request sent to ${profileUser.firstName || "User"}`);
    } catch (error) {
      console.error("Failed to request wali access:", error);
      toast.error("Failed to send wali request");
    }
  };
  const handleSendMessage = async () => {
    if (profileUser?._id) {
      try {
        console.log("Clicking message for user:", profileUser._id);
        const result = await dispatch(
          findOrCreateConversation(profileUser._id)
        ).unwrap();
        console.log("findOrCreateConversation result:", result);
        dispatch(setActiveChat(result.chatId));
        await dispatch(fetchChatList()).unwrap();
        router.push("/messages");
        toast.success(`Opening chat with ${profileUser.firstName || "User"}`);
      } catch (error) {
        console.error("Failed to open chat:", error);
        toast.error("Failed to open chat");
      }
    }
  };

  // Show loading state first
  if (loading || interestsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  // Only show "not found" if we've attempted to fetch and we're not loading and we have an error or no profileUser
  if (hasAttemptedFetch && !loading && userId && (error || !profileUser?._id)) {
    console.log("Showing not found because:", {
      error,
      profileUser: profileUser?._id,
      userId,
      hasAttemptedFetch,
    });
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 px-6">
        <div className="flex flex-col items-center justify-center max-w-lg mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-6">
            <AlertCircle size={30} className="text-red-500" />
          </div>

          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {error
              ? error.message || "Error Loading Profile"
              : "Profile Not Found"}
          </h2>

          <p className="text-gray-600 text-center mb-6">
            We couldn&apos;t retrieve the requested profile information. Please
            try again later.
          </p>

          <div className="flex gap-4">
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Go Back
            </button>

            <Link
              href="/mosqueSearch"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-medium text-sm flex items-center shadow-sm"
            >
              <Search size={16} className="mr-2" />
              Browse Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Don't render profile content if profileUser is null
  if (!profileUser) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  const age = calculateAge(profileUser.birthDate);

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
                <div className="h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-xl mx-auto md:mx-0 relative group">
                  <div className="relative w-full h-full">
                    <Image
                      src={
                        isPhotoApproved(profileUser)
                          ? profileUser.profilePicture?.startsWith("http")
                            ? profileUser.profilePicture
                            : getAvatar(profileUser.gender)
                          : profileUser.blurredProfilePicture ||
                            getAvatar(profileUser.gender)
                      }
                      alt={`${profileUser?.firstName || "User"}'s profile`}
                      fill
                      className={`h-full w-full object-cover transition-all duration-300 ${
                        !isPhotoApproved(profileUser)
                          ? "filter blur-md brightness-75"
                          : ""
                      }`}
                      onError={(e) => {
                        e.target.src = getAvatar(profileUser.gender);
                      }}
                    />

                    {!isPhotoApproved(profileUser) && (
                      <>
                        {/* Visual blur overlay (non-interactive) */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/30 rounded-full pointer-events-none z-10" />

                        {/* Central unlock icon */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 border border-white/30 shadow-lg">
                            <Lock
                              size={24}
                              className="text-white drop-shadow-lg"
                            />
                          </div>
                        </div>

                        {/* Request button - interactive and frontmost */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent rounded-b-full p-3 pb-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 z-30">
                          <button
                            onClick={handleRequestPhoto}
                            className="w-full bg-white/90 backdrop-blur-sm text-white py-2 px-3 rounded-full text-xs font-semibold hover:bg-white transition-all duration-200 shadow-lg border border-white/20 flex items-center justify-center gap-1.5"
                          >
                            <Eye size={14} className="text-white" />
                            <span className="text-white-800">
                              Request Photo
                            </span>
                          </button>
                        </div>

                        {/* Optional shimmer (non-interactive) */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse pointer-events-none z-0" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* User Info and Actions */}
              <div className="flex-grow pt-4 md:pt-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {profileUser.firstName} {profileUser.lastName}
                      {age !== "Not specified" && `, ${age}`}
                    </h1>

                    {profileUser.currentLocation && (
                      <p className="text-gray-600 mt-2 flex items-center justify-center md:justify-start">
                        <MapPin size={18} className="mr-2 text-gray-400" />
                        {profileUser.currentLocation}
                      </p>
                    )}
                    {profileUser.tagLine && (
                      <p className="text-primary-dark font-medium mt-3 text-lg italic">
                        &ldquo;{profileUser.tagLine}&rdquo;
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto">
                    <button
                      onClick={handleInterestToggle}
                      disabled={interestLoading}
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-semibold text-sm transition-colors duration-200 shadow-sm ${
                        isInterested
                          ? "bg-red-600 text-white border-red-600 hover:bg-red-700"
                          : "border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 hover:bg-blue-50"
                      }`}
                    >
                      {interestLoading ? (
                        <Loader size={20} className="animate-spin" />
                      ) : (
                        <>
                          <Heart
                            size={20}
                            fill={isInterested ? "#ef4444" : "transparent"}
                            className={
                              isInterested ? "text-red-500" : "text-gray-500"
                            }
                          />
                          <span>
                            {isInterested ? "Interested" : "Show Interest"}
                          </span>
                        </>
                      )}
                    </button>
                    {/* Message button (force green in all states) */}
                    <button
                      onClick={handleSendMessage}
                      disabled={!profileUser?._id}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 font-semibold text-sm shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: "var(--primary)",
                        borderColor: "var(--primary)",
                        color: "#fff",
                      }}
                    >
                      <MessageCircle size={20} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Info Tags */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8 border-t border-gray-100 pt-6">
              {profileUser.religiousness && (
                <ProfileTag
                  icon={<Book size={24} />}
                  label="Religion"
                  value={formatValue(profileUser.religiousness)}
                />
              )}
              {profileUser.maritalStatus && (
                <ProfileTag
                  icon={<Heart size={24} />}
                  label="Status"
                  value={formatValue(profileUser.maritalStatus)}
                />
              )}
              {profileUser.educationLevel && (
                <ProfileTag
                  icon={<Book size={24} />}
                  label="Education"
                  value={formatValue(profileUser.educationLevel)}
                />
              )}
              {profileUser.profession && (
                <ProfileTag
                  icon={<Briefcase size={24} />}
                  label="Profession"
                  value={formatValue(profileUser.profession)}
                />
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="border-t border-gray-200 px-2 sm:px-6">
            <div className="flex overflow-x-auto scrollbar-hide -mb-px">
              {["about", "mosques", "photos", "references"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 sm:px-5 py-4 font-semibold text-sm sm:text-base whitespace-nowrap focus:outline-none transition-colors ${
                    activeTab === tab
                      ? "text-primary border-b-2 border-primary"
                      : "text-gray-600 hover:text-primary"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Left Column (Tab Content) */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "about" && (
              <>
                {/* About Me */}
                <ProfileSection title="About Me" icon={<User size={20} />}>
                  <div className="text-gray-700 leading-relaxed">
                    {profileUser.about || "No information provided yet."}
                  </div>
                </ProfileSection>

                {/* Looking For */}
                <ProfileSection title="Looking For" icon={<Heart size={20} />}>
                  <div className="text-gray-700 leading-relaxed">
                    {profileUser.lookingFor || "No preferences specified yet."}
                  </div>
                </ProfileSection>

                {/* Personal Information */}
                <ProfileSection
                  title="Personal Information"
                  icon={<Info size={20} />}
                  initiallyExpanded={false}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ProfileTag
                      icon={<Calendar size={18} />}
                      label="Age"
                      value={age ? `${age} years` : "Not specified"}
                    />
                    <ProfileTag
                      icon={<MapPin size={18} />}
                      label="Current Location"
                      value={profileUser.currentLocation}
                    />
                    <ProfileTag
                      icon={<Flag size={18} />}
                      label="Citizenship"
                      value={formatValue(profileUser.citizenship)}
                      flagUrl={citizenshipFlag}
                    />
                    <ProfileTag
                      icon={<Flag size={18} />}
                      label="Origin Country"
                      value={formatValue(profileUser.originCountry)}
                      flagUrl={originCountryFlag}
                    />
                    <ProfileTag
                      icon={<Book size={18} />}
                      label="Languages"
                      value={[
                        profileUser.firstLanguage,
                        profileUser.secondLanguage,
                        ...(profileUser.languages || []),
                      ]
                        .filter(Boolean)
                        .map(formatValue)
                        .join(", ")}
                    />
                    {profileUser.maritalStatus && (
                      <ProfileTag
                        icon={<Heart size={18} />}
                        label="Marital Status"
                        value={formatValue(profileUser.maritalStatus)}
                      />
                    )}
                    {profileUser.hasChildren !== undefined && (
                      <ProfileTag
                        icon={<UserCheck size={18} />}
                        label="Has Children"
                        value={profileUser.hasChildren ? "Yes" : "No"}
                      />
                    )}
                    {profileUser.childrenDesire && (
                      <ProfileTag
                        icon={<Heart size={18} />}
                        label="Children Desire"
                        value={formatValue(profileUser.childrenDesire)}
                      />
                    )}
                    {profileUser.livingArrangement && (
                      <ProfileTag
                        icon={<User size={18} />}
                        label="Living Arrangement"
                        value={formatValue(profileUser.livingArrangement)}
                      />
                    )}
                    {profileUser.marriageWithin && (
                      <ProfileTag
                        icon={<Calendar size={18} />}
                        label="Marriage Timeline"
                        value={formatValue(profileUser.marriageWithin)}
                      />
                    )}
                    {profileUser.income && (
                      <ProfileTag
                        icon={<Briefcase size={18} />}
                        label="Income Range"
                        value={formatValue(profileUser.income)}
                      />
                    )}
                    {profileUser.willingToRelocate !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Willing to Relocate"
                        value={profileUser.willingToRelocate ? "Yes" : "No"}
                      />
                    )}
                  </div>
                </ProfileSection>

                {/* Religious Background */}
                <ProfileSection
                  title="Religious Background"
                  icon={<Book size={20} />}
                  initiallyExpanded={false}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profileUser.religiousness && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Religiousness"
                        value={formatValue(profileUser.religiousness)}
                      />
                    )}
                    {profileUser.sector && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Islamic Sector"
                        value={formatValue(profileUser.sector)}
                      />
                    )}
                    {profileUser.prayerFrequency && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Prayer Frequency"
                        value={formatValue(profileUser.prayerFrequency)}
                      />
                    )}
                    {profileUser.quranReading && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Quran Reading"
                        value={formatValue(profileUser.quranReading)}
                      />
                    )}
                    {profileUser.keepsHalal !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Keeps Halal"
                        value={profileUser.keepsHalal ? "Yes" : "No"}
                      />
                    )}
                    {profileUser.isRevert !== undefined && (
                      <ProfileTag
                        icon={<User size={18} />}
                        label="Revert"
                        value={profileUser.isRevert ? "Yes" : "No"}
                      />
                    )}
                    {profileUser.wearsHijab !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Wears Hijab"
                        value={profileUser.wearsHijab ? "Yes" : "No"}
                      />
                    )}
                    {profileUser.smokes !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Smokes"
                        value={profileUser.smokes ? "Yes" : "No"}
                      />
                    )}
                    {profileUser.drinks !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Drinks Alcohol"
                        value={profileUser.drinks ? "Yes" : "No"}
                      />
                    )}
                    {profileUser.phoneUsage && (
                      <ProfileTag
                        icon={<Phone size={18} />}
                        label="Phone Usage"
                        value={
                          profileUser.phoneUsage
                            ? `${formatValue(profileUser.phoneUsage)}/day`
                            : "Not specified"
                        }
                      />
                    )}
                  </div>
                </ProfileSection>
              </>
            )}

            {activeTab === "mosques" && (
              <ProfileSection
                title={`Connected Mosques (${
                  profileUser.attachedMosques?.length || 0
                })`}
                icon={<Building size={20} />}
              >
                {profileUser.attachedMosques?.length > 0 ? (
                  <div className="space-y-4">
                    {profileUser.attachedMosques.map((mosque) => (
                      <div
                        key={mosque._id}
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
                          href={`/mosques/${mosque.id}`}
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
                    <p>No connected mosques found.</p>
                  </div>
                )}
              </ProfileSection>
            )}

            {activeTab === "photos" && (
              <ProfileSection title="Photos" icon={<User size={20} />}>
                <div className="flex flex-col items-center text-center py-10 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <div className="relative w-32 h-32 mx-auto mb-6">
                    <Image
                      src={
                        isPhotoApproved(profileUser)
                          ? profileUser.profilePicture?.startsWith("http")
                            ? profileUser.profilePicture
                            : getAvatar(profileUser.gender)
                          : profileUser.blurredProfilePicture ||
                            getAvatar(profileUser.gender)
                      }
                      alt={`${profileUser?.firstName || "User"}'s profile`}
                      fill
                      className={`h-full w-full object-cover rounded-full transition-all duration-300 ${
                        !isPhotoApproved(profileUser)
                          ? "filter blur-md brightness-75"
                          : ""
                      }`}
                      onError={(e) => {
                        e.target.src = getAvatar(profileUser.gender);
                      }}
                    />
                  </div>
                  {!isPhotoApproved(profileUser) && (
                    <button
                      onClick={handleRequestPhoto}
                      className="border-2 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
                      style={{
                        backgroundColor: "var(--primary)",
                        borderColor: "var(--primary)",
                        color: "#fff",
                      }}
                    >
                      <Eye size={18} />
                      Send Unblur Photo Request
                    </button>
                  )}
                </div>
              </ProfileSection>
            )}

            {activeTab === "references" && (
              <ProfileSection title="References" icon={<UserCheck size={20} />}>
                <div className="flex flex-col items-center text-center py-10 px-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                  <FileText size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-600 max-w-md">
                    No references available yet for this user.
                  </p>
                </div>
              </ProfileSection>
            )}
          </div>

          {/* Right Column (Wali Contact) */}
          <div className="space-y-6">
            {profileUser.wali && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800 flex items-center gap-2">
                    Wali Contact
                    {!isWaliApproved(profileUser) && (
                      <Lock size={16} className="text-gray-400" />
                    )}
                  </h3>
                </div>
                <div className="p-6">
                  {isWaliApproved(profileUser) ? (
                    <div className="space-y-4">
                      {profileUser.wali.name && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <UserCheck size={20} className="text-primary mt-1" />
                          <div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              Name
                            </div>
                            <div className="font-medium text-gray-800">
                              {profileUser.wali.name}
                            </div>
                          </div>
                        </div>
                      )}
                      {profileUser.wali.email && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Mail size={20} className="text-primary mt-1" />
                          <div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              Email
                            </div>
                            <div className="font-medium text-gray-800">
                              {profileUser.wali.email}
                            </div>
                          </div>
                        </div>
                      )}
                      {profileUser.wali.phone && (
                        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <Phone size={20} className="text-primary mt-1" />
                          <div>
                            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                              Phone
                            </div>
                            <div className="font-medium text-gray-800">
                              {profileUser.wali.phone}
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="mt-6 text-xs text-blue-800 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                        <Info size={18} className="text-blue-600 mt-0.5" />
                        <p>
                          Wali contact details are provided to facilitate formal
                          steps towards marriage after mutual interest. Please
                          use this information respectfully.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center py-8 px-4">
                      <Lock size={48} className="text-gray-300 mb-4" />
                      <p className="text-gray-600 mb-6 max-w-md">
                        Wali contact information is private. Request access to
                        view these details.
                      </p>
                      <button
                        onClick={handleRequestWali}
                        className="border-2 px-6 py-3 rounded-lg font-medium flex items-center justify-center gap-2 shadow-sm"
                        style={{
                          backgroundColor: "var(--primary)",
                          borderColor: "var(--primary)",
                          color: "#fff",
                        }}
                      >
                        <Mail size={18} />
                        Request Wali Contact
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
