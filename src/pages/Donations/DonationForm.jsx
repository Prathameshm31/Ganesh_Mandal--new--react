import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Autocomplete,
  CircularProgress,
} from '@mui/material';
import { toast } from 'react-toastify';
import { addDonation, updateDonation } from '../../services/donationService';
import { getAllMembers } from '../../services/memberService';

const paymentModes = ['Cash', 'UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer'];

export default function DonationForm({ open, onClose, donation, onSaved }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      memberId: '',
      amount: '',
      paymentMode: '',
      donationDate: new Date().toISOString().split('T')[0],
      collectorName: '',
      remarks: '',
    },
  });

  const selectedMemberId = watch('memberId');

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getAllMembers();
        setMembers(data);
      } catch {
        toast.error('Failed to load members');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open]);

  useEffect(() => {
    if (!open) {
      reset({
        memberId: '',
        amount: '',
        paymentMode: '',
        donationDate: new Date().toISOString().split('T')[0],
        collectorName: '',
        remarks: '',
      });
      return;
    }
    if (donation) {
      reset({
        memberId: donation.memberId || '',
        amount: donation.amount || '',
        paymentMode: donation.paymentMode || '',
        donationDate: donation.donationDate || '',
        collectorName: donation.collectorName || '',
        remarks: donation.remarks || '',
      });
    }
  }, [open, donation, reset]);

  const memberIdToMember = (id) => {
    if (!id) return null;
    return members.find((m) => m.id === id) || null;
  };

  const selectedMember = memberIdToMember(selectedMemberId);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const member = members.find((m) => m.id === data.memberId);
      const payload = {
        ...data,
        amount: Number(data.amount),
        memberName: member?.fullName || '',
        colony: member?.colony || '',
      };
      if (donation) {
        await updateDonation(donation.id, payload);
        toast.success('Donation updated successfully');
      } else {
        await addDonation(payload);
        toast.success('Donation added successfully');
      }
      onClose();
      if (onSaved) onSaved();
    } catch (err) {
      toast.error(err.message || 'Failed to save donation');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{donation ? 'Edit Donation' : 'Add Donation'}</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {loading ? (
            <CircularProgress sx={{ alignSelf: 'center', my: 4 }} />
          ) : (
            <>
              <Controller
                name="memberId"
                control={control}
                rules={{ required: 'Member is required' }}
                render={({ field }) => (
                  <Autocomplete
                    options={members}
                    getOptionLabel={(m) => `${m.id} - ${m.fullName} (${m.colony})`}
                    value={memberIdToMember(field.value)}
                    onChange={(_, val) => field.onChange(val ? val.id : '')}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Member"
                        error={!!errors.memberId}
                        helperText={errors.memberId?.message}
                      />
                    )}
                  />
                )}
              />
              {selectedMember && (
                <TextField label="Selected Member" value={selectedMember.fullName} size="small" InputProps={{ readOnly: true }} disabled />
              )}
              <TextField
                label="Amount (₹)"
                type="number"
                fullWidth
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 1, message: 'Amount must be positive' },
                })}
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
              <TextField
                label="Payment Mode"
                select
                fullWidth
                {...register('paymentMode', { required: 'Payment mode is required' })}
                error={!!errors.paymentMode}
                helperText={errors.paymentMode?.message}
              >
                {paymentModes.map((m) => (
                  <MenuItem key={m} value={m}>{m}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Donation Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('donationDate', { required: 'Date is required' })}
                error={!!errors.donationDate}
                helperText={errors.donationDate?.message}
              />
              <TextField
                label="Collector Name"
                fullWidth
                {...register('collectorName')}
              />
              <TextField
                label="Remarks"
                fullWidth
                multiline
                rows={3}
                {...register('remarks')}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={submitting}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={submitting || loading}>
            {submitting ? 'Saving...' : donation ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
