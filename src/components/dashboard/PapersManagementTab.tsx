'use client';

import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Alert,
} from '@mui/material';
import { Add, Delete, Edit, Search } from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  useGetAdminPapersQuery,
  useCreatePaperMutation,
  useUpdatePaperMutation,
  useDeletePaperMutation,
  useGetPaperSubjectsQuery,
  type AdminPaper,
} from '@/store/api/papersApi';
import { brand, accents, panelSx } from '@/lib/brand';

const PAGE_SIZE = 10;

const EMPTY_FORM = { title: '', content: '', subject_id: '', is_open: false };

/**
 * Sample papers.
 *
 * The previous version of this tab was written against a model that does not
 * exist — it listed Type, Level, Downloads and a Published/Draft status, and
 * offered Duplicate and five bulk actions. `Paper` has none of those fields and
 * the API has neither of those routes; the list itself called `/admin/papers/`,
 * which 404s, so nothing ever arrived to contradict it. Pointed at real data it
 * crashed outright, rendering the nested `subject` object as a React child.
 *
 * What is left is the model as it exists, and the one editorial decision the
 * product actually defines: whether a paper is fully open or shows an excerpt
 * until an admin accepts an access request.
 */
export function PapersManagementTab() {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<AdminPaper | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleting, setDeleting] = useState<AdminPaper | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput.trim()), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading, isFetching } = useGetAdminPapersQuery({
    page,
    page_size: PAGE_SIZE,
    search: search || undefined,
  });
  const { data: subjects = [] } = useGetPaperSubjectsQuery();

  const [createPaper, { isLoading: creating }] = useCreatePaperMutation();
  const [updatePaper, { isLoading: updating }] = useUpdatePaperMutation();
  const [deletePaper, { isLoading: removing }] = useDeletePaperMutation();

  const papers = data?.results ?? [];
  const pageCount = Math.ceil((data?.count ?? 0) / PAGE_SIZE);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setDialogOpen(true);
  };

  const openEdit = (paper: AdminPaper) => {
    setEditing(paper);
    setForm({
      title: paper.title,
      content: paper.content ?? '',
      subject_id: paper.subject?.id ?? '',
      is_open: paper.is_open,
    });
    setError('');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError('');
    try {
      if (editing) {
        await updatePaper({ id: editing.id, ...form }).unwrap();
      } else {
        await createPaper(form).unwrap();
      }
      setDialogOpen(false);
    } catch (e: any) {
      setError(e?.data?.message || e?.data?.detail || 'Could not save the paper.');
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await deletePaper(deleting.id).unwrap();
      setDeleting(null);
    } catch (e: any) {
      setError(e?.data?.message || 'Could not delete the paper.');
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          gap: 1.5,
          alignItems: 'center',
          flexWrap: 'wrap',
          mb: 2.5,
        }}
      >
        <TextField
          size="small"
          placeholder="Search papers"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          inputProps={{ 'aria-label': 'Search papers' }}
          InputProps={{ startAdornment: <Search sx={{ mr: 1, fontSize: 20, color: brand.body }} /> }}
          sx={{ flex: '1 1 260px', maxWidth: 380 }}
        />
        <Box sx={{ flexGrow: 1 }} />
        <Typography sx={{ fontSize: 14, fontWeight: 600, color: brand.body }}>
          {isLoading ? 'Loading…' : `${data?.count ?? 0} papers`}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={openCreate}
          sx={{ textTransform: 'none', fontWeight: 700, bgcolor: brand.purple }}
        >
          New paper
        </Button>
      </Box>

      {error && !dialogOpen && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper} sx={{ ...panelSx, overflowX: 'auto' }}>
        <Table sx={{ minWidth: 640 }}>
          <TableHead>
            <TableRow sx={{ bgcolor: brand.paper }}>
              <TableCell sx={{ fontWeight: 700 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Access</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Added</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading || isFetching ? (
              Array.from({ length: 5 }).map((_, row) => (
                <TableRow key={row}>
                  {Array.from({ length: 5 }).map((__, cell) => (
                    <TableCell key={cell}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : papers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5, color: brand.body }}>
                  No papers yet.
                </TableCell>
              </TableRow>
            ) : (
              papers.map((paper) => (
                <TableRow key={paper.id} hover>
                  <TableCell sx={{ fontWeight: 600, color: brand.ink }}>{paper.title}</TableCell>
                  <TableCell sx={{ color: brand.body }}>
                    {paper.subject?.title ?? '—'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={paper.is_open ? 'Open' : 'Excerpt only'}
                      sx={{
                        fontWeight: 700,
                        bgcolor: paper.is_open ? `${accents.done}1a` : `${accents.pending}1a`,
                        color: paper.is_open ? accents.done : accents.pending,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: brand.body }}>
                    {paper.created_at ? format(new Date(paper.created_at), 'MMM d, yyyy') : '—'}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(paper)} sx={{ color: brand.purple }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => setDeleting(paper)} sx={{ color: '#c62828' }}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination count={pageCount} page={page} onChange={(_, p) => setPage(p)} color="primary" />
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit paper' : 'New paper'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="paper-subject-label">Subject</InputLabel>
            <Select
              labelId="paper-subject-label"
              label="Subject"
              value={form.subject_id}
              onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}
            >
              {subjects.map((subject) => (
                <MenuItem key={subject.id} value={subject.id}>
                  {subject.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            multiline
            minRows={8}
            label="Content"
            margin="normal"
            value={form.content}
            onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          />
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                checked={form.is_open}
                onChange={(e) => setForm((f) => ({ ...f, is_open: e.target.checked }))}
                sx={{ '& .Mui-checked': { color: brand.purple } }}
              />
            }
            label={
              <Typography sx={{ fontSize: 13.5, color: brand.body }}>
                {form.is_open
                  ? 'Open — the full paper is public'
                  : 'Excerpt only — readers must request access, which you approve'}
              </Typography>
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={creating || updating || !form.title.trim() || !form.subject_id}
            sx={{ textTransform: 'none', fontWeight: 700, bgcolor: brand.purple }}
          >
            {editing ? 'Save changes' : 'Create paper'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleting)} onClose={() => setDeleting(null)}>
        <DialogTitle>Delete this paper?</DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: 14.5, color: brand.body }}>
            “{deleting?.title}” will be removed permanently.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDelete} disabled={removing} sx={{ textTransform: 'none' }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
