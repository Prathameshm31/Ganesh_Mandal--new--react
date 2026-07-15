import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { MdSave, MdNotifications } from 'react-icons/md';
import { toast } from 'react-toastify';
import settingService from '../../services/settingService';
import { getNotificationConfig, updateNotificationConfig } from '../../services/notificationService';
import LoadingSkeleton from '../../components/common/LoadingSkeleton';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mandal, setMandal] = useState({
    name: 'Shree Ganesh Mandal',
    registrationNumber: 'MAH/2020/GANESH/001',
    establishedYear: '1985',
    about: 'A community-driven Ganesh Mandal serving devotees since 1985. We organize grand Ganesh festival celebrations and various social initiatives throughout the year.',
  });

  const [contact, setContact] = useState({
    address: '123, Ganpati Chowk, Near Dagdusheth Mandir, Pune - 411001',
    phone: '+91 98765 43210',
    email: 'info@shreeganeshmandal.org',
    website: 'www.shreeganeshmandal.org',
  });

  const [bank, setBank] = useState({
    bankName: 'State Bank of India',
    accountNumber: '**** **** **** 1234',
    ifscCode: 'SBIN0001234',
    branch: 'Pune Main Branch',
  });

  const [upi, setUpi] = useState({ upiId: 'ganeshmandal@upi' });
  const [collectionGoal, setCollectionGoal] = useState('1000000');

  const [notifConfig, setNotifConfig] = useState({
    whatsappEnabled: false,
    emailEnabled: false,
    senderName: '',
    senderEmail: '',
    senderWhatsapp: '',
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    whatsappApiKey: '',
    whatsappApiUrl: '',
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await settingService.getAllSettings();
      if (settings.mandal_name) setMandal(prev => ({ ...prev, name: settings.mandal_name }));
      if (settings.registration_number) setMandal(prev => ({ ...prev, registrationNumber: settings.registration_number }));
      if (settings.established_year) setMandal(prev => ({ ...prev, establishedYear: settings.established_year }));
      if (settings.about) setMandal(prev => ({ ...prev, about: settings.about }));
      if (settings.address) setContact(prev => ({ ...prev, address: settings.address }));
      if (settings.phone) setContact(prev => ({ ...prev, phone: settings.phone }));
      if (settings.email) setContact(prev => ({ ...prev, email: settings.email }));
      if (settings.website) setContact(prev => ({ ...prev, website: settings.website }));
      if (settings.bank_name) setBank(prev => ({ ...prev, bankName: settings.bank_name }));
      if (settings.account_number) setBank(prev => ({ ...prev, accountNumber: settings.account_number }));
      if (settings.ifsc_code) setBank(prev => ({ ...prev, ifscCode: settings.ifsc_code }));
      if (settings.branch) setBank(prev => ({ ...prev, branch: settings.branch }));
      if (settings.upi_id) setUpi({ upiId: settings.upi_id });
      if (settings.collection_goal) setCollectionGoal(settings.collection_goal);
    } catch {
      // use defaults
    }
    try {
      const nc = await getNotificationConfig();
      if (nc) {
        setNotifConfig({
          whatsappEnabled: nc.whatsappEnabled || false,
          emailEnabled: nc.emailEnabled || false,
          senderName: nc.senderName || '',
          senderEmail: nc.senderEmail || '',
          senderWhatsapp: nc.senderWhatsapp || '',
          smtpHost: nc.smtpHost || '',
          smtpPort: nc.smtpPort || '',
          smtpUsername: nc.smtpUsername || '',
          smtpPassword: nc.smtpPassword || '',
          whatsappApiKey: nc.whatsappApiKey || '',
          whatsappApiUrl: nc.whatsappApiUrl || '',
        });
      }
    } catch {
      // use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const settings = {
        mandal_name: mandal.name,
        registration_number: mandal.registrationNumber,
        established_year: mandal.establishedYear,
        about: mandal.about,
        address: contact.address,
        phone: contact.phone,
        email: contact.email,
        website: contact.website,
        bank_name: bank.bankName,
        account_number: bank.accountNumber,
        ifsc_code: bank.ifscCode,
        branch: bank.branch,
        upi_id: upi.upiId,
        collection_goal: collectionGoal,
      };
      await settingService.updateSettings(settings);
      await updateNotificationConfig({
        whatsappEnabled: notifConfig.whatsappEnabled,
        emailEnabled: notifConfig.emailEnabled,
        senderName: notifConfig.senderName,
        senderEmail: notifConfig.senderEmail,
        senderWhatsapp: notifConfig.senderWhatsapp,
        smtpHost: notifConfig.smtpHost,
        smtpPort: notifConfig.smtpPort ? Number(notifConfig.smtpPort) : null,
        smtpUsername: notifConfig.smtpUsername,
        smtpPassword: notifConfig.smtpPassword,
        whatsappApiKey: notifConfig.whatsappApiKey,
        whatsappApiUrl: notifConfig.whatsappApiUrl,
      });
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Settings</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Mandal Information</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Mandal Name" value={mandal.name} onChange={e => setMandal({ ...mandal, name: e.target.value })} fullWidth />
                <TextField label="Registration Number" value={mandal.registrationNumber} onChange={e => setMandal({ ...mandal, registrationNumber: e.target.value })} fullWidth />
                <TextField label="Established Year" value={mandal.establishedYear} onChange={e => setMandal({ ...mandal, establishedYear: e.target.value })} fullWidth />
                <TextField label="About" value={mandal.about} onChange={e => setMandal({ ...mandal, about: e.target.value })} fullWidth multiline rows={3} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Contact Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Address" value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })} fullWidth multiline rows={2} />
                <TextField label="Phone" value={contact.phone} onChange={e => setContact({ ...contact, phone: e.target.value })} fullWidth />
                <TextField label="Email" value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })} fullWidth />
                <TextField label="Website" value={contact.website} onChange={e => setContact({ ...contact, website: e.target.value })} fullWidth />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Bank Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="Bank Name" value={bank.bankName} onChange={e => setBank({ ...bank, bankName: e.target.value })} fullWidth />
                <TextField label="Account Number" value={bank.accountNumber} onChange={e => setBank({ ...bank, accountNumber: e.target.value })} fullWidth />
                <TextField label="IFSC Code" value={bank.ifscCode} onChange={e => setBank({ ...bank, ifscCode: e.target.value })} fullWidth />
                <TextField label="Branch" value={bank.branch} onChange={e => setBank({ ...bank, branch: e.target.value })} fullWidth />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>UPI Details</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField label="UPI ID" value={upi.upiId} onChange={e => setUpi({ upiId: e.target.value })} fullWidth />
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Typography variant="body2">QR Code Placeholder</Typography>
                  <Typography variant="caption">Upload QR code image here</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} mb={2}>Collection Goal</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Collection Goal (₹)"
                  type="number"
                  value={collectionGoal}
                  onChange={e => setCollectionGoal(e.target.value)}
                  fullWidth
                  helperText="Set the annual collection target amount in rupees"
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <MdNotifications size={24} />
                <Typography variant="h6" fontWeight={600}>Notification Settings</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel control={<Switch checked={notifConfig.whatsappEnabled} onChange={(e) => setNotifConfig((p) => ({ ...p, whatsappEnabled: e.target.checked }))} />} label="Enable WhatsApp Notifications" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel control={<Switch checked={notifConfig.emailEnabled} onChange={(e) => setNotifConfig((p) => ({ ...p, emailEnabled: e.target.checked }))} />} label="Enable Email Notifications" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Sender Name" value={notifConfig.senderName} onChange={(e) => setNotifConfig((p) => ({ ...p, senderName: e.target.value }))} fullWidth helperText="Display name in messages" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Sender Email" value={notifConfig.senderEmail} onChange={(e) => setNotifConfig((p) => ({ ...p, senderEmail: e.target.value }))} fullWidth helperText="From email address" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField label="Sender WhatsApp Number" value={notifConfig.senderWhatsapp} onChange={(e) => setNotifConfig((p) => ({ ...p, senderWhatsapp: e.target.value }))} fullWidth helperText="WhatsApp sender number" />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 1 }}>SMTP Configuration</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="SMTP Host" value={notifConfig.smtpHost} onChange={(e) => setNotifConfig((p) => ({ ...p, smtpHost: e.target.value }))} fullWidth />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="SMTP Port" type="number" value={notifConfig.smtpPort} onChange={(e) => setNotifConfig((p) => ({ ...p, smtpPort: e.target.value }))} fullWidth />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="SMTP Username" value={notifConfig.smtpUsername} onChange={(e) => setNotifConfig((p) => ({ ...p, smtpUsername: e.target.value }))} fullWidth />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField label="SMTP Password" type="password" value={notifConfig.smtpPassword} onChange={(e) => setNotifConfig((p) => ({ ...p, smtpPassword: e.target.value }))} fullWidth />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mt: 1, mb: 1 }}>WhatsApp API Configuration</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="WhatsApp API URL" value={notifConfig.whatsappApiUrl} onChange={(e) => setNotifConfig((p) => ({ ...p, whatsappApiUrl: e.target.value }))} fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField label="WhatsApp API Key" type="password" value={notifConfig.whatsappApiKey} onChange={(e) => setNotifConfig((p) => ({ ...p, whatsappApiKey: e.target.value }))} fullWidth />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<MdSave />} onClick={handleSave} size="large" disabled={saving}>
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </Box>
    </Box>
  );
}
