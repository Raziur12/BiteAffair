import React, { useState, useRef, useCallback } from 'react';
import { 
  Box, Typography, Grid, Card, CardActionArea, CardContent, TextField, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, IconButton, InputAdornment
} from '@mui/material';
import { Cake, House, Celebration, Group, CalendarMonth, AccessTime, Close } from '@mui/icons-material';
import { locationService } from '../../services/locationService';

const occasions = [
  { id: 'birthday', name: 'Birthday', icon: <Cake sx={{ fontSize: { xs: 28, sm: 40 } }} /> },
  { id: 'house_party', name: 'House Party', icon: <House sx={{ fontSize: { xs: 28, sm: 40 } }} /> },
  { id: 'pooja', name: 'Pooja', icon: <Celebration sx={{ fontSize: { xs: 28, sm: 40 } }} /> },
  { id: 'pre_wedding', name: 'Pre-Wedding', icon: <Group sx={{ fontSize: { xs: 28, sm: 40 } }} /> },
  { id: 'office_party', name: 'Office Party', icon: <Group sx={{ fontSize: { xs: 28, sm: 40 } }} /> },
  { id: 'others', name: 'Others', icon: <Celebration sx={{ fontSize: { xs: 28, sm: 40 } }} /> },
];

const LocationStep = ({ onNext, updateBookingData, onLocationSelect }) => {
  const dateInputRef = useRef(null);
  const startTimeRef = useRef(null);
  const endTimeRef = useRef(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [showDateTime, setShowDateTime] = useState(false);
  const [timePickerOpen, setTimePickerOpen] = useState(false);
  const [tempStartTime, setTempStartTime] = useState('');
  const [tempEndTime, setTempEndTime] = useState('');
  
  const locations = locationService.getAvailableLocations();

  

  const openDatePicker = useCallback(() => {
    if (dateInputRef.current) {
      if (typeof dateInputRef.current.showPicker === 'function') {
        dateInputRef.current.showPicker();
      } else {
        dateInputRef.current.focus();
        dateInputRef.current.click();
      }
    }
  }, []);

  const openTimePicker = useCallback((inputRef) => {
    if (inputRef && inputRef.current) {
      const input = inputRef.current;
      if (typeof input.showPicker === 'function') {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    }
  }, []);

  const handleLocationSelect = useCallback((location) => {
    setSelectedLocation(location.id);
    updateBookingData({ location: location.name });
    if (onLocationSelect) {
      onLocationSelect(location.name);
    }
    setShowDateTime(true);
  }, [onLocationSelect, updateBookingData]);

  const handleOccasionSelect = useCallback((occasion) => {
    setSelectedOccasion(occasion.id);
    updateBookingData({ occasion: occasion.name });
  }, [updateBookingData]);

  const handleDateTimeSubmit = useCallback(() => {
    // Format time range like "02:00 PM - 02:30 PM"
    const timeRange = formatTimeRange(startTime, endTime);
    updateBookingData({ 
      eventDate: selectedDate,
      eventTime: timeRange,
      startTime: startTime,
      endTime: endTime
    });
    setTimeout(() => {
      onNext();
    }, 300);
  }, [endTime, onNext, selectedDate, startTime, updateBookingData]);

  // Function to format time to 12-hour format with AM/PM
  const formatTime12Hour = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  };

  // Function to format time range
  const formatTimeRange = (start, end) => {
    if (!start || !end) return '';
    return `${formatTime12Hour(start)} - ${formatTime12Hour(end)}`;
  };

  // Auto-calculate end time (1 hour after start time)
  const handleStartTimeChange = useCallback((newStartTime) => {
    setTempStartTime(newStartTime);
    if (newStartTime) {
      const [hours, minutes] = newStartTime.split(':');
      const startHour = parseInt(hours);
      const endHour = (startHour + 1) % 24;
      const endTimeFormatted = `${endHour.toString().padStart(2, '0')}:${minutes}`;
      setTempEndTime(endTimeFormatted);
    }
  }, []);

  // Open time picker modal
  const handleTimePickerOpen = useCallback(() => {
    setTempStartTime(startTime);
    setTempEndTime(endTime);
    setTimePickerOpen(true);
  }, [endTime, startTime]);

  // Save time from modal
  const handleTimeSave = useCallback(() => {
    setStartTime(tempStartTime);
    setEndTime(tempEndTime);
    setTimePickerOpen(false);
  }, [tempEndTime, tempStartTime]);

  const locationIcons = {
    delhi: '🏛️',
    gurugram: '🏢',
    noida: '⚙️',
    faridabad: '🏭',
    ghaziabad: '🏗️',
  };

  return (
    <Box sx={{ textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 'bold', 
          mt: { xs: -1.5, sm: -2 },
          mb: { xs: 0.5, sm: 1 },
          fontSize: { xs: '1.5rem', sm: '2rem' }
        }}
      >
        Choose Your Location
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary" 
        sx={{ 
          mb: { xs: 1.5, sm: 2.5 },
          fontSize: { xs: '0.875rem', sm: '1rem' }
        }}
      >
        Select a location to view available services
      </Typography>
      <Grid 
        container 
        spacing={{ xs: 1.5, sm: 1, md: 1.5 }} 
        sx={{ 
          flex: 1,
          alignContent: 'flex-start',
          maxHeight: { xs: 'calc(100vh - 300px)', sm: 'none' },
          justifyContent: { xs: 'flex-start', sm: 'center', md: 'center' },
          maxWidth: { sm: '600px', md: '700px' },
          margin: { sm: '0 auto', md: '0 auto' }
        }}
      >
        {locations.map((location) => (
          <Grid 
            item 
            xs={6} 
            sm={2.4}
            md={2.4} 
            key={location.id}
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          >
            <Card
              variant="outlined"
              sx={{
                borderRadius: { xs: 2, sm: 2 },
                borderColor: selectedLocation === location.id ? '#ff9800' : 'grey.300',
                borderWidth: selectedLocation === location.id ? 3 : 1,
                transform: selectedLocation === location.id ? 'scale(1.02)' : 'none',
                transition: 'all 0.2s ease-in-out',
                height: { xs: '100px', sm: '100px', md: '100px' },
                width: { xs: '130px', md: '130px' },
                backgroundColor: selectedLocation === location.id ? 'rgba(255, 152, 0, 0.05)' : 'transparent',
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 2
                }
              }}
            >
              <CardActionArea 
                onClick={() => handleLocationSelect(location)} 
                sx={{ 
                  p: { xs: 1, sm: 1 },
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
                      mb: { xs: 0.25, sm: 0.5 },
                      fontSize: { xs: '2rem', sm: '2rem' }
                    }}
                  >
                    {locationIcons[location.id] || '📍'}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 'medium',
                      fontSize: { xs: '0.95rem', sm: '0.95rem' },
                      lineHeight: 1.1
                    }}
                  >
                    {location.name}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Occasion Date & Time Section */}
      {showDateTime && (
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 3,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Occasion Date & Time
          </Typography>
          
          {/* Date and Time Row */}
          <Box sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            mb: 3
          }}>
            {/* Date Picker */}
            <TextField
              type="date"
              label="Select Event Date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              inputRef={dateInputRef}
              onClick={openDatePicker}
              InputLabelProps={{
                shrink: true,
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarMonth
                      sx={{ color: 'action.active', cursor: 'pointer' }}
                      onClick={openDatePicker}
                    />
                  </InputAdornment>
                ),
              }}
              sx={{ 
                minWidth: { xs: '100%', sm: '200px' },
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-input': {
                    py: 0.75, // reduce vertical padding for shorter height
                  },
                },
                '& input::-webkit-calendar-picker-indicator': {
                  display: 'none',
                  WebkitAppearance: 'none',
                },
              }}
            />

            {/* Time Picker Button */}
            <Button
              variant="outlined"
              onClick={handleTimePickerOpen}
              startIcon={<AccessTime />}
              sx={{ 
                minWidth: { xs: '20px', sm: '200px' },
                py: 0.6, // slightly shorter button height
                textAlign: 'left',
                justifyContent: 'flex-start',
                pl: 1.5,
                borderRadius: 2,
                '& .MuiButton-startIcon': {
                  mr: 1
                }
              }}
            >
              {startTime && endTime 
                ? `${formatTime12Hour(startTime)} - ${formatTime12Hour(endTime)}`
                : 'Select Time'
              }
            </Button>
          </Box>

          {/* Proceed Button */}
          {selectedDate && startTime && endTime && (
            <Button
              variant="contained"
              onClick={handleDateTimeSubmit}
              sx={{ 
                py: 1.5,
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                minWidth: '150px'
              }}
            >
              Proceed
            </Button>
          )}
        </Box>
      )}

      {/* Time Picker Modal */}
      <Dialog 
        open={timePickerOpen} 
        onClose={() => setTimePickerOpen(false)}
        maxWidth="xs"
        fullWidth={false}
        PaperProps={{
          sx: {
            borderRadius: 2,
            border: '1px solid #e0e0e0',
            boxShadow: '0 6px 24px rgba(0, 0, 0, 0.12)',
            bgcolor: 'background.paper',
            width: { xs: '90%', sm: 420 }
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: '#f8f9fa',
          borderBottom: '1px solid #e0e0e0',
          color: 'text.primary',
          fontWeight: 'bold'
        }}>
          Select Event Time
          <IconButton 
            onClick={() => setTimePickerOpen(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'rgba(0, 0, 0, 0.04)' 
              }
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: 'background.paper', py: 2.25 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 3 }}>
            <TextField
              fullWidth
              type="time"
              label="Start Time"
              value={tempStartTime}
              onChange={(e) => handleStartTimeChange(e.target.value)}
              inputRef={startTimeRef}
              onClick={() => openTimePicker(startTimeRef)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-input': {
                    py: 0.75,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
            />
            <TextField
              fullWidth
              type="time"
              label="End Time"
              value={tempEndTime}
              onChange={(e) => setTempEndTime(e.target.value)}
              inputRef={endTimeRef}
              onClick={() => openTimePicker(endTimeRef)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '& .MuiOutlinedInput-input': {
                    py: 0.75,
                  },
                  '&:hover fieldset': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'primary.main',
                    borderWidth: 2,
                  },
                },
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          bgcolor: '#f8f9fa', 
          borderTop: '1px solid #e0e0e0',
          px: 3,
          py: 2,
          gap: 1
        }}>
          <Button 
            onClick={() => setTimePickerOpen(false)}
            sx={{ 
              color: 'text.secondary',
              '&:hover': { 
                bgcolor: 'rgba(0, 0, 0, 0.04)' 
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleTimeSave} 
            variant="contained"
            disabled={!tempStartTime || !tempEndTime}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 'bold',
              '&:disabled': {
                bgcolor: 'grey.300',
                color: 'grey.500'
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default React.memo(LocationStep);
