import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiFileText, FiUser, FiTruck, FiCalendar,
  FiDollarSign, FiSave, FiRepeat, FiHash, FiPhone, FiAlertCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import motorcycleService from '../../services/motorcycleService';
import contractService from '../../services/contractService';
import { formatCurrency, formatPhone } from '../../utils/formatters';
import '../Customers/CustomerForm.css';
import './ContractForm.css';

const AVATAR_COLORS = [
  ['#7c3aed','#ede9fe'], ['#0369a1','#e0f2fe'], ['#b45309','#fef3c7'],
  ['#059669','#d1fae5'], ['#dc2626','#fee2e2'], ['#9333ea','#f3e8ff'],
];

function getColor(name = '') {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

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
  const isReady = selectedCustomer && selectedMoto && form.startDate && form.depositAmount && form.weeklyAmount;

  if (loadingData) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="cf-page">
      <button className="cf-back" onClick={() => navigate('/contratos')}>
        <FiArrowLeft /> Voltar aos contratos
      </button>

      {/* Hero */}
      <div className="cf-hero">
        <div className="cf-hero-stripe" />
        <div className="cf-hero-avatar" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
          <FiFileText />
        </div>
        <div className="cf-hero-info">
          <div className="cf-hero-title">Novo Contrato</div>
          <div className="cf-hero-sub">Vincule um locador a uma moto disponível e defina as condições do aluguel</div>
        </div>
        <div className="cf-hero-badge">
          <FiFileText /> Novo contrato
        </div>
      </div>

      <form onSubmit={handleSubmit}>

        {/* ── Partes do Contrato ── */}
        <div className="cf-section" style={{ marginBottom: 16 }}>
          <div className="cf-section-header">
            <span className="cf-section-icon"><FiUser /></span>
            <div>
              <h2>Partes do Contrato</h2>
              <p>Selecione o locador e a moto disponível</p>
            </div>
          </div>
          <div className="cf-section-body">
            <div className="cf-grid">

              {/* Locador */}
              <div className="cf-field">
                <label>Locador <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiUser className="cf-input-icon" />
                  <select
                    name="userId"
                    value={form.userId}
                    onChange={handleChange}
                    className="cf-select"
                    required
                  >
                    <option value="">Selecione o locador...</option>
                    {customers.map((c) => (
                      <option key={c.customerId} value={c.customerId}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {selectedCustomer && (() => {
                  const [fg, bg] = getColor(selectedCustomer.name);
                  return (
                    <div className="ctr-preview-card">
                      <div className="ctr-preview-avatar" style={{ background: bg, color: fg }}>
                        {selectedCustomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ctr-preview-info">
                        <span className="ctr-preview-name">{selectedCustomer.name}</span>
                        {selectedCustomer.phone && (
                          <span className="ctr-preview-sub"><FiPhone /> {formatPhone(selectedCustomer.phone)}</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
                {customers.length === 0 && (
                  <span className="ctr-empty-hint"><FiAlertCircle /> Nenhum locador cadastrado</span>
                )}
              </div>

              {/* Moto */}
              <div className="cf-field">
                <label>Moto disponível <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiTruck className="cf-input-icon" />
                  <select
                    name="motorcycleId"
                    value={form.motorcycleId}
                    onChange={handleChange}
                    className="cf-select"
                    required
                  >
                    <option value="">Selecione a moto...</option>
                    {motorcycles.map((m) => (
                      <option key={m.motorcycleId} value={m.motorcycleId}>
                        {m.brand} {m.model} — {m.plate?.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedMoto && (
                  <div className="ctr-preview-card">
                    <div className="ctr-preview-avatar" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
                      <FiTruck />
                    </div>
                    <div className="ctr-preview-info">
                      <span className="ctr-preview-name">{selectedMoto.brand} {selectedMoto.model}</span>
                      <span className="ctr-preview-sub">
                        <FiHash /> {selectedMoto.plate?.toUpperCase()}
                        {selectedMoto.color && <> · {selectedMoto.color}</>}
                        {selectedMoto.year && <> · {selectedMoto.year}</>}
                      </span>
                    </div>
                  </div>
                )}
                {motorcycles.length === 0 && (
                  <span className="ctr-empty-hint"><FiAlertCircle /> Nenhuma moto disponível no momento</span>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* ── Condições do Contrato ── */}
        <div className="cf-section" style={{ marginBottom: 16 }}>
          <div className="cf-section-header">
            <span className="cf-section-icon"><FiFileText /></span>
            <div>
              <h2>Condições do Aluguel</h2>
              <p>Tipo, prazo e valores do contrato</p>
            </div>
          </div>
          <div className="cf-section-body">
            <div className="cf-grid">

              {/* Tipo de aluguel — toggle */}
              <div className="cf-field cf-full">
                <label>Tipo de aluguel <span className="cf-required">*</span></label>
                <div className="ctr-rental-toggle">
                  <button
                    type="button"
                    className={`ctr-rental-btn${form.rentalType === 'MONTHLY' ? ' active' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, rentalType: 'MONTHLY' }))}
                  >
                    <FiRepeat />
                    <div>
                      <span className="ctr-rental-label">Mensal</span>
                      <span className="ctr-rental-desc">Pagamento semanal recorrente</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    className={`ctr-rental-btn${form.rentalType === 'FIFTEEN_DAYS' ? ' active' : ''}`}
                    onClick={() => setForm((p) => ({ ...p, rentalType: 'FIFTEEN_DAYS' }))}
                  >
                    <FiCalendar />
                    <div>
                      <span className="ctr-rental-label">15 dias</span>
                      <span className="ctr-rental-desc">Pagamento único à vista</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Data de início */}
              <div className="cf-field">
                <label>Data de início <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiCalendar className="cf-input-icon" />
                  <input type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
                </div>
              </div>

              {/* Valor semanal */}
              <div className="cf-field">
                <label>Valor semanal (R$) <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiDollarSign className="cf-input-icon" />
                  <input
                    type="number"
                    name="weeklyAmount"
                    value={form.weeklyAmount}
                    onChange={handleChange}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              {/* Caução */}
              <div className="cf-field cf-full">
                <label>Valor do caução (R$) <span className="cf-required">*</span></label>
                <div className="cf-input-wrap cf-short" style={{ maxWidth: 240 }}>
                  <FiDollarSign className="cf-input-icon" />
                  <input
                    type="number"
                    name="depositAmount"
                    value={form.depositAmount}
                    onChange={handleChange}
                    placeholder="0,00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Resumo ── */}
        {isReady && (
          <div className="ctr-summary">
            <div className="ctr-summary-header">
              <FiFileText /> Resumo do contrato
            </div>
            <div className="ctr-summary-body">
              <div className="ctr-summary-row">
                <span className="ctr-summary-label">Locador</span>
                <span className="ctr-summary-value">{selectedCustomer.name}</span>
              </div>
              <div className="ctr-summary-row">
                <span className="ctr-summary-label">Moto</span>
                <span className="ctr-summary-value">{selectedMoto.brand} {selectedMoto.model} — {selectedMoto.plate?.toUpperCase()}</span>
              </div>
              <div className="ctr-summary-row">
                <span className="ctr-summary-label">Tipo</span>
                <span className="ctr-summary-value">{form.rentalType === 'MONTHLY' ? 'Mensal' : '15 dias'}</span>
              </div>
              <div className="ctr-summary-row">
                <span className="ctr-summary-label">Início</span>
                <span className="ctr-summary-value">{new Date(form.startDate + 'T12:00').toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="ctr-summary-row">
                <span className="ctr-summary-label">Semanal</span>
                <span className="ctr-summary-value highlight">{formatCurrency(parseFloat(form.weeklyAmount))}</span>
              </div>
              <div className="ctr-summary-row">
                <span className="ctr-summary-label">Caução</span>
                <span className="ctr-summary-value">{formatCurrency(parseFloat(form.depositAmount))}</span>
              </div>
            </div>
          </div>
        )}

        <div className="cf-actions">
          <button type="button" className="cf-btn-cancel" onClick={() => navigate('/contratos')}>
            Cancelar
          </button>
          <button type="submit" className="cf-btn-submit" disabled={loading}>
            <FiSave />
            {loading ? 'Criando...' : 'Criar Contrato'}
          </button>
        </div>

      </form>
    </div>
  );
}

export default ContractForm;
