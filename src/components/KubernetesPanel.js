import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  CircularProgress,
  Button,
  Divider,
  Chip
} from '@mui/material';
import { Refresh, Cloud } from '@mui/icons-material';

const KubernetesPanel = ({ config, onConfigChange, onNotification }) => {
  const [loading, setLoading] = useState({
    contexts: false,
    namespaces: false,
    pods: false,
    containers: false
  });

  const [data, setData] = useState({
    contexts: [],
    namespaces: [],
    pods: [],
    containers: []
  });

  // Load kubectl contexts on component mount
  useEffect(() => {
    loadContexts();
  }, []);

  // Load namespaces when context changes
  useEffect(() => {
    if (config.context) {
      loadNamespaces();
    } else {
      setData(prev => ({ ...prev, namespaces: [], pods: [] }));
      onConfigChange(prev => ({ ...prev, namespace: '', pod: '' }));
    }
  }, [config.context]);

  // Load pods when namespace changes
  useEffect(() => {
    if (config.context && config.namespace) {
      loadPods();
    } else {
      setData(prev => ({ ...prev, pods: [] }));
      onConfigChange(prev => ({ ...prev, pod: '' }));
    }
  }, [config.context, config.namespace]);

  // Load containers when pod changes
  useEffect(() => {
    if (config.context && config.namespace && config.pod) {
      loadContainers();
    } else {
      setData(prev => ({ ...prev, containers: [] }));
      onConfigChange(prev => ({ ...prev, container: '' }));
    }
  }, [config.context, config.namespace, config.pod]);

  const loadContexts = async () => {
    setLoading(prev => ({ ...prev, contexts: true }));
    try {
      const contexts = await window.electronAPI.getKubectlContexts();
      setData(prev => ({ ...prev, contexts }));
      
      // Auto-select first context if only one available
      if (contexts.length === 1) {
        onConfigChange(prev => ({ ...prev, context: contexts[0] }));
      }
    } catch (error) {
      onNotification(`Failed to load kubectl contexts: ${error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, contexts: false }));
    }
  };

  const loadNamespaces = async () => {
    setLoading(prev => ({ ...prev, namespaces: true }));
    try {
      const namespaces = await window.electronAPI.getNamespaces(config.context);
      setData(prev => ({ ...prev, namespaces }));
      
      // Auto-select 'default' namespace if available
      if (namespaces.includes('default')) {
        onConfigChange(prev => ({ ...prev, namespace: 'default' }));
      }
    } catch (error) {
      onNotification(`Failed to load namespaces: ${error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, namespaces: false }));
    }
  };

  const loadPods = async () => {
    setLoading(prev => ({ ...prev, pods: true }));
    try {
      const pods = await window.electronAPI.getPods(config.context, config.namespace);
      setData(prev => ({ ...prev, pods }));
    } catch (error) {
      onNotification(`Failed to load pods: ${error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, pods: false }));
    }
  };

  const loadContainers = async () => {
    setLoading(prev => ({ ...prev, containers: true }));
    try {
      const containers = await window.electronAPI.getPodContainers(config.context, config.namespace, config.pod);
      setData(prev => ({ ...prev, containers }));

      // Auto-select container if there's only one
      if (containers.length === 1) {
        onConfigChange(prev => ({ ...prev, container: containers[0] }));
      } else if (containers.length > 1 && !config.container) {
        // Clear container selection if multiple containers and none selected
        onConfigChange(prev => ({ ...prev, container: '' }));
      }
    } catch (error) {
      onNotification(`Failed to load containers: ${error.message}`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, containers: false }));
    }
  };

  const handleContextChange = (event) => {
    const context = event.target.value;
    onConfigChange(prev => ({ 
      ...prev, 
      context, 
      namespace: '', 
      pod: '' 
    }));
  };

  const handleNamespaceChange = (event) => {
    const namespace = event.target.value;
    onConfigChange(prev => ({ 
      ...prev, 
      namespace, 
      pod: '' 
    }));
  };

  const handlePodChange = (event) => {
    const pod = event.target.value;
    onConfigChange(prev => ({ ...prev, pod, container: '' }));
  };

  const handleContainerChange = (event) => {
    const container = event.target.value;
    onConfigChange(prev => ({ ...prev, container }));
  };

  const refreshAll = () => {
    loadContexts();
    if (config.context) {
      loadNamespaces();
      if (config.namespace) {
        loadPods();
      }
    }
  };

  const isConfigComplete = config.context && config.namespace && config.pod &&
    (data.containers.length <= 1 || config.container);

  return (
    <Paper elevation={3} sx={{ p: 3, height: 'fit-content' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Cloud sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="h2">
          Kubernetes Configuration
        </Typography>
        <Button
          size="small"
          onClick={refreshAll}
          sx={{ ml: 'auto' }}
          startIcon={<Refresh />}
        >
          Refresh
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Context Selection */}
        <FormControl fullWidth>
          <InputLabel>Context</InputLabel>
          <Select
            value={config.context}
            label="Context"
            onChange={handleContextChange}
            disabled={loading.contexts}
          >
            {data.contexts.map((context) => (
              <MenuItem key={context} value={context}>
                {context}
              </MenuItem>
            ))}
          </Select>
          {loading.contexts && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </FormControl>

        {/* Namespace Selection */}
        <FormControl fullWidth disabled={!config.context}>
          <InputLabel>Namespace</InputLabel>
          <Select
            value={config.namespace}
            label="Namespace"
            onChange={handleNamespaceChange}
            disabled={!config.context || loading.namespaces}
          >
            {data.namespaces.map((namespace) => (
              <MenuItem key={namespace} value={namespace}>
                {namespace}
              </MenuItem>
            ))}
          </Select>
          {loading.namespaces && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </FormControl>

        {/* Pod Selection */}
        <FormControl fullWidth disabled={!config.namespace}>
          <InputLabel>Pod</InputLabel>
          <Select
            value={config.pod}
            label="Pod"
            onChange={handlePodChange}
            disabled={!config.namespace || loading.pods}
          >
            {data.pods.map((pod) => (
              <MenuItem key={pod} value={pod}>
                {pod}
              </MenuItem>
            ))}
          </Select>
          {loading.pods && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <CircularProgress size={20} />
            </Box>
          )}
        </FormControl>

        {/* Container Selection */}
        {data.containers.length > 1 && (
          <FormControl fullWidth disabled={!config.pod}>
            <InputLabel>Container</InputLabel>
            <Select
              value={config.container || ''}
              label="Container"
              onChange={handleContainerChange}
              disabled={!config.pod || loading.containers}
            >
              {data.containers.map((container) => (
                <MenuItem key={container} value={container}>
                  {container}
                </MenuItem>
              ))}
            </Select>
            {loading.containers && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                <CircularProgress size={20} />
              </Box>
            )}
          </FormControl>
        )}

        {/* Container Info for Single Container */}
        {data.containers.length === 1 && config.pod && (
          <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1, color: 'info.contrastText' }}>
            <Typography variant="body2">
              <strong>Container:</strong> {data.containers[0]} (auto-selected)
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1 }} />

        {/* Configuration Status */}
        <Box>
          <Typography variant="subtitle2" gutterBottom>
            Status
          </Typography>
          <Chip
            label={isConfigComplete ? 'Ready for Transfer' : 'Configuration Incomplete'}
            color={isConfigComplete ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        {/* Current Configuration Summary */}
        {isConfigComplete && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="caption" display="block" gutterBottom>
              <strong>Context:</strong> {config.context}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              <strong>Namespace:</strong> {config.namespace}
            </Typography>
            <Typography variant="caption" display="block" gutterBottom>
              <strong>Pod:</strong> {config.pod}
            </Typography>
            {(config.container || data.containers.length === 1) && (
              <Typography variant="caption" display="block">
                <strong>Container:</strong> {config.container || data.containers[0]}
              </Typography>
            )}
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default KubernetesPanel;
