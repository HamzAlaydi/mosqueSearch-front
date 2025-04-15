// components/common/ConfirmationDialog.jsx
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
  } from "@mui/material";
  
  const ConfirmationDialog = ({
    open,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmButtonProps = {},
    cancelButtonProps = {},
  }) => {
    return (
      <Dialog
        open={open}
        onClose={onCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Typography>{message}</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={onCancel}
            color="inherit"
            {...cancelButtonProps}
          >
            {cancelText}
          </Button>
          <Button 
            onClick={onConfirm} 
            color="primary" 
            variant="contained"
            {...confirmButtonProps}
          >
            {confirmText}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
  
  export default ConfirmationDialog;