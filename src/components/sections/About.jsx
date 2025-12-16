import React, { memo } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme
} from '@mui/material';
import {
  Restaurant,
  LocalShipping,
  Groups,
  Star,
  CheckCircle,
  Schedule,
  LocationOn,
  Phone
} from '@mui/icons-material';

// Hoisted static content
const FEATURES = [
  {
    icon: <Restaurant sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Premium Quality Food',
    description: 'We use only the freshest ingredients and authentic recipes to create memorable dining experiences for your special occasions.'
  },
  {
    icon: <LocalShipping sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Reliable Delivery',
    description: 'Timely and safe delivery across Gurugram with proper packaging to maintain food quality and temperature.'
  },
  {
    icon: <Groups sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Expert Team',
    description: 'Our experienced chefs and catering professionals ensure every event is handled with utmost care and attention to detail.'
  },
  {
    icon: <Star sx={{ fontSize: 48, color: 'primary.main' }} />,
    title: 'Customer Satisfaction',
    description: 'With 4.8/5 customer rating, we pride ourselves on exceeding expectations and creating delightful food experiences.'
  }
];

const STATS = [
  { number: '500+', label: 'Happy Customers' },
  { number: '1000+', label: 'Events Catered' },
  { number: '4.8/5', label: 'Customer Rating' },
  { number: '3+', label: 'Years Experience' }
];

const SERVICES = [
  'Corporate Events & Meetings',
  'Birthday Parties & Celebrations',
  'Wedding Functions & Receptions',
  'Festival & Religious Gatherings',
  'House Parties & Get-togethers',
  'Office Lunch & Dinner Catering'
];

const About = () => {
  const theme = useTheme();

  return (
    <Box id="about" sx={{ py: 8, bgcolor: 'grey.50' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'normal',
              color: 'text.primary',
              mb: 2,
              fontSize: '2rem'
            }}
          >
            About Bite Affair
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 800,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Your trusted partner for premium catering services in Gurugram, 
            specializing in delicious party platters and event catering solutions.
          </Typography>
        </Box>

        {/* Stats */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {STATS.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 'normal',
                    color: 'primary.main',
                    mb: 1
                  }}
                >
                  {stat.number}
                </Typography>
                <Typography variant="h6" color="text.secondary">
                  {stat.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Features */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {FEATURES.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <CardContent sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'primary.50',
                      mx: 'auto',
                      mb: 3
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 'normal', mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Services & Contact Info */}
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%' }}>
              <Typography variant="h4" sx={{ fontWeight: 'normal', mb: 3, color: 'primary.main' }}>
                Our Services
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SERVICES.map((service, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="body1">{service}</Typography>
                  </Box>
                ))}
              </Box>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 4, height: '100%', bgcolor: 'primary.50' }}>
              <Typography variant="h4" sx={{ fontWeight: 'normal', mb: 3, color: 'primary.main' }}>
                Why Choose Us?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Schedule sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'normal' }}>
                      On-Time Delivery
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      We guarantee timely delivery for all your events
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOn sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'normal' }}>
                      Gurugram Coverage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Complete coverage across all areas of Gurugram
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Phone sx={{ color: 'primary.main', fontSize: 24 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 'normal' }}>
                      24/7 Support
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Always available to assist with your catering needs
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default About;
