// Application constants
export const DIETARY_FILTERS = {
  ALL: 'all',
  JAIN: 'jain',
  VEG: 'veg',
  NON_VEG: 'non-veg'
};

export const MENU_TYPES = {
  JAIN: 'jain',
  PACKAGES: 'packages',
  CUSTOMIZED: 'customized',
  COCKTAIL: 'cocktail'
};

export const CONTACT_INFO = {
  PHONE: '+91 92115 70030',
  EMAIL: 'info@biteaffair.com',
  WHATSAPP: 'https://wa.me/919211570030',
  LOCATION: 'Gurugram, Haryana'
};

export const LOCATIONS = [
  {
    id: 'delhi',
    name: 'Delhi',
    icon: '🏛️',
    available: true,
    deliveryTime: '45-60 mins'
  },
  {
    id: 'gurugram',
    name: 'Gurugram',
    icon: '🏢',
    available: true,
    deliveryTime: '30-45 mins'
  },
  {
    id: 'noida',
    name: 'Noida',
    icon: '⚙️',
    available: true,
    deliveryTime: '50-65 mins'
  },
  {
    id: 'faridabad',
    name: 'Faridabad',
    icon: '🏭',
    available: true,
    deliveryTime: '40-55 mins'
  },
  {
    id: 'ghaziabad',
    name: 'Ghaziabad',
    icon: '⚙️',
    available: true,
    deliveryTime: '55-70 mins'
  }
];

export const BUSINESS_HOURS = [
  { day: 'Monday - Friday', hours: '9:00 AM - 10:00 PM' },
  { day: 'Saturday - Sunday', hours: '8:00 AM - 11:00 PM' },
  { day: 'Holidays', hours: '8:00 AM - 11:00 PM' }
];

export const COMPANY_INFO = {
  NAME: 'Bite Affair',
  TAGLINE: 'Premium Catering Services in Gurugram',
  DESCRIPTION: 'Delicious party platters and catering solutions for your special events'
};
