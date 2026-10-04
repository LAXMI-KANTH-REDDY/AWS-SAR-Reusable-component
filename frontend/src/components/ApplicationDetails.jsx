import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

const steps = [
  { label: 'Application Submitted', active: true },
  { label: 'Under Review', active: false },
  { label: 'Decision', active: false },
];

export default function ApplicationDetails({ application }) {
  return (
    <Card sx={{ p: 1 }}>
      <CardContent sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" gap={2} flexWrap="wrap">
            <Typography variant="h4" fontWeight={800}>Application Details</Typography>
            <Chip label={application.status} color="primary" sx={{ fontWeight: 700 }} />
          </Box>

          <Grid container spacing={2}>
            {[
              ['Application ID', application.applicationId],
              ['Student Name', application.name],
              ['Email', application.email],
              ['Phone', application.phone],
              ['Course', application.course],
              ['College', application.college],
              ['Scholarship', application.scholarship],
              ['Submitted Date', application.submittedAt],
            ].map(([label, value]) => (
              <Grid item xs={12} md={6} key={label}>
                <Box sx={{ background: 'rgba(148, 163, 184, 0.05)', borderRadius: 2, p: 2 }}>
                  <Typography variant="overline" color="text.secondary">{label}</Typography>
                  <Typography variant="body1" fontWeight={600}>{value}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <Divider />

          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Application Timeline</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {steps.map((step) => (
                <Box
                  key={step.label}
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 2,
                    background: step.active ? 'linear-gradient(135deg, #dbeafe, #eff6ff)' : 'rgba(148, 163, 184, 0.06)',
                    border: step.active ? '1px solid rgba(29, 78, 216, 0.2)' : '1px solid rgba(148, 163, 184, 0.15)',
                    textAlign: 'center',
                  }}
                >
                  <Typography fontWeight={700}>{step.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {step.active ? 'Completed' : 'Pending'}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
