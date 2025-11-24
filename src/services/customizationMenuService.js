// Customization Menu Service - Replacement for staticDataService
import { vegMenu, nonVegMenu } from '../data/customizationMenu.js';
import { getServicesWithPricing, servicesData } from '../data/servicesData.js';
import { getRecentTestimonials, testimonialsData } from '../data/testimonialsData.js';

class CustomizationMenuService {
  constructor() {
    this.cache = {
      menuItems: null,
      services: null,
      testimonials: null,
      images: new Map()
    };
  }

  // Get menu items by category
  getMenuItems(category = 'all', guestCount = { veg: 10, nonVeg: 8, jain: 0 }) {
    const totalGuests = (guestCount.veg || 0) + (guestCount.nonVeg || 0);
    
    let items = [];
    
    switch (category.toLowerCase()) {
      case 'veg':
      case 'vegetarian':
        items = vegMenu;
        break;
      case 'nonveg':
      case 'non-veg':
      case 'non_veg':
        items = nonVegMenu;
        break;
      case 'all':
      default:
        items = [...vegMenu, ...nonVegMenu];
        break;
    }

    // Calculate dynamic portions and pricing based on guest count and format for display
    return items.map(item => {
      // Determine if item is veg or non-veg based on source array
      const isVegItem = vegMenu.some(vegItem => vegItem.id === item.id);
      const isNonVegItem = nonVegMenu.some(nonVegItem => nonVegItem.id === item.id);
      
      // Use specific guest count based on item type and category
      let itemGuestCount = totalGuests;
      
      // For Breads and Desserts, always use total guest count (veg + nonveg)
      // because both veg and nonveg people eat breads and desserts
      if (item.category === 'breads' || item.category === 'desserts') {
        itemGuestCount = totalGuests;
      }
      // For Starters and Main Course, use specific guest type count
      else if (isVegItem) {
        itemGuestCount = guestCount.veg || 0;
      } else if (isNonVegItem) {
        itemGuestCount = guestCount.nonVeg || 0;
      }
      
      return {
        ...item,
        // Use actual data from customizationMenu.js
        name: item.title, // Map title to name for compatibility
        description: item.description,
        price: this.calculatePriceForGuests(item, itemGuestCount),
        basePrice: item.basePrice,
        portion_size: this.calculatePortionForGuests(item, itemGuestCount),
        serves: itemGuestCount,
        quantity: item.quantity,
        pricePerPortion: item.pricePerPortion,
        rating: item.rating,
        isVeg: isVegItem,
        isNonVeg: isNonVegItem,
        // Additional calculated fields
        calculatedQuantity: this.calculatePortionForGuests(item, itemGuestCount),
        calculatedPrice: this.calculatePriceForGuests(item, itemGuestCount),
        calculatedFor: `${itemGuestCount} guests`,
        guestCount: itemGuestCount
      };
    });
  }

  // Get menu items by specific category (starters, main_course, breads, desserts)
  getMenuItemsByCategory(category, menuType = 'all', guestCount = { veg: 10, nonVeg: 8, jain: 1 }) {
    const allItems = this.getMenuItems(menuType, guestCount);
    return allItems.filter(item => item.category === category);
  }

  // Calculate portion size for guests
  calculatePortionForGuests(item, totalGuests) {
    // This unified logic correctly uses the per-person `portionSize` from the data file for ALL categories.
    // The distinction for Breads/Desserts vs. Starters/Main Course is handled by the GUEST COUNT
    // passed to this function, not by separate logic here.
    if (item.portionSize) {
      const unit = item.portionSize.includes('GM') ? 'GM' : 'PCS';
      const amountPerPerson = parseFloat(item.portionSize.replace(/[^0-9.]/g, '')) || 1;
      const totalAmount = amountPerPerson * totalGuests;

      // Handle potential floating point results for units like '1.5PC'
      const formattedAmount = Number.isInteger(totalAmount) ? totalAmount : totalAmount.toFixed(1);

      return `${formattedAmount}${unit}`;
    }

    // Fallback if portionSize is not defined (should be avoided)
    return item.quantity || '1 Portion';
  }

  // Calculate price for guests
  calculatePriceForGuests(item, totalGuests) {
    // For all items, the price is the per-person price (`basePrice`) multiplied by the relevant guest count.
    // The `basePrice` in the data file represents the cost for one person's portion (e.g., 2PCS of Paneer Tikka).
    if (item.basePrice) {
      return item.basePrice * totalGuests;
    }

    // Fallback for safety
    return item.price || 0;
  }

  // Get services with dynamic pricing (keeping compatibility)
  getServices(guestCount = { veg: 10, nonVeg: 8, jain: 0 }) {
    return getServicesWithPricing(guestCount);
  }

  // Get all services data
  getAllServices() {
    return servicesData;
  }

  // Get testimonials (keeping compatibility)
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

  // Get item image with fallback
  getItemImage(imagePath, itemName) {
    const cacheKey = `${imagePath}-${itemName}`;
    
    if (this.cache.images.has(cacheKey)) {
      return this.cache.images.get(cacheKey);
    }
    
    // Use the image path from the item directly
    let imageUrl = imagePath;
    
    // Fallback logic for missing images
    if (!imageUrl || imageUrl.includes('assets/images/')) {
      // Convert old paths to new structure
      const itemNameFormatted = itemName?.toLowerCase().replace(/\s+/g, '-') || 'default';
      imageUrl = `/src/assets/Images/VEG-STARTERS-MENU/${itemNameFormatted}.jpg`;
    }
    
    this.cache.images.set(cacheKey, imageUrl);
    return imageUrl;
  }

  // Get combined data for components (main replacement method)
  getComponentData(guestCount = { veg: 10, nonVeg: 8, jain: 0 }) {
    try {
      
      const menuItems = this.getMenuItems('all', guestCount);
      const services = this.getServices(guestCount);
      const testimonials = this.getTestimonials(3, 'recent');
      
      
      return {
        menuItems,
        services,
        testimonials,
        getItemImage: this.getItemImage.bind(this),
        getMenuItems: this.getMenuItems.bind(this),
        getMenuItemsByCategory: this.getMenuItemsByCategory.bind(this)
      };
    } catch (error) {
      console.error('❌ CustomizationMenuService: Error loading component data:', error);
      return {
        menuItems: [],
        services: [],
        testimonials: [],
        getItemImage: this.getItemImage.bind(this),
        getMenuItems: this.getMenuItems.bind(this),
        getMenuItemsByCategory: this.getMenuItemsByCategory.bind(this)
      };
    }
  }

  // Get menu data for specific menu type and package
  getMenuData(menuType = 'veg', packageType = null, guestCount = { veg: 10, nonVeg: 8, jain: 0 }) {
    const items = this.getMenuItems(menuType, guestCount);
    
    // Group by category
    const groupedItems = items.reduce((acc, item) => {
      const category = item.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {});

    return {
      items,
      groupedItems,
      categories: Object.keys(groupedItems),
      totalItems: items.length
    };
  }

  // Clear cache
  clearCache() {
    this.cache = {
      menuItems: null,
      services: null,
      testimonials: null,
      images: new Map()
    };
  }

  // Preload images for better performance
  async preloadImages(items = []) {
    const promises = items.map(item => {
      return new Promise((resolve) => {
        const img = new Image();
        const imageUrl = item.image || this.getItemImage('', item.title);
        img.onload = () => resolve(imageUrl);
        img.onerror = () => resolve(imageUrl); // Still resolve to avoid blocking
        img.src = imageUrl;
      });
    });

    try {
      await Promise.all(promises);
    } catch (error) {
    }
  }
}

// Export singleton instance
export const customizationMenuService = new CustomizationMenuService();
export default customizationMenuService;
