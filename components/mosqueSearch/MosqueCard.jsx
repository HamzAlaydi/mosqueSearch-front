import Link from "next/link";
import { MapPin, Heart, Calendar, Star } from "lucide-react";

export default function MosqueCard({ mosque, listView, onClick }) {
  // Ensure all required fields exist
  const safeMosque = {
    ...mosque,
    prayerTimes: mosque.prayerTimes || {},
    facilities: mosque.facilities || [],
    image: mosque.image || "http://localhost:3001/mosqueSearch",
    rating: mosque.rating || 0,
    reviewCount: mosque.reviewCount || 0,
    address: mosque.address || "Address not available",
  };

  return (
    <div
      className={`bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow ${
        listView ? "flex flex-row" : ""
      }`}
      onClick={() => onClick(safeMosque)}
    >
      <div className={`relative ${listView ? "w-1/3" : ""}`}>
      {console.log(safeMosque.image)}
      
        <img
          src={safeMosque.image}
          alt={safeMosque.name}
          className={`object-cover ${listView ? "w-full h-48" : "w-full h-64"}`}
        />
        <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-105 transition">
          <Heart className="text-gray-600 hover:text-red-500" size={20} />
        </button>
      </div>
      <div className={`p-4 ${listView ? "w-2/3" : ""}`}>
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{safeMosque.name}</h3>
          <div className="flex items-center text-sm">
            <Star size={16} className="text-yellow-500 fill-yellow-500" />
            <span className="ml-1">{safeMosque.rating}</span>
            {safeMosque.reviewCount > 0 && (
              <span className="text-gray-500 ml-1">
                ({safeMosque.reviewCount})
              </span>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-1 flex items-center">
          <MapPin size={14} className="mr-1" /> {safeMosque.address}
        </p>
        {safeMosque.distance && (
          <p className="text-sm text-gray-600 mt-1">{safeMosque.distance}</p>
        )}

        {/* Prayer Times Section - Fixed with null check */}
        {safeMosque.prayerTimes &&
          Object.keys(safeMosque.prayerTimes).length > 0 && (
            <div className="mt-3">
              <h4 className="text-sm font-medium mb-2">Today's Prayer Times</h4>
              <div className="flex flex-wrap gap-2 text-xs">
                {Object.entries(safeMosque.prayerTimes).map(
                  ([prayer, time]) => (
                    <div
                      key={prayer}
                      className="bg-gray-100 px-2 py-1 rounded-md"
                    >
                      <span className="font-medium capitalize">{prayer}: </span>
                      <span>{time}</span>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

        {/* Facilities Tags - Fixed with null check */}
        {safeMosque.facilities.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {safeMosque.facilities.slice(0, 3).map((facility) => (
                <span
                  key={facility}
                  className="text-xs bg-primary bg-opacity-10 text-white px-2 py-1 rounded-full"
                >
                  {facility}
                </span>
              ))}
              {safeMosque.facilities.length > 3 && (
                <span className="text-xs text-gray-500">
                  +{safeMosque.facilities.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-4">
          <button className="text-primary text-sm font-medium hover:underline flex items-center">
            <Calendar size={14} className="mr-1" /> Prayer Times
          </button>
          <Link
            href={`/mosqueSearch/#`}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-primary-dark transition"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
