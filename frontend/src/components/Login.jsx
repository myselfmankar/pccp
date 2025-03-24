import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import PCCPModal from "./PCCPModal";
import { 
  TextField, 
  Button, 
  Paper, 
  Typography, 
  Container,
  Box,
  Alert
} from '@mui/material';

function Login({ setIsAuthenticated, setLoading, isAuthenticated }) {
  const navigate = useNavigate();
  const [user_email, setUser_email] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [pccpImage, setPccpImage] = useState("");
  const [coordinates, setCoordinates] = useState([]);
  const [showPCCPModal, setShowPCCPModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);  // Add this line

  useEffect(() => {
    console.log("Updated coordinates:", coordinates);
  }, [coordinates]);

  const handleSetPCCP = async () => {
    setLoading(true);
    setLocalLoading(true);  // Add this line
    try {
      const response = await api.getPCCPImageForLogin(user_email);
      console.log('Login: PCCP image URL fetched:', response.data?.image_url);  // <-- Added log
      if (response.data && response.data.image_url) {
        setPccpImage(response.data.image_url);
        setShowPCCPModal(true);
      } else {
        setError("Failed to fetch PCCP image.");
      }
    } catch (error) {
      setError("An error occurred while fetching PCCP image.");
      console.error(error);
    }
    setLoading(false);
    setLocalLoading(false);  // Add this line
  };

  const handlePCCPSelection = (selectedCoordinates) => {
    setCoordinates(selectedCoordinates);
    setShowPCCPModal(false);
  };

  useEffect(() => {
    if (coordinates.length > 0) {
      handleLogin();
    }
  }, [coordinates]);

  const handleLogin = async () => {
    setLoading(true);
    const payload = {
      user_email: user_email,
      password: password,
      coordinates: [...coordinates],
    };

    console.log("Login payload:", payload);

    try {
      const response = await api.login(user_email, password, coordinates);
      if (response.data && response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("userEmail", user_email);  // <--- Added to persist current user email
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        setError(response.data.message || "Login failed.");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error(error);
    }
    setLoading(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!user_email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(user_email)) {
      errors.email = "Email address is invalid";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      setIsSubmitting(false);
      return;
    }
    
    try {
      await handleSetPCCP();
    } catch (error) {
      setError("Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
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
        <Paper elevation={6} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign In
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
              autoFocus
              value={user_email}
              onChange={(e) => setUser_email(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />

            <Box sx={{ mt: 3, mb: 2, display: 'flex', justifyContent: 'space-between' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={localLoading}
                sx={{ width: '45%' }}
              >
                {localLoading ? "Loading..." : "Sign In"} 
              </Button>
              
              <Button
                component={Link}
                to="/register"
                variant="outlined"
                sx={{ width: '45%' }}
                onClick={() => {
                  setIsAuthenticated(false);
                  localStorage.removeItem('token');
                }}
              >
                Create Account
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

export default Login;
