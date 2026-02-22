import api from './api';

const paymentService = {

  create: async (data) => {
    const response = await api.post('/payments/create', data);
    return response.data;
  },

  findById: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  findByContractId: async (contractId) => {
    const response = await api.get(`/payments/contract/${contractId}`);
    return response.data;
  },

  registerPayment: async (data) => {
    const response = await api.patch('/payments/register', data);
    return response.data;
  },

  deletePayment: async (paymentId) => {
    await api.delete(`/payments/${paymentId}`);
  },
};

export default paymentService;
