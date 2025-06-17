"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchMatches,
  setSelectedMatch,
  fetchUserInterests,
  loadMoreMatches,
} from "../../redux/match/matchSlice";
import { calculateAge } from "@/shared/helper/defaultData";
import MatchCard from "./MatchCard";

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
    unblurRequest,
    approvedPhotosFor,
    currentLocation,
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
    unblurRequest,
    approvedPhotosFor,
    currentLocation,
  };
};

export default function MatchListings({
  listingsView,
  handleMarkerClick,
  clearAllFilters,
}) {
  const dispatch = useDispatch();
  const {
    matches,
    loading,
    error,
    searchDistance,
    userInterests,
    hasMore,
    page,
    isFirstLoad, // Added isFirstLoad
  } = useSelector((state) => state.matches);
  const [displayedMatches, setDisplayedMatches] = useState([]);

  // Create observer reference
  const observer = useRef();

  // Reference to the last match element
  const lastMatchElementRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          dispatch(loadMoreMatches(searchDistance));
        }
      });

      if (node) observer.current.observe(node);
    },
    [loading, hasMore, dispatch, searchDistance]
  );

  useEffect(() => {
    dispatch(fetchMatches(searchDistance));
    dispatch(fetchUserInterests());
  }, [dispatch, searchDistance]);

  useEffect(() => {
    // Reset displayed matches when matches array changes length unexpectedly
    if (matches.length < displayedMatches.length && !loading) {
      setDisplayedMatches([]);
    }

    const formattedMatches = matches.map((match) => ({
      ...formatUserResponse(match),
      isInterested:
        userInterests?.some((interest) => interest._id === match._id) || false,
    }));

    // Only update if matches actually changed
    if (JSON.stringify(formattedMatches) !== JSON.stringify(displayedMatches)) {
      setDisplayedMatches(formattedMatches);
    }
  }, [matches, userInterests, loading]); // Add loading to dependencies

  // Add cleanup to reset when unmounting
  useEffect(() => {
    return () => {
      setDisplayedMatches([]);
    };
  }, []);

  const handleMatchClick = (match) => {
    dispatch(setSelectedMatch(match));
    if (handleMarkerClick && match.location) {
      handleMarkerClick(match);
    }
  };

  if (loading && isFirstLoad && page === 1) {
    return (
      <div className="p-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-gray-600">Finding potential matches...</p>
      </div>
    );
  }

  if (error && displayedMatches.length === 0) {
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

  if (displayedMatches.length === 0 && !loading) {
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

  return (
    <div
      className={`p-4 ${
        listingsView === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 gap-6"
          : "flex flex-col gap-4"
      }`}
    >
      {displayedMatches.map((match, index) => {
        // If this is the last item, attach the ref
        if (displayedMatches.length === index + 1) {
          return (
            <div key={match._id} ref={lastMatchElementRef}>
              <MatchCard
                match={match}
                isListView={listingsView === "list"}
                isInterested={match.isInterested}
                onClick={handleMatchClick}
              />
            </div>
          );
        } else {
          return (
            <MatchCard
              key={match._id}
              match={match}
              isListView={listingsView === "list"}
              isInterested={match.isInterested}
              onClick={handleMatchClick}
            />
          );
        }
      })}

      {/* Loading indicator for infinite scroll */}
      {loading && page > 1 && (
        <div className="col-span-full p-4 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
        </div>
      )}
    </div>
  );
}
