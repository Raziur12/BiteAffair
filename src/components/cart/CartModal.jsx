import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardMedia,
  CardContent
} from '@mui/material';
import {
  Close,
  Add,
  Remove,
  Delete
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { recommendedAddOns } from '../../data/servicesData';
import OrderSuccessModal from './OrderSuccessModal';
// import { otpService } from '../../services/otpService'; // Firebase OTP (for production)
// import { testOtpService as otpService } from '../../services/testOtpService'; // Test OTP (for development)
import { smsOtpService as otpService } from '../../services/smsOtpService'; // SMS OTP (real SMS)
import { whatsappService } from '../../services/whatsappService';
import { locationService } from '../../services/locationService';

const CartModal = ({ open, onClose, onCheckout, bookingConfig, guestCount, onGuestCountChange, selectedMenu, userEditRef, lastUserEditAt }) => {
  const { items, updateQuantity, removeItem, getTotalPrice, addItem } = useCart();
  const navigate = useNavigate();
  
  // Use dynamic values from bookingConfig or fallback to defaults
  const [deliveryDate, setDeliveryDate] = useState(bookingConfig?.eventDate || '15th October 2024');
  const [deliveryTime, setDeliveryTime] = useState(bookingConfig?.eventTime || '6:00 PM - 10:30 PM');
  const [couponCode, setCouponCode] = useState('');
  const [location, setLocation] = useState(bookingConfig?.location || 'Gurugram');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Validation error states
  const [phoneError, setPhoneError] = useState('');
  const [pinCodeError, setPinCodeError] = useState('');
  
  // OTP verification states for inline display
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [canResend, setCanResend] = useState(true);

  // Update state when bookingConfig changes
  React.useEffect(() => {
    if (bookingConfig) {
      if (bookingConfig.eventDate) {
        setDeliveryDate(bookingConfig.eventDate);
      }
      if (bookingConfig.eventTime) {
        setDeliveryTime(bookingConfig.eventTime);
      }
      if (bookingConfig.location) {
        setLocation(bookingConfig.location);
      }
    }
  }, [bookingConfig]);

  // OTP resend timer effect
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0 && showOTP) {
      setCanResend(true);
    }
  }, [resendTimer, showOTP]);

  const handleQuantityChange = useCallback((id, newQuantity) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const previousQuantity = parseInt(item.quantity) || 0;
    const delta = newQuantity - previousQuantity;
    

    // Determine which guest type to update
    let guestType = 'veg';
    if (selectedMenu === 'jain') {
      guestType = 'jain';
    } else if (item.isNonVeg) {
      guestType = 'nonVeg';
    } else if (item.isJain) {
      guestType = 'jain';
    } else if (item.isPackage || item.isPackageItem || selectedMenu === 'veg') {
      guestType = 'veg';
    }

    const newGuestCount = Math.max(1, newQuantity);
    

    // 1) Propagate to parent first so sync uses the new guestCount
    if (onGuestCountChange) onGuestCountChange(guestType, newGuestCount);

    // 2) Update the cart line so UI reflects the change immediately
    if (newQuantity <= 0) {
      removeItem(id);
    } else {
      const unitPrice = item.calculatedPrice || item.price || item.basePrice || 0;
      const updatedItem = {
        ...item,
        quantity: newQuantity,
        serves: newQuantity,
        calculatedPrice: unitPrice
      };
      updateQuantity(id, newQuantity, updatedItem);
    }

    // Skip guest count propagation for addons
    if (item.isAddon) {
      
      return;
    }

    // Skip guest count propagation for Breads & Desserts
    if (item.category === 'breads' || item.category === 'desserts') {
      
      return;
    }

    // Skip if no guest count handler or no actual change
    if (!guestCount || !onGuestCountChange || delta === 0) {
      return;
    }

    // We already propagated above; nothing more to do here
  }, [items, removeItem, updateQuantity, selectedMenu, onGuestCountChange, guestCount]);

  const handleSendOTP = async () => {
    if (phoneNumber.trim()) {
      // Validate phone number (basic validation)
      const cleanNumber = phoneNumber.replace(/\D/g, '');
      if (cleanNumber.length < 10) {
        alert('Please enter a valid 10-digit phone number');
        return;
      }
      
      try {
        const result = await otpService.sendOTP(phoneNumber);
        
        if (result.success) {
          setShowOTP(true);
          setResendTimer(30);
          setCanResend(false);
          setOtp(['', '', '', '', '', '']);
          setOtpError('');
          
          // Show success message if in test mode
          if (result.testMode && result.dynamicOTP) {
            alert(`Test OTP sent! Use code: ${result.dynamicOTP}`);
          }
        } else {
          alert(result.message || 'Failed to send OTP');
        }
      } catch (error) {
        console.error('OTP Send Error:', error);
        alert('Failed to send OTP. Please try again.');
      }
    } else {
      alert('Please enter phone number');
    }
  };

  const handleSubmitValidation = () => {
    let isValid = true;
    
    // Clear previous errors
    setPhoneError('');
    setPinCodeError('');

    // Check if phone number is filled
    if (!phoneNumber.trim()) {
      setPhoneError('Please enter your phone number');
      isValid = false;
    }
    // Check if phone number is valid (10 digits)
    else if (phoneNumber.trim().length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      isValid = false;
    }

    // Check if pin code is filled
    if (!couponCode.trim()) {
      setPinCodeError('Please enter your pin code');
      isValid = false;
    }
    // Check if pin code has minimum length (assuming 6 digits)
    else if (couponCode.trim().length < 6) {
      setPinCodeError('Please enter a valid pin code (minimum 6 digits)');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async () => {
    // If OTP is shown, verify OTP instead of normal validation
    if (showOTP) {
      const otpCode = otp.join('');
      if (otpCode.length !== 6) {
        setOtpError('Please enter complete 6-digit OTP');
        return;
      }

      try {
        const result = await otpService.verifyOTP(phoneNumber, otpCode);
        if (result.success) {
          setShowOTP(false);
          setShowSuccess(true);
        } else {
          setOtpError(result.message || 'Invalid OTP. Please try again.');
        }
      } catch (error) {
        console.error('OTP Verification Error:', error);
        setOtpError('Failed to verify OTP. Please try again.');
      }
    } else {
      // Check if phone number is entered and OTP should be sent first
      if (phoneNumber.trim() && phoneNumber.trim().length === 10) {
        setPhoneError('Please send OTP first and verify it before submitting');
        return;
      }
      
      // Normal validation for other fields
      if (handleSubmitValidation()) {
        setShowSuccess(true);
      }
    }
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    setPhoneNumber(value);
    if (phoneError && value.trim()) {
      setPhoneError('');
    }
  };

  // Clear pin code error when user starts typing
  const handlePinCodeChange = (e) => {
    const value = e.target.value;
    setCouponCode(value);
    if (pinCodeError && value.trim()) {
      setPinCodeError('');
    }
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Clear error when user starts typing
      if (otpError && value) {
        setOtpError('');
      }
      
      // Auto focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    try {
      const result = await otpService.sendOTP(phoneNumber);
      if (result.success) {
        setResendTimer(30);
        setCanResend(false);
        setOtp(['', '', '', '', '', '']);
        setOtpError('');
        
        if (result.testMode && result.dynamicOTP) {
          alert(`New OTP sent! Use code: ${result.dynamicOTP}`);
        }
      } else {
        setOtpError('Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      setOtpError('Failed to resend OTP. Please try again.');
    }
  };

  const handleOTPVerifySuccess = async () => {
    setShowOTP(false);
    
    // Prepare order data for WhatsApp
    const orderData = {
      items: items,
      totalPrice: getTotalPrice() + Math.round(getTotalPrice() * 0.18), // Including GST
      deliveryDate: deliveryDate,
      deliveryTime: deliveryTime,
      location: location,
      phoneNumber: phoneNumber
    };
    
    // Send order details to WhatsApp
    try {
      const result = await whatsappService.sendOrderDetails(phoneNumber, orderData);
    } catch (error) {
      console.error('Failed to send WhatsApp message:', error);
    }
    
    setShowSuccess(true);
  };

  // Handle adding recommended add-ons to cart
  const handleAddAddonToCart = (addon) => {
    if (!addon) return;

    const addonId = `addon_${addon.id}`;

    const addonItem = {
      id: addonId,
      name: addon.name,
      price: addon.price,
      calculatedPrice: addon.price,
      quantity: 1,
      isAddon: true,
      isVeg: true
    };

    addItem(addonItem);
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    onClose(); // Close the cart modal as well
  };


  // Memoize per-item derived display values to avoid recomputation on each render
  const mappedItems = useMemo(() => {
    return (items || []).map((item) => {
      const isBreadOrDessert = item.category === 'breads' || item.category === 'desserts';
      const isPackageMenuItem = Boolean(item.packageKey || item.packageIncludes);
      const totalGuests = (guestCount?.veg || 0) + (guestCount?.nonVeg || 0) + (guestCount?.jain || 0);
      const displayServes = isPackageMenuItem
        ? (totalGuests || Number(item.quantity) || 1)
        : (isBreadOrDessert ? item.serves : item.quantity);

      // Derive quantity text dynamically to stay in sync with serves changes
      const computeQuantityText = () => {
        if (item.isAddon) return item.quantity;
        if (isPackageMenuItem) {
          const includes = item.packageIncludes;
          if (includes && typeof includes === 'object') {
            const sum = Object.values(includes)
              .filter((v) => typeof v === 'number' && Number.isFinite(v))
              .reduce((acc, v) => acc + v, 0);
            if (sum) return String(sum * (Number(displayServes) || 0));
          }
          return '1';
        }
        // Prefer dynamic recompute for PCS/GM using per-serve derivation
        const qtySource = (typeof item.portion_size === 'string' && /PCS|GM/i.test(item.portion_size))
          ? item.portion_size
          : (typeof item.quantity === 'string' && /PCS|GM/i.test(item.quantity))
            ? item.quantity
            : null;

        if (qtySource) {
          const unit = /GM/i.test(qtySource) ? 'GM' : 'PCS';
          const baseAmount = parseFloat(qtySource.replace(/[^0-9.]/g, '')) || 0;
          const basisServes = Number(item.calculatedFor) || Number(item.originalServes) || Number(item.serves) || 1;
          const perServe = basisServes > 0 ? baseAmount / basisServes : 0;
          const total = Math.ceil(perServe * (Number(displayServes) || 0));
          return `${total}${unit}`;
        }

        if (item.portionSize && typeof item.portionSize === 'string') {
          const perPersonAmount = parseFloat(item.portionSize.replace(/[^0-9.]/g, '')) || 0;
          const unit = /GM/i.test(item.portionSize) ? 'GM' : 'PCS';
          const total = perPersonAmount * (Number(displayServes) || 0);
          const formatted = Number.isInteger(total) ? total : total.toFixed(1);
          return `${formatted}${unit}`;
        }
        if (item.customizations?.quantity) return item.customizations.quantity;
        return '1';
      };

      const quantityText = computeQuantityText();
      const unitPrice = item.calculatedPrice || item.price || item.basePrice || 0;
      const lineTotal = unitPrice * (Number(displayServes) || 0);

      return {
        ...item,
        _displayServes: displayServes,
        _quantityText: quantityText,
        _lineTotal: lineTotal
      };
    });
  }, [items, guestCount]);

  // Render as modal with new design
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 2 },
          maxHeight: { xs: '100vh', sm: '100vh' },
          maxWidth: { xs: '100%', sm: '400px' },
          width: { xs: '100%', sm: '400px' },
          margin: { xs: 0, sm: 0 },
          position: 'fixed',
          right: 0,
          top: 0,
          bottom: 0,
          left: { xs: 0, sm: 'auto' }
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          justifyContent: 'flex-end',
          alignItems: 'stretch',
          margin: 0,
          maxWidth: 'none',
          height: '100vh'
        },
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.3)'
        }
      }}
    >
      <DialogContent sx={{ p: 0, bgcolor: '#f8f9fa', height: { xs: '100vh', sm: 'auto' }, maxHeight: { xs: '100vh', sm: '90vh' }, overflowY: 'auto' }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          bgcolor: 'white',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Order Summary
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Cart Items - Single Box for all items */}
        <Box sx={{ p: 2 }}>
          <Box sx={{ 
            bgcolor: 'white',
            borderRadius: 1,
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }}>
            {/* Dynamic Cart Items */}
            {mappedItems.map((item, index) => {
              const displayServes = item._displayServes;
              const quantityText = item._quantityText;
              return (
              <Box key={item.id}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  p: 2
                }}>
                  {/* Left Side - Veg Indicator and Item Details */}
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      {/* Veg/Non-Veg Indicator */}
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          border: '2px solid',
                          borderColor: item.isVeg ? '#4caf50' : '#f44336',
                          borderRadius: 0.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'white'
                        }}
                      >
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            backgroundColor: item.isVeg ? '#4caf50' : '#f44336',
                            borderRadius: '50%'
                          }}
                        />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.9rem' }}>
                        {item.name}
                      </Typography>
                    </Box>
                    
                    {/* Package Details or Regular Item Details */}
                    {item.isPackage ? (
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', mb: 0.5 }}>
                          {item.packageType === 'premium' ? 'Premium' : 'Standard'} Package - Serves: {item.serves}
                        </Typography>
                        {item.packageDetails && (
                          <Box sx={{ ml: 1 }}>
                            {Object.entries(item.packageDetails).map(([category, items]) => {
                              if (category === 'extras' || !items || items.length === 0) return null;

                              const labelMap = {
                                starters: 'Starters',
                                main: 'Main Course',
                                rice: 'Rice',
                                breads: 'Breads',
                                dessert: 'Dessert'
                              };
                              const label = labelMap[category] || (category.charAt(0).toUpperCase() + category.slice(1));
                              const count = items.length;

                              return (
                                <Typography
                                  key={category}
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: '0.7rem', display: 'block' }}
                                >
                                  • {count} {label}: {items.join(', ')}
                                </Typography>
                              );
                            })}
                            {item.packageDetails.extras && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem', display: 'block' }}>
                                • Includes: {item.packageDetails.extras.join(', ')}
                              </Typography>
                            )}
                          </Box>
                        )}

                        {/* Edit link below package summary */}
                        <Typography 
                          variant="caption" 
                          onClick={() => {
                            // Close the cart and navigate to menu with package data for editing
                            onClose();
                            const pkgType = item.packageType === 'premium' ? 'premium' : 'standard';
                            // Store package data in sessionStorage for editing
                            sessionStorage.setItem('editingPackage', JSON.stringify({
                              packageType: pkgType,
                              selectedItems: item.selectedItems,
                              packageDetails: item.packageDetails,
                              guestCount: item.guestCount || item.quantity,
                              fullItem: item
                            }));
                            navigate(`/bite-affair/menu?editVegPackage=${pkgType}`);
                          }}
                          sx={{ 
                            color: '#ff6b35', 
                            fontSize: '0.75rem', 
                            cursor: 'pointer',
                            mt: 0.75,
                            display: 'inline-flex',
                            alignItems: 'center',
                            '&:hover': { textDecoration: 'underline' }
                          }}
                        >
                          Edit ▶
                        </Typography>
                      </Box>
                    ) : (
                      <Box sx={{ mt: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                          Serves: {displayServes} | Quantity: {quantityText}
                        </Typography>

                        {(item.packageKey || item.packageIncludes) && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.75rem', display: 'block', mt: 0.5 }}
                          >
                            {(() => {
                              const toTitleCase = (value) => {
                                const str = String(value || '').trim();
                                if (!str) return str;
                                return str.charAt(0).toUpperCase() + str.slice(1);
                              };
                              const includes = item.packageIncludes;
                              if (!includes || typeof includes !== 'object') return '';
                              return Object.entries(includes)
                                .map(([k, v]) => `${toTitleCase(k)}: ${v === true ? 'Yes' : v}`)
                                .join(' | ');
                            })()}
                          </Typography>
                        )}

                        {/* Edit link for Jain/Customized items (non-package) */}
                        {!item.isAddon && !(item.packageKey || item.packageIncludes) && (
                          <Typography
                            variant="caption"
                            onClick={() => {
                              // Close cart and go back to menu so user can modify selections
                              onClose();
                              navigate('/bite-affair/menu');
                            }}
                            sx={{
                              color: '#ff6b35',
                              fontSize: '0.75rem',
                              cursor: 'pointer',
                              mt: 0.5,
                              display: 'block',
                              '&:hover': { textDecoration: 'underline' }
                            }}
                          >
                            Edit ▶
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Box>

                  {/* Right Side - Quantity Controls and Price */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Quantity Controls */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, border: '1px solid #e0e0e0', borderRadius: 1, px: 1, py: 0.5 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const base = parseInt(String(displayServes).replace(/\D/g, ''), 10) || 0;
                          handleQuantityChange(item.id, Math.max(0, base - 1));
                        }}
                        sx={{ 
                          width: 20,
                          height: 20,
                          p: 0
                        }}
                      >
                        <Remove sx={{ fontSize: 12 }} />
                      </IconButton>
                      <Typography sx={{ 
                        minWidth: '20px', 
                        textAlign: 'center', 
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        mx: 1
                      }}>
                        {displayServes}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const base = parseInt(String(displayServes).replace(/\D/g, ''), 10) || 0;
                          handleQuantityChange(item.id, base + 1);
                        }}
                        sx={{ 
                          width: 20,
                          height: 20,
                          p: 0
                        }}
                      >
                        <Add sx={{ fontSize: 12 }} />
                      </IconButton>
                    </Box>
                    
                    {/* Price */}
                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#1a237e', minWidth: 40 }}>
                      ₹{item._lineTotal}
                    </Typography>
                  </Box>
                </Box>
                
                {/* Divider between items (except last item) */}
                {index < items.length - 1 && (
                  <Box sx={{ borderBottom: '1px solid #f0f0f0', mx: 2 }} />
                )}
              </Box>
            )})}
             {/* Add More Items action - only for Customized and Jain menus */}
        {(selectedMenu === 'customized' || selectedMenu === 'jain') && (
          <Box sx={{ px: 2, pb: 0 }}>
            <Typography
              variant="body2"
              onClick={() => {
                onClose();
                navigate('/bite-affair/menu');
              }}
              sx={{
                color: '#ff6b35',
                fontWeight: 500,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                mb: 1,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              + Add More Items
            </Typography>
          </Box>
        )}
            {/* Empty state when no items */}
            {mappedItems.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Your cart is empty
                </Typography>
              </Box>
            )}
          </Box>
          
        </Box>

        {/* Recommended Add ons */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
            Recommended Add-ons
          </Typography>
          {recommendedAddOns.map((addon) => (
            <Box key={addon.id} sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 2,
              bgcolor: 'white',
              p: 2,
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <Box
                component="img"
                src={addon.image}
                alt={addon.name}
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 1,
                  objectFit: 'cover',
                  mr: 2
                }}
              />
              
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.2 }}>
                  {addon.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.2, lineHeight: 1 }}>
                  {addon.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{display: 'flex', alignItems: 'center', gap: 0.3, bgcolor: '#132561ff', color: 'white', borderRadius: 0.5, px: 0.5, py: 0.2, mt: 2, mb: 0.2, fontSize: '0.65rem', width: 'fit-content'}}>
                  {addon.rating}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 1 }}>
                  ₹{addon.price}
                </Typography>
              </Box>
              
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleAddAddonToCart(addon)}
                sx={{ 
                  minWidth: 60,
                  fontSize: '0.75rem',
                  borderColor: '#1a237e',
                  color: '#1a237e'
                }}
              >
                Add
              </Button>
            </Box>
          ))}
        </Box>

        {/* Total Section */}
        <Box sx={{ p: 2, bgcolor: 'white', borderTop: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            Total
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Sub Total</Typography>
            <Typography variant="body2">₹{getTotalPrice()}</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Delivery Charges</Typography>
            <Typography variant="body2">₹50</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Packaging Charges</Typography>
            <Typography variant="body2">₹30</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">GST (Including CGST)</Typography>
            <Typography variant="body2">₹{Math.round(getTotalPrice() * 0.05)}</Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          {/* Final Total */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Total
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1a237e' }}>
              ₹{getTotalPrice() + 50 + 30 + Math.round(getTotalPrice() * 0.05)}
            </Typography>
          </Box>
          <Divider sx={{ my: 2 }} />
          
          {/* Delivery Date/Time */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Delivery Date</InputLabel>
              <Select
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                label="Delivery Date"
              >
                {/* Always include the current selected date as an option */}
                <MenuItem value={deliveryDate}>{deliveryDate}</MenuItem>
                {deliveryDate !== "15th October 2024" && (
                  <MenuItem value="15th October 2024">15th October 2024</MenuItem>
                )}
                {deliveryDate !== "16th October 2024" && (
                  <MenuItem value="16th October 2024">16th October 2024</MenuItem>
                )}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Delivery Time</InputLabel>
              <Select
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                label="Delivery Time"
              >
                {/* Always include the current selected time as an option */}
                <MenuItem value={deliveryTime}>{deliveryTime}</MenuItem>
                {deliveryTime !== "6:00 PM - 10:30 PM" && (
                  <MenuItem value="6:00 PM - 10:30 PM">6:00 PM - 10:30 PM</MenuItem>
                )}
                {deliveryTime !== "12:00 PM - 4:00 PM" && (
                  <MenuItem value="12:00 PM - 4:00 PM">12:00 PM - 4:00 PM</MenuItem>
                )}
              </Select>
            </FormControl>
          </Box>
          
          {/* Location and Phone Number */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <FormControl size="small" sx={{ flex: 1 }}>
              <InputLabel>Location</InputLabel>
              <Select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                label="Location"
              >
                {locationService.getAvailableLocations().map((loc) => (
                  <MenuItem key={loc.id} value={loc.name}>
                    {loc.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
          
            <Box sx={{ flex: 1 }}>
              <TextField
                size="small"
                placeholder="Enter Pin Code"
                value={couponCode}
                onChange={handlePinCodeChange}
                error={!!pinCodeError}
                sx={{ width: '100%' }}
              />
              {pinCodeError && (
                <Typography variant="caption" color="error" sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
                  {pinCodeError}
                </Typography>
              )}
            </Box>
          </Box>
          
          {/* Phone Number */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Box sx={{ flex: 1 }}>
              <TextField
                size="small"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={handlePhoneNumberChange}
                error={!!phoneError}
                inputProps={{
                  maxLength: 10,
                  pattern: '[0-9]*'
                }}
                sx={{ width: '100%' }}
              />
              {phoneError && (
                <Typography variant="caption" color="error" sx={{ fontSize: '0.75rem', mt: 0.5, display: 'block' }}>
                  {phoneError}
                </Typography>
              )}
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={handleSendOTP}
              sx={{ 
                bgcolor: '#1a237e',
                minWidth: 80,
                '&:hover': { bgcolor: '#303f9f' },
                height: '40px'
              }}
            >
              Send OTP
            </Button>
          </Box>
          
          {/* Inline OTP Verification Section - Like 2nd Image */}
          {showOTP && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500, textAlign: 'center' }}>
                A verification code has been sent to {phoneNumber}
              </Typography>
              
              {/* 6 OTP Input Fields - Inline like 2nd image */}
              <Box sx={{ display: 'flex', gap: 1, mb: 1, justifyContent: 'center' }}>
                {otp.map((digit, index) => (
                  <TextField
                    key={index}
                    id={`otp-${index}`}
                    size="small"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    inputProps={{
                      maxLength: 1,
                      style: { textAlign: 'center', fontSize: '1.1rem', fontWeight: 'bold' }
                    }}
                    sx={{ 
                      width: 40, 
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': {
                          borderColor: otpError ? '#f44336' : '#e0e0e0',
                        },
                      }
                    }}
                  />
                ))}
              </Box>
              
              {/* Resend Code - Like 2nd image */}
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                {canResend ? (
                  <Button
                    variant="text"
                    size="small"
                    onClick={handleResendOTP}
                    sx={{ fontSize: '0.75rem', textTransform: 'none', color: '#ff6b35' }}
                  >
                    Resend Code
                  </Button>
                ) : (
                  <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#666' }}>
                    Resend code in {resendTimer}s
                  </Typography>
                )}
              </Box>
              
              {/* OTP Error Message */}
              {otpError && (
                <Typography variant="caption" color="error" sx={{ fontSize: '0.75rem', display: 'block', textAlign: 'center', mb: 1 }}>
                  {otpError}
                </Typography>
              )}
            </Box>
          )}
          
          {/* Checkout Button */}
          <Button
            fullWidth
            variant="contained"
            onClick={handleSubmit}
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
            Submit
          </Button>
        </Box>
        
        {/* reCAPTCHA container (only needed for Firebase OTP) */}
        {/* <div id="recaptcha-container"></div> */}
      </DialogContent>
      
      
      {/* Order Success Modal */}
      <OrderSuccessModal
        open={showSuccess}
        onClose={handleSuccessClose}
      />
    </Dialog>
  );
};

export default memo(CartModal);
