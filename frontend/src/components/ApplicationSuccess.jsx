import React, { useState } from 'react';
import { Alert, Box, Button, Card, CardContent, Chip, IconButton, Snackbar, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

export default function ApplicationSuccess({ applicationId, email, onTrackApplication, onSubmitAnother }) {
  const [copyStatus, setCopyStatus] = useState(null);
  const safeApplicationId = typeof applicationId === 'string' ? applicationId.trim() : '';

  const handleCopy = async () => {
    if (!safeApplicationId) {
      setCopyStatus('error');
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(safeApplicationId);
        setCopyStatus('success');
        return;
      }

      const textArea = document.createElement('textarea');
      textArea.value = safeApplicationId;
      textArea.setAttribute('readonly', '');
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '-9999px';
      textArea.style.opacity = '0';
      textArea.style.width = '1px';
      textArea.style.height = '1px';

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      if (!successful) {
        throw new Error('Fallback copy failed');
      }

      setCopyStatus('success');
    } catch (error) {
      console.error('Copy application ID failed:', error);
      setCopyStatus('error');
    }
  };

  return (
    <Card
      sx={{
        p: 1,
        width: '100%',
        maxWidth: '100%',
        overflow: 'hidden',
        borderRadius: 4,
        mx: 'auto',
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, width: '100%', maxWidth: '100%' }}>
        <Stack spacing={3} sx={{ width: '100%', maxWidth: '100%' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              flexWrap: 'wrap',
              width: '100%',
              maxWidth: '100%',
            }}
          >
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 40, flexShrink: 0 }} />
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '1.8rem', sm: '2.2rem', md: '2.5rem' },
                lineHeight: 1.2,
                wordBreak: 'break-word',
                overflowWrap: 'anywhere',
                width: '100%',
                maxWidth: '100%',
              }}
            >
              Application Submitted Successfully
            </Typography>
          </Box>

          <Alert severity="success" sx={{ borderRadius: 3, width: '100%' }}>
            Your scholarship application has been submitted.
          </Alert>

          <Stack spacing={1} sx={{ width: '100%', maxWidth: '100%' }}>
            <Typography variant="overline" color="text.secondary">Application ID</Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                flexWrap: 'wrap',
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1,
                  width: '100%',
                  maxWidth: { xs: '100%', sm: 420 },
                  minWidth: 0,
                  backgroundColor: '#ffffff',
                  border: '1px solid rgba(148, 163, 184, 0.5)',
                  borderRadius: 2,
                  px: { xs: 1.5, sm: 2 },
                  py: { xs: 1, sm: 1.25 },
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                }}
              >
                <Typography
                  sx={{
                    color: '#0f172a',
                    fontWeight: 700,
                    fontSize: { xs: '0.95rem', sm: '1.05rem' },
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    wordBreak: 'break-word',
                    lineHeight: 1.4,
                    flex: 1,
                    minWidth: 0,
                    display: 'block',
                    textShadow: 'none',
                    opacity: 1,
                  }}
                >
                  {safeApplicationId || 'Application ID unavailable'}
                </Typography>
                <IconButton
                  aria-label="Copy application ID"
                  onClick={handleCopy}
                  color="primary"
                  sx={{
                    flexShrink: 0,
                    color: '#0f172a',
                    backgroundColor: '#f8fafc',
                    border: '1px solid rgba(148, 163, 184, 0.5)',
                    '&:hover': { backgroundColor: '#e2e8f0' },
                  }}
                >
                  <ContentCopyIcon />
                </IconButton>
              </Box>
            </Box>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: '100%', maxWidth: '100%' }}>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="overline" color="text.secondary">Status</Typography>
              <Typography variant="h6" fontWeight={700} sx={{ overflowWrap: 'anywhere' }}>SUBMITTED</Typography>
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="overline" color="text.secondary">Confirmation Email</Typography>
              <Typography variant="body1" sx={{ overflowWrap: 'anywhere' }}>{email}</Typography>
            </Box>
          </Stack>

          <Typography color="text.secondary" sx={{ width: '100%', maxWidth: '100%', overflowWrap: 'anywhere' }}>
            A confirmation email has been sent to your registered email address.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            sx={{
              width: '100%',
              maxWidth: '100%',
              '& .MuiButton-root': {
                width: { xs: '100%', sm: 'auto' },
              },
            }}
          >
            <Button variant="contained" onClick={onTrackApplication}>Track Application</Button>
            <Button variant="outlined" onClick={onSubmitAnother}>Submit Another Application</Button>
          </Stack>
        </Stack>
      </CardContent>

      <Snackbar
        open={Boolean(copyStatus)}
        autoHideDuration={2500}
        onClose={() => setCopyStatus(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setCopyStatus(null)}
          severity={copyStatus === 'success' ? 'success' : 'error'}
          sx={{ width: '100%' }}
        >
          {copyStatus === 'success'
            ? 'Application ID copied to clipboard'
            : 'Unable to copy Application ID. Please copy it manually.'}
        </Alert>
      </Snackbar>
    </Card>
  );
}
