import React from 'react';
import BookingWizard from './BookingWizard';

const BookingFlow = ({ onComplete, onLocationSelect }) => {
  const handleBookingComplete = (data) => {
    if (!onComplete) return;

    const mealTypeMapping = {
      'Jain': 'jain',
      'Veg': 'veg',
      'Veg + NonVeg': 'customized'
    };

    const normalizedMenu = !data.menu && data.mealType
      ? (mealTypeMapping[data.mealType] || String(data.mealType).toLowerCase())
      : data.menu;

    const payload = normalizedMenu ? { ...data, menu: normalizedMenu } : data;
    onComplete(payload);
  };

  return <BookingWizard onComplete={handleBookingComplete} onLocationSelect={onLocationSelect} />;
};

export default BookingFlow;
