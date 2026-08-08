'use client';

import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Breadcrumbs,
  Alert,
  Tabs,
  Tab,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack,
  CloudUpload,
  Folder,
  AttachFile,
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PrivateRoute } from '@/components/auth/PrivateRoute';
import { useGetOrderQuery } from '@/store/api/orderApi';
import { useGetOrderAttachmentsQuery, useDownloadFileMutation, useDeleteFileMutation } from '@/store/api/fileApi';
import { FileUploadZone } from '@/components/files/FileUploadZone';
import { FilesList } from '@/components/files/FilesList';

interface OrderFilesPageProps {
  params: {
    id: string;
  };
}

function OrderFilesPage({ params }: OrderFilesPageProps) {
  const { user } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [error, setError] = useState('');

  const { data: order, isLoading: orderLoading } = useGetOrderQuery(params.id);
  const { data: files = [], isLoading: filesLoading, refetch } = useGetOrderAttachmentsQuery(params.id);
  const [downloadFile] = useDownloadFileMutation();
  const [deleteFile] = useDeleteFileMutation();

  const canUpload = () => {
    if (!order || !user) return false;
    // Students can upload requirements, writers can upload submissions/revisions, admins can upload anything
    if (user.role === 'admin') return true;
    if (user.role === 'student' && order.student?.id === user.id) return true;
    if (user.role === 'writer' && order.writer?.id === user.id) return true;
    return false;
  };

  const canViewFiles = () => {
    if (!order || !user) return false;
    // All participants in the order can view files
    if (user.role === 'admin') return true;
    if (user.role === 'student' && order.student?.id === user.id) return true;
    if (user.role === 'writer' && order.writer?.id === user.id) return true;
    return false;
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDownload = async (fileId: number, filename: string) => {
    try {
      const blob = await downloadFile(fileId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download file:', error);
      setError('Failed to download file');
    }
  };

  const handleDelete = async (fileId: number) => {
    try {
      await deleteFile(fileId);
      refetch();
    } catch (error) {
      console.error('Failed to delete file:', error);
      setError('Failed to delete file');
    }
  };

  const handleUploadSuccess = () => {
    setUploadDialog(false);
    refetch();
  };

  const handleUploadError = (error: string) => {
    setError(error);
  };

  const filterFilesByType = (type: string) => {
    return files.filter(file => file.fileType === type);
  };

  const getFileTypeLabel = (type: string) => {
    switch (type) {
      case 'requirement': return 'Requirements';
      case 'submission': return 'Submissions';
      case 'revision': return 'Revisions';
      case 'reference': return 'References';
      default: return 'All Files';
    }
  };

  if (orderLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading order details...</Typography>
      </Container>
    );
  }

  if (!order || !canViewFiles()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Order not found or you don't have permission to view its files.
        </Alert>
      </Container>
    );
  }

  const fileTypes = ['all', 'requirement', 'submission', 'revision', 'reference'];
  const currentFiles = tabValue === 0 ? files : filterFilesByType(fileTypes[tabValue]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/orders" style={{ textDecoration: 'none', color: 'inherit' }}>
          Orders
        </Link>
        <Link href={`/orders/${params.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          Order #{order.id}
        </Link>
        <Typography color="text.primary">Files</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton component={Link} href={`/orders/${params.id}`}>
          <ArrowBack />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" component="h1">
            Order Files
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {order.title}
          </Typography>
        </Box>
        {canUpload() && (
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialog(true)}
          >
            Upload Files
          </Button>
        )}
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Order Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{order.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                Order #{order.id} • {order.status.replace('_', ' ')} • ${order.price}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="primary.main">
                  {files.length}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Files
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" color="secondary.main">
                  {Math.round(files.reduce((acc, file) => acc + file.fileSize, 0) / 1024 / 1024 * 100) / 100}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  MB Total
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* File Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="file types"
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {fileTypes.map((type, index) => (
              <Tab
                key={type}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Folder />
                    {getFileTypeLabel(type)}
                    {index > 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ({filterFilesByType(type).length})
                      </Typography>
                    )}
                    {index === 0 && (
                      <Typography variant="caption" color="text.secondary">
                        ({files.length})
                      </Typography>
                    )}
                  </Box>
                }
              />
            ))}
          </Tabs>
        </Box>

        <CardContent>
          <FilesList
            files={currentFiles}
            isLoading={filesLoading}
            error={error}
            currentUserRole={user?.role}
            currentUserId={user?.id}
            onDownload={handleDownload}
            onDelete={handleDelete}
            showUploader={true}
          />
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AttachFile />
            Upload Files
          </Box>
        </DialogTitle>
        <DialogContent>
          <FileUploadZone
            orderId={params.id}
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleUploadError}
            maxFiles={10}
            maxSize={50}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default function OrderFilesPageWithAuth({ params }: OrderFilesPageProps) {
  return (
    <PrivateRoute>
      <OrderFilesPage params={params} />
    </PrivateRoute>
  );
}