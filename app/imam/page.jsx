"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";

// Import new modular components
import {
  ImamDashboardHeader,
  ImamTabs,
  RequestTable,
  EditRequestModal,
  ConfirmationModal,
} from "@/components/imam";

const ImamDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [editModal, setEditModal] = useState({ open: false, request: null });
  const [confirmModal, setConfirmModal] = useState({
    open: false,
    action: null,
    request: null,
  });

  // Calculate statistics with default values
  const stats = {
    total: requests.length || 0,
    pending: requests.filter((r) => r.status === "pending").length || 0,
    approved: requests.filter((r) => r.status === "approved").length || 0,
    denied: requests.filter((r) => r.status === "denied").length || 0,
  };

  useEffect(() => {
    fetchAttachmentRequests();
  }, []);

  const fetchAttachmentRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${rootRoute}/mosque-attachments/imam-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Raw response data:", response.data); // Debug log

      // Transform the data to match our component expectations
      // The backend returns user and mosque objects directly
      const transformedRequests = response.data.map((request) => ({
        id: request.id || request._id,
        user: {
          name: request.user?.name || "Unknown User",
          email: request.user?.email || "No email",
          phone: request.user?.phone || "No phone",
        },
        mosque: {
          name: request.mosque?.name || "Unknown Mosque",
          address: request.mosque?.address || "No address",
        },
        message: request.message || "No message provided",
        status: request.status || "pending",
        imamResponse: request.imamResponse || "",
        denialReason: request.denialReason || "",
        createdAt: request.createdAt,
      }));

      console.log("Transformed requests:", transformedRequests); // Debug log
      setRequests(transformedRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error("Failed to load verification requests");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAccept = async (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    setConfirmModal({
      open: true,
      action: "approve",
      request: request,
    });
  };

  const handleDeny = async (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    setConfirmModal({
      open: true,
      action: "deny",
      request: request,
    });
  };

  const handleEdit = (requestId) => {
    const request = requests.find((r) => r.id === requestId);
    setEditModal({ open: true, request: request });
  };

  const handleConfirmAction = async () => {
    const { action, request } = confirmModal;

    try {
      const token = localStorage.getItem("token");
      const endpoint = action === "approve" ? "approve" : "deny";

      const response = await axios.post(
        `${rootRoute}/mosque-attachments/${request.id}/${endpoint}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        toast.success(
          action === "approve"
            ? "Request approved successfully"
            : "Request denied successfully"
        );
        await fetchAttachmentRequests(); // Refresh data
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      toast.error(`Failed to ${action} request`);
    } finally {
      setConfirmModal({ open: false, action: null, request: null });
    }
  };

  const handleSaveEdit = async ({
    status,
    response: responseText,
    denialReason,
  }) => {
    try {
      const token = localStorage.getItem("token");
      const { request } = editModal;

      console.log("=== EDIT REQUEST DEBUG ===");
      console.log("Editing request:", request); // Debug log
      console.log("Request ID:", request?.id); // Debug log
      console.log("Request ID type:", typeof request?.id); // Debug log
      console.log("Current request status:", request?.status); // Debug log
      console.log("New status:", status); // Debug log
      console.log("Response text:", responseText); // Debug log
      console.log("Denial reason:", denialReason); // Debug log

      if (!request?.id) {
        console.error("No request ID found!");
        toast.error("Invalid request ID");
        return;
      }

      let endpoint = "";
      let requestData = {};
      let method = "PUT";

      // Determine the correct endpoint and data based on the new status
      if (status === "approved") {
        // If current status is already approved, update response
        if (request.status === "approved") {
          endpoint = "update-response";
          requestData = { imamResponse: responseText };
          method = "PUT";
        } else {
          // If changing to approved from other status, use approve endpoint
          endpoint = "approve";
          requestData = { imamResponse: responseText };
          method = "POST";
        }
      } else if (status === "denied") {
        // If current status is already denied, update denial reason
        if (request.status === "denied") {
          endpoint = "update-denial";
          requestData = { denialReason };
          method = "PUT";
        } else {
          // If changing to denied from other status, use deny endpoint
          endpoint = "deny";
          requestData = { denialReason };
          method = "POST";
        }
      } else if (status === "pending") {
        endpoint = "reset-to-pending";
        requestData = {};
        method = "PUT";
      } else {
        console.error("Invalid status:", status);
        toast.error("Invalid status");
        return;
      }

      console.log("Endpoint:", endpoint); // Debug log
      console.log("Method:", method); // Debug log
      console.log("Request data:", requestData); // Debug log
      console.log(
        "URL:",
        `${rootRoute}/mosque-attachments/${request.id}/${endpoint}`
      ); // Debug log

      let response;
      if (method === "POST") {
        console.log("Making POST request...");
        response = await axios.post(
          `${rootRoute}/mosque-attachments/${request.id}/${endpoint}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      } else {
        console.log("Making PUT request...");
        response = await axios.put(
          `${rootRoute}/mosque-attachments/${request.id}/${endpoint}`,
          requestData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }

      console.log("Response received:", response.data); // Debug log

      if (response.data.success) {
        console.log("Request updated successfully!");
        toast.success("Request updated successfully");
        await fetchAttachmentRequests(); // Refresh data
        setEditModal({ open: false, request: null }); // Close modal
      }
    } catch (error) {
      console.error("=== EDIT REQUEST ERROR ===");
      console.error("Error updating request:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error("Failed to update request");
    }
  };

  const getFilteredRequests = () => {
    switch (tabValue) {
      case 0: // All
        return requests;
      case 1: // Pending
        return requests.filter((r) => r.status === "pending");
      case 2: // Approved
        return requests.filter((r) => r.status === "approved");
      case 3: // Denied
        return requests.filter((r) => r.status === "denied");
      default:
        return requests;
    }
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="imam-dashboard-isolated min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header with Stats */}
      <ImamDashboardHeader stats={stats} />

      {/* Tabs Navigation */}
      <ImamTabs
        tabValue={tabValue}
        onTabChange={handleTabChange}
        stats={stats}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {tabValue === 0 && "All Verification Requests"}
              {tabValue === 1 && "Pending Requests"}
              {tabValue === 2 && "Approved Requests"}
              {tabValue === 3 && "Denied Requests"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {filteredRequests.length} request
              {filteredRequests.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="p-6">
            <RequestTable
              requests={filteredRequests}
              onAccept={handleAccept}
              onDeny={handleDeny}
              onEdit={handleEdit}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditRequestModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, request: null })}
        request={editModal.request}
        onSave={handleSaveEdit}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.open}
        onClose={() =>
          setConfirmModal({ open: false, action: null, request: null })
        }
        action={confirmModal.action}
        request={confirmModal.request}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default ImamDashboard;
