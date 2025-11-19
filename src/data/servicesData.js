// Import menu data from customizationMenu - this is now the primary data source
import { vegMenu, nonVegMenu } from './customizationMenu.js';

// Use customizationMenu.js as the main data source - no separate services, just menu items
export const servicesData = [...vegMenu, ...nonVegMenu];

// Menu items from customization menu (keeping same structure for compatibility)
export const menuItems = {
  veg: vegMenu,
  nonVeg: nonVegMenu,
  all: [...vegMenu, ...nonVegMenu]
};

// Recommended add-ons data for cart
export const recommendedAddOns = [
  {
    id: 'addon1',
    name: 'Refreshed Dinner',
    description: 'Refreshing dinner with premium ingredients',
    rating: '4.8 ⭐',
    price: '80',
    image: '/src/assets/Images/AddOnsImage/RefreshedDinner.jpg'
  },
  {
    id: 'addon2', 
    name: 'Spicy Chutney',
    description: 'Traditional spicy chutney blend',
    rating: '4.8 ⭐',
    price: '90',
    image: '/src/assets/Images/AddOnsImage/SpicyChutney.jpg'
  }
];

// Get services with dynamic pricing based on guest count (now using customizationMenu data)
export const getServicesWithPricing = (guestCount = { veg: 10, nonVeg: 8, jain: 1 }) => {
  const totalGuests = guestCount.veg + guestCount.nonVeg + (guestCount.jain || 1);
  
  return servicesData.map(item => {
    // Calculate quantity needed based on serves (from customizationMenu)
    const quantityNeeded = Math.ceil(totalGuests / (item.serves || 5));
    const totalPrice = item.basePrice * quantityNeeded;
    
    return {
      ...item,
      quantityNeeded: quantityNeeded,
      calculatedPrice: totalPrice,
      guestCount: totalGuests,
      portion_size: item.portionSize || item.quantity || `${quantityNeeded} ${item.unit || 'portions'}`,
      calculatedFor: `${totalGuests} guests`,
      priceBreakdown: {
        basePrice: item.basePrice,
        quantityNeeded: quantityNeeded,
        totalGuests: totalGuests,
        calculatedPrice: totalPrice
      }
    };
  });
};

// Get services by category (now filters customizationMenu items by category)
export const getServicesByCategory = (category) => {
  return servicesData.filter(item => item.category === category);
};

// Get service by ID (now searches customizationMenu items)
export const getServiceById = (id) => {
  return servicesData.find(item => item.id === id);
};

export default { servicesData, recommendedAddOns, getServicesWithPricing, getServicesByCategory, getServiceById };
