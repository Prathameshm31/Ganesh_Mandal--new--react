import apiClient from '../api/apiClient';

export const getRoles = () => apiClient.get('/roles').then(r => r.data);
export const getRoleById = (id) => apiClient.get(`/roles/${id}`).then(r => r.data);
export const getRoleUsers = (id) => apiClient.get(`/roles/${id}/users`).then(r => r.data);
export const createRole = (data) => apiClient.post('/roles', data).then(r => r.data);
export const updateRole = (id, data) => apiClient.put(`/roles/${id}`, data).then(r => r.data);
export const deleteRole = (id) => apiClient.delete(`/roles/${id}`).then(r => r.data);
export const copyPermissionsFromRole = (targetId, sourceId) =>
  apiClient.post(`/roles/${targetId}/copy-from/${sourceId}`).then(r => r.data);

export default { getRoles, getRoleById, getRoleUsers, createRole, updateRole, deleteRole, copyPermissionsFromRole };
