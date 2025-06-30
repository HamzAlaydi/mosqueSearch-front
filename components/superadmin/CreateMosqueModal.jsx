import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Alert,
} from "@mui/material";
import { rootRoute } from "@/shared/constants/backendLink";

const CreateMosqueModal = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${rootRoute}/mosques`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          address: formData.address,
          location: {
            type: "Point",
            coordinates: [
              parseFloat(formData.longitude),
              parseFloat(formData.latitude),
            ],
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create mosque");
      }

      const data = await response.json();
      onSuccess(data);
      handleClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: "",
      address: "",
      latitude: "",
      longitude: "",
    });
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Mosque</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            name="name"
            label="Mosque Name"
            value={formData.name}
            onChange={handleChange}
            fullWidth
            required
            sx={{ mb: 2 }}
          />

          <TextField
            name="address"
            label="Address"
            value={formData.address}
            onChange={handleChange}
            fullWidth
            required
            multiline
            rows={2}
            sx={{ mb: 2 }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              name="latitude"
              label="Latitude"
              type="number"
              value={formData.latitude}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ step: "any" }}
            />
            <TextField
              name="longitude"
              label="Longitude"
              type="number"
              value={formData.longitude}
              onChange={handleChange}
              fullWidth
              required
              inputProps={{ step: "any" }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              loading ||
              !formData.name ||
              !formData.address ||
              !formData.latitude ||
              !formData.longitude
            }
          >
            {loading ? "Creating..." : "Create Mosque"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CreateMosqueModal;
