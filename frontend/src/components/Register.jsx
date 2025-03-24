import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import PCCPModal from './PCCPModal';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

function Register({ isAuthenticated, setIsAuthenticated }) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    user_email: '',
    password: '',
    confirmPassword: '',
    showPassword: false,
    showConfirmPassword: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pccpImage, setPccpImage] = useState('');
  const [coordinates, setCoordinates] = useState([]);
  const [pccpSet, setPccpSet] = useState(false);
  const [showPCCPModal, setShowPCCPModal] = useState(false);

  // Clear any existing authentication token to avoid inadvertent auto-login.
  useEffect(() => {
    localStorage.removeItem('token');
    if(isAuthenticated) setIsAuthenticated(false);
  }, []);

  const handleInputChange = (prop) => (event) => {
    setFormData({ ...formData, [prop]: event.target.value });
    setError('');
  };

  const togglePasswordVisibility = (field) => () => {
    setFormData({ ...formData, [field]: !formData[field] });
  };

  const validateForm = () => {
    if (!formData.user_email) return 'Email is required';
    if (!/\S+@\S+\.\S+/.test(formData.user_email)) return 'Invalid email format';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    if (!pccpSet) return 'Please set your PCCP points';
    return '';
  };

  const handleSetPCCP = async () => {
    setLoading(true);
    try {
      const response = await api.getPCCPImage();
      console.log('Register: PCCP image URL fetched:', response.data?.image_url);  // <-- Added log
      if (response.data?.image_url) {
        setPccpImage(response.data.image_url);
        setShowPCCPModal(true);
      } else {
        setError('Failed to fetch PCCP image');
      }
    } catch (error) {
      setError('Failed to fetch PCCP image');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePCCPSelection = (selectedCoordinates) => {
    setCoordinates(selectedCoordinates);
    setPccpSet(true);
    setShowPCCPModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await api.register(formData.user_email, formData.password, coordinates, pccpImage);
      navigate('/login');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Create Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="user_email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.user_email}
              onChange={handleInputChange('user_email')}
              error={!!error && error.includes('email')}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={formData.showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!error && error.includes('Password')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility('showPassword')}>
                      {formData.showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={formData.showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleInputChange('confirmPassword')}
              error={!!error && error.includes('match')}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility('showConfirmPassword')}>
                      {formData.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              fullWidth
              variant="contained"
              color="secondary"
              onClick={handleSetPCCP}
              disabled={loading}
              sx={{ mt: 2, mb: 2 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Set PCCP Points'}
            </Button>

            {pccpSet && (
              <Alert severity="success" sx={{ mb: 2 }}>
                PCCP points set successfully!
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading || !pccpSet}
                sx={{ width: '48%' }}
              >
                {loading ? <CircularProgress size={24} /> : 'Register'}
              </Button>

              <Button
                component={Link}
                to="/login"
                variant="outlined"
                sx={{ width: '48%' }}
                onClick={() => {
                  // Ensure session is cleared when navigating to login
                  localStorage.removeItem('token');
                  setIsAuthenticated(false);
                }}
              >
                Sign In
              </Button>
            </Box>
          </form>
        </Paper>
      </Box>

      {showPCCPModal && (
        <PCCPModal
          imageUrl={pccpImage}
          onSelectionComplete={handlePCCPSelection}
          onClose={() => setShowPCCPModal(false)}
        />
      )}
    </Container>
  );
}

export default Register;