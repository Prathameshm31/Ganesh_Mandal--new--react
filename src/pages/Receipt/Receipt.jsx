import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import { MdPrint, MdDownload, MdArrowBack } from 'react-icons/md';
import { toast } from 'react-toastify';
import { getDonationById } from '../../services/donationService';

const printStyles = `
  @media print {
    body { margin: 0; padding: 0; }
    .no-print { display: none !important; }
    .receipt-actions { display: none !important; }
    @page { size: auto; margin: 15mm; }
  }
`;

export default function Receipt() {
  const { donationId } = useParams();
  const navigate = useNavigate();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'receipt-print-styles';
    style.textContent = printStyles;
    document.head.appendChild(style);
    return () => {
      const s = document.getElementById('receipt-print-styles');
      if (s) s.remove();
    };
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getDonationById(donationId);
        setDonation(data);
      } catch (err) {
        setError(err.message || 'Receipt not found');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [donationId]);

  const handlePrint = () => window.print();

  const handleDownloadPdf = () => {
    toast.info('PDF download - Coming Soon');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !donation) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error">{error || 'Receipt not found'}</Typography>
        <Button startIcon={<MdArrowBack />} onClick={() => navigate('/donations')} sx={{ mt: 2 }}>
          Back to Donations
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 }, maxWidth: 700, mx: 'auto' }}>
      <Box className="no-print" sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button startIcon={<MdArrowBack />} onClick={() => navigate('/donations')}>
          Back
        </Button>
        <Button variant="contained" startIcon={<MdPrint />} onClick={handlePrint}>
          Print
        </Button>
        <Button variant="outlined" startIcon={<MdDownload />} onClick={handleDownloadPdf}>
          Download PDF
        </Button>
      </Box>

      <Paper
        id="receipt"
        sx={{
          p: 4,
          border: '1px solid #e0e0e0',
          position: 'relative',
          '@media print': {
            boxShadow: 'none',
            border: 'none',
            p: 0,
          },
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              mx: 'auto',
              mb: 1,
              bgcolor: 'primary.main',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 28,
            }}
          >
            GM
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Ganesh Mandal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Donation Receipt
          </Typography>
        </Box>

        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, fontFamily: 'monospace', letterSpacing: 2 }}>
            {donation.receiptNumber}
          </Typography>
        </Box>

        <Box sx={{ borderTop: '2px dashed #e0e0e0', borderBottom: '2px dashed #e0e0e0', py: 3, mb: 3 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Member Name</Typography>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>{donation.memberName}</Typography>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">Address</Typography>
            <Typography variant="body1">{donation.colony}</Typography>
          </Box>

          <Box sx={{ textAlign: 'center', my: 3 }}>
            <Typography variant="body2" color="text.secondary">Donation Amount</Typography>
            <Typography variant="h3" sx={{ fontWeight: 800, color: 'primary.main' }}>
              ₹{donation.amount?.toLocaleString('en-IN')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="body2" color="text.secondary">Payment Mode</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{donation.paymentMode}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Donation Date</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{donation.donationDate}</Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Collected By</Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>{donation.collectorName || '-'}</Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="h6" sx={{ textAlign: 'center', fontStyle: 'italic', color: 'text.secondary', mb: 3 }}>
          Thank You for Your Generous Support!
        </Typography>

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Scan to Verify
          </Typography>
          <Box
            sx={{
              width: 100,
              height: 100,
              mx: 'auto',
              border: '1px solid #e0e0e0',
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#fafafa',
            }}
          >
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '3px', width: 70, height: 70, alignContent: 'center', justifyContent: 'center' }}>
              {Array.from({ length: 25 }).map((_, i) => (
                <Box key={i} sx={{ width: 10, height: 10, bgcolor: i % 2 === 0 ? '#333' : '#fff', borderRadius: '1px' }} />
              ))}
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Receipt #{donation.receiptNumber}
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}
