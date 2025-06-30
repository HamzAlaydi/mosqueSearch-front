// pages/SuperAdmin.jsx
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast, Toaster } from "react-hot-toast";
import DataTable from "@/components/common/DataTable";
import ConfirmationModal from "@/components/common/ConfirmationModal";
import MosqueSelectionModal from "@/components/superadmin/MosqueSelectionModal";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
} from "@mui/material";
import { Edit, Check, Close, Mosque } from "@mui/icons-material";
import Spinner from "@/components/common/Spinner";
import {
  fetchImamRequests,
  approveImamRequest,
  denyImamRequest,
  clearError,
  clearSuccess,
} from "@/redux/superadmin/superAdminSlice";
import axios from "axios";
import { rootRoute } from "@/shared/constants/backendLink";

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`superadmin-tabpanel-${index}`}
      aria-labelledby={`superadmin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

const EditImamStatusModal = ({ open, onClose, imam, onSave }) => {
  const [status, setStatus] = useState(imam?.status || "pending");
  const [deniedReason, setDeniedReason] = useState(imam?.deniedReason || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({ status, deniedReason });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(imam?.status || "pending");
    setDeniedReason(imam?.deniedReason || "");
    onClose();
  };

  if (!open || !imam) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Imam Status</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Imam:</strong> {imam.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Email:</strong> {imam.email}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Current Status:</strong>{" "}
            {imam.status.charAt(0).toUpperCase() + imam.status.slice(1)}
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

        {status === "denied" && (
          <TextField
            fullWidth
            label="Denial Reason"
            value={deniedReason}
            onChange={(e) => setDeniedReason(e.target.value)}
            placeholder="Reason for denial"
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
        )}

        {status === "approved" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Imam will be automatically assigned to their selected mosques when
            approved.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || (status === "denied" && !deniedReason.trim())}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const EditMosqueRequestModal = ({ open, onClose, request, onSave }) => {
  const [status, setStatus] = useState(request?.status || "pending");
  const [superadminResponse, setSuperadminResponse] = useState(
    request?.superadminResponse || ""
  );
  const [denialReason, setDenialReason] = useState(request?.denialReason || "");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request) {
      setStatus(request.status || "pending");
      setSuperadminResponse(request.superadminResponse || "");
      setDenialReason(request.denialReason || "");
    }
  }, [request]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave({ status, superadminResponse, denialReason });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus(request?.status || "pending");
    setSuperadminResponse(request?.superadminResponse || "");
    setDenialReason(request?.denialReason || "");
    onClose();
  };

  if (!open || !request) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Mosque Request Status</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Imam:</strong> {request.imamId?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Email:</strong> {request.imamId?.email}
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            <strong>Mosque:</strong> {request.mosqueId?.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            <strong>Address:</strong> {request.mosqueId?.address}
          </Typography>
          <Chip
            label={`Current Status: ${
              request.status.charAt(0).toUpperCase() + request.status.slice(1)
            }`}
            color={
              request.status === "approved"
                ? "success"
                : request.status === "denied"
                ? "error"
                : "warning"
            }
            sx={{ mt: 1 }}
          />
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

        {status === "approved" && (
          <TextField
            fullWidth
            label="Approval Response"
            value={superadminResponse}
            onChange={(e) => setSuperadminResponse(e.target.value)}
            placeholder="Optional response to the imam"
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
        )}

        {status === "denied" && (
          <TextField
            fullWidth
            label="Denial Reason"
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder="Reason for denial"
            multiline
            rows={3}
            sx={{ mb: 2 }}
          />
        )}

        <Alert severity="info" sx={{ mb: 2 }}>
          {status === "approved"
            ? "Imam will be automatically assigned to this mosque when approved."
            : status === "denied"
            ? "The imam will be notified of the denial reason."
            : "Request will be set back to pending status."}
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={loading || (status === "denied" && !denialReason.trim())}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const SuperAdmin = () => {
  const dispatch = useDispatch();
  const { imamRequests, loading, error, success } = useSelector(
    (state) => state.superadmin
  );
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });
  const [editModal, setEditModal] = useState({ open: false, imam: null });
  const [editMosqueRequestModal, setEditMosqueRequestModal] = useState({
    open: false,
    request: null,
  });

  // New state for imam mosque requests
  const [imamMosqueRequests, setImamMosqueRequests] = useState([]);
  const [imamMosqueRequestsLoading, setImamMosqueRequestsLoading] =
    useState(false);

  useEffect(() => {
    dispatch(fetchImamRequests());
    fetchImamMosqueRequests();
  }, [dispatch]);

  // Fetch imam mosque requests
  const fetchImamMosqueRequests = async () => {
    setImamMosqueRequestsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${rootRoute}/imam-mosque-requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setImamMosqueRequests(response.data);
    } catch (error) {
      console.error("Error fetching imam mosque requests:", error);
      toast.error("Failed to load imam mosque requests");
    } finally {
      setImamMosqueRequestsLoading(false);
    }
  };

  // Handle imam mosque request approval
  const handleMosqueRequestApprove = async (requestId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${rootRoute}/imam-mosque-requests/${requestId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Request approved successfully");
      fetchImamMosqueRequests(); // Refresh the list
    } catch (error) {
      console.error("Error approving request:", error);
      toast.error(error.response?.data?.message || "Failed to approve request");
    }
  };

  // Handle imam mosque request denial
  const handleMosqueRequestDeny = async (requestId, denialReason) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${rootRoute}/imam-mosque-requests/${requestId}/deny`,
        { denialReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Request denied successfully");
      fetchImamMosqueRequests(); // Refresh the list
    } catch (error) {
      console.error("Error denying request:", error);
      toast.error(error.response?.data?.message || "Failed to deny request");
    }
  };

  // Handle imam mosque request edit
  const handleMosqueRequestEdit = async ({
    status,
    superadminResponse,
    denialReason,
  }) => {
    const requestId = editMosqueRequestModal.request._id;

    try {
      if (status === "approved") {
        await handleMosqueRequestApprove(requestId);
      } else if (status === "denied") {
        await handleMosqueRequestDeny(requestId, denialReason);
      }
      setEditMosqueRequestModal({ open: false, request: null });
    } catch (error) {
      console.error("Error updating request:", error);
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

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

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

  const handleDeny = (userId) => {
    const user = imamRequests.find((u) => u.id === userId);
    setConfirmDialog({
      open: true,
      title: "Deny Imam Request",
      message: `Are you sure you want to deny ${user.name}'s request?`,
      onConfirm: () => {
        dispatch(denyImamRequest({ userId }));
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleEdit = (userId) => {
    const user = imamRequests.find((u) => u.id === userId);
    setEditModal({ open: true, imam: user });
  };

  const handleSaveEdit = async ({ status, deniedReason }) => {
    const userId = editModal.imam.id;
    if (status === "approved") {
      dispatch(approveImamRequest({ imamId: userId }));
    } else if (status === "denied") {
      dispatch(denyImamRequest({ userId, deniedReason }));
    }
    setEditModal({ open: false, imam: null });
  };

  const openConfirmDialog = (action, userId) => {
    if (action === "accept") {
      handleApprove(userId);
    } else if (action === "deny") {
      handleDeny(userId);
    } else if (action === "edit") {
      handleEdit(userId);
    }
  };

  const openMosqueRequestConfirmDialog = (action, requestId) => {
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
      setConfirmDialog({
        open: true,
        title: "Deny Mosque Request",
        message: `Are you sure you want to deny ${request.imamId.name}'s request to serve at ${request.mosqueId.name}?`,
        onConfirm: () => {
          // For denial, we'll use the edit modal to get the reason
          setEditMosqueRequestModal({ open: true, request });
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "edit") {
      setEditMosqueRequestModal({ open: true, request });
    }
  };

  const imamRequestColumns = [
    {
      id: "name",
      label: "Imam",
      width: "150px",
      render: (row) => (
        <DataTable.Avatar src={row.profilePicture} name={row.name} />
      ),
    },
    { id: "email", label: "Email", width: "180px" },
    { id: "phone", label: "Phone", width: "120px" },
    { id: "mosqueName", label: "Mosque", width: "150px" },
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
          title={row.address}
        >
          {row.address}
        </Box>
      ),
    },
    {
      id: "message",
      label: "Message",
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
      width: "100px",
      align: "right",
      render: (row) => (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
          {row.status === "pending" ? (
            <>
              <IconButton
                size="small"
                color="success"
                onClick={() => openConfirmDialog("accept", row.id)}
                sx={{ p: 0.5 }}
              >
                <Check fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => openConfirmDialog("deny", row.id)}
                sx={{ p: 0.5 }}
              >
                <Close fontSize="small" />
              </IconButton>
            </>
          ) : (
            <IconButton
              size="small"
              color="primary"
              onClick={() => openConfirmDialog("edit", row.id)}
              sx={{ p: 0.5 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

  const imamMosqueRequestColumns = [
    {
      id: "imamName",
      label: "Imam",
      width: "150px",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <DataTable.Avatar
            src={row.imamId?.profilePicture}
            name={row.imamId?.name}
          />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {row.imamId?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {row.imamId?.email}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "mosqueName",
      label: "Mosque",
      width: "180px",
      render: (row) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Mosque sx={{ color: "primary.main", fontSize: 20 }} />
          <Box>
            <Typography variant="body2" fontWeight="bold">
              {row.mosqueId?.name}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {row.mosqueId?.address}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "message",
      label: "Request Message",
      width: "200px",
      render: (row) => (
        <Box
          sx={{
            maxWidth: "200px",
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
      id: "createdAt",
      label: "Requested",
      width: "120px",
      render: (row) => (
        <Typography variant="body2">
          {new Date(row.createdAt).toLocaleDateString()}
        </Typography>
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
              <IconButton
                size="small"
                color="success"
                onClick={() =>
                  openMosqueRequestConfirmDialog("accept", row._id)
                }
                sx={{ p: 0.5 }}
              >
                <Check fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => openMosqueRequestConfirmDialog("deny", row._id)}
                sx={{ p: 0.5 }}
              >
                <Close fontSize="small" />
              </IconButton>
            </>
          ) : (
            <IconButton
              size="small"
              color="primary"
              onClick={() => openMosqueRequestConfirmDialog("edit", row._id)}
              sx={{ p: 0.5 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>
      ),
    },
  ];

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
          {loading || imamMosqueRequestsLoading ? (
            <Spinner />
          ) : (
            <>
              {/* Tabs and Content */}
              <Paper sx={{ p: 2, mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="superadmin-tabs"
                >
                  <Tab label="Imam Requests" />
                  <Tab label="Imam Mosque Requests" />
                  <Tab label="Mosque Management" />
                  <Tab label="User Management" />
                </Tabs>
                <Divider sx={{ my: 2 }} />

                <TabPanel value={tabValue} index={0}>
                  {imamRequests.length === 0 ? (
                    <Alert severity="info">
                      No imam requests found. All requests have been processed
                      or no new requests are pending.
                    </Alert>
                  ) : (
                    <DataTable
                      columns={imamRequestColumns}
                      data={imamRequests}
                      searchFields={["name", "email", "mosqueName"]}
                      searchPlaceholder="Search by name, email, mosque..."
                      initialRowsPerPage={5}
                      noDataMessage="No imam requests found"
                    />
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  {imamMosqueRequests.length === 0 ? (
                    <Alert severity="info">
                      No imam mosque requests found. All requests have been
                      processed or no new requests are pending.
                    </Alert>
                  ) : (
                    <DataTable
                      columns={imamMosqueRequestColumns}
                      data={imamMosqueRequests}
                      searchFields={[
                        "imamId.name",
                        "imamId.email",
                        "mosqueId.name",
                      ]}
                      searchPlaceholder="Search by imam name, email, mosque..."
                      initialRowsPerPage={10}
                      noDataMessage="No imam mosque requests found"
                    />
                  )}
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Mosque Management
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Mosque management features coming soon. This tab will allow
                    you to:
                  </Typography>
                  <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Add new mosques
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Edit existing mosque information
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Manage mosque administrators
                      </Typography>
                    </li>
                  </ul>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    User Management
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    User management features coming soon.
                  </Typography>
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

      <Toaster position="top-right" />
    </div>
  );
};

export default SuperAdmin;
