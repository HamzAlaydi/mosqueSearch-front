import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Divider,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchMosquesForAssignment } from "@/redux/superadmin/superAdminSlice";
import CreateMosqueModal from "./CreateMosqueModal";

const MosqueSelectionModal = ({ open, onClose, onConfirm, imamData }) => {
  const dispatch = useDispatch();
  const { mosques, loading } = useSelector((state) => state.superadmin);
  const [selectedMosqueId, setSelectedMosqueId] = useState("");
  const [error, setError] = useState("");
  const [showCreateMosque, setShowCreateMosque] = useState(false);

  useEffect(() => {
    if (open) {
      dispatch(fetchMosquesForAssignment());
    }
  }, [open, dispatch]);

  const handleConfirm = () => {
    if (!selectedMosqueId) {
      setError("Please select a mosque");
      return;
    }
    onConfirm(selectedMosqueId);
    setSelectedMosqueId("");
    setError("");
  };

  const handleClose = () => {
    setSelectedMosqueId("");
    setError("");
    onClose();
  };

  const handleMosqueCreated = (newMosque) => {
    // Refresh the mosques list
    dispatch(fetchMosquesForAssignment());
    // Optionally auto-select the newly created mosque
    setSelectedMosqueId(newMosque._id);
    setShowCreateMosque(false);
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Imam to Mosque</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              <strong>Imam:</strong> {imamData?.name}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Email:</strong> {imamData?.email}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <strong>Phone:</strong> {imamData?.phone}
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <FormControl fullWidth>
            <InputLabel id="mosque-select-label">Select Mosque</InputLabel>
            <Select
              labelId="mosque-select-label"
              value={selectedMosqueId}
              label="Select Mosque"
              onChange={(e) => setSelectedMosqueId(e.target.value)}
              disabled={loading}
            >
              {mosques.map((mosque) => (
                <MenuItem key={mosque.id} value={mosque.id}>
                  <Box>
                    <Typography variant="body1">{mosque.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {mosque.address} • {mosque.imamCount} imam(s)
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {mosques.length === 0 && !loading && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No mosques available. Please create a mosque first.
            </Alert>
          )}

          <Divider sx={{ my: 2 }} />

          <Box sx={{ textAlign: "center" }}>
            <Button
              variant="outlined"
              onClick={() => setShowCreateMosque(true)}
              sx={{ mb: 1 }}
            >
              Create New Mosque
            </Button>
            <Typography variant="caption" color="textSecondary" display="block">
              Can't find the right mosque? Create a new one.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            color="primary"
            disabled={!selectedMosqueId || loading}
          >
            Assign Imam
          </Button>
        </DialogActions>
      </Dialog>

      <CreateMosqueModal
        open={showCreateMosque}
        onClose={() => setShowCreateMosque(false)}
        onSuccess={handleMosqueCreated}
      />
    </>
  );
};

export default MosqueSelectionModal;
