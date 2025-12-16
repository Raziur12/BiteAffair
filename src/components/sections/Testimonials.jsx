import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  useTheme
} from '@mui/material';
import {
  FormatQuote
} from '@mui/icons-material';

// Hoisted static testimonials content
const TESTIMONIALS = [
    {
      name: 'Priya Sharma',
      role: 'Event Organizer',
      avatar: 'PS',
      rating: 5,
      review: 'Bite Affair made our corporate event absolutely memorable! The food quality was exceptional and the service was impeccable. Highly recommended for any catering needs.',
      event: 'Corporate Annual Meet'
    },
    {
      name: 'Rajesh Kumar',
      role: 'Birthday Party Host',
      avatar: 'RK',
      rating: 5,
      review: 'Amazing experience with Bite Affair! They catered my daughter\'s birthday party and everyone loved the food. The Jain menu options were perfect for our family.',
      event: 'Birthday Celebration'
    },
    {
      name: 'Anita Gupta',
      role: 'Wedding Planner',
      avatar: 'AG',
      rating: 5,
      review: 'Professional service and delicious food! Bite Affair has been our go-to catering partner for multiple weddings. They never disappoint and always deliver on time.',
      event: 'Wedding Reception'
    },
    {
      name: 'Vikram Singh',
      role: 'Office Manager',
      avatar: 'VS',
      rating: 4,
      review: 'Great variety in their menu and excellent packaging. The team lunch we ordered was fresh and tasty. Will definitely order again for our office events.',
      event: 'Office Team Lunch'
    },
    {
      name: 'Meera Jain',
      role: 'Festival Organizer',
      avatar: 'MJ',
      rating: 5,
      review: 'Bite Affair understood our Jain dietary requirements perfectly. The food was authentic, fresh, and served beautifully. Perfect for our religious gathering.',
      event: 'Festival Celebration'
    },
    {
      name: 'Arjun Malhotra',
      role: 'House Party Host',
      avatar: 'AM',
      rating: 5,
      review: 'Fantastic cocktail party catering! The presentation was elegant and the taste was outstanding. Our guests couldn\'t stop praising the food quality.',
      event: 'Cocktail Party'
    }
];

const Testimonials = () => {
  const theme = useTheme();

  return (
    <Box id="testimonials" sx={{ py: 8, bgcolor: 'background.paper' }}>
      <Container maxWidth="xl">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 'bold',
              color: 'text.primary',
              mb: 2,
              fontSize: '2rem'
            }}
          >
            What Our Customers Say
          </Typography>
          <Typography
            variant="h5"
            sx={{
              color: 'text.secondary',
              maxWidth: 600,
              mx: 'auto',
              lineHeight: 1.6
            }}
          >
            Don't just take our word for it - hear from our satisfied customers
          </Typography>
        </Box>

        {/* Testimonials Grid */}
        <Grid container spacing={4}>
          {TESTIMONIALS.map((testimonial, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  p: 3,
                  position: 'relative',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                {/* Quote Icon */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    opacity: 0.1
                  }}
                >
                  <FormatQuote sx={{ fontSize: 48, color: 'primary.main' }} />
                </Box>

                <CardContent sx={{ p: 0 }}>
                  {/* Rating */}
                  <Box sx={{ mb: 2 }}>
                    <Rating value={testimonial.rating} readOnly size="small" />
                  </Box>

                  {/* Review Text */}
                  <Typography
                    variant="body1"
                    sx={{
                      mb: 3,
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                      color: 'text.primary'
                    }}
                  >
                    "{testimonial.review}"
                  </Typography>

                  {/* Event Type */}
                  <Box
                    sx={{
                      display: 'inline-block',
                      bgcolor: 'primary.50',
                      color: 'primary.main',
                      px: 2,
                      py: 0.5,
                      borderRadius: 1,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      mb: 3
                    }}
                  >
                    {testimonial.event}
                  </Box>

                  {/* Customer Info */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 'bold'
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                        {testimonial.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
            Ready to Create Your Own Success Story?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Join hundreds of satisfied customers who trust Bite Affair for their catering needs
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Typography
              variant="h4"
              sx={{
                color: 'primary.main',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              📞 +91 92115 70030
            </Typography>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Testimonials;
