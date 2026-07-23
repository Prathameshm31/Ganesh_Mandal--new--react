import apiClient from '../api/apiClient';

export const getPermissions = () => apiClient.get('/permissions').then(r => r.data);
export const getPermissionById = (id) => apiClient.get(`/permissions/${id}`).then(r => r.data);
export const getPermissionsByModule = (moduleName) => apiClient.get(`/permissions/module/${moduleName}`).then(r => r.data);
export const createPermission = (data) => apiClient.post('/permissions', data).then(r => r.data);
export const updatePermission = (id, data) => apiClient.put(`/permissions/${id}`, data).then(r => r.data);
export const deletePermission = (id) => apiClient.delete(`/permissions/${id}`).then(r => r.data);

export default { getPermissions, getPermissionById, getPermissionsByModule, createPermission, updatePermission, deletePermission };
