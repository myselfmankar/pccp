import { useState } from 'react';
import {
  Grid,
  Typography,
  Snackbar,
  Alert,
  Box,
  CircularProgress,
} from '@mui/material';
import PasswordCard from './PasswordCard';
import PCCPVerificationModal from './PCCPVerificationModal';
import api from '../services/api';

function PasswordList({ passwords, onGetPassword, onDeletePassword, loading }) {
  const [revealedPasswords, setRevealedPasswords] = useState({});
  const [verificationModalData, setVerificationModalData] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleCopyPassword = async (password) => {
    try {
      await navigator.clipboard.writeText(password);
      setSnackbar({
        open: true,
        message: 'Password copied to clipboard!',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to copy password',
        severity: 'error'
      });
    }
  };

  const startPasswordReveal = async (id) => {
    try {
      // If password is already revealed, just hide it
      if (revealedPasswords[id]) {
        const { [id]: _, ...rest } = revealedPasswords;
        setRevealedPasswords(rest);
        return;
      }

      setVerifyingId(id);
      const passwordItem = passwords.find(item => item.id === id);
      
      if (!passwordItem) return;
      
      // Get the current user email from localStorage
      const userEmail = localStorage.getItem('userEmail');
      
      // Call the API to get the password and PCCP verification data
      const response = await api.getPassword(userEmail, passwordItem.site_url);
      
      if (response.status === 200) {
        // Show PCCP verification modal with the image and coordinates
        setVerificationModalData({
          password: response.data.password,
          imageUrl: response.data.master_image_url,
          expectedCoordinates: response.data.master_coordinates // No need to parse
        });
      } else {
        // Handle error cases
        setError(`Failed to retrieve password: ${response.data.message}`);
        setVerifyingId(null);
      }
    } catch (error) {
      console.error('Failed to get password:', error);
      setError('An error occurred while retrieving the password');
      setVerifyingId(null);
    }
  };

  const handleVerificationComplete = (success) => {
    if (success && verifyingId !== null) {
      // If verification is successful, reveal the password
      setRevealedPasswords({ 
        ...revealedPasswords, 
        [verifyingId]: verificationModalData.password 
      });
    } else if (!success) {
      setError('PCCP verification failed. Please try again.');
    }
    
    // Close the modal and reset state
    setVerificationModalData(null);
    setVerifyingId(null);
  };

  const handleCloseModal = () => {
    setVerificationModalData(null);
    setVerifyingId(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (passwords.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', p: 3 }}>
        <Typography color="textSecondary">
          No passwords stored yet. Add your first password using the button above.
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {passwords.map((item) => (
          <Grid item xs={12} sm={6} md={4} key={item.id}>
            <PasswordCard
              item={item}
              onReveal={startPasswordReveal}
              onDelete={onDeletePassword}
              onCopy={handleCopyPassword}
              revealed={revealedPasswords[item.id]}
            />
          </Grid>
        ))}
      </Grid>

      {verificationModalData && (
        <PCCPVerificationModal
          imageUrl={verificationModalData.imageUrl}
          expectedCoordinates={verificationModalData.expectedCoordinates}
          onVerificationComplete={handleVerificationComplete}
          onClose={handleCloseModal}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default PasswordList;