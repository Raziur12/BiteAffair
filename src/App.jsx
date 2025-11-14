import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import { Navbar, Hero, Footer } from './components/layout';
import { PartyPlatters } from './components/menu';
import { About, Contact, Testimonials } from './components/sections';
import { MenuErrorBoundary, FormErrorBoundary } from './components/common';
import { CartProvider } from './context/CartContext';
import { MENU_TYPES } from './utils/constants';
import BookingFlow from './components/booking/BookingFlow';
import PaymentPage from './components/booking/PaymentPage';
import CartModal from './components/cart/CartModal';
import CheckoutConfirmation from './components/cart/CheckoutConfirmation';
import OrderStatus from './components/cart/OrderStatus';
import OrderFlowManager from './components/order/OrderFlowManager';

const HomePage = ({ bookingConfig, selectedLocation }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  // Scroll to section based on URL
  React.useEffect(() => {
    const scrollToSection = () => {
      const path = location.pathname;
      let sectionId = '';
      
      if (path.includes('/menu')) {
        sectionId = 'menu';
      } else if (path.includes('/about')) {
        sectionId = 'about';
      } else if (path.includes('/testimonials')) {
        sectionId = 'testimonials';
      } else if (path.includes('/contact')) {
        sectionId = 'contact';
      } else if (path.includes('/home')) {
        sectionId = 'home';
      }
      
      if (sectionId) {
        // Small delay to ensure the page has rendered
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
            // Calculate offset for mobile navbar height
            const isMobile = window.innerWidth < 960; // md breakpoint
            const offset = isMobile ? 92 : 48; // Mobile navbar is taller
            
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 200); // Increased delay for mobile
      }
    };

    scrollToSection();
  }, [location.pathname]);

  return (
    <>
      <Navbar selectedLocation={selectedLocation} />
      <Box component="main" sx={{ paddingTop: { xs: '92px', md: '48px' } }}>
        <Box id="home">
          <Hero />
        </Box>
        <MenuErrorBoundary>
          <PartyPlatters 
            id="menu" 
            bookingConfig={bookingConfig} 
            onOpenCart={() => setCartOpen(true)}
          />
        </MenuErrorBoundary>
        <Box id="about">
          <About />
        </Box>
        <Box id="testimonials">
          <Testimonials />
        </Box>
        <FormErrorBoundary>
          <Box id="contact">
            <Contact />
          </Box>
        </FormErrorBoundary>
      </Box>
      <Footer />
      
      {/* Order Flow Manager for Modal Flow */}
      <OrderFlowManager 
        cartOpen={cartOpen} 
        onCartClose={() => setCartOpen(false)}
        bookingConfig={bookingConfig}
      />
    </>
  );
};

const App = () => {
  // Initialize bookingConfig from localStorage if available
  const [bookingConfig, setBookingConfig] = useState(() => {
    const saved = localStorage.getItem('biteAffairs_bookingConfig');
    const config = saved ? JSON.parse(saved) : null;
    if (config) {
    }
    return config;
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(MENU_TYPES.JAIN);
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  // Sync bookingConfig changes with localStorage
  useEffect(() => {
    if (bookingConfig) {
      localStorage.setItem('biteAffairs_bookingConfig', JSON.stringify(bookingConfig));
    }
  }, [bookingConfig]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
  };

  const handleBookingComplete = (config) => {
    setBookingConfig(config);
    // Save to localStorage for persistence across page refreshes
    localStorage.setItem('biteAffairs_bookingConfig', JSON.stringify(config));
    navigate('/bite-affair/home');
  };

  const clearBookingConfig = () => {
    setBookingConfig(null);
    localStorage.removeItem('biteAffairs_bookingConfig');
  };

  // Create a minimal theme that doesn't override text styles
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1976d2',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontWeight: 'normal',
            textTransform: 'none',
            borderRadius: '20px',
            paddingX: '16px',
            paddingY: '6px'
          }
        }
      }
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <CartProvider>
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', width: '100%', overflowX: 'hidden' }}>
          <Routes>
            <Route path="/" element={<BookingFlow onComplete={handleBookingComplete} onLocationSelect={handleLocationSelect} />} />
            <Route path="/bite-affair/home" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
            <Route path="/bite-affair/menu" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
            <Route path="/bite-affair/about" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
            <Route path="/bite-affair/testimonials" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
            <Route path="/bite-affair/contact" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
            <Route path="/bite-affair/cart" element={<CartModal open={true} />} />
            <Route path="/bite-affair/checkout" element={<CheckoutConfirmation open={true} />} />
            <Route path="/bite-affair/order-status/:orderId" element={<OrderStatus />} />
            <Route path="/bite-affair/payment" element={<PaymentPage />} />
          </Routes>
        </Box>
      </CartProvider>
    </ThemeProvider>
  );
};

export default App;
