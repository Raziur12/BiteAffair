// SMS OTP Service using popular SMS APIs
class SMSOTPService {
  constructor() {
    this.otpStorage = new Map(); // Store OTPs temporarily
    this.otpExpiry = 5 * 60 * 1000; // 5 minutes
    
    // SMS API configurations (you can choose one)
    this.smsAPIs = {
      // Textlocal API
      textlocal: {
        url: 'https://api.textlocal.in/send/',
        apiKey: 'YOUR_TEXTLOCAL_API_KEY', // Replace with your API key
        sender: 'BITEAF' // 6 character sender ID
      },
      
      // MSG91 API
      msg91: {
        url: 'https://api.msg91.com/api/v5/otp',
        authKey: 'YOUR_MSG91_AUTH_KEY', // Replace with your auth key
        templateId: 'YOUR_TEMPLATE_ID' // Replace with your template ID
      },
      
      // Twilio API
      twilio: {
        url: 'https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json',
        accountSid: 'YOUR_TWILIO_ACCOUNT_SID',
        authToken: 'YOUR_TWILIO_AUTH_TOKEN',
        fromNumber: '+1234567890' // Your Twilio phone number
      }
    };
  }

  // Generate random OTP
  generateOTP(length = 6) {
    return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
  }

  // Send OTP (main method)
  async sendOTP(phoneNumber) {
    // For production with real SMS (uncomment when you have API key)
    // return await this.sendOTPViaMSG91(phoneNumber);
    // return await this.sendOTPViaTextlocal(phoneNumber);
    
    // For development with dynamic OTP
    return await this.sendTestOTP(phoneNumber);
  }

  // Send OTP via Textlocal (Indian SMS service)
  async sendOTPViaTextlocal(phoneNumber) {
    try {
      const otp = this.generateOTP();
      const message = `Your BiteAffair verification code is: ${otp}. Valid for 5 minutes. Do not share with anyone.`;
      
      // Format phone number
      const formattedNumber = phoneNumber.replace('+91', '91').replace(/\D/g, '');
      
      const formData = new FormData();
      formData.append('apikey', this.smsAPIs.textlocal.apiKey);
      formData.append('numbers', formattedNumber);
      formData.append('message', message);
      formData.append('sender', this.smsAPIs.textlocal.sender);
      
      const response = await fetch(this.smsAPIs.textlocal.url, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.status === 'success') {
        // Store OTP with expiry
        this.storeOTP(phoneNumber, otp);
        
        return {
          success: true,
          message: 'OTP sent successfully',
          otpId: result.batch_id
        };
      } else {
        throw new Error(result.errors?.[0]?.message || 'Failed to send SMS');
      }
      
    } catch (error) {
      console.error('Textlocal SMS Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP via SMS',
        error: error.message
      };
    }
  }

  // Send OTP via MSG91 (Indian SMS service)
  async sendOTPViaMSG91(phoneNumber) {
    try {
      const otp = this.generateOTP();
      
      const formattedNumber = phoneNumber.replace('+', '').replace(/\D/g, '');
      
      const payload = {
        template_id: this.smsAPIs.msg91.templateId,
        mobile: formattedNumber,
        authkey: this.smsAPIs.msg91.authKey,
        otp: otp
      };
      
      const response = await fetch(`${this.smsAPIs.msg91.url}?${new URLSearchParams(payload)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const result = await response.json();
      
      if (result.type === 'success') {
        this.storeOTP(phoneNumber, otp);
        
        return {
          success: true,
          message: 'OTP sent successfully',
          otpId: result.request_id
        };
      } else {
        throw new Error(result.message || 'Failed to send SMS');
      }
      
    } catch (error) {
      console.error('MSG91 SMS Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP via SMS',
        error: error.message
      };
    }
  }

  // Test OTP service (for development)
  async sendTestOTP(phoneNumber) {
    try {
      // Generate dynamic OTP for each customer
      const otp = this.generateOTP(); // This will generate random 6-digit OTP
      
      console.log(`📱 SMS OTP Service: Sending OTP to ${phoneNumber}`);
      console.log(`🔑 Dynamic OTP Code: ${otp}`);
      console.log(`👤 Customer: ${phoneNumber} - Unique OTP: ${otp}`);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      this.storeOTP(phoneNumber, otp);
      
      return {
        success: true,
        message: `Test OTP sent to ${phoneNumber}. Use: ${otp}`,
        testMode: true,
        dynamicOTP: otp // Return the OTP for testing
      };
      
    } catch (error) {
      console.error('Test SMS OTP Error:', error);
      return {
        success: false,
        message: 'Failed to send test OTP',
        error: error.message
      };
    }
  }

  // Store OTP with expiry
  storeOTP(phoneNumber, otp) {
    const expiryTime = Date.now() + this.otpExpiry;
    console.log('💾 Storing OTP for phone:', phoneNumber);
    console.log('💾 OTP code:', otp);
    console.log('💾 Expiry time:', new Date(expiryTime));
    
    this.otpStorage.set(phoneNumber, {
      otp,
      expiryTime
    });
    
    console.log('💾 Total stored OTPs:', this.otpStorage.size);
    
    // Auto cleanup after expiry
    setTimeout(() => {
      console.log('🗑️ Auto-deleting OTP for:', phoneNumber);
      this.otpStorage.delete(phoneNumber);
    }, this.otpExpiry);
  }

  // Verify OTP
  async verifyOTP(phoneNumber, otpCode) {
    try {
      console.log('🔍 Verifying OTP for phone:', phoneNumber);
      console.log('🔍 Entered OTP code:', otpCode);
      console.log('🔍 Stored OTPs:', Array.from(this.otpStorage.keys()));
      
      const storedData = this.otpStorage.get(phoneNumber);
      console.log('🔍 Found stored data:', storedData);
      
      if (!storedData) {
        return {
          success: false,
          message: 'OTP not found or expired. Please request a new one.',
          error: 'otp-not-found'
        };
      }
      
      if (Date.now() > storedData.expiryTime) {
        this.otpStorage.delete(phoneNumber);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.',
          error: 'otp-expired'
        };
      }
      
      if (otpCode === storedData.otp) {
        this.otpStorage.delete(phoneNumber);
        return {
          success: true,
          message: 'OTP verified successfully',
          user: {
            phoneNumber: phoneNumber,
            verified: true
          }
        };
      } else {
        return {
          success: false,
          message: 'Invalid OTP. Please try again.',
          error: 'invalid-otp'
        };
      }
      
    } catch (error) {
      console.error('OTP Verification Error:', error);
      return {
        success: false,
        message: 'Failed to verify OTP',
        error: error.message
      };
    }
  }

  // Resend OTP
  async resendOTP(phoneNumber) {
    // For production, use actual SMS API
    // return await this.sendOTPViaTextlocal(phoneNumber);
    // return await this.sendOTPViaMSG91(phoneNumber);
    
    // For development, use test OTP
    return await this.sendTestOTP(phoneNumber);
  }

  // Cleanup
  cleanup() {
    this.otpStorage.clear();
  }
}

// Export singleton instance
export const smsOtpService = new SMSOTPService();
export default smsOtpService;
