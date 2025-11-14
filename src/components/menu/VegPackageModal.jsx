import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
  Typography,
  Button,
  IconButton,
  Checkbox,
  FormControlLabel,
  Divider,
  Alert,
  Chip,
  TextField,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { Close, Add, Remove, Star, Warning } from '@mui/icons-material';
import { vegMenuStandard499, vegMenuPremium499 } from '../../data/Veg-menu';

const VegPackageModal = ({ 
  open, 
  onClose, 
  packageType: initialPackageType = 'standard', 
  menuItems = [], 
  onAddToCart,
  guestCount = 20,
  preSelectedItem = null
}) => {
  // Package type state (Standard/Premium)
  const [packageType, setPackageType] = useState(initialPackageType);
  // Package limits based on your spreadsheet
  const packageLimits = {
    starters: 3,
    main: 3,
    rice: 1,
    breads: 2,
    dessert: 1
  };

  // Package pricing (per guest)
  const packagePricing = {
    standard: { price: 499, name: 'Standard Menu Veg (499)' },
    premium: { price: 499, name: 'Premium Menu Veg (499)' }
  };

  // Get menu items based on package type from Veg-menu.js
  const getPackageMenuItems = () => {
    const menuData = packageType === 'premium' ? vegMenuPremium499 : vegMenuStandard499;
    
    // Group items by category
    const groupedItems = menuData.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push({
        ...item,
        // Mark all items as vegetarian since this is VegPackageModal
        isVeg: true,
        isNonVeg: false,
        // Quantity for current guest count (scaled from base serves count)
        scaledQuantity: (() => {
          const baseServes = item.serves || 20;
          // Extract numeric value from quantity string (e.g., "40pc" -> 40, "2kg" -> 2)
          const quantityMatch = item.quantity?.toString().match(/[\d.]+/);
          const quantityValue = quantityMatch ? parseFloat(quantityMatch[0]) : 0;
          
          if (quantityValue === 0) {
            return item.quantity; // fallback if parsing fails
          }
          
          const scaledValue = (quantityValue / baseServes) * guestCount;
          
          if (item.unit === 'pcs') {
            return `${Math.round(scaledValue)}pc`;
          } else if (item.unit === 'kg') {
            return `${scaledValue.toFixed(1)}kg`;
          } else {
            // Try to detect unit from original quantity string
            if (item.quantity?.includes('pc')) {
              return `${Math.round(scaledValue)}pc`;
            } else if (item.quantity?.includes('kg')) {
              return `${scaledValue.toFixed(1)}kg`;
            } else {
              return item.quantity; // fallback to original quantity
            }
          }
        })()
      });
      return acc;
    }, {});
    
    return groupedItems;
  };


  // Selected items state with quantities
  const [selectedItems, setSelectedItems] = useState({
    starters: [],
    main: [],
    rice: [],
    breads: [],
    dessert: []
  });

  // Serves count - should match guest count
  const [serves, setServes] = useState(guestCount);
  
  // Keep serves synchronized with guestCount
  useEffect(() => {
    setServes(guestCount);
  }, [guestCount]);
  
  // Limit reached popup state
  const [limitReachedOpen, setLimitReachedOpen] = useState(false);
  const [limitMessage, setLimitMessage] = useState('');

  // Handle pre-selected item when modal opens
  useEffect(() => {
    if (open && preSelectedItem) {
      // Determine the category of the pre-selected item
      const itemCategory = preSelectedItem.category;
      let targetCategory = itemCategory;
      
      // Map category names if needed
      if (itemCategory === 'starters') targetCategory = 'starters';
      else if (itemCategory === 'main_course' || itemCategory === 'main') targetCategory = 'main';
      else if (itemCategory === 'breads') targetCategory = 'breads';
      else if (itemCategory === 'desserts' || itemCategory === 'dessert') targetCategory = 'dessert';
      
      // Add a small delay to ensure the modal is fully rendered
      setTimeout(() => {
        setSelectedItems(prev => {
          const isAlreadySelected = prev[targetCategory]?.some(item => item.id === preSelectedItem.id);
          
          if (!isAlreadySelected && targetCategory && packageLimits[targetCategory]) {
            const currentCount = prev[targetCategory]?.length || 0;
            const limit = packageLimits[targetCategory];
            
            
            if (currentCount < limit) {
              return {
                ...prev,
                [targetCategory]: [...(prev[targetCategory] || []), preSelectedItem]
              };
            }
          }
          return prev;
        });
      }, 100);
    }
  }, [open, preSelectedItem]);

  // Reset selected items when modal closes or package type changes
  useEffect(() => {
    if (!open) {
      setSelectedItems({
        starters: [],
        main: [],
        rice: [],
        breads: [],
        dessert: []
      });
    }
  }, [open]);

  // Reset selections when package type changes
  useEffect(() => {
    setSelectedItems({
      starters: [],
      main: [],
      rice: [],
      breads: [],
      dessert: []
    });
  }, [packageType]);

  // Get items by category from package menu data
  const itemsByCategory = getPackageMenuItems();

  // Handle item selection with enhanced limit validation and alerts
  const handleItemToggle = (item, category) => {
    const categoryItems = selectedItems[category] || [];
    const isSelected = categoryItems.some(selected => selected.id === item.id);
    const limit = packageLimits[category];
    
    if (isSelected) {
      // Remove item
      setSelectedItems(prev => ({
        ...prev,
        [category]: categoryItems.filter(selected => selected.id !== item.id)
      }));
    } else {
      // Check if we can add more items
      if (categoryItems.length >= limit) {
        // Enhanced alert message based on category
        const categoryName = {
          starters: 'Starters',
          main: 'Main Course',
          rice: 'Rice',
          breads: 'Breads',
          dessert: 'Desserts'
        }[category] || category;
        
        const message = `⚠️ ${categoryName} Limit Reached!\n\nYou can select maximum ${limit} ${categoryName.toLowerCase()} items in this package.\n\nPlease remove one item to add "${item.title}".`;
        setLimitMessage(message);
        setLimitReachedOpen(true);
      } else {
        // Add item
        setSelectedItems(prev => ({
          ...prev,
          [category]: [...categoryItems, item]
        }));
      }
    }
  };

  // Check if item is selected
  const isItemSelected = (item, category) => {
    return selectedItems[category]?.some(selected => selected.id === item.id) || false;
  };

  // Get remaining slots for category
  const getRemainingSlots = (category) => {
    const limit = packageLimits[category];
    const selected = selectedItems[category]?.length || 0;
    return limit - selected;
  };

  // Check if category is full
  const isCategoryFull = (category) => {
    return getRemainingSlots(category) === 0;
  };

  // Get total selected items count
  const getTotalSelectedCount = () => {
    return Object.values(selectedItems).reduce((total, items) => total + items.length, 0);
  };

  // Compute pricing for current selection (₹499 per guest)
  const getPackagePricing = () => {
    const pricePerGuest = packagePricing[packageType].price;
    const packagePrice = pricePerGuest * guestCount;
    return { pricePerGuest, packagePrice };
  };

  // Handle add to cart
  const handleAddPackageToCart = () => {
    // Calculate total selected items
    const totalSelected = Object.values(selectedItems).reduce((total, items) => total + items.length, 0);

    // Pricing: ₹499 per guest (both Standard and Premium)
    // Use per-guest price as unit price; let cart multiply by quantity (guestCount)
    const { pricePerGuest, packagePrice } = getPackagePricing();
    const quantity = guestCount;
    
    const cleanName = (item) => {
      const raw = item.title || item.name || '';
      // Remove patterns like "(40pc)", "(0.7kg)", "(14 PCS)", "(0.7 KG)" etc.
      return raw.replace(/\s*\(([^)]*(pc|pcs|kg|gm|g|PCS|KG|GM)[^)]*)\)\s*/gi, ' ').trim();
    };

    const packageItem = {
      id: `veg_package_${Date.now()}`,
      name: packagePricing[packageType].name,
      // Use per-guest pricing so cart quantity reflects guest count
      price: pricePerGuest,
      // Do not store total in calculatedPrice to avoid double-multiplying in CartContext
      calculatedPrice: pricePerGuest,
      quantity,
      serves: serves,
      guestCount: guestCount,
      isPackage: true,
      isVeg: true, // Mark as vegetarian package
      isNonVeg: false, // Explicitly mark as not non-vegetarian
      packageType: packageType,
      selectedItems: selectedItems,
      packageDetails: {
        // Only store clean item names here; strip quantity markers like (40pc), (0.7kg), etc.
        starters: selectedItems.starters?.map(cleanName) || [],
        main: selectedItems.main?.map(cleanName) || [],
        rice: selectedItems.rice?.map(cleanName) || [],
        breads: selectedItems.breads?.map(cleanName) || [],
        dessert: selectedItems.dessert?.map(cleanName) || [],
        extras: ['Raita & Salad']
      },
      totalSelectedItems: totalSelected,
      priceBreakdown: {
        packagePrice: packagePrice,
        guestCount: guestCount,
        pricePerGuest: pricePerGuest
      }
    };

    onAddToCart(packageItem);
    onClose();
  };

  // Check if package is complete (all required categories have selections)
  const isPackageComplete = () => {
    return Object.keys(packageLimits).every(category => {
      const selected = selectedItems[category]?.length || 0;
      return selected > 0; // At least one item selected in each category
    });
  };

  // Reset selections when modal opens
  useEffect(() => {
    if (open) {
      setSelectedItems({
        starters: [],
        main: [],
        rice: [],
        breads: [],
        dessert: []
      });
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          width: '500px'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        pb: 2,
        bgcolor: '#f8f9fa'
      }}>
        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333', fontSize: '1.1rem' }}>
              {packagePricing[packageType].name}
            </Typography>
            <Chip 
              label={packageType === 'premium' ? 'Premium' : 'Standard'} 
              color={packageType === 'premium' ? 'warning' : 'primary'}
              size="small"
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          {/* Package Type Selector */}
          <ToggleButtonGroup
            value={packageType}
            exclusive
            onChange={(e, newPackageType) => {
              if (newPackageType !== null) {
                setPackageType(newPackageType);
              }
            }}
            size="small"
            sx={{ mb: 2 }}
          >
            <ToggleButton value="standard" sx={{ px: 2, py: 0.5, fontSize: '0.8rem' }}>
              Standard Menu
            </ToggleButton>
            <ToggleButton value="premium" sx={{ px: 2, py: 0.5, fontSize: '0.8rem' }}>
              Premium Menu
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">• 3 Starters</Typography>
            <Typography variant="body2" color="text.secondary">• 3 Main Course</Typography>
            <Typography variant="body2" color="text.secondary">• 1 Rice</Typography>
            <Typography variant="body2" color="text.secondary">• 2 Breads</Typography>
            <Typography variant="body2" color="text.secondary">• 1 Desserts</Typography>
            <Typography variant="body2" color="text.secondary">• Raita & Salad</Typography>
          </Box>
          
          <Typography variant="caption" sx={{ color: '#666', mt: 1, display: 'block' }}>
            Quantity for {guestCount} guests • Prices calculated per guest
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* Customize Your Meal Header */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
          Customize Your Meal
        </Typography>
        <Typography variant="body2" sx={{ color: '#666', mb: 2, fontStyle: 'italic' }}>
          Select your preferred items - Package price remains ₹{packagePricing[packageType].price}
        </Typography>

        {/* Starters Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            Starters
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select any 3 items
          </Typography>
          
          {(itemsByCategory.starters || []).map((item) => {
            const isSelected = isItemSelected(item, 'starters');
            const isDisabled = !isSelected && isCategoryFull('starters');
            
            return (
              <Box key={item.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                py: 1, 
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: isDisabled ? '#f8f8f8' : 'transparent',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: isDisabled ? '#f0f0f0' : '#f5f5f5'
                }
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      disabled={false} // Never disable checkbox, handle click logic instead
                      onChange={() => handleItemToggle(item, 'starters')}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: '500' }}>{item.title || item.name}</span>
                      </Box>
                      
                    </Box>
                  }
                  sx={{ 
                    flex: 1,
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.9rem',
                      color: isDisabled ? '#666' : 'inherit'
                    }
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #1976d2',
                  borderRadius: 1,
                  bgcolor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      borderRadius: 0,
                      minWidth: '32px',
                      height: '32px',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={() => {
                      // Handle decrement logic for starters
                    }}
                  >
                    <Remove sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Box sx={{ 
                    px: 1, 
                    py: 1, 
                    minWidth: '35px', 
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {item.scaledQuantity || item.quantity}
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      borderRadius: 0,
                      minWidth: '32px',
                      height: '32px',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={() => {
                      // Handle increment logic for starters
                    }}
                  >
                    <Add sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Main Course Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            Main Course
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select any 3 items
          </Typography>
          
          {(itemsByCategory.main || []).map((item) => {
            const isSelected = isItemSelected(item, 'main');
            const isDisabled = !isSelected && isCategoryFull('main');
            
            return (
              <Box key={item.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                py: 1, 
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: isDisabled ? '#f8f8f8' : 'transparent', // Light gray background for disabled items
                cursor: 'pointer', 
                '&:hover': {
                  backgroundColor: isDisabled ? '#f0f0f0' : '#f5f5f5' // Hover effect
                }
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      disabled={false} // Never disable checkbox, handle click logic instead
                      onChange={() => handleItemToggle(item, 'main')}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: '500' }}>{item.title || item.name}</span>
                      </Box>
                    </Box>
                  }
                  sx={{ 
                    flex: 1,
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.9rem',
                      color: isDisabled ? '#999' : 'inherit'
                    }
                  }}
                />
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #1976d2',
                  borderRadius: 1,
                  bgcolor: 'white',
                  overflow: 'hidden',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      borderRadius: 0,
                      minWidth: '32px',
                      height: '32px',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={() => {
                      // Handle decrement logic for main course
                    }}
                  >
                    <Remove sx={{ fontSize: 14 }} />
                  </IconButton>
                  <Box sx={{ 
                    px: 1, 
                    py: 1, 
                    minWidth: '35px', 
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {item.scaledQuantity || item.quantity}
                  </Box>
                  <IconButton 
                    size="small" 
                    sx={{ 
                      borderRadius: 0,
                      minWidth: '32px',
                      height: '32px',
                      '&:hover': { bgcolor: '#f5f5f5' }
                    }}
                    onClick={() => {
                      // Handle increment logic for main course
                    }}
                  >
                    <Add sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Rice Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            Rice
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select any 1 item
          </Typography>
          
          {(itemsByCategory.rice || []).map((item) => {
            const isSelected = isItemSelected(item, 'rice');
            const isDisabled = !isSelected && isCategoryFull('rice');
            
            return (
              <Box key={item.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                py: 1, 
                borderBottom: '1px solid #f0f0f0',
                opacity: isDisabled ? 0.6 : 1
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      disabled={false}
                      onChange={() => handleItemToggle(item, 'rice')}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: '500' }}>{item.title || item.name}</span>
                        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 12, color: '#ffa726' }} />
                          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                            {item.rating?.toFixed(1) || '4.5'}
                          </Typography>
                        </Box> */}
                      </Box>
                      {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          • {item.scaledQuantity || item.quantity}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          • For {guestCount} guests
                        </Typography>
                      </Box> */}
                    </Box>
                  }
                  sx={{ 
                    flex: 1,
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.9rem',
                      color: isDisabled ? '#999' : 'inherit'
                    }
                  }}
                />
                <TextField
                  size="small"
                  value={item.scaledQuantity || item.quantity}
                  disabled
                  sx={{ 
                    width: '80px',
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* Breads Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            Breads
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select any 2 items
          </Typography>
          
          {(itemsByCategory.breads || []).map((item) => {
            const isSelected = isItemSelected(item, 'breads');
            const isDisabled = !isSelected && isCategoryFull('breads');
            
            return (
              <Box key={item.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                py: 1, 
                borderBottom: '1px solid #f0f0f0',
                opacity: isDisabled ? 0.6 : 1 // Show disabled items with reduced opacity
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      disabled={false} // Never disable checkbox, handle click logic instead
                      onChange={() => handleItemToggle(item, 'breads')}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: '500' }}>{item.title || item.name}</span>
                        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 12, color: '#ffa726' }} />
                          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                            {item.rating?.toFixed(1) || '4.2'}
                          </Typography>
                        </Box> */}
                      </Box>
                      {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          • {item.scaledQuantity || item.quantity}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          • For {guestCount} guests
                        </Typography>
                      </Box> */}
                    </Box>
                  }
                  sx={{ 
                    flex: 1,
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.9rem',
                      color: isDisabled ? '#999' : 'inherit'
                    }
                  }}
                />
                <TextField
                  size="small"
                  value={item.scaledQuantity || item.quantity}
                  disabled
                  sx={{ 
                    width: '80px',
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </Box>
            );
          })}
        </Box>

        {/* Desserts Section */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#333' }}>
            Desserts
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Please select any 1 item
          </Typography>
          
          {(itemsByCategory.dessert || []).map((item) => {
            const isSelected = isItemSelected(item, 'dessert');
            const isDisabled = !isSelected && isCategoryFull('dessert');
            
            return (
              <Box key={item.id} sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                py: 1, 
                borderBottom: '1px solid #f0f0f0',
                opacity: isDisabled ? 0.6 : 1 // Show disabled items with reduced opacity
              }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={isSelected}
                      disabled={false} // Never disable checkbox, handle click logic instead
                      onChange={() => handleItemToggle(item, 'dessert')}
                      color="primary"
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontWeight: '500' }}>{item.title || item.name}</span>
                        {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 12, color: '#ffa726' }} />
                          <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                            {item.rating?.toFixed(1) || '4.4'}
                          </Typography>
                        </Box> */}
                      </Box>
                      {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          • {item.scaledQuantity || item.quantity}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', fontSize: '0.7rem' }}>
                          • For {guestCount} guests
                        </Typography>
                      </Box> */}
                    </Box>
                  }
                  sx={{ 
                    flex: 1,
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.9rem',
                      color: isDisabled ? '#999' : 'inherit'
                    }
                  }}
                />
                <TextField
                  size="small"
                  value={item.scaledQuantity || item.quantity}
                  disabled
                  sx={{ 
                    width: '80px',
                    '& .MuiInputBase-input': {
                      textAlign: 'center',
                      fontSize: '0.8rem'
                    }
                  }}
                />
              </Box>
            );
          })}
        </Box>


        {/* Serves Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#333' }}>
            Serves
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setServes(Math.max(1, serves - 1))}>
              <Remove sx={{ fontSize: 16 }} />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: '40px', textAlign: 'center', fontWeight: 'bold' }}>
              {serves}
            </Typography>
            <IconButton size="small" onClick={() => setServes(serves + 1)}>
              <Add sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>

        {/* Add Button */}
        {/* Package Summary */}
        {(() => {
          const { pricePerGuest, packagePrice } = getPackagePricing();
          return (
        <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
            Package Summary
          </Typography>
          <Typography variant="caption" sx={{ color: '#666', mb: 2, display: 'block', fontStyle: 'italic' }}>
            ₹{pricePerGuest} per guest • Total price updates as you change guest count
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Selected Items:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {getTotalSelectedCount()} / {Object.values(packageLimits).reduce((a, b) => a + b, 0)}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2">Guest Count:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{guestCount} guests</Typography>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2">Package Price:</Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#2e7d32' }}>
              ₹{packagePrice}
            </Typography>
          </Box>
        </Box>
          );
        })()}

        <Button
          fullWidth
          variant="contained"
          onClick={handleAddPackageToCart}
          disabled={!isPackageComplete()}
          sx={{
            bgcolor: isPackageComplete() ? '#1976d2' : '#ccc',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: 1,
            '&:hover': {
              bgcolor: isPackageComplete() ? '#1565c0' : '#ccc'
            },
            '&:disabled': {
              bgcolor: '#ccc',
              color: '#666'
            }
          }}
        >
          {(() => {
            const { packagePrice } = getPackagePricing();
            return isPackageComplete() 
              ? `Add Package | ₹${packagePrice}` 
              : 'Please complete your selection';
          })()}
        </Button>
      </DialogContent>

      {/* Limit Reached Popup */}
      <Dialog
        open={limitReachedOpen}
        onClose={() => {
          setLimitReachedOpen(false);
        }}
        maxWidth="xs"
        fullWidth
        sx={{
          zIndex: 99999, // Even higher z-index
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.9)' // Even darker backdrop
          }
        }}
        BackdropProps={{
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)'
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            textAlign: 'center',
            p: 3,
            backgroundColor: 'white',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            minWidth: '320px',
            border: '2px solid red', // Temporary red border for visibility
            position: 'relative',
            zIndex: 10000
          }
        }}
      >
        <DialogContent sx={{ pt: 2, pb: 1, px: 3, textAlign: 'center' }}>
          <Box sx={{ 
            width: 60, 
            height: 60, 
            borderRadius: '50%', 
            bgcolor: '#ff5722', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mx: 'auto',
            mb: 2
          }}>
            <Warning sx={{ color: 'white', fontSize: 30 }} />
          </Box>
          <Typography variant="h6" sx={{ 
            fontWeight: 'bold', 
            mb: 2, 
            color: '#d32f2f'
          }}>
            Selection Limit Reached!
          </Typography>
          <Typography variant="body1" sx={{ 
            fontWeight: '400', 
            mb: 2, 
            color: '#333',
            fontSize: '14px',
            lineHeight: 1.5,
            whiteSpace: 'pre-line'
          }}>
            {limitMessage}
          </Typography>
        </DialogContent>
        <Box sx={{ px: 3, pb: 3, pt: 1 }}>
          <Button
            variant="contained"
            onClick={() => setLimitReachedOpen(false)}
            sx={{
              bgcolor: '#1976d2',
              px: 6,
              py: 1.2,
              borderRadius: 2,
              fontSize: '14px',
              fontWeight: '600',
              textTransform: 'none',
              minWidth: '100px',
              '&:hover': {
                bgcolor: '#1565c0'
              }
            }}
          >
            Okay
          </Button>
        </Box>
      </Dialog>
    </Dialog>
  );
};

export default VegPackageModal;
