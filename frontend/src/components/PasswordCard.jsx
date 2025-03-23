import { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Collapse,
  Tooltip,
  Chip,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ContentCopy,
  Delete,
  ExpandMore,
  ExpandLess,
  Launch,
} from '@mui/icons-material';
import api from '../services/api';

function PasswordCard({ item, onDelete, revealed }) {
  const [expanded, setExpanded] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [password, setPassword] = useState(null);
  
  const handleRevealPassword = async () => {
    if (isPasswordVisible) {
      setIsPasswordVisible(false);
      setPassword(null);
      return;
    }

    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await api.getPassword(userEmail, item.site_url);
      setPassword(response.data.password);
      setIsPasswordVisible(true);
    } catch (error) {
      console.error('Failed to fetch password:', error);
    }
  };

  const handleCopyPassword = async () => {
    if (!password) {
      try {
        const userEmail = localStorage.getItem('userEmail');
        const response = await api.getPassword(userEmail, item.site_url);
        await navigator.clipboard.writeText(response.data.password);
      } catch (error) {
        console.error('Failed to copy password:', error);
      }
    } else {
      await navigator.clipboard.writeText(password);
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" component="div">
            {item.site_url}
          </Typography>
          <Tooltip title="Visit site">
            <IconButton
              size="small"
              href={`https://${item.site_url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Launch fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        <Typography color="textSecondary" gutterBottom>
          {item.username}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2">
            {isPasswordVisible ? password : '••••••••'}
          </Typography>
          <Chip
            label={isPasswordVisible ? 'Revealed' : 'Hidden'}
            size="small"
            color={isPasswordVisible ? 'success' : 'default'}
          />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Typography>
            {item.modified_at && (
              <Typography variant="body2" color="textSecondary">
                Last modified: {new Date(item.modified_at).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </Collapse>
      </CardContent>

      <CardActions>
        <IconButton onClick={handleRevealPassword}>
          {isPasswordVisible ? <VisibilityOff /> : <Visibility />}
        </IconButton>
        <IconButton onClick={handleCopyPassword}>
          <ContentCopy />
        </IconButton>
        <IconButton onClick={() => onDelete(item.id)} color="error">
          <Delete />
        </IconButton>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{ marginLeft: 'auto' }}
        >
          {expanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </CardActions>
    </Card>
  );
}

export default PasswordCard;
