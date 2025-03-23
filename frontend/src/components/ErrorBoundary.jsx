import { Component } from 'react';
import { Box, Paper, Typography, Button } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useNavigate, useLocation } from 'react-router-dom';

// Wrapper component to use hooks with class component
function WithNavigate(props) {
  const navigate = useNavigate();
  const location = useLocation();
  return <ErrorBoundaryContent {...props} navigate={navigate} location={location} />;
}

class ErrorBoundaryContent extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const isHomePage = this.props.location.pathname === '/';
      return (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default'
          }}
        >
          <Paper elevation={3} sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" color="error" gutterBottom>
              Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              {isHomePage 
                ? 'Please try refreshing the page or contact support if the problem persists.'
                : 'Please try going back to the home page or contact support if the problem persists.'}
            </Typography>
            <Button
              variant="contained"
              onClick={() => isHomePage ? window.location.reload() : this.props.navigate('/')}
              sx={{ mt: 2 }}
            >
              {isHomePage ? 'Refresh Page' : 'Go to Home'}
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

function ErrorBoundary(props) {
  return <WithNavigate {...props} />;
}

export default ErrorBoundary;
