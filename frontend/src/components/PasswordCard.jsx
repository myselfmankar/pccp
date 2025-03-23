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

function PasswordCard({ item, onReveal, onDelete, onCopy, revealed }) {
  const [expanded, setExpanded] = useState(false);
  
  const getDomainFromUrl = (url) => {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" component="div">
            {getDomainFromUrl(item.site_url)}
          </Typography>
          <Tooltip title="Visit site">
            <IconButton
              size="small"
              href={item.site_url.startsWith('http') ? item.site_url : `https://${item.site_url}`}
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
            {revealed ? item.password : '••••••••'}
          </Typography>
          <Chip
            label={revealed ? 'Revealed' : 'Hidden'}
            size="small"
            color={revealed ? 'success' : 'default'}
          />
        </Box>

        <Collapse in={expanded}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary">
              Created: {new Date(item.created_at).toLocaleDateString()}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Last modified: {new Date(item.modified_at).toLocaleDateString()}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>

      <CardActions>
        <IconButton onClick={() => onReveal(item.id)}>
          {revealed ? <VisibilityOff /> : <Visibility />}
        </IconButton>
        <IconButton onClick={() => onCopy(item.password)} disabled={!revealed}>
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
