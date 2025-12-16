import React, { useState, useCallback, memo } from 'react';
import { Box, Typography, Grid, Card, CardActionArea, CardContent, IconButton, Button } from '@mui/material';
import { Add, Remove } from '@mui/icons-material';

// Hoisted: static meal types do not depend on props/state
const MEAL_TYPES = [
  { 
    id: 'jain', 
    name: 'Jain',
    icon: '🥗' // Bowl icon for Jain food
  },
  { 
    id: 'veg', 
    name: 'Veg',
    icon: '🥬' // Leafy greens for veg
  },
  { 
    id: 'veg_nonveg', 
    name: 'Veg + NonVeg',
    icon: '🍗' // Chicken leg for non-veg
  },
];

const MealTypeStep = ({ onNext, updateBookingData, initialGuestCount }) => {
  const [selectedMealType, setSelectedMealType] = useState(null);
  // Separate count states for each meal type (minimum 5 guests)
  const initialCount = Math.max(5, initialGuestCount || 5);
  const [pureVegCount, setPureVegCount] = useState(initialCount);
  const [comboVegCount, setComboVegCount] = useState(initialCount);
  const [comboNonVegCount, setComboNonVegCount] = useState(initialCount);
  const [jainCount, setJainCount] = useState(initialCount);

  const handleMealTypeSelect = useCallback((meal) => {
    setSelectedMealType(meal.id);
    
    // Only update relevant counts based on selected meal type
    const mealData = { mealType: meal.name };
    
    if (meal.id === 'veg') {
      mealData.vegCount = pureVegCount;
      mealData.nonVegCount = 0; // Reset non-veg count for pure veg
      mealData.jainCount = 0;
    } else if (meal.id === 'veg_nonveg') {
      mealData.vegCount = comboVegCount;
      mealData.nonVegCount = comboNonVegCount;
      mealData.jainCount = 0;
    } else if (meal.id === 'jain') {
      mealData.vegCount = 0;
      mealData.nonVegCount = 0;
      mealData.jainCount = jainCount;
    }
    
    updateBookingData(mealData);
  }, [pureVegCount, comboVegCount, comboNonVegCount, jainCount, updateBookingData]);

  const handleVegCountChange = useCallback((amount) => {
    if (selectedMealType === 'veg') {
      const newCount = Math.max(5, pureVegCount + amount);
      setPureVegCount(newCount);
      updateBookingData({ vegCount: newCount });
    } else if (selectedMealType === 'veg_nonveg') {
      const newCount = Math.max(5, comboVegCount + amount);
      setComboVegCount(newCount);
      updateBookingData({ vegCount: newCount });
    }
  }, [selectedMealType, pureVegCount, comboVegCount, updateBookingData]);

  const handleNonVegCountChange = useCallback((change) => {
    const newCount = Math.max(5, comboNonVegCount + change);
    setComboNonVegCount(newCount);
    
    // Only update booking data if veg_nonveg is selected
    if (selectedMealType === 'veg_nonveg') {
      updateBookingData({ nonVegCount: newCount });
    }
  }, [selectedMealType, comboNonVegCount, updateBookingData]);

  const handleJainCountChange = useCallback((amount) => {
    const newCount = Math.max(5, jainCount + amount);
    setJainCount(newCount);
    
    // Only update booking data if jain is selected
    if (selectedMealType === 'jain') {
      updateBookingData({ jainCount: newCount });
    }
  }, [selectedMealType, jainCount, updateBookingData]);

  const handleProceed = useCallback(() => {
    // Get the proper meal type name from the selected meal type ID
    const selectedMeal = MEAL_TYPES.find(meal => meal.id === selectedMealType);
    const mealTypeName = selectedMeal ? selectedMeal.name : selectedMealType;
    
    // Save the meal type and guest count data
    const mealData = {
      mealType: mealTypeName,
      vegCount: selectedMealType === 'veg' ? pureVegCount : selectedMealType === 'veg_nonveg' ? comboVegCount : 5,
      nonVegCount: selectedMealType === 'veg_nonveg' ? comboNonVegCount : 5,
      jainCount: selectedMealType === 'jain' ? jainCount : 5
    };
    
    
    updateBookingData(mealData);
    
    // Call onNext to let BookingWizard handle the completion
    setTimeout(() => {
      onNext();
    }, 300);
  }, [selectedMealType, pureVegCount, comboVegCount, comboNonVegCount, jainCount, updateBookingData, onNext]);

  return (
    <Box sx={{ 
      textAlign: 'center', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      maxHeight: { xs: 'calc(100vh - 240px)', sm: 'none' },
      overflow: 'hidden'
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold', 
          mb: { xs: 1, sm: 2 },
          fontSize: { xs: '1.3rem', sm: '2rem' }
        }}
      >
        Meal Type
      </Typography>
      
      {/* Meal Type Selection */}
      <Grid 
        container 
        spacing={{ xs: 1, sm: 1, md: 1.5 }} 
        sx={{ 
          mb: { xs: 1.5, sm: 3 },
          flex: '0 0 auto',
          justifyContent: { xs: 'flex-start', sm: 'center', md: 'center' },
          maxWidth: { sm: '600px', md: '700px' },
          margin: { sm: '0 auto', md: '0 auto' }
        }}
      >
        {MEAL_TYPES.map((meal) => (
          <Grid item xs={6} sm={4} md={4} key={meal.id}>
            <Card
              variant="outlined"
              sx={{
                borderRadius: { xs: 2, sm: 3 },
                borderColor: selectedMealType === meal.id ? '#ff6b35' : 'grey.300',
                borderWidth: 2,
                mx: 'auto',
                transition: 'all 0.2s ease-in-out',
                height: { xs: '60px', sm: '100px' },
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 2
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleMealTypeSelect(meal)} 
                sx={{ 
                  p: { xs: 1.5, sm: 3 },
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CardContent sx={{ p: 0, textAlign: 'center' }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      mb: { xs: 0.5, sm: 1 },
                      fontSize: { xs: '1.5rem', sm: '2rem' }
                    }}
                  >
                    {meal.icon}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'medium',
                      fontSize: { xs: '0.8rem', sm: '1.125rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {meal.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Guest Count */}
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold', 
          mb: { xs: 1, sm: 2 },
          fontSize: { xs: '1.2rem', sm: '2rem' }
        }}
      >
        Guest Count
      </Typography>
    

      {/* Guest Count Controls - Show for all meal types */}
      {(selectedMealType === 'veg' || selectedMealType === 'veg_nonveg' || selectedMealType === 'jain') && (
        <Box sx={{ 
          mb: { xs: 1.5, sm: 3 },
          px: { xs: 2, sm: 4 },
          flex: '0 0 auto'
        }}>
          {/* For Veg + NonVeg: Show both controls side by side */}
          {selectedMealType === 'veg_nonveg' ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'center',
              gap: { xs: 2, sm: 4, md: 6 },
              flexWrap: { xs: 'wrap', sm: 'nowrap' }
            }}>
              {/* Veg Count */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  No of Pax (Veg):
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  bgcolor: 'white',
                  overflow: 'hidden'
                }}>
                  <IconButton 
                    onClick={() => handleVegCountChange(-1)} 
                    size="small"
                    sx={{ 
                      borderRadius: 0,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    <Remove sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      minWidth: 40, 
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: 'medium',
                      px: 1,
                      py: 0.5
                    }}
                  >
                    {selectedMealType === 'veg' ? pureVegCount : comboVegCount}
                  </Typography>
                  <IconButton 
                    onClick={() => handleVegCountChange(1)} 
                    size="small"
                    sx={{ 
                      borderRadius: 0,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    <Add sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>

              {/* Non-Veg Count */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 2
              }}>
                <Typography 
                  variant="body1" 
                  sx={{ 
                    fontWeight: 'medium',
                    fontSize: { xs: '0.95rem', sm: '1rem' },
                    whiteSpace: 'nowrap'
                  }}
                >
                  No of Pax (NonVeg):
                </Typography>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  border: '1px solid #ddd',
                  borderRadius: 2,
                  bgcolor: 'white',
                  overflow: 'hidden'
                }}>
                  <IconButton 
                    onClick={() => handleNonVegCountChange(-1)} 
                    size="small"
                    sx={{ 
                      borderRadius: 0,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    <Remove sx={{ fontSize: 16 }} />
                  </IconButton>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      minWidth: 40, 
                      textAlign: 'center',
                      fontSize: '1rem',
                      fontWeight: 'medium',
                      px: 1,
                      py: 0.5
                    }}
                  >
                    {comboNonVegCount}
                  </Typography>
                  <IconButton 
                    onClick={() => handleNonVegCountChange(1)} 
                    size="small"
                    sx={{ 
                      borderRadius: 0,
                      width: 32,
                      height: 32,
                      '&:hover': {
                        bgcolor: 'grey.100'
                      }
                    }}
                  >
                    <Add sx={{ fontSize: 16 }} />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ) : selectedMealType === 'veg' ? (
            /* For Veg only: Show single control */
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 4
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'medium',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  whiteSpace: 'nowrap'
                }}
              >
                No of Pax (Veg):
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid #ddd',
                borderRadius: 2,
                bgcolor: 'white',
                overflow: 'hidden'
              }}>
                <IconButton 
                  onClick={() => handleVegCountChange(-1)} 
                  size="small"
                  sx={{ 
                    borderRadius: 0,
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  <Remove sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    minWidth: 40, 
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    px: 1,
                    py: 0.5
                  }}
                >
                  {pureVegCount}
                </Typography>
                <IconButton 
                  onClick={() => handleVegCountChange(1)} 
                  size="small"
                  sx={{ 
                    borderRadius: 0,
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          ) : (
            /* For Jain: Show single control */
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 4
            }}>
              <Typography 
                variant="body1" 
                sx={{ 
                  fontWeight: 'medium',
                  fontSize: { xs: '0.95rem', sm: '1rem' },
                  whiteSpace: 'nowrap'
                }}
              >
                No of Pax:
              </Typography>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                border: '1px solid #ddd',
                borderRadius: 2,
                bgcolor: 'white',
                overflow: 'hidden'
              }}>
                <IconButton 
                  onClick={() => handleJainCountChange(-1)} 
                  size="small"
                  sx={{ 
                    borderRadius: 0,
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  <Remove sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    minWidth: 40, 
                    textAlign: 'center',
                    fontSize: '1rem',
                    fontWeight: 'medium',
                    px: 1,
                    py: 0.5
                  }}
                >
                  {jainCount}
                </Typography>
                <IconButton 
                  onClick={() => handleJainCountChange(1)} 
                  size="small"
                  sx={{ 
                    borderRadius: 0,
                    width: 32,
                    height: 32,
                    '&:hover': {
                      bgcolor: 'grey.100'
                    }
                  }}
                >
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
            </Box>
          )}
        </Box>
      )}

      {/* See Packages Button */}
      <Box sx={{ mt: 'auto', pt: { xs: 2, sm: 0 } }}>
        <Button
          variant="contained"
          onClick={handleProceed}
          disabled={!selectedMealType}
          sx={{
            bgcolor: '#1e3a8a',
            color: 'white',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 4, sm: 6 },
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 600,
            borderRadius: 2,
            textTransform: 'none',
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '280px', sm: 'none' },
            mx: 'auto',
            '&:hover': {
              bgcolor: '#1e40af'
            },
            '&:disabled': {
              bgcolor: 'grey.300'
            }
          }}
        >
          Proceed
        </Button>
      </Box>
    </Box>
  );
};

export default memo(MealTypeStep);
