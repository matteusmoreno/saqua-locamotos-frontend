import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import motorcycleService from '../../services/motorcycleService';
import contractService from '../../services/contractService';
import { formatCurrency } from '../../utils/formatters';
import '../Customers/CustomerForm.css';
import './ContractForm.css';

function ContractForm() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [form, setForm] = useState({
    userId: '',
    motorcycleId: '',
    rentalType: 'MONTHLY',
    startDate: '',
    depositAmount: '',
    weeklyAmount: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, motosData] = await Promise.all([
        userService.findAllCustomers(),
        motorcycleService.findAllAvailable(),
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setMotorcycles(Array.isArray(motosData) ? motosData : []);
    } catch {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...form,
        depositAmount: parseFloat(form.depositAmount),
        weeklyAmount: parseFloat(form.weeklyAmount),
      };
      const data = await contractService.create(payload);
      toast.success('Contrato criado com sucesso!');
      navigate(`/contratos/${data.contractId}`);
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Erro ao criar contrato';
      toast.error(typeof message === 'string' ? message : 'Erro ao criar contrato');
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.customerId === form.userId);
  const selectedMoto = motorcycles.find((m) => m.motorcycleId === form.motorcycleId);

  if (loadingData) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="form-page">
      <button className="back-link" onClick={() => navigate('/contratos')}>
        <FiArrowLeft />
        Voltar aos contratos
      </button>

      <div className="page-header">
        <h1>Novo Contrato</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="form-card-header">
            <FiFileText />
            <h2>Dados do Contrato</h2>
          </div>
          <div className="form-card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Locador <span className="required">*</span></label>
                <select name="userId" value={form.userId} onChange={handleChange} required>
                  <option value="">Selecione o locador...</option>
                  {customers.map((c) => (
                    <option key={c.customerId} value={c.customerId}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Moto <span className="required">*</span></label>
                <select name="motorcycleId" value={form.motorcycleId} onChange={handleChange} required>
                  <option value="">Selecione a moto...</option>
                  {motorcycles.map((m) => (
                    <option key={m.motorcycleId} value={m.motorcycleId}>
                      {m.brand} {m.model} — {m.plate?.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Tipo de aluguel <span className="required">*</span></label>
                <select name="rentalType" value={form.rentalType} onChange={handleChange} required>
                  <option value="MONTHLY">Mensal (pagamento semanal)</option>
                  <option value="FIFTEEN_DAYS">15 dias (pagamento à vista)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Data de início <span className="required">*</span></label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
              </div>

              <div className="form-group">
                <label>Valor do caução (R$) <span className="required">*</span></label>
                <input
                  type="number"
                  name="depositAmount"
                  value={form.depositAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              <div className="form-group">
                <label>Valor semanal (R$) <span className="required">*</span></label>
                <input
                  type="number"
                  name="weeklyAmount"
                  value={form.weeklyAmount}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>

              {/* Summary */}
              {(selectedCustomer || selectedMoto) && (
                <div className="contract-form-summary">
                  <h4>Resumo do Contrato</h4>
                  <p>
                    {selectedCustomer && <><strong>Locador:</strong> {selectedCustomer.name}<br /></>}
                    {selectedMoto && <><strong>Moto:</strong> {selectedMoto.brand} {selectedMoto.model} — {selectedMoto.plate?.toUpperCase()}<br /></>}
                    {form.depositAmount && <><strong>Caução:</strong> {formatCurrency(parseFloat(form.depositAmount))}<br /></>}
                    {form.weeklyAmount && <><strong>Semanal:</strong> {formatCurrency(parseFloat(form.weeklyAmount))}</>}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/contratos')}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Criando...' : 'Criar Contrato'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default ContractForm;
