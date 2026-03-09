import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiFileText, FiUser, FiTruck, FiDollarSign,
  FiCheck, FiX, FiUpload, FiCheckCircle, FiPlus, FiTrash2,
  FiCalendar, FiChevronRight, FiClock, FiPhone, FiMail,
  FiShield, FiAlertTriangle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import paymentService from '../../services/paymentService';
import {
  formatCurrency, formatDate,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS,
  getStatusColor, getStatusBgColor,
} from '../../utils/formatters';
import './ContractDetail.css';

/* ── Avatar palette (dark-mode) ── */
const AVATAR_COLORS = [
  ['#C4B5FD', '#3D2A7A'], ['#7DD3FC', '#1E3A5F'], ['#6EE7B7', '#1B4332'],
  ['#FDE68A', '#5F3613'], ['#FCA5A5', '#5F1F1F'], ['#F9A8D4', '#5F1440'],
  ['#A5B4FC', '#2D3069'], ['#5EEAD4', '#1A3D38'],
];
const getAvatarColor = (name = '') =>
  AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

const STATUS_STRIPE = {
  ACTIVE:    '#10B981',
  OVERDUE:   '#F59E0B',
  FINISHED:  '#0EA5E9',
  CANCELLED: '#EF4444',
};

const PAYMENT_TYPE_ICONS = {
  DEPOSIT:      <FiShield />,
  WEEKLY:       <FiCalendar />,
  FULL_PAYMENT: <FiCheckCircle />,
  FINE:         <FiAlertTriangle />,
};

function UserAvatar({ user, size = 64 }) {
  const [imgError, setImgError] = useState(false);
  const [textColor, bg] = getAvatarColor(user?.name);
  const initial = user?.name?.charAt(0).toUpperCase() || '?';
  if (user?.pictureUrl && !imgError) {
    return (
      <img
        src={user.pictureUrl}
        alt={user.name}
        className="ctd-avatar ctd-avatar-photo"
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className="ctd-avatar ctd-avatar-initial"
      style={{ width: size, height: size, fontSize: size * 0.36, background: bg, color: textColor }}
    >
      {initial}
    </div>
  );
}

function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [refundDeposit, setRefundDeposit] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({});
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ type: '', amount: '', dueDate: '', description: '' });

  useEffect(() => { loadContract(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadContract = async () => {
    try {
      const data = await contractService.findById(id);
      setContract(data);
      const paymentData = await paymentService.findByContractId(id);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch {
      toast.error('Erro ao carregar contrato');
      navigate('/painel');
    } finally {
      setLoading(false);
    }
  };

  const refreshContract = async () => {
    try {
      const [data, paymentData] = await Promise.all([
        contractService.findById(id),
        paymentService.findByContractId(id),
      ]);
      setContract(data);
      setPayments(Array.isArray(paymentData) ? paymentData : []);
    } catch {
      toast.error('Erro ao atualizar contrato');
    }
  };

  const handleRegisterPayment = async (paymentId) => {
    const method = paymentMethods[paymentId];
    if (!method) { toast.warning('Selecione o método de pagamento'); return; }
    try {
      await paymentService.registerPayment({ paymentId, method });
      await refreshContract();
      toast.success('Pagamento registrado!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    }
  };

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    try {
      await paymentService.create({
        contractId: id,
        type: paymentForm.type,
        amount: parseFloat(paymentForm.amount),
        dueDate: paymentForm.dueDate,
        description: paymentForm.description || undefined,
      });
      await refreshContract();
      setShowPaymentModal(false);
      setPaymentForm({ type: '', amount: '', dueDate: '', description: '' });
      toast.success('Pagamento criado!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao criar pagamento');
    }
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Remover este pagamento?')) return;
    try {
      await paymentService.deletePayment(paymentId);
      await refreshContract();
      toast.success('Pagamento removido');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao remover pagamento');
    }
  };

  const handleFinish = async () => {
    try {
      await contractService.finish(id, refundDeposit);
      await refreshContract();
      setShowFinishModal(false);
      toast.success('Contrato finalizado!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao finalizar contrato');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Tem certeza que deseja cancelar este contrato?')) return;
    try {
      await contractService.cancel(id);
      await refreshContract();
      toast.success('Contrato cancelado');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao cancelar contrato');
    }
  };

  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await contractService.uploadFile(id, file);
      await refreshContract();
      toast.success('Arquivo enviado!');
    } catch {
      toast.error('Erro ao enviar arquivo');
    }
  };

  const handleGeneratePdf = async () => {
    try {
      await contractService.generatePdf(id);
      toast.success('PDF gerado!');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!contract) return null;

  const isTerminal = contract.status === 'FINISHED' || contract.status === 'CANCELLED';
  const canManage = !isTerminal;

  const totalReceived = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending  = payments.filter((p) => p.status !== 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
  const paidCount     = payments.filter((p) => p.status === 'PAID').length;
  const pendingCount  = payments.filter((p) => p.status !== 'PAID').length;
  const stripeColor   = STATUS_STRIPE[contract.status] || '#64748B';

  return (
    <div className="ctd-page">
      <button className="back-link" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Voltar
      </button>

      {/* ══ HERO ══ */}
      <div className="ctd-hero">
        <div className="ctd-hero-stripe" style={{ background: stripeColor }} />
        <div className="ctd-hero-main">
          <UserAvatar user={contract.user} size={72} />
          <div className="ctd-hero-meta">
            <div className="ctd-hero-badges">
              <span className="ctd-contract-id">#{contract.contractId?.toString().slice(-4)}</span>
              <span
                className="ctd-status-chip"
                style={{ background: getStatusBgColor(contract.status), color: getStatusColor(contract.status) }}
              >
                {CONTRACT_STATUS_LABELS[contract.status]}
              </span>
              <span className="ctd-type-chip">{RENTAL_TYPE_LABELS[contract.rentalType]}</span>
            </div>
            <h1 className="ctd-hero-name">{contract.user?.name || '—'}</h1>
            <p className="ctd-hero-sub">
              <FiTruck className="ctd-hero-sub-icon" />
              {contract.motorcycle?.brand} {contract.motorcycle?.model}
              <span className="ctd-hero-plate">{contract.motorcycle?.plate?.toUpperCase()}</span>
              <FiCalendar className="ctd-hero-sub-icon" />
              {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
            </p>
          </div>
          {canManage && (
            <div className="ctd-hero-actions">
              <button className="ctd-btn-icon" title="Enviar arquivo" onClick={() => fileInputRef.current?.click()}>
                <FiUpload />
              </button>
              <button className="ctd-btn-icon" title="Gerar PDF" onClick={handleGeneratePdf}>
                <FiFileText />
              </button>
              <button className="ctd-btn-finish" onClick={() => setShowFinishModal(true)}>
                <FiCheck /> Finalizar
              </button>
              <button className="ctd-btn-cancel" onClick={handleCancel}>
                <FiX /> Cancelar
              </button>
              <input ref={fileInputRef} type="file" className="ctd-upload-input" onChange={handleUploadFile} />
            </div>
          )}
        </div>

        {/* Financial row */}
        <div className="ctd-financials">
          <div className="ctd-fin-item ctd-fin-primary">
            <span className="ctd-fin-label">Semanal</span>
            <span className="ctd-fin-value">{formatCurrency(contract.weeklyAmount)}</span>
          </div>
          <div className="ctd-fin-divider" />
          <div className="ctd-fin-item">
            <span className="ctd-fin-label">Total</span>
            <span className="ctd-fin-value">{formatCurrency(contract.totalAmount)}</span>
          </div>
          <div className="ctd-fin-divider" />
          <div className="ctd-fin-item ctd-fin-success">
            <span className="ctd-fin-label">Recebido</span>
            <span className="ctd-fin-value">{formatCurrency(totalReceived)}</span>
          </div>
          <div className="ctd-fin-divider" />
          <div className="ctd-fin-item ctd-fin-danger">
            <span className="ctd-fin-label">Pendente</span>
            <span className="ctd-fin-value">{formatCurrency(totalPending)}</span>
          </div>
          <div className="ctd-fin-divider" />
          <div className="ctd-fin-item">
            <span className="ctd-fin-label">Caução</span>
            <span className="ctd-fin-value">{formatCurrency(contract.depositAmount)}</span>
          </div>
        </div>
      </div>

      {/* ══ INFO GRID ══ */}
      <div className="ctd-info-grid">
        {/* Locador */}
        <div className="ctd-info-card ctd-info-link" onClick={() => navigate(`/locadores/${contract.user?.customerId}`)}>
          <div className="ctd-info-header">
            <div className="ctd-info-icon user"><FiUser /></div>
            <span className="ctd-info-label">Locador</span>
            <FiChevronRight className="ctd-info-arrow" />
          </div>
          <div className="ctd-info-avatar-row">
            <UserAvatar user={contract.user} size={44} />
            <div>
              <p className="ctd-info-name">{contract.user?.name || '—'}</p>
              <p className="ctd-info-sub">{contract.user?.cpf || 'CPF não informado'}</p>
            </div>
          </div>
          <div className="ctd-info-rows">
            <div className="ctd-info-row">
              <FiPhone className="ctd-info-row-icon" />
              <span>{contract.user?.phone || '—'}</span>
            </div>
            <div className="ctd-info-row">
              <FiMail className="ctd-info-row-icon" />
              <span>{contract.user?.email || '—'}</span>
            </div>
          </div>
        </div>

        {/* Moto */}
        <div className="ctd-info-card ctd-info-link" onClick={() => navigate(`/motos/${contract.motorcycle?.motorcycleId}`)}>
          <div className="ctd-info-header">
            <div className="ctd-info-icon moto"><FiTruck /></div>
            <span className="ctd-info-label">Motocicleta</span>
            <FiChevronRight className="ctd-info-arrow" />
          </div>
          <div className="ctd-moto-brand-row">
            <span className="ctd-moto-brand">{contract.motorcycle?.brand}</span>
            <span className="ctd-moto-model">{contract.motorcycle?.model}</span>
          </div>
          <div className="ctd-info-rows">
            <div className="ctd-info-row">
              <span className="ctd-plate-badge">{contract.motorcycle?.plate?.toUpperCase()}</span>
            </div>
            <div className="ctd-info-row">
              <FiClock className="ctd-info-row-icon" />
              <span>{contract.motorcycle?.year} · {contract.motorcycle?.color}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTRACT FILE ══ */}
      {contract.contractUrl && (
        <div className="ctd-file-card">
          <div className="ctd-file-icon"><FiFileText /></div>
          <div className="ctd-file-info">
            <span className="ctd-file-label">Arquivo do Contrato</span>
            <a href={contract.contractUrl} target="_blank" rel="noopener noreferrer" className="ctd-file-link">
              Ver documento <FiChevronRight />
            </a>
          </div>
        </div>
      )}

      {/* ══ PAYMENTS ══ */}
      <div className="ctd-payments">
        <div className="ctd-payments-header">
          <div className="ctd-payments-title">
            <FiDollarSign />
            <span>Pagamentos</span>
            {paidCount > 0 && (
              <span className="ctd-pay-badge ctd-pay-paid">{paidCount} pago{paidCount !== 1 ? 's' : ''}</span>
            )}
            {pendingCount > 0 && (
              <span className="ctd-pay-badge ctd-pay-pending">{pendingCount} pendente{pendingCount !== 1 ? 's' : ''}</span>
            )}
          </div>
          {canManage && (
            <button className="ctd-btn-add" onClick={() => setShowPaymentModal(true)}>
              <FiPlus /> Novo Pagamento
            </button>
          )}
        </div>

        {payments.length === 0 ? (
          <div className="ctd-empty">
            <FiDollarSign className="ctd-empty-icon" />
            <p>Nenhum pagamento registrado</p>
          </div>
        ) : (
          <div className="ctd-payments-list">
            {payments.map((payment) => (
              <div
                key={payment.paymentId}
                className={`ctd-payment-item ${payment.status === 'PAID' ? 'is-paid' : ''}`}
              >
                <div className={`ctd-ptype-icon ctd-ptype-${(payment.type || '').toLowerCase()}`}>
                  {PAYMENT_TYPE_ICONS[payment.type] || <FiDollarSign />}
                </div>
                <div className="ctd-payment-info">
                  <div className="ctd-payment-top">
                    <span className="ctd-payment-type">{PAYMENT_TYPE_LABELS[payment.type] || payment.type}</span>
                    <span
                      className="ctd-payment-status"
                      style={{ background: getStatusBgColor(payment.status), color: getStatusColor(payment.status) }}
                    >
                      {PAYMENT_STATUS_LABELS[payment.status]}
                    </span>
                  </div>
                  <div className="ctd-payment-meta">
                    <span>Vence {formatDate(payment.dueDate)}</span>
                    {payment.paidDate && <span>· Pago {formatDate(payment.paidDate)}</span>}
                    {payment.method && <span>· {PAYMENT_METHOD_LABELS[payment.method]}</span>}
                    {payment.description && <span>· {payment.description}</span>}
                  </div>
                </div>
                <span className="ctd-payment-amount">{formatCurrency(payment.amount)}</span>
                <div className="ctd-payment-actions">
                  {payment.status !== 'PAID' && canManage && (
                    <>
                      <select
                        className="ctd-method-select"
                        value={paymentMethods[payment.paymentId] || ''}
                        onChange={(e) => setPaymentMethods((prev) => ({ ...prev, [payment.paymentId]: e.target.value }))}
                      >
                        <option value="">Método...</option>
                        <option value="PIX">Pix</option>
                        <option value="CASH">Dinheiro</option>
                        <option value="CARD">Cartão</option>
                      </select>
                      <button className="ctd-btn-pay" onClick={() => handleRegisterPayment(payment.paymentId)}>
                        <FiCheckCircle /> Pagar
                      </button>
                    </>
                  )}
                  {canManage && (
                    <button className="ctd-btn-del" title="Remover" onClick={() => handleDeletePayment(payment.paymentId)}>
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ══ PAYMENT MODAL ══ */}
      {showPaymentModal && (
        <div className="ctd-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="ctd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ctd-modal-header">
              <h3>Novo Pagamento</h3>
              <button className="ctd-modal-close" onClick={() => setShowPaymentModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreatePayment}>
              <div className="ctd-modal-body">
                <div className="ctd-field">
                  <label>Tipo <span className="ctd-req">*</span></label>
                  <select
                    value={paymentForm.type}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, type: e.target.value }))}
                    required
                  >
                    <option value="">Selecione...</option>
                    <option value="DEPOSIT">Caução / Depósito</option>
                    <option value="WEEKLY">Pagamento Semanal</option>
                    <option value="FULL_PAYMENT">Pagamento Integral (15 dias)</option>
                    <option value="FINE">Multa</option>
                  </select>
                </div>
                <div className="ctd-field">
                  <label>Valor (R$) <span className="ctd-req">*</span></label>
                  <input
                    type="number"
                    value={paymentForm.amount}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="ctd-field">
                  <label>Data de Vencimento <span className="ctd-req">*</span></label>
                  <input
                    type="date"
                    value={paymentForm.dueDate}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, dueDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="ctd-field">
                  <label>Descrição</label>
                  <input
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Observação opcional"
                  />
                </div>
              </div>
              <div className="ctd-modal-footer">
                <button type="button" className="ctd-btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
                <button type="submit" className="ctd-btn-primary">Criar Pagamento</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ FINISH MODAL ══ */}
      {showFinishModal && (
        <div className="ctd-overlay" onClick={() => setShowFinishModal(false)}>
          <div className="ctd-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ctd-modal-header">
              <h3>Finalizar Contrato</h3>
              <button className="ctd-modal-close" onClick={() => setShowFinishModal(false)}><FiX /></button>
            </div>
            <div className="ctd-modal-body">
              <p className="ctd-modal-desc">
                Deseja devolver o valor do caução <strong>{formatCurrency(contract.depositAmount)}</strong> ao locador?
              </p>
              <div className="ctd-field">
                <select
                  value={refundDeposit.toString()}
                  onChange={(e) => setRefundDeposit(e.target.value === 'true')}
                >
                  <option value="true">Sim, devolver caução</option>
                  <option value="false">Não devolver caução</option>
                </select>
              </div>
            </div>
            <div className="ctd-modal-footer">
              <button className="ctd-btn-secondary" onClick={() => setShowFinishModal(false)}>Cancelar</button>
              <button className="ctd-btn-primary" onClick={handleFinish}>Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractDetail;
