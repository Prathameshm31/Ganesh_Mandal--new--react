import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Collapse,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  MdEvent,
  MdAccessTime,
  MdLocationOn,
  MdPerson,
  MdAttachMoney,
  MdAdd,
  MdEdit,
  MdDelete,
  MdExpandMore,
  MdExpandLess,
} from 'react-icons/md';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { activityService } from '../../services';
import DeleteDialog from '../Members/DeleteDialog';

const statusColors = { Upcoming: 'primary', Ongoing: 'warning', Completed: 'success' };
const statuses = ['Upcoming', 'Ongoing', 'Completed'];
const categories = ['Religious', 'Cultural', 'Social', 'Health', 'Education', 'Environment', 'Sports'];

const defaultFormValues = {
  title: '',
  description: '',
  date: '',
  time: '',
  venue: '',
  organizer: '',
  budget: '',
  status: 'Upcoming',
  category: 'Cultural',
};

export default function ActivitiesList() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [expandedId, setExpandedId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: defaultFormValues });

  const loadActivities = async () => {
    setLoading(true);
    try {
      const data = await activityService.getActivities();
      setActivities(data);
    } catch (err) {
      toast.error(err.message || 'Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadActivities(); }, []);

  const filtered = filter === 'All' ? activities : activities.filter(a => a.status === filter);

  const openAdd = () => {
    setEditActivity(null);
    reset(defaultFormValues);
    setDialogOpen(true);
  };

  const openEdit = (activity) => {
    setEditActivity(activity);
    reset({
      title: activity.title || '',
      description: activity.description || '',
      date: activity.date || '',
      time: activity.time || '',
      venue: activity.venue || '',
      organizer: activity.organizer || '',
      budget: activity.budget || '',
      status: activity.status || 'Upcoming',
      category: activity.category || 'Cultural',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data, budget: Number(data.budget) };
      if (editActivity) {
        await activityService.updateActivity(editActivity.id, payload);
        toast.success('Activity updated successfully');
      } else {
        await activityService.addActivity(payload);
        toast.success('Activity added successfully');
      }
      setDialogOpen(false);
      await loadActivities();
    } catch (err) {
      toast.error(err.message || 'Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await activityService.deleteActivity(deleteTarget.id);
      toast.success(`Activity "${deleteTarget.title}" deleted`);
      setDeleteTarget(null);
      await loadActivities();
    } catch (err) {
      toast.error(err.message || 'Failed to delete activity');
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Activities & Events</Typography>
          <Typography variant="body2" color="text.secondary">{activities.length} total activities</Typography>
        </Box>
        <Button variant="contained" startIcon={<MdAdd />} onClick={openAdd}>Add Activity</Button>
      </Box>

      <ToggleButtonGroup
        value={filter}
        exclusive
        onChange={(_, v) => v && setFilter(v)}
        size="small"
        sx={{ mb: 3 }}
      >
        {['All', ...statuses].map(s => (
          <ToggleButton key={s} value={s}>{s}</ToggleButton>
        ))}
      </ToggleButtonGroup>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : filtered.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>No activities found</Typography>
      ) : (
        <Grid container spacing={3}>
          {filtered.map(activity => (
            <Grid item xs={12} sm={6} lg={4} key={activity.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip label={activity.category} size="small" color="secondary" variant="outlined" />
                    <Chip
                      label={activity.status}
                      size="small"
                      color={statusColors[activity.status] || 'default'}
                    />
                  </Box>
                  <Typography variant="h6" fontWeight={700} gutterBottom>{activity.title}</Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: expandedId === activity.id ? 'unset' : 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {activity.description}
                  </Typography>
                  {activity.description?.length > 100 && (
                    <Button
                      size="small"
                      onClick={() => setExpandedId(expandedId === activity.id ? null : activity.id)}
                      endIcon={expandedId === activity.id ? <MdExpandLess /> : <MdExpandMore />}
                    >
                      {expandedId === activity.id ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MdEvent fontSize={16} /><Typography variant="caption">{activity.date}</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MdAccessTime fontSize={16} /><Typography variant="caption">{activity.time}</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MdLocationOn fontSize={16} /><Typography variant="caption">{activity.venue}</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MdPerson fontSize={16} /><Typography variant="caption">{activity.organizer}</Typography></Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><MdAttachMoney fontSize={16} /><Typography variant="caption">₹{activity.budget?.toLocaleString()}</Typography></Box>
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 1 }}>
                  <IconButton size="small" onClick={() => openEdit(activity)}><MdEdit /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setDeleteTarget(activity)}><MdDelete /></IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editActivity ? 'Edit Activity' : 'Add Activity'}</DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Controller name="title" control={control} rules={{ required: 'Title is required' }} render={({ field }) => (
              <TextField {...field} label="Title" fullWidth error={!!errors.title} helperText={errors.title?.message} />
            )} />
            <Controller name="description" control={control} render={({ field }) => (
              <TextField {...field} label="Description" fullWidth multiline rows={3} />
            )} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="date" control={control} rules={{ required: 'Date is required' }} render={({ field }) => (
                <TextField {...field} label="Date" type="date" fullWidth InputLabelProps={{ shrink: true }} error={!!errors.date} helperText={errors.date?.message} />
              )} />
              <Controller name="time" control={control} render={({ field }) => (
                <TextField {...field} label="Time" type="time" fullWidth InputLabelProps={{ shrink: true }} />
              )} />
            </Box>
            <Controller name="venue" control={control} render={({ field }) => (
              <TextField {...field} label="Venue" fullWidth />
            )} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="organizer" control={control} render={({ field }) => (
                <TextField {...field} label="Organizer" fullWidth />
              )} />
              <Controller name="budget" control={control} render={({ field }) => (
                <TextField {...field} label="Budget (₹)" type="number" fullWidth onChange={e => field.onChange(Number(e.target.value))} />
              )} />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Controller name="status" control={control} render={({ field }) => (
                <TextField {...field} label="Status" select fullWidth>
                  {statuses.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="category" control={control} render={({ field }) => (
                <TextField {...field} label="Category" select fullWidth>
                  {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                </TextField>
              )} />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)} disabled={submitting}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>{submitting ? 'Saving...' : editActivity ? 'Update' : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Activity</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteTarget?.title}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
