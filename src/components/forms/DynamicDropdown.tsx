/**
 * Dynamic Dropdown component with "Other" option support.
 * 
 * This component fetches options from the backend and provides an input field
 * when "Other" is selected, allowing users to provide custom values.
 */

import React, { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import config from '@/lib/config';

interface DropdownOption {
  id: string;
  name: string;
  display_name: string;
  icon?: string;
  is_other?: boolean;
  description?: string;
}

interface DynamicDropdownProps {
  label: string;
  fieldType: 'subjects' | 'order-types' | 'academic-levels' | 'citation-styles' | 'languages' | 'urgency-levels';
  value: string;
  customValue?: string;
  onChange: (value: string, customValue?: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
}

const DynamicDropdown: React.FC<DynamicDropdownProps> = ({
  label,
  fieldType,
  value,
  customValue = '',
  onChange,
  error,
  helperText,
  required = false,
  disabled = false,
}) => {
  const [options, setOptions] = useState<DropdownOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInputValue, setCustomInputValue] = useState(customValue);

  // Fetch dropdown options from backend
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setFetchError(null);
        
        // Absolute, via config — see the note in useDropdownOptions.ts.
        const response = await fetch(config.getApiUrl(`dropdown-options/${fieldType}/`));
        if (!response.ok) {
          throw new Error(`Failed to fetch ${fieldType}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setOptions(data);
        
        // Check if selected value is "other" option
        const selectedOption = data.find((opt: DropdownOption) => opt.id === value);
        setShowCustomInput(selectedOption?.is_other || false);
        
      } catch (err) {
        console.error(`Error fetching ${fieldType}:`, err);
        setFetchError(err instanceof Error ? err.message : 'Failed to fetch options');
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, [fieldType]);

  // Handle dropdown selection change
  const handleDropdownChange = (newValue: string) => {
    const selectedOption = options.find(opt => opt.id === newValue);
    const isOtherOption = selectedOption?.is_other || false;
    
    setShowCustomInput(isOtherOption);
    
    if (isOtherOption) {
      // If "Other" is selected, keep the custom value
      onChange(newValue, customInputValue);
    } else {
      // If regular option is selected, clear custom value
      setCustomInputValue('');
      onChange(newValue, '');
    }
  };

  // Handle custom input change
  const handleCustomInputChange = (newCustomValue: string) => {
    setCustomInputValue(newCustomValue);
    onChange(value, newCustomValue);
    
    // Log custom value usage to backend for analytics
    if (newCustomValue.trim()) {
      logCustomValue(newCustomValue.trim());
    }
  };

  // Log custom value usage for analytics
  const logCustomValue = async (customVal: string) => {
    try {
      await fetch(config.getApiUrl('dropdown-options/log-custom-value/'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          field_type: fieldType.replace('-', '_'), // Convert URL format to backend format
          custom_value: customVal,
        }),
      });
    } catch (err) {
      console.error('Failed to log custom value:', err);
    }
  };

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography variant="body2">Loading {label.toLowerCase()}...</Typography>
      </Box>
    );
  }

  // Render error state
  if (fetchError) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {fetchError}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Main dropdown */}
      <FormControl fullWidth error={!!error} disabled={disabled}>
        <InputLabel required={required}>{label}</InputLabel>
        <Select
          value={value}
          onChange={(e) => handleDropdownChange(e.target.value)}
          label={label}
        >
          {options.map((option) => (
            <MenuItem key={option.id} value={option.id}>
              <Box display="flex" alignItems="center" gap={1}>
                {option.icon && (
                  <span className={option.icon} style={{ fontSize: '16px' }} />
                )}
                {option.display_name}
                {option.is_other && (
                  <Typography variant="caption" color="text.secondary">
                    (Custom)
                  </Typography>
                )}
              </Box>
            </MenuItem>
          ))}
        </Select>
        {error && (
          <Typography variant="caption" color="error" sx={{ mt: 0.5 }}>
            {error}
          </Typography>
        )}
        {helperText && !error && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {helperText}
          </Typography>
        )}
      </FormControl>

      {/* Custom input field for "Other" option */}
      {showCustomInput && (
        <TextField
          fullWidth
          label={`Please specify ${label.toLowerCase()}`}
          value={customInputValue}
          onChange={(e) => handleCustomInputChange(e.target.value)}
          placeholder={`Enter custom ${label.toLowerCase()}`}
          required={required}
          disabled={disabled}
          sx={{ mt: 2 }}
          helperText="Please provide details in the instructions section if needed"
        />
      )}
    </Box>
  );
};

export default DynamicDropdown;