import React from 'react';
import {
  Box,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Card,
  CardContent
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
  RestaurantMenu
} from '@mui/icons-material';

// Generic Error Display Component
export const ErrorDisplay = ({ 
  title = "Something went wrong", 
  message = "We're having trouble loading this content. Please try again.",
  onRetry,
  showHomeButton = false,
  variant = "error"
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 3,
      textAlign: 'center'
    }}
  >
    <ErrorOutline 
      sx={{ 
        fontSize: 64, 
        color: variant === 'error' ? 'error.main' : 'warning.main',
        mb: 3 
      }} 
    />
    <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: 'text.primary' }}>
      {title}
    </Typography>
    <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 400 }}>
      {message}
    </Typography>
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
      {onRetry && (
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={onRetry}
          sx={{ px: 3 }}
        >
          Try Again
        </Button>
      )}
      {showHomeButton && (
        <Button
          variant="outlined"
          startIcon={<Home />}
          onClick={() => window.location.href = '#home'}
          sx={{ px: 3 }}
        >
          Go Home
        </Button>
      )}
    </Box>
  </Box>
);

// Menu Loading Error
export const MenuLoadError = ({ onRetry, menuType }) => (
  <ErrorDisplay
    title="Menu Unavailable"
    message={`We couldn't load the ${menuType || 'menu'} right now. This might be a temporary issue.`}
    onRetry={onRetry}
    variant="warning"
  />
);

// Network Error
export const NetworkError = ({ onRetry }) => (
  <ErrorDisplay
    title="Connection Problem"
    message="Please check your internet connection and try again."
    onRetry={onRetry}
  />
);

// Cart Error
export const CartError = ({ message, onRetry }) => (
  <Alert severity="error" sx={{ mb: 2 }}>
    <AlertTitle>Cart Error</AlertTitle>
    {message || "There was a problem with your cart. Please try again."}
    {onRetry && (
      <Button
        size="small"
        startIcon={<Refresh />}
        onClick={onRetry}
        sx={{ mt: 1 }}
      >
        Retry
      </Button>
    )}
  </Alert>
);

// Form Submission Error
export const FormError = ({ message, onRetry }) => (
  <Alert severity="error" sx={{ mb: 2 }}>
    <AlertTitle>Submission Failed</AlertTitle>
    {message || "We couldn't process your request. Please try again."}
    {onRetry && (
      <Button
        size="small"
        startIcon={<Refresh />}
        onClick={onRetry}
        sx={{ mt: 1 }}
      >
        Try Again
      </Button>
    )}
  </Alert>
);

// Empty State (when no data found)
export const EmptyState = ({ 
  title = "No items found", 
  message = "Try adjusting your search or filters.",
  icon: Icon = RestaurantMenu,
  actionButton
}) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      px: 3,
      textAlign: 'center'
    }}
  >
    <Icon sx={{ fontSize: 64, color: 'text.disabled', mb: 3 }} />
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'text.primary' }}>
      {title}
    </Typography>
    <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', maxWidth: 300 }}>
      {message}
    </Typography>
    {actionButton}
  </Box>
);

// Inline Error for small components
export const InlineError = ({ message, onRetry }) => (
  <Card sx={{ border: '1px solid', borderColor: 'error.light', bgcolor: 'error.50' }}>
    <CardContent sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <ErrorOutline sx={{ color: 'error.main', fontSize: 20 }} />
        <Typography variant="body2" sx={{ flex: 1, color: 'error.dark' }}>
          {message}
        </Typography>
        {onRetry && (
          <Button
            size="small"
            variant="text"
            onClick={onRetry}
            sx={{ color: 'error.main' }}
          >
            Retry
          </Button>
        )}
      </Box>
    </CardContent>
  </Card>
);

export default {
  ErrorDisplay,
  MenuLoadError,
  NetworkError,
  CartError,
  FormError,
  EmptyState,
  InlineError
};
