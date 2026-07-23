import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, MenuItem, CircularProgress,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addMember, updateMember } from '../../services/memberService';
import { colonyService, roleService } from '../../services';

const defaultValues = {
  name: '', mobile: '', whatsappNumber: '', email: '',
  address: '', colony: '', area: '', houseNumber: '',
  familyMembers: 1, occupation: '', status: 'Active', notes: '',
  festivalYear: new Date().getFullYear().toString(),
  committeeCategory: '', roleId: '', username: '', password: '',
};

export default function MemberForm({ open, onClose, member, onSaved }) {
  const [colonies, setColonies] = useState([]);
  const [roles, setRoles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = Boolean(member);

  useEffect(() => {
    if (open) {
      colonyService.getColonies().then(setColonies).catch(() => {});
      roleService.getRoles().then(setRoles).catch(() => {});
    }
  }, [open]);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues });

  useEffect(() => {
    if (member) {
      reset({
        name: member.name || '', mobile: member.mobile || '',
        whatsappNumber: member.whatsappNumber || '', email: member.email || '',
        address: member.address || '', colony: member.colony || '',
        area: member.area || '', houseNumber: member.houseNumber || '',
        familyMembers: member.familyMembers || 1, occupation: member.occupation || '',
        status: member.status || 'Active', notes: member.notes || '',
        festivalYear: member.festivalYear || new Date().getFullYear().toString(),
        committeeCategory: member.committeeCategory || '',
        roleId: member.roleId || '', username: member.username || '', password: '',
      });
    } else {
      reset(defaultValues);
    }
  }, [member, reset, open]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const payload = { ...data };
      if (payload.roleId === '') payload.roleId = null;
      if (payload.username === '') payload.username = null;
      if (payload.password === '') payload.password = null;
      if (isEdit) {
        await updateMember(member.id, payload);
        toast.success('Member updated successfully');
      } else {
        await addMember(payload);
        toast.success('Member added successfully');
      }
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to save member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller name="name" control={control} rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <TextField {...field} label="Full Name" fullWidth required error={Boolean(errors.name)} helperText={errors.name?.message} />
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="mobile" control={control} rules={{ required: 'Mobile number is required', pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' } }}
                render={({ field }) => (
                  <TextField {...field} label="Mobile Number" fullWidth required error={Boolean(errors.mobile)} helperText={errors.mobile?.message} />
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="whatsappNumber" control={control}
                render={({ field }) => <TextField {...field} label="WhatsApp Number" fullWidth />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="email" control={control} rules={{ pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } }}
                render={({ field }) => (
                  <TextField {...field} label="Email" fullWidth error={Boolean(errors.email)} helperText={errors.email?.message} />
                )} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="address" control={control}
                render={({ field }) => <TextField {...field} label="Address" fullWidth multiline rows={2} />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="colony" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Colony" fullWidth select>
                    <MenuItem value="">Select Colony</MenuItem>
                    {colonies.map(c => <MenuItem key={c.id} value={c.name}>{c.name}</MenuItem>)}
                  </TextField>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="area" control={control}
                render={({ field }) => <TextField {...field} label="Area" fullWidth />} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="houseNumber" control={control}
                render={({ field }) => <TextField {...field} label="House Number" fullWidth />} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="familyMembers" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Family Members" type="number" fullWidth
                    inputProps={{ min: 1 }} onChange={e => field.onChange(Number(e.target.value))} />
                )} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Controller name="occupation" control={control}
                render={({ field }) => <TextField {...field} label="Occupation" fullWidth />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="status" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Status" fullWidth select>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="festivalYear" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Festival Year" fullWidth select>
                    {['2025', '2026', '2027', '2028'].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </TextField>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="committeeCategory" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Committee/Category" fullWidth
                    placeholder="e.g. Core Committee, Finance, Events"
                  />
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="roleId" control={control}
                render={({ field }) => (
                  <TextField {...field} label="Role (Required for login access)" fullWidth select
                    value={field.value || ''}>
                    <MenuItem value="">No Login Access</MenuItem>
                    {roles.map(r => <MenuItem key={r.id} value={r.id}>{r.roleName}</MenuItem>)}
                  </TextField>
                )} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="username" control={control}
                render={({ field }) => <TextField {...field} label="Username" fullWidth placeholder="Auto: uses mobile if empty" />} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller name="password" control={control}
                render={({ field }) => <TextField {...field} label="Password" fullWidth type="password" placeholder="Default: changeme" />} />
            </Grid>
            <Grid item xs={12}>
              <Controller name="notes" control={control}
                render={({ field }) => <TextField {...field} label="Notes" fullWidth multiline rows={2} />} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? <CircularProgress size={20} color="inherit" /> : isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
