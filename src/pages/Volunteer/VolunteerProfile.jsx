import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Button, Card, CardContent, Stack, Chip, Avatar,
  Grid, Divider, Table, TableHead, TableBody, TableRow, TableCell,
  IconButton, Tooltip,
} from '@mui/material';
import { MdArrowBack, MdPhone, MdEmail, MdWhatsapp, MdEdit } from 'react-icons/md';
import { toast } from 'react-toastify';
import volunteerService from '../../services/volunteerService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function VolunteerProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await volunteerService.getVolunteerDetail(id);
      setDetail(data);
    } catch (err) {
      toast.error('Failed to load volunteer details');
      navigate('/volunteers/list');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <LoadingSkeleton rows={12} />;
  if (!detail) return null;

  const Row = ({ label, value }) => (
    <Grid item xs={12} sm={6}>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
      <Typography variant="body2" fontWeight={500}>{value || '-'}</Typography>
    </Grid>
  );

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={1} mb={2}>
        <IconButton onClick={() => navigate('/volunteers/list')}><MdArrowBack /></IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight={700}>{detail.name}</Typography>
          <Typography variant="body2" color="text.secondary">{detail.role} &middot; {detail.category}</Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {detail.mobile && (
            <>
              <Tooltip title="Call"><IconButton href={`tel:${detail.mobile}`}><MdPhone /></IconButton></Tooltip>
              <Tooltip title="WhatsApp"><IconButton href={`https://wa.me/${detail.mobile.replace(/[^0-9]/g,'')}`} target="_blank"><MdWhatsapp /></IconButton></Tooltip>
            </>
          )}
          {detail.email && <Tooltip title="Email"><IconButton href={`mailto:${detail.email}`}><MdEmail /></IconButton></Tooltip>}
          <Button variant="outlined" startIcon={<MdEdit />} onClick={() => navigate('/volunteers/list')}>Edit</Button>
        </Stack>
      </Stack>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ borderRadius: 3, textAlign: 'center', py: 3 }}>
            <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 1.5, bgcolor: '#2563eb', fontSize: 32 }}>
              {detail.name?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Chip label={detail.status} size="small" color={detail.status==='Active'?'success':'default'} sx={{ mb: 1 }} />
            <Typography variant="body2" fontWeight={500}>{detail.role}</Typography>
            <Typography variant="caption" color="text.secondary">{detail.category}</Typography>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Personal Information</Typography>
              <Grid container spacing={1.5}>
                <Row label="Full Name" value={detail.name} />
                <Row label="Gender" value={detail.gender} />
                <Row label="Date of Birth" value={detail.dateOfBirth} />
                <Row label="Blood Group" value={detail.bloodGroup} />
                <Row label="Mobile" value={detail.mobile} />
                <Row label="Email" value={detail.email} />
                <Row label="Emergency Contact" value={detail.emergencyContact} />
                <Row label="Aadhaar Number" value={detail.aadhaarNumber} />
                <Row label="Address" value={detail.address} />
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Committee & Role</Typography>
              <Grid container spacing={1.5}>
                <Row label="Festival Year" value={detail.festivalYear} />
                <Row label="Category" value={detail.category} />
                <Row label="Role" value={detail.role} />
                <Row label="Joining Date" value={detail.joiningDate} />
                <Row label="Availability" value={detail.availability} />
                <Row label="Experience" value={detail.experience} />
              </Grid>
            </CardContent>
          </Card>

          <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Skills</Typography>
              <Typography variant="body2">{detail.skills || 'No skills listed'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {detail.assignments?.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Assigned Events ({detail.assignments.length})</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Duty Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.assignments.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.eventName}</TableCell>
                        <TableCell><Chip label={a.role||detail.role} size="small" variant="outlined" /></TableCell>
                        <TableCell>{a.dutyDate||'-'}</TableCell>
                        <TableCell>{a.startTime}{a.endTime ? ` - ${a.endTime}` : ''}</TableCell>
                        <TableCell>{a.remarks||'-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        )}

        {detail.attendanceRecords?.length > 0 && (
          <Grid item xs={12}>
            <Card variant="outlined" sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>Attendance History ({detail.attendanceRecords.length})</Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Event</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Remarks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {detail.attendanceRecords.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell>{a.attendanceDate}</TableCell>
                        <TableCell>{a.eventName}</TableCell>
                        <TableCell>
                          <Chip label={a.status} size="small" color={a.status==='Present'?'success':a.status==='Late'?'warning':'error'} />
                        </TableCell>
                        <TableCell>{a.remarks||'-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
