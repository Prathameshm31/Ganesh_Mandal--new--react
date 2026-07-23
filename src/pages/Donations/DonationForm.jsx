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
  Box,
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
      transactionId: '',
      receiptNumber: '',
      collectorName: '',
      colony: '',
      collectionDate: new Date().toISOString().split('T')[0],
      remarks: '',
    },
  });

  const selectedMemberId = watch('memberId');

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setLoading(true);
      try {
        const rawData = await getAllMembers();
        const data = Array.isArray(rawData) ? rawData : (rawData?.content || []);
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
        transactionId: '',
        receiptNumber: '',
        collectorName: '',
        colony: '',
        collectionDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
      return;
    }
    if (donation) {
      reset({
        memberId: donation.memberId || '',
        amount: donation.amount || '',
        paymentMode: donation.paymentMode || '',
        transactionId: donation.transactionId || '',
        receiptNumber: donation.receiptNumber || '',
        collectorName: donation.collectorName || '',
        colony: donation.colony || '',
        collectionDate: donation.collectionDate || '',
        remarks: donation.remarks || '',
      });
    } else {
      reset({
        memberId: '',
        amount: '',
        paymentMode: '',
        transactionId: '',
        receiptNumber: '',
        collectorName: '',
        colony: '',
        collectionDate: new Date().toISOString().split('T')[0],
        remarks: '',
      });
    }
  }, [open, donation, reset]);

  const memberIdToMember = (id) => {
    if (!id) return null;
    return members.find((m) => String(m.id) === String(id)) || null;
  };

  const selectedMember = memberIdToMember(selectedMemberId);

  useEffect(() => {
    if (selectedMember) {
      setValue('colony', selectedMember.colony || '');
    }
  }, [selectedMember, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const member = members.find((m) => String(m.id) === String(data.memberId));
      const payload = {
        memberId: data.memberId ? Number(data.memberId) : null,
        amount: Number(data.amount),
        paymentMode: data.paymentMode,
        transactionId: data.transactionId || null,
        receiptNumber: data.receiptNumber || null,
        collectorName: data.collectorName || null,
        colony: data.colony || member?.colony || null,
        collectionDate: data.collectionDate || null,
        remarks: data.remarks || null,
        memberName: member?.name || '',
        memberMobile: member?.mobile || '',
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
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to save donation';
      toast.error(msg);
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
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Controller
                name="memberId"
                control={control}
                rules={{ required: 'Member is required' }}
                render={({ field }) => (
                  <Autocomplete
                    options={members}
                    getOptionLabel={(m) => `${m.id} - ${m.name} (${m.colony || ''})`}
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
                <TextField label="Selected Member" value={selectedMember.name} size="small" InputProps={{ readOnly: true }} disabled />
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
                label="Collection Date"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                {...register('collectionDate', { required: 'Date is required' })}
                error={!!errors.collectionDate}
                helperText={errors.collectionDate?.message}
              />
              <TextField
                label="Transaction ID"
                fullWidth
                {...register('transactionId')}
              />
              <TextField
                label="Receipt Number"
                fullWidth
                {...register('receiptNumber')}
              />
              <TextField
                label="Collector Name"
                fullWidth
                {...register('collectorName')}
              />
              <TextField
                label="Colony"
                fullWidth
                {...register('colony')}
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
            {submitting ? <CircularProgress size={20} color="inherit" /> : donation ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
