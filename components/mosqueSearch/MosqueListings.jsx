import MosqueCard from "./MosqueCard";

export default function MosqueListings({
  mosques,
  listingsView,
  handleMarkerClick,
  clearAllFilters,
}) {
  if (mosques.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🕌</div>
        <h3 className="text-lg font-medium mb-2">No mosques found</h3>
        <p className="text-gray-600">
          Try adjusting your filters or search criteria to find more results.
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
      {mosques?.map((mosque) => (
        <MosqueCard
          key={mosque.id}
          mosque={{
            ...mosque,
            prayerTimes: mosque.prayerTimes || {},
            facilities: mosque.facilities || [],
            image: mosque.image || "https://picsum.photos/400/300?random=1",
          }}
          listView={listingsView === "list"}
          onClick={handleMarkerClick}
        />
      ))}
    </div>
  );
}
