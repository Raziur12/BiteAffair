import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Card,
  CardContent,
  Grid,
  Chip,
  Alert
} from '@mui/material';
import {
  Close,
  Add,
  Remove,
  Edit,
  CheckCircle,
  WhatsApp
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';

// Hoisted static styles
const DIALOG_PAPER_SX = { borderRadius: 2, maxHeight: '90vh' };

const EnhancedCheckout = ({ open, onClose, onConfirm }) => {
  const { cartItems, updateItemQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState('cart'); // 'cart', 'details', 'confirmation'
  const [selectedItems, setSelectedItems] = useState([]);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    pincode: '',
    date: '',
    time: '',
    location: 'Gurugram'
  });
  const [orderConfirmed, setOrderConfirmed] = useState(false);

  useEffect(() => {
    if (open) {
      setSelectedItems(cartItems.map(item => ({ ...item, selected: true })));
      setCurrentStep('cart');
      setOrderConfirmed(false);
    }
  }, [open, cartItems]);

  const handleItemToggle = useCallback((itemId) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    );
  }, []);

  const handleQuantityChange = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedItems(prev => prev.filter(item => item.id !== itemId));
      removeItem(itemId);
    } else {
      setSelectedItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
      updateItemQuantity(itemId, newQuantity);
    }
  }, [removeItem, updateItemQuantity]);

  const selectedTotal = useMemo(() => {
    return selectedItems
      .filter(item => item.selected)
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [selectedItems]);

  const handleProceedToDetails = useCallback(() => {
    setCurrentStep('details');
  }, []);

  const handleSubmitOrder = useCallback(() => {
    const orderData = {
      items: selectedItems.filter(item => item.selected),
      customer: customerDetails,
      total: selectedTotal,
      timestamp: new Date().toISOString()
    };
    
    setCurrentStep('confirmation');
    setOrderConfirmed(true);
    
    // Simulate order processing
    setTimeout(() => {
      onConfirm(orderData);
    }, 2000);
  }, [selectedItems, customerDetails, selectedTotal, onConfirm]);

  const renderCartStep = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Selected Items
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {selectedItems.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No items in cart</Typography>
        </Box>
      ) : (
        <>
          {selectedItems.map((item) => (
            <Card key={item.id} sx={{ mb: 2, border: item.selected ? '2px solid #1976d2' : '1px solid #e0e0e0' }}>
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box 
                    sx={{ 
                      width: 20, 
                      height: 20, 
                      borderRadius: '50%', 
                      bgcolor: item.selected ? '#4caf50' : '#e0e0e0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                    onClick={() => handleItemToggle(item.id)}
                  >
                    {item.selected && <CheckCircle sx={{ fontSize: 16, color: 'white' }} />}
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Serves: {item.serves} | Quantity: XX pc
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Customization available
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton 
                      size="small" 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      <Remove />
                    </IconButton>
                    <Typography sx={{ minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      <Add />
                    </IconButton>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 60 }}>
                    ₹{item.price * item.quantity}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ))}

          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
              {selectedItems.filter(item => item.selected).length} Items Added
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={handleProceedToDetails}
            sx={{ mt: 2, py: 1.5 }}
          >
            View Cart → ₹{selectedTotal}
          </Button>
        </>
      )}
    </Box>
  );

  const renderDetailsStep = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Order Summary
        </Typography>
        <IconButton onClick={onClose}>
          <Close />
        </IconButton>
      </Box>

      {/* Order Items */}
      <Box sx={{ mb: 3 }}>
        {selectedItems.filter(item => item.selected).map((item) => (
          <Box key={item.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4caf50' }} />
              <Typography variant="body2">{item.name}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                  <Remove sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography>{item.quantity}</Typography>
                <IconButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
              <Typography sx={{ minWidth: 60 }}>₹{item.price * item.quantity}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Recommended Add-ons */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Recommended Add-ons</Typography>
        
        <Card sx={{ mb: 2 }}>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ width: 60, height: 60, bgcolor: '#f0f0f0', borderRadius: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Professional Server
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ideal for gathering of up to 30 people
                </Typography>
                <Chip label="5★" size="small" sx={{ mt: 0.5, bgcolor: '#1976d2', color: 'white' }} />
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6">₹XXX</Typography>
                <Button variant="outlined" size="small">Add</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ width: 60, height: 60, bgcolor: '#f0f0f0', borderRadius: 1 }} />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  Serving Dishes
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ideal for gathering of up to 30 people
                </Typography>
                <Chip label="5★" size="small" sx={{ mt: 0.5, bgcolor: '#1976d2', color: 'white' }} />
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h6">₹XXX</Typography>
                <Button variant="outlined" size="small">Add</Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Total */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', textAlign: 'center' }}>
          Total: ₹{selectedTotal}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2">Subtotal: ₹{selectedTotal}</Typography>
          <Typography variant="body2">Delivery Charges: ₹XX</Typography>
          <Typography variant="body2">Packaging Charges: ₹XX</Typography>
          <Typography variant="body2">Tax (Products @5%): ₹XXX</Typography>
        </Box>
      </Box>

      {/* Customer Details Form */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Date</InputLabel>
              <Select
                value={customerDetails.date}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, date: e.target.value }))}
              >
                <MenuItem value="10th October 2025">10th October 2025</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Time</InputLabel>
              <Select
                value={customerDetails.time}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, time: e.target.value }))}
              >
                <MenuItem value="02:00 PM - 02:30 PM">02:00 PM - 02:30 PM</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <FormControl fullWidth size="small">
              <InputLabel>Location</InputLabel>
              <Select
                value={customerDetails.location}
                onChange={(e) => setCustomerDetails(prev => ({ ...prev, location: e.target.value }))}
              >
                <MenuItem value="Gurugram">Gurugram</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              size="small"
              placeholder="122000"
              value={customerDetails.pincode}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, pincode: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              size="small"
              placeholder="+91 99999 99999"
              value={customerDetails.phone}
              onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
            />
          </Grid>
        </Grid>
      </Box>

      {/* OTP Verification */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" sx={{ mb: 1 }}>
          A verification code has been sent
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          {[0, 0, 0, 0, 0, 0].map((_, index) => (
            <TextField
              key={index}
              size="small"
              sx={{ width: 40 }}
              inputProps={{ maxLength: 1, style: { textAlign: 'center' } }}
            />
          ))}
        </Box>
        <Button variant="text" size="small" sx={{ color: '#ff9800' }}>
          Resend Code
        </Button>
      </Box>

      <Button
        fullWidth
        variant="contained"
        size="large"
        onClick={handleSubmitOrder}
        sx={{ py: 1.5 }}
      >
        Send OTP
      </Button>
    </Box>
  );

  const renderConfirmationStep = () => (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Box sx={{ 
        width: 80, 
        height: 80, 
        borderRadius: '50%', 
        bgcolor: '#ff9800', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        mx: 'auto',
        mb: 3
      }}>
        <CheckCircle sx={{ fontSize: 40, color: 'white' }} />
      </Box>
      
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        Thank you for placing the order. All the details have been shared on your WhatsApp Number.
      </Typography>
      
      <Button
        variant="contained"
        onClick={onClose}
        sx={{ mt: 2 }}
      >
        Okay
      </Button>
    </Box>
  );

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: DIALOG_PAPER_SX
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {currentStep === 'cart' && renderCartStep()}
        {currentStep === 'details' && renderDetailsStep()}
        {currentStep === 'confirmation' && renderConfirmationStep()}
      </DialogContent>
    </Dialog>
  );
};

export default memo(EnhancedCheckout);
