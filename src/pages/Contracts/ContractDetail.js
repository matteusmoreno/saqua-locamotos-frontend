import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiFileText, FiUser, FiTruck, FiDollarSign,
  FiCheck, FiX, FiUpload, FiCheckCircle, FiPlus, FiTrash2,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import paymentService from '../../services/paymentService';
import {
  formatCurrency, formatDate,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS, PAYMENT_TYPE_LABELS,
  getStatusColor, getStatusBgColor
} from '../../utils/formatters';
import './ContractDetail.css';
import '../Customers/CustomerDetail.css';

function ContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [refundDeposit, setRefundDeposit] = useState(true);

  // Payment method selection
  const [paymentMethods, setPaymentMethods] = useState({});

  // Payments (separate entity)
  const [payments, setPayments] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ type: '', amount: '', dueDate: '', description: '' });

  useEffect(() => {
    loadContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

  /** Silently re-fetches the full contract and payments after a mutation */
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
    if (!method) {
      toast.warning('Selecione o método de pagamento');
      return;
    }
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

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;
  if (!contract) return null;

  const isTerminal = contract.status === 'FINISHED' || contract.status === 'CANCELLED';
  const canManage = !isTerminal;

  const totalReceived = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter((p) => p.status !== 'PAID').reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="contract-detail">
      <button className="back-link" onClick={() => navigate(-1)}>
        <FiArrowLeft /> Voltar
      </button>

      {/* Header */}
      <div className="contract-header">
        <div className="contract-header-top">
          <div className="contract-header-info">
            <h1>
              Contrato — {contract.motorcycle?.brand} {contract.motorcycle?.model}
              <span
                className="status-badge"
                style={{ background: getStatusBgColor(contract.status), color: getStatusColor(contract.status), marginLeft: 12, verticalAlign: 'middle' }}
              >
                {CONTRACT_STATUS_LABELS[contract.status]}
              </span>
            </h1>
            <p>
              {contract.user?.name} &middot; {RENTAL_TYPE_LABELS[contract.rentalType]} &middot; {formatDate(contract.startDate)} a {formatDate(contract.endDate)}
            </p>
          </div>
          <div className="contract-header-actions">
            {canManage && (
              <>
                <button className="btn-icon" title="Upload arquivo" onClick={() => fileInputRef.current?.click()}>
                  <FiUpload />
                </button>
                <button className="btn-primary btn-sm" onClick={() => setShowFinishModal(true)}>
                  <FiCheck /> Finalizar
                </button>
                <button className="btn-danger btn-sm" onClick={handleCancel}>
                  <FiX /> Cancelar
                </button>
              </>
            )}
            <input ref={fileInputRef} type="file" className="upload-input" onChange={handleUploadFile} />
          </div>
        </div>

        <div className="contract-amounts">
          <div className="amount-box highlight">
            <div className="amount-label">Semanal</div>
            <div className="amount-value">{formatCurrency(contract.weeklyAmount)}</div>
          </div>
          <div className="amount-box">
            <div className="amount-label">Total</div>
            <div className="amount-value">{formatCurrency(contract.totalAmount)}</div>
          </div>
          <div className="amount-box success">
            <div className="amount-label">Recebido</div>
            <div className="amount-value">{formatCurrency(totalReceived)}</div>
          </div>
          <div className="amount-box danger">
            <div className="amount-label">Pendente</div>
            <div className="amount-value">{formatCurrency(totalPending)}</div>
          </div>
          <div className="amount-box">
            <div className="amount-label">Caução</div>
            <div className="amount-value">{formatCurrency(contract.depositAmount)}</div>
          </div>
        </div>
      </div>

      <div className="info-grid">
        {/* Client info */}
        <div className="info-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/locadores/${contract.user?.customerId}`)}>
          <div className="info-card-header">
            <FiUser />
            <h3>Locador</h3>
          </div>
          <div className="info-card-body">
            <div className="info-row">
              <span className="label">Nome</span>
              <span className="value">{contract.user?.name}</span>
            </div>
            <div className="info-row">
              <span className="label">Telefone</span>
              <span className="value">{contract.user?.phone}</span>
            </div>
            <div className="info-row">
              <span className="label">E-mail</span>
              <span className="value">{contract.user?.email}</span>
            </div>
          </div>
        </div>

        {/* Moto info */}
        <div className="info-card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/motos/${contract.motorcycle?.motorcycleId}`)}>
          <div className="info-card-header">
            <FiTruck />
            <h3>Moto</h3>
          </div>
          <div className="info-card-body">
            <div className="info-row">
              <span className="label">Modelo</span>
              <span className="value">{contract.motorcycle?.brand} {contract.motorcycle?.model}</span>
            </div>
            <div className="info-row">
              <span className="label">Placa</span>
              <span className="value">{contract.motorcycle?.plate?.toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="label">Ano / Cor</span>
              <span className="value">{contract.motorcycle?.year} — {contract.motorcycle?.color}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contract File */}
      {contract.contractUrl && (
        <div className="info-card">
          <div className="info-card-header">
            <FiFileText />
            <h3>Arquivo do Contrato</h3>
          </div>
          <div className="info-card-body">
            <a
              href={contract.contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-sm"
            >
              <FiFileText /> Ver documento
            </a>
          </div>
        </div>
      )}

      {/* Payments */}
      <div className="payments-section">
        <div className="section-header">
          <h2><FiDollarSign style={{ marginRight: 8, verticalAlign: 'middle' }} />Pagamentos</h2>
          {canManage && (
            <button className="btn-primary btn-sm" onClick={() => setShowPaymentModal(true)}>
              <FiPlus /> Novo Pagamento
            </button>
          )}
        </div>
        {payments.length === 0 ? (
          <div className="empty-state">
            <FiDollarSign />
            <p>Nenhum pagamento registrado</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.paymentId} className="payment-item">
              <div className="payment-info">
                <h4>
                  {PAYMENT_TYPE_LABELS[payment.type] || payment.type} — {formatCurrency(payment.amount)}
                  <span
                    className="status-badge"
                    style={{
                      background: getStatusBgColor(payment.status),
                      color: getStatusColor(payment.status),
                      marginLeft: 8,
                    }}
                  >
                    {PAYMENT_STATUS_LABELS[payment.status]}
                  </span>
                </h4>
                <p>
                  Vencimento: {formatDate(payment.dueDate)}
                  {payment.paidDate && ` — Pago em: ${formatDate(payment.paidDate)}`}
                  {payment.method && ` — ${PAYMENT_METHOD_LABELS[payment.method]}`}
                  {payment.description && ` — ${payment.description}`}
                </p>
              </div>
              <div className="payment-actions">
                {payment.status !== 'PAID' && canManage && (
                  <>
                    <select
                      value={paymentMethods[payment.paymentId] || ''}
                      onChange={(e) => setPaymentMethods((prev) => ({ ...prev, [payment.paymentId]: e.target.value }))}
                    >
                      <option value="">Método...</option>
                      <option value="PIX">Pix</option>
                      <option value="CASH">Dinheiro</option>
                      <option value="CARD">Cartão</option>
                    </select>
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => handleRegisterPayment(payment.paymentId)}
                    >
                      <FiCheckCircle /> Pagar
                    </button>
                  </>
                )}
                {canManage && (
                  <button
                    className="btn-danger btn-sm"
                    title="Remover pagamento"
                    onClick={() => handleDeletePayment(payment.paymentId)}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="modal-overlay" onClick={() => setShowPaymentModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Novo Pagamento</h3>
              <button className="btn-icon" onClick={() => setShowPaymentModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreatePayment}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Tipo <span className="required">*</span></label>
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
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Valor (R$) <span className="required">*</span></label>
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
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Data de Vencimento <span className="required">*</span></label>
                  <input
                    type="date"
                    value={paymentForm.dueDate}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, dueDate: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Descrição</label>
                  <input
                    value={paymentForm.description}
                    onChange={(e) => setPaymentForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Observação opcional"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary btn-sm">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Finish Modal */}
      {showFinishModal && (
        <div className="modal-overlay" onClick={() => setShowFinishModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Finalizar Contrato</h3>
              <button className="btn-icon" onClick={() => setShowFinishModal(false)}><FiX /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                Deseja devolver o valor do caução ({formatCurrency(contract.depositAmount)}) ao locador?
              </p>
              <div className="form-group">
                <select
                  value={refundDeposit.toString()}
                  onChange={(e) => setRefundDeposit(e.target.value === 'true')}
                >
                  <option value="true">Sim, devolver caução</option>
                  <option value="false">Não devolver caução</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary btn-sm" onClick={() => setShowFinishModal(false)}>Cancelar</button>
              <button className="btn-primary btn-sm" onClick={handleFinish}>Finalizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContractDetail;
