// pages/ImamDashboard.jsx
"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import DataTable from "@/components/common/DataTable";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Edit, Check, Close } from "@mui/icons-material";
import Spinner from "@/components/common/Spinner";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`imam-tabpanel-${index}`}
      aria-labelledby={`imam-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const EditResponseModal = ({ open, onClose, request, onSave }) => {
  const [status, setStatus] = useState(request?.status || "pending");
  const [response, setResponse] = useState(request?.imamResponse || "");
  const [denialReason, setDenialReason] = useState(request?.denialReason || "");
  const [loading, setLoading] = useState(false);

  // Reset form when request changes
  useEffect(() => {
    if (request) {
      setStatus(request.status || "pending");
      setResponse(request.imamResponse || "");
      setDenialReason(request.denialReason || "");
    }
  }, [request]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({ status, response, denialReason });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(request?.status || "pending");
    setResponse(request?.imamResponse || "");
    setDenialReason(request?.denialReason || "");
    onClose();
  };

  if (!open || !request) return null;

  const isApproved = status === "approved";
  const isDenied = status === "denied";
  const isPending = status === "pending";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Request Status & Response</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>User:</strong> {request.user.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Email:</strong> {request.user.email}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Mosque:</strong> {request.mosque.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Current Status:</strong>{" "}
            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="status-select-label">New Status</InputLabel>
          <Select
            labelId="status-select-label"
            value={status}
            label="New Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="denied">Denied</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        {isApproved && (
          <TextField
            fullWidth
            label="Approval Response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Enter your approval response..."
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
        )}

        {isDenied && (
          <TextField
            fullWidth
            label="Denial Reason"
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder="Enter reason for denial..."
            multiline
            rows={4}
            sx={{ mb: 2 }}
          />
        )}

        {isPending && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Setting status to pending will require the user to wait for your
            review again.
          </Alert>
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          {isApproved
            ? "This response will be visible to the user and can be updated at any time."
            : isDenied
            ? "This reason will be visible to the user and can be updated at any time."
            : "The request will be set back to pending status."}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={
            loading ||
            (isApproved && !response.trim()) ||
            (isDenied && !denialReason.trim())
          }
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ImamDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [editModal, setEditModal] = useState({ open: false, request: null });

  useEffect(() => {
    fetchAttachmentRequests();
  }, []);

  const fetchAttachmentRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      console.log(
        "Fetching attachment requests with token:",
        token ? "Token exists" : "No token"
      );

      const response = await axios.get(
        `${rootRoute}/mosque-attachments/imam-requests`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Fetched attachment requests:", response.data);
      console.log("Number of requests:", response.data.length);

      if (response.data.length > 0) {
        console.log("First request structure:", response.data[0]);
        console.log("First request ID:", response.data[0].id);
      }

      setRequests(response.data);
    } catch (error) {
      console.error("Error loading attachment requests:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to load attachment requests"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAccept = async (requestId) => {
    console.log("handleAccept called with requestId:", requestId);
    try {
      const token = localStorage.getItem("token");
      console.log(
        "Making approval request to:",
        `${rootRoute}/mosque-attachments/${requestId}/approve`
      );

      const response = await axios.post(
        `${rootRoute}/mosque-attachments/${requestId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Approval response:", response.data);

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId
            ? { ...request, status: "approved" }
            : request
        )
      );

      toast.success("User verification approved successfully!");
    } catch (error) {
      console.error("Error approving request:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to approve verification"
      );
    }
  };

  const handleDeny = async (requestId) => {
    console.log("handleDeny called with requestId:", requestId);
    try {
      const token = localStorage.getItem("token");
      console.log(
        "Making denial request to:",
        `${rootRoute}/mosque-attachments/${requestId}/deny`
      );

      const response = await axios.post(
        `${rootRoute}/mosque-attachments/${requestId}/deny`,
        {
          denialReason: "Verification denied by imam",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Denial response:", response.data);

      // Update local state
      setRequests((prevRequests) =>
        prevRequests.map((request) =>
          request.id === requestId ? { ...request, status: "denied" } : request
        )
      );

      toast.success("User verification denied");
    } catch (error) {
      console.error("Error denying request:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
        error.response?.data?.message || "Failed to deny verification"
      );
    }
  };

  const handleEdit = (requestId) => {
    console.log("handleEdit called with requestId:", requestId);
    const request = requests.find((r) => r.id === requestId);

    if (!request) {
      toast.error("Request not found");
      return;
    }

    // For approved or denied requests, open the edit modal
    if (request.status === "approved" || request.status === "denied") {
      setEditModal({ open: true, request });
    } else {
      // For pending requests, show current status
      toast.info(
        `Request is currently ${request.status}. No edits allowed for pending requests.`
      );
    }
  };

  const handleSaveEdit = async ({ status, response, denialReason }) => {
    const requestId = editModal.request.id;
    const request = editModal.request;

    try {
      const token = localStorage.getItem("token");

      if (status === "approved") {
        // Update to approved status
        const apiResponse = await axios.put(
          `${rootRoute}/mosque-attachments/${requestId}/update-response`,
          {
            imamResponse: response.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update local state
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "approved",
                  imamResponse: response.trim(),
                  denialReason: null, // Clear denial reason when approved
                }
              : req
          )
        );

        toast.success("Request approved successfully!");
      } else if (status === "denied") {
        // Update to denied status
        const apiResponse = await axios.put(
          `${rootRoute}/mosque-attachments/${requestId}/update-denial`,
          {
            denialReason: denialReason.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update local state
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "denied",
                  denialReason: denialReason.trim(),
                  imamResponse: null, // Clear approval response when denied
                }
              : req
          )
        );

        toast.success("Request denied successfully!");
      } else if (status === "pending") {
        // Reset to pending status
        const apiResponse = await axios.put(
          `${rootRoute}/mosque-attachments/${requestId}/reset-to-pending`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Update local state
        setRequests((prevRequests) =>
          prevRequests.map((req) =>
            req.id === requestId
              ? {
                  ...req,
                  status: "pending",
                  imamResponse: null,
                  denialReason: null,
                  reviewedAt: null,
                }
              : req
          )
        );

        toast.success("Request reset to pending status!");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(error.response?.data?.message || "Failed to update request");
    }
  };

  const openConfirmDialog = (action, requestId) => {
    console.log(
      "openConfirmDialog called with action:",
      action,
      "requestId:",
      requestId
    );
    const request = requests.find((r) => r.id === requestId);
    console.log("Found request:", request);

    if (action === "accept") {
      setConfirmDialog({
        open: true,
        title: "Approve Verification Request",
        message: `Are you sure you want to verify ${request.user.name} for ${request.mosque.name}?`,
        onConfirm: () => {
          console.log("Confirming approval for requestId:", requestId);
          handleAccept(requestId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "deny") {
      setConfirmDialog({
        open: true,
        title: "Deny Verification Request",
        message: `Are you sure you want to deny verification for ${request.user.name} at ${request.mosque.name}?`,
        onConfirm: () => {
          console.log("Confirming denial for requestId:", requestId);
          handleDeny(requestId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "edit") {
      // For edit actions, directly call handleEdit without confirmation modal
      console.log("Directly calling handleEdit for requestId:", requestId);
      handleEdit(requestId);
    }
  };

  const attachmentRequestColumns = [
    {
      id: "name",
      label: "User",
      width: "150px",
      render: (row) => (
        <DataTable.Avatar src={row.user.profilePicture} name={row.user.name} />
      ),
    },
    {
      id: "email",
      label: "Email",
      width: "180px",
      render: (row) => row.user.email,
    },
    {
      id: "phone",
      label: "Phone",
      width: "120px",
      render: (row) => row.user.phone,
    },
    {
      id: "mosqueName",
      label: "Mosque",
      width: "150px",
      render: (row) => row.mosque.name,
    },
    {
      id: "address",
      label: "Address",
      width: "150px",
      render: (row) => (
        <Box
          sx={{
            maxWidth: "150px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: "0.875rem",
          }}
          title={row.mosque.address}
        >
          {row.mosque.address}
        </Box>
      ),
    },
    {
      id: "message",
      label: "Verification Message",
      width: "150px",
      render: (row) => (
        <Box
          sx={{
            maxWidth: "150px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            "&:hover": {
              whiteSpace: "normal",
              overflow: "visible",
              position: "absolute",
              zIndex: 1,
              backgroundColor: "background.paper",
              boxShadow: 2,
              padding: 1,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            },
          }}
          title={row.message}
        >
          {row.message}
        </Box>
      ),
    },
    {
      id: "imamResponse",
      label: "Imam Response",
      width: "150px",
      render: (row) => {
        if (row.status === "approved" && row.imamResponse) {
          return (
            <Box
              sx={{
                maxWidth: "150px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "success.main",
                "&:hover": {
                  whiteSpace: "normal",
                  overflow: "visible",
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: "background.paper",
                  boxShadow: 2,
                  padding: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                },
              }}
              title={row.imamResponse}
            >
              {row.imamResponse}
            </Box>
          );
        } else if (row.status === "denied" && row.denialReason) {
          return (
            <Box
              sx={{
                maxWidth: "150px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                color: "error.main",
                "&:hover": {
                  whiteSpace: "normal",
                  overflow: "visible",
                  position: "absolute",
                  zIndex: 1,
                  backgroundColor: "background.paper",
                  boxShadow: 2,
                  padding: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                },
              }}
              title={row.denialReason}
            >
              {row.denialReason}
            </Box>
          );
        }
        return "—";
      },
    },
    {
      id: "status",
      label: "Status",
      width: "100px",
      render: (row) => (
        <DataTable.StatusChip
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          status={row.status}
        />
      ),
    },
    {
      id: "actions",
      label: "Actions",
      width: "120px",
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          {row.status === "pending" ? (
            <>
              <Tooltip title="Approve verification">
                <IconButton
                  size="small"
                  color="success"
                  onClick={() => openConfirmDialog("accept", row.id)}
                  sx={{ p: 0.5 }}
                >
                  <Check fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Deny verification">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => openConfirmDialog("deny", row.id)}
                  sx={{ p: 0.5 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </>
          ) : row.status === "approved" ? (
            <Tooltip title="Edit approval response">
              <IconButton
                size="small"
                color="primary"
                onClick={() => openConfirmDialog("edit", row.id)}
                sx={{ p: 0.5 }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : row.status === "denied" ? (
            <Tooltip title="Edit denial reason">
              <IconButton
                size="small"
                color="warning"
                onClick={() => openConfirmDialog("edit", row.id)}
                sx={{ p: 0.5 }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : null}
        </Box>
      ),
    },
  ];

  // Filter requests based on tab
  const getFilteredRequests = () => {
    switch (tabValue) {
      case 0: // All
        return requests;
      case 1: // Pending
        return requests.filter((req) => req.status === "pending");
      case 2: // Approved
        return requests.filter((req) => req.status === "approved");
      case 3: // Denied
        return requests.filter((req) => req.status === "denied");
      default:
        return requests;
    }
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Added a styles block to ensure proper spacing */}
      <style jsx>{`
        .admin-container {
          padding-top: 80px; /* Adjust this value based on your navbar height */
        }
        @media (max-width: 768px) {
          .admin-container {
            padding-top: 64px; /* Smaller padding for mobile */
          }
        }
      `}</style>

      <div className="admin-container">
        <div className="container mx-auto px-4 pb-6">
          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Imam Dashboard
                </h1>
                <p className="text-gray-600">
                  Manage verification requests from community members who want
                  to join your mosques
                </p>
              </div>

              {/* Tabs and Content */}
              <Paper sx={{ p: 2, mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="imam-tabs"
                >
                  <Tab label="All Requests" />
                  <Tab label="Pending" />
                  <Tab label="Approved" />
                  <Tab label="Denied" />
                </Tabs>
                <Divider sx={{ my: 2 }} />

                <TabPanel value={tabValue} index={0}>
                  {getFilteredRequests().length === 0 ? (
                    <Alert severity="info">
                      No verification requests found. Community members will
                      appear here when they request to join your mosques.
                    </Alert>
                  ) : (
                    <DataTable
                      columns={attachmentRequestColumns}
                      data={getFilteredRequests()}
                      searchFields={["user.name", "user.email", "mosque.name"]}
                      searchPlaceholder="Search by user name, email, mosque..."
                      initialRowsPerPage={5}
                      noDataMessage="No verification requests found"
                    />
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {getFilteredRequests().length === 0 ? (
                    <Alert severity="info">
                      No pending verification requests. All requests have been
                      processed.
                    </Alert>
                  ) : (
                    <DataTable
                      columns={attachmentRequestColumns}
                      data={getFilteredRequests()}
                      searchFields={["user.name", "user.email", "mosque.name"]}
                      searchPlaceholder="Search by user name, email, mosque..."
                      initialRowsPerPage={5}
                      noDataMessage="No pending verification requests found"
                    />
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  {getFilteredRequests().length === 0 ? (
                    <Alert severity="info">
                      No approved verification requests found.
                    </Alert>
                  ) : (
                    <DataTable
                      columns={attachmentRequestColumns}
                      data={getFilteredRequests()}
                      searchFields={["user.name", "user.email", "mosque.name"]}
                      searchPlaceholder="Search by user name, email, mosque..."
                      initialRowsPerPage={5}
                      noDataMessage="No approved verification requests found"
                    />
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  {getFilteredRequests().length === 0 ? (
                    <Alert severity="info">
                      No denied verification requests found.
                    </Alert>
                  ) : (
                    <DataTable
                      columns={attachmentRequestColumns}
                      data={getFilteredRequests()}
                      searchFields={["user.name", "user.email", "mosque.name"]}
                      searchPlaceholder="Search by user name, email, mosque..."
                      initialRowsPerPage={5}
                      noDataMessage="No denied verification requests found"
                    />
                  )}
                </TabPanel>
              </Paper>
            </>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Edit Response Modal */}
      <EditResponseModal
        open={editModal.open}
        request={editModal.request}
        onClose={() => setEditModal({ open: false, request: null })}
        onSave={handleSaveEdit}
      />

      <Toaster position="top-right" />
    </div>
  );
};

export default ImamDashboard;
