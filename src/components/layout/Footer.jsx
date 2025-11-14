import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  Divider,
  IconButton
} from '@mui/material';
import {
  Restaurant,
  Phone,
  Email,
  LocationOn,
  WhatsApp,
  Facebook,
  Instagram,
  Twitter
} from '@mui/icons-material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'Menu', href: '#menu' },
    { label: 'About Us', href: '#about' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' }
  ];

  const services = [
    'Corporate Catering',
    'Wedding Functions',
    'Birthday Parties',
    'Festival Celebrations',
    'Office Lunch',
    'Cocktail Parties'
  ];

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'grey.900',
        color: 'white',
        pt: 6,
        pb: 3
      }}
    >
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 4 }, ml: { xs: 1, sm: 2 } }}>
        <Grid container spacing={4}>
          {/* Company Info */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{
                bgcolor: 'white',
                borderRadius: 1,
                p: 0.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <img 
                  src="/logo/502068640_17845720176490350_3307957330610653706_n.jpg" 
                  alt="Bite Affair Logo" 
                  style={{
                    height: '40px',
                    width: 'auto',
                    objectFit: 'contain',
                    objectPosition: 'center'
                  }}
                />
              </Box>
            </Box>
            
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.6, color: 'grey.300' }}>
              Premium catering services in Gurugram, specializing in delicious party platters 
              and event catering solutions. Making your celebrations memorable with authentic flavors.
            </Typography>

            {/* Social Media */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                sx={{ color: 'grey.400', '&:hover': { color: '#1877F2' } }}
                href="#"
              >
                <Facebook />
              </IconButton>
              <IconButton
                sx={{ color: 'grey.400', '&:hover': { color: '#E4405F' } }}
                href="#"
              >
                <Instagram />
              </IconButton>
              <IconButton
                sx={{ color: 'grey.400', '&:hover': { color: '#1DA1F2' } }}
                href="#"
              >
                <Twitter />
              </IconButton>
              <IconButton
                sx={{ color: 'grey.400', '&:hover': { color: '#25D366' } }}
                href="https://wa.me/919211570030"
                target="_blank"
              >
                <WhatsApp />
              </IconButton>
            </Box>
          </Grid>

          {/* Quick Links */}
          <Grid item xs={12} sm={6} md={2}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </Box>
          </Grid>

          {/* Services */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
              Our Services
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {services.map((service, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{ color: 'grey.300' }}
                >
                  {service}
                </Typography>
              ))}
            </Box>
          </Grid>

          {/* Contact Info */}
          <Grid item xs={12} md={3}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3, color: 'primary.main' }}>
              Contact Info
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Phone sx={{ color: 'primary.main', fontSize: 20 }} />
                <Link
                  href="tel:+919211570030"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  +91 92115 70030
                </Link>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Email sx={{ color: 'primary.main', fontSize: 20 }} />
                <Link
                  href="mailto:info@biteaffair.com"
                  sx={{
                    color: 'grey.300',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' }
                  }}
                >
                  info@biteaffair.com
                </Link>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <LocationOn sx={{ color: 'primary.main', fontSize: 20, mt: 0.5 }} />
                <Typography variant="body2" sx={{ color: 'grey.300' }}>
                  Serving across Gurugram,<br />
                  Haryana, India
                </Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: 'grey.700' }} />

        {/* Bottom Footer */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}
        >
          <Typography variant="body2" sx={{ color: 'grey.400' }}>
            © {currentYear} Bite Affair. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 3 }}>
            <Link
              href="#"
              sx={{
                color: 'grey.400',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              sx={{
                color: 'grey.400',
                textDecoration: 'none',
                fontSize: '0.875rem',
                '&:hover': { color: 'primary.main' }
              }}
            >
              Terms of Service
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
