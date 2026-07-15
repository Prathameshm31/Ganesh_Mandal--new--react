import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, TextField, Button, Grid,
  MenuItem, Stack,
} from '@mui/material';
import { MdSave, MdArrowBack, MdCloudUpload } from 'react-icons/md';
import { toast } from 'react-toastify';
import murtiService from '../../services/murtiService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const murtiTypes = ['Clay', 'POP', 'Eco-Friendly', 'Fiber', 'Wood', 'Brass', 'Marble', 'Other'];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 10 }, (_, i) => String(currentYear - 5 + i));

const emptyForm = {
  festivalYear: String(currentYear),
  murtiName: '',
  donatedBy: '',
  mobileNumber: '',
  address: '',
  murtiHeight: '',
  murtiType: '',
  artistName: '',
  workshopName: '',
  installationDate: '',
  visarjanDate: '',
  estimatedCost: '',
  isSponsored: 'No',
  donationAmount: '',
  photoUrl: '',
  remarks: '',
};

export default function MurtiForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      murtiService.getMurtiById(id)
        .then(data => setForm({
          ...emptyForm,
          ...data,
          estimatedCost: data.estimatedCost != null ? String(data.estimatedCost) : '',
          donationAmount: data.donationAmount != null ? String(data.donationAmount) : '',
        }))
        .catch(err => { toast.error(err.message); navigate('/murti'); })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, navigate]);

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await murtiService.uploadMurtiPhoto(file);
      setForm(prev => ({ ...prev, photoUrl: url }));
      toast.success('Photo uploaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        estimatedCost: form.estimatedCost ? Number(form.estimatedCost) : null,
        donationAmount: form.donationAmount ? Number(form.donationAmount) : null,
      };
      if (isEdit) {
        await murtiService.updateMurti(id, payload);
        toast.success('Murti record updated');
      } else {
        await murtiService.createMurti(payload);
        toast.success('Murti record created');
      }
      navigate('/murti');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Button startIcon={<MdArrowBack />} onClick={() => navigate('/murti')}>Back</Button>
        <Typography variant="h5" fontWeight={700}>
          {isEdit ? 'Edit Murti Record' : 'Add Murti Record'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={4}>
                <TextField label="Festival Year" select value={form.festivalYear} onChange={handleChange('festivalYear')} fullWidth required>
                  {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField label="Murti Name" value={form.murtiName} onChange={handleChange('murtiName')} fullWidth required />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="Donated/Provided By" value={form.donatedBy} onChange={handleChange('donatedBy')} fullWidth />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Mobile Number" value={form.mobileNumber} onChange={handleChange('mobileNumber')} fullWidth />
              </Grid>

              <Grid item xs={12}>
                <TextField label="Address" value={form.address} onChange={handleChange('address')} fullWidth multiline rows={2} />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField label="Murti Height (Feet)" value={form.murtiHeight} onChange={handleChange('murtiHeight')} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Murti Type" select value={form.murtiType} onChange={handleChange('murtiType')} fullWidth>
                  {murtiTypes.map(t => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Artist/Sculptor Name" value={form.artistName} onChange={handleChange('artistName')} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Workshop Name" value={form.workshopName} onChange={handleChange('workshopName')} fullWidth />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField label="Installation Date" type="date" value={form.installationDate} onChange={handleChange('installationDate')} InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Visarjan Date" type="date" value={form.visarjanDate} onChange={handleChange('visarjanDate')} InputLabelProps={{ shrink: true }} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Estimated Cost (₹)" type="number" value={form.estimatedCost} onChange={handleChange('estimatedCost')} fullWidth />
              </Grid>
              <Grid item xs={12} sm={3}>
                <TextField label="Sponsored" select value={form.isSponsored} onChange={handleChange('isSponsored')} fullWidth>
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField label="Donation Amount (₹)" type="number" value={form.donationAmount} onChange={handleChange('donationAmount')} fullWidth />
              </Grid>

              <Grid item xs={12} sm={9}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label" startIcon={<MdCloudUpload />} disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload Murti Photo'}
                    <input type="file" hidden accept="image/*" onChange={handlePhotoUpload} />
                  </Button>
                  {form.photoUrl && (
                    <Typography variant="caption" color="text.secondary">Photo uploaded</Typography>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12}>
                <TextField label="Remarks" value={form.remarks} onChange={handleChange('remarks')} fullWidth multiline rows={2} />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" onClick={() => navigate('/murti')}>Cancel</Button>
          <Button variant="contained" startIcon={<MdSave />} type="submit" disabled={saving}>
            {saving ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </Button>
        </Box>
      </form>
    </Box>
  );
}
