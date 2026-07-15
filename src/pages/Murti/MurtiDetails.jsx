import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid, Chip, Button, Avatar,
} from '@mui/material';
import { MdArrowBack, MdEdit, MdImage } from 'react-icons/md';
import { toast } from 'react-toastify';
import murtiService from '../../services/murtiService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

function DetailRow({ label, value }) {
  return (
    <Grid item xs={12} sm={6} md={4}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={600}>{value || '—'}</Typography>
    </Grid>
  );
}

export default function MurtiDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [murti, setMurti] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    murtiService.getMurtiById(id)
      .then(setMurti)
      .catch(err => { toast.error(err.message); navigate('/murti'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <LoadingSkeleton />;
  if (!murti) return null;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button startIcon={<MdArrowBack />} onClick={() => navigate('/murti')}>Back</Button>
          <Typography variant="h5" fontWeight={700}>{murti.murtiName}</Typography>
          <Chip label={murti.festivalYear} size="small" color="primary" variant="outlined" />
        </Box>
        <Button variant="contained" startIcon={<MdEdit />} onClick={() => navigate(`/murti/edit/${id}`)}>
          Edit
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              {murti.photoUrl ? (
                <Avatar
                  src={murti.photoUrl}
                  variant="rounded"
                  sx={{ width: '100%', height: 240, mb: 2, borderRadius: 2 }}
                />
              ) : (
                <Box sx={{ width: '100%', height: 240, mb: 2, borderRadius: 2, bgcolor: 'action.hover', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <MdImage size={64} color="#ccc" />
                </Box>
              )}
              <Typography variant="h6" fontWeight={700}>{murti.murtiName}</Typography>
              <Typography variant="body2" color="text.secondary">Festival Year {murti.festivalYear}</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Donor Information</Typography>
              <Grid container spacing={2}>
                <DetailRow label="Donated/Provided By" value={murti.donatedBy} />
                <DetailRow label="Mobile Number" value={murti.mobileNumber} />
                <Grid item xs={12}>
                  <Typography variant="caption" color="text.secondary">Address</Typography>
                  <Typography variant="body2" fontWeight={600}>{murti.address || '—'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Murti Details</Typography>
              <Grid container spacing={2}>
                <DetailRow label="Murti Height" value={murti.murtiHeight ? `${murti.murtiHeight} ft` : null} />
                <DetailRow label="Murti Type" value={murti.murtiType} />
                <DetailRow label="Artist/Sculptor" value={murti.artistName} />
                <DetailRow label="Workshop" value={murti.workshopName} />
                <DetailRow label="Installation Date" value={murti.installationDate} />
                <DetailRow label="Visarjan Date" value={murti.visarjanDate} />
                <DetailRow label="Estimated Cost" value={murti.estimatedCost != null ? `₹${murti.estimatedCost.toLocaleString()}` : null} />
                <DetailRow label="Sponsored" value={murti.isSponsored} />
                <DetailRow label="Donation Amount" value={murti.donationAmount != null ? `₹${murti.donationAmount.toLocaleString()}` : null} />
              </Grid>
            </CardContent>
          </Card>

          {murti.remarks && (
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} mb={1}>Remarks</Typography>
                <Typography variant="body2">{murti.remarks}</Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
