'use client';

import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  Description,
  Image,
  PictureAsPdf,
  InsertDriveFile,
} from '@mui/icons-material';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import type { OrderFormData } from '@/app/order/place/page';
import { brand } from '@/lib/brand';

const stepTitleSx = {
  fontSize: { xs: 22, md: 26 },
  fontWeight: 800,
  letterSpacing: '-0.02em',
  color: brand.ink,
  lineHeight: 1.2,
};

const stepSubtitleSx = {
  mb: 3,
  fontSize: 15,
  fontWeight: 500,
  color: brand.body,
};

interface FilesStepProps {
  data: OrderFormData;
  errors: Record<string, string>;
  onChange: (data: Partial<OrderFormData>) => void;
}

const maxFileSize = 10 * 1024 * 1024; // 10MB
const acceptedFileTypes = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'text/plain': ['.txt'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes('pdf')) return <PictureAsPdf color="error" />;
  if (fileType.includes('image')) return <Image color="primary" />;
  if (fileType.includes('word') || fileType.includes('text')) return <Description color="info" />;
  return <InsertDriveFile color="action" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function FilesStep({ data, errors, onChange }: FilesStepProps) {
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      console.warn('Some files were rejected:', rejectedFiles);
    }

    // Add accepted files
    const newFiles = [...data.files, ...acceptedFiles];
    onChange({ files: newFiles });

    // Simulate upload progress (in real app, this would be actual upload)
    acceptedFiles.forEach((file, index) => {
      const fileId = `${file.name}-${Date.now()}-${index}`;
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
        if (progress >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setUploadProgress(prev => {
              const newProgress = { ...prev };
              delete newProgress[fileId];
              return newProgress;
            });
          }, 1000);
        }
      }, 100);
    });
  }, [data.files, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple: true,
  });

  const removeFile = (index: number) => {
    const newFiles = data.files.filter((_, i) => i !== index);
    onChange({ files: newFiles });
  };

  const totalSize = data.files.reduce((acc, file) => acc + file.size, 0);

  return (
    <Box sx={{ p: { xs: 0, sm: 1 } }}>
      <Typography gutterBottom sx={stepTitleSx}>
        Upload Files (Optional)
      </Typography>
      <Typography sx={stepSubtitleSx}>
        Upload any relevant files such as assignment instructions, rubrics, or reference materials
      </Typography>

      {/* Drag and Drop Area */}
      <Paper
        elevation={0}
        {...getRootProps()}
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: isDragActive ? brand.purple : brand.line,
          backgroundColor: isDragActive ? 'rgba(156,39,176,0.06)' : brand.paper,
          borderRadius: 3,
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
          mb: 3,
          '&:hover': {
            borderColor: brand.purple,
            backgroundColor: 'rgba(156,39,176,0.04)',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUpload sx={{ fontSize: 48, color: brand.purple, mb: 2 }} />
        <Typography sx={{ fontWeight: 700, color: brand.ink, mb: 0.5 }}>
          {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
        </Typography>
        <Typography variant="body2" sx={{ color: brand.body, fontWeight: 500 }} gutterBottom>
          or click to browse files
        </Typography>
        <Button
          variant="outlined"
          sx={{
            mt: 1,
            color: brand.ink,
            fontWeight: 700,
            borderRadius: 2.5,
            border: '1.5px solid rgba(26,21,38,0.15)',
            '&:hover': { borderColor: brand.purple, bgcolor: 'rgba(156,39,176,0.04)' },
          }}
        >
          Choose Files
        </Button>
      </Paper>

      {/* File Requirements */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
        <Typography variant="body2">
          <strong>Supported formats:</strong> PDF, DOC, DOCX, TXT, JPG, PNG, GIF, XLS, XLSX, PPT, PPTX
          <br />
          <strong>Maximum file size:</strong> 10MB per file
          <br />
          <strong>Maximum total size:</strong> 50MB
        </Typography>
      </Alert>

      {/* Uploaded Files List */}
      {data.files.length > 0 && (
        <Box>
          <Typography gutterBottom sx={{ fontWeight: 700, color: brand.ink }}>
            Uploaded Files ({data.files.length})
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Total size: {formatFileSize(totalSize)}
          </Typography>
          
          <List>
            {data.files.map((file, index) => {
              const fileId = `${file.name}-${Date.now()}-${index}`;
              const progress = uploadProgress[fileId];
              
              return (
                <ListItem
                  key={`${file.name}-${index}`}
                  sx={{
                    border: `1px solid ${brand.line}`,
                    borderRadius: 2,
                    mb: 1,
                    backgroundColor: '#fff',
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    {getFileIcon(file.type)}
                  </Box>
                  <ListItemText
                    primary={file.name}
                    secondary={
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)} • {file.type || 'Unknown type'}
                        </Typography>
                        {progress !== undefined && (
                          <Box sx={{ mt: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={progress}
                              sx={{ height: 4, borderRadius: 2 }}
                            />
                            <Typography variant="caption" color="text.secondary">
                              Uploading... {progress}%
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      onClick={() => removeFile(index)}
                      color="error"
                    >
                      <Delete />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
        </Box>
      )}

      {totalSize > 50 * 1024 * 1024 && (
        <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
          Total file size exceeds 50MB limit. Please remove some files.
        </Alert>
      )}

      {/* Tips */}
      <Box sx={{
        bgcolor: brand.lavender,
        border: `1px solid ${brand.line}`,
        borderRadius: 3,
        p: 3,
        mt: 3,
      }}>
        <Typography sx={{ fontWeight: 700, color: brand.ink, mb: 1 }}>
          File Upload Tips
        </Typography>
        <Typography variant="body2" component="div" sx={{ color: brand.body, fontWeight: 500 }}>
          <ul style={{ margin: 0, paddingLeft: '20px' }}>
            <li>Upload assignment instructions, rubrics, or syllabus</li>
            <li>Include any reference materials or sample work</li>
            <li>Add research sources or bibliography requirements</li>
            <li>Attach partially completed work if you need it continued</li>
            <li>Files will be securely stored and only accessible to your assigned writer</li>
          </ul>
        </Typography>
      </Box>
    </Box>
  );
}