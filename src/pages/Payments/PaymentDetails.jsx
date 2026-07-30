import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Card, CardContent, Typography, Grid, Button, Chip, Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, CircularProgress, Alert, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions,
} from '@mui/material';
import {
  MdArrowBack, MdVerified, MdReceipt, MdRefresh,
  MdCheckCircle, MdError, MdHistory,
} from 'react-icons/md';
import {
  getPaymentById, getPaymentAuditLogs, verifyWithGateway,
} from '../../services/paymentService';
import { toast } from 'react-toastify';

const statusColors = {
  PENDING: 'warning', PROCESSING: 'info', SUCCESS: 'success',
  FAILED: 'error', CANCELLED: 'default', REFUNDED: 'secondary',
};

export default function PaymentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payment, setPayment] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  useEffect(() => {
    loadPayment();
    loadAuditLogs();
  }, [id]);

  const loadPayment = async () => {
    try {
      const data = await getPaymentById(id);
      setPayment(data);
    } catch (e) {
      console.error('Failed to load payment:', e);
      toast.error('Failed to load payment details');
    } finally {
      setLoading(false);
    }
  };

  const loadAuditLogs = async () => {
    try {
      const data = await getPaymentAuditLogs(id);
      setAuditLogs(data);
    } catch (e) {
      console.error('Failed to load audit logs:', e);
    }
  };

  const handleVerifyWithGateway = async () => {
    setVerifying(true);
    setConfirmDialog(false);
    try {
      const result = await verifyWithGateway(id);
      setPayment(result);
      toast.success('Payment verification completed');
      loadAuditLogs();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!payment) {
    return <Alert severity="error">Payment not found</Alert>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<MdArrowBack />} onClick={() => navigate('/admin/payments')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>Payment Details</Typography>
        <Chip label={payment.status} color={statusColors[payment.status] || 'default'} sx={{ fontWeight: 600 }} />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Payment Information</Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}><InfoItem label="Receipt Number" value={payment.receiptNumber || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Order ID" value={payment.orderId || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Payment ID" value={payment.paymentId || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Transaction ID" value={payment.transactionId || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Amount" value={`₹${payment.amount?.toLocaleString() || '0'}`} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Donation Type" value={payment.donationType || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Payment Gateway" value={payment.paymentGateway || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Payment Method" value={payment.paymentMethod || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Payment Date" value={payment.paymentDate || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Created At" value={payment.createdAt || '-'} /></Grid>
                <Grid item xs={6} md={3}><InfoItem label="Gateway Status" value={payment.gatewayStatus || '-'} /></Grid>
                <Grid item xs={6} md={3}>
                  <InfoItem label="Signature Verified" value={payment.signatureVerified ? 'Yes' : 'No'} />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Donor Details</Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}><InfoItem label="Name" value={payment.donorName || '-'} /></Grid>
                <Grid item xs={4}><InfoItem label="Email" value={payment.donorEmail || '-'} /></Grid>
                <Grid item xs={4}><InfoItem label="Mobile" value={payment.donorMobile || '-'} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdVerified /> Verification & Notifications
                </Box>
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}><InfoItem label="Receipt Generated" value={payment.receiptGenerated ? 'Yes' : 'No'} /></Grid>
                <Grid item xs={3}><InfoItem label="Email Sent" value={payment.emailSent ? 'Yes' : 'No'} /></Grid>
                <Grid item xs={3}><InfoItem label="WhatsApp Sent" value={payment.whatsappSent ? 'Yes' : 'No'} /></Grid>
                <Grid item xs={3}><InfoItem label="Webhook Received" value={payment.webhookReceived ? 'Yes' : 'No'} /></Grid>
                <Grid item xs={6}><InfoItem label="Verified By" value={payment.verifiedBy || '-'} /></Grid>
                <Grid item xs={6}><InfoItem label="Verified At" value={payment.verifiedAt || '-'} /></Grid>
              </Grid>
            </CardContent>
          </Card>

          {payment.gatewayResponse && payment.gatewayResponse !== 'null' && (
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1}>Gateway Response</Typography>
                <Typography variant="body2" color="text.secondary" sx={{
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all',
                  p: 2, bgcolor: 'grey.50', borderRadius: 1, maxHeight: 200, overflow: 'auto',
                }}>
                  {typeof payment.gatewayResponse === 'string'
                    ? payment.gatewayResponse
                    : JSON.stringify(payment.gatewayResponse, null, 2)}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Actions</Typography>
              <Button
                fullWidth variant="contained" color="primary"
                startIcon={verifying ? <CircularProgress size={18} color="inherit" /> : <MdRefresh />}
                onClick={() => setConfirmDialog(true)}
                disabled={verifying}
                sx={{ mb: 2 }}
              >
                {verifying ? 'Verifying...' : 'Verify Payment with Gateway'}
              </Button>

              {payment.receiptGenerated && (
                <Button fullWidth variant="outlined" startIcon={<MdReceipt />}
                  onClick={() => navigate(`/receipt/${payment.collectionId || payment.id}`)}>
                  View Receipt
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MdHistory /> Audit Log
                </Box>
              </Typography>
              {auditLogs.length > 0 ? (
                <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
                  {auditLogs.map((log, i) => (
                    <Box key={log.id || i} sx={{
                      p: 1.5, mb: 1, borderRadius: 1,
                      bgcolor: log.action?.includes('SUCCESS') || log.newStatus === 'SUCCESS' ? '#e8f5e9' :
                               log.action?.includes('FAILED') || log.newStatus === 'FAILED' ? '#fbe9e7' : '#f5f5f5',
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" fontWeight={700} color="primary">{log.action}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {log.createdAt?.substring(0, 19)?.replace('T', ' ')}
                        </Typography>
                      </Box>
                      {log.previousStatus && log.newStatus && (
                        <Typography variant="caption" display="block">
                          {log.previousStatus} → {log.newStatus}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block">
                        {log.details || ''}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        By: {log.performedBy || 'system'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No audit logs available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={confirmDialog} onClose={() => setConfirmDialog(false)}>
        <DialogTitle>Verify Payment with Gateway</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will query the payment gateway ({payment.paymentGateway}) for the latest status of this payment.
            The system will automatically update the payment status and generate the receipt if the gateway confirms success.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialog(false)}>Cancel</Button>
          <Button onClick={handleVerifyWithGateway} variant="contained" color="primary">
            Verify Now
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

function InfoItem({ label, value }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value}</Typography>
    </Box>
  );
}
