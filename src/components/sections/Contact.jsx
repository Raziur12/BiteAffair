import React, { useState, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Divider,
  useTheme
} from '@mui/material';
import {
  Phone,
  Email,
  LocationOn,
  WhatsApp,
  Schedule,
  Send
} from '@mui/icons-material';

// Hoisted static content
const CONTACT_INFO = [
  {
    icon: <Phone sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Call Us',
    details: '+91 92115 70030',
    action: 'tel:+919211570030',
    description: 'Available 24/7 for your catering needs'
  },
  {
    icon: <WhatsApp sx={{ fontSize: 32, color: '#25D366' }} />,
    title: 'WhatsApp',
    details: '+91 92115 70030',
    action: 'https://wa.me/919211570030',
    description: 'Quick responses and instant quotes'
  },
  {
    icon: <Email sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Email',
    details: 'info@biteaffair.com',
    action: 'mailto:info@biteaffair.com',
    description: 'Send us your detailed requirements'
  },
  {
    icon: <LocationOn sx={{ fontSize: 32, color: 'primary.main' }} />,
    title: 'Service Area',
    details: 'Gurugram, Haryana',
    action: null,
    description: 'Complete coverage across Gurugram'
  }
];

const BUSINESS_HOURS = [
  { day: 'Monday - Friday', hours: '9:00 AM - 10:00 PM' },
  { day: 'Saturday - Sunday', hours: '8:00 AM - 11:00 PM' },
  { day: 'Holidays', hours: '8:00 AM - 11:00 PM' }
];

const Contact = () => {
  const theme = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    // In a real app, this would send data to a backend
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    setFormData({
      name: '',
      phone: '',
      email: '',
      eventType: '',
      eventDate: '',
      guestCount: '',
      message: ''
    });
  }, []);

  const contactInfo = CONTACT_INFO;
  const businessHours = BUSINESS_HOURS;

  return (
    <Box id="contact" sx={{ py: 8, bgcolor: 'grey.50' }}>
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
            Get In Touch
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
            Ready to make your event memorable? Contact us for a personalized quote
          </Typography>
        </Box>

        <Grid container spacing={6}>
          {/* Contact Form */}
          <Grid item xs={12} lg={7}>
            <Card sx={{ p: 4 }}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
                Request a Quote
              </Typography>
              
              {showSuccess && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you for your inquiry! We'll get back to you within 24 hours.
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      aria-label="Enter your full name"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      aria-label="Enter your phone number"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email Address"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      aria-label="Enter your email address"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Event Type"
                      name="eventType"
                      value={formData.eventType}
                      onChange={handleInputChange}
                      placeholder="Birthday, Wedding, Corporate, etc."
                      required
                      aria-label="Enter your event type"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Event Date"
                      name="eventDate"
                      type="date"
                      value={formData.eventDate}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      required
                      aria-label="Select your event date"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Guest Count"
                      name="guestCount"
                      type="number"
                      value={formData.guestCount}
                      onChange={handleInputChange}
                      placeholder="Approximate number of guests"
                      required
                      aria-label="Enter approximate number of guests"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Additional Requirements"
                      name="message"
                      multiline
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your dietary preferences, special requirements, or any other details..."
                      aria-label="Enter additional requirements or special requests"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      startIcon={<Send />}
                      sx={{ px: 4, py: 2 }}
                      aria-label="Submit inquiry form"
                    >
                      Send Inquiry
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} lg={5}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {/* Contact Cards */}
              {contactInfo.map((info, index) => (
                <Card
                  key={index}
                  sx={{
                    p: 3,
                    transition: 'all 0.3s ease',
                    cursor: info.action ? 'pointer' : 'default',
                    '&:hover': info.action ? {
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[8]
                    } : {}
                  }}
                  onClick={() => info.action && window.open(info.action, '_blank')}
                >
                  <CardContent sx={{ p: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      {info.icon}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {info.title}
                        </Typography>
                        <Typography variant="h6" color="primary" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {info.details}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}

              {/* Business Hours */}
              <Card sx={{ p: 3 }}>
                <CardContent sx={{ p: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Schedule sx={{ fontSize: 32, color: 'primary.main' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Business Hours
                    </Typography>
                  </Box>
                  
                  {businessHours.map((schedule, index) => (
                    <Box key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {schedule.day}
                        </Typography>
                        <Typography variant="body1" color="primary" sx={{ fontWeight: 'bold' }}>
                          {schedule.hours}
                        </Typography>
                      </Box>
                      {index < businessHours.length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>

              {/* Quick Contact */}
              <Card sx={{ p: 3, bgcolor: 'primary.50' }}>
                <CardContent sx={{ p: 0, textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: 'primary.main' }}>
                    Need Immediate Assistance?
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Call us now for instant quotes and same-day bookings
                  </Typography>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<Phone />}
                    href="tel:+919211570030"
                    fullWidth
                    sx={{ mb: 2 }}
                    aria-label="Call us at +91 92115 70030"
                  >
                    Call +91 92115 70030
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<WhatsApp />}
                    href="https://wa.me/919211570030"
                    target="_blank"
                    fullWidth
                    sx={{
                      borderColor: '#25D366',
                      color: '#25D366',
                      '&:hover': {
                        borderColor: '#25D366',
                        bgcolor: 'rgba(37, 211, 102, 0.1)'
                      }
                    }}
                    aria-label="Contact us via WhatsApp"
                  >
                    WhatsApp Us
                  </Button>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default Contact;
