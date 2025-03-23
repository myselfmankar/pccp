import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import LoadingSpinner from './components/LoadingSpinner'; // Import LoadingSpinner
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'; // Import MUI components
import Home from './components/Home'; // Import Home

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [loading, setLoading] = useState(false); // Add loading state

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <div className="container mx-auto p-4">
          <ErrorBoundary>
            {loading && <LoadingSpinner />} {/* Show loading spinner when loading */}
            <Routes>
              <Route path="/" element={<Home />} /> {/* Add Home route */}
              <Route
                path="/login"
                element={<Login setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated} setLoading={setLoading} />} // Pass setLoading
              />
              <Route path="/register" element={<Register isAuthenticated={isAuthenticated} setLoading={setLoading} />} /> {/* Pass setLoading */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard onLogout={logout} />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} /> {/* Update default route */}
            </Routes>
          </ErrorBoundary>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;