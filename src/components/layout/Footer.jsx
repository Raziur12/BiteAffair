import React, { memo } from 'react';
import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: 'black',
        color: 'white',
        py: 3
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 0.5
        }}
      >
        <Typography variant="body2">BiteAffair Private Limited</Typography>
        <Typography variant="body2">
          Delhi, Gurugram, Noida, Faridabad, and Ghaziabad
        </Typography>
        <Typography variant="body2">
          &copy;{new Date().getFullYear()} BiteAffair. All Rights Reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default memo(Footer);
