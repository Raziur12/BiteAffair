// Centralized Menu Data Service with Guest Count Integration
import { jainMenu } from '../data/jain-menu.js';
import { vegMenuStandard499, vegMenuPremium499 } from '../data/Veg-menu.js';
import { vegMenu, nonVegMenu } from '../data/customizationMenu.js';

class MenuDataService {
  constructor() {
    this.basePortionCalculations = {
      // Per person calculations for different item types
      starters: {
        pieces: 4, // 4 pieces per person for tikka/kabab items
        weight: 0.1 // 100g per person for weight-based items
      },
      mainCourse: {
        curry: 0.15, // 150g per person for curries
        rice: 0.1, // 100g per person for rice items
        dal: 0.1 // 100g per person for dal
      },
      breads: {
        pieces: 2 // 2 pieces per person
      },
      desserts: {
        pieces: 2, // 2 pieces per person for countable items
        weight: 0.08 // 80g per person for weight-based items
      }
    };

    // Removed redundant pricePerPortion object - using prices from actual data files
  }

  // Calculate dynamic portion size based on guest count
  calculatePortionSize(itemName, category, guestCount, itemType = 'pieces') {
    const totalGuests = guestCount.veg + guestCount.nonVeg + (guestCount.jain || 0);
    
    if (totalGuests === 0) return '0pc';

    let portionPerPerson;
    
    switch (category.toLowerCase()) {
      case 'starters':
        portionPerPerson = itemType === 'weight' ? 
          this.basePortionCalculations.starters.weight : 
          this.basePortionCalculations.starters.pieces;
        break;
      case 'main-course':
      case 'main course':
        if (itemName.toLowerCase().includes('rice') || itemName.toLowerCase().includes('biryani')) {
          portionPerPerson = this.basePortionCalculations.mainCourse.rice;
        } else if (itemName.toLowerCase().includes('dal')) {
          portionPerPerson = this.basePortionCalculations.mainCourse.dal;
        } else {
          portionPerPerson = this.basePortionCalculations.mainCourse.curry;
        }
        break;
      case 'breads':
        portionPerPerson = this.basePortionCalculations.breads.pieces;
        break;
      case 'desserts':
        portionPerPerson = itemType === 'weight' ? 
          this.basePortionCalculations.desserts.weight : 
          this.basePortionCalculations.desserts.pieces;
        break;
      default:
        portionPerPerson = itemType === 'weight' ? 0.1 : 2;
    }

    const totalPortion = Math.ceil(portionPerPerson * totalGuests);
    
    // Return appropriate format based on item type
    if (itemType === 'weight') {
      return `${totalPortion}kg`;
    } else {
      return `${totalPortion}pc`;
    }
  }

  // Calculate dynamic price based on guest count
  calculatePrice(itemName, category, guestCount) {
    const totalGuests = guestCount.veg + guestCount.nonVeg + (guestCount.jain || 0);
    
    if (totalGuests === 0) return 0;

    // Use simple default pricing per category (prices will come from actual data files)
    let basePrice = 0;
    switch (category.toLowerCase()) {
      case 'starters':
        basePrice = 25;
        break;
      case 'main-course':
      case 'main course':
      case 'main':
        basePrice = 30;
        break;
      case 'breads':
        basePrice = 10;
        break;
      case 'desserts':
        basePrice = 15;
        break;
      case 'rice':
        basePrice = 20;
        break;
      default:
        basePrice = 20;
    }

    return Math.ceil(basePrice * totalGuests);
  }

  // Get menu items with dynamic calculations
  getMenuItemsWithGuestCount(menuType, packageType = 'standard', guestCount = { veg: 10, nonVeg: 8, jain: 1 }) {
    // Get base menu items directly from data files
    let baseMenuItems;
    switch (menuType) {
      case 'jain':
        baseMenuItems = jainMenu;
        break;
      case 'veg':
        baseMenuItems = packageType === 'premium' ? vegMenuPremium499 : vegMenuStandard499;
        break;
      case 'customized':
        baseMenuItems = [...vegMenu, ...nonVegMenu];
        break;
      case 'cocktail':
        // For cocktail menu, we'll use customization menu as fallback
        baseMenuItems = [...vegMenu, ...nonVegMenu];
        break;
      default:
        baseMenuItems = jainMenu; // Default fallback
    }
    
    if (!baseMenuItems) {
      return null;
    }

    // Process different menu structures
    if (Array.isArray(baseMenuItems)) {
      // Handle flat array structure (like packages menu)
      return baseMenuItems.map(item => this.enhanceItemWithGuestCount(item, guestCount, packageType));
    } else if (baseMenuItems.categories) {
      // Handle categorized structure
      return {
        ...baseMenuItems,
        categories: baseMenuItems.categories.map(category => ({
          ...category,
          items: category.items ? category.items.map(item => 
            this.enhanceItemWithGuestCount(item, guestCount)
          ) : []
        }))
      };
    } else if (typeof baseMenuItems === 'object') {
      // Handle object structure with category keys
      const enhancedItems = {};
      Object.keys(baseMenuItems).forEach(categoryKey => {
        if (Array.isArray(baseMenuItems[categoryKey])) {
          enhancedItems[categoryKey] = baseMenuItems[categoryKey].map(itemName => {
            // Handle both string and object items
            const itemObj = typeof itemName === 'string' ? { name: itemName, category: categoryKey } : itemName;
            return this.enhanceItemWithGuestCount(itemObj, guestCount);
          });
        }
      });
      return enhancedItems;
    }

    return baseMenuItems;
  }

  // Clean item name by removing portion and price information
  cleanItemName(itemName) {
    if (!itemName) return itemName;
    
    // Remove patterns like:
    // "- 40pc", "- 2kg", "- 2PCS - ₹80", "- 10pc - ₹150", "- 2kg + 30pc", etc.
    let cleanName = itemName;
    
    // First, remove portion with price: "- 2PCS - ₹80"
    cleanName = cleanName.replace(/\s*-\s*\d+\s*(PCS?|pc|pieces?|kg|g)\s*-\s*₹\d+.*$/i, '');
    
    // Then, remove standalone portions: "- 40pc", "- 2kg", "- 2kg + 30pc"
    cleanName = cleanName.replace(/\s*-\s*\d+\.?\d*\s*(PCS?|pc|pieces?|kg|g)(\s*\+\s*\d+\s*(pc|PCS?))?.*$/i, '');
    
    // Remove any trailing spaces and dashes
    cleanName = cleanName.replace(/\s*-\s*$/, '').trim();
    
    return cleanName;
  }

  // Enhance individual item with guest count calculations
  enhanceItemWithGuestCount(item, guestCount, packageType = 'standard') {
    if (!item) return item;
    
    // Handle string items by converting to object
    if (typeof item === 'string') {
      item = { name: item, category: 'starters' };
    }
    
    if (!item.name) return item;

    // Clean the item name to remove portion and price information
    const cleanName = this.cleanItemName(item.name);

    const category = item.category || 'starters';
    
    // Determine if item is weight-based or piece-based
    const isWeightBased = item.name.toLowerCase().includes('curry') || 
                         item.name.toLowerCase().includes('masala') || 
                         item.name.toLowerCase().includes('dal') ||
                         item.name.toLowerCase().includes('rice') ||
                         item.name.toLowerCase().includes('biryani') ||
                         item.name.toLowerCase().includes('phirni') ||
                         item.name.toLowerCase().includes('kheer');

    const itemType = isWeightBased ? 'weight' : 'pieces';
    
    // Determine if item is vegetarian based on name and common non-veg keywords
    const nonVegKeywords = ['chicken', 'mutton', 'fish', 'prawn', 'egg', 'meat', 'beef', 'pork', 'lamb', 'seekh'];
    const isNonVeg = nonVegKeywords.some(keyword => item.name.toLowerCase().includes(keyword));
    const isVeg = !isNonVeg;

    return {
      ...item,
      name: cleanName, // Use cleaned name without portion and price info
      isVeg: isVeg,
      isNonVeg: isNonVeg,
      packageType: packageType, // Add package type for veg menu items
      portion_size: this.calculatePortionSize(cleanName, category, guestCount, itemType),
      price: this.calculatePrice(cleanName, category, guestCount),
      guestCount: guestCount,
      calculatedFor: `${guestCount.veg + guestCount.nonVeg + (guestCount.jain || 0)} guests`,
      breakdown: {
        veg: guestCount.veg,
        nonVeg: guestCount.nonVeg,
        jain: guestCount.jain || 0,
        total: guestCount.veg + guestCount.nonVeg + (guestCount.jain || 0)
      }
    };
  }

  // Get menu data for specific menu type with guest count integration
  async getMenuData(menuType, packageType = 'standard', guestCount = { veg: 10, nonVeg: 8, jain: 0 }) {
    try {
      
      // Use the centralized menu items service
      const menuItems = this.getMenuItemsWithGuestCount(menuType, packageType, guestCount);
      
      
      if (!menuItems) {
        throw new Error(`Menu type "${menuType}" not found`);
      }

      const result = {
        success: true,
        data: menuItems,
        guestCount: guestCount,
        menuType: menuType,
        packageType: packageType
      };
      
      return result;
    } catch (error) {
      console.error('❌ MenuDataService: Error loading menu data:', error);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  // Get all available menu types
  getAvailableMenuTypes() {
    return [
      { value: 'jain', label: 'Jain Menu' },
      { value: 'veg', label: 'Veg Menu' },
      { value: 'customized', label: 'Customized Menu' },
      { value: 'cocktail', label: 'Cocktail Party Menu' },
      { value: 'packages', label: 'Package Menu' }
    ];
  }

  // Get package types for package menu
  getPackageTypes() {
    return ['standard', 'premium'];
  }

  // Validate guest count
  validateGuestCount(guestCount) {
    if (!guestCount || typeof guestCount !== 'object') {
      return { veg: 10, nonVeg: 8, jain: 1 };
    }

    return {
      veg: Math.max(1, parseInt(guestCount.veg) || 1),
      nonVeg: Math.max(1, parseInt(guestCount.nonVeg) || 1),
      jain: Math.max(1, parseInt(guestCount.jain) || 1)
    };
  }

  // Get guest count from booking config
  getGuestCountFromBooking(bookingConfig) {
    if (!bookingConfig) {
      return { veg: 10, nonVeg: 8, jain: 1 };
    }

    const guestCount = {
      veg: Math.max(1, parseInt(bookingConfig.vegGuest || bookingConfig.vegCount || 10)),
      nonVeg: Math.max(1, parseInt(bookingConfig.nonVegGuest || bookingConfig.nonVegCount || 8)),
      jain: Math.max(1, parseInt(bookingConfig.jainGuest || bookingConfig.jainCount || 1))
    };

    return guestCount;
  }
}

// Export singleton instance
export const menuDataService = new MenuDataService();
export default menuDataService;
