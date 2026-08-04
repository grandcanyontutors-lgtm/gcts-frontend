'use client';

import {
  Card,
  CardContent,
  Typography,
  Rating,
  Avatar,
  Box,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  MoreVert,
  Edit,
  Delete,
  Person,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { brand, cardSx } from '@/lib/brand';

interface ReviewCardProps {
  review: any;
  currentUserRole?: string;
  currentUserId?: number;
  showWriter?: boolean;
  showStudent?: boolean;
  showOrder?: boolean;
  onEdit?: (review: any) => void;
  onDelete?: (reviewId: number) => void;
  onToggleVisibility?: (reviewId: number, isPublic: boolean) => void;
}

export function ReviewCard({
  review,
  currentUserRole,
  currentUserId,
  showWriter = true,
  showStudent = false,
  showOrder = true,
  onEdit,
  onDelete,
  onToggleVisibility,
}: ReviewCardProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(review);
    handleMenuClose();
  };

  const handleDelete = () => {
    if (onDelete) onDelete(review.id);
    handleMenuClose();
  };

  const handleToggleVisibility = () => {
    if (onToggleVisibility) onToggleVisibility(review.id, !review.isPublic);
    handleMenuClose();
  };

  const canEdit = () => {
    return currentUserRole === 'admin' || 
           (currentUserRole === 'student' && review.student.id === currentUserId);
  };

  const canDelete = () => {
    return currentUserRole === 'admin' || 
           (currentUserRole === 'student' && review.student.id === currentUserId);
  };

  const canToggleVisibility = () => {
    return currentUserRole === 'admin' || 
           (currentUserRole === 'student' && review.student.id === currentUserId);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'success.main';
    if (rating >= 3.5) return 'warning.main';
    return 'error.main';
  };

  return (
    <Card elevation={0} sx={{ ...cardSx, mb: 2, position: 'relative' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Rating
              value={review.rating}
              readOnly
              size="small"
              sx={{ color: getRatingColor(review.rating) }}
            />
            <Typography variant="h6" component="span" sx={{ fontWeight: 800, color: brand.ink }}>
              {review.rating}/5
            </Typography>
            {!review.isPublic && (
              <Chip 
                label="Private" 
                size="small" 
                color="secondary" 
                icon={<VisibilityOff />}
              />
            )}
          </Box>
          
          {(canEdit() || canDelete() || canToggleVisibility()) && (
            <IconButton size="small" onClick={handleMenuClick}>
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Review Content */}
        <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7, color: brand.body, fontWeight: 500 }}>
          {review.comment}
        </Typography>

        {/* Metadata */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {showStudent && review.student && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'success.main' }}>
                <Person sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="body2" sx={{ color: brand.body, fontWeight: 500 }}>
                Student: {review.student.firstName} {review.student.lastName}
              </Typography>
            </Box>
          )}

          {showWriter && review.writer && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: 'info.main' }}>
                <Person sx={{ fontSize: 16 }} />
              </Avatar>
              <Typography variant="body2" sx={{ color: brand.body, fontWeight: 500 }}>
                Writer: {review.writer.firstName} {review.writer.lastName}
                {review.writer.rating && (
                  <Box component="span" sx={{ ml: 1 }}>
                    (⭐ {review.writer.rating.toFixed(1)})
                  </Box>
                )}
              </Typography>
            </Box>
          )}

          {showOrder && review.order && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" sx={{ color: brand.body, fontWeight: 500 }}>
                Order: #{review.order.id} - {review.order.title}
              </Typography>
              <Chip 
                label={review.order.status.replace('_', ' ')} 
                size="small" 
                sx={{ textTransform: 'capitalize' }}
              />
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* Footer */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" sx={{ color: brand.body, fontWeight: 500 }}>
            {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
          </Typography>
          <Typography variant="caption" sx={{ color: brand.body, fontWeight: 500 }}>
            {format(new Date(review.createdAt), 'MMM dd, yyyy')}
          </Typography>
        </Box>
      </CardContent>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {canEdit() && (
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} />
            Edit Review
          </MenuItem>
        )}
        
        {canToggleVisibility() && (
          <MenuItem onClick={handleToggleVisibility}>
            {review.isPublic ? <VisibilityOff sx={{ mr: 1 }} /> : <Visibility sx={{ mr: 1 }} />}
            {review.isPublic ? 'Make Private' : 'Make Public'}
          </MenuItem>
        )}
        
        {canDelete() && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete Review
          </MenuItem>
        )}
      </Menu>
    </Card>
  );
}