import { useState } from 'react';
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
} from '@mui/material';
import { MdCheckCircle, MdContentCopy } from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const paymentApps = [
  { name: 'Google Pay', icon: '📱', color: '#1A73E8' },
  { name: 'PhonePe', icon: '📲', color: '#5F259F' },
  { name: 'Paytm', icon: '💳', color: '#00BAF2' },
];

const generateTransactionId = () => `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

export default function OnlinePayment() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [successOpen, setSuccessOpen] = useState(false);
  const [transaction, setTransaction] = useState(null);

  const handlePay = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (!selectedApp) {
      toast.error('Please select a payment app');
      return;
    }
    setTransaction({
      id: generateTransactionId(),
      amount: Number(amount),
      app: selectedApp,
      date: new Date().toLocaleString('en-IN'),
    });
    setSuccessOpen(true);
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

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={handlePay}
        sx={{ py: 1.5, fontSize: 16 }}
      >
        Pay Now {amount ? `₹${Number(amount).toLocaleString('en-IN')}` : ''}
      </Button>

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
            Transaction ID: {transaction?.id}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Amount: ₹{transaction?.amount?.toLocaleString('en-IN')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Via: {transaction?.app}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Date: {transaction?.date}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button variant="contained" onClick={() => { setSuccessOpen(false); toast.info('Print receipt - Coming Soon'); }}>
            Print Receipt
          </Button>
          <Button onClick={() => { setSuccessOpen(false); setAmount(''); setSelectedApp(''); }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
