// Simple EmailJS Integration for Restaurant
import emailjs from '@emailjs/browser';

class RestaurantEmailService {
  constructor() {
    this.serviceId = 'service_a3ncack';
    this.templateId = 'template_9tutshi';
    this.publicKey = 'TXi2u-02qiPdfJS2y';
    this.adminEmail = 'rahman.raziur3004@gmail.com';
    this.isEmailJSLoaded = true;
    // Use EmailJS method for automatic sending (fallback to console if fails)
    this.emailMethod = 'emailjs';
  }

  // Initialize EmailJS library
  async loadEmailJS() {
    if (this.isEmailJSLoaded) return;
    
    try {
      // Initialize EmailJS with public key
      emailjs.init(this.publicKey);
      this.isEmailJSLoaded = true;
      console.log('✅ EmailJS initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
      throw new Error('EmailJS initialization failed');
    }
  }

  // Generate order email content with table format
  generateOrderContent(orderData) {
    const { orderId, customerDetails, items, orderSummary } = orderData;
    
    // Create table format content
    let content = `NEW RESTAURANT ORDER - ${orderId}\n`;
    content += `========================================\n\n`;
    
    // Customer table
    content += `CUSTOMER DETAILS:\n`;
    content += `┌─────────────┬─────────────────────────────┐\n`;
    content += `│ Name        │ ${customerDetails.name.padEnd(27)} │\n`;
    content += `│ Email       │ ${customerDetails.email.padEnd(27)} │\n`;
    content += `│ Phone       │ ${customerDetails.phone.padEnd(27)} │\n`;
    content += `└─────────────┴─────────────────────────────┘\n\n`;
    
    // Items table
    content += `ORDER ITEMS:\n`;
    content += `┌───┬─────────────────────┬─────┬──────────┬───────────┐\n`;
    content += `│ # │ Item Name           │ Qty │ Price    │ Subtotal  │\n`;
    content += `├───┼─────────────────────┼─────┼──────────┼───────────┤\n`;
    
    items.forEach((item, index) => {
      const itemName = item.name.length > 19 ? item.name.substring(0, 16) + '...' : item.name;
      const subtotal = item.price * item.quantity;
      content += `│${String(index + 1).padStart(2)} │ ${itemName.padEnd(19)} │ ${String(item.quantity).padStart(3)} │ ₹${String(item.price).padStart(7)} │ ₹${String(subtotal).padStart(8)} │\n`;
    });
    
    content += `├───┼─────────────────────┼─────┼──────────┼───────────┤\n`;
    content += `│   │ TOTAL               │ ${String(orderSummary.totalItems).padStart(3)} │          │ ₹${String(orderSummary.totalAmount).padStart(8)} │\n`;
    content += `└───┴─────────────────────┴─────┴──────────┴───────────┘\n\n`;
    
    content += `ACTION REQUIRED: Please approve this order\n`;
    content += `Total Amount: ₹${orderSummary.totalAmount}\n`;
    content += `Order Date: ${new Date().toLocaleString('en-IN')}`;
    
    return content;
  }

  // Send order email
  async sendOrder(customerData, cartItems) {
    try {
      // Prepare order data
      const orderId = `ORD-${Date.now()}`;
      const orderSummary = {
        totalItems: cartItems.reduce((total, item) => total + item.quantity, 0),
        totalAmount: cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)
      };

      const orderData = {
        orderId,
        customerDetails: customerData,
        items: cartItems.map(item => ({
          ...item,
          subtotal: item.price * item.quantity
        })),
        orderSummary,
        timestamp: Date.now()
      };

      console.log('📧 Preparing to send email...');
      
      // Load EmailJS
      await this.loadEmailJS();
      
      // Generate email content
      const emailContent = this.generateOrderContent(orderData);
      
      // Prepare template parameters to match EmailJS template format
      const templateParams = {
        // Template variables as shown in EmailJS dashboard
        order_id: orderId,
        order_date: new Date().toLocaleString('en-IN'),
        customer_name: customerData.name,
        customer_email: customerData.email,
        customer_phone: customerData.phone,
        
        // Order summary
        total_amount: orderSummary.totalAmount,
        total_items: orderSummary.totalItems,
        
        // Email metadata
        to_email: this.adminEmail,
        from_name: 'BiteAffairs Order System',
        subject: `New Restaurant Order - ${orderId}`
      };

      console.log('📧 Template parameters:', templateParams);
      
      // Send email via EmailJS
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('✅ Email sent successfully!', result);
      
      // Success notification
      this.showNotification('Order sent successfully to admin!', 'success');
      
      return {
        success: true,
        orderId: orderId,
        message: 'Order notification sent to admin',
        emailResult: result
      };

    } catch (error) {
      console.error('❌ Email sending failed:', error);
      
      // Show error and provide alternative
      this.showNotification('Email failed. Opening backup method...', 'warning');
      this.openEmailClientBackup(customerData, cartItems);
      
      throw error;
    }
  }

  // Backup email method
  openEmailClientBackup(customerData, cartItems) {
    const orderId = `ORD-${Date.now()}`;
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    let emailBody = `NEW RESTAURANT ORDER - ${orderId}\n\n`;
    emailBody += `Customer: ${customerData.name}\n`;
    emailBody += `Email: ${customerData.email}\n`;
    emailBody += `Phone: ${customerData.phone}\n\n`;
    emailBody += `ORDER ITEMS:\n`;
    
    cartItems.forEach((item, index) => {
      emailBody += `${index + 1}. ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    emailBody += `\nTOTAL: ₹${totalAmount}\n`;
    emailBody += `\nPlease approve this order.`;
    
    const subject = encodeURIComponent(`New Restaurant Order - ${orderId}`);
    const body = encodeURIComponent(emailBody);
    const mailtoLink = `mailto:${this.adminEmail}?subject=${subject}&body=${body}`;
    
    window.open(mailtoLink, '_blank');
    console.log('📧 Email client opened as backup');
  }

  // Show notification
  showNotification(message, type = 'info') {
    const colors = {
      success: '#4CAF50',
      warning: '#FF9800',
      error: '#F44336',
      info: '#2196F3'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      background-color: ${colors[type]};
      color: white;
      border-radius: 5px;
      font-family: Arial, sans-serif;
      font-size: 14px;
      z-index: 10000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }

  // Send order notification to admin (method expected by orderService)
  async sendOrderNotificationToAdmin(orderData) {
    try {
      console.log('📧 Sending order notification to admin automatically...');
      
      if (this.emailMethod === 'emailjs') {
        // Try EmailJS method first (automatic sending)
        return await this.sendOrderViaEmailJS(orderData);
      } else {
        // Manual console method
        return await this.sendOrderViaConsole(orderData);
      }

    } catch (error) {
      console.error('❌ EmailJS automatic sending failed:', error);
      
      // Fallback to console method only if EmailJS fails
      console.log('🔄 EmailJS failed, falling back to manual console method...');
      this.showNotification('⚠️ Automatic email failed. Opening manual method...', 'warning');
      return await this.sendOrderViaConsole(orderData);
    }
  }

  // 100% Working Console Method
  async sendOrderViaConsole(orderData) {
    console.log('📧 Using 100% reliable console method...');
    
    // Generate detailed email content
    const emailContent = this.generateDetailedEmailContent(orderData);
    
    // Method 1: Auto-open Gmail compose
    const gmailUrl = this.generateGmailComposeUrl(orderData, emailContent);
    
    // Method 2: Generate mailto link
    const mailtoUrl = this.generateMailtoUrl(orderData, emailContent);
    
    // Method 3: WhatsApp notification
    const whatsappUrl = this.generateWhatsAppUrl(orderData);
    
    // Display all methods to user
    this.displayEmailMethods(emailContent, gmailUrl, mailtoUrl, whatsappUrl, orderData);
    
    // Auto-open Gmail (most reliable)
    setTimeout(() => {
      window.open(gmailUrl, '_blank');
    }, 1000);
    
    this.showNotification('✅ Email methods ready! Gmail will open automatically.', 'success');
    
    return {
      success: true,
      message: 'Order notification prepared successfully',
      methods: {
        gmail: gmailUrl,
        mailto: mailtoUrl,
        whatsapp: whatsappUrl
      }
    };
  }

  // EmailJS Method - Automatic Sending
  async sendOrderViaEmailJS(orderData) {
    try {
      console.log('🚀 Attempting automatic email sending via EmailJS...');
      
      // Load EmailJS
      await this.loadEmailJS();
      
      // Generate detailed email content
      const emailContent = this.generateDetailedEmailContent(orderData);
      
      // Simple template parameters that work with basic EmailJS template
      const templateParams = {
        // Basic required fields
        to_name: 'Admin',
        from_name: 'BiteAffairs Order System',
        to_email: this.adminEmail,
        
        // Order information
        subject: `New Restaurant Order - ${orderData.orderId}`,
        message: emailContent,
        
        // Additional fields for compatibility
        order_id: orderData.orderId,
        customer_name: orderData.customerDetails.name,
        customer_email: orderData.customerDetails.email,
        customer_phone: orderData.customerDetails.phone,
        total_amount: orderData.orderSummary.totalAmount,
        order_date: new Date().toLocaleString('en-IN')
      };

      console.log('📧 Sending email with parameters:', {
        serviceId: this.serviceId,
        templateId: this.templateId,
        orderData: orderData.orderId
      });
      
      // Send email via EmailJS
      const result = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('✅ EmailJS automatic sending successful!', result);
      this.showNotification('✅ Order notification sent automatically to admin!', 'success');
      
      return {
        success: true,
        message: 'Email sent automatically to admin',
        emailResult: result,
        method: 'emailjs_automatic'
      };

    } catch (error) {
      console.error('❌ EmailJS automatic sending failed:', error);
      
      // Log specific error details
      if (error.text) {
        console.error('EmailJS Error Details:', error.text);
      }
      
      throw error; // Re-throw to trigger fallback
    }
  }

  // Send order confirmation to customer
  async sendOrderConfirmationToCustomer(orderData) {
    try {
      console.log('📧 Sending order confirmation to customer...');
      
      // For now, just log the confirmation (can be enhanced later)
      const confirmationMessage = `
        Dear ${orderData.customerDetails.name},
        
        Thank you for your order! Your order ${orderData.orderId} has been received and is being processed.
        
        Order Details:
        - Total Items: ${orderData.orderSummary.totalItems}
        - Total Amount: ₹${orderData.orderSummary.totalAmount}
        - Status: Pending Admin Approval
        
        You will receive another email once your order is approved.
        
        Best regards,
        BiteAffairs Team
      `;
      
      console.log('📧 Customer confirmation:', confirmationMessage);
      
      // Show notification to user
      this.showNotification('Order confirmation logged for customer', 'info');
      
      return {
        success: true,
        message: 'Customer confirmation processed'
      };

    } catch (error) {
      console.error('❌ Customer confirmation failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Generate detailed email content with complete menu details
  generateDetailedEmailContent(orderData) {
    const { orderId, customerDetails, items, orderSummary } = orderData;
    
    let content = `🍽️ NEW RESTAURANT ORDER - ${orderId}\n`;
    content += `${'='.repeat(50)}\n\n`;
    
    // Customer Details
    content += `👤 CUSTOMER DETAILS:\n`;
    content += `Name: ${customerDetails.name}\n`;
    content += `Email: ${customerDetails.email}\n`;
    content += `Phone: ${customerDetails.phone}\n`;
    content += `WhatsApp: https://wa.me/91${customerDetails.phone.replace(/\D/g, '')}\n\n`;
    
    // Order Items with Details
    content += `🛒 ORDER ITEMS:\n`;
    content += `${'─'.repeat(50)}\n`;
    
    items.forEach((item, index) => {
      const subtotal = item.price * item.quantity;
      content += `${index + 1}. ${item.name}\n`;
      content += `   Quantity: ${item.quantity}\n`;
      content += `   Unit Price: ₹${item.price}\n`;
      content += `   Subtotal: ₹${subtotal}\n`;
      
      // Add customizations if available
      if (item.customizations && Object.keys(item.customizations).length > 0) {
        content += `   Customizations:\n`;
        Object.entries(item.customizations).forEach(([key, value]) => {
          if (value && value.length > 0) {
            content += `     ${key}: ${Array.isArray(value) ? value.join(', ') : value}\n`;
          }
        });
      }
      content += `\n`;
    });
    
    content += `${'─'.repeat(50)}\n`;
    content += `📊 ORDER SUMMARY:\n`;
    content += `Total Items: ${orderSummary.totalItems}\n`;
    content += `Total Amount: ₹${orderSummary.totalAmount}\n`;
    content += `Order Date: ${new Date().toLocaleString('en-IN')}\n`;
    content += `Status: Pending Admin Approval\n\n`;
    
    content += `⚡ ACTION REQUIRED:\n`;
    content += `Please review and approve this order.\n`;
    content += `Reply with "APPROVED" or "REJECTED" along with any notes.\n\n`;
    
    content += `📱 Quick Actions:\n`;
    content += `• WhatsApp Customer: https://wa.me/91${customerDetails.phone.replace(/\D/g, '')}\n`;
    content += `• Call Customer: tel:${customerDetails.phone}\n`;
    content += `• Email Customer: mailto:${customerDetails.email}\n\n`;
    
    content += `Best regards,\n`;
    content += `BiteAffairs Order System\n`;
    content += `Automated Order Notification`;
    
    return content;
  }

  // Generate Gmail compose URL
  generateGmailComposeUrl(orderData, emailContent) {
    const subject = encodeURIComponent(`🍽️ New Order ${orderData.orderId} - Action Required`);
    const body = encodeURIComponent(emailContent);
    const to = encodeURIComponent(this.adminEmail);
    
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${body}`;
  }

  // Generate mailto URL
  generateMailtoUrl(orderData, emailContent) {
    const subject = encodeURIComponent(`New Order ${orderData.orderId} - Action Required`);
    const body = encodeURIComponent(emailContent);
    
    return `mailto:${this.adminEmail}?subject=${subject}&body=${body}`;
  }

  // Generate WhatsApp URL
  generateWhatsAppUrl(orderData) {
    let message = `🍽️ *NEW ORDER ALERT*\n\n`;
    message += `Order ID: ${orderData.orderId}\n`;
    message += `Customer: ${orderData.customerDetails.name}\n`;
    message += `Phone: ${orderData.customerDetails.phone}\n`;
    message += `Total: ₹${orderData.orderSummary.totalAmount}\n`;
    message += `Items: ${orderData.orderSummary.totalItems}\n\n`;
    message += `⚡ Please check email for full details and approve the order.`;
    
    return `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
  }

  // Display all email methods to user
  displayEmailMethods(emailContent, gmailUrl, mailtoUrl, whatsappUrl, orderData) {
    console.log('\n📧 EMAIL NOTIFICATION METHODS:');
    console.log('=====================================');
    console.log('\n🎯 Method 1: Gmail (Auto-opening...)');
    console.log('URL:', gmailUrl);
    
    console.log('\n📮 Method 2: Default Email Client');
    console.log('URL:', mailtoUrl);
    
    console.log('\n📱 Method 3: WhatsApp Notification');
    console.log('URL:', whatsappUrl);
    
    console.log('\n📄 Method 4: Copy Email Content:');
    console.log('=====================================');
    console.log(emailContent);
    console.log('=====================================');
    
    console.log('\n✅ ADMIN NOTIFICATION READY!');
    console.log('Gmail will open automatically in 1 second...');
  }

  // WhatsApp integration
  sendWhatsApp(customerData, cartItems) {
    const orderId = `ORD-${Date.now()}`;
    const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    let message = `🍽️ *NEW ORDER - ${orderId}*\n\n`;
    message += `👤 *Customer:*\n`;
    message += `Name: ${customerData.name}\n`;
    message += `Phone: ${customerData.phone}\n`;
    message += `Email: ${customerData.email}\n\n`;
    
    message += `🛒 *Items:*\n`;
    cartItems.forEach((item, index) => {
      message += `${index + 1}. ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    
    message += `\n💰 *Total: ₹${totalAmount}*\n\n`;
    message += `⚡ Please approve this order`;

    const whatsappUrl = `https://wa.me/919876543210?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    this.showNotification('WhatsApp opened! Send message to admin.', 'info');
  }
}

// Usage Example:
/*
const emailService = new RestaurantEmailService();

// Send order
await emailService.sendOrder(
  { name: 'John Doe', email: 'john@example.com', phone: '9876543210' },
  [
    { id: 1, name: 'Butter Chicken', price: 250, quantity: 2 },
    { id: 2, name: 'Naan', price: 40, quantity: 4 }
  ]
);
*/

// Create and export singleton instance
const emailService = new RestaurantEmailService();
export default emailService;