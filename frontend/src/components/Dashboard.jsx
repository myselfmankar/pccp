import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordList from './PasswordList';
import AddPasswordModal from './AddPasswordModal';
import api from '../services/api';
import {
  CircularProgress,
  Container,
  Typography,
  Button,
  Box,
  Alert,
  AppBar,
  Toolbar,
  Avatar,
  Divider,
  IconButton,
  Paper,
  Grid,
} from '@mui/material';
import { Add as AddIcon, Logout as LogoutIcon } from '@mui/icons-material';

function Dashboard({ onLogout }) {
  const navigate = useNavigate();
  const [passwords, setPasswords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userEmail = localStorage.getItem('userEmail');

  useEffect(() => {
    const fetchPasswords = async () => {
      try {
        const response = await api.getPasswords(userEmail);
        setPasswords(response.data);
      } catch (error) {
        setError('Failed to fetch passwords');
        console.error(error);
      }
      setLoading(false);
    };

    fetchPasswords();
  }, [userEmail]);

  const handleAddPassword = async (newPassword) => {
    try {
      // Format the URL to remove protocol if present
      let formattedUrl = newPassword.site_url.replace(/^(https?:\/\/)?(www\.)?/, '');
      
      await api.storePassword(
        userEmail, 
        formattedUrl, 
        newPassword.username, 
        newPassword.password
      );
      
      // Refresh password list after adding new password
      const response = await api.getPasswords(userEmail);
      setPasswords(response.data);
      setIsModalOpen(false);
    } catch (error) {
      setError('Failed to add password');
      console.error(error);
    }
  };

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            PCCP Password Manager
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'secondary.main' }}>
              {userEmail?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2">{userEmail}</Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <LogoutIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}
      
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h5">Your Passwords</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsModalOpen(true)}
              >
                Add New Password
              </Button>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <PasswordList 
                passwords={passwords}
                onGetPassword={api.getPassword}
                loading={loading}
              />
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {isModalOpen && (
        <AddPasswordModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddPassword={handleAddPassword}
        />
      )}
    </Box>
  );
}

export default Dashboard;