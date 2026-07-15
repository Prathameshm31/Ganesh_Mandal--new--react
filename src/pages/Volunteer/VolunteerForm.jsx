import { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Grid, MenuItem,
} from '@mui/material';
import { toast } from 'react-toastify';
import volunteerService from '../../services/volunteerService';

const genders = ['Male', 'Female', 'Other'];
const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const statuses = ['Active', 'Inactive'];
const availabilities = ['Full-time', 'Part-time', 'Weekends', 'Evenings', 'Flexible'];
const currentYear = new Date().getFullYear().toString();
const years = Array.from({ length: 10 }, (_, i) => String(Number(currentYear) - 5 + i));

const defaultForm = {
  name: '', mobile: '', email: '', address: '', profilePhoto: '',
  dateOfBirth: '', gender: '', bloodGroup: '', emergencyContact: '',
  aadhaarNumber: '', festivalYear: currentYear, category: '', role: '',
  skills: '', experience: '', availability: '', joiningDate: '', status: 'Active',
};

export default function VolunteerForm({ open, editId, initial, onClose, onSaved }) {
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [roles, setRoles] = useState([]);

  const reset = (data) => {
    if (data) {
      setForm({
        name: data.name || '', mobile: data.mobile || '', email: data.email || '',
        address: data.address || '', profilePhoto: data.profilePhoto || '',
        dateOfBirth: data.dateOfBirth || '', gender: data.gender || '',
        bloodGroup: data.bloodGroup || '', emergencyContact: data.emergencyContact || '',
        aadhaarNumber: data.aadhaarNumber || '', festivalYear: data.festivalYear || currentYear,
        category: data.category || '', role: data.role || '', skills: data.skills || '',
        experience: data.experience || '', availability: data.availability || '',
        joiningDate: data.joiningDate || '', status: data.status || 'Active',
      });
      const cat = volunteerService.CATEGORIES.find(c => c.name === data.category);
      setRoles(cat ? cat.roles : []);
    } else {
      setForm(defaultForm);
      setRoles([]);
    }
  };

  const handleOpen = () => { reset(initial); };

  const handleCatChange = (catName) => {
    setForm({ ...form, category: catName, role: '' });
    const cat = volunteerService.CATEGORIES.find(c => c.name === catName);
    setRoles(cat ? cat.roles : []);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.mobile.trim()) { toast.warn('Name and Mobile are required'); return; }
    setSaving(true);
    try {
      if (editId) {
        const r = await volunteerService.updateVolunteer(editId, form);
        toast.success('Volunteer updated');
        onSaved(r);
      } else {
        const r = await volunteerService.createVolunteer(form);
        toast.success('Volunteer added');
        onSaved(r);
      }
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth onTransitionEnter={handleOpen}>
      <DialogTitle>{editId ? 'Edit Volunteer' : 'Add Volunteer'}</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField label="Full Name" fullWidth required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Mobile Number" fullWidth required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Email" fullWidth type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Emergency Contact" fullWidth value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Date of Birth" fullWidth type="date" InputLabelProps={{ shrink: true }} value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Gender" fullWidth select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
                {genders.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Blood Group" fullWidth select value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}>
                {bloodGroups.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Aadhaar Number" fullWidth value={form.aadhaarNumber} onChange={(e) => setForm({ ...form, aadhaarNumber: e.target.value })} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Festival Year" fullWidth select value={form.festivalYear} onChange={(e) => setForm({ ...form, festivalYear: e.target.value })}>
                {years.map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Category" fullWidth select value={form.category} onChange={(e) => handleCatChange(e.target.value)}>
                {volunteerService.CATEGORIES.map((c) => <MenuItem key={c.name} value={c.name}>{c.name}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Role" fullWidth select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} disabled={!roles.length}>
                {roles.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Status" fullWidth select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {statuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Availability" fullWidth select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })}>
                {availabilities.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Experience" fullWidth value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} placeholder="e.g. 5 years" />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField label="Joining Date" fullWidth type="date" InputLabelProps={{ shrink: true }} value={form.joiningDate} onChange={(e) => setForm({ ...form, joiningDate: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Skills" fullWidth multiline rows={2} value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Comma separated" />
            </Grid>
            <Grid item xs={12}>
              <TextField label="Address" fullWidth multiline rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </Grid>
          </Grid>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
      </DialogActions>
    </Dialog>
  );
}
