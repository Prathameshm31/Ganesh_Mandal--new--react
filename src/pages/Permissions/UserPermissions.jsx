import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel,
  Card, CardContent, Checkbox, FormGroup, FormControlLabel,
  Button, IconButton, Collapse, Chip, Grid, Alert, Snackbar,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Paper, Divider, Tooltip, CircularProgress
} from '@mui/material';
import {
  MdSearch, MdExpandMore, MdExpandLess, MdSelectAll, MdDeselect,
  MdContentCopy, MdRefresh, MdSave, MdPerson, MdAdminPanelSettings
} from 'react-icons/md';
import { toast } from 'react-toastify';
import apiClient from '../../api/apiClient';
import * as userPermissionService from '../../services/userPermissionService';
import * as roleService from '../../services/roleService';

export default function UserPermissions() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [permissionsData, setPermissionsData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModules, setExpandedModules] = useState({});
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [copyDialog, setCopyDialog] = useState({ open: false, type: null });

  useEffect(() => { fetchUsers(); fetchRoles(); }, []);

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get('/users').then(r => r.data);
      setUsers(data);
    } catch (e) { toast.error('Failed to load users'); }
  };

  const fetchRoles = async () => {
    try {
      const data = await roleService.getRoles();
      setRoles(data);
    } catch (e) { /* ignore */ }
  };

  const fetchUserPermissions = useCallback(async (userId) => {
    setLoading(true);
    try {
      const data = await userPermissionService.getUserPermissions(userId);
      setPermissionsData(data);
      const modules = {};
      data.modulePermissions.forEach(m => { modules[m.moduleName] = true; });
      setExpandedModules(modules);
    } catch (e) { toast.error('Failed to load permissions'); }
    finally { setLoading(false); }
  }, []);

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    setSelectedUser(user);
    fetchUserPermissions(userId);
  };

  const handleTogglePermission = (moduleName, permissionId) => {
    setPermissionsData(prev => {
      const updated = { ...prev };
      updated.modulePermissions = prev.modulePermissions.map(mod => {
        if (mod.moduleName !== moduleName) return mod;
        return {
          ...mod,
          permissions: mod.permissions.map(p => {
            if (p.permissionId !== permissionId) return p;
            return { ...p, allowed: !p.allowed, fromRole: false };
          })
        };
      });
      return updated;
    });
  };

  const handleSelectAll = (moduleName) => {
    setPermissionsData(prev => {
      const updated = { ...prev };
      updated.modulePermissions = prev.modulePermissions.map(mod => {
        if (mod.moduleName !== moduleName) return mod;
        return {
          ...mod,
          permissions: mod.permissions.map(p => ({ ...p, allowed: true, fromRole: false }))
        };
      });
      return updated;
    });
  };

  const handleDeselectAll = (moduleName) => {
    setPermissionsData(prev => {
      const updated = { ...prev };
      updated.modulePermissions = prev.modulePermissions.map(mod => {
        if (mod.moduleName !== moduleName) return mod;
        return {
          ...mod,
          permissions: mod.permissions.map(p => ({ ...p, allowed: false, fromRole: false }))
        };
      });
      return updated;
    });
  };

  const handleSave = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      const allowedIds = [];
      permissionsData.modulePermissions.forEach(mod => {
        mod.permissions.forEach(p => {
          if (p.allowed) allowedIds.push(p.permissionId);
        });
      });
      await userPermissionService.replaceAllPermissions(selectedUser.id, allowedIds);
      toast.success('Permissions saved successfully');
      fetchUserPermissions(selectedUser.id);
    } catch (e) { toast.error('Failed to save permissions'); }
    finally { setLoading(false); }
  };

  const handleCopyFromRole = async (roleId) => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await userPermissionService.copyPermissionsFromRole(selectedUser.id, roleId);
      toast.success('Permissions copied from role');
      fetchUserPermissions(selectedUser.id);
      setCopyDialog({ open: false, type: null });
    } catch (e) { toast.error('Failed to copy permissions'); }
    finally { setLoading(false); }
  };

  const handleCopyFromUser = async (sourceUserId) => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await userPermissionService.copyPermissionsFromUser(selectedUser.id, sourceUserId);
      toast.success('Permissions copied from user');
      fetchUserPermissions(selectedUser.id);
      setCopyDialog({ open: false, type: null });
    } catch (e) { toast.error('Failed to copy permissions'); }
    finally { setLoading(false); }
  };

  const handleReset = async () => {
    if (!selectedUser) return;
    setLoading(true);
    try {
      await userPermissionService.resetToRolePermissions(selectedUser.id);
      toast.success('Permissions reset to role defaults');
      fetchUserPermissions(selectedUser.id);
    } catch (e) { toast.error('Failed to reset permissions'); }
    finally { setLoading(false); }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.mobile?.includes(searchTerm)
  );

  const getModuleCheckedState = (modulePermissions) => {
    const total = modulePermissions.length;
    const checked = modulePermissions.filter(p => p.allowed).length;
    if (checked === 0) return 'none';
    if (checked === total) return 'all';
    return 'some';
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>User Permissions</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography fontWeight={600} mb={2}>Select User</Typography>
              <TextField
                fullWidth size="small" placeholder="Search by name, email or mobile..."
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <MdSearch style={{ marginRight: 8, opacity: 0.5 }} /> }}
                sx={{ mb: 2 }}
              />
              <Paper variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                {filteredUsers.map(u => (
                  <Box
                    key={u.id}
                    onClick={() => handleUserSelect(u.id)}
                    sx={{
                      p: 1.5, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                      borderBottom: '1px solid', borderColor: 'divider',
                      bgcolor: selectedUser?.id === u.id ? 'action.selected' : 'transparent',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <MdPerson style={{ fontSize: 20, opacity: 0.6 }} />
                    <Box>
                      <Typography variant="body2" fontWeight={600}>{u.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{u.email || u.mobile}</Typography>
                      {u.role && <Chip label={u.role} size="small" sx={{ ml: 1, height: 20, fontSize: 11 }} />}
                    </Box>
                  </Box>
                ))}
                {filteredUsers.length === 0 && (
                  <Typography p={2} color="text.secondary" textAlign="center">No users found</Typography>
                )}
              </Paper>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {!selectedUser ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <MdAdminPanelSettings style={{ fontSize: 48, opacity: 0.3 }} />
                <Typography color="text.secondary" mt={2}>Select a user to manage permissions</Typography>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2} flexWrap="wrap" gap={1}>
                  <Box>
                    <Typography fontWeight={600}>{permissionsData?.userName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Role: {permissionsData?.userRole || 'No role assigned'}
                    </Typography>
                  </Box>
                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Tooltip title="Copy from role">
                      <Button size="small" variant="outlined" startIcon={<MdContentCopy />}
                        onClick={() => setCopyDialog({ open: true, type: 'role' })}>
                        Copy Role
                      </Button>
                    </Tooltip>
                    <Tooltip title="Copy from another user">
                      <Button size="small" variant="outlined" startIcon={<MdContentCopy />}
                        onClick={() => setCopyDialog({ open: true, type: 'user' })}>
                        Copy User
                      </Button>
                    </Tooltip>
                    <Tooltip title="Reset to role defaults">
                      <Button size="small" variant="outlined" color="warning" startIcon={<MdRefresh />}
                        onClick={handleReset}>
                        Reset
                      </Button>
                    </Tooltip>
                    <Tooltip title="Save changes">
                      <Button size="small" variant="contained" startIcon={<MdSave />}
                        onClick={handleSave} disabled={loading}>
                        {loading ? <CircularProgress size={16} /> : 'Save'}
                      </Button>
                    </Tooltip>
                  </Box>
                </Box>

                <Divider sx={{ mb: 2 }} />

                {loading && !permissionsData ? (
                  <Box textAlign="center" py={4}><CircularProgress /></Box>
                ) : (
                  <Box sx={{ maxHeight: 500, overflow: 'auto', pr: 1 }}>
                    {permissionsData?.modulePermissions.map(mod => {
                      const checkedState = getModuleCheckedState(mod.permissions);
                      return (
                        <Box key={mod.moduleName} mb={1.5}>
                          <Box
                            display="flex" alignItems="center" justifyContent="space-between"
                            sx={{ cursor: 'pointer', py: 0.5 }}
                            onClick={() => setExpandedModules(prev => ({ ...prev, [mod.moduleName]: !prev[mod.moduleName] }))}
                          >
                            <Box display="flex" alignItems="center" gap={1}>
                              {expandedModules[mod.moduleName] ? <MdExpandLess /> : <MdExpandMore />}
                              <Typography fontWeight={600} fontSize={14}>{mod.moduleName}</Typography>
                              <Chip
                                label={checkedState === 'all' ? 'All' : checkedState === 'some' ? 'Partial' : 'None'}
                                size="small"
                                color={checkedState === 'all' ? 'success' : checkedState === 'some' ? 'warning' : 'default'}
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            </Box>
                            <Box>
                              <Button size="small" onClick={(e) => { e.stopPropagation(); handleSelectAll(mod.moduleName); }} sx={{ minWidth: 'auto', fontSize: 12 }}>
                                All
                              </Button>
                              <Button size="small" onClick={(e) => { e.stopPropagation(); handleDeselectAll(mod.moduleName); }} sx={{ minWidth: 'auto', fontSize: 12 }} color="error">
                                None
                              </Button>
                            </Box>
                          </Box>
                          <Collapse in={expandedModules[mod.moduleName]}>
                            <Box pl={4} display="flex" flexWrap="wrap" gap={0.5}>
                              {mod.permissions.map(p => (
                                <FormControlLabel
                                  key={p.permissionId}
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={p.allowed}
                                      onChange={() => handleTogglePermission(mod.moduleName, p.permissionId)}
                                      sx={{ py: 0.5 }}
                                    />
                                  }
                                  label={
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                      <Typography variant="body2">{p.permissionName}</Typography>
                                      {p.fromRole && (
                                        <Chip label="role" size="small" sx={{ height: 16, fontSize: 10 }} color="primary" variant="outlined" />
                                      )}
                                    </Box>
                                  }
                                  sx={{ mr: 0, width: { xs: '50%', sm: '33%', md: '25%' } }}
                                />
                              ))}
                            </Box>
                          </Collapse>
                          <Divider sx={{ mt: 1 }} />
                        </Box>
                      );
                    })}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <Dialog open={copyDialog.open} onClose={() => setCopyDialog({ open: false, type: null })} maxWidth="sm" fullWidth>
        <DialogTitle>
          {copyDialog.type === 'role' ? 'Copy Permissions from Role' : 'Copy Permissions from User'}
        </DialogTitle>
        <DialogContent>
          {copyDialog.type === 'role' ? (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Select Role</InputLabel>
              <Select
                value="" label="Select Role"
                onChange={(e) => handleCopyFromRole(e.target.value)}
              >
                {roles.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.roleName} - {r.description}</MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Select User</InputLabel>
              <Select
                value="" label="Select User"
                onChange={(e) => handleCopyFromUser(e.target.value)}
              >
                {users.filter(u => u.id !== selectedUser?.id).map(u => (
                  <MenuItem key={u.id} value={u.id}>{u.name} ({u.email || u.mobile})</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCopyDialog({ open: false, type: null })}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
