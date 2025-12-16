import React, { useState, useCallback, memo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Container,
  Paper
} from '@mui/material';
import { Close, ArrowBack } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import orderService from '../../services/orderService';

// Hoisted static styles
const FULLPAGE_ROOT_SX = { bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 };
const FULLPAGE_PAPER_SX = { borderRadius: 3, p: 4 };
const MODAL_PAPER_SX = {
  borderRadius: 3,
  background: '#f8f5f0 url(https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80) center/cover',
  backgroundBlendMode: 'overlay'
};

const CheckoutConfirmation = ({ open, onClose, onConfirm }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const { items, getTotalPrice } = useCart();
  
  // Check if this is being rendered as a full page (route-based) or as a modal
  const isFullPage = location.pathname === '/bite-affair/checkout';
  
  const handleGoBack = useCallback(() => {
    navigate('/bite-affair/cart');
  }, [navigate]);

  // Generate unique order ID
  const generateOrderId = useCallback(() => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 5);
    return `ORD-${timestamp}-${random.toUpperCase()}`;
  }, []);

  // Prepare order data for submission
  const prepareOrderData = useCallback(() => {
    const orderId = generateOrderId();
    const timestamp = new Date().toISOString();
    const totalAmount = getTotalPrice();

    return {
      orderId,
      timestamp,
      status: 'pending',
      customerDetails: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim()
      },
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        portionSize: item.portionSize || 'Standard',
        customizations: item.customizations || {},
        subtotal: item.price * item.quantity
      })),
      orderSummary: {
        totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
        totalAmount,
        currency: 'INR'
      },
      metadata: {
        source: 'web',
        userAgent: navigator.userAgent,
        timestamp: timestamp
      }
    };
  }, [name, email, phone, items, getTotalPrice, generateOrderId]);

  const validate = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = useCallback(async () => {
    if (!validate()) return;

    setLoading(true);
    
    try {
      // Step 1: Prepare order data
      const orderData = prepareOrderData();

      // Step 2: Submit order for admin approval
      const result = await orderService.submitOrder(orderData);
      
      if (result.success) {
        
        // Step 3: Navigate to order status page instead of payment
        if (isFullPage) {
          navigate(`/bite-affair/order-status/${result.orderId}`);
        } else {
          // For modal version, close modal and show success message
          onConfirm({ 
            name, 
            email, 
            phone, 
            orderId: result.orderId,
            status: 'pending',
            message: result.message
          });
        }
      } else {
        // Handle submission error
        console.error('Order submission failed:', result.error);
        setErrors({ 
          submit: result.message || 'Failed to submit order. Please try again.' 
        });
      }
      
    } catch (error) {
      console.error('Order submission error:', error);
      setErrors({ 
        submit: 'An unexpected error occurred. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  }, [validate, prepareOrderData, isFullPage, navigate, onConfirm, name, email, phone]);

  // Render as full page if accessed via route
  if (isFullPage) {
    return (
      <Box sx={FULLPAGE_ROOT_SX}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={FULLPAGE_PAPER_SX}>
            {/* Header with Back Button */}
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
              <Typography variant="h4" sx={{ fontWeight: 'bold', flex: 1 }}>
                Confirm Your Order
              </Typography>
            </Box>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              Please provide your contact details to confirm your order.
            </Typography>

            <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    height: '40px',
                    fontFamily: 'Times New Roman, serif',
                    '& fieldset': {
                      borderRadius: '12px',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Times New Roman, serif',
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: 'Times New Roman, serif',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                variant="outlined"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    height: '40px',
                    fontFamily: 'Times New Roman, serif',
                    '& fieldset': {
                      borderRadius: '12px',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Times New Roman, serif',
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: 'Times New Roman, serif',
                  }
                }}
              />

              <TextField
                fullWidth
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone}
                variant="outlined"
                placeholder="10-digit phone number"
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    height: '40px',
                    fontFamily: 'Times New Roman, serif',
                    '& fieldset': {
                      borderRadius: '12px',
                    }
                  },
                  '& .MuiInputLabel-root': {
                    fontFamily: 'Times New Roman, serif',
                  },
                  '& .MuiFormHelperText-root': {
                    fontFamily: 'Times New Roman, serif',
                  }
                }}
              />

              {errors.submit && (
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  bgcolor: '#ffebee', 
                  borderRadius: '8px', 
                  border: '1px solid #f44336' 
                }}>
                  <Typography 
                    color="error" 
                    variant="body2" 
                    sx={{ fontFamily: 'Times New Roman, serif' }}
                  >
                    {errors.submit}
                  </Typography>
                </Box>
              )}

              <Box sx={{ mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={loading}
                  sx={{
                    bgcolor: '#1a237e',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                    fontFamily: 'Times New Roman, serif',
                    '&:hover': {
                      bgcolor: '#303f9f'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'Confirm Order'
                  )}
                </Button>
              </Box>
            </Box>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: 'center' }}>
              By confirming, you agree to proceed with the payment for your order.
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  // Render as modal (original behavior)
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: MODAL_PAPER_SX
      }}
    >
      <DialogTitle sx={{ pb: 1, position: 'relative', zIndex: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              onClick={onClose}
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
              Confirm Your Order
            </Typography>
          </Box>
          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ position: 'relative', zIndex: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please provide your details to receive order confirmation via Email, WhatsApp, or SMS.
        </Typography>
        <Box component="form" noValidate autoComplete="off">
          <TextField
            fullWidth
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
            required
            error={!!errors.name}
            helperText={errors.name}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: '40px',
                fontFamily: 'Times New Roman, serif',
                '& fieldset': {
                  borderRadius: '12px',
                }
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Times New Roman, serif',
              },
              '& .MuiFormHelperText-root': {
                fontFamily: 'Times New Roman, serif',
              }
            }}
          />
          <TextField
            fullWidth
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            margin="normal"
            required
            error={!!errors.email}
            helperText={errors.email}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: '40px',
                fontFamily: 'Times New Roman, serif',
                '& fieldset': {
                  borderRadius: '12px',
                }
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Times New Roman, serif',
              },
              '& .MuiFormHelperText-root': {
                fontFamily: 'Times New Roman, serif',
              }
            }}
          />
          <TextField
            fullWidth
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            margin="normal"
            required
            error={!!errors.phone}
            helperText={errors.phone}
            inputProps={{ inputMode: 'tel' }}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                height: '40px',
                fontFamily: 'Times New Roman, serif',
                '& fieldset': {
                  borderRadius: '12px',
                }
              },
              '& .MuiInputLabel-root': {
                fontFamily: 'Times New Roman, serif',
              },
              '& .MuiFormHelperText-root': {
                fontFamily: 'Times New Roman, serif',
              }
            }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 1, position: 'relative', zIndex: 2 }}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleConfirm}
          disabled={loading}
          sx={{
            bgcolor: '#1a237e',
            py: 1,
            fontSize: '1rem',
            fontWeight: 600,
            position: 'relative'
          }}
        >
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                color: 'white',
                position: 'absolute',
                top: '50%',
                left: '50%',
                marginTop: '-12px',
                marginLeft: '-12px',
              }}
            />
          )}
          {loading ? 'Confirming...' : 'Proceed to Order'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default memo(CheckoutConfirmation);
