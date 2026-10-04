import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { submitApplication } from '../services/api';

const scholarshipOptions = [
  'Merit Scholarship',
  'Need-Based Scholarship',
  'Academic Excellence Scholarship',
  'Sports Scholarship',
  'Women in STEM Scholarship',
];

const initialForm = {
  name: '',
  email: '',
  phone: '',
  course: '',
  college: '',
  scholarship: '',
};

const validate = (values) => {
  const errors = {};

  if (!values.name || values.name.trim().length < 2) {
    errors.name = 'Please enter your full name.';
  }

  if (!values.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.phone || !/^\d{10}$/.test(values.phone)) {
    errors.phone = 'Phone number must be exactly 10 digits.';
  }

  if (!values.course.trim()) {
    errors.course = 'Course is required.';
  }

  if (!values.college.trim()) {
    errors.college = 'College is required.';
  }

  if (!values.scholarship) {
    errors.scholarship = 'Please select a scholarship.';
  }

  return errors;
};

export default function ApplicationForm({ onSuccess, onError }) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      const result = await submitApplication(form);
      onSuccess({ ...result, email: form.email });
      setForm(initialForm);
      setErrors({});
    } catch (error) {
      const message = error.message || 'Unable to submit your application.';
      setSubmitError(message);
      onError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} noValidate>
      <Stack spacing={3}>
        {submitError && (
          <Alert severity="error">{submitError}</Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              error={Boolean(errors.name)}
              helperText={errors.name || ' '}
              autoComplete="name"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={Boolean(errors.email)}
              helperText={errors.email || ' '}
              autoComplete="email"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              error={Boolean(errors.phone)}
              helperText={errors.phone || ' '}
              inputProps={{ maxLength: 10 }}
              autoComplete="tel"
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Course"
              name="course"
              value={form.course}
              onChange={handleChange}
              error={Boolean(errors.course)}
              helperText={errors.course || ' '}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="College"
              name="college"
              value={form.college}
              onChange={handleChange}
              error={Boolean(errors.college)}
              helperText={errors.college || ' '}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth error={Boolean(errors.scholarship)}>
              <InputLabel id="scholarship-label">Scholarship</InputLabel>
              <Select
                labelId="scholarship-label"
                label="Scholarship"
                name="scholarship"
                value={form.scholarship}
                onChange={handleChange}
              >
                {scholarshipOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="error" sx={{ mt: 0.75, ml: 1.75 }}>
                {errors.scholarship || ' '}
              </Typography>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
          sx={{ minWidth: 220, py: 1.4 }}
        >
          {isSubmitting ? (
            <>
              <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
              Submitting Application...
            </>
          ) : (
            'Submit Application'
          )}
        </Button>
      </Stack>
    </Box>
  );
}
