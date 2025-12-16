import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar, Footer } from './components/layout';
import { PartyPlatters } from './components/menu';
import { MenuErrorBoundary, FormErrorBoundary } from './components/common';
import { CartProvider } from './context/CartContext';
import { MENU_TYPES } from './utils/constants';
import BookingFlow from './components/booking/BookingFlow';
import OrderStatus from './components/cart/OrderStatus';

// Lazy-loaded sections and flows
const Contact = lazy(() => import('./components/sections/Contact'));
const OrderFlowManager = lazy(() => import('./components/order/OrderFlowManager'));
const PaymentPage = lazy(() => import('./components/booking/PaymentPage'));
const CheckoutConfirmation = lazy(() => import('./components/cart/CheckoutConfirmation'));
const CartModal = lazy(() => import('./components/cart/CartModal'));

const HomePage = ({ bookingConfig, selectedLocation }) => {
  const [cartOpen, setCartOpen] = useState(false);
  const location = useLocation();

  // Scroll to section based on URL
  useEffect(() => {
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
        <MenuErrorBoundary>
          <PartyPlatters 
            id="menu" 
            bookingConfig={bookingConfig} 
            onOpenCart={() => setCartOpen(true)}
          />
        </MenuErrorBoundary>
        <FormErrorBoundary>
          <Suspense fallback={null}>
            <Box id="contact">
              <Contact />
            </Box>
          </Suspense>
        </FormErrorBoundary>
      </Box>
      <Footer />
      
      {/* Order Flow Manager for Modal Flow */}
      <Suspense fallback={null}>
        <OrderFlowManager 
          cartOpen={cartOpen} 
          onCartClose={() => setCartOpen(false)}
          bookingConfig={bookingConfig}
        />
      </Suspense>
    </>
  );
};

const App = () => {
  // Initialize bookingConfig from localStorage if available
  const [bookingConfig, setBookingConfig] = useState(() => {
    const saved = localStorage.getItem('biteAffairs_bookingConfig');
    const config = saved ? JSON.parse(saved) : null;
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

  return (
    <CartProvider>
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', width: '100%', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/" element={<BookingFlow onComplete={handleBookingComplete} onLocationSelect={handleLocationSelect} />} />
          <Route path="/bite-affair/home" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
          <Route path="/bite-affair/menu" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
          <Route path="/bite-affair/about" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
          <Route path="/bite-affair/testimonials" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
          <Route path="/bite-affair/contact" element={<HomePage bookingConfig={bookingConfig} selectedLocation={selectedLocation} />} />
          <Route path="/bite-affair/cart" element={<Suspense fallback={null}><CartModal open={true} /></Suspense>} />
          <Route path="/bite-affair/checkout" element={<Suspense fallback={null}><CheckoutConfirmation open={true} /></Suspense>} />
          <Route path="/bite-affair/order-status/:orderId" element={<OrderStatus />} />
          <Route path="/bite-affair/payment" element={<Suspense fallback={null}><PaymentPage /></Suspense>} />
        </Routes>
      </Box>
    </CartProvider>
  );
};

export default App;
