"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMatches,
  setSelectedMatch,
  setSearchDistance,
  fetchUserInterests,
  addInterest,
  removeInterest,
  addInterestLocal,
  removeInterestLocal,
} from "../../redux/match/matchSlice";
import { Star, MapPin, MessageCircle, Heart } from "lucide-react";
import Image from "next/image";
import femaleAvatar from "../../public/images/matches/femaleAvatar.jpg";
import maleAvatar from "../../public/images/matches/maleAvatar.jpg";
import { toast } from "react-hot-toast";
import { getAvatar, calculateAge } from "@/shared/helper/defaultData";
import Link from "next/link";

const formatUserResponse = (user) => {
  const {
    _id,
    firstName,
    secondName,
    gender,
    birthDate,
    citizenship,
    originCountry,
    firstLanguage,
    secondLanguage,
    distance,
    profilePicture,
    interests = [],
    rating,
    location,
  } = user;

  const age = calculateAge(birthDate);
  const distanceText = distance
    ? `${distance} miles away`
    : "Distance same location";
  const languageList = [firstLanguage, secondLanguage].filter(Boolean);

  return {
    _id,
    firstName,
    secondName,
    age,
    gender,
    citizenship,
    originCountry,
    languages: languageList,
    distance: distanceText,
    profilePicture,
    interests,
    rating,
    location,
  };
};

const MatchCard = ({ match, isListView, onClick, isInterested }) => {
  const dispatch = useDispatch();
  const [flagUrl, setFlagUrl] = useState(null);
  const [originFlagUrl, setOriginFlagUrl] = useState(null);

  useEffect(() => {
    const fetchFlag = async (country, setFlag) => {
      if (!country) {
        setFlag(null);
        return;
      }
      const apiKey = "xi13wHV/r789FLVgaTROaQ==ErfchmfqYA2YDF8i";
      const apiUrl = `https://api.api-ninjas.com/v1/countryflag?country=${country}`;

      try {
        const response = await fetch(apiUrl, {
          headers: {
            "X-Api-Key": apiKey,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setFlag(data.square_image_url);
        } else {
          console.error("Failed to fetch flag:", response.statusText);
          setFlag(null);
        }
      } catch (error) {
        console.error("Error fetching flag:", error);
        setFlag(null);
      }
    };

    fetchFlag(match.citizenship, setFlagUrl);
    fetchFlag(match.originCountry, setOriginFlagUrl);
  }, [match.citizenship, match.originCountry]);

  const handleInterestClick = async (e) => {
    e.stopPropagation();
    try {
      if (isInterested) {
        dispatch(removeInterestLocal(match._id));
        await dispatch(removeInterest(match._id)).unwrap();
        toast.success("Removed from interests");
      } else {
        dispatch(addInterestLocal(match));
        await dispatch(addInterest(match._id)).unwrap();
        toast.success("Added to interests");
      }
    } catch (error) {
      if (isInterested) {
        dispatch(addInterestLocal(match));
      } else {
        dispatch(removeInterestLocal(match._id));
      }
      toast.error(error.message || "Failed to update interest");
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow cursor-pointer ${
        isListView ? "flex" : ""
      }`}
      onClick={() => onClick(match)}
    >
      <div
        className={`${
          isListView ? "w-1/3 h-full" : "h-48"
        } relative overflow-hidden`}
      >
        <Image
          src={
            match.profilePicture?.startsWith("http")
              ? match.profilePicture
              : getAvatar(match.gender)
          }
          alt={`${match?.firstName || "User"}'s profile`}
          width={500}
          height={500}
          className={`object-cover ${
            isListView ? "w-full h-full" : "w-full h-48"
          }`}
        />

        <button
          onClick={handleInterestClick}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors z-10"
          aria-label={isInterested ? "Remove interest" : "Add interest"}
        >
          <Heart
            size={18}
            className="text-primary"
            fill={isInterested ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className={`p-4 ${isListView ? "w-2/3" : ""}`}>
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {match.firstName || ""} {match.lastName || ""}
          </h3>
        </div>

        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin size={14} className="mr-1" />
          <span>{match.distance}</span>
        </div>

        <div className="mb-2 text-sm text-gray-600 space-y-1">
          <p>Age: {match.age}</p>
          <p className="flex items-center">
            Citizenship: {match.citizenship}
            {flagUrl && (
              <img
                src={flagUrl}
                alt={`${match.citizenship} flag`}
                className="w-4 h-4 ml-2 rounded-sm"
              />
            )}
          </p>
          <p className="flex items-center">
            Origin Country: {match.originCountry}
            {originFlagUrl && (
              <img
                src={originFlagUrl}
                alt={`${match.originCountry} flag`}
                className="w-4 h-4 ml-2 rounded-sm"
              />
            )}
          </p>
          <p>Languages: {match.languages.join(", ")}</p>
        </div>

        <div className="flex flex-wrap gap-1 mt-2">
          {match.interests?.slice(0, 3).map((interest, index) => (
            <span
              key={index}
              className="bg-gray-100 text-xs text-gray-700 rounded-full px-2 py-1"
            >
              {interest}
            </span>
          ))}
          {match.interests?.length > 3 && (
            <span className="bg-gray-100 text-xs text-gray-700 rounded-full px-2 py-1">
              +{match.interests.length - 3}
            </span>
          )}
        </div>

        <div className="mt-3 flex justify-between">
          <Link href={`/profile/${match._id}`} passHref>
            <button
              className="flex items-center text-primary text-sm font-medium hover:underline"
              onClick={(e) => e.stopPropagation()} // prevent bubbling if needed
            >
              View Profile
            </button>
          </Link>
          <button
            className="flex items-center gap-1 bg-primary text-white px-3 py-1 rounded-full text-sm hover:bg-primary-dark transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <MessageCircle size={14} />
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default function MatchListings({
  listingsView,
  handleMarkerClick,
  clearAllFilters,
}) {
  const dispatch = useDispatch();
  const { matches, loading, error, searchDistance, userInterests } =
    useSelector((state) => state.matches);

  useEffect(() => {
    dispatch(fetchMatches(searchDistance));
    dispatch(fetchUserInterests());
  }, [dispatch, searchDistance]);

  const handleMatchClick = (match) => {
    dispatch(setSelectedMatch(match));
    if (handleMarkerClick && match.location) {
      handleMarkerClick(match);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Finding potential matches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h3 className="text-lg font-medium mb-2">Oops! Something went wrong</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => dispatch(fetchMatches(searchDistance))}
          className="mt-4 text-primary font-medium hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">👤</div>
        <h3 className="text-lg font-medium mb-2">No matches found</h3>
        <p className="text-gray-600">
          Try adjusting your distance filter or check back later.
        </p>
        <button
          onClick={clearAllFilters}
          className="mt-4 text-primary font-medium hover:underline"
        >
          Clear all filters
        </button>
      </div>
    );
  }

  const formattedMatches = matches.map((match) => ({
    ...formatUserResponse(match),
    isInterested:
      userInterests?.some((interest) => interest._id === match._id) || false,
  }));

  return (
    <div
      className={`p-4 ${
        listingsView === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 gap-6"
          : "flex flex-col gap-4"
      }`}
    >
      {formattedMatches.map((match) => (
        <MatchCard
          key={match._id}
          match={match}
          isListView={listingsView === "list"}
          isInterested={match.isInterested}
          onClick={handleMatchClick}
        />
      ))}
    </div>
  );
}
