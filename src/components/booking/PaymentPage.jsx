import React, { useCallback, memo } from 'react';
import { Box, Container, Paper, Typography, Button, Divider, IconButton } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

// Hoisted: static style objects
const ROOT_SX = { bgcolor: '#f5f5f5', minHeight: '100vh', py: 5 };
const PAPER_SX = { borderRadius: 3, p: 4 };

const PaymentPage = () => {
  const { items, getTotalPrice } = useCart();
  const navigate = useNavigate();

  const handleGoBack = useCallback(() => {
    navigate('/bite-affair/checkout'); // Go back to checkout page
  }, [navigate]);

  return (
    <Box sx={ROOT_SX}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={PAPER_SX}>
          {/* Back Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              onClick={handleGoBack}
              sx={{ 
                mr: 2,
                bgcolor: '#f0f0f0',
                '&:hover': {
                  bgcolor: '#e0e0e0'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h4" sx={{ fontWeight: 'bold', flex: 1, textAlign: 'center' }}>
              Complete Your Payment
            </Typography>
          </Box>

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
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>₹{getTotalPrice()}</Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'medium', mb: 2 }}>
              Select Payment Method
            </Typography>
            {/* Placeholder for payment options */}
            <Typography color="text.secondary">
              Payment integration (e.g., Stripe, Razorpay) would be implemented here.
            </Typography>
            <Button 
              variant="contained" 
              sx={{ mt: 3, bgcolor: '#1a237e', py: 1.5, fontSize: '1rem' }}
            >
              Pay Now
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default memo(PaymentPage);
