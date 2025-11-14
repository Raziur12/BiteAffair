import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel, StepIcon } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocationOn, Restaurant, CurrencyRupee, CreditCard } from '@mui/icons-material';

const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0',
  zIndex: 1,
  color: theme.palette.mode === 'dark' ? '#fff' : '#757575',
  width: 40,
  height: 40,
  display: 'flex',
  borderRadius: '50%',
  justifyContent: 'center',
  alignItems: 'center',
  border: '2px solid transparent',
  transition: 'all 0.3s ease',
  ...(ownerState.active && {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    boxShadow: '0 4px 12px 0 rgba(25, 118, 210, 0.3)',
    border: `2px solid ${theme.palette.primary.main}`,
    transform: 'scale(1.1)',
  }),
  ...(ownerState.completed && {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    border: `2px solid ${theme.palette.primary.main}`,
  }),
}));

function CustomStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <LocationOn sx={{ fontSize: 24 }} />,
    2: <Restaurant sx={{ fontSize: 24 }} />,
    3: <CurrencyRupee sx={{ fontSize: 24 }} />,
    4: <CreditCard sx={{ fontSize: 24 }} />,
  };

  return (
    <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)] || <CreditCard sx={{ fontSize: 24 }} />}
    </CustomStepIconRoot>
  );
}

const BookingStepper = ({ activeStep, steps }) => {
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', bgcolor: 'white' }}>
      <Stepper 
        activeStep={activeStep} 
        alternativeLabel 
        sx={{ 
          mt: 0,
          maxWidth: '600px',
          margin: '0 auto',
          '& .MuiStep-root': {
            padding: 0,
          },
          '& .MuiStepConnector-root': {
            top: 20,
            left: 'calc(-50% + 20px)',
            right: 'calc(50% + 20px)',
          },
          '& .MuiStepConnector-line': {
            borderTopWidth: 2,
            borderColor: '#e0e0e0',
          },
          '& .MuiStepLabel-root': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '& .MuiStepLabel-labelContainer': {
              marginTop: '8px',
              '& .MuiStepLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#333',
              }
            }
          }
        }}
      >
        {steps && steps.map((label) => (
          <Step key={label}>
            <StepLabel StepIconComponent={CustomStepIcon}>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};

export default BookingStepper;
