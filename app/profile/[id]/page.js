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
} from "lucide-react";
import { calculateAge, getAvatar } from "@/shared/helper/defaultData";
import {
  addInterest,
  removeInterest,
  fetchUserInterests,
} from "@/redux/match/matchSlice";
import { fetchUserProfile, clearViewingUser } from "@/redux/user/userSlice";
import { useParams, useRouter } from "next/navigation";
import coverImage from "@/public/images/matches/background.jpg";
import useCountryFlag from "@/shared/helper/useCountryFlag";
import toast from "react-hot-toast";

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
      <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
        <Image
          src={flagUrl}
          alt={`${label} flag`}
          width={40}
          height={40}
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

  const {
    currentUser = {},
    loading,
    error,
  } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    loading: state.user.loading,
    error: state.user.error,
  }));
  console.log({ loading });

  const { userInterests, loading: interestsLoading } = useSelector(
    (state) => state.matches
  );
  const [activeTab, setActiveTab] = useState("about");
  const [interestLoading, setInterestLoading] = useState(false);
  const [isInterested, setIsInterested] = useState(false);

  // Fetch profile data and user interests
  useEffect(() => {
    if (userId) {
      dispatch(fetchUserProfile(userId));
      dispatch(fetchUserInterests());
    }
    return () => dispatch(clearViewingUser());
  }, [dispatch, userId]);

  // Check interest status whenever userInterests or currentUser changes
  useEffect(() => {
    if (currentUser?._id && userInterests) {
      const interested = userInterests.some(
        (user) => user._id === currentUser._id
      );
      setIsInterested(interested);
    } else {
      setIsInterested(false);
    }
  }, [userInterests, currentUser]);

  // Flag hooks
  const citizenshipFlag = useCountryFlag(currentUser?.citizenship);
  const originCountryFlag = useCountryFlag(currentUser?.originCountry);

  const handleInterestToggle = async () => {
    if (!currentUser?._id || interestLoading) return;

    const previousState = isInterested;
    setIsInterested(!previousState); // Optimistic update
    setInterestLoading(true);

    try {
      if (previousState) {
        await dispatch(removeInterest(currentUser._id)).unwrap();
        toast.success("Removed from your interests");
      } else {
        await dispatch(addInterest(currentUser._id)).unwrap();
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

  const handleSendMessage = () => {
    if (currentUser?._id) {
      router.push(`/messages/${currentUser._id}`);
    }
  };

  if (loading || interestsLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    );
  }

  if (!loading && (error || !currentUser?._id)) {
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
            We couldn't retrieve the requested profile information. Please try
            again later.
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
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-opacity-90 transition-colors font-medium text-sm flex items-center"
            >
              <Search size={16} className="mr-2" />
              Browse Matches
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const age = calculateAge(currentUser.birthDate);

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
                      currentUser.profilePicture?.startsWith("http")
                        ? currentUser.profilePicture
                        : getAvatar(currentUser.gender)
                    }
                    alt={`${currentUser?.firstName || "User"}'s profile`}
                    width={128}
                    height={128}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = getAvatar(currentUser.gender);
                    }}
                  />

                  {currentUser.isVerified && (
                    <div className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1 bg-green-500 text-white border-2 border-white rounded-full p-1 shadow-md">
                      <UserCheck size={16} />
                    </div>
                  )}
                </div>
              </div>

              {/* User Info and Actions */}
              <div className="flex-grow pt-4 md:pt-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div className="text-center md:text-left mb-6 md:mb-0">
                    <h1 className="text-3xl font-bold text-gray-900">
                      {currentUser.firstName} {currentUser.lastName}
                      {age !== "Not specified" && (
                        <span className="ml-3 text-xl font-normal text-gray-500">
                          {age}
                        </span>
                      )}
                    </h1>
                    {currentUser.currentLocation && (
                      <p className="text-gray-600 mt-2 flex items-center justify-center md:justify-start">
                        <MapPin size={18} className="mr-2 text-gray-400" />
                        {currentUser.currentLocation}
                      </p>
                    )}
                    {currentUser.tagLine && (
                      <p className="text-primary-dark font-medium mt-3 text-lg italic">
                        "{currentUser.tagLine}"
                      </p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 justify-center md:justify-end w-full md:w-auto">
                    <button
                      onClick={handleInterestToggle}
                      disabled={interestLoading}
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
                    <button
                      onClick={handleSendMessage}
                      disabled={!currentUser?._id}
                      className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
              {currentUser.religiousness && (
                <ProfileTag
                  icon={<Book size={24} />}
                  label="Religion"
                  value={formatValue(currentUser.religiousness)}
                />
              )}
              {currentUser.maritalStatus && (
                <ProfileTag
                  icon={<Heart size={24} />}
                  label="Status"
                  value={formatValue(currentUser.maritalStatus)}
                />
              )}
              {currentUser.educationLevel && (
                <ProfileTag
                  icon={<Book size={24} />}
                  label="Education"
                  value={formatValue(currentUser.educationLevel)}
                />
              )}
              {currentUser.profession && (
                <ProfileTag
                  icon={<Briefcase size={24} />}
                  label="Profession"
                  value={formatValue(currentUser.profession)}
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
                    {currentUser.about || "No information provided yet."}
                  </div>
                </ProfileSection>

                {/* Looking For */}
                <ProfileSection title="Looking For" icon={<Heart size={20} />}>
                  <div className="text-gray-700 leading-relaxed">
                    {currentUser.lookingFor || "No preferences specified yet."}
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
                      value={currentUser.currentLocation}
                    />
                    <ProfileTag
                      icon={<Flag size={18} />}
                      label="Citizenship"
                      value={formatValue(currentUser.citizenship)}
                      flagUrl={citizenshipFlag}
                    />
                    <ProfileTag
                      icon={<Flag size={18} />}
                      label="Origin Country"
                      value={formatValue(currentUser.originCountry)}
                      flagUrl={originCountryFlag}
                    />
                    <ProfileTag
                      icon={<Book size={18} />}
                      label="Languages"
                      value={[
                        currentUser.firstLanguage,
                        currentUser.secondLanguage,
                        ...(currentUser.languages || []),
                      ]
                        .filter(Boolean)
                        .map(formatValue)
                        .join(", ")}
                    />
                    {currentUser.maritalStatus && (
                      <ProfileTag
                        icon={<Heart size={18} />}
                        label="Marital Status"
                        value={formatValue(currentUser.maritalStatus)}
                      />
                    )}
                    {currentUser.hasChildren !== undefined && (
                      <ProfileTag
                        icon={<UserCheck size={18} />}
                        label="Has Children"
                        value={currentUser.hasChildren ? "Yes" : "No"}
                      />
                    )}
                    {currentUser.childrenDesire && (
                      <ProfileTag
                        icon={<Heart size={18} />}
                        label="Children Desire"
                        value={formatValue(currentUser.childrenDesire)}
                      />
                    )}
                    {currentUser.livingArrangement && (
                      <ProfileTag
                        icon={<User size={18} />}
                        label="Living Arrangement"
                        value={formatValue(currentUser.livingArrangement)}
                      />
                    )}
                    {currentUser.marriageWithin && (
                      <ProfileTag
                        icon={<Calendar size={18} />}
                        label="Marriage Timeline"
                        value={formatValue(currentUser.marriageWithin)}
                      />
                    )}
                    {currentUser.income && (
                      <ProfileTag
                        icon={<Briefcase size={18} />}
                        label="Income Range"
                        value={formatValue(currentUser.income)}
                      />
                    )}
                    {currentUser.willingToRelocate !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Willing to Relocate"
                        value={currentUser.willingToRelocate ? "Yes" : "No"}
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
                    {currentUser.religiousness && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Religiousness"
                        value={formatValue(currentUser.religiousness)}
                      />
                    )}
                    {currentUser.sector && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Islamic Sector"
                        value={formatValue(currentUser.sector)}
                      />
                    )}
                    {currentUser.prayerFrequency && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Prayer Frequency"
                        value={formatValue(currentUser.prayerFrequency)}
                      />
                    )}
                    {currentUser.quranReading && (
                      <ProfileTag
                        icon={<Book size={18} />}
                        label="Quran Reading"
                        value={formatValue(currentUser.quranReading)}
                      />
                    )}
                    {currentUser.keepsHalal !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Keeps Halal"
                        value={currentUser.keepsHalal ? "Yes" : "No"}
                      />
                    )}
                    {currentUser.isRevert !== undefined && (
                      <ProfileTag
                        icon={<User size={18} />}
                        label="Revert"
                        value={currentUser.isRevert ? "Yes" : "No"}
                      />
                    )}
                    {currentUser.wearsHijab !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Wears Hijab"
                        value={currentUser.wearsHijab ? "Yes" : "No"}
                      />
                    )}
                    {currentUser.smokes !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Smokes"
                        value={currentUser.smokes ? "Yes" : "No"}
                      />
                    )}
                    {currentUser.drinks !== undefined && (
                      <ProfileTag
                        icon={<Info size={18} />}
                        label="Drinks Alcohol"
                        value={currentUser.drinks ? "Yes" : "No"}
                      />
                    )}
                    {currentUser.phoneUsage && (
                      <ProfileTag
                        icon={<Phone size={18} />}
                        label="Phone Usage"
                        value={
                          currentUser.phoneUsage
                            ? `${formatValue(currentUser.phoneUsage)}/day`
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
                  currentUser.attachedMosques?.length || 0
                })`}
                icon={<Building size={20} />}
              >
                {currentUser.attachedMosques?.length > 0 ? (
                  <div className="space-y-4">
                    {currentUser.attachedMosques.map((mosque) => (
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
                  <Lock size={48} className="text-gray-300 mb-4" />
                  <p className="text-gray-600 mb-6 max-w-md">
                    Photos are private and hidden until a mutual interest is
                    established.
                  </p>
                  <button
                    onClick={handleInterestToggle}
                    disabled={interestLoading}
                    className="bg-white border border-gray-300 px-6 py-3 rounded-lg text-gray-700 font-medium hover:border-primary hover:text-primary hover:bg-gray-100 transition duration-200 flex items-center justify-center gap-2 shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {interestLoading ? (
                      <Loader size={18} className="animate-spin" />
                    ) : (
                      <Heart
                        size={18}
                        fill={isInterested ? "#ef4444" : "transparent"}
                        className={
                          isInterested ? "text-red-500" : "text-gray-500"
                        }
                      />
                    )}
                    {isInterested
                      ? "You are interested"
                      : "Show Interest to View Photos"}
                  </button>
                  {isInterested && (
                    <p className="text-sm text-green-600 mt-3">
                      Mutual interest may reveal photos if the other user is
                      also interested.
                    </p>
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
            {currentUser.wali && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                  <h3 className="font-semibold text-lg text-gray-800">
                    Wali Contact
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {currentUser.wali.name && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <UserCheck size={20} className="text-primary mt-1" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Name
                          </div>
                          <div className="font-medium text-gray-800">
                            {currentUser.wali.name}
                          </div>
                        </div>
                      </div>
                    )}
                    {currentUser.wali.email && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Mail size={20} className="text-primary mt-1" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Email
                          </div>
                          <div className="font-medium text-gray-800">
                            {currentUser.wali.email}
                          </div>
                        </div>
                      </div>
                    )}
                    {currentUser.wali.phone && (
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <Phone size={20} className="text-primary mt-1" />
                        <div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wide">
                            Phone
                          </div>
                          <div className="font-medium text-gray-800">
                            {currentUser.wali.phone}
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
                      this information respectfully.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
