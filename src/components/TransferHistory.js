import React from 'react';
import {
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button,
  Chip,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  History,
  CloudUpload,
  CloudDownload,
  CheckCircle,
  Error,
  Clear,
  AccessTime
} from '@mui/icons-material';

const TransferHistory = ({ history, onClearHistory }) => {
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getTransferIcon = (direction) => {
    return direction === 'upload' ? <CloudUpload /> : <CloudDownload />;
  };

  const getStatusIcon = (success) => {
    return success ? (
      <CheckCircle color="success" />
    ) : (
      <Error color="error" />
    );
  };

  const getStatusColor = (success) => {
    return success ? 'success' : 'error';
  };

  const truncatePath = (path, maxLength = 30) => {
    if (path.length <= maxLength) return path;
    return '...' + path.slice(-(maxLength - 3));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, height: 'fit-content' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <History sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2" sx={{ flexGrow: 1 }}>
          Transfer History
        </Typography>
        {history.length > 0 && (
          <Tooltip title="Clear history">
            <IconButton onClick={onClearHistory} size="small">
              <Clear />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {history.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
          <AccessTime sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="body2">
            No transfers yet. Start transferring files to see history here.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ maxHeight: '70vh', overflow: 'auto' }}>
          <List dense>
            {history.map((item, index) => (
              <React.Fragment key={item.id}>
                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      {getTransferIcon(item.transferData?.direction)}
                      {getStatusIcon(item.success)}
                    </Box>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={item.transferData?.direction || 'transfer'}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={item.success ? 'Success' : 'Failed'}
                          size="small"
                          color={getStatusColor(item.success)}
                          variant="filled"
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption" display="block" gutterBottom>
                          <strong>Local:</strong> {truncatePath(item.transferData?.localPath || 'N/A')}
                        </Typography>
                        <Typography variant="caption" display="block" gutterBottom>
                          <strong>Pod:</strong> {truncatePath(item.transferData?.podPath || 'N/A')}
                        </Typography>
                        <Typography variant="caption" display="block" gutterBottom>
                          <strong>Target:</strong> {item.transferData?.namespace}/{item.transferData?.podName}
                          {item.transferData?.container && ` (${item.transferData.container})`}
                        </Typography>
                        {!item.success && item.error && (
                          <Typography variant="caption" display="block" color="error" gutterBottom>
                            <strong>Error:</strong> {item.error}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {formatTimestamp(item.timestamp)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}

      {history.length > 0 && (
        <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" color="text.secondary">
            Showing {history.length} recent transfers
          </Typography>
        </Box>
      )}
    </Paper>
  );
};

export default TransferHistory;
