import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Autocomplete,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { MdCheckCircle, MdContentCopy } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { addDonation } from '../../services/donationService';
import { getAllMembers } from '../../services/memberService';

const paymentApps = [
  { name: 'Google Pay', icon: '📱', color: '#1A73E8' },
  { name: 'PhonePe', icon: '📲', color: '#5F259F' },
  { name: 'Paytm', icon: '💳', color: '#00BAF2' },
];

const paymentModes = ['UPI', 'Google Pay', 'PhonePe', 'Paytm', 'Bank Transfer'];

export default function OnlinePayment() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedMember, setSelectedMember] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [collectorName, setCollectorName] = useState('');
  const [remarks, setRemarks] = useState('');
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);

  const [successOpen, setSuccessOpen] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoadingMembers(true);
      try {
        const rawData = await getAllMembers();
        const data = Array.isArray(rawData) ? rawData : (rawData?.content || []);
        setMembers(data);
      } catch {
        toast.error('Failed to load members');
      } finally {
        setLoadingMembers(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (selectedApp) {
      setPaymentMode(selectedApp);
    }
  }, [selectedApp]);

  const handlePay = async () => {
    if (!selectedMember) {
      toast.error('Please select a member');
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedApp) {
      toast.error('Please select a payment app');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        memberId: Number(selectedMember.id),
        amount: Number(amount),
        paymentMode: paymentMode,
        transactionId: transactionId || null,
        receiptNumber: receiptNumber || null,
        collectorName: collectorName || null,
        colony: selectedMember.colony || null,
        collectionDate: collectionDate || null,
        remarks: remarks || null,
        memberName: selectedMember.name || '',
        memberMobile: selectedMember.mobile || '',
      };
      const response = await addDonation(payload);
      setResult({
        id: response?.receiptNumber || receiptNumber || `TXN${Date.now()}`,
        amount: Number(amount),
        app: selectedApp,
        date: new Date().toLocaleString('en-IN'),
        memberName: selectedMember.name,
      });
      setSuccessOpen(true);
      setAmount('');
      setSelectedApp('');
      setPaymentMode('');
      setTransactionId('');
      setReceiptNumber('');
      setCollectorName('');
      setRemarks('');
      setCollectionDate(new Date().toISOString().split('T')[0]);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Failed to process payment';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUpi = () => {
    navigator.clipboard.writeText('mandal@upi');
    toast.success('UPI ID copied to clipboard');
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 3 }}>
        Online Payment
      </Typography>

      <Card sx={{ mb: 3, textAlign: 'center' }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Scan to Pay
          </Typography>
          <Box
            sx={{
              width: 180,
              height: 180,
              mx: 'auto',
              mb: 2,
              bgcolor: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ position: 'relative', width: 140, height: 140 }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  alignContent: 'center',
                  justifyContent: 'center',
                }}
              >
                {Array.from({ length: 49 }).map((_, i) => (
                  <Box
                    key={i}
                    sx={{
                      width: 12,
                      height: 12,
                      bgcolor: i % 2 === 0 ? '#1a1a1a' : '#fff',
                      borderRadius: '2px',
                    }}
                  />
                ))}
              </Box>
              <Box
                sx={{
                  position: 'absolute',
                  inset: '30%',
                  bgcolor: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main', fontSize: 10 }}>
                  GM
                </Typography>
              </Box>
            </Box>
          </Box>
          <Typography variant="body2" color="text.secondary">
            UPI ID:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
              mandal@upi
            </Typography>
            <Button size="small" onClick={handleCopyUpi} sx={{ minWidth: 32 }}>
              <MdContentCopy />
            </Button>
          </Box>
        </CardContent>
      </Card>

      {loadingMembers ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Select Member
          </Typography>
          <Autocomplete
            options={members}
            getOptionLabel={(m) => `${m.id} - ${m.name} (${m.colony || ''})`}
            value={selectedMember}
            onChange={(_, val) => setSelectedMember(val)}
            renderInput={(params) => (
              <TextField {...params} label="Member" placeholder="Search members..." sx={{ mb: 2 }} />
            )}
            sx={{ mb: 2 }}
          />

          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Pay with
          </Typography>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {paymentApps.map((app) => (
              <Grid item xs={4} key={app.name}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    textAlign: 'center',
                    border: selectedApp === app.name ? `2px solid ${app.color}` : '2px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: app.color },
                  }}
                  onClick={() => setSelectedApp(app.name)}
                >
                  <CardContent>
                    <Typography variant="h4" sx={{ mb: 0.5 }}>{app.icon}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{app.name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <TextField
            label="Amount (₹)"
            type="number"
            fullWidth
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Collection Date"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={collectionDate}
            onChange={(e) => setCollectionDate(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Transaction ID"
            fullWidth
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Receipt Number"
            fullWidth
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Collector Name"
            fullWidth
            value={collectorName}
            onChange={(e) => setCollectorName(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Remarks"
            fullWidth
            multiline
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={handlePay}
            disabled={submitting}
            sx={{ py: 1.5, fontSize: 16 }}
          >
            {submitting ? <CircularProgress size={24} color="inherit" /> : `Pay Now ${amount ? `₹${Number(amount).toLocaleString('en-IN')}` : ''}`}
          </Button>
        </>
      )}

      <Button variant="text" fullWidth sx={{ mt: 1 }} onClick={() => navigate('/donations')}>
        Back to Donations
      </Button>

      <Dialog open={successOpen} onClose={() => setSuccessOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}>
          <MdCheckCircle style={{ fontSize: 64, color: '#2E7D32' }} />
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#2E7D32', mb: 2 }}>
            Payment Successful!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Receipt: {result?.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Member: {result?.memberName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: ₹{result?.amount?.toLocaleString('en-IN')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Via: {result?.app}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Date: {result?.date}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="contained" onClick={() => { setSuccessOpen(false); toast.info('Print receipt - Coming Soon'); }}>
            Print Receipt
          </Button>
          <Button onClick={() => setSuccessOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
