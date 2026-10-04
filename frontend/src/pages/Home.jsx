import React, { useState } from 'react';
import { Box, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApplicationForm from '../components/ApplicationForm';
import ApplicationSuccess from '../components/ApplicationSuccess';
import AwsArchitecture from '../components/AwsArchitecture';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';

export default function Home() {
  const navigate = useNavigate();
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSuccess = (response) => {
    const applicationId = response?.applicationId || '';

    setSubmittedApplication({
      applicationId,
      email: response?.email || '',
      status: response?.status || 'SUBMITTED',
    });
    setErrorMessage('');
  };

  const handleError = (message) => {
    setErrorMessage(message);
  };

  const resetState = () => {
    setSubmittedApplication(null);
    setErrorMessage('');
  };

  return (
    <>
      <Hero />

      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Stack spacing={4}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 2 }}>
              Scholarship Application
            </Typography>
            {submittedApplication ? (
              <ApplicationSuccess
                applicationId={submittedApplication.applicationId}
                email={submittedApplication.email}
                onTrackApplication={() => navigate('/track')}
                onSubmitAnother={resetState}
              />
            ) : (
              <ApplicationForm onSuccess={handleSuccess} onError={handleError} />
            )}
            {errorMessage && (
              <Typography color="error.main" sx={{ mt: 2 }}>
                {errorMessage}
              </Typography>
            )}
          </Box>

          <HowItWorks />
          <AwsArchitecture />
        </Stack>
      </Container>
    </>
  );
}
