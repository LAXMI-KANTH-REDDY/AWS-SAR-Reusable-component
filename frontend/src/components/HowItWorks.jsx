import React from 'react';
import { Box, Card, CardContent, Grid, Stack, Typography } from '@mui/material';

const steps = [
  { title: 'Submit Application', description: 'Fill in your scholarship details and send it securely to our serverless backend.' },
  { title: 'Application Stored Securely', description: 'Your data is saved in DynamoDB and linked to a unique application reference.' },
  { title: 'Confirmation Email', description: 'The notification component publishes the event and SES sends a confirmation email.' },
  { title: 'Track Application', description: 'Use your application ID anytime to check your current scholarship status.' },
];

export default function HowItWorks() {
  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h4" textAlign="center" fontWeight={800} sx={{ mb: 5 }}>
        How It Works
      </Typography>
      <Grid container spacing={3}>
        {steps.map((step, index) => (
          <Grid item xs={12} md={6} lg={3} key={step.title}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #1d4ed8, #60a5fa)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                    }}
                  >
                    {index + 1}
                  </Box>
                  <Typography variant="h6" fontWeight={700}>{step.title}</Typography>
                  <Typography color="text.secondary">{step.description}</Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
