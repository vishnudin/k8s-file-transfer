import React, { useState, useEffect } from 'react';
import { 
  ThemeProvider, 
  createTheme, 
  CssBaseline, 
  Container, 
  AppBar, 
  Toolbar, 
  Typography, 
  Box,
  Alert,
  Snackbar
} from '@mui/material';
import { CloudUpload, CloudDownload } from '@mui/icons-material';
import FileTransferPanel from './components/FileTransferPanel';
import KubernetesPanel from './components/KubernetesPanel';
import TransferHistory from './components/TransferHistory';
import TransferIcon from './components/TransferIcon';
import './App.css';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  const [kubernetesConfig, setKubernetesConfig] = useState({
    context: '',
    namespace: '',
    pod: '',
    container: ''
  });
  
  const [transferHistory, setTransferHistory] = useState([]);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const addToHistory = (transfer) => {
    const historyItem = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...transfer
    };
    setTransferHistory(prev => [historyItem, ...prev.slice(0, 49)]); // Keep last 50 transfers
  };

  const handleTransferComplete = (result) => {
    if (result.success) {
      showNotification('Transfer completed successfully!', 'success');
      addToHistory(result);
    } else {
      showNotification(`Transfer failed: ${result.error}`, 'error');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <TransferIcon size={32} className="transfer-icon" />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, ml: 2 }}>
              Kubernetes File Transfer
            </Typography>
          </Toolbar>
        </AppBar>
        
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' } }}>
            {/* Left Panel - Kubernetes Configuration */}
            <Box sx={{ flex: '0 0 300px', minWidth: 300 }}>
              <KubernetesPanel 
                config={kubernetesConfig}
                onConfigChange={setKubernetesConfig}
                onNotification={showNotification}
              />
            </Box>
            
            {/* Main Panel - File Transfer */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <FileTransferPanel 
                kubernetesConfig={kubernetesConfig}
                onTransferComplete={handleTransferComplete}
                onNotification={showNotification}
              />
            </Box>
            
            {/* Right Panel - Transfer History */}
            <Box sx={{ flex: '0 0 350px', minWidth: 350 }}>
              <TransferHistory 
                history={transferHistory}
                onClearHistory={() => setTransferHistory([])}
              />
            </Box>
          </Box>
        </Container>
        
        <Snackbar
          open={notification.open}
          autoHideDuration={6000}
          onClose={closeNotification}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert 
            onClose={closeNotification} 
            severity={notification.severity}
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}

export default App;
