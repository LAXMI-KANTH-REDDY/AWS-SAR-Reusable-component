import React from 'react';
import { Box, Card, CardContent, Chip, Grid, Typography } from '@mui/material';

const services = [
  'API Gateway',
  'AWS Lambda',
  'DynamoDB',
  'SNS',
  'AWS SAR',
  'SES',
];

export default function AwsArchitecture() {
  return (
    <Box sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={800} textAlign="center" sx={{ mb: 5 }}>
        Powered by AWS Serverless Architecture
      </Typography>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={2}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.08), rgba(96, 165, 250, 0.04))',
                    border: '1px solid rgba(148, 163, 184, 0.25)',
                    borderRadius: 3,
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <Chip
                    label={service}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 700, px: 1.5, py: 0.5 }}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
