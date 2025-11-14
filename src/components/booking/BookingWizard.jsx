import React, { useState } from 'react';
import { Box, Container, Paper, IconButton } from '@mui/material';
import { ArrowBack, Close } from '@mui/icons-material';
import BookingStepper from './BookingStepper';
import LocationStep from './LocationStep';
import MealTypeStep from './MealTypeStep';

const BookingWizard = ({ onComplete, onLocationSelect, initialStep = 0 }) => {
  const [activeStep, setActiveStep] = useState(initialStep);
  const wizardSteps = ['Choose Location', 'Select Menu', 'Get Price', 'Payment'];
  const [bookingData, setBookingData] = useState({
    location: null,
    occasion: null,
    eventDate: null,
    eventTime: null,
    mealType: null,
    guestCount: 5,
  });

  const handleNext = () => {
    // If the current step is the Select Menu step (index 1), call onComplete for now
    if (activeStep === 1) {
      if (onComplete) {
        onComplete(bookingData);
      }
    } else if (activeStep < steps.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const updateBookingData = (data) => {
    setBookingData((prevData) => ({ ...prevData, ...data }));
  };

  const steps = [
    {
      label: 'Choose Location',
      component: <LocationStep onNext={handleNext} updateBookingData={updateBookingData} onLocationSelect={onLocationSelect} />,
    },
    {
      label: 'Select Menu',
      component: <MealTypeStep onNext={handleNext} onBack={handleBack} updateBookingData={updateBookingData} initialGuestCount={bookingData.guestCount} />,
    },
    {
      label: 'Get Price',
      component: <div>Get Price Step</div>,
    },
    {
      label: 'Payment',
      component: <div>Payment Step</div>,
    },
  ];

  return (
    <Box sx={{ bgcolor: '#1e3a8a', py: 1.5, pt: 1.5, minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Paper elevation={12} sx={{ borderRadius: 4, overflow: 'hidden', mt: 1.5 }}>
          <Box sx={{ position: 'relative', p: 0, py: 0.25 }}>
            {activeStep > 0 && (
              <IconButton 
                onClick={handleBack} 
                aria-label="Go back" 
                size="small"
                sx={{ position: 'absolute', top: 2, left: 2, zIndex: 10 }}
              >
                <ArrowBack />
              </IconButton>
            )}
            {/* <IconButton 
              onClick={() => console.log('Close wizard')} 
              aria-label="Close" 
              size="small"
              sx={{ position: 'absolute', top: 2, right: 2, zIndex: 10 }}
            >
              <Close />
            </IconButton> */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 0 }}>
              <img 
                src="/logo/502068640_17845720176490350_3307957330610653706_n.jpg" 
                alt="Bite Affair Logo" 
                style={{
                  height: '120px',
                  width: 'auto',
                  objectFit: 'contain'
                }}
              />
            </Box>
          </Box>
          <BookingStepper activeStep={activeStep} steps={wizardSteps} />
          <Box sx={{ p: { xs: 1.5, sm: 3 } }}>
            {steps[activeStep].component}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default BookingWizard;
