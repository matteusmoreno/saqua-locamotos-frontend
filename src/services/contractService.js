import api from './api';

const contractService = {
  findAll: async () => {
    const response = await api.get('/contracts/all');
    return Array.isArray(response.data) ? response.data : [];
  },

  create: async (data) => {
    const response = await api.post('/contracts/create', data);
    return response.data;
  },

  findById: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  },

  finish: async (contractId, refundDeposit) => {
    const response = await api.patch(`/contracts/${contractId}/finish?refundDeposit=${refundDeposit}`);
    return response.data;
  },

  cancel: async (contractId) => {
    const response = await api.patch(`/contracts/${contractId}/cancel`);
    return response.data;
  },

  uploadFile: async (contractId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post(`/contracts/${contractId}/upload-file`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  generatePdf: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}/generate-pdf`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `contrato-${contractId}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

export default contractService;
