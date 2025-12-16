import React, { useMemo, memo } from 'react';
import {
  Box,
  Button,
  Typography,
  Slide,
  Paper
} from '@mui/material';
import { useCart } from '../../context/CartContext';

// Hoisted static styles
const PAPER_SX = {
  position: 'fixed',
  bottom: { xs: 0, md: 20 },
  left: { xs: 0, md: '50%' },
  right: { xs: 0, md: 'auto' },
  transform: { xs: 'none', md: 'translateX(-50%)' },
  zIndex: 1000,
  bgcolor: '#1a237e',
  color: 'white',
  px: { xs: 2, md: 3 },
  py: { xs: 1.5, md: 1.5 },
  borderRadius: { xs: 0, md: 3 },
  minWidth: { xs: 'auto', md: 300 },
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexDirection: 'row',
  gap: { xs: 2, md: 3 }
};

const VIEW_BTN_SX = {
  bgcolor: 'white',
  color: '#1a237e',
  fontWeight: 600,
  px: { xs: 2, md: 3 },
  py: 1,
  whiteSpace: 'nowrap',
  '&:hover': {
    bgcolor: '#f5f5f5'
  }
};

const CartSummary = ({ onViewCart }) => {
  const { items } = useCart();

  // Count only unique menu items, not their quantities
  const menuItemsCount = useMemo(() => items.length, [items]);

  if (menuItemsCount === 0) return null;

  return (
    <Slide direction="up" in={menuItemsCount > 0} mountOnEnter unmountOnExit>
      <Paper sx={PAPER_SX}>
        <Typography variant="body2" sx={{ mb: { xs: 0, md: 0 }, fontWeight: 500, whiteSpace: 'nowrap' }}>
          {menuItemsCount} Item{menuItemsCount !== 1 ? 's' : ''} Added
        </Typography>
        <Button
          variant="contained"
          onClick={onViewCart}
          sx={VIEW_BTN_SX}
        >
          View Cart →
        </Button>
      </Paper>
    </Slide>
  );
};

export default memo(CartSummary);
