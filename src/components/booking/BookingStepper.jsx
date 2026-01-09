import React from 'react';
import { Box, Typography, Stepper, Step, StepLabel } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LocationOn, Restaurant, CurrencyRupee, CreditCard } from '@mui/icons-material';

const CustomStepIconRoot = styled('div')(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#e0e0e0',
  zIndex: 1,
  color: theme.palette.mode === 'dark' ? '#fff' : '#757575',
  width: 38,
  height: 38,
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

const CustomStepIcon = React.memo(function CustomStepIcon(props) {
  const { active, completed, className } = props;

  const icons = {
    1: <LocationOn sx={{ fontSize: 22 }} />,
    2: <Restaurant sx={{ fontSize: 22 }} />,
    3: <CurrencyRupee sx={{ fontSize: 22 }} />,
    4: <CreditCard sx={{ fontSize: 22 }} />,
  };

  return (
    <CustomStepIconRoot ownerState={{ completed, active }} className={className}>
      {icons[String(props.icon)] || <CreditCard sx={{ fontSize: 22 }} />}
    </CustomStepIconRoot>
  );
});

const BookingStepper = React.memo(({ activeStep, steps }) => {
  return (
    <Box sx={{ px: { xs: 1, sm: 1.5 }, py: { xs: 1.5, sm: 1.5 }, textAlign: 'center', bgcolor: 'white' }}>
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
            top: 17,
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
              marginTop: '2px',
              '& .MuiStepLabel-label': {
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#333',
                lineHeight: 1.1,
                marginTop: 0,
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
});

export default BookingStepper;
