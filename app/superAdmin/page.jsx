"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  SuperAdminHeader,
  SuperAdminTabs,
  ImamRequestsTable,
  ImamMosqueRequestsTable,
  EditImamStatusModal,
  EditMosqueRequestModal,
  DenialModal,
} from "@/components/superadmin";
import {
  fetchImamRequests,
  approveImamRequest,
  denyImamRequest,
  updateImamStatus,
  clearError,
  clearSuccess,
} from "@/redux/superadmin/superAdminSlice";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";

const SuperAdmin = () => {
  const dispatch = useDispatch();
  const { imamRequests, loading, error, success } = useSelector(
    (state) => state.superadmin
  );

  const [tabValue, setTabValue] = useState(0);
  const [imamMosqueRequests, setImamMosqueRequests] = useState([]);
  const [imamMosqueRequestsLoading, setImamMosqueRequestsLoading] =
    useState(false);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });
  const [editModal, setEditModal] = useState({ open: false, imam: null });
  const [editMosqueRequestModal, setEditMosqueRequestModal] = useState({
    open: false,
    request: null,
  });
  const [denialModal, setDenialModal] = useState({
    open: false,
    request: null,
  });

  // Fetch imam requests on component mount
  useEffect(() => {
    dispatch(fetchImamRequests());
  }, [dispatch]);

  // Fetch imam mosque requests
  const fetchImamMosqueRequests = async () => {
    setImamMosqueRequestsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/imam-mosque-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setImamMosqueRequests(response.data);
    } catch (err) {
      console.error("Failed to fetch imam mosque requests:", err);
      toast.error("Failed to fetch imam mosque requests");
    } finally {
      setImamMosqueRequestsLoading(false);
    }
  };

  // Fetch mosque requests when tab changes to mosque requests
  useEffect(() => {
    if (tabValue === 1) {
      fetchImamMosqueRequests();
    }
  }, [tabValue]);

  // Handle mosque request approval
  const handleMosqueRequestApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${rootRoute}/imam-mosque-requests/${requestId}/approve`,
        { superadminResponse: "Request approved by superadmin" },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Mosque request approved successfully");
      fetchImamMosqueRequests(); // Refresh the list
    } catch (err) {
      console.error("Failed to approve mosque request:", err);
      toast.error(err.response?.data?.message || "Failed to approve request");
    }
  };

  // Handle mosque request denial
  const handleMosqueRequestDeny = async (requestId, denialReason) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${rootRoute}/imam-mosque-requests/${requestId}/deny`,
        { denialReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Mosque request denied successfully");
      fetchImamMosqueRequests(); // Refresh the list
    } catch (err) {
      console.error("Failed to deny mosque request:", err);
      toast.error(err.response?.data?.message || "Failed to deny request");
    }
  };

  // Handle mosque request edit (for changing status from any status)
  const handleMosqueRequestEdit = async ({
    status,
    superadminResponse,
    denialReason,
  }) => {
    const requestId = editMosqueRequestModal.request._id;

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `${rootRoute}/imam-mosque-requests/${requestId}`,
        { status, superadminResponse, denialReason },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success(`Request ${status} successfully`);
      fetchImamMosqueRequests(); // Refresh the list
    } catch (err) {
      console.error("Failed to update mosque request:", err);
      toast.error(err.response?.data?.message || "Failed to update request");
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle imam request approval
  const handleApprove = (imamId) => {
    const imam = imamRequests.find((req) => req.id === imamId);
    setConfirmDialog({
      open: true,
      title: "Approve Imam Request",
      message: `Are you sure you want to approve ${imam.name}'s request? They will be automatically assigned to their selected mosques.`,
      onConfirm: () => {
        dispatch(approveImamRequest({ imamId }));
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  // Handle imam request denial
  const handleDeny = (userId) => {
    const user = imamRequests.find((u) => u.id === userId);
    setConfirmDialog({
      open: true,
      title: "Deny Imam Request",
      message: `Are you sure you want to deny ${user.name}'s request?`,
      onConfirm: () => {
        dispatch(denyImamRequest({ imamId: userId }));
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  // Handle imam request edit
  const handleEdit = (userId) => {
    const user = imamRequests.find((u) => u.id === userId);
    setEditModal({ open: true, imam: user });
  };

  // Handle save edit
  const handleSaveEdit = async ({ status, deniedReason }) => {
    const userId = editModal.imam.id;
    if (status === "approved") {
      dispatch(approveImamRequest({ imamId: userId }));
    } else if (status === "denied") {
      dispatch(denyImamRequest({ imamId: userId, reason: deniedReason }));
    } else if (status === "pending") {
      dispatch(updateImamStatus({ imamId: userId, status: "pending" }));
    }
    setEditModal({ open: false, imam: null });
  };

  // Handle mosque request actions
  const handleMosqueRequestAction = (action, requestId) => {
    const request = imamMosqueRequests.find((req) => req._id === requestId);

    if (action === "accept") {
      setConfirmDialog({
        open: true,
        title: "Approve Mosque Request",
        message: `Are you sure you want to approve ${request.imamId.name}'s request to serve at ${request.mosqueId.name}?`,
        onConfirm: () => {
          handleMosqueRequestApprove(requestId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "deny") {
      if (request.status === "pending") {
        // For pending requests, open denial modal
        setDenialModal({ open: true, request });
      } else {
        // For non-pending requests, open edit modal
        setEditMosqueRequestModal({ open: true, request });
      }
    } else if (action === "edit") {
      setEditMosqueRequestModal({ open: true, request });
    }
  };

  // Handle success and error messages
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Statistics */}
      <SuperAdminHeader
        imamRequests={imamRequests}
        imamMosqueRequests={imamMosqueRequests}
        loading={loading || imamMosqueRequestsLoading}
      />

      {/* Tabs Navigation */}
      <SuperAdminTabs
        activeTab={tabValue}
        onTabChange={handleTabChange}
        imamRequests={imamRequests}
        imamMosqueRequests={imamMosqueRequests}
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading || imamMosqueRequestsLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Imam Requests Tab */}
            {tabValue === 0 && (
              <ImamRequestsTable
                requests={imamRequests}
                onApprove={handleApprove}
                onDeny={handleDeny}
                onEdit={handleEdit}
                loading={loading}
              />
            )}

            {/* Imam Mosque Requests Tab */}
            {tabValue === 1 && (
              <ImamMosqueRequestsTable
                requests={imamMosqueRequests}
                onApprove={(requestId) =>
                  handleMosqueRequestAction("accept", requestId)
                }
                onDeny={(requestId) =>
                  handleMosqueRequestAction("deny", requestId)
                }
                onEdit={(requestId) =>
                  handleMosqueRequestAction("edit", requestId)
                }
                loading={imamMosqueRequestsLoading}
              />
            )}

            {/* Mosque Management Tab */}
            {tabValue === 2 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Mosque Management
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Mosque management features coming soon. This tab will allow
                  you to:
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Add new mosques
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Edit existing mosque information
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                    Manage mosque administrators
                  </li>
                </ul>
              </div>
            )}

            {/* User Management Tab */}
            {tabValue === 3 && (
              <div className="bg-white shadow-sm rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  User Management
                </h3>
                <p className="text-sm text-gray-600">
                  User management features coming soon.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Edit Imam Status Modal */}
      <EditImamStatusModal
        open={editModal.open}
        imam={editModal.imam}
        onClose={() => setEditModal({ open: false, imam: null })}
        onSave={handleSaveEdit}
      />

      {/* Edit Mosque Request Modal */}
      <EditMosqueRequestModal
        open={editMosqueRequestModal.open}
        request={editMosqueRequestModal.request}
        onClose={() =>
          setEditMosqueRequestModal({ open: false, request: null })
        }
        onSave={handleMosqueRequestEdit}
      />

      {/* Denial Modal */}
      <DenialModal
        open={denialModal.open}
        request={denialModal.request}
        onClose={() => setDenialModal({ open: false, request: null })}
        onConfirm={(denialReason) => {
          if (denialModal.request) {
            handleMosqueRequestDeny(denialModal.request._id, denialReason);
          }
        }}
      />
    </div>
  );
};

export default SuperAdmin;
