import api from './api';

const expenseService = {
  create: async (data) => {
    const response = await api.post('/expenses/create', data);
    return response.data;
  },

  findById: async (expenseId) => {
    const response = await api.get(`/expenses/${expenseId}`);
    return response.data;
  },

  registerExpense: async (data) => {
    const response = await api.patch('/expenses/register', data);
    return response.data;
  },

  deleteExpense: async (expenseId) => {
    await api.delete(`/expenses/${expenseId}`);
  },
};

export default expenseService;
