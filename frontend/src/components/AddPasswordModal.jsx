import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  InputAdornment,
  IconButton,
  Box,
  LinearProgress,
  Typography,
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle, Cancel } from '@mui/icons-material';

function AddPasswordModal({ open, onClose, onAddPassword }) {
  const [formData, setFormData] = useState({
    site_url: '',
    username: '',
    password: '',
    showPassword: false
  });
  const [error, setError] = useState('');

  const handleChange = (prop) => (event) => {
    let value = event.target.value;
    if (prop === 'site_url') {
      // Remove protocol and www if present
      value = value.replace(/^(https?:\/\/)?(www\.)?/, '');
    }
    setFormData({ ...formData, [prop]: value });
    setError('');
  };

  const togglePasswordVisibility = () => {
    setFormData({ ...formData, showPassword: !formData.showPassword });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.site_url || !formData.username || !formData.password) {
      setError('All fields are required');
      return;
    }

    // Further URL validation if needed
    const urlRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!urlRegex.test(formData.site_url)) {
      setError('Please enter a valid domain (e.g., github.com)');
      return;
    }

    onAddPassword({
      site_url: formData.site_url,
      username: formData.username,
      password: formData.password
    });

    setFormData({
      site_url: '',
      username: '',
      password: '',
      showPassword: false
    });
  };

  const validatePassword = (password) => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*]/.test(password),
    };
    return checks;
  };

  const getPasswordStrength = (password) => {
    const checks = validatePassword(password);
    const strength = Object.values(checks).filter(Boolean).length;
    return (strength / 5) * 100;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Password</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <TextField
            margin="dense"
            label="Website URL"
            type="url"
            fullWidth
            required
            value={formData.site_url}
            onChange={handleChange('site_url')}
          />
          
          <TextField
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            required
            value={formData.username}
            onChange={handleChange('username')}
          />
          
          <Box sx={{ mb: 2 }}>
            <TextField
              margin="dense"
              label="Password"
              type={formData.showPassword ? 'text' : 'password'}
              fullWidth
              required
              value={formData.password}
              onChange={handleChange('password')}
              error={!!error && error.includes('password')}
            />
            <LinearProgress 
              variant="determinate" 
              value={getPasswordStrength(formData.password)}
              sx={{ mt: 1, mb: 1 }}
            />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {Object.entries(validatePassword(formData.password)).map(([check, passes]) => (
                <Box key={check} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {passes ? (
                    <CheckCircle color="success" fontSize="small" />
                  ) : (
                    <Cancel color="error" fontSize="small" />
                  )}
                  <Typography variant="body2">
                    {check.charAt(0).toUpperCase() + check.slice(1)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={getPasswordStrength(formData.password) < 60}
          >
            Save
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AddPasswordModal;
