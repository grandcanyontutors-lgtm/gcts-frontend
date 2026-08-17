'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  FormControlLabel,
  Checkbox,
  Stack,
} from '@mui/material';
import { Send, Person, Lock } from '@mui/icons-material';
import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { brand } from '@/lib/brand';
import { personName } from '@/lib/orderVisibility';
import {
  useGetOrderMessagesQuery,
  useAddOrderMessageMutation,
} from '@/store/api/orderApi';

interface OrderMessagesProps {
  orderId: string;
  isAdmin: boolean;
}

/**
 * The message thread on an order.
 *
 * There is one communication system, not two. The backend stores these as
 * `Comment` rows, but its serializer has always exposed the field as `message`,
 * and this is the only thread the API actually serves — a parallel "messages"
 * feature existed in the frontend and called `/orders/{id}/messages/`, a route
 * that was never registered, so opening it only ever produced an error. The
 * model kept its name; the user-facing language is "messages", which is what
 * this is.
 *
 * Everything runs through the admin: GCTS has no direct student↔writer
 * relationship, so this is a requester↔admin thread. Staff can additionally
 * post internal notes, which the backend never returns to the order's owner.
 */
export function OrderMessages({ orderId, isAdmin }: OrderMessagesProps) {
  const [draft, setDraft] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [postError, setPostError] = useState('');

  const { data: messages = [], isLoading } = useGetOrderMessagesQuery(orderId);
  const [addMessage, { isLoading: posting }] = useAddOrderMessageMutation();

  const handlePost = async () => {
    if (!draft.trim()) return;
    setPostError('');
    try {
      await addMessage({ orderId, content: draft.trim(), isInternal }).unwrap();
      setDraft('');
      setIsInternal(false);
    } catch (e: any) {
      setPostError(e?.data?.message || e?.data?.error || 'Could not send the message.');
    }
  };

  // Oldest first, so the thread reads like a conversation (the API returns
  // newest first for its own pagination).
  const thread = [...messages].reverse();

  return (
    <Card sx={{ mt: 3, borderRadius: 3, border: `1px solid ${brand.line}` }}>
      <CardContent>
        <Typography sx={{ fontSize: 17, fontWeight: 700, color: brand.ink }}>Messages</Typography>
        <Typography sx={{ fontSize: 13.5, color: brand.body, mt: 0.5 }}>
          Questions about this order go here. Our team replies on the same thread.
        </Typography>
        <Divider sx={{ my: 2 }} />

        {isLoading ? (
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : thread.length === 0 ? (
          <Typography sx={{ fontSize: 14, color: brand.body, mb: 2 }}>
            No messages yet.
          </Typography>
        ) : (
          <Stack spacing={2} sx={{ mb: 2 }}>
            {thread.map((message: any) => (
              <Box key={message.id} sx={{ display: 'flex', gap: 1.5 }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: brand.lavender, color: brand.purple }}>
                  <Person fontSize="small" />
                </Avatar>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 700, color: brand.ink }}>
                      {personName(message.user) || 'Unknown'}
                    </Typography>
                    {message.is_internal && (
                      <Chip size="small" icon={<Lock />} label="Internal" color="warning" />
                    )}
                    <Typography sx={{ fontSize: 12.5, color: brand.body }}>
                      {message.createdAt &&
                        formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: 14, color: brand.body, whiteSpace: 'pre-wrap', mt: 0.25 }}
                  >
                    {message.message ?? message.comment}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        )}

        {postError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPostError('')}>
            {postError}
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            size="small"
            placeholder="Write a message…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <Button
            variant="contained"
            endIcon={<Send />}
            disabled={posting || !draft.trim()}
            onClick={handlePost}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: brand.purple }}
          >
            Send
          </Button>
        </Box>
        {isAdmin && (
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                sx={{ color: brand.purple, '&.Mui-checked': { color: brand.purple } }}
              />
            }
            label={
              <Typography sx={{ fontSize: 12.5, color: brand.body }}>
                Internal note — hidden from the requester
              </Typography>
            }
          />
        )}
      </CardContent>
    </Card>
  );
}
