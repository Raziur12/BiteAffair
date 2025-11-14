import { auth } from '../config/firebase';
import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  PhoneAuthProvider,
  signInWithCredential 
} from 'firebase/auth';

class OTPService {
  constructor() {
    this.recaptchaVerifier = null;
    this.confirmationResult = null;
  }

  // Initialize reCAPTCHA
  initializeRecaptcha(containerId = 'recaptcha-container') {
    try {
      if (!this.recaptchaVerifier) {
        // Check if container exists
        const container = document.getElementById(containerId);
        if (!container) {
          throw new Error(`reCAPTCHA container with id '${containerId}' not found`);
        }

        this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
          size: 'invisible',
          callback: (response) => {
            console.log('reCAPTCHA solved');
          },
          'expired-callback': () => {
            console.log('reCAPTCHA expired');
            this.cleanup();
          }
        });
      }
      return this.recaptchaVerifier;
    } catch (error) {
      console.error('Failed to initialize reCAPTCHA:', error);
      throw error;
    }
  }

  // Send OTP to phone number
  async sendOTP(phoneNumber) {
    try {
      // Format phone number (ensure it starts with country code)
      const formattedNumber = phoneNumber.startsWith('+91') 
        ? phoneNumber 
        : `+91${phoneNumber}`;

      console.log('Sending OTP to:', formattedNumber);

      // Initialize reCAPTCHA if not already done
      if (!this.recaptchaVerifier) {
        this.initializeRecaptcha();
      }

      // Send OTP
      this.confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedNumber, 
        this.recaptchaVerifier
      );

      console.log('OTP sent successfully');
      return {
        success: true,
        message: 'OTP sent successfully',
        confirmationResult: this.confirmationResult
      };

    } catch (error) {
      console.error('Error sending OTP:', error);
      
      // Handle specific errors
      let errorMessage = 'Failed to send OTP';
      if (error.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many requests. Please try again later';
      } else if (error.code === 'auth/quota-exceeded') {
        errorMessage = 'SMS quota exceeded. Please try again later';
      }

      return {
        success: false,
        message: errorMessage,
        error: error.code
      };
    }
  }

  // Verify OTP
  async verifyOTP(otpCode) {
    try {
      if (!this.confirmationResult) {
        throw new Error('No OTP request found. Please send OTP first.');
      }

      console.log('Verifying OTP:', otpCode);

      // Verify the OTP
      const result = await this.confirmationResult.confirm(otpCode);
      const user = result.user;

      console.log('OTP verified successfully:', user.uid);

      return {
        success: true,
        message: 'OTP verified successfully',
        user: user
      };

    } catch (error) {
      console.error('Error verifying OTP:', error);

      let errorMessage = 'Invalid OTP';
      if (error.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid verification code';
      } else if (error.code === 'auth/code-expired') {
        errorMessage = 'OTP has expired. Please request a new one';
      }

      return {
        success: false,
        message: errorMessage,
        error: error.code
      };
    }
  }

  // Resend OTP (same as send OTP)
  async resendOTP(phoneNumber) {
    return await this.sendOTP(phoneNumber);
  }

  // Clean up
  cleanup() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }
    this.confirmationResult = null;
  }
}

// Export singleton instance
export const otpService = new OTPService();
export default otpService;
