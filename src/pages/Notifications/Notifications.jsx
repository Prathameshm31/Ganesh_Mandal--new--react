import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Tabs, Tab, Paper, Card, CardContent, Grid, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, IconButton, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Stack, Tooltip, Pagination,
} from '@mui/material';
import {
  MdSend, MdRefresh, MdVisibility, MdDelete, MdEdit, MdAdd,
  MdWhatsapp, MdEmail, MdCheckCircle, MdError, MdHourglassEmpty,
  MdNotifications, MdMessage, MdClose,
} from 'react-icons/md';
import { toast } from 'react-toastify';
import notificationService from '../../services/notificationService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';
import { getAllEvents } from '../../services/eventService';
import { getAllMembers } from '../../services/memberService';

const CHANNELS = ['WhatsApp', 'Email'];
const RECEIVER_GROUPS = ['All Members', 'Volunteers', 'Sponsors', 'Specific Users'];
const NOTIFICATION_TYPES = [
  { value: 'Event_Creation', label: 'Event Creation' },
  { value: 'Reminder', label: 'Reminder' },
  { value: 'Registration', label: 'Registration' },
  { value: 'Donation', label: 'Donation' },
];

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function NotificationManagement() {
  const [tab, setTab] = useState(0);
  const [dashboard, setDashboard] = useState(null);
  const [history, setHistory] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [historyFilters, setHistoryFilters] = useState({ status: '', channel: '' });
  const [templateDialog, setTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    templateName: '', notificationType: '', whatsappTemplateId: '',
    emailSubject: '', emailBody: '', messageText: '', status: 'Active',
  });
  const [reminderDialog, setReminderDialog] = useState(false);
  const [reminderForm, setReminderForm] = useState({
    eventId: '', receiverGroup: 'All Members', receivers: [], channels: ['WhatsApp', 'Email'],
    customMessage: '', notificationType: 'Reminder',
  });
  const [events, setEvents] = useState([]);
  const [members, setMembers] = useState([]);
  const [detailDialog, setDetailDialog] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [historyPage, setHistoryPage] = useState(1);
  const [templatesPage, setTemplatesPage] = useState(1);
  const pageSize = 10;

  const loadDashboard = useCallback(async () => {
    try {
      const data = await notificationService.getNotificationDashboard();
      setDashboard(data);
    } catch { /* ignore */ }
  }, []);

  const loadHistory = useCallback(async () => {
    try {
      const filters = {};
      if (historyFilters.status) filters.status = historyFilters.status;
      if (historyFilters.channel) filters.channel = historyFilters.channel;
      const data = await notificationService.getNotificationHistory(filters);
      setHistory(data);
    } catch { /* ignore */ }
  }, [historyFilters]);

  const loadTemplates = useCallback(async () => {
    try {
      const data = await notificationService.getTemplates();
      setTemplates(data);
    } catch { /* ignore */ }
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([loadDashboard(), loadHistory(), loadTemplates()]);
    try { setEvents(await getAllEvents() || []); } catch {}
    try { setMembers(await getAllMembers() || []); } catch {}
    setLoading(false);
  }, [loadDashboard, loadHistory, loadTemplates]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleSendReminder = async () => {
    if (!reminderForm.eventId) {
      toast.warn('Please select an event');
      return;
    }
    if (!reminderForm.channels.length) {
      toast.warn('Please select at least one channel');
      return;
    }
    let receivers = reminderForm.receivers;
    if (reminderForm.receiverGroup === 'All Members') {
      receivers = members.map((m) => m.mobileNumber);
    } else if (reminderForm.receiverGroup === 'Volunteers') {
      receivers = members.filter((m) => m.occupation === 'Volunteer').map((m) => m.mobileNumber);
    }
    try {
      await notificationService.sendReminder({
        eventId: Number(reminderForm.eventId),
        notificationType: 'Reminder',
        receivers,
        channels: reminderForm.channels,
        customMessage: reminderForm.customMessage,
      });
      toast.success('Reminder sent successfully');
      setReminderDialog(false);
      setReminderForm({
        eventId: '', receiverGroup: 'All Members', receivers: [], channels: ['WhatsApp', 'Email'],
        customMessage: '', notificationType: 'Reminder',
      });
      setTimeout(() => loadHistory(), 500);
    } catch (err) {
      toast.error(err.message || 'Failed to send reminder');
    }
  };

  const handleResend = async (id) => {
    try {
      await notificationService.resendNotification(id);
      toast.success('Notification resent');
      loadHistory();
    } catch (err) {
      toast.error(err.message || 'Failed to resend');
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.templateName) {
      toast.warn('Template name is required');
      return;
    }
    try {
      if (editingTemplate) {
        await notificationService.updateTemplate(editingTemplate.id, templateForm);
        toast.success('Template updated');
      } else {
        await notificationService.createTemplate(templateForm);
        toast.success('Template created');
      }
      setTemplateDialog(false);
      setEditingTemplate(null);
      setTemplateForm({
        templateName: '', notificationType: '', whatsappTemplateId: '',
        emailSubject: '', emailBody: '', messageText: '', status: 'Active',
      });
      loadTemplates();
    } catch (err) {
      toast.error(err.message || 'Failed to save template');
    }
  };

  const handleEditTemplate = (t) => {
    setEditingTemplate(t);
    setTemplateForm({
      templateName: t.templateName || '', notificationType: t.notificationType || '',
      whatsappTemplateId: t.whatsappTemplateId || '', emailSubject: t.emailSubject || '',
      emailBody: t.emailBody || '', messageText: t.messageText || '', status: t.status || 'Active',
    });
    setTemplateDialog(true);
  };

  const handleDeleteTemplate = async (id) => {
    try {
      await notificationService.deleteTemplate(id);
      toast.success('Template deleted');
      loadTemplates();
    } catch (err) {
      toast.error(err.message || 'Failed to delete template');
    }
  };

  const handleViewDetail = async (id) => {
    try {
      const data = await notificationService.getNotificationById(id);
      setDetailData(data);
      setDetailDialog(true);
    } catch {
      toast.error('Failed to load detail');
    }
  };

  const paginate = (list, page) => list.slice((page - 1) * pageSize, page * pageSize);

  const statusChip = (status) => {
    const map = { Sent: 'success', Failed: 'error', Pending: 'warning' };
    return <Chip label={status} size="small" color={map[status] || 'default'} />;
  };

  const channelIcon = (ch) =>
    ch === 'WhatsApp' ? <MdWhatsapp style={{ color: '#25D366' }} /> :
    ch === 'Email' ? <MdEmail style={{ color: '#EA4335' }} /> : null;

  if (loading) return <LoadingSkeleton type="table" count={8} />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h5" fontWeight={700}>Notification Management</Typography>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" startIcon={<MdSend />} onClick={() => setReminderDialog(true)}>
            Send Reminder
          </Button>
          <Button variant="outlined" startIcon={<MdRefresh />} onClick={loadAll}>
            Refresh
          </Button>
        </Stack>
      </Box>

      {dashboard && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            { label: 'Total Sent', value: dashboard.totalSent, icon: MdNotifications, color: 'primary.main' },
            { label: 'WhatsApp', value: dashboard.whatsappSent, icon: MdWhatsapp, color: '#25D366' },
            { label: 'Email', value: dashboard.emailSent, icon: MdEmail, color: '#EA4335' },
            { label: 'Failed', value: dashboard.failed, icon: MdError, color: 'error.main' },
            { label: 'Pending', value: dashboard.pending, icon: MdHourglassEmpty, color: 'warning.main' },
            { label: "Today's", value: dashboard.todayCount, icon: MdMessage, color: 'info.main' },
          ].map((s) => (
            <Grid item xs={6} sm={4} md={2} key={s.label}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <s.icon size={28} style={{ color: s.color }} />
                  <Typography variant="h5" fontWeight={700}>{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.label}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tab label="Notification History" />
          <Tab label="Templates" />
        </Tabs>

        <Box sx={{ p: 2.5 }}>
          <TabPanel value={tab} index={0}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <TextField select size="small" label="Status" sx={{ minWidth: 140 }}
                value={historyFilters.status}
                onChange={(e) => { setHistoryFilters((p) => ({ ...p, status: e.target.value })); setHistoryPage(1); }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="Sent">Sent</MenuItem>
                <MenuItem value="Failed">Failed</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
              </TextField>
              <TextField select size="small" label="Channel" sx={{ minWidth: 140 }}
                value={historyFilters.channel}
                onChange={(e) => { setHistoryFilters((p) => ({ ...p, channel: e.target.value })); setHistoryPage(1); }}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="WhatsApp">WhatsApp</MenuItem>
                <MenuItem value="Email">Email</MenuItem>
              </TextField>
              {(historyFilters.status || historyFilters.channel) && (
                <Button size="small" startIcon={<MdClose />} onClick={() => { setHistoryFilters({ status: '', channel: '' }); setHistoryPage(1); }}>
                  Clear
                </Button>
              )}
            </Box>

            {history.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={6}>No notifications sent yet</Typography>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Type</TableCell>
                        <TableCell>Channel</TableCell>
                        <TableCell>Receiver</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Sent Time</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginate(history, historyPage).map((h) => (
                        <TableRow key={h.id} hover>
                          <TableCell>
                            <Chip label={h.notificationType?.replace(/_/g, ' ') || '-'} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              {channelIcon(h.channel)}
                              {h.channel}
                            </Box>
                          </TableCell>
                          <TableCell sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis' }}>{h.receiver}</TableCell>
                          <TableCell>{statusChip(h.status)}</TableCell>
                          <TableCell>{h.sentTime ? new Date(h.sentTime).toLocaleString() : '-'}</TableCell>
                          <TableCell>
                            <Tooltip title="View"><IconButton size="small" onClick={() => handleViewDetail(h.id)}><MdVisibility /></IconButton></Tooltip>
                            {h.status === 'Failed' && (
                              <Tooltip title="Resend"><IconButton size="small" color="primary" onClick={() => handleResend(h.id)}><MdRefresh /></IconButton></Tooltip>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {history.length > pageSize && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination count={Math.ceil(history.length / pageSize)} page={historyPage}
                      onChange={(_, v) => setHistoryPage(v)} color="primary" />
                  </Box>
                )}
              </>
            )}
          </TabPanel>

          <TabPanel value={tab} index={1}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<MdAdd />} onClick={() => { setEditingTemplate(null); setTemplateForm({ templateName: '', notificationType: '', whatsappTemplateId: '', emailSubject: '', emailBody: '', messageText: '', status: 'Active' }); setTemplateDialog(true); }}>
                Add Template
              </Button>
            </Box>
            {templates.length === 0 ? (
              <Typography color="text.secondary" textAlign="center" py={6}>No templates created yet</Typography>
            ) : (
              <>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Template Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>WhatsApp Template ID</TableCell>
                        <TableCell>Email Subject</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {paginate(templates, templatesPage).map((t) => (
                        <TableRow key={t.id} hover>
                          <TableCell sx={{ fontWeight: 600 }}>{t.templateName}</TableCell>
                          <TableCell>{t.notificationType?.replace(/_/g, ' ') || '-'}</TableCell>
                          <TableCell>{t.whatsappTemplateId || '-'}</TableCell>
                          <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.emailSubject || '-'}</TableCell>
                          <TableCell>{statusChip(t.status)}</TableCell>
                          <TableCell>
                            <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditTemplate(t)}><MdEdit /></IconButton></Tooltip>
                            <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteTemplate(t.id)}><MdDelete /></IconButton></Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {templates.length > pageSize && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                    <Pagination count={Math.ceil(templates.length / pageSize)} page={templatesPage}
                      onChange={(_, v) => setTemplatesPage(v)} color="primary" />
                  </Box>
                )}
              </>
            )}
          </TabPanel>
        </Box>
      </Paper>

      <Dialog open={reminderDialog} onClose={() => setReminderDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Reminder</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField select label="Select Event" value={reminderForm.eventId}
              onChange={(e) => setReminderForm((p) => ({ ...p, eventId: e.target.value }))} fullWidth>
              {events.map((e) => (
                <MenuItem key={e.id} value={e.id}>{e.eventName} - {e.date}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Send To" value={reminderForm.receiverGroup}
              onChange={(e) => setReminderForm((p) => ({ ...p, receiverGroup: e.target.value }))} fullWidth>
              {RECEIVER_GROUPS.map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
            </TextField>
            <TextField select label="Channel(s)" value={reminderForm.channels}
              onChange={(e) => setReminderForm((p) => ({ ...p, channels: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value }))}
              fullWidth SelectProps={{ multiple: true }}>
              {CHANNELS.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </TextField>
            <TextField label="Custom Message (optional)" value={reminderForm.customMessage}
              onChange={(e) => setReminderForm((p) => ({ ...p, customMessage: e.target.value }))}
              fullWidth multiline rows={4} placeholder="Enter your custom reminder message..." />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReminderDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSendReminder} startIcon={<MdSend />}>Send</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? 'Edit Template' : 'Add Template'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.5} sx={{ mt: 1 }}>
            <TextField label="Template Name" value={templateForm.templateName}
              onChange={(e) => setTemplateForm((p) => ({ ...p, templateName: e.target.value }))} fullWidth required />
            <TextField select label="Notification Type" value={templateForm.notificationType}
              onChange={(e) => setTemplateForm((p) => ({ ...p, notificationType: e.target.value }))} fullWidth>
              {NOTIFICATION_TYPES.map((t) => <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>)}
            </TextField>
            <TextField label="WhatsApp Template ID" value={templateForm.whatsappTemplateId}
              onChange={(e) => setTemplateForm((p) => ({ ...p, whatsappTemplateId: e.target.value }))} fullWidth />
            <TextField label="Email Subject" value={templateForm.emailSubject}
              onChange={(e) => setTemplateForm((p) => ({ ...p, emailSubject: e.target.value }))} fullWidth />
            <TextField label="Email Body (HTML)" value={templateForm.emailBody}
              onChange={(e) => setTemplateForm((p) => ({ ...p, emailBody: e.target.value }))} fullWidth multiline rows={3} />
            <TextField label="Message Text" value={templateForm.messageText}
              onChange={(e) => setTemplateForm((p) => ({ ...p, messageText: e.target.value }))} fullWidth multiline rows={3} />
            <TextField select label="Status" value={templateForm.status}
              onChange={(e) => setTemplateForm((p) => ({ ...p, status: e.target.value }))} fullWidth>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTemplate}>
            {editingTemplate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={detailDialog} onClose={() => setDetailDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Notification Detail</DialogTitle>
        <DialogContent>
          {detailData && (
            <Stack spacing={2}>
              <Box><Typography variant="caption" color="text.secondary">Type</Typography><Typography variant="body2" fontWeight={600}>{detailData.notificationType}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Channel</Typography><Typography variant="body2" fontWeight={600}>{detailData.channel}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Receiver</Typography><Typography variant="body2" fontWeight={600}>{detailData.receiver}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Status</Typography><Box sx={{ mt: 0.5 }}>{statusChip(detailData.status)}</Box></Box>
              {detailData.errorMessage && <Box><Typography variant="caption" color="error">Error</Typography><Typography variant="body2" color="error">{detailData.errorMessage}</Typography></Box>}
              <Box><Typography variant="caption" color="text.secondary">Sent Time</Typography><Typography variant="body2">{detailData.sentTime ? new Date(detailData.sentTime).toLocaleString() : '-'}</Typography></Box>
              <Box><Typography variant="caption" color="text.secondary">Message</Typography><Paper variant="outlined" sx={{ p: 1.5, mt: 0.5, bgcolor: 'grey.50', whiteSpace: 'pre-wrap', fontSize: 13 }}>{detailData.message}</Paper></Box>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          {detailData?.status === 'Failed' && (
            <Button startIcon={<MdRefresh />} onClick={() => { handleResend(detailData.id); setDetailDialog(false); }}>Resend</Button>
          )}
          <Button onClick={() => setDetailDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
