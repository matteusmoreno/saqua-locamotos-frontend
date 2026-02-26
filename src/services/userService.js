import api from './api';

const userService = {
  createCustomer: async (data) => {
    const response = await api.post('/users/customer/create', data);
    return response.data;
  },

  findById: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  findContractsByUserId: async (userId) => {
    const response = await api.get(`/users/${userId}/contracts`);
    return response.data;
  },

  findAllCustomers: async () => {
    const response = await api.get('/users/customers/all');
    return response.data;
  },

  updateCustomer: async (data) => {
    const response = await api.put('/users/update', data);
    return response.data;
  },

  uploadPicture: async (userId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/users/${userId}/upload-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePicture: async (userId) => {
    const response = await api.delete(`/users/${userId}/delete-picture`);
    return response.data;
  },

  uploadDocuments: async (userId, filesMap) => {
    // filesMap: { cnh: File, cpf: File, rg: File, proof_of_residence: File, ... }
    const formData = new FormData();
    Object.entries(filesMap).forEach(([key, file]) => formData.append(key, file));
    const response = await api.post(`/users/${userId}/upload-documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteDocuments: async (userId, types) => {
    // types: ['cnh', 'cpf', ...]
    const query = types.map((t) => `types=${encodeURIComponent(t)}`).join('&');
    const response = await api.delete(`/users/${userId}/delete-documents?${query}`);
    return response.data;
  },

  sendVerificationEmail: async (userId) => {
    const response = await api.post(`/users/${userId}/send-verification-email`);
    return response.data;
  },

  verifyEmail: async (token) => {
    const response = await api.get(`/users/verify-email`, { params: { token } });
    return response.data;
  },

  sendResetPasswordEmail: async (email) => {
    const response = await api.post(`/users/send-reset-password-email`, null, { params: { email } });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await api.post(`/users/reset-password`, { token, newPassword });
    return response.data;
  },
};

export default userService;
