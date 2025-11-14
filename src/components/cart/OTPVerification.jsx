import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Alert,
  CircularProgress
} from '@mui/material';
import { Close } from '@mui/icons-material';
// import { otpService } from '../../services/otpService'; // Firebase OTP (for production)
// import { testOtpService as otpService } from '../../services/testOtpService'; // Test OTP (for development)
import { smsOtpService as otpService } from '../../services/smsOtpService'; // SMS OTP (real SMS)

const OTPVerification = ({ open, onClose, phoneNumber, onVerifySuccess }) => {
  const [otp, setOtp] = useState(['', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRefs = useRef([]);

  // Timer for resend code
  useEffect(() => {
    if (open && resendTimer > 0) {
      const timer = setTimeout(() => {
        setResendTimer(resendTimer - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [open, resendTimer]);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setOtp(['', '', '', '', '']);
      setResendTimer(30);
      setCanResend(false);
      setLoading(false);
      setError('');
      setSuccess('');
    }
  }, [open]);

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 4) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async () => {
    const otpCode = otp.join('');
    if (otpCode.length === 5) {
      setLoading(true);
      setError('');
      
      try {
        console.log('📱 OTPVerification: Submitting OTP');
        console.log('📱 Phone number:', phoneNumber);
        console.log('📱 OTP code:', otpCode);
        
        const result = await otpService.verifyOTP(phoneNumber, otpCode);
        console.log('📱 Verification result:', result);
        
        if (result.success) {
          setSuccess('OTP verified successfully!');
          setTimeout(() => {
            onVerifySuccess();
          }, 1000);
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error('📱 OTP Verification Error:', error);
        setError('Failed to verify OTP. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await otpService.resendOTP(phoneNumber);
      
      if (result.success) {
        setSuccess('OTP sent successfully!');
        setResendTimer(30);
        setCanResend(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 2
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', p: 3 }}>
        {/* Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>

        {/* Title */}
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          Verification Code
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          A verification code has been sent to {phoneNumber}
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* OTP Input Fields */}
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 3 }}>
          {otp.map((digit, index) => (
            <TextField
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: '1.5rem',
                  fontWeight: 'bold'
                }
              }}
              sx={{
                width: 50,
                height: 50,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1
                }
              }}
            />
          ))}
        </Box>

        {/* Resend Code */}
        <Box sx={{ mb: 3 }}>
          {canResend ? (
            <Button
              variant="text"
              onClick={handleResendCode}
              sx={{ color: '#ff6b35', textTransform: 'none' }}
            >
              Resend Code
            </Button>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Resend code in {resendTimer}s
            </Typography>
          )}
        </Box>

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={otp.join('').length !== 5 || loading}
          sx={{
            bgcolor: '#1a237e',
            py: 1.5,
            fontSize: '1rem',
            fontWeight: 600,
            '&:hover': {
              bgcolor: '#303f9f'
            },
            '&:disabled': {
              bgcolor: '#e0e0e0'
            }
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} color="inherit" />
              Verifying...
            </Box>
          ) : (
            'Submit'
          )}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default OTPVerification;
