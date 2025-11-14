import React, { useState } from 'react';
import BookingWizard from './BookingWizard';

const BookingFlow = ({ onComplete, onLocationSelect }) => {
  const handleBookingComplete = (data) => {
    if (onComplete) {
      // Ensure menu field is set correctly from mealType
      if (!data.menu && data.mealType) {
        const mealTypeMapping = {
          'Jain': 'jain',
          'Veg': 'veg', 
          'Veg + NonVeg': 'customized'
        };
        data.menu = mealTypeMapping[data.mealType] || data.mealType.toLowerCase();
      }
      
      onComplete(data);
    }
  };

  return <BookingWizard onComplete={handleBookingComplete} onLocationSelect={onLocationSelect} />;
};

export default BookingFlow;
