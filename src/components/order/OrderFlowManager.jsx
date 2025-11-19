import React, { useState } from 'react';
import CartModal from '../cart/CartModal';
import CheckoutConfirmation from '../cart/CheckoutConfirmation';
import PaymentModal from '../booking/PaymentModal';

const OrderFlowManager = ({ cartOpen, onCartClose, bookingConfig }) => {
  const [currentStep, setCurrentStep] = useState('cart'); // 'cart', 'checkout', 'payment'
  const [checkoutData, setCheckoutData] = useState(null);

  const handleCartCheckout = () => {
    setCurrentStep('checkout');
  };

  const handleCheckoutBack = () => {
    setCurrentStep('cart');
  };

  const handleCheckoutConfirm = (data) => {
    setCheckoutData(data);
    setCurrentStep('payment');
  };

  const handlePaymentBack = () => {
    setCurrentStep('checkout');
  };

  const handleCloseAll = () => {
    setCurrentStep('cart');
    setCheckoutData(null);
    onCartClose();
  };

  return (
    <>
      {/* Cart Modal */}
      <CartModal 
        open={cartOpen && currentStep === 'cart'} 
        onClose={handleCloseAll}
        onCheckout={handleCartCheckout}
        bookingConfig={bookingConfig}
        selectedMenu={bookingConfig?.menu}
      />

      {/* Checkout Confirmation Modal */}
      <CheckoutConfirmation
        open={currentStep === 'checkout'}
        onClose={handleCheckoutBack}
        onConfirm={handleCheckoutConfirm}
      />

      {/* Payment Modal */}
      <PaymentModal
        open={currentStep === 'payment'}
        onClose={handleCloseAll}
        onBack={handlePaymentBack}
      />
    </>
  );
};

export default OrderFlowManager;
