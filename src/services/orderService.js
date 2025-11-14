// Order Service for handling order operations
import emailService from './emailService';

class OrderService {
  constructor() {
    this.apiBaseUrl = '/api/orders'; // Backend API base URL
  }

  // Submit order for admin approval
  async submitOrder(orderData) {
    try {
      // Step 1: Save order to database (via backend API)
      const savedOrder = await this.saveOrderToDatabase(orderData);
      
      // Step 2: Send email notification to admin
      await emailService.sendOrderNotificationToAdmin(savedOrder);
      
      // Step 3: Send confirmation email to customer
      await emailService.sendOrderConfirmationToCustomer(savedOrder);
      
      return {
        success: true,
        orderId: savedOrder.orderId,
        status: 'pending',
        message: 'Order submitted successfully. Awaiting admin approval.',
        data: savedOrder
      };

    } catch (error) {
      console.error('Failed to submit order:', error);
      
      return {
        success: false,
        error: error.message,
        message: 'Failed to submit order. Please try again.'
      };
    }
  }

  // Save order to database via backend API
  async saveOrderToDatabase(orderData) {
    try {
      // For now, simulate API call - replace with actual backend integration
      const response = await this.simulateAPICall(orderData);
      
      // In real implementation, this would be:
      // const response = await fetch(`${this.apiBaseUrl}/submit`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(orderData)
      // });
      
      // if (!response.ok) {
      //   throw new Error(`API Error: ${response.statusText}`);
      // }
      
      // return await response.json();
      
      return response;

    } catch (error) {
      console.error('Database save error:', error);
      throw new Error('Failed to save order to database');
    }
  }

  // Simulate API call for development (remove in production)
  async simulateAPICall(orderData) {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate successful database save
        const savedOrder = {
          ...orderData,
          id: Date.now(), // Database ID
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Store in localStorage for development testing
        const existingOrders = JSON.parse(localStorage.getItem('biteAffairs_orders') || '[]');
        existingOrders.push(savedOrder);
        localStorage.setItem('biteAffairs_orders', JSON.stringify(existingOrders));
        
        resolve(savedOrder);
      }, 1000); // Simulate network delay
    });
  }

  // Check order status
  async checkOrderStatus(orderId) {
    try {
      // For development, check localStorage
      const orders = JSON.parse(localStorage.getItem('biteAffairs_orders') || '[]');
      const order = orders.find(o => o.orderId === orderId);
      
      if (!order) {
        throw new Error('Order not found');
      }

      return {
        success: true,
        orderId: order.orderId,
        status: order.status,
        data: order
      };

    } catch (error) {
      console.error('Failed to check order status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get all orders (for admin dashboard)
  async getAllOrders() {
    try {
      // For development, get from localStorage
      const orders = JSON.parse(localStorage.getItem('biteAffairs_orders') || '[]');
      
      return {
        success: true,
        data: orders.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      };

    } catch (error) {
      console.error('Failed to get orders:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update order status (for admin)
  async updateOrderStatus(orderId, status, adminNotes = '') {
    try {
      // For development, update in localStorage
      const orders = JSON.parse(localStorage.getItem('biteAffairs_orders') || '[]');
      const orderIndex = orders.findIndex(o => o.orderId === orderId);
      
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }

      orders[orderIndex].status = status;
      orders[orderIndex].adminNotes = adminNotes;
      orders[orderIndex].updatedAt = new Date().toISOString();
      
      localStorage.setItem('biteAffairs_orders', JSON.stringify(orders));
      
      // Send notification to customer about status change
      if (status === 'approved') {
        await this.notifyCustomerOrderApproved(orders[orderIndex]);
      } else if (status === 'rejected') {
        await this.notifyCustomerOrderRejected(orders[orderIndex]);
      }

      return {
        success: true,
        orderId: orderId,
        status: status,
        message: `Order ${status} successfully`
      };

    } catch (error) {
      console.error('Failed to update order status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Notify customer when order is approved
  async notifyCustomerOrderApproved(orderData) {
    // Implementation for customer approval notification
    // Send email/SMS to customer with payment link
  }

  // Notify customer when order is rejected
  async notifyCustomerOrderRejected(orderData) {
    // Implementation for customer rejection notification
    // Send email/SMS to customer with rejection reason
  }
}

// Create and export singleton instance
const orderService = new OrderService();
export default orderService;
