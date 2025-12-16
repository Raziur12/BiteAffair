import React, { useCallback, memo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

// Hoisted static styles
const PAPER_SX = { borderRadius: 2, p: 2 };

const OrderSuccessModal = ({ open, onClose }) => {
  const handleClose = useCallback(() => onClose && onClose(), [onClose]);
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: PAPER_SX
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: 4 }}>
        {/* Success Icon */}
        <Box sx={{ mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: '#ff6b35',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
          </Box>
        </Box>

        {/* Success Message */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
          Thank you for placing the order.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
          All the details have been shared on your WhatsApp Number.
        </Typography>

        {/* Okay Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleClose}
          sx={{
            bgcolor: '#1a237e',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#303f9f'
            }
          }}
        >
          Okay
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default memo(OrderSuccessModal);
