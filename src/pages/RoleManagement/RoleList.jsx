import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Table, TableHead, TableBody,
  TableRow, TableCell, TableContainer, Paper, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput,
  Tooltip, Avatar, Stack,
} from '@mui/material';
import {
  MdAdd, MdEdit, MdDelete, MdContentCopy, MdPeople,
} from 'react-icons/md';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import * as roleService from '../../services/roleService';
import * as permissionService from '../../services/permissionService';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = { PaperProps: { style: { maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP, width: 300 } } };

export default function RoleList() {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState(null);
  const [form, setForm] = useState({ roleName: '', description: '', permissionIds: [] });
  const [copyTargetRole, setCopyTargetRole] = useState(null);
  const [copySourceId, setCopySourceId] = useState('');
  const navigate = useNavigate();

  useEffect(() => { fetchRoles(); fetchPermissions(); }, []);

  const fetchRoles = async () => {
    try { const data = await roleService.getRoles(); setRoles(data); }
    catch (e) { toast.error('Failed to load roles'); }
  };

  const fetchPermissions = async () => {
    try { const data = await permissionService.getPermissions(); setAllPermissions(data); }
    catch (e) { /* ignore */ }
  };

  const handleOpenCreate = () => {
    setEditRole(null);
    setForm({ roleName: '', description: '', permissionIds: [] });
    setDialogOpen(true);
  };

  const handleOpenEdit = (role) => {
    setEditRole(role);
    setForm({
      roleName: role.roleName, description: role.description || '',
      permissionIds: role.permissionIds || [],
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.roleName.trim()) { toast.error('Role name is required'); return; }
    try {
      if (editRole) { await roleService.updateRole(editRole.id, form); toast.success('Role updated'); }
      else { await roleService.createRole(form); toast.success('Role created'); }
      setDialogOpen(false); fetchRoles();
    } catch (e) { toast.error('Failed to save role'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try { await roleService.deleteRole(id); toast.success('Role deleted'); fetchRoles(); }
    catch (e) { toast.error('Failed to delete role'); }
  };

  const handleCopyOpen = (role) => {
    setCopyTargetRole(role);
    setCopySourceId('');
    setCopyDialogOpen(true);
  };

  const handleCopyPermissions = async () => {
    if (!copySourceId) { toast.error('Select a source role'); return; }
    try {
      await roleService.copyPermissionsFromRole(copyTargetRole.id, copySourceId);
      toast.success('Permissions copied');
      setCopyDialogOpen(false); fetchRoles();
    } catch (e) { toast.error('Failed to copy permissions'); }
  };

  const groupedPerms = allPermissions.reduce((acc, p) => {
    if (!acc[p.moduleName]) acc[p.moduleName] = [];
    acc[p.moduleName].push(p); return acc;
  }, {});

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={700}>Role Management</Typography>
        <Button variant="contained" startIcon={<MdAdd />} onClick={handleOpenCreate}>Create Role</Button>
      </Box>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer component={Paper} elevation={0}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Role Name</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Description</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Permissions</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Users</TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {roles.map(role => (
                  <TableRow key={role.id} hover>
                    <TableCell><Typography fontWeight={600}>{role.roleName}</Typography></TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      <Chip label={role.status} size="small" color={role.status === 'ACTIVE' ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {role.permissionIds?.length || 0} permissions
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={<MdPeople size={14} />}
                        label={role.userCount || 0}
                        size="small" variant="outlined"
                        onClick={() => navigate(`/members?roleId=${role.id}`)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip title="Copy permissions from another role">
                        <IconButton size="small" onClick={() => handleCopyOpen(role)}><MdContentCopy /></IconButton>
                      </Tooltip>
                      <IconButton size="small" onClick={() => handleOpenEdit(role)}><MdEdit /></IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(role.id)}><MdDelete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Role Name" value={form.roleName}
            onChange={e => setForm({ ...form, roleName: e.target.value })} sx={{ mt: 2, mb: 2 }} />
          <TextField fullWidth label="Description" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} multiline rows={2} sx={{ mb: 2 }} />
          <FormControl fullWidth>
            <InputLabel>Permissions</InputLabel>
            <Select multiple value={form.permissionIds}
              onChange={e => setForm({ ...form, permissionIds: e.target.value })}
              input={<OutlinedInput label="Permissions" />}
              renderValue={(selected) => `${selected.length} permissions selected`}
              MenuProps={MenuProps}>
              {Object.entries(groupedPerms).map(([module, perms]) => [
                <MenuItem key={module} disabled sx={{ opacity: 0.7, fontWeight: 700 }}>
                  <Typography variant="caption" fontWeight={700}>{module}</Typography>
                </MenuItem>,
                ...perms.map(p => (
                  <MenuItem key={p.id} value={p.id} sx={{ pl: 4 }}>
                    <Checkbox checked={form.permissionIds.indexOf(p.id) > -1} size="small" />
                    <ListItemText primary={p.permissionName} />
                  </MenuItem>
                ))
              ])}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>{editRole ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={copyDialogOpen} onClose={() => setCopyDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Copy Permissions</DialogTitle>
        <DialogContent>
          <Typography variant="body2" mb={2}>
            Copy permissions from another role to <strong>{copyTargetRole?.roleName}</strong>:
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Source Role</InputLabel>
            <Select value={copySourceId} onChange={e => setCopySourceId(e.target.value)} label="Source Role">
              {roles.filter(r => r.id !== copyTargetRole?.id).map(r => (
                <MenuItem key={r.id} value={r.id}>
                  {r.roleName} ({r.permissionIds?.length || 0} permissions, {r.userCount || 0} users)
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCopyPermissions}>Copy</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
