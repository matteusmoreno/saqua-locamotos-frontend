import api from './api';

const addressService = {
  getAddress: async (zipCode, number, complement) => {
    const params = new URLSearchParams();
    params.append('zipCode', zipCode);
    if (number) params.append('number', number);
    if (complement) params.append('complement', complement);

    const response = await api.get(`/addresses?${params.toString()}`);
    return response.data;
  },
};

export default addressService;
