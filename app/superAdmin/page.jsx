// pages/SuperAdmin.jsx
"use client";

import { useState, useEffect } from "react";
import { adminUsers } from "@/shared/constants/adminUsers";
import { toast, Toaster } from "react-hot-toast";
import DataTable from "@/components/common/DataTable";
import ConfirmationDialog from "@/components/common/ConfirmationModal";
import {
  Paper,
  Box,
  Typography,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Edit, Check, Close } from "@mui/icons-material";
import Spinner from "@/components/common/Spinner";

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

const SuperAdmin = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    // Simulate loading data from API
    const loadUsers = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setUsers(adminUsers);
      } catch (error) {
        console.error("Error loading users:", error);
        toast.error("Failed to load imam requests");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAccept = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: "approved" } : user
      )
    );
    toast.success("Imam request approved successfully!");
  };

  const handleDeny = (userId) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, status: "denied" } : user
      )
    );
    toast.error("Imam request denied");
  };

  const handleEdit = (userId) => {
    // Implement edit functionality
    toast.info(`Edit imam with ID: ${userId}`);
  };

  const openConfirmDialog = (action, userId) => {
    const user = users.find((u) => u.id === userId);
    if (action === "accept") {
      setConfirmDialog({
        open: true,
        title: "Approve Imam Request",
        message: `Are you sure you want to approve ${user.name}'s request for ${user.mosqueName}?`,
        onConfirm: () => {
          handleAccept(userId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "deny") {
      setConfirmDialog({
        open: true,
        title: "Deny Imam Request",
        message: `Are you sure you want to deny ${user.name}'s request for ${user.mosqueName}?`,
        onConfirm: () => {
          handleDeny(userId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "edit") {
      handleEdit(userId);
    }
  };

  const imamRequestColumns = [
    {
      id: "name",
      label: "Imam",
      render: (row) => (
        <DataTable.Avatar src={row.profilePicture} name={row.name} />
      ),
    },
    { id: "email", label: "Email" },
    { id: "phone", label: "Phone" },
    { id: "mosqueName", label: "Mosque" },
    { id: "address", label: "Address", width: "200px" },
    {
      id: "message",
      label: "Message",
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
                  <DataTable
                    columns={imamRequestColumns}
                    data={users}
                    searchFields={["name", "email", "mosqueName"]}
                    searchPlaceholder="Search by name, email, mosque..."
                    initialRowsPerPage={5}
                    noDataMessage="No imam requests found"
                  />
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
          <ConfirmationDialog
            open={confirmDialog.open}
            title={confirmDialog.title}
            message={confirmDialog.message}
            onConfirm={confirmDialog.onConfirm}
            onCancel={() => setConfirmDialog({ ...confirmDialog, open: false })}
          />
        </div>
        <Toaster position="top-right" />
      </div>
    </div>
  );
};

export default SuperAdmin;
