import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        pt: 8,
        pb: 6,
      }}
    >
      <Container maxWidth="sm">
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          PCCP Password Manager
        </Typography>
        <Typography variant="h5" align="center" color="text.secondary" paragraph>
          A secure way to manage your passwords using Picture Cued Click Points.
          Store, manage, and retrieve your passwords with enhanced security.
        </Typography>
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            component={Link}
            to="/login"
            variant="contained"
            size="large"
          >
            Sign In
          </Button>
          <Button
            component={Link}
            to="/register"
            variant="outlined"
            size="large"
          >
            Create Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;
