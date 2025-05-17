// pages/ImamDashboard.jsx
"use client";

import { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import DataTable from "@/components/common/DataTable";
import ConfirmationDialog from "@/components/common/ConfirmationDialog";
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

// Sample data for mosque attachment requests
const attachmentRequests = [
  {
    id: 1,
    name: "Ahmed Khan",
    email: "ahmed.khan@example.com",
    phone: "+1 (555) 123-4567",
    mosqueName: "Al-Noor Islamic Center",
    address: "123 Main Street, New York, NY 10001",
    message:
      "I recently moved to this area and would like to join the mosque community for regular prayers and events.",
    status: "pending",
    profilePicture: "/images/avatars/ahmed.jpg",
  },
  {
    id: 2,
    name: "Omar Farooq",
    email: "omar.f@example.com",
    phone: "+1 (555) 987-6543",
    mosqueName: "Islamic Cultural Center",
    address: "456 Park Avenue, Brooklyn, NY 11201",
    message:
      "I'm interested in volunteering for community service activities and attending Friday prayers regularly.",
    status: "approved",
    profilePicture: "/images/avatars/omar.jpg",
  },
  {
    id: 3,
    name: "Ibrahim Ali",
    email: "ibrahim.ali@example.com",
    phone: "+1 (555) 456-7890",
    mosqueName: "Masjid Manhattan",
    address: "789 Broadway, Queens, NY 11355",
    message:
      "Looking to join the mosque to participate in educational programs and bring my kids to weekend school.",
    status: "denied",
    profilePicture: "/images/avatars/ibrahim.jpg",
  },
  {
    id: 4,
    name: "Yusuf Rahman",
    email: "yusuf.r@example.com",
    phone: "+1 (555) 234-5678",
    mosqueName: "Al-Noor Islamic Center",
    address: "321 Oak Street, Bronx, NY 10452",
    message:
      "I would like to attend daily prayers and join the Quran study circle. I can also help with IT support if needed.",
    status: "pending",
    profilePicture: "/images/avatars/yusuf.jpg",
  },
  {
    id: 5,
    name: "Bilal Hassan",
    email: "bilal.h@example.com",
    phone: "+1 (555) 345-6789",
    mosqueName: "Islamic Cultural Center",
    address: "567 Elm Avenue, Staten Island, NY 10301",
    message:
      "New to the area and looking for a spiritual community. I'd like to join for prayers and community events.",
    status: "pending",
    profilePicture: "/images/avatars/bilal.jpg",
  },
];

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

  useEffect(() => {
    // Simulate loading data from API
    const loadRequests = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setRequests(attachmentRequests);
      } catch (error) {
        console.error("Error loading attachment requests:", error);
        toast.error("Failed to load attachment requests");
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleAccept = (requestId) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, status: "approved" } : request
      )
    );
    toast.success("Attachment request approved successfully!");
  };

  const handleDeny = (requestId) => {
    setRequests((prevRequests) =>
      prevRequests.map((request) =>
        request.id === requestId ? { ...request, status: "denied" } : request
      )
    );
    toast.error("Attachment request denied");
  };

  const handleEdit = (requestId) => {
    // Implement edit functionality
    toast.info(`Edit attachment request with ID: ${requestId}`);
  };

  const openConfirmDialog = (action, requestId) => {
    const request = requests.find((r) => r.id === requestId);
    if (action === "accept") {
      setConfirmDialog({
        open: true,
        title: "Approve Attachment Request",
        message: `Are you sure you want to approve ${request.name}'s request to be attached to ${request.mosqueName}?`,
        onConfirm: () => {
          handleAccept(requestId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "deny") {
      setConfirmDialog({
        open: true,
        title: "Deny Attachment Request",
        message: `Are you sure you want to deny ${request.name}'s request to be attached to ${request.mosqueName}?`,
        onConfirm: () => {
          handleDeny(requestId);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        },
      });
    } else if (action === "edit") {
      handleEdit(requestId);
    }
  };

  const attachmentRequestColumns = [
    {
      id: "name",
      label: "User",
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
        .imam-container {
          padding-top: 80px; /* Adjust this value based on your navbar height */
        }
        @media (max-width: 768px) {
          .imam-container {
            padding-top: 64px; /* Smaller padding for mobile */
          }
        }
      `}</style>

      <div className="imam-container">
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
                  aria-label="imam-tabs"
                >
                  <Tab label="Mosque Attachment Requests" />
                  <Tab label="Approved Members" />
                  <Tab label="Community Management" />
                </Tabs>
                <Divider sx={{ my: 2 }} />

                <TabPanel value={tabValue} index={0}>
                  <DataTable
                    columns={attachmentRequestColumns}
                    data={requests}
                    searchFields={["name", "email", "mosqueName"]}
                    searchPlaceholder="Search by name, email, mosque..."
                    initialRowsPerPage={5}
                    noDataMessage="No attachment requests found"
                  />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Approved Members
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    View and manage members who have been approved for mosque
                    attachment.
                  </Typography>
                  <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Monitor member attendance
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Assign roles and responsibilities
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Send community announcements
                      </Typography>
                    </li>
                  </ul>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Community Management
                  </Typography>
                  <Typography variant="body1" color="textSecondary">
                    Community management features coming soon. This tab will
                    allow you to:
                  </Typography>
                  <ul style={{ marginTop: 8, paddingLeft: 24 }}>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Organize community events
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Manage donations and volunteers
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body1" color="textSecondary">
                        Schedule educational programs
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

export default ImamDashboard;
