import apiClient from '../api/apiClient';

export const getUserPermissions = (userId) => apiClient.get(`/user-permissions/${userId}`).then(r => r.data);
export const assignPermission = (userId, permissionId, isAllowed = true) =>
  apiClient.post(`/user-permissions/${userId}/assign`, { permissionId, isAllowed }).then(r => r.data);
export const removePermission = (userId, permissionId) =>
  apiClient.delete(`/user-permissions/${userId}/remove/${permissionId}`).then(r => r.data);
export const replaceAllPermissions = (userId, permissionIds) =>
  apiClient.put(`/user-permissions/${userId}/replace-all`, { permissionIds }).then(r => r.data);
export const copyPermissionsFromRole = (userId, roleId) =>
  apiClient.post(`/user-permissions/${userId}/copy-from-role/${roleId}`).then(r => r.data);
export const copyPermissionsFromUser = (targetUserId, sourceUserId) =>
  apiClient.post(`/user-permissions/${targetUserId}/copy-from-user/${sourceUserId}`).then(r => r.data);
export const resetToRolePermissions = (userId) =>
  apiClient.post(`/user-permissions/${userId}/reset`).then(r => r.data);
export const getPermissionDashboard = () =>
  apiClient.get('/user-permissions/dashboard').then(r => r.data);

export default {
  getUserPermissions, assignPermission, removePermission, replaceAllPermissions,
  copyPermissionsFromRole, copyPermissionsFromUser, resetToRolePermissions, getPermissionDashboard
};
