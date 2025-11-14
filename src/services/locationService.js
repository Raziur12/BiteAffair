// Location service for handling location-based functionality
import { LOCATIONS } from '../utils/constants';

export const locationService = {
  // Get all available locations
  getAllLocations: () => LOCATIONS,

  // Get only available locations
  getAvailableLocations: () => LOCATIONS.filter(location => location.available),

  // Get location by ID
  getLocationById: (id) => LOCATIONS.find(location => location.id === id),

  // Check if location is available
  isLocationAvailable: (locationId) => {
    const location = locationService.getLocationById(locationId);
    return location ? location.available : false;
  },

  // Get default location (Gurugram)
  getDefaultLocation: () => LOCATIONS.find(location => location.id === 'gurugram'),

  // Get location from localStorage
  getSavedLocation: () => {
    try {
      const savedLocation = localStorage.getItem('biteAffair_selectedLocation');
      return savedLocation ? JSON.parse(savedLocation) : null;
    } catch (error) {
      console.error('Error getting saved location:', error);
      return null;
    }
  },

  // Save location to localStorage
  saveLocation: (location) => {
    try {
      localStorage.setItem('biteAffair_selectedLocation', JSON.stringify(location));
    } catch (error) {
      console.error('Error saving location:', error);
    }
  },

  // Clear saved location
  clearSavedLocation: () => {
    try {
      localStorage.removeItem('biteAffair_selectedLocation');
    } catch (error) {
      console.error('Error clearing saved location:', error);
    }
  },

  // Get delivery fee based on location
  getDeliveryFee: (locationId) => {
    const fees = {
      'gurugram': 0, // Free delivery in Gurugram
      'delhi': 50,
      'noida': 75,
      'faridabad': 60,
      'ghaziabad': 80
    };
    return fees[locationId] || 100;
  },

  // Get minimum order amount based on location
  getMinimumOrder: (locationId) => {
    const minimums = {
      'gurugram': 500,
      'delhi': 800,
      'noida': 1000,
      'faridabad': 700,
      'ghaziabad': 900
    };
    return minimums[locationId] || 1000;
  }
};

export default locationService;
