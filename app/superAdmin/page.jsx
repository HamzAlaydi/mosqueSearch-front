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
} from "@mui/material";
import { Edit, Check, Close } from "@mui/icons-material";
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

  useEffect(() => {
    dispatch(fetchImamRequests());
  }, [dispatch]);

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
        dispatch(
          denyImamRequest({
            imamId: userId,
            reason: "Request denied by super admin",
          })
        );
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      },
    });
  };

  const handleEdit = (userId) => {
    const imam = imamRequests.find((u) => u.id === userId);
    setEditModal({ open: true, imam });
  };

  const handleSaveEdit = async ({ status, deniedReason }) => {
    const imamId = editModal.imam.id;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `${rootRoute}/superadmin/imam-status/${imamId}`,
        {
          status,
          deniedReason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Imam status updated");
      dispatch(fetchImamRequests());
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to update imam status"
      );
    }
  };

  const openConfirmDialog = (action, userId) => {
    const user = imamRequests.find((u) => u.id === userId);
    if (action === "accept") {
      handleApprove(userId);
    } else if (action === "deny") {
      handleDeny(userId);
    } else if (action === "edit") {
      handleEdit(userId);
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
              {/* Tabs and Content */}
              <Paper sx={{ p: 2, mb: 4 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="superadmin-tabs"
                >
                  <Tab label="Imam Requests" />
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

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    User Management
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    User management features coming soon. This tab will allow
                    you to:
                  </Typography>
                  <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        View all registered users
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Manage user roles and permissions
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Reset user passwords
                      </Typography>
                    </li>
                  </ul>
                </TabPanel>
              </Paper>
            </>
          )}

          {/* Confirmation Dialog */}
          <ConfirmationModal
            isOpen={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onClose={() => setConfirmDialog({ ...confirmDialog, open: false })}
          />

          <EditImamStatusModal
            open={editModal.open}
            imam={editModal.imam}
            onClose={() => setEditModal({ open: false, imam: null })}
            onSave={handleSaveEdit}
          />
        </div>
      </div>
    </div>
  );
};

export default SuperAdmin;
