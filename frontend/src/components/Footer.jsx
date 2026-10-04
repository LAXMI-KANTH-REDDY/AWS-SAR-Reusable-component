import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box component="footer" sx={{ py: 4, borderTop: '1px solid rgba(148, 163, 184, 0.2)', mt: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="body2" color="text.secondary" textAlign="center">
          ScholarshipHub • Serverless Scholarship Portal
        </Typography>
      </Container>
    </Box>
  );
}
