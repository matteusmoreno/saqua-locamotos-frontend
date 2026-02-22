import api from './api';

const contractService = {
  findAll: async () => {
    // Backend não possui GET /contracts/all — agrega a partir de cada cliente
    const customersRes = await api.get('/users/customers/all');
    const customers = Array.isArray(customersRes.data) ? customersRes.data : [];

    const contractArrays = await Promise.all(
      customers.map(async (customer) => {
        try {
          const res = await api.get(`/users/${customer.customerId}/contracts`);
          return Array.isArray(res.data) ? res.data : [];
        } catch {
          return [];
        }
      }),
    );

    const all = contractArrays.flat();
    const seen = new Set();
    return all.filter((c) => {
      if (!c.contractId || seen.has(c.contractId)) return false;
      seen.add(c.contractId);
      return true;
    });
  },

  create: async (data) => {
    const response = await api.post('/contracts/create', data);
    return response.data;
  },

  findById: async (contractId) => {
    const response = await api.get(`/contracts/${contractId}`);
    return response.data;
  },

  addFine: async (data) => {
    const response = await api.patch('/contracts/fine/add', data);
    return response.data;
  },

  payFine: async (contractId, fineId) => {
    const response = await api.patch(`/contracts/${contractId}/fine/${fineId}/pay`);
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
};

export default contractService;
