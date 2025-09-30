import React, { useState, useRef } from 'react';
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
  Divider,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  CloudUpload,
  CloudDownload,
  Folder,
  InsertDriveFile,
  SwapHoriz,
  Refresh
} from '@mui/icons-material';

const FileTransferPanel = ({ kubernetesConfig, onTransferComplete, onNotification }) => {
  const [transferMode, setTransferMode] = useState('upload'); // 'upload' or 'download'
  const [localPath, setLocalPath] = useState('');
  const [podPath, setPodPath] = useState('/tmp');
  const [transferring, setTransferring] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef(null);

  const isConfigReady = kubernetesConfig.context && 
                       kubernetesConfig.namespace && 
                       kubernetesConfig.pod;

  const handleSelectLocalFiles = async () => {
    try {
      const result = await window.electronAPI.selectLocalFiles();
      if (!result.canceled && result.filePaths.length > 0) {
        setLocalPath(result.filePaths.join(', '));
      }
    } catch (error) {
      onNotification(`Failed to select files: ${error.message}`, 'error');
    }
  };

  const handleSelectLocalDirectory = async () => {
    try {
      const result = await window.electronAPI.selectLocalDirectory();
      if (!result.canceled && result.filePaths.length > 0) {
        setLocalPath(result.filePaths[0]);
      }
    } catch (error) {
      onNotification(`Failed to select directory: ${error.message}`, 'error');
    }
  };

  const handleTransfer = async () => {
    if (!isConfigReady) {
      onNotification('Please configure Kubernetes connection first', 'warning');
      return;
    }

    if (!localPath || !podPath) {
      onNotification('Please specify both local and pod paths', 'warning');
      return;
    }

    setTransferring(true);
    setProgress(0);

    // Simulate progress for better UX
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const transferData = {
        localPath,
        podPath,
        podName: kubernetesConfig.pod,
        namespace: kubernetesConfig.namespace,
        context: kubernetesConfig.context,
        container: kubernetesConfig.container,
        direction: transferMode
      };

      let result;
      if (transferMode === 'upload') {
        result = await window.electronAPI.transferToPod(transferData);
      } else {
        result = await window.electronAPI.transferFromPod(transferData);
      }

      clearInterval(progressInterval);
      setProgress(100);

      // Add transfer details to result
      result.transferData = transferData;
      result.timestamp = new Date().toISOString();

      onTransferComplete(result);
      
      // Reset form after successful transfer
      if (result.success) {
        setLocalPath('');
        setPodPath('/tmp');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setProgress(0);
      
      const errorResult = {
        success: false,
        error: error.message || 'Transfer failed',
        transferData: {
          localPath,
          podPath,
          podName: kubernetesConfig.pod,
          namespace: kubernetesConfig.namespace,
          context: kubernetesConfig.context,
          container: kubernetesConfig.container,
          direction: transferMode
        },
        timestamp: new Date().toISOString()
      };
      
      onTransferComplete(errorResult);
    } finally {
      setTransferring(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  const switchTransferMode = () => {
    setTransferMode(prev => prev === 'upload' ? 'download' : 'upload');
    // Swap paths when switching modes
    const tempPath = localPath;
    setLocalPath(podPath);
    setPodPath(tempPath);
  };

  const getTransferIcon = () => {
    return transferMode === 'upload' ? <CloudUpload /> : <CloudDownload />;
  };

  const getTransferLabel = () => {
    return transferMode === 'upload' ? 'Upload to Pod' : 'Download from Pod';
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        {getTransferIcon()}
        <Typography variant="h6" component="h2" sx={{ ml: 1, flexGrow: 1 }}>
          File Transfer
        </Typography>
        <Tooltip title="Switch transfer direction">
          <IconButton onClick={switchTransferMode} color="primary">
            <SwapHoriz />
          </IconButton>
        </Tooltip>
      </Box>

      {!isConfigReady && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Please configure your Kubernetes connection in the left panel before transferring files.
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Transfer Mode Selection */}
        <FormControl fullWidth>
          <InputLabel>Transfer Direction</InputLabel>
          <Select
            value={transferMode}
            label="Transfer Direction"
            onChange={(e) => setTransferMode(e.target.value)}
            disabled={transferring}
          >
            <MenuItem value="upload">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudUpload sx={{ mr: 1 }} />
                Upload to Pod
              </Box>
            </MenuItem>
            <MenuItem value="download">
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CloudDownload sx={{ mr: 1 }} />
                Download from Pod
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        <Divider />

        {/* Local Path Section */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {transferMode === 'upload' ? 'Source (Local)' : 'Destination (Local)'}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              fullWidth
              label="Local Path"
              value={localPath}
              onChange={(e) => setLocalPath(e.target.value)}
              disabled={transferring}
              placeholder={transferMode === 'upload' ? 'Select files or enter path' : 'Enter destination path'}
            />
          </Box>
          {transferMode === 'upload' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<InsertDriveFile />}
                onClick={handleSelectLocalFiles}
                disabled={transferring}
                size="small"
              >
                Select Files
              </Button>
              <Button
                variant="outlined"
                startIcon={<Folder />}
                onClick={handleSelectLocalDirectory}
                disabled={transferring}
                size="small"
              >
                Select Folder
              </Button>
            </Box>
          )}
        </Box>

        {/* Pod Path Section */}
        <Box>
          <Typography variant="subtitle1" gutterBottom>
            {transferMode === 'upload' ? 'Destination (Pod)' : 'Source (Pod)'}
          </Typography>
          <TextField
            fullWidth
            label="Pod Path"
            value={podPath}
            onChange={(e) => setPodPath(e.target.value)}
            disabled={transferring}
            placeholder="Enter path in pod (e.g., /tmp, /app/data)"
          />
        </Box>

        {/* Transfer Progress */}
        {transferring && (
          <Box>
            <Typography variant="body2" gutterBottom>
              {getTransferLabel()} in progress...
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
              {progress}% complete
            </Typography>
          </Box>
        )}

        {/* Transfer Button */}
        <Button
          variant="contained"
          size="large"
          onClick={handleTransfer}
          disabled={!isConfigReady || transferring || !localPath || !podPath}
          startIcon={getTransferIcon()}
          sx={{ mt: 2 }}
        >
          {transferring ? 'Transferring...' : getTransferLabel()}
        </Button>

        {/* Current Configuration Display */}
        {isConfigReady && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>
              <strong>Target:</strong> {kubernetesConfig.context}/{kubernetesConfig.namespace}/{kubernetesConfig.pod}
              {kubernetesConfig.container && ` (container: ${kubernetesConfig.container})`}
            </Typography>
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default FileTransferPanel;
