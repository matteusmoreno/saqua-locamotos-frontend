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
};

export default userService;
