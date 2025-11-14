import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Box, 
  Typography, 
  Button, 
  Divider, 
  IconButton 
} from '@mui/material';
import { ArrowBack, Close } from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

const PaymentModal = ({ open, onClose, onBack }) => {
  const { items, getTotalPrice } = useCart();

  const handlePayNow = () => {
    // Here you would integrate with payment gateway
    alert('Payment integration would be implemented here (Stripe, Razorpay, etc.)');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { 
          borderRadius: 3,
          background: '#f8f5f0 url(https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80) center/cover',
          backgroundBlendMode: 'overlay'
        }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={onBack}
              sx={{ 
                mr: 1,
                p: 0.5,
                '&:hover': {
                  bgcolor: '#f0f0f0'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              Complete Your Payment
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
            Order Summary
          </Typography>
          {items.map(item => (
            <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography>{item.name} x {item.quantity}</Typography>
              <Typography>₹{item.price * item.quantity}</Typography>
            </Box>
          ))}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total</Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              ₹{getTotalPrice()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Select Payment Method
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Payment integration (e.g., Stripe, Razorpay) would be implemented here.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handlePayNow}
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
          Pay Now
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
