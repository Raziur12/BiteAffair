// WhatsApp Business API Service
class WhatsAppService {
  constructor() {
    this.baseURL = 'https://api.whatsapp.com/send'; // WhatsApp Web URL
    // For production, you would use WhatsApp Business API
    // this.businessAPI = 'https://graph.facebook.com/v17.0/YOUR_PHONE_NUMBER_ID/messages';
  }

  // Format order details for WhatsApp message
  formatOrderDetails(orderData) {
    const { items, totalPrice, deliveryDate, deliveryTime, location, phoneNumber } = orderData;
    
    let message = `🍽️ *BiteAffair Order Confirmation*\n\n`;
    message += `📱 *Phone:* ${phoneNumber}\n`;
    message += `📍 *Location:* ${location}\n`;
    message += `📅 *Delivery Date:* ${deliveryDate}\n`;
    message += `⏰ *Delivery Time:* ${deliveryTime}\n\n`;
    
    message += `🛒 *Order Items:*\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
      message += `   Quantity: ${item.quantity}\n`;
      message += `   Price: ₹${item.price * item.quantity}\n\n`;
    });
    
    message += `💰 *Total Amount:* ₹${totalPrice}\n\n`;
    message += `✅ Your order has been confirmed!\n`;
    message += `📞 We'll contact you soon for further details.\n\n`;
    message += `Thank you for choosing BiteAffair! 🙏`;
    
    return message;
  }

  // Send order details via WhatsApp Web (opens WhatsApp)
  async sendOrderDetails(phoneNumber, orderData) {
    try {
      const message = this.formatOrderDetails(orderData);
      const encodedMessage = encodeURIComponent(message);
      
      // Format phone number for WhatsApp (remove +91 and add country code)
      const formattedPhone = phoneNumber.replace('+91', '91').replace(/\D/g, '');
      
      const whatsappURL = `${this.baseURL}?phone=${formattedPhone}&text=${encodedMessage}`;
      
      // Open WhatsApp in new tab
      window.open(whatsappURL, '_blank');
      
      return {
        success: true,
        message: 'Order details sent to WhatsApp',
        whatsappURL
      };
      
    } catch (error) {
      console.error('WhatsApp Service Error:', error);
      return {
        success: false,
        message: 'Failed to send WhatsApp message',
        error: error.message
      };
    }
  }

  // Send via WhatsApp Business API (for production)
  async sendViaBusinessAPI(phoneNumber, orderData) {
    try {
      // This would be used with actual WhatsApp Business API
      const message = this.formatOrderDetails(orderData);
      
      const payload = {
        messaging_product: "whatsapp",
        to: phoneNumber,
        type: "text",
        text: {
          body: message
        }
      };
      
      // In production, you would make API call here
      // const response = await fetch(this.businessAPI, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${ACCESS_TOKEN}`,
      //     'Content-Type': 'application/json'
      //   },
      //   body: JSON.stringify(payload)
      // });
      
      console.log('Would send via Business API:', payload);
      
      return {
        success: true,
        message: 'Order details sent via WhatsApp Business API'
      };
      
    } catch (error) {
      console.error('WhatsApp Business API Error:', error);
      return {
        success: false,
        message: 'Failed to send via WhatsApp Business API',
        error: error.message
      };
    }
  }

  // Send OTP via WhatsApp (alternative to SMS)
  async sendOTPViaWhatsApp(phoneNumber, otpCode) {
    try {
      const message = `🔐 *BiteAffair Verification Code*\n\nYour OTP is: *${otpCode}*\n\nPlease enter this code to verify your order.\n\n⚠️ Do not share this code with anyone.`;
      const encodedMessage = encodeURIComponent(message);
      
      const formattedPhone = phoneNumber.replace('+91', '91').replace(/\D/g, '');
      const whatsappURL = `${this.baseURL}?phone=${formattedPhone}&text=${encodedMessage}`;
      
      window.open(whatsappURL, '_blank');
      
      return {
        success: true,
        message: 'OTP sent via WhatsApp',
        otpCode
      };
      
    } catch (error) {
      console.error('WhatsApp OTP Error:', error);
      return {
        success: false,
        message: 'Failed to send OTP via WhatsApp',
        error: error.message
      };
    }
  }
}

// Export singleton instance
export const whatsappService = new WhatsAppService();
export default whatsappService;
