import React, { useState, useEffect, useCallback, memo } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  CheckCircle,
  HourglassEmpty,
  Cancel,
  ArrowBack,
  Refresh
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import orderService from '../../services/orderService';

// Hoisted static styles
const ROOT_SX = { bgcolor: '#f5f5f5', minHeight: '100vh', py: 3 };
const PAPER_SX = { borderRadius: 3, p: 4, textAlign: 'center' };
const HEADER_SX = { bgcolor: '#1a237e', color: 'white', p: 3, textAlign: 'center', position: 'relative' };

const OrderStatus = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrderStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await orderService.checkOrderStatus(orderId);
      
      if (result.success) {
        setOrderData(result.data);
      } else {
        setError(result.error || 'Order not found');
      }
    } catch (err) {
      setError('Failed to fetch order status');
      console.error('Order status fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    if (orderId) {
      fetchOrderStatus();
      // Poll for status updates every 30 seconds
      const interval = setInterval(fetchOrderStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [orderId, fetchOrderStatus]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <HourglassEmpty sx={{ fontSize: 48, color: '#ff9800' }} />;
      case 'approved':
        return <CheckCircle sx={{ fontSize: 48, color: '#4caf50' }} />;
      case 'rejected':
        return <Cancel sx={{ fontSize: 48, color: '#f44336' }} />;
      default:
        return <HourglassEmpty sx={{ fontSize: 48, color: '#757575' }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusMessage = (status) => {
    switch (status) {
      case 'pending':
        return {
          title: 'Order Under Review',
          message: 'Your order has been submitted and is currently being reviewed by our team. You will receive an email notification once approved.',
          action: 'We typically review orders within 2-4 hours during business hours.'
        };
      case 'approved':
        return {
          title: 'Order Approved!',
          message: 'Great news! Your order has been approved and is ready for payment.',
          action: 'Click the button below to proceed with payment.'
        };
      case 'rejected':
        return {
          title: 'Order Requires Attention',
          message: 'Unfortunately, there was an issue with your order. Please contact us for more details.',
          action: 'You can place a new order or contact our support team.'
        };
      default:
        return {
          title: 'Order Status Unknown',
          message: 'Unable to determine order status.',
          action: 'Please refresh the page or contact support.'
        };
    }
  };

  const handleProceedToPayment = useCallback(() => {
    navigate(`/bite-affair/payment?orderId=${orderId}`);
  }, [navigate, orderId]);

  const handleGoHome = useCallback(() => {
    navigate('/bite-affair');
  }, [navigate]);

  const handleContactSupport = useCallback(() => {
    window.open('mailto:admin@biteaffairs.com?subject=Order Inquiry - ' + orderId);
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={ROOT_SX}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={PAPER_SX}>
            <CircularProgress size={48} sx={{ mb: 2 }} />
            <Typography variant="h6" sx={{ fontFamily: 'Times New Roman, serif' }}>
              Loading order status...
            </Typography>
          </Paper>
        </Container>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={ROOT_SX}>
        <Container maxWidth="sm">
          <Paper elevation={3} sx={PAPER_SX}>
            <Cancel sx={{ fontSize: 48, color: '#f44336', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 2, fontFamily: 'Times New Roman, serif' }}>
              Order Not Found
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, color: '#666', fontFamily: 'Times New Roman, serif' }}>
              {error}
            </Typography>
            <Button
              variant="contained"
              onClick={handleGoHome}
              sx={{
                bgcolor: '#1a237e',
                fontFamily: 'Times New Roman, serif',
                '&:hover': { bgcolor: '#303f9f' }
              }}
            >
              Go to Menu
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  const statusInfo = getStatusMessage(orderData.status);

  return (
    <Box sx={ROOT_SX}>
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={HEADER_SX}>
            <IconButton
              onClick={handleGoHome}
              sx={{ 
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'white'
              }}
            >
              <ArrowBack />
            </IconButton>
            
            <Typography variant="h5" sx={{ fontFamily: 'Times New Roman, serif', fontWeight: 'bold' }}>
              Order Status
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontFamily: 'Times New Roman, serif' }}>
              Order ID: {orderId}
            </Typography>
          </Box>

          {/* Status Content */}
          <Box sx={{ p: 4, textAlign: 'center' }}>
            {getStatusIcon(orderData.status)}
            
            <Typography variant="h4" sx={{ mt: 2, mb: 1, fontFamily: 'Times New Roman, serif' }}>
              {statusInfo.title}
            </Typography>
            
            <Chip 
              label={orderData.status.toUpperCase()} 
              color={getStatusColor(orderData.status)}
              sx={{ mb: 3, fontFamily: 'Times New Roman, serif' }}
            />

            <Typography 
              variant="body1" 
              sx={{ mb: 2, color: '#666', fontFamily: 'Times New Roman, serif' }}
            >
              {statusInfo.message}
            </Typography>

            <Typography 
              variant="body2" 
              sx={{ mb: 4, color: '#888', fontFamily: 'Times New Roman, serif' }}
            >
              {statusInfo.action}
            </Typography>

            <Divider sx={{ my: 3 }} />

            {/* Order Details */}
            <Box sx={{ textAlign: 'left', mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontFamily: 'Times New Roman, serif' }}>
                Order Details
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  Customer:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  {orderData.customerDetails.name}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  Email:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  {orderData.customerDetails.email}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  Phone:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  {orderData.customerDetails.phone}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  Total Items:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  {orderData.orderSummary.totalItems}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'Times New Roman, serif' }}>
                  Total Amount:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'Times New Roman, serif' }}>
                  ₹{orderData.orderSummary.totalAmount}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  Order Date:
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'Times New Roman, serif' }}>
                  {new Date(orderData.timestamp).toLocaleDateString('en-IN')}
                </Typography>
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              {orderData.status === 'approved' && (
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleProceedToPayment}
                  sx={{
                    bgcolor: '#4caf50',
                    fontFamily: 'Times New Roman, serif',
                    '&:hover': { bgcolor: '#45a049' }
                  }}
                >
                  Proceed to Payment
                </Button>
              )}
              
              <Button
                fullWidth={orderData.status !== 'approved'}
                variant="outlined"
                onClick={fetchOrderStatus}
                startIcon={<Refresh />}
                sx={{ fontFamily: 'Times New Roman, serif' }}
              >
                Refresh Status
              </Button>
              
              {orderData.status === 'rejected' && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleContactSupport}
                  sx={{ fontFamily: 'Times New Roman, serif' }}
                >
                  Contact Support
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default memo(OrderStatus);
