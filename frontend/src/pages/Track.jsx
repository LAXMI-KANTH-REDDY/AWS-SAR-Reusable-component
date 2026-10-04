import React from 'react';
import { Container } from '@mui/material';
import TrackApplication from '../components/TrackApplication';

export default function Track() {
  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <TrackApplication />
    </Container>
  );
}
