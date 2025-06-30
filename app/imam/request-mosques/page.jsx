"use client";
import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Send, AlertCircle } from "lucide-react";
import MapContainer from "@/components/auth/signup/step9Components/MapContainer";
import SelectedMosquesList from "@/components/auth/signup/step9Components/SelectedMosquesList";
import { toast } from "react-hot-toast";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";

export default function ImamRequestMosquesPage() {
  const [userLocation, setUserLocation] = useState({
    lat: 51.5074,
    lng: -0.1278,
  });
  const [distance, setDistance] = useState(10);
  const [selectedMosques, setSelectedMosques] = useState([]);
  const [existingRequests, setExistingRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch existing imam mosque requests
  useEffect(() => {
    const fetchExistingRequests = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${rootRoute}/imam-mosque-requests/my-requests`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Fetched existing requests:", response.data);
        setExistingRequests(response.data);
      } catch (err) {
        console.error("Failed to fetch existing requests:", err);
      }
    };

    fetchExistingRequests();
  }, []);

  // Toggle mosque selection
  const toggleMosqueAttachment = useCallback((mosque) => {
    setSelectedMosques((prev) => {
      const isAttached = prev.some((m) => m.id === mosque.id);
      return isAttached
        ? prev.filter((m) => m.id !== mosque.id)
        : [...prev, mosque];
    });
  }, []);

  // Submit request to be imam at selected mosques
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMosques.length === 0) {
      toast.error("Please select at least one mosque.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const mosqueIds = selectedMosques.map((m) => m._id || m.id);
      await axios.post(
        `${rootRoute}/imam-mosque-requests/request`,
        { mosqueIds },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request(s) sent to superadmin for approval.");
      setSelectedMosques([]);

      // Refresh existing requests to update the map colors
      const response = await axios.get(
        `${rootRoute}/imam-mosque-requests/my-requests`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setExistingRequests(response.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request.");
      toast.error(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                href="/imam"
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Request Mosque Assignment
                  </h1>
                  <p className="text-sm text-gray-600">
                    Select mosques where you wish to serve as an imam
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8 h-[600px]">
          {/* Map Section */}
          <div className="flex-1 lg:flex-[2]">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Mosque Map
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Use the map to find and select mosques in your area
                </p>
              </div>
              <div className="p-6 h-[calc(100%-80px)]">
                {error && (
                  <div className="mb-4 rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
                <div className="h-full">
                  <MapContainer
                    userLocation={userLocation}
                    distance={distance}
                    attachedMosques={selectedMosques}
                    toggleMosqueAttachment={toggleMosqueAttachment}
                    setError={setError}
                    existingRequests={existingRequests}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Selected Mosques Section */}
          <div className="flex-1 lg:w-80">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  Selected Mosques
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedMosques.length} mosque
                  {selectedMosques.length !== 1 ? "s" : ""} selected
                </p>
              </div>
              <div className="p-6 h-[calc(100%-80px)] flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <SelectedMosquesList
                    attachedMosques={selectedMosques}
                    toggleMosqueAttachment={toggleMosqueAttachment}
                  />
                </div>

                {/* Submit Button */}
                <form onSubmit={handleSubmit} className="mt-6 flex-shrink-0">
                  <button
                    type="submit"
                    disabled={loading || selectedMosques.length === 0}
                    className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    {loading ? "Submitting..." : "Send Request to Superadmin"}
                  </button>
                </form>

                {/* Info Box */}
                <div className="mt-4 rounded-md bg-blue-50 p-4 flex-shrink-0">
                  <div className="flex">
                    <AlertCircle className="h-5 w-5 text-blue-400" />
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        Your request will be reviewed by the superadmin. You'll
                        be notified once a decision is made.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
