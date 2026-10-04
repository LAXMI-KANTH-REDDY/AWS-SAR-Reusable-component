import React from 'react';
import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <Box
      sx={{
        background: 'linear-gradient(135deg, rgba(29, 78, 216, 0.08), rgba(255,255,255,0.9))',
        borderBottom: '1px solid rgba(148, 163, 184, 0.18)',
        py: { xs: 6, md: 10 },
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={4}
          alignItems="center"
          justifyContent="space-between"
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Scholarship Opportunities
            </Typography>
            <Typography variant="h2" sx={{ mt: 2, mb: 2, fontWeight: 800 }}>
              Find Opportunities.
              <br />
              Build Your Future.
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 620 }}>
              Submit your scholarship application securely through our serverless platform.
            </Typography>
            <Button
              component={Link}
              to="/"
              variant="contained"
              size="large"
              sx={{ mt: 3, px: 4, py: 1.5 }}
            >
              Apply for Scholarship
            </Button>
          </Box>

          <Box
            sx={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                width: { xs: '100%', md: 420 },
                minHeight: 260,
                borderRadius: 5,
                background: 'linear-gradient(135deg, #122b76 0%, #1d4ed8 40%, #60a5fa 100%)',
                boxShadow: '0 30px 60px rgba(29, 78, 216, 0.35)',
                p: 4,
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="overline" sx={{ opacity: 0.8 }}>Powered by AWS</Typography>
              <Typography variant="h4" fontWeight={800} sx={{ mt: 1, mb: 2 }}>
                Serverless, secure, and accessible.
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                From application submission to confirmation email delivery through a reusable AWS notification component.
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Container>
    </Box>
  );
}
