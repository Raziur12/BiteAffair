// Centralized Static Data Service
import { getItemImage } from '../data/imageMapping';
import { getServicesWithPricing, servicesData } from '../data/servicesData';
import { getRecentTestimonials, testimonialsData } from '../data/testimonialsData';

class StaticDataService {
  constructor() {
    this.cache = {
      services: null,
      testimonials: null,
      images: new Map()
    };
  }

  // Get item image with caching
  getItemImage(imagePath, itemName) {
    const cacheKey = `${imagePath}-${itemName}`;
    
    if (this.cache.images.has(cacheKey)) {
      return this.cache.images.get(cacheKey);
    }
    
    const imageUrl = getItemImage(imagePath, itemName);
    this.cache.images.set(cacheKey, imageUrl);
    
    return imageUrl;
  }

  // Get services with dynamic pricing
  getServices(guestCount = { veg: 10, nonVeg: 8, jain: 0 }) {
    return getServicesWithPricing(guestCount);
  }

  // Get all services data
  getAllServices() {
    return servicesData;
  }

  // Get testimonials
  getTestimonials(count = 3, type = 'recent') {
    switch (type) {
      case 'recent':
        return getRecentTestimonials(count);
      case 'all':
        return testimonialsData;
      default:
        return getRecentTestimonials(count);
    }
  }

  // Get combined data for components
  getComponentData(guestCount = { veg: 10, nonVeg: 8, jain: 0 }) {
    try {
      const services = this.getServices(guestCount);
      const testimonials = this.getTestimonials(3, 'recent');
      
      return {
        services,
        testimonials,
        getItemImage: this.getItemImage.bind(this)
      };
    } catch (error) {
      console.error('❌ StaticDataService: Error loading component data:', error);
      return {
        services: [],
        testimonials: [],
        getItemImage: this.getItemImage.bind(this)
      };
    }
  }

  // Clear cache
  clearCache() {
    this.cache = {
      services: null,
      testimonials: null,
      images: new Map()
    };
  }

  // Preload images for better performance
  async preloadImages(itemNames = []) {
    const promises = itemNames.map(itemName => {
      return new Promise((resolve) => {
        const img = new Image();
        const imageUrl = this.getItemImage('', itemName);
        img.onload = () => resolve(imageUrl);
        img.onerror = () => resolve(imageUrl); // Still resolve to avoid blocking
        img.src = imageUrl;
      });
    });

    try {
      await Promise.all(promises);
    } catch (error) {
      // Images failed to preload - silent fail for better UX
    }
  }
}

// Export singleton instance
export const staticDataService = new StaticDataService();
export default staticDataService;
