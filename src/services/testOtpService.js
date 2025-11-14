// Test OTP Service for development (without Firebase)
class TestOTPService {
  constructor() {
    this.testOTP = '12345'; // Fixed test OTP
    this.sentOTP = null;
  }

  // Simulate sending OTP
  async sendOTP(phoneNumber) {
    try {
      console.log('Test OTP Service: Sending OTP to', phoneNumber);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store the sent OTP
      this.sentOTP = this.testOTP;
      
      // Show test OTP in console for development
      console.log('🔑 Test OTP Code:', this.testOTP);
      
      return {
        success: true,
        message: `Test OTP sent to ${phoneNumber}. Use: ${this.testOTP}`,
        testOTP: this.testOTP // Only for development
      };
      
    } catch (error) {
      console.error('Test OTP Service Error:', error);
      return {
        success: false,
        message: 'Failed to send test OTP',
        error: error.message
      };
    }
  }

  // Simulate verifying OTP
  async verifyOTP(otpCode) {
    try {
      console.log('Test OTP Service: Verifying OTP', otpCode);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      if (otpCode === this.sentOTP) {
        return {
          success: true,
          message: 'Test OTP verified successfully',
          user: {
            uid: 'test-user-123',
            phoneNumber: '+91xxxxxxxxxx'
          }
        };
      } else {
        return {
          success: false,
          message: `Invalid OTP. Expected: ${this.testOTP}`,
          error: 'invalid-otp'
        };
      }
      
    } catch (error) {
      console.error('Test OTP Verification Error:', error);
      return {
        success: false,
        message: 'Failed to verify test OTP',
        error: error.message
      };
    }
  }

  // Simulate resending OTP
  async resendOTP(phoneNumber) {
    return await this.sendOTP(phoneNumber);
  }

  // No cleanup needed for test service
  cleanup() {
    this.sentOTP = null;
    console.log('Test OTP Service: Cleaned up');
  }
}

// Export singleton instance
export const testOtpService = new TestOTPService();
export default testOtpService;
