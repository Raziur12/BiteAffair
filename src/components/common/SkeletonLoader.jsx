import React, { memo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Skeleton,
  Grid
} from '@mui/material';

// Menu Item Skeleton
export const MenuItemSkeleton = memo(() => (
  <Card sx={{ height: '100%', borderRadius: 2 }}>
    <Skeleton variant="rectangular" height={120} />
    <CardContent sx={{ p: 2 }}>
      <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 1 }} />
      <Skeleton variant="text" sx={{ fontSize: '0.75rem', mb: 2, width: '80%' }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton variant="text" sx={{ fontSize: '1rem', width: '30%' }} />
        <Skeleton variant="rectangular" width={60} height={32} sx={{ borderRadius: 1 }} />
      </Box>
    </CardContent>
  </Card>
));

// Menu Grid Skeleton
export const MenuGridSkeleton = memo(({ count = 8 }) => (
  <Grid container spacing={2}>
    {Array.from({ length: count }).map((_, index) => (
      <Grid item xs={6} sm={6} md={4} lg={3} key={index}>
        <MenuItemSkeleton />
      </Grid>
    ))}
  </Grid>
));

// Contact Form Skeleton
export const ContactFormSkeleton = memo(() => (
  <Box>
    <Skeleton variant="text" sx={{ fontSize: '2rem', mb: 3, width: '60%' }} />
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <Skeleton variant="rectangular" height={56} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={120} />
      </Grid>
      <Grid item xs={12}>
        <Skeleton variant="rectangular" height={48} sx={{ width: '30%' }} />
      </Grid>
    </Grid>
  </Box>
));

// Testimonial Card Skeleton
export const TestimonialSkeleton = memo(() => (
  <Card sx={{ height: '100%', p: 3 }}>
    <CardContent sx={{ p: 0 }}>
      <Skeleton variant="rectangular" width={80} height={20} sx={{ mb: 2 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 1 }} />
      <Skeleton variant="text" sx={{ mb: 3, width: '80%' }} />
      <Skeleton variant="rectangular" width={120} height={24} sx={{ mb: 3, borderRadius: 1 }} />
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Skeleton variant="circular" width={40} height={40} />
        <Box>
          <Skeleton variant="text" sx={{ width: 100 }} />
          <Skeleton variant="text" sx={{ width: 80 }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
));

// Enhanced Loading Spinner with Animation
export const EnhancedLoader = memo(({ message = "Loading..." }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 3
    }}
  >
    <Box
      sx={{
        width: 60,
        height: 60,
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #1976d2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        '@keyframes spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      }}
    />
    <Box sx={{ textAlign: 'center' }}>
      <Skeleton variant="text" sx={{ fontSize: '1.2rem', width: 150, mx: 'auto', mb: 1 }} />
      <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: 200, mx: 'auto' }} />
    </Box>
  </Box>
));

export default {
  MenuItemSkeleton,
  MenuGridSkeleton,
  ContactFormSkeleton,
  TestimonialSkeleton,
  EnhancedLoader
};
