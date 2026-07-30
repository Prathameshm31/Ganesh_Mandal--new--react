import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, TextField, Button, Grid,
  FormControl, InputLabel, Select, MenuItem, Alert, Stepper,
  Step, StepLabel, Paper, Divider, CircularProgress, Chip,
} from '@mui/material';
import {
  MdArrowBack, MdPayment, MdCheckCircle, MdPhoneAndroid,
  MdContentCopy, MdQrCode,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { createPaymentOrder, verifyPayment } from '../../services/paymentService';
import { toast } from 'react-toastify';

const donationTypes = [
  { value: 'GENERAL', label: 'General Donation', desc: 'Support the overall festival activities' },
  { value: 'GANESH_MURTI', label: 'Ganesh Murti', desc: 'Contribute towards the Ganesh idol' },
  { value: 'PRASAD', label: 'Prasad', desc: 'Sponsor food offerings' },
  { value: 'DECORATION', label: 'Decoration', desc: 'Help decorate the pandal' },
  { value: 'CULTURAL_PROGRAMS', label: 'Cultural Programs', desc: 'Support cultural events' },
  { value: 'ANNADAN', label: 'Annadan', desc: 'Food donation for the needy' },
  { value: 'VOLUNTEER_SUPPORT', label: 'Volunteer Support', desc: 'Support volunteer activities' },
  { value: 'OTHER', label: 'Other', desc: 'Any other purpose' },
];

const upiApps = [
  { id: 'gpay', name: 'Google Pay', package: 'com.google.android.apps.nbu.paisa.user', color: '#4285F4', icon: 'G' },
  { id: 'phonepe', name: 'PhonePe', package: 'com.phonepe.app', color: '#5F259F', icon: 'P' },
  { id: 'paytm', name: 'Paytm', package: 'net.one97.paytm', color: '#00BAF2', icon: 'T' },
  { id: 'bhim', name: 'BHIM UPI', package: 'in.org.npci.upiapp', color: '#11998E', icon: 'B' },
];

const steps = ['Donation Details', 'Choose Payment', 'Confirmation'];

export default function OnlineDonation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  const [form, setForm] = useState({
    donorName: user?.name || '',
    donorEmail: user?.email || '',
    donorMobile: user?.mobile || '',
    amount: '',
    donationType: 'GENERAL',
    notes: '',
  });

  const [order, setOrder] = useState(null);
  const [txnRef, setTxnRef] = useState('');

  const merchantUpiId = 'prathameshmangaonkar948@okhdfcbank';
  const merchantName = 'Hindavi Swarajya';

  const handleNext = async () => {
    if (activeStep === 0) {
      if (!form.amount || parseFloat(form.amount) <= 0) {
        toast.error('Please enter a valid amount');
        return;
      }
      if (!form.donorName?.trim()) {
        toast.error('Please enter your name');
        return;
      }
      setLoading(true);
      try {
        const result = await createPaymentOrder({
          amount: parseFloat(form.amount),
          donorName: form.donorName,
          donorEmail: form.donorEmail,
          donorMobile: form.donorMobile,
          donationType: form.donationType,
          paymentGateway: 'RAZORPAY',
          notes: form.notes,
        });
        setOrder(result);
        setActiveStep(1);
      } catch (e) {
        toast.error(e.response?.data?.message || 'Failed to create payment order');
      } finally {
        setLoading(false);
      }
    }
  };

  const getUpiDeepLink = (app) => {
    const pa = encodeURIComponent(merchantUpiId);
    const pn = encodeURIComponent(merchantName);
    const am = encodeURIComponent(form.amount);
    const tn = encodeURIComponent(`Donation-${order?.orderId || 'ORD'}`);
    const upiLink = `upi://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=INR`;

    switch (app.id) {
      case 'gpay':
        return `intent://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=INR#Intent;scheme=upi;package=${app.package};end`;
      case 'phonepe':
        return `phonepe://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=INR`;
      case 'paytm':
        return `paytmmp://pay?pa=${pa}&pn=${pn}&am=${am}&tn=${tn}&cu=INR`;
      default:
        return upiLink;
    }
  };

  const handleOpenApp = (app) => {
    setSelectedApp(app.id);
    const link = getUpiDeepLink(app);

    try {
      window.location.href = link;
      toast.info(`${app.name} opened. Complete payment in the app, then enter the UPI transaction reference below.`);
    } catch (e) {
      toast.error(`Could not open ${app.name}. Use UPI ID instead.`);
    }
  };

  const handleVerifyUpiPayment = async () => {
    if (!txnRef?.trim()) {
      toast.error('Please enter the UPI transaction reference');
      return;
    }
    setLoading(true);
    try {
      const vrf = {
        orderId: order.orderId,
        paymentId: 'UPI_' + txnRef.trim(),
        signature: 'upi_payment_' + Date.now(),
        gatewayResponse: JSON.stringify({
          upiTransactionId: txnRef.trim(),
          app: selectedApp,
          method: 'upi',
        }),
      };
      const result = await verifyPayment(vrf);
      setPaymentResult(result);
      setActiveStep(2);
      toast.success('Donation successful!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Verification failed. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  const copyUpiId = () => {
    navigator.clipboard.writeText(merchantUpiId).then(() => {
      toast.success('UPI ID copied!');
    });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Button startIcon={<MdArrowBack />} onClick={() => { activeStep === 0 ? navigate(-1) : setActiveStep(activeStep - 1); }} sx={{ mb: 2 }}>
        Back
      </Button>

      <Typography variant="h5" fontWeight={700} mb={1}>Online Donation</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Support Hindavi Swarajya Ganesh Festival. Your contribution helps us organize a grand celebration.
      </Typography>

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map(label => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
      </Stepper>

      {activeStep === 0 && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>Donor Information</Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Full Name *" value={form.donorName}
                  onChange={e => setForm(f => ({ ...f, donorName: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Email" value={form.donorEmail}
                  onChange={e => setForm(f => ({ ...f, donorEmail: e.target.value }))} />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Mobile" value={form.donorMobile}
                  onChange={e => setForm(f => ({ ...f, donorMobile: e.target.value }))} />
              </Grid>

              <Grid item xs={12}><Divider sx={{ my: 1 }} /></Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>Donation Details</Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField fullWidth label="Amount (₹) *" type="number" required
                  value={form.amount}
                  onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                  inputProps={{ min: 1 }} />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Donation Type</InputLabel>
                  <Select value={form.donationType} label="Donation Type"
                    onChange={e => setForm(f => ({ ...f, donationType: e.target.value }))}>
                    {donationTypes.map(t => (
                      <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography variant="caption" color="text.secondary">Pay via UPI</Typography>
                  <Typography variant="body2" fontWeight={600}>{merchantUpiId}</Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Notes (optional)" multiline rows={2}
                  value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'right' }}>
              <Button variant="contained" size="large" onClick={handleNext}
                disabled={loading} startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MdPayment />}>
                {loading ? 'Creating Order...' : `Continue to Pay ₹${form.amount || '0'}`}
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {activeStep === 1 && order && (
        <Card>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={1}>Pay with UPI</Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Select your preferred UPI app to pay <strong>₹{order.amount?.toLocaleString()}</strong>
            </Typography>

            <Grid container spacing={2} sx={{ mb: 4 }}>
              {upiApps.map(app => (
                <Grid item xs={6} md={3} key={app.id}>
                  <Paper
                    sx={{
                      p: 2, textAlign: 'center', cursor: 'pointer', transition: '0.2s',
                      border: selectedApp === app.id ? 2 : 0, borderColor: 'primary.main',
                      '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                    }}
                    onClick={() => handleOpenApp(app)}
                  >
                    <Box sx={{
                      width: 56, height: 56, borderRadius: 3, display: 'flex',
                      alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1,
                      bgcolor: app.color, color: '#fff', fontSize: 24, fontWeight: 800,
                    }}>
                      {app.icon}
                    </Box>
                    <Typography variant="body2" fontWeight={600}>{app.name}</Typography>
                    <Typography variant="caption" color="text.secondary">Tap to open</Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>

            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" fontWeight={600} mb={1}>
                <MdQrCode style={{ verticalAlign: 'middle', marginRight: 4 }} /> Or scan QR / use UPI ID
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{
                  width: 120, height: 120, bgcolor: '#fff', borderRadius: 2,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 1, borderColor: 'divider',
                }}>
                  <Typography variant="caption" color="text.secondary" textAlign="center">
                    UPI QR<br />(demo)
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={500}>UPI ID:</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" fontWeight={700} sx={{ fontFamily: 'monospace' }}>
                      {merchantUpiId}
                    </Typography>
                    <Button size="small" startIcon={<MdContentCopy />} onClick={copyUpiId}>Copy</Button>
                  </Box>
                </Box>
              </Box>
            </Paper>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              After completing payment, enter the UPI transaction reference below
            </Typography>

            <Grid container spacing={2} alignItems="flex-end">
              <Grid item xs={12} md={8}>
                <TextField fullWidth label="UPI Transaction Reference" value={txnRef}
                  onChange={e => setTxnRef(e.target.value)}
                  placeholder="e.g. HDFC123456789"
                  helperText="You can find this in your UPI app's transaction history" />
              </Grid>
              <Grid item xs={12} md={4}>
                <Button fullWidth variant="contained" size="large"
                  onClick={handleVerifyUpiPayment}
                  disabled={loading || !txnRef.trim()}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MdCheckCircle />}>
                  {loading ? 'Verifying...' : 'Confirm Payment'}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && paymentResult && (
        <Card>
          <CardContent sx={{ p: 3, textAlign: 'center' }}>
            <MdCheckCircle style={{ fontSize: 64, color: '#2e7d32' }} />
            <Typography variant="h5" fontWeight={700} mt={2}>Donation Successful!</Typography>
            <Typography variant="body1" color="text.secondary" mb={3}>
              Thank you for your generous contribution, {paymentResult.donorName || 'donor'}!
            </Typography>

            <Paper variant="outlined" sx={{ p: 3, mb: 3, maxWidth: 500, mx: 'auto', textAlign: 'left' }}>
              <Grid container spacing={1}>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Receipt Number</Typography><Typography variant="body2" fontWeight={600}>{paymentResult.receiptNumber || '-'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Amount</Typography><Typography variant="body2" fontWeight={600}>₹{paymentResult.amount?.toLocaleString()}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Donation Type</Typography><Typography variant="body2">{paymentResult.donationType || '-'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Payment ID</Typography><Typography variant="body2" sx={{ wordBreak: 'break-all' }}>{paymentResult.paymentId || '-'}</Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Status</Typography><Typography variant="body2"><Chip label={paymentResult.status} color="success" size="small" /></Typography></Grid>
                <Grid item xs={6}><Typography variant="caption" color="text.secondary">Date</Typography><Typography variant="body2">{paymentResult.paymentDate || paymentResult.createdAt?.substring(0, 10)}</Typography></Grid>
              </Grid>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="outlined" onClick={() => navigate(`/receipt/${paymentResult.collectionId || paymentResult.id}`)}>
                View Receipt
              </Button>
              <Button variant="outlined" onClick={() => navigate('/donations')}>View Donations</Button>
              <Button variant="contained" onClick={() => navigate('/')}>Go to Dashboard</Button>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
