/**
 * Admin interface for managing dropdown options.
 * 
 * This component demonstrates how easy it is for admins to add, edit, and remove
 * dropdown options without touching code.
 */

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { useAllDropdownOptions, type AllDropdownOptions } from '../../hooks/useDropdownOptions';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const DropdownOptionsManager: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOption, setEditingOption] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    is_active: true,
    is_other: false,
    order: 0,
    icon: ''
  });
  
  const { allOptions, loading, error, refetch } = useAllDropdownOptions();

  const tabLabels = [
    'Subjects',
    'Order Types',
    'Academic Levels',
    'Citation Styles',
    'Languages',
    'Order Statuses',
    'Urgency Levels'
  ];

  const getOptionsForTab = (tabIndex: number) => {
    if (!allOptions) return [];
    const keys: (keyof AllDropdownOptions)[] = ['subjects', 'order_types', 'academic_levels', 'citation_styles', 'languages', 'order_statuses', 'urgency_levels'];
    return allOptions[keys[tabIndex]] || [];
  };

  const getEndpointForTab = (tabIndex: number) => {
    const endpoints = ['subjects', 'order-types', 'academic-levels', 'citation-styles', 'languages', 'order-statuses', 'urgency-levels'];
    return endpoints[tabIndex];
  };

  const handleAddNew = () => {
    setEditingOption(null);
    setFormData({
      name: '',
      display_name: '',
      description: '',
      is_active: true,
      is_other: false,
      order: 0,
      icon: ''
    });
    setOpenDialog(true);
  };

  const handleEdit = (option: any) => {
    setEditingOption(option);
    setFormData({
      name: option.name,
      display_name: option.display_name,
      description: option.description || '',
      is_active: option.is_active,
      is_other: option.is_other || false,
      order: option.order || 0,
      icon: option.icon || ''
    });
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const endpoint = getEndpointForTab(tabValue);
      const url = editingOption 
        ? `/api/v1/admin/${endpoint}-options/${editingOption.id}/`
        : `/api/v1/admin/${endpoint}-options/`;
      
      const method = editingOption ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save option');
      }

      setOpenDialog(false);
      refetch(); // Refresh the data
      
    } catch (err) {
      console.error('Error saving option:', err);
      alert('Failed to save option');
    }
  };

  const handleToggleActive = async (option: any) => {
    try {
      const endpoint = getEndpointForTab(tabValue);
      const response = await fetch(`/api/v1/admin/${endpoint}-options/${option.id}/toggle_active/`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to toggle option');
      }

      refetch();
      
    } catch (err) {
      console.error('Error toggling option:', err);
      alert('Failed to toggle option');
    }
  };

  const handleDelete = async (option: any) => {
    if (!confirm(`Are you sure you want to delete "${option.display_name}"?`)) {
      return;
    }

    try {
      const endpoint = getEndpointForTab(tabValue);
      const response = await fetch(`/api/v1/admin/${endpoint}-options/${option.id}/`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete option');
      }

      refetch();
      
    } catch (err) {
      console.error('Error deleting option:', err);
      alert('Failed to delete option');
    }
  };

  if (loading) {
    return <Typography>Loading dropdown options...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  const currentOptions = getOptionsForTab(tabValue);

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Dropdown Options Manager</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
        >
          Add New {tabLabels[tabValue].slice(0, -1)}
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {tabLabels.map((label, index) => (
        <TabPanel key={index} value={tabValue} index={index}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Display Name</TableCell>
                  <TableCell>Internal Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Order</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentOptions.map((option) => (
                  <TableRow key={option.id}>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        {option.icon && <span className={option.icon} />}
                        {option.display_name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <code>{option.name}</code>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={option.is_active ? 'Active' : 'Inactive'}
                        color={option.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {option.is_other ? (
                        <Chip label="Other" color="secondary" size="small" />
                      ) : (
                        <Chip label="Regular" variant="outlined" size="small" />
                      )}
                    </TableCell>
                    <TableCell>{option.order || 0}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleActive(option)}
                        title={option.is_active ? 'Deactivate' : 'Activate'}
                      >
                        {option.is_active ? <VisibilityIcon /> : <VisibilityOffIcon />}
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleEdit(option)}
                        title="Edit"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(option)}
                        title="Delete"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      ))}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOption ? 'Edit' : 'Add New'} {tabLabels[tabValue].slice(0, -1)}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ mt: 1 }}>
            <TextField
              label="Internal Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              helperText="Used internally (lowercase, underscores for spaces)"
              required
            />
            <TextField
              label="Display Name"
              value={formData.display_name}
              onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              helperText="Name shown to users"
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
              helperText="Optional description"
            />
            <TextField
              label="Icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              helperText="Optional icon class (Material-UI icons)"
            />
            <TextField
              label="Display Order"
              type="number"
              value={formData.order}
              onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
              helperText="Order in dropdown (lower numbers first)"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                />
              }
              label="Active (available for selection)"
            />
            {['subjects', 'order_types', 'citation_styles'].includes(getEndpointForTab(tabValue)) && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_other}
                    onChange={(e) => setFormData({ ...formData, is_other: e.target.checked })}
                  />
                }
                label="This is an 'Other' option (allows custom input)"
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingOption ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default DropdownOptionsManager;