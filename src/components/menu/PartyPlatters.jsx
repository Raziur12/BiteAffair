import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  Radio,
  RadioGroup
} from '@mui/material';
import {
  Search,
  FilterList,
  Add,
  Remove,
  ShoppingCart,
  Close,
  Phone,
  Instagram,
  YouTube,
  WhatsApp,
  ChevronLeft,
  ChevronRight,
  AccessTime,
  Celebration,
  ExpandMore,
  ExpandLess
} from '@mui/icons-material';
import { useCart } from '../../context/CartContext';
import ItemCustomizationModal from './ItemCustomizationModal';
import VegPackageModal from './VegPackageModal';
import { CartSummary, CartModal } from '../cart';
import CheckoutConfirmation from '../cart/CheckoutConfirmation';
import EnhancedCheckout from '../cart/EnhancedCheckout';
import { MenuGridSkeleton, EnhancedLoader, MenuLoadError, EmptyState } from '../common';
import { menuDataService } from '../../services/menuDataService';
import { customizationMenuService } from '../../services/customizationMenuService';
import cocktailPartyMenuData from '../../data/cocktailPartyMenu.json';
import packagesMenuData from '../../data/packagesMenu.json';

const PartyPlatters = ({ id, onOpenCart, bookingConfig }) => {
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { addItem, getItemQuantity, totalItems, items: cartItems, removeItem: removeFromCart, updateQuantity } = useCart();

  // State declarations - MUST be before useEffect hooks
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMenu, setSelectedMenu] = useState(() => {
    // Set initial menu based on booking config if available
    if (bookingConfig?.menu) {
      return bookingConfig.menu;
    }
    return 'customized';
  });
  const [sortBy, setSortBy] = useState('');
  const [numberOfPax, setNumberOfPax] = useState('');
  const [location, setLocation] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [menuData, setMenuData] = useState({ categories: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [guestCount, setGuestCount] = useState(() => {
    try {
      const stored = localStorage.getItem('biteAffair_guestCount');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return {
            veg: Math.max(5, parseInt(parsed.veg) || 5),
            nonVeg: Math.max(5, parseInt(parsed.nonVeg) || 5),
            jain: Math.max(5, parseInt(parsed.jain) || 5)
          };
        }
      }
    } catch (e) {
    }
    // Default guest counts (minimum 5 each)
    return { veg: 10, nonVeg: 8, jain: 5 };
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [customizationModalOpen, setCustomizationModalOpen] = useState(false);
  const [vegPackageModalOpen, setVegPackageModalOpen] = useState(false);
  const [cartModalOpen, setCartModalOpen] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [enhancedCheckoutOpen, setEnhancedCheckoutOpen] = useState(false);
  const [imageErrors, setImageErrors] = useState({});
  const [vegFilter, setVegFilter] = useState(true);
  const [nonVegFilter, setNonVegFilter] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [vegMenuType, setVegMenuType] = useState('standard'); // 'standard' or 'premium'
  const [collapsedSections, setCollapsedSections] = useState({}); // Track collapsed state for each category
  const [services, setServices] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const userEditRef = useRef(false);
  const lastUserEditAt = useRef(0);
  const initializedFromBookingRef = useRef(false);
  const menuUserOverrideRef = useRef(false);
  const [syncTrigger, setSyncTrigger] = useState(0);

  // Preload common item images once to improve perceived performance
  useEffect(() => {
    try {
      const commonItems = ['paneer', 'tikka', 'kabab', 'rice', 'naan', 'dal'];
      customizationMenuService.preloadImages(commonItems);
    } catch {}
  }, []);

  // Helper function to get service count based on item type
  const getServiceCountForItem = (item) => {
    if (!item) return parseInt(guestCount.veg);
    
    // Check if item is non-veg first (priority check)
    if (item.isNonVeg) {
      return parseInt(guestCount.nonVeg);
    }
    // Check if item is jain
    else if (item.isJain) {
      return parseInt(guestCount.jain || 1);
    }
    // Default to veg (includes pure veg items and items without clear classification)
    else {
      return parseInt(guestCount.veg);
    }
  };

  // Extract guest count from booking config (initialize once, don't overwrite user edits)
  useEffect(() => {
    if (!bookingConfig) return;
    if (initializedFromBookingRef.current) return;

    const extractedGuestCount = {
      veg: Math.max(5, bookingConfig.vegCount || 10),
      nonVeg: Math.max(5, bookingConfig.nonVegCount || 5),
      jain: Math.max(5, bookingConfig.jainCount || 5)
    };
    setGuestCount(extractedGuestCount);
    initializedFromBookingRef.current = true;
  }, [bookingConfig]);

  // Persist guest count so it survives page refresh
  useEffect(() => {
    try {
      localStorage.setItem('biteAffair_guestCount', JSON.stringify(guestCount));
    } catch (e) {
    }
  }, [guestCount]);



  const baseMenuOptions = [
    { value: 'jain', label: 'Jain Menu' },
    { value: 'veg', label: 'Veg Menu' },
    { value: 'customized', label: 'Customized Menu' },
    { value: 'cocktail', label: 'Cocktail Party Menu' },
    { value: 'packages', label: 'Package Menu' }
  ];

  // Reorder menu options to show selected menu from booking first
  const menuOptions = (() => {
    if (bookingConfig?.menu) {
      const selectedOption = baseMenuOptions.find(option => option.value === bookingConfig.menu);
      const otherOptions = baseMenuOptions.filter(option => option.value !== bookingConfig.menu);
      return selectedOption ? [selectedOption, ...otherOptions] : baseMenuOptions;
    }
    return baseMenuOptions;
  })();

  const sortOptions = [
    { value: '', label: 'Sort By' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' }
  ];

  // Removed hardcoded package menu data - now using centralized service

  // Load menu data dynamically using appropriate service
  const loadMenuData = async () => {
    setLoading(true);
    setError(null);
    try {

      let formattedData;

      // Handle Jain menu specifically
      if (selectedMenu === 'jain') {
        const jainMenuResult = await menuDataService.getMenuData('jain', 'standard', guestCount);
        
        if (jainMenuResult.success && jainMenuResult.data) {
          const jainMenuData = Array.isArray(jainMenuResult.data) ? jainMenuResult.data : jainMenuResult.data.items || [];
          
          // Format Jain menu data with dynamic calculations like customization menu
          const totalJainGuests = guestCount.jain || guestCount.veg || 17;
          
          formattedData = {
            items: jainMenuData.map(item => {
              // Calculate dynamic portion and pricing based on guest count
              const baseServes = item.serves || 5;
              const calculatedQuantity = Math.ceil((totalJainGuests / baseServes) * parseInt(item.quantity || '1'));
              // Treat basePrice from jain-menu.js as per-person price (e.g., ₹80 per guest)
              // so total price scales directly with Jain guest count
              const calculatedPrice = Math.ceil(item.basePrice * totalJainGuests);
              
              // Determine portion size display
              let portionDisplay = item.portionSize;
              if (item.unit === 'PCS') {
                const totalPieces = Math.ceil((totalJainGuests / baseServes) * parseInt(item.quantity.replace('PCS', '') || '1'));
                portionDisplay = `${totalPieces}PCS`;
              } else if (item.unit === 'GM') {
                const totalWeight = Math.ceil((totalJainGuests / baseServes) * parseInt(item.quantity.replace('GM', '') || '500'));
                portionDisplay = `${totalWeight}GM`;
              }

              return {
                ...item,
                name: item.title || item.name, // Map title to name for consistency
                isJain: true,
                isVeg: true,
                // Dynamic calculations
                calculatedPrice: calculatedPrice,
                calculatedFor: totalJainGuests,
                calculatedQuantity: calculatedQuantity,
                portion_size: portionDisplay,
                serves: totalJainGuests,
                // Additional fields for consistency with customization menu
                guestCount: totalJainGuests,
                basePrice: item.basePrice,
                originalServes: baseServes
              };
            }),
            categories: [...new Set(jainMenuData.map(item => item.category))],
            totalItems: jainMenuData.length
          };
        } else {
          throw new Error(jainMenuResult.error || 'Failed to load Jain menu data');
        }
      } else if (selectedMenu === 'veg') {
        // Handle Veg menu packages (Standard/Premium)
        const packageType = vegMenuType === 'premium' ? 'premium' : 'standard';
        const vegMenuResult = await menuDataService.getMenuData('veg', packageType, guestCount);
        
        if (vegMenuResult.success && vegMenuResult.data) {
          const vegMenuData = Array.isArray(vegMenuResult.data) ? vegMenuResult.data : vegMenuResult.data.items || [];
          
          // For Veg menu, pricing is fixed at ₹499 per package regardless of guest count
          formattedData = {
            items: vegMenuData.map(item => ({
              ...item,
              name: item.title || item.name,
              isVeg: true,
              // Fixed package pricing - no guest count calculations
              price: item.basePrice || 499,
              calculatedPrice: item.basePrice || 499,
              serves: item.serves || 20,
              quantity: item.quantity || item.portionSize,
              portion_size: item.portionSize || item.quantity,
              packageType: packageType,
              isPackageItem: true
            })),
            categories: [...new Set(vegMenuData.map(item => item.category))],
            totalItems: vegMenuData.length,
            packageType: packageType
          };
        } else {
          throw new Error(vegMenuResult.error || 'Failed to load Veg menu data');
        }
      } else if (selectedMenu === 'packages') {
        const toTitleCase = (value) => {
          const str = String(value || '').trim();
          if (!str) return str;
          return str.charAt(0).toUpperCase() + str.slice(1);
        };

        const pax = parseInt(numberOfPax) || 20;
        const entries = packagesMenuData && typeof packagesMenuData === 'object'
          ? Object.entries(packagesMenuData)
          : [];

        const packageItems = entries
          .filter(([, pkg]) => pkg && typeof pkg === 'object')
          .map(([key, pkg], idx) => {
            const pkgPax = parseInt(pkg?.quantityFor?.pax) || pax;
            const pricePerGuest = parseFloat(pkg?.price) || 0;

            const includes = pkg?.includes || {};
            const includesText = Object.keys(includes).length
              ? Object.entries(includes)
                  .map(([k, v]) => `${toTitleCase(k)}: ${v === true ? 'Yes' : v}`)
                  .join(' | ')
              : '';

            return {
              id: `package_${key}_${idx}`,
              title: pkg?.name || key,
              name: pkg?.name || key,
              category: 'main_course',
              description: includesText,
              isVeg: true,
              isNonVeg: false,
              price: pricePerGuest,
              calculatedPrice: pricePerGuest,
              basePrice: pricePerGuest,
              serves: pkgPax,
              packagePax: pkgPax,
              packageKey: key,
              packageIncludes: pkg?.includes,
              packageItems: pkg?.items,
              portion_size: `${pkgPax} pax`,
              calculatedQuantity: `${pkgPax} pax`
            };
          });

        formattedData = {
          items: packageItems,
          categories: [...new Set(packageItems.map(item => item.category))],
          totalItems: packageItems.length
        };
      } else if (selectedMenu === 'cocktail') {
        const cocktailRoot = cocktailPartyMenuData?.cocktailPartyMenu;
        const categories = cocktailRoot?.categories;

        if (!categories || typeof categories !== 'object') {
          throw new Error('Failed to load Cocktail Party menu data');
        }

        const nonVegKeywords = ['chicken', 'mutton', 'fish', 'prawn', 'egg', 'meat', 'beef', 'pork', 'lamb', 'seekh'];
        const parsePricePerPortion = (value) => {
          const str = String(value ?? '');
          const match = str.match(/[0-9]+(?:\.[0-9]+)?/);
          return match ? Number(match[0]) : 0;
        };

        const scalePortionForGuests = (portionSize, serves) => {
          const raw = String(portionSize ?? '').trim();
          if (!raw) return '';

          const parts = raw.split('+').map(p => p.trim()).filter(Boolean);
          const scaled = parts.map((part) => {
            const numMatch = part.match(/[0-9]+(?:\.[0-9]+)?/);
            const baseAmount = numMatch ? Number(numMatch[0]) : 0;
            const unit = /GM/i.test(part) ? 'GM' : 'PCS';

            const total = baseAmount * (Number(serves) || 0);
            const formatted = Number.isInteger(total) ? total : total.toFixed(1);
            return `${formatted}${unit}`;
          });

          return scaled.join(' + ');
        };

        const totalGuests = (guestCount?.veg || 0) + (guestCount?.nonVeg || 0) + (guestCount?.jain || 0);
        const getServesForItem = (itemCategory, isNonVeg) => {
          if (itemCategory === 'desserts' || itemCategory === 'dessert' || itemCategory === 'breads') {
            return totalGuests;
          }
          return isNonVeg ? (guestCount?.nonVeg || 0) : (guestCount?.veg || 0);
        };

        let idCounter = 1;
        const mapCocktailItems = (items, itemCategory, forcedDiet = null) => {
          if (!Array.isArray(items)) return [];

          return items
            .filter(Boolean)
            .map((entry) => {
              const name = entry?.name;
              if (!name) return null;

              const inferredNonVeg = nonVegKeywords.some(k => String(name).toLowerCase().includes(k));
              const isNonVeg = forcedDiet === 'nonVeg' ? true : forcedDiet === 'veg' ? false : inferredNonVeg;
              const isVeg = !isNonVeg;
              const serves = getServesForItem(itemCategory, isNonVeg);
              const basePrice = parsePricePerPortion(entry?.pricePerPortion);

              const baseItem = {
                id: `cocktail_${idCounter++}`,
                title: name,
                name,
                category: itemCategory,
                portionSize: entry?.portionSize,
                pricePerPortion: basePrice ? `₹${basePrice}` : entry?.pricePerPortion,
                basePrice,
                isVeg,
                isNonVeg,
                serves
              };

              const portion = scalePortionForGuests(entry?.portionSize, serves) || customizationMenuService.calculatePortionForGuests(baseItem, serves);
              const price = customizationMenuService.calculatePriceForGuests(baseItem, serves);

              return {
                ...baseItem,
                portion_size: portion,
                calculatedQuantity: portion,
                price,
                calculatedPrice: price,
                guestCount: serves
              };
            })
            .filter(Boolean);
        };

        const cocktailItems = [
          ...mapCocktailItems(categories.vegStarters, 'starters', 'veg'),
          ...mapCocktailItems(categories.nonVegStarters, 'starters', 'nonVeg'),
          ...mapCocktailItems(categories.mainsVegAndNonVeg, 'main_course'),
          ...mapCocktailItems(categories.desserts, 'desserts')
        ];

        formattedData = {
          items: cocktailItems,
          categories: [...new Set(cocktailItems.map(item => item.category))],
          totalItems: cocktailItems.length
        };
      } else {
        // Use customizationMenuService for other menus (customized, nonveg, etc.)
        let menuType = 'all';
        if (selectedMenu === 'nonveg' || vegMenuType === 'nonveg') {
          menuType = 'nonveg';
        } else if (selectedMenu === 'customized') {
          // For customized menu, show all items (both veg and non-veg)
          menuType = 'all';
        } else if (vegMenuType === 'veg') {
          menuType = 'veg';
        }

        const menuItems = customizationMenuService.getMenuItems(menuType, guestCount);
        
        // Format data to match expected structure
        formattedData = {
          items: menuItems,
          categories: [...new Set(menuItems.map(item => item.category))],
          totalItems: menuItems.length
        };
      }

      setMenuData(formattedData);
      
    } catch (error) {
      console.error('Error loading menu data:', error);
      setError(error.message || 'Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMenuData();
  }, [selectedMenu, vegMenuType, guestCount, numberOfPax]);

  // When coming from cart Edit link, auto-open VegPackageModal
  useEffect(() => {
    if (!routerLocation || !routerLocation.search) return;

    const params = new URLSearchParams(routerLocation.search);
    const editVegPackage = params.get('editVegPackage');

    if (editVegPackage) {
      // Ensure Veg menu is active
      setSelectedMenu('veg');
      // Set package type based on query param
      setVegMenuType(editVegPackage === 'premium' ? 'premium' : 'standard');
      // Open the Veg package customization modal
      setVegPackageModalOpen(true);
    }
  }, [routerLocation]);

  // Set default numberOfPax for packages
  useEffect(() => {
    if (selectedMenu === 'packages' && !numberOfPax) {
      setNumberOfPax('20');
    }
  }, [selectedMenu]);

  // Update selected menu when booking config changes
  useEffect(() => {
    if (!bookingConfig?.menu) return;
    // If user manually changed dropdown, do not override their choice.
    if (menuUserOverrideRef.current) return;

    if (bookingConfig.menu !== selectedMenu) {
      setSelectedMenu(bookingConfig.menu);
    }
  }, [bookingConfig?.menu, selectedMenu]);

  // Update veg/non-veg filters based on selected menu
  useEffect(() => {
    switch (selectedMenu) {
      case 'jain':
        // Jain menu - only show jain items (typically veg)
        setVegFilter(true);
        setNonVegFilter(false);
        break;
      case 'veg':
        // Veg menu - only show veg items
        setVegFilter(true);
        setNonVegFilter(false);
        break;
      case 'customized':
      case 'cocktail':
      case 'packages':
        // These menus allow both veg and non-veg options
        // Set filters based on guest count from booking
        if (bookingConfig) {
          setVegFilter(bookingConfig.vegCount > 0);
          setNonVegFilter(bookingConfig.nonVegCount > 0);
        } else {
          // Default to both if no booking config
          setVegFilter(true);
          setNonVegFilter(true);
        }
        break;
      default:
        break;
    }
  }, [selectedMenu, bookingConfig]);

  // Get all items from all categories with proper filtering
  const getAllItems = () => {
    if (!menuData) return [];

    // Handle new menuDataService structure (object with category keys)
    if (typeof menuData === 'object' && !Array.isArray(menuData)) {
      // Check if it's the customizationMenuService structure with items array
      if (menuData.items && Array.isArray(menuData.items)) {
        return menuData.items;
      }

      // Check if it's the enhanced object structure from menuDataService
      if (menuData.starters || menuData.mainCourse || menuData.breads || menuData.desserts) {
        const allItems = [];
        Object.keys(menuData).forEach(categoryKey => {
          if (Array.isArray(menuData[categoryKey])) {
            allItems.push(...menuData[categoryKey]);
          }
        });
        return allItems;
      }

      // Handle legacy structures
      if (menuData.categories) {
        return menuData.categories.flatMap(category => category.items || []);
      }

      if (menuData.COCKTAIL_PARTY_MENU) {
        const cocktailMenu = menuData.COCKTAIL_PARTY_MENU;
        const allItems = [];
        if (cocktailMenu.veg_starters) allItems.push(...cocktailMenu.veg_starters);
        if (cocktailMenu.non_veg_starters) allItems.push(...cocktailMenu.non_veg_starters);
        return allItems;
      }

      if (menuData.JAIN_MENU && menuData.JAIN_MENU.categories) {
        return menuData.JAIN_MENU.categories.flatMap(category => category.items || []);
      }
    }

    // Handle array structure (packages menu)
    if (Array.isArray(menuData)) {
      return menuData;
    }

    
    return [];
  };

  // Get categories for filtering
  const getCategories = () => {
    const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Desserts'];
    return categories;
  };

  // Filter and sort items based on search query, dietary preferences, category, and sorting
  const filteredAndSortedItems = useMemo(() => {
    // First filter items
    const filtered = getAllItems().filter(item => {
      if (!item) return false;

      const matchesSearch = searchQuery === '' ||
        (item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      // Handle Jain Menu Standard/Premium filtering (Veg menu uses separate arrays, no filtering needed)
      if (selectedMenu === 'jain') {
        const matchesMenuType = vegMenuType === 'standard' ?
          (!item.isPremium && item.isJain) : // Standard: non-premium items
          (item.isPremium && item.isJain);   // Premium: premium items

        if (!matchesMenuType) return false;
      }

      // Treat some categories (like breads/desserts) as neutral so they are visible
      // for both veg and non-veg guest selections
      const isNeutralCategory =
        item.category === 'breads' ||
        item.category === 'desserts' ||
        item.category === 'dessert';

      // Diet filtering based on veg/non-veg radio buttons
      const matchesDiet = 
        // If no filters are selected, show all items
        (!vegFilter && !nonVegFilter) ||
        // If veg filter is selected, show only veg items
        (vegFilter && !nonVegFilter && item.isVeg) ||
        // If non-veg filter is selected, show only non-veg items, but keep neutral categories visible
        (!vegFilter && nonVegFilter && (item.isNonVeg || isNeutralCategory)) ||
        // If both filters are selected, show all items
        (vegFilter && nonVegFilter);

      // More flexible category matching
      const matchesCategory = !selectedCategory || selectedCategory === 'All' ||
        (selectedCategory === 'Starters' &&
          (item.category === 'starters' ||
            (item.name && (item.name.toLowerCase().includes('tikka') ||
              item.name.toLowerCase().includes('kabab') ||
              item.name.toLowerCase().includes('starter'))))) ||
        (selectedCategory === 'Main Course' &&
          (item.category === 'main_course' || item.category === 'main' ||
            (item.name && (item.name.toLowerCase().includes('paneer') ||
              item.name.toLowerCase().includes('dal') ||
              item.name.toLowerCase().includes('rice') ||
              item.name.toLowerCase().includes('biryani') ||
              item.name.toLowerCase().includes('curry') ||
              item.name.toLowerCase().includes('masala'))))) ||
        (selectedCategory === 'Breads' &&
          (item.category === 'breads' ||
            (item.name && (item.name.toLowerCase().includes('naan') ||
              item.name.toLowerCase().includes('roti') ||
              item.name.toLowerCase().includes('bread'))))) ||
        (selectedCategory === 'Desserts' &&
          (item.category === 'desserts' || item.category === 'dessert' ||
            (item.name && (item.name.toLowerCase().includes('jamun') ||
              item.name.toLowerCase().includes('phirni') ||
              item.name.toLowerCase().includes('dessert')))));

      return matchesSearch && matchesDiet && matchesCategory;
    });

    // Then sort items based on sortBy value
    if (!sortBy || sortBy === '') return filtered;

    return [...filtered].sort((a, b) => {
      const priceA = parseFloat(a.price) || 0;
      const priceB = parseFloat(b.price) || 0;

      switch (sortBy) {
        case 'price-low':
          return priceA - priceB;
        case 'price-high':
          return priceB - priceA;
        case 'popular':
          // Sort by name alphabetically as a proxy for popularity
          return (a.name || '').localeCompare(b.name || '');
        default:
          return 0;
      }
    });
  }, [menuData, searchQuery, selectedMenu, vegMenuType, vegFilter, nonVegFilter, selectedCategory, sortBy, bookingConfig]);

  // Group items by category for list display (depends on filteredAndSortedItems)
  const itemsByCategory = useMemo(() => {
    const items = filteredAndSortedItems;
    const categories = {
      'STARTERS': [],
      'MAIN COURSE': [],
      'BREADS': [],
      'DESSERTS': []
    };

    items.forEach(item => {
      const category = item.category || '';
      if (category === 'starters') {
        categories['STARTERS'].push(item);
      } else if (category === 'main_course' || category === 'main') {
        categories['MAIN COURSE'].push(item);
      } else if (category === 'breads') {
        categories['BREADS'].push(item);
      } else if (category === 'desserts' || category === 'dessert') {
        categories['DESSERTS'].push(item);
      } else {
        if (item.name && (item.name.toLowerCase().includes('tikka') || item.name.toLowerCase().includes('kabab'))) {
          categories['STARTERS'].push(item);
        } else if (item.name && (item.name.toLowerCase().includes('paneer') || item.name.toLowerCase().includes('dal') || item.name.toLowerCase().includes('rice') || item.name.toLowerCase().includes('biryani'))) {
          categories['MAIN COURSE'].push(item);
        } else if (item.name && (item.name.toLowerCase().includes('naan') || item.name.toLowerCase().includes('roti'))) {
          categories['BREADS'].push(item);
        } else if (item.name && (item.name.toLowerCase().includes('jamun') || item.name.toLowerCase().includes('phirni'))) {
          categories['DESSERTS'].push(item);
        } else {
          categories['STARTERS'].push(item);
        }
      }
    });

    return categories;
  }, [filteredAndSortedItems]);

  // Handle adding item to cart
  const handleAddToCart = (item) => {
    if (selectedMenu === 'packages') {
      const pax = parseInt(item?.packagePax || item?.serves || numberOfPax) || 20;
      const perGuestPrice = parseFloat(item?.price || item?.calculatedPrice || item?.basePrice) || 0;

      const packageCartItem = {
        ...item,
        id: `${item.id}_${Date.now()}`,
        quantity: pax,
        serves: pax,
        calculatedQuantity: `${pax} pax`,
        price: perGuestPrice,
        calculatedPrice: perGuestPrice
      };

      addItem(packageCartItem);
      return;
    }

    if (selectedMenu === 'veg') {
      // For Veg menu, detect package type from item and set vegMenuType accordingly
      if (item.packageType) {
        setVegMenuType(item.packageType);
      } else {
      }
      // Open package customization modal with pre-selected item
      setSelectedItem(item);
      setVegPackageModalOpen(true);
    } else {
      // For other menus, use regular item customization
      setSelectedItem(item);
      setCustomizationModalOpen(true);
    }
  };

  // Handle customized item addition
  const handleCustomizedItemAdd = (customizedItem) => {
    addItem(customizedItem);
  };

  const handleProceedToCheckout = () => {
    setCartModalOpen(false);
    setEnhancedCheckoutOpen(true);
  };

  const handleEnhancedCheckoutConfirm = (orderDetails) => {
    setEnhancedCheckoutOpen(false);
    // Navigate to order status or success page
    navigate('/order-status');
  };

  // Navigation functions for service cards
  const handlePrevService = useCallback(() => {
    setCurrentServiceIndex((prev) => (prev > 0 ? prev - 1 : services.length - 1));
  }, [services.length]);

  const handleNextService = useCallback(() => {
    setCurrentServiceIndex((prev) => (prev < services.length - 1 ? prev + 1 : 0));
  }, [services.length]);

  // Toggle collapse state for category sections
  const toggleSectionCollapse = useCallback((category) => {
    setCollapsedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  }, []);

  // Handle guest count changes
  const handleGuestCountChange = (type, value) => {
    // Mark as user edit to prevent immediate sync
    userEditRef.current = true;
    lastUserEditAt.current = Date.now();

    const safeValue = Math.max(5, parseInt(value));

    setGuestCount(prev => {
      const newCount = {
        ...prev,
        [type]: safeValue
      };
      return newCount;
    });

    // Immediate in-place sync for affected items to avoid bounce-back
    const targetGuestCount = safeValue;
    cartItems.forEach(item => {
      // Skip addons and breads/desserts
      if (item.isAddon || item.category === 'breads' || item.category === 'desserts') return;

      // Match items by guest type
      const isTarget =
        (type === 'jain' && (item.isJain || selectedMenu === 'jain')) ||
        (type === 'nonVeg' && item.isNonVeg) ||
        (type === 'veg' && !item.isNonVeg && !item.isJain);

      if (isTarget && parseInt(item.quantity) !== targetGuestCount) {
        const unitPrice = item.calculatedPrice || item.price || item.basePrice || 0;

        const computeQuantityText = () => {
          if (item.portionSize && typeof item.portionSize === 'string') {
            const unit = /GM/i.test(item.portionSize) ? 'GM' : 'PCS';
            const perPersonAmount = parseFloat(item.portionSize.replace(/[^0-9.]/g, '')) || 0;
            const total = perPersonAmount * targetGuestCount;
            const formatted = Number.isInteger(total) ? total : total.toFixed(1);
            return `${formatted}${unit}`;
          }
          const source = (typeof item.portion_size === 'string' && /PCS|GM/i.test(item.portion_size))
            ? item.portion_size
            : (typeof item.quantity === 'string' && /PCS|GM/i.test(item.quantity))
              ? item.quantity
              : null;
          if (source) {
            const unit = /GM/i.test(source) ? 'GM' : 'PCS';
            const baseAmount = parseFloat(source.replace(/[^0-9.]/g, '')) || 0;
            const basisServes = Number(item.calculatedFor) || Number(item.originalServes) || Number(item.serves) || 1;
            const perServe = basisServes > 0 ? baseAmount / basisServes : 0;
            const total = Math.ceil(perServe * targetGuestCount);
            return `${total}${unit}`;
          }
          return item.quantity || '1';
        };

        const updatedItem = {
          ...item,
          quantity: targetGuestCount,
          serves: targetGuestCount,
          calculatedQuantity: computeQuantityText(),
          calculatedPrice: unitPrice
        };
        updateQuantity(item.id, targetGuestCount, updatedItem);
      }
    });

    // Release lock after short delay to allow sync to resume
    setTimeout(() => { 
      userEditRef.current = false;
    }, 350);
  };
  // Sync cart items with guest count changes
  useEffect(() => {
    // Skip if user is actively editing (short lock period) to avoid bounce-back
    if (userEditRef.current) {
      const timeSinceEdit = Date.now() - lastUserEditAt.current;
      if (timeSinceEdit < 350) {
        const remaining = 350 - timeSinceEdit;
        setTimeout(() => setSyncTrigger(v => v + 1), remaining);
        return;
      }
    }
    

    // Update all cart items to reflect new guest counts
    cartItems.forEach(item => {
      // Skip addons and breads/desserts
      if (item.isAddon || item.category === 'breads' || item.category === 'desserts') {
        return;
      }

      // Determine the correct guest type for this item
      let targetGuestCount;
      if (selectedMenu === 'jain' || item.isJain) {
        targetGuestCount = parseInt(guestCount.jain);
      } else if (item.isNonVeg) {
        targetGuestCount = parseInt(guestCount.nonVeg);
      } else {
        targetGuestCount = parseInt(guestCount.veg);
      }

      // Only update if the quantity doesn't match the target guest count
      if (parseInt(item.quantity) !== targetGuestCount) {

        // Recalculate price and quantity
        const unitPrice = item.calculatedPrice || item.price || item.basePrice || 0;

        // Compute new quantity text
        const computeQuantityText = () => {
          if (item.portionSize && typeof item.portionSize === 'string') {
            const unit = /GM/i.test(item.portionSize) ? 'GM' : 'PCS';
            const perPersonAmount = parseFloat(item.portionSize.replace(/[^0-9.]/g, '')) || 0;
            const total = perPersonAmount * targetGuestCount;
            const formatted = Number.isInteger(total) ? total : total.toFixed(1);
            return `${formatted}${unit}`;
          }

          const source = (typeof item.portion_size === 'string' && /PCS|GM/i.test(item.portion_size))
            ? item.portion_size
            : (typeof item.quantity === 'string' && /PCS|GM/i.test(item.quantity))
              ? item.quantity
              : null;

          if (source) {
            const unit = /GM/i.test(source) ? 'GM' : 'PCS';
            const baseAmount = parseFloat(source.replace(/[^0-9.]/g, '')) || 0;
            const basisServes = Number(item.calculatedFor) || Number(item.originalServes) || Number(item.serves) || 1;
            const perServe = basisServes > 0 ? baseAmount / basisServes : 0;
            const total = Math.ceil(perServe * targetGuestCount);
            return `${total}${unit}`;
          }

          return item.quantity || '1';
        };

        const newQuantityText = computeQuantityText();

        // Update the item
        const updatedItem = {
          ...item,
          quantity: targetGuestCount,
          serves: targetGuestCount,
          calculatedQuantity: newQuantityText,
          calculatedPrice: unitPrice
        };

        updateQuantity(item.id, targetGuestCount, updatedItem);
      }
    });
  }, [guestCount, selectedMenu, syncTrigger]);

  // Prevent auto-scroll on services carousel (no heavy global interval clearing)
  useEffect(() => {
    setTimeout(() => {
      userEditRef.current = false;
    }, 1200);
  }, []);

  return (
    <Box id={id} sx={{ bgcolor: '#f5f5f5', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>

      <Container maxWidth="lg" sx={{ pt: { xs: 2, sm: 3, md: 4 }, pb: { xs: 1, sm: 1, md: 2 }, px: { xs: .5, sm: 1 }, width: '100%', maxWidth: '100%' }}>

        {/* Search Bar and Menu Dropdown in Same Row */}
        <Box sx={{ mb: 1, display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            size="small"
            placeholder="Search for Dishes/Services"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
            }}
            sx={{
              flex: { xs: 1, sm: 2 },
              bgcolor: 'white',
              '& .MuiOutlinedInput-root': {
                borderRadius: '25px',
                border: '1px solid #e0e0e0',
                '&:hover': {
                  border: '1px solid #bdbdbd'
                },
                '&.Mui-focused': {
                  border: '1px solid #1976d2'
                }
              }
            }}
          />
          <Box sx={{ flex: { xs: 1, sm: 0.5 }, Width: { xs: '100%', sm: 200 }, position: 'relative' }}>
            {bookingConfig?.menu && (
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: -8,
                  left: 12,
                  bgcolor: '#1976d2',
                  color: 'white',
                  px: 1,
                  borderRadius: '4px',
                  fontSize: '0.7rem',
                  zIndex: 1
                }}
              >
                {/* Selected from booking */}
              </Typography>
            )}
            <FormControl size="small" sx={{ width: '100%' }}>
              <Select
                value={selectedMenu}
                onChange={(e) => {
                  menuUserOverrideRef.current = true;
                  setSelectedMenu(e.target.value);
                }}
                displayEmpty
                sx={{
                  bgcolor: bookingConfig?.menu === selectedMenu ? '#e3f2fd' : 'white',
                  borderRadius: '25px',
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '25px !important',
                    border: bookingConfig?.menu === selectedMenu ? '2px solid #1976d2' : '1px solid #e0e0e0',
                    '&:hover': {
                      border: bookingConfig?.menu === selectedMenu ? '2px solid #1565c0' : '1px solid #bdbdbd'
                    },
                    '&.Mui-focused': {
                      border: '2px solid #1976d2'
                    }
                  },
                  '& .MuiSelect-select': {
                    borderRadius: '25px'
                  },
                  '& fieldset': {
                    borderRadius: '25px !important'
                  }
                }}
              >
                {menuOptions.map((option, index) => (
                  <MenuItem key={option.value} value={option.value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {option.label}
                      {bookingConfig?.menu === option.value && index === 0 && (
                        <Chip
                          // label="Your Selection" 
                          size="small"
                          color="primary"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        {/* Horizontal Scrollable Filter Row - All Booking Details */}
        <Box sx={{
          mb: 2,
          overflowX: 'auto',
          bgcolor: 'white',
          borderRadius: 1,
          border: 'none',
          outline: 'none',
          boxShadow: 'none',
          '&::-webkit-scrollbar': {
            display: 'none'
          },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <Box sx={{
            display: 'flex',
            gap: 1,
            alignItems: 'center',
            p: 1.5,
            minWidth: 'max-content',
            border: 'none',
            outline: 'none'
          }}>
            {/* Veg/Non-Veg Toggles - Hide for Jain and Veg menu */}
            {selectedMenu !== 'jain' && selectedMenu !== 'veg' && (
              <>
                {/* Veg Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={vegFilter}
                      onChange={(e) => setVegFilter(e.target.checked)}
                      color="success"
                      size="small"
                    />
                  }
                  label="Veg"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: '0.75rem', fontWeight: 500 },
                    minWidth: 'max-content'
                  }}
                />

                {/* Non-Veg Toggle */}
                <FormControlLabel
                  control={
                    <Switch
                      checked={nonVegFilter}
                      onChange={(e) => setNonVegFilter(e.target.checked)}
                      color="error"
                      size="small"
                    />
                  }
                  label="Non Veg"
                  sx={{
                    '& .MuiFormControlLabel-label': { fontSize: '0.75rem', fontWeight: 500 },
                    minWidth: 'max-content'
                  }}
                />
              </>
            )}

            {/* Standard/Premium Package Selection - Show only for Veg menu */}
            {selectedMenu === 'veg' && (
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                alignItems: 'center', 
                minWidth: 'max-content'
              }}>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setVegMenuType('standard')}
                  startIcon={
                    <Box sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid #1976d2',
                      bgcolor: vegMenuType === 'standard' ? '#1976d2' : 'transparent',
                      position: 'relative',
                      mr: 0.5
                    }}>
                      {vegMenuType === 'standard' && (
                        <Box sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        }} />
                      )}
                    </Box>
                  }
                  sx={{
                    fontSize: '0.8rem',
                    px: 1,
                    py: 0.5,
                    minWidth: 'auto',
                    height: 32,
                    borderRadius: 1,
                    color: '#333',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    },
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginRight: 0.5
                    }
                  }}
                >
                  Standard
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setVegMenuType('premium')}
                  startIcon={
                    <Box sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      border: '2px solid #1976d2',
                      bgcolor: vegMenuType === 'premium' ? '#1976d2' : 'transparent',
                      position: 'relative',
                      mr: 0.5
                    }}>
                      {vegMenuType === 'premium' && (
                        <Box sx={{
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          bgcolor: 'white',
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)'
                        }} />
                      )}
                    </Box>
                  }
                  sx={{
                    fontSize: '0.8rem',
                    px: 1,
                    py: 0.5,
                    minWidth: 'auto',
                    height: 32,
                    borderRadius: 1,
                    color: '#333',
                    fontWeight: 500,
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    },
                    '& .MuiButton-startIcon': {
                      margin: 0,
                      marginRight: 0.5
                    }
                  }}
                >
                  Premium
                </Button>
              </Box>
            )}

            {/* Sort By Dropdown */}
            <FormControl size="small" sx={{ minWidth: 'max-content' }}>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                displayEmpty
                sx={{
                  bgcolor: 'white',
                  fontSize: '0.75rem',
                  borderRadius: 1,
                  height: 32,
                  minWidth: 100,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 1
                  }
                }}
              >
                {sortOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.75rem' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Occasion Display */}
            {bookingConfig?.occasion && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#fff3e0',
                border: '1px solid #ffcc02',
                borderRadius: 1,
                px: 1.5,
                height: 32,
                minWidth: 'max-content'
              }}>
                <Celebration sx={{ fontSize: 16, color: '#f57c00', mr: 0.5 }} />
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                  {bookingConfig.occasion}
                </Typography>
              </Box>
            )}

            {/* Date Selector */}
            <TextField
              size="small"
              type="date"
              value={bookingConfig?.eventDate || eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              sx={{
                minWidth: 140,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  height: 32
                },
                '& .MuiOutlinedInput-input': {
                  fontSize: '0.75rem',
                  padding: '6px 8px'
                }
              }}
            />

            {/* Time Range Display */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f0f7ff',
              border: '1px solid #e3f2fd',
              borderRadius: 1,
              px: 1.5,
              height: 32,
              minWidth: 'max-content'
            }}>
              <AccessTime sx={{ fontSize: 16, color: '#1976d2', mr: 0.5 }} />
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
                {bookingConfig?.eventTime || '02:00 PM - 02:30 PM'}
              </Typography>
            </Box>

            {/* Meal Type Display
            {bookingConfig?.mealType && (
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                bgcolor: '#f3e5f5',
                border: '1px solid #ce93d8',
                borderRadius: 1,
                px: 1.5,
                py: 0.5,
                minWidth: 'max-content'
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#7b1fa2' }}>
                  {bookingConfig.mealType === 'veg_nonveg' ? 'Veg + Non-Veg' : 
                   bookingConfig.mealType.charAt(0).toUpperCase() + bookingConfig.mealType.slice(1)}
                </Typography>
              </Box>
            )} */}

            {/* No of Pax (Veg) */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#f1f8e9',
              border: '1px solid #c8e6c9',
              borderRadius: 1,
              px: 1.5,
              height: 32,
              minWidth: 'max-content'
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#2e7d32' }}>
                {selectedMenu === 'jain' ? 'Jain:' : 'Veg:'}
              </Typography>
              <Box sx={{
                ml: 1,
                display: 'flex',
                alignItems: 'center',
                bgcolor: 'white',
                borderRadius: 1,
                px: 0.5,
                gap: 0.5
              }}>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (selectedMenu === 'jain') {
                      setGuestCount(prev => ({ 
                        ...prev, 
                        jain: Math.max(5, parseInt(prev.jain || prev.veg) - 1),
                        veg: Math.max(5, parseInt(prev.jain || prev.veg) - 1)
                      }));
                    } else {
                      setGuestCount(prev => ({ ...prev, veg: Math.max(5, parseInt(prev.veg) - 1) }));
                    }
                  }}
                  sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
                >
                  <Remove sx={{ fontSize: 12 }} />
                </IconButton>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>
                  {selectedMenu === 'jain' ? (guestCount.jain || guestCount.veg) : guestCount.veg}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => {
                    if (selectedMenu === 'jain') {
                      setGuestCount(prev => {
                        const newCount = { 
                          ...prev, 
                          jain: parseInt(prev.jain || prev.veg) + 1,
                          veg: parseInt(prev.jain || prev.veg) + 1
                        };
                        return newCount;
                      });
                    } else {
                      setGuestCount(prev => {
                        const newCount = { ...prev, veg: parseInt(prev.veg) + 1 };
                        return newCount;
                      });
                    }
                  }}
                  sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
                >
                  <Add sx={{ fontSize: 12 }} />
                </IconButton>
              </Box>
            </Box>

            {/* No of Pax (Non Veg) - Hide for Jain and Veg menu */}
            {selectedMenu !== 'jain' && selectedMenu !== 'veg' && (
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                bgcolor: '#ffebee',
                border: '1px solid #ffcdd2',
                borderRadius: 1,
                px: 1.5,
                height: 32,
                minWidth: 'max-content'
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#c62828' }}>
                  Non-Veg:
                </Typography>
                <Box sx={{
                  ml: 1,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'white',
                  borderRadius: 1,
                  px: 0.5,
                  gap: 0.5
                }}>
                  <IconButton
                    size="small"
                    onClick={() => setGuestCount(prev => ({ ...prev, nonVeg: Math.max(5, parseInt(prev.nonVeg) - 1) }))}
                    sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
                  >
                    <Remove sx={{ fontSize: 12 }} />
                  </IconButton>
                  <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 'bold', minWidth: 20, textAlign: 'center' }}>
                    {guestCount.nonVeg}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setGuestCount(prev => {
                        const newCount = { ...prev, nonVeg: parseInt(prev.nonVeg) + 1 };
                        return newCount;
                      });
                    }}
                    sx={{ width: 20, height: 20, fontSize: '0.7rem' }}
                  >
                    <Add sx={{ fontSize: 12 }} />
                  </IconButton>
                </Box>
              </Box>
            )}

            {/* Total Guest Count Display */}
            {/* <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              bgcolor: '#e3f2fd',
              border: '1px solid #90caf9',
              borderRadius: 1,
              px: 1.5,
              height: 32,
              minWidth: 'max-content'
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.75rem', fontWeight: 500, color: '#1565c0' }}>
                Total: {parseInt(guestCount.veg) + parseInt(guestCount.nonVeg) + parseInt(guestCount.jain || 0)} guests
              </Typography>
            </Box> */}
          </Box>
        </Box>

        {/* Category Buttons */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            gap: 1, 
            // Mobile: horizontal scroll, Desktop/Tablet: flex wrap
            flexWrap: { xs: 'nowrap', sm: 'wrap' },
            overflowX: { xs: 'auto', sm: 'visible' },
            // Hide scrollbar on mobile
            '&::-webkit-scrollbar': {
              display: { xs: 'none', sm: 'auto' }
            },
            scrollbarWidth: { xs: 'none', sm: 'auto' },
            // Add padding for mobile scroll
            px: { xs: 0, sm: 0 },
            // Smooth scrolling
            scrollBehavior: 'smooth'
          }}>
            {getCategories().map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "contained" : "outlined"}
                onClick={() => setSelectedCategory(category)}
                size="small"
                sx={{
                  borderRadius: 20,
                  px: 2,
                  py: 0.5,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  bgcolor: selectedCategory === category ? '#1a237e' : 'white',
                  color: selectedCategory === category ? 'white' : '#1a237e',
                  border: '1px solid #1a237e',
                  // Mobile: prevent shrinking, Desktop/Tablet: allow normal behavior
                  flexShrink: { xs: 0, sm: 1 },
                  minWidth: { xs: 'auto', sm: 'auto' },
                  whiteSpace: 'nowrap'
                }}
              >
                {category}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Selected Items Section */}
        {cartItems.length > 0 && (
          <Box sx={{
            mb: 2,
            p: 2,
            bgcolor: '#f8f9fa',
            borderRadius: 2,
            border: 'none',
            outline: 'none',

          }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 600, mb: 1, color: '#54614cff' }}>
              Selected Item:
            </Typography>
            <Box sx={{
              display: 'flex',
              gap: 1,
              overflowX: 'auto',
              pb: 1,
              boxShadow: 'none',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}>
              {cartItems.map((item) => (
                <Box
                  key={item.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '20px',
                    px: 2,
                    py: 0.5,
                    gap: 1,
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {/* Veg/Non-Veg Indicator */}
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      border: '1px solid',
                      borderColor: item.isVeg ? '#4caf50' : '#f44336',
                      borderRadius: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white'
                    }}
                  >
                    <Box
                      sx={{
                        width: 4,
                        height: 4,
                        backgroundColor: item.isVeg ? '#4caf50' : '#f44336',
                        borderRadius: '50%'
                      }}
                    />
                  </Box>

                  <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                    {item.name}
                  </Typography>

                  {/* Remove Button */}
                  <IconButton
                    size="small"
                    onClick={() => removeFromCart(item.id)}
                    sx={{
                      p: 0.3,
                      ml: 0.5,
                      '&:hover': {
                        bgcolor: '#ffebee'
                      }
                    }}
                  >
                    <Close sx={{ fontSize: 14, color: '#666' }} />
                  </IconButton>
                </Box>
              ))}
            </Box>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <MenuLoadError
            onRetry={loadMenuData}
            menuType={selectedMenu}
          />
        )}

        {/* Enhanced Loading State */}
        {loading && !error && (
          <MenuGridSkeleton count={8} />
        )}

        {/* Empty State */}
        {!loading && !error && filteredAndSortedItems.length === 0 && (
          <EmptyState
            title="No items found"
            message="Try adjusting your search filters or select a different menu type."
          />
        )}

        {/* Veg Package Selection Banner */}
        {selectedMenu === 'veg' && !loading && !error && (
          <Box sx={{
            bgcolor: '#ff9800',
            color: 'white',
            py: 1.5,
            px: 2,
            borderRadius: 1,
            mb: 3,
            textAlign: 'center'
          }}>
            <Typography variant="body2" component="div" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
              Select any 3 Starters, 3 Main Course, 2 Breads, 1 Dessert, 1 Rice - ₹{vegMenuType === 'premium' ? '499' : '499'}/Person
            </Typography>
          </Box>
        )}

        {/* Menu Items List by Category */}
        {!loading && !error && filteredAndSortedItems.length > 0 && (
          <Box sx={{ width: '100%' }}>
            {Object.entries(itemsByCategory)
              .filter(([categoryName, items]) => {
                // If a specific category is selected, only show that category
                if (selectedCategory && selectedCategory !== 'All') {
                  const categoryMap = {
                    'Starters': 'STARTERS',
                    'Main Course': 'MAIN COURSE', 
                    'Breads': 'BREADS',
                    'Desserts': 'DESSERTS'
                  };
                  return categoryName === categoryMap[selectedCategory];
                }
                // If 'All' or no category selected, show all categories with items
                return items.length > 0;
              })
              .map(([categoryName, items]) =>
                items.length > 0 && (
                <Box key={categoryName} sx={{ mb: 4 }}>
                  {/* Category Header - Clickable with Collapse Icon */}
                  <Box
                    onClick={() => toggleSectionCollapse(categoryName)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      mb: 2,
                      '&:hover': {
                        opacity: 0.8
                      }
                    }}
                  >
                    <div>
                      <Typography
                        variant="h6"
                        component="div"
                        sx={{
                          fontWeight: 'bold',
                          color: '#1a237e',
                          fontSize: '1.1rem',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {categoryName} ({items.length})
                      </Typography>
                    </div>

                    {/* Collapse/Expand Icon */}
                    {collapsedSections[categoryName] ? (
                      <ExpandMore sx={{ color: '#1a237e', fontSize: 24 }} />
                    ) : (
                      <ExpandLess sx={{ color: '#1a237e', fontSize: 24 }} />
                    )}
                  </Box>

                  {/* Items List - Collapsible */}
                  {!collapsedSections[categoryName] && (
                    <>
                      {/* Grid Layout for Desktop/Tablet */}
                      <Box sx={{
                        display: { xs: 'none', md: 'grid' },
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: 3,
                        mt: 2
                      }}>
                        {items.map((item) => (
                          <Card
                            key={item.id}
                            sx={{
                              p: 2.5,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              border: '1px solid #e0e0e0',
                              borderRadius: 3,
                              height: 'fit-content',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                borderColor: '#1976d2'
                              }
                            }}
                            onClick={() => {
                              setSelectedItem(item);
                              setCustomizationModalOpen(true);
                            }}
                          >
                            {/* Item Image */}
                            <Box sx={{ position: 'relative', mb: 2 }}>
                              <CardMedia
                                component="img"
                                image={customizationMenuService.getItemImage(item.image, item.name)}
                                alt={item.name}
                                loading="lazy"
                                decoding="async"
                                sx={{
                                  width: '100%',
                                  height: 160,
                                  borderRadius: 2,
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                                }}
                              />

                              {/* Veg/Non-Veg Indicator */}
                              <Box sx={{
                                position: 'absolute',
                                top: 8,
                                left: 8,
                                bgcolor: 'white',
                                borderRadius: 1,
                                p: 0.5,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                              }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    border: '2px solid',
                                    borderColor: item.isVeg ? '#4caf50' : '#f44336',
                                    borderRadius: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      backgroundColor: item.isVeg ? '#4caf50' : '#f44336',
                                      borderRadius: '50%'
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* Rating Badge */}
                              <Box sx={{
                                position: 'absolute',
                                top: 8,
                                right: 8,
                                bgcolor: '#0011ffff',
                                color: 'white',
                                px: 1,
                                py: 0.3,
                                borderRadius: 1,
                                fontSize: '0.75rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.3
                              }}>
                                {item.rating || 4.2} ⭐
                              </Box>
                            </Box>

                            {/* Item Details */}
                            <Box>
                              <Typography
                                variant="h6"
                                sx={{
                                  fontWeight: 'bold',
                                  mb: 1,
                                  fontSize: '1.1rem',
                                  color: '#1a237e',
                                  lineHeight: 1.3
                                }}
                              >
                                {item.name}
                              </Typography>

                              <Typography
                                variant="body2"
                                component="div"
                                color="text.secondary"
                                sx={{
                                  mb: 0,
                                  fontSize: '0.875rem',
                                  lineHeight: 1.4
                                }}
                              >
                                {item.description || 'Delicious and authentic preparation with finest ingredients'}
                              </Typography>

                              {/* Serves and Quantity Info */}
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mt: 1, mb: 1 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    lineHeight: 1.0,
                                    mb: 0
                                  }}
                                >
                                  Serves: {item.serves || getServiceCountForItem(item)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontSize: '0.75rem',
                                    color: 'text.secondary',
                                    fontWeight: 500,
                                    lineHeight: 1.1,
                                    mt: 0.1
                                  }}
                                >
                                  Quantity: {item.portion_size || item.calculatedQuantity || '10pc'}
                                </Typography>
                                
                              </Box>

                              {/* Price & Add Section (desktop) */}
                              {selectedMenu === 'veg' ? (
                                // Veg: no price/add row here; Select button + customization text are rendered below
                                <></>
                              ) : (
                                // Jain / Customized / other menus: price + Add in one row, customization text below
                                <Box sx={{ mb: 2 }}>
                                  <Box
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      mb: 0.75
                                    }}
                                  >
                                    <Typography
                                      variant="h6"
                                      sx={{
                                        fontWeight: 'bold',
                                        color: '#1a237e',
                                        fontSize: '1.2rem'
                                      }}
                                    >
                                      ₹{item.calculatedPrice || item.price || item.basePrice || 87}
                                    </Typography>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(item);
                                      }}
                                      sx={{
                                        minWidth: 80,
                                        px: 2,
                                        py: 0.75,
                                        borderRadius: 1,
                                        fontSize: '0.85rem',
                                        fontWeight: 'bold',
                                        borderColor: '#1976d2',
                                        color: '#1976d2',
                                        bgcolor: 'white',
                                        textTransform: 'none',
                                        '&:hover': {
                                          bgcolor: '#f5f5f5',
                                          borderColor: '#1565c0',
                                          color: '#1565c0'
                                        }
                                      }}
                                    >
                                      Add
                                    </Button>
                                  </Box>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: '#4caf50',
                                      fontWeight: 'medium'
                                    }}
                                  >
                                    Customization available
                                  </Typography>
                                </Box>
                              )}

                              {/* Full Width Select Button – Veg only */}
                              {selectedMenu === 'veg' && (
                                <>
                                  <Button
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      // For Veg menu, detect package type and open package customization modal
                                      if (item.packageType) {
                                        console.log('🎯 Setting vegMenuType to:', item.packageType);
                                        setVegMenuType(item.packageType);
                                      }
                                      setSelectedItem(item);
                                      setVegPackageModalOpen(true);
                                    }}
                                    sx={{
                                      borderColor: '#1976d2',
                                      color: '#1976d2',
                                      bgcolor: 'white',
                                      borderRadius: 1,
                                      px: 2,
                                      py: 1,
                                      fontSize: '0.875rem',
                                      fontWeight: 'bold',
                                      border: '1px solid #1976d2',
                                      textTransform: 'none',
                                      '&:hover': {
                                        bgcolor: '#f5f5f5',
                                        borderColor: '#1565c0',
                                        color: '#1565c0'
                                      }
                                    }}
                                  >
                                    Select
                                  </Button>
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.8rem',
                                      color: '#4caf50',
                                      fontWeight: 'medium',
                                      mt: 1,
                                      display: 'block'
                                    }}
                                  >
                                    Customization available
                                  </Typography>
                                </>
                              )}
                            </Box>
                          </Card>
                        ))}
                      </Box>

                      {/* List Layout for Mobile */}
                      <Box sx={{
                        display: { xs: 'flex', md: 'none' },
                        flexDirection: 'column',
                        gap: 2
                      }}>
                        {items.map((item) => (
                          <Card
                            key={item.id}
                            sx={{
                              p: 1.5,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease-in-out',
                              border: '1px solid #e0e0e0',
                              borderRadius: 2,
                              position: 'relative',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                borderColor: '#1976d2'
                              }
                            }}
                            onClick={() => {
                              setSelectedItem(item);
                              setCustomizationModalOpen(true);
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                              {/* Veg/Non-Veg Indicator - Left Side Top */}
                              <Box sx={{
                                mt: 0.5,
                                flexShrink: 0
                              }}>
                                <Box
                                  sx={{
                                    width: 12,
                                    height: 12,
                                    border: '2px solid',
                                    borderColor: item.isVeg ? '#4caf50' : '#f44336',
                                    borderRadius: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: 'white'
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: 6,
                                      height: 6,
                                      backgroundColor: item.isVeg ? '#4caf50' : '#f44336',
                                      borderRadius: '50%'
                                    }}
                                  />
                                </Box>
                              </Box>

                              {/* Item Details */}
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    fontWeight: 'bold',
                                    mb: 0.3,
                                    fontSize: '0.9rem',
                                    color: '#1a237e',
                                    lineHeight: 1.2
                                  }}
                                >
                                  {item.name}
                                </Typography>

                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  sx={{
                                    mb: 0.5,
                                    fontSize: '0.75rem',
                                    lineHeight: 1.4
                                  }}
                                >
                                  {item.description || 'Delicious and authentic preparation'}
                                </Typography>

                                {/* Serves, Quantity and Rating Info - Vertical Layout */}
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.15, mb: 1, mt: 1 }}>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: '0.75rem',
                                      color: 'text.secondary',
                                      fontWeight: 500,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                    }}
                                  >
                                    Serves: {item.serves || getServiceCountForItem(item)}
                                    {/* Rating Badge inside Serves section */}
                                    <Box component="span" sx={{
                                      bgcolor: '#0051ffff',
                                      color: 'white',
                                      px: 0.5,
                                      py: 0.1,
                                      borderRadius: 0.5,
                                      fontSize: '0.7rem',
                                      fontWeight: 'bold',
                                      lineHeight: 1.2,
                                      alignSelf: 'center',
                                      mt: 0,
                                      display: 'inline-block'
                                    }}>
                                      {item.rating || 4.2} ⭐
                                    </Box>
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: '0.75rem',
                                      color: 'text.secondary',
                                      fontWeight: 500
                                    }}
                                  >
                                    Quantity: {item.portion_size || item.calculatedQuantity || '10pc'}
                                  </Typography>

                                </Box>

                                {/* Price Section for Mobile */}
                                {selectedMenu !== 'veg' && (
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      fontWeight: 'bold',
                                      color: '#1a237e',
                                      fontSize: '0.9rem',
                                      mb: 1
                                    }}
                                  >
                                    ₹{item.calculatedPrice || item.price || item.basePrice || 87}
                                  </Typography>
                                )}

                                {/* Full Width Select/Add Button for Mobile */}
                                <Button
                                  variant="outlined"
                                  fullWidth
                                  size="small"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (selectedMenu === 'veg') {
                                      // For Veg menu, detect package type and open package customization modal
                                      if (item.packageType) {
                                        console.log('🎯 Setting vegMenuType to:', item.packageType);
                                        setVegMenuType(item.packageType);
                                      }
                                      setSelectedItem(item);
                                      setVegPackageModalOpen(true);
                                    } else {
                                      handleAddToCart(item);
                                    }
                                  }}
                                  sx={{
                                    borderColor: '#1976d2',
                                    color: '#1976d2',
                                    bgcolor: 'white',
                                    borderRadius: 1,
                                    px: 2,
                                    py: 0.8,
                                    fontSize: '0.875rem',
                                    fontWeight: 'bold',
                                    border: '1px solid #1976d2',
                                    '&:hover': {
                                      bgcolor: '#f5f5f5',
                                      borderColor: '#1565c0',
                                      color: '#1565c0'
                                    }
                                  }}
                                >
                                  {selectedMenu === 'veg' ? 'Select' : 'Add'}
                                </Button>

                                {item.breakdown && (
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      fontSize: '0.7rem',
                                      color: 'text.secondary',
                                      bgcolor: '#f5f5f5',
                                      px: 0.8,
                                      py: 0.2,
                                      borderRadius: 0.5,
                                      mt: 0.5
                                    }}
                                  >
                                    V:{item.breakdown.veg} | NV:{item.breakdown.nonVeg}
                                  </Typography>
                                )}

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: '0.7rem', mt: 0.3, display: 'block' }}
                                >
                                  Customization available
                                </Typography>
                              </Box>

                              {/* Item Image */}
                              <Box sx={{ ml: 1.5, flexShrink: 0 }}>
                                <CardMedia
                                  component="img"
                                  image={customizationMenuService.getItemImage(item.image, item.name)}
                                  alt={item.name}
                                  loading="lazy"
                                  decoding="async"
                                  sx={{
                                    width: 150,
                                    height: 150,
                                    borderRadius: 1.5,
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80';
                                  }}
                                />
                              </Box>
                            </Box>
                          </Card>
                        ))}
                      </Box>
                    </>
                  )}
                </Box>
              )
            )}
          </Box>
        )}

        {/* Empty State */}
        {!loading && filteredAndSortedItems.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="text.secondary">
              No items found matching your criteria
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Try adjusting your filters or search terms
            </Typography>
          </Box>
        )}

        {/* Cart Summary */}
        <CartSummary onViewCart={onOpenCart || (() => setEnhancedCheckoutOpen(true))} />

        {/* Item Customization Modal */}
        <ItemCustomizationModal
          open={customizationModalOpen}
          onClose={() => {
            setCustomizationModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          menuType={selectedMenu}
          initialPackageType={vegMenuType}
          numberOfPax={parseInt(numberOfPax) || 20}
          preSelectedItem={selectedItem}
          onAddToCart={handleCustomizedItemAdd}
          guestCount={guestCount}
        />

        {/* Veg Package Customization Modal */}
        <VegPackageModal
          open={vegPackageModalOpen}
          onClose={() => {
            setVegPackageModalOpen(false);
            setSelectedItem(null); // Clear selected item when modal closes
          }}
          packageType={vegMenuType}
          menuItems={filteredAndSortedItems || []}
          onAddToCart={handleCustomizedItemAdd}
          onRemoveFromCart={removeFromCart}
          guestCount={guestCount.veg || 20}
          preSelectedItem={selectedItem}
        />

        <CheckoutConfirmation
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={(details) => {
            setConfirmationOpen(false);
            navigate('/bite-affair/payment');
          }}
        />

        <CheckoutConfirmation
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={(details) => {
            setConfirmationOpen(false);
            navigate('/bite-affair/payment');
          }}
        />

        <CheckoutConfirmation
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={(details) => {
            setConfirmationOpen(false);
            navigate('/bite-affair/payment');
          }}
        />

        <CheckoutConfirmation
          open={confirmationOpen}
          onClose={() => setConfirmationOpen(false)}
          onConfirm={(details) => {
            setConfirmationOpen(false);
            navigate('/bite-affair/payment');
          }}
        />

        <CartModal
          open={cartModalOpen}
          onClose={() => setCartModalOpen(false)}
          onCheckout={handleProceedToCheckout}
          bookingConfig={bookingConfig}
          guestCount={guestCount}
          onGuestCountChange={handleGuestCountChange}
          selectedMenu={selectedMenu}
          userEditRef={userEditRef}
          lastUserEditAt={lastUserEditAt}
        />

        <EnhancedCheckout
          open={enhancedCheckoutOpen}
          onClose={() => setEnhancedCheckoutOpen(false)}
          onConfirm={handleEnhancedCheckoutConfirm}
        />


      </Container>
    </Box>
  );
};

export default PartyPlatters;
