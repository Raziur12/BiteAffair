import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  ErrorOutline,
  Refresh,
  Home,
  BugReport
} from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      const { fallback: CustomFallback, componentName = "component" } = this.props;
      
      // Use custom fallback if provided
      if (CustomFallback) {
        return <CustomFallback onRetry={this.handleRetry} error={this.state.error} />;
      }

      // Default error UI
      return (
        <Card sx={{ m: 2, border: '1px solid', borderColor: 'error.light' }}>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <ErrorOutline sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
              {componentName} Error
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Something went wrong with this {componentName.toLowerCase()}. Please try refreshing or contact support if the problem persists.
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={this.handleRetry}
                size="small"
              >
                Try Again
              </Button>
              <Button
                variant="outlined"
                startIcon={<Home />}
                onClick={() => window.location.reload()}
                size="small"
              >
                Refresh Page
              </Button>
            </Box>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ mt: 3, textAlign: 'left' }}>
                <AlertTitle>Development Error Details</AlertTitle>
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                  {this.state.error.toString()}
                </Typography>
                {this.state.errorInfo && (
                  <details style={{ marginTop: 8 }}>
                    <summary>Stack Trace</summary>
                    <pre style={{ fontSize: '0.7rem', overflow: 'auto', maxHeight: 200 }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </Alert>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, componentName) => {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary componentName={componentName}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

// Specific error boundaries for different component types
export const MenuErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    componentName="Menu"
    fallback={({ onRetry }) => (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <BugReport sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        <Typography variant="h6" sx={{ mb: 2 }}>Menu Loading Error</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          We're having trouble loading the menu. This might be temporary.
        </Typography>
        <Button variant="contained" onClick={onRetry} startIcon={<Refresh />}>
          Reload Menu
        </Button>
      </Box>
    )}
  >
    {children}
  </ErrorBoundary>
);

export const CartErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    componentName="Cart"
    fallback={({ onRetry }) => (
      <Alert severity="error" sx={{ m: 2 }}>
        <AlertTitle>Cart Error</AlertTitle>
        There was a problem with your cart. Your items are safe.
        <Button size="small" onClick={onRetry} sx={{ ml: 2 }}>
          Reload Cart
        </Button>
      </Alert>
    )}
  >
    {children}
  </ErrorBoundary>
);

export const FormErrorBoundary = ({ children }) => (
  <ErrorBoundary 
    componentName="Form"
    fallback={({ onRetry }) => (
      <Alert severity="warning" sx={{ m: 2 }}>
        <AlertTitle>Form Error</AlertTitle>
        The form encountered an issue. Please refresh and try again.
        <Button size="small" onClick={onRetry} sx={{ ml: 2 }}>
          Reset Form
        </Button>
      </Alert>
    )}
  >
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
