import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Grid, MenuItem, CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';

const currentYear = new Date().getFullYear().toString();
const years = Array.from({ length: 10 }, (_, i) => String(Number(currentYear) - 5 + i));

const defaultForm = {
  eventName: '', eventCategory: '', festivalDay: '',
  festivalYear: currentYear, date: '', startTime: '', endTime: '',
  venue: '', description: '', organizer: '', coordinator: '',
  budget: '', status: 'Planned',
};

export default function EventForm({ open, editId, initial, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        eventName: initial.eventName || '', eventCategory: initial.eventCategory || '',
        festivalDay: initial.festivalDay || '', festivalYear: initial.festivalYear || currentYear,
        date: initial.date || '', startTime: initial.startTime || '', endTime: initial.endTime || '',
        venue: initial.venue || '', description: initial.description || '',
        organizer: initial.organizer || '', coordinator: initial.coordinator || '',
        budget: initial.budget || '', status: initial.status || 'Planned',
      });
    } else {
      setForm(defaultForm);
    }
  }, [initial, open]);

  const handleSave = async () => {
    if (!form.eventName.trim()) { toast.warn('Event name is required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const r = await eventService.updateEvent(editId, form);
        toast.success('Event updated');
        onSaved(r);
      } else {
        const r = await eventService.createEvent(form);
        toast.success('Event created');
        onSaved(r);
      }
      onClose();
    } catch (err) {
      toast.error(err.message || 'Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{editId ? 'Edit Event' : 'Add Event'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={8}>
              <TextField label="Event Name" fullWidth required value={form.eventName} onChange={(e) => setForm({ ...form, eventName: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Festival Year" fullWidth select value={form.festivalYear} onChange={(e) => setForm({ ...form, festivalYear: e.target.value })}>
                {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Category" fullWidth select value={form.eventCategory} onChange={(e) => setForm({ ...form, eventCategory: e.target.value })}>
                {eventService.EVENT_CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Festival Day" fullWidth select value={form.festivalDay} onChange={(e) => setForm({ ...form, festivalDay: e.target.value })}>
                {eventService.FESTIVAL_DAYS.map((d) => <MenuItem key={d} value={d}>{d}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Status" fullWidth select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {eventService.STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Date" fullWidth type="date" InputLabelProps={{ shrink: true }} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Start Time" fullWidth type="time" InputLabelProps={{ shrink: true }} value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="End Time" fullWidth type="time" InputLabelProps={{ shrink: true }} value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Venue" fullWidth value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Organizer" fullWidth value={form.organizer} onChange={(e) => setForm({ ...form, organizer: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField label="Coordinator" fullWidth value={form.coordinator} onChange={(e) => setForm({ ...form, coordinator: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField label="Budget (₹)" fullWidth type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Description" fullWidth multiline rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={saving ? <CircularProgress size={16} /> : null}>
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
