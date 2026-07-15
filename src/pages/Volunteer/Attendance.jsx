import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Button, TextField, Table, TableHead, TableBody,
  TableRow, TableCell, Card, CardContent, Stack,
  Chip, IconButton, Tooltip, MenuItem, Grid, FormControl, InputLabel, Select,
} from '@mui/material';
import { MdCheckCircle, MdCancel, MdSchedule, MdSearch, MdRefresh } from 'react-icons/md';
import { toast } from 'react-toastify';
import eventService from '../../services/eventService';
import volunteerService from '../../services/volunteerService';
import attendanceService from '../../services/attendanceService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

const currentYear = new Date().getFullYear().toString();

export default function Attendance() {
  const [events, setEvents] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stats, setStats] = useState(null);

  const loadEvents = useCallback(async () => {
    try {
      const data = await eventService.searchEvents({ festivalYear: yearFilter });
      setEvents(data);
    } catch (err) { toast.error(err.message); }
  }, [yearFilter]);

  const loadVolunteers = useCallback(async () => {
    try {
      const data = await volunteerService.searchVolunteers({ festivalYear: yearFilter, status: 'Active' });
      setVolunteers(data);
    } catch (err) { toast.error(err.message); }
  }, [yearFilter]);

  const loadAttendance = useCallback(async () => {
    if (!selectedEvent || !selectedDate) {
      setAttendance([]);
      return;
    }
    setLoading(true);
    try {
      const data = await attendanceService.getAttendanceByEventAndDate(selectedEvent, selectedDate);
      setAttendance(data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, [selectedEvent, selectedDate]);

  const loadStats = useCallback(async () => {
    try {
      const data = await attendanceService.getAttendanceStats(yearFilter);
      setStats(data);
    } catch (_) {}
  }, [yearFilter]);

  useEffect(() => { loadEvents(); loadVolunteers(); loadStats(); }, [loadEvents, loadVolunteers, loadStats]);
  useEffect(() => { loadAttendance(); }, [loadAttendance]);

  const getStatus = (volId) => {
    const a = attendance.find((x) => String(x.volunteerId) === String(volId));
    return a ? a.status : null;
  };

  const getAttendanceId = (volId) => {
    const a = attendance.find((x) => String(x.volunteerId) === String(volId));
    return a ? a.id : null;
  };

  const mark = async (volunteer, status) => {
    setSaving(true);
    try {
      await attendanceService.markAttendance({
        volunteerId: volunteer.id,
        eventId: selectedEvent,
        attendanceDate: selectedDate,
        status,
      });
      toast.success(`${volunteer.name} marked ${status}`);
      loadAttendance();
      loadStats();
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const selectedEventObj = events.find((e) => String(e.id) === String(selectedEvent));

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Attendance</Typography>
          <Typography variant="body2" color="text.secondary">Track volunteer attendance</Typography>
        </Box>
      </Stack>

      {stats && (
        <Grid container spacing={1.5} mb={2}>
          {[
            { label: 'Present', value: stats.present || 0, color: 'success' },
            { label: 'Absent', value: stats.absent || 0, color: 'error' },
            { label: 'Late', value: stats.late || 0, color: 'warning' },
            { label: 'Total Records', value: stats.total || 0, color: 'info' },
          ].map((s) => (
            <Grid item xs={3} key={s.label}>
              <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 1.5 }}>
                <Typography variant="h5" fontWeight={700} color={`${s.color}.main`}>{s.value}</Typography>
                <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Card variant="outlined" sx={{ borderRadius: 3, mb: 2 }}>
        <CardContent sx={{ pb: '8px !important' }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Event</InputLabel>
                <Select label="Event" value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)}>
                  <MenuItem value="">Select Event</MenuItem>
                  {events.map((e) => <MenuItem key={e.id} value={e.id}>{e.eventName} {e.date ? `(${e.date})` : ''}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField size="small" fullWidth label="Date" type="date" InputLabelProps={{ shrink: true }} value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </Grid>
            <Grid item xs={6} sm={2}>
              <TextField size="small" fullWidth select label="Year" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {Array.from({ length: 10 }, (_, i) => String(Number(currentYear) - 5 + i)).map((y) => <MenuItem key={y} value={y}>{y}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Button fullWidth variant="outlined" startIcon={<MdRefresh />} onClick={() => { loadAttendance(); loadStats(); }}>Refresh</Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {selectedEvent && (
        <Card variant="outlined" sx={{ borderRadius: 3 }}>
          {selectedEventObj && (
            <CardContent sx={{ pb: 0 }}>
              <Typography variant="subtitle1" fontWeight={600}>{selectedEventObj.eventName}</Typography>
              <Typography variant="caption" color="text.secondary">{selectedEventObj.date} | {selectedEventObj.startTime || ''}{selectedEventObj.endTime ? ` - ${selectedEventObj.endTime}` : ''} | {selectedEventObj.venue || 'No venue'}</Typography>
            </CardContent>
          )}
          {loading ? <LoadingSkeleton rows={5} /> : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Volunteer</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {volunteers.map((v) => {
                  const currentStatus = getStatus(v.id);
                  return (
                    <TableRow key={v.id} hover sx={{ '&:last-child td': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>{v.name}</Typography>
                      </TableCell>
                      <TableCell><Chip label={v.role || 'N/A'} size="small" variant="outlined" /></TableCell>
                      <TableCell>
                        <Typography variant="body2">{v.mobile}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        {currentStatus ? (
                          <Chip
                            label={currentStatus}
                            size="small"
                            color={currentStatus === 'Present' ? 'success' : currentStatus === 'Absent' ? 'error' : 'warning'}
                          />
                        ) : (
                          <Chip label="Not Marked" size="small" variant="outlined" color="default" />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" justifyContent="center" spacing={0.5}>
                          <Tooltip title="Mark Present">
                            <span>
                              <IconButton size="small" color="success" onClick={() => mark(v, 'Present')} disabled={saving || currentStatus === 'Present'}>
                                <MdCheckCircle size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Mark Late">
                            <span>
                              <IconButton size="small" color="warning" onClick={() => mark(v, 'Late')} disabled={saving || currentStatus === 'Late'}>
                                <MdSchedule size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                          <Tooltip title="Mark Absent">
                            <span>
                              <IconButton size="small" color="error" onClick={() => mark(v, 'Absent')} disabled={saving || currentStatus === 'Absent'}>
                                <MdCancel size={18} />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {volunteers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center"><Typography color="text.secondary" py={3}>No active volunteers for {yearFilter}</Typography></TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      {!selectedEvent && (
        <Card variant="outlined" sx={{ borderRadius: 3, p: 6, textAlign: 'center' }}>
          <MdSearch size={48} style={{ opacity: 0.3, marginBottom: 12 }} />
          <Typography color="text.secondary">Select an event and date to mark attendance</Typography>
        </Card>
      )}
    </Box>
  );
}
