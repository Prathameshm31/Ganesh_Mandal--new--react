import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { MdLocationCity, MdPeople, MdAttachMoney, MdAdd, MdEdit, MdDelete } from 'react-icons/md';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { colonyService } from '../../services';

const defaultFormValues = { name: '', area: '', pincode: '' };

export default function ColonyList() {
  const [colonies, setColonies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editColony, setEditColony] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: defaultFormValues });

  const load = async () => {
    setLoading(true);
    try {
      const data = await colonyService.getColonies();
      setColonies(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load colonies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => {
    setEditColony(null);
    reset(defaultFormValues);
    setDialogOpen(true);
  };

  const openEdit = (colony) => {
    setEditColony(colony);
    reset({ name: colony.name || '', area: colony.area || '', pincode: colony.pincode || '' });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editColony) {
        await colonyService.updateColony(editColony.id, data);
        toast.success('Colony updated successfully');
      } else {
        await colonyService.addColony(data);
        toast.success('Colony added successfully');
      }
      setDialogOpen(false);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to save colony');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await colonyService.deleteColony(deleteTarget.id);
      toast.success(`Colony "${deleteTarget.name}" deleted`);
      setDeleteTarget(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Failed to delete colony');
    }
  };

  const totalMembers = colonies.reduce((s, c) => s + c.totalMembers, 0);
  const totalCollection = colonies.reduce((s, c) => s + c.totalCollection, 0);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Colony Management</Typography>
        <Button variant="contained" startIcon={<MdAdd />} onClick={openAdd}>Add Colony</Button>
      </Box>

      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Colonies', value: colonies.length, icon: <MdLocationCity />, color: 'linear-gradient(135deg, #1565c0, #42a5f5)' },
          { label: 'Total Members', value: totalMembers, icon: <MdPeople />, color: 'linear-gradient(135deg, #2e7d32, #66bb6a)' },
          { label: 'Total Collection', value: `₹${totalCollection.toLocaleString()}`, icon: <MdAttachMoney />, color: 'linear-gradient(135deg, #e65100, #ff9800)' },
        ].map(stat => (
          <Grid item xs={12} sm={4} key={stat.label}>
            <Card sx={{ background: stat.color, color: '#fff' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box sx={{ fontSize: 28 }}>{stat.icon}</Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>{stat.label}</Typography>
                </Box>
                <Typography variant="h5" fontWeight={700}>{stat.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {colonies.map(colony => {
          const pct = colony.totalCollection + colony.pendingCollection > 0
            ? Math.round((colony.totalCollection / (colony.totalCollection + colony.pendingCollection)) * 100)
            : 0;
          return (
            <Grid item xs={12} sm={6} md={4} key={colony.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>{colony.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{colony.area} - {colony.pincode}</Typography>
                    </Box>
                    <Box>
                      <IconButton size="small" onClick={() => openEdit(colony)}><MdEdit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => setDeleteTarget(colony)}><MdDelete /></IconButton>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', my: 1 }}>
                    <Typography variant="body2">Members: <strong>{colony.totalMembers}</strong></Typography>
                    <Typography variant="body2">Collection: <strong>₹{colony.totalCollection.toLocaleString()}</strong></Typography>
                  </Box>
                  <Typography variant="body2" color="error" mb={1}>Pending: ₹{colony.pendingCollection.toLocaleString()}</Typography>
                  <LinearProgress variant="determinate" value={pct} sx={{ height: 8, borderRadius: 4 }} />
                  <Typography variant="caption" color="text.secondary" mt={0.5}>{pct}% collected</Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editColony ? 'Edit Colony' : 'Add Colony'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller name="name" control={control} rules={{ required: 'Name is required' }} render={({ field }) => (
              <TextField {...field} label="Colony Name" fullWidth error={!!errors.name} helperText={errors.name?.message} />
            )} />
            <Controller name="area" control={control} render={({ field }) => (
              <TextField {...field} label="Area" fullWidth />
            )} />
            <Controller name="pincode" control={control} rules={{ pattern: { value: /^\d{6}$/, message: 'Invalid pincode' } }} render={({ field }) => (
              <TextField {...field} label="Pincode" fullWidth error={!!errors.pincode} helperText={errors.pincode?.message} />
            )} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>{submitting ? 'Saving...' : editColony ? 'Update' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Colony</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
