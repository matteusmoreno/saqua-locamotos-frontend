import api from './api';

const motorcycleService = {
  create: async (data) => {
    const response = await api.post('/motorcycles/create', data);
    return response.data;
  },

  findById: async (motorcycleId) => {
    const response = await api.get(`/motorcycles/${motorcycleId}`);
    return response.data;
  },

  findContractsByMotorcycleId: async (motorcycleId) => {
    const response = await api.get(`/motorcycles/${motorcycleId}/contracts`);
    return response.data;
  },

  findAll: async () => {
    const response = await api.get('/motorcycles/all');
    return response.data;
  },

  findAllAvailable: async () => {
    const response = await api.get('/motorcycles/all/available');
    return response.data;
  },

  update: async (data) => {
    const response = await api.put('/motorcycles/update', data);
    return response.data;
  },

  disable: async (motorcycleId) => {
    const response = await api.patch(`/motorcycles/${motorcycleId}/disable`);
    return response.data;
  },

  enable: async (motorcycleId) => {
    const response = await api.patch(`/motorcycles/${motorcycleId}/enable`);
    return response.data;
  },

  uploadPicture: async (motorcycleId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/motorcycles/${motorcycleId}/upload-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deletePicture: async (motorcycleId) => {
    const response = await api.delete(`/motorcycles/${motorcycleId}/delete-picture`);
    return response.data;
  },

  uploadDocument: async (motorcycleId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/motorcycles/${motorcycleId}/upload-document`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteDocument: async (motorcycleId) => {
    const response = await api.delete(`/motorcycles/${motorcycleId}/delete-document`);
    return response.data;
  },
};

export default motorcycleService;
