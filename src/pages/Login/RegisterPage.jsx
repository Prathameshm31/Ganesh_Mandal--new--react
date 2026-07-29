import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField, Button, Typography, Box, CircularProgress,
  InputAdornment, IconButton, Stepper, Step, StepLabel,
} from '@mui/material';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { toast } from 'react-toastify';
import apiClient, { extractErrorMessage } from '../../api/apiClient';

const steps = ['Personal Information', 'Account Information'];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    profilePhoto: '',
    password: '',
    confirmPassword: '',
  });

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFieldErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateStep1 = () => {
    const errors = {};
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    if (!formData.mobile.trim()) errors.mobile = 'Mobile number is required';
    else if (!/^[0-9]{10}$/.test(formData.mobile)) errors.mobile = 'Mobile must be 10 digits';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    else if (!/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!]).*$/.test(formData.password))
      errors.password = 'Must contain digit, uppercase, lowercase & special character';
    if (!formData.confirmPassword) errors.confirmPassword = 'Confirm password is required';
    else if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0 && validateStep1()) setActiveStep(1);
    else if (activeStep === 1 && validateStep2()) handleSubmit();
  };

  const handleBack = () => setActiveStep(0);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await apiClient.post('/auth/register', formData);
      toast.success('Registration successful! Please login to continue.');
      navigate('/login');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        {activeStep === 0 && (
          <>
            <TextField label="Full Name" value={formData.fullName}
              onChange={e => updateField('fullName', e.target.value)}
              fullWidth autoFocus disabled={loading}
              error={!!fieldErrors.fullName} helperText={fieldErrors.fullName} />

            <TextField label="Email Address" type="email" value={formData.email}
              onChange={e => updateField('email', e.target.value)}
              fullWidth disabled={loading}
              error={!!fieldErrors.email} helperText={fieldErrors.email} />

            <TextField label="Mobile Number" value={formData.mobile}
              onChange={e => updateField('mobile', e.target.value.replace(/\D/g, '').slice(0, 10))}
              fullWidth disabled={loading} placeholder="10-digit mobile number"
              error={!!fieldErrors.mobile} helperText={fieldErrors.mobile} />

            <TextField label="Address" value={formData.address}
              onChange={e => updateField('address', e.target.value)}
              fullWidth disabled={loading} multiline rows={2} />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="City" value={formData.city}
                onChange={e => updateField('city', e.target.value)}
                fullWidth disabled={loading} />
              <TextField label="State" value={formData.state}
                onChange={e => updateField('state', e.target.value)}
                fullWidth disabled={loading} />
            </Box>

            <TextField label="Pincode" value={formData.pincode}
              onChange={e => updateField('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
              fullWidth disabled={loading} />
          </>
        )}

        {activeStep === 1 && (
          <>
            <TextField label="Password" type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={e => updateField('password', e.target.value)}
              fullWidth disabled={loading}
              error={!!fieldErrors.password} helperText={fieldErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                      {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }} />

            <TextField label="Confirm Password" type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={e => updateField('confirmPassword', e.target.value)}
              fullWidth disabled={loading}
              error={!!fieldErrors.confirmPassword} helperText={fieldErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                      {showConfirmPassword ? <MdVisibilityOff /> : <MdVisibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }} />
          </>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Button disabled={activeStep === 0} onClick={handleBack}>
            Back
          </Button>
          <Button variant="contained" onClick={handleNext} disabled={loading}>
            {loading ? <CircularProgress size={24} color="inherit" /> :
              activeStep === 1 ? 'Register' : 'Next'}
          </Button>
        </Box>

        <Typography variant="body2" textAlign="center" sx={{ mt: 1 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'inherit' }}>
            Login
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
