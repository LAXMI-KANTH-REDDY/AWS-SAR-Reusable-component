import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { getApplication } from '../services/api';
import ApplicationDetails from './ApplicationDetails';

const DEFAULT_MESSAGE = 'No application was found with this Application ID.';

export default function TrackApplication() {
  const [applicationId, setApplicationId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    const trimmedId = applicationId.trim();
    setError('');
    setResult(null);

    if (!trimmedId) {
      setError('Please enter an application ID.');
      return;
    }

    try {
      setLoading(true);
      const data = await getApplication(trimmedId);
      setResult(data);
    } catch (err) {
      const message = err.message === 'Application not found' || err.message === 'Not Found'
        ? DEFAULT_MESSAGE
        : 'Unable to connect to the scholarship service. Please check your internet connection and try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ maxWidth: 620, mx: 'auto', width: '100%' }}>
        <Stack spacing={2}>
          <Typography variant="h3" fontWeight={800}>Track Your Application</Typography>
          <Typography color="text.secondary">
            Enter your application ID to view your scholarship application status.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              fullWidth
              label="Application ID"
              value={applicationId}
              onChange={(event) => setApplicationId(event.target.value)}
              placeholder="SCH-698C3C19"
              helperText=" "
            />
            <Button
              variant="contained"
              size="large"
              onClick={handleTrack}
              disabled={loading}
              sx={{ minWidth: 180 }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Track Application'}
            </Button>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>
          )}
        </Stack>
      </Box>

      {result && <ApplicationDetails application={result} />}
    </Stack>
  );
}
