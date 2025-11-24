import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  IconButton
} from '@mui/material';
import {
  Close,
  Add,
  Remove
} from '@mui/icons-material';

const ItemCustomizationModal = ({ 
  open, 
  onClose, 
  item, 
  onAddToCart,
  guestCount 
}) => {
  const [serves, setServes] = useState(10);
  const [quantity, setQuantity] = useState('XX pcs');

  // Helper function to get service count based on item type
  const getServiceCountForItem = (item) => {
    if (!item) return guestCount?.veg || 10;
    
    console.log('🔍 ItemModal - Checking item for service count:', item.name, {
      isVeg: item.isVeg,
      isNonVeg: item.isNonVeg,
      isJain: item.isJain,
      dietary: item.dietary
    });
    
    // Check if item is non-veg first (priority check)
    if (item.isNonVeg) {
      console.log('🍗 ItemModal - Non-veg item detected, using nonVeg count:', guestCount?.nonVeg || 10);
      return guestCount?.nonVeg || 10;
    }
    // Check if item is jain
    else if (item.isJain) {
      console.log('🌿 ItemModal - Jain item detected, using jain count:', guestCount?.jain || 1);
      return guestCount?.jain || 1;
    }
    // Default to veg (includes pure veg items and items without clear classification)
    else {
      console.log('🥗 ItemModal - Veg item detected, using veg count:', guestCount?.veg || 10);
      return guestCount?.veg || 10;
    }
  };

  // Reset values when modal opens
  useEffect(() => {
    if (open && item) {
      // For Breads and Desserts, the `serves` is the total guest count
      if (item.category === 'breads' || item.category === 'desserts') {
        setServes(item.serves || guestCount.veg + guestCount.nonVeg);
      } else {
        // For other items, use the existing logic
        const serviceCount = getServiceCountForItem(item);
        setServes(serviceCount);
      }
      setQuantity(item.portion_size || 'XX pcs');
    }
  }, [open, item, guestCount]);

  const handleAddToCart = () => {
    if (!item) return;
    
    // Determine serves/guest count for this item
    const effectiveServes = item.serves || serves || getServiceCountForItem(item);

    // Derive a per-guest/unit price so CartContext can do: unitPrice * quantity
    const totalForGuests = item.calculatedPrice || item.price || item.basePrice || 0;
    const unitPrice = effectiveServes > 0 ? Math.ceil(totalForGuests / effectiveServes) : totalForGuests;

    const customizedItem = {
      ...item,
      id: `${item.id}_${Date.now()}`,
      // Quantity reflects guest/serves count
      quantity: effectiveServes,
      serves: effectiveServes,
      calculatedQuantity: item.calculatedQuantity || item.portion_size || quantity, // Use calculated quantity from services
      // Ensure per-unit pricing so CartContext total is correct
      price: unitPrice,
      calculatedPrice: unitPrice,
      customizations: {
        serves: effectiveServes,
        quantity: item.calculatedQuantity || item.portion_size || quantity
      }
    };
    
    onAddToCart(customizedItem);
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={false}
      PaperProps={{
        sx: {
          borderRadius: { xs: '16px 16px 0 0', sm: 2 },
          maxWidth: { xs: '100%', sm: '500px' },
          width: { xs: '100%', sm: '500px' },
          m: { xs: 0, sm: 'auto' },
          position: { xs: 'fixed', sm: 'relative' },
          bottom: { xs: 0, sm: 'auto' },
          left: { xs: 0, sm: 'auto' },
          right: { xs: 0, sm: 'auto' },
          maxHeight: { xs: '80vh', sm: '90vh' }
        }
      }}
      sx={{
        '& .MuiDialog-container': {
          alignItems: { xs: 'flex-end', sm: 'center' },
          justifyContent: { xs: 'center', sm: 'center' }
        }
      }}
    >
      <DialogContent sx={{ p: 3 }}>
        {/* Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={onClose} sx={{ p: 0.5 }}>
            <Close />
          </IconButton>
        </Box>

        {/* Item Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Box
            component="img"
            src={item.image || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80'}
            alt={item.name}
            sx={{
              width: 60,
              height: 60,
              borderRadius: 1.5,
              objectFit: 'cover'
            }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
            }}
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
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
              <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                {item.name || item.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
              {item.description || 'Delicious north Indian Starter'}
            </Typography>
          </Box>
        </Box>

        {/* Customize Quantity */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, fontSize: '1.1rem' }}>
          Customize Quantity
        </Typography>

        {/* Serves and Quantity Controls */}
        <Box sx={{ display: 'flex', gap: 3, mb: 4 }}>
          {/* Serves */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Serves
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', borderRadius: 1, py: 1 }}>
              <IconButton
                size="small"
                onClick={() => setServes(Math.max(1, serves - 1))}
                sx={{ p: 0.5 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="h6" sx={{ mx: 2, minWidth: 30, textAlign: 'center', fontWeight: 'bold' }}>
                {serves}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setServes(serves + 1)}
                sx={{ p: 0.5 }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>

          {/* Quantity */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Quantity
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e0e0e0', borderRadius: 1, py: 1 }}>
              <IconButton
                size="small"
                onClick={() => {
                  const currentNum = parseInt(quantity.replace(/\D/g, '')) || 0;
                  const newNum = Math.max(1, currentNum - 1);
                  setQuantity(`${newNum} pcs`);
                }}
                sx={{ p: 0.5 }}
              >
                <Remove sx={{ fontSize: 16 }} />
              </IconButton>
              <Typography variant="h6" sx={{ mx: 2, minWidth: 50, textAlign: 'center', fontWeight: 'bold' }}>
                {quantity}
              </Typography>
              <IconButton
                size="small"
                onClick={() => {
                  const currentNum = parseInt(quantity.replace(/\D/g, '')) || 0;
                  const newNum = currentNum + 1;
                  setQuantity(`${newNum} pcs`);
                }}
                sx={{ p: 0.5 }}
              >
                <Add sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Add Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleAddToCart}
          sx={{
            bgcolor: '#1a237e',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: 1,
            '&:hover': {
              bgcolor: '#303f9f'
            }
          }}
        >
          Add | ₹{item.calculatedPrice || item.price || item.basePrice || 'XXXX'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ItemCustomizationModal;
