import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'react-toastify';
import { addMember, updateMember } from '../../services/memberService';
import { colonyService } from '../../services';

const defaultValues = {
  fullName: '',
  mobileNumber: '',
  whatsappNumber: '',
  email: '',
  address: '',
  colony: '',
  area: '',
  houseNumber: '',
  familyMembers: 1,
  occupation: '',
  status: 'Active',
  notes: '',
};

export default function MemberForm({ open, onClose, member, onSaved }) {
  const [colonies, setColonies] = useState([]);
  const isEdit = Boolean(member);

  useEffect(() => {
    if (open) {
      colonyService.getColonies().then(setColonies).catch(() => {});
    }
  }, [open]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues });

  useEffect(() => {
    if (member) {
      reset({
        fullName: member.fullName || '',
        mobileNumber: member.mobileNumber || '',
        whatsappNumber: member.whatsappNumber || '',
        email: member.email || '',
        address: member.address || '',
        colony: member.colony || '',
        area: member.area || '',
        houseNumber: member.houseNumber || '',
        familyMembers: member.familyMembers || 1,
        occupation: member.occupation || '',
        status: member.status || 'Active',
        notes: member.notes || '',
      });
    } else {
      reset(defaultValues);
    }
  }, [member, reset]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        await updateMember(member.id, data);
        toast.success('Member updated successfully');
      } else {
        await addMember(data);
        toast.success('Member added successfully');
      }
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to save member');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? 'Edit Member' : 'Add Member'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Controller
                name="fullName"
                control={control}
                rules={{ required: 'Full name is required' }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Full Name"
                    fullWidth
                    required
                    error={Boolean(errors.fullName)}
                    helperText={errors.fullName?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="mobileNumber"
                control={control}
                rules={{
                  required: 'Mobile number is required',
                  pattern: { value: /^\d{10}$/, message: 'Must be 10 digits' },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Mobile Number"
                    fullWidth
                    required
                    error={Boolean(errors.mobileNumber)}
                    helperText={errors.mobileNumber?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="whatsappNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="WhatsApp Number" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="email"
                control={control}
                rules={{
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Email"
                    fullWidth
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="address"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Address" fullWidth multiline rows={2} />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="colony"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Colony" fullWidth select>
                    <MenuItem value="">Select Colony</MenuItem>
                    {colonies.map((c) => (
                      <MenuItem key={c.id} value={c.name}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="area"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Area" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="houseNumber"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="House Number" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="familyMembers"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Family Members"
                    type="number"
                    fullWidth
                    inputProps={{ min: 1 }}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="occupation"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Occupation" fullWidth />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Status" fullWidth select>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                )}
              />
            </Grid>
            <Grid item xs={12}>
              <Controller
                name="notes"
                control={control}
                render={({ field }) => (
                  <TextField {...field} label="Notes" fullWidth multiline rows={3} />
                )}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
