import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiFileText, FiUser, FiTruck, FiDollarSign,
  FiAlertTriangle, FiCheck, FiX, FiUpload, FiCheckCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import {
  formatCurrency, formatDate, formatDateTime,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS,
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
  const [showFineModal, setShowFineModal] = useState(false);
  const [fineForm, setFineForm] = useState({ amount: '', reason: '' });
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [refundDeposit, setRefundDeposit] = useState(true);

  // Payment method selection
  const [paymentMethods, setPaymentMethods] = useState({});

  useEffect(() => {
    loadContract();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadContract = async () => {
    try {
      const data = await contractService.findById(id);
      setContract(data);
    } catch {
      toast.error('Erro ao carregar contrato');
      navigate('/painel');
    } finally {
      setLoading(false);
    }
  };

  /** Silently re-fetches the full contract after a mutation */
  const refreshContract = async () => {
    try {
      const data = await contractService.findById(id);
      setContract(data);
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
      await contractService.registerPayment({
        contractId: id,
        paymentId,
        method,
      });
      await refreshContract();
      toast.success('Pagamento registrado!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao registrar pagamento');
    }
  };

  const handleAddFine = async (e) => {
    e.preventDefault();
    try {
      await contractService.addFine({
        contractId: id,
        amount: parseFloat(fineForm.amount),
        reason: fineForm.reason,
      });
      await refreshContract();
      setShowFineModal(false);
      setFineForm({ amount: '', reason: '' });
      toast.success('Multa adicionada!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao adicionar multa');
    }
  };

  const handlePayFine = async (fineId) => {
    try {
      await contractService.payFine(id, fineId);
      await refreshContract();
      toast.success('Multa paga!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erro ao pagar multa');
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
                <button className="btn-warning btn-sm" onClick={() => setShowFineModal(true)}>
                  <FiAlertTriangle /> Multa
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
            <div className="amount-value">{formatCurrency(contract.totalReceived)}</div>
          </div>
          <div className="amount-box danger">
            <div className="amount-label">Pendente</div>
            <div className="amount-value">{formatCurrency(contract.totalPending)}</div>
          </div>
          <div className="amount-box">
            <div className="amount-label">Caução</div>
            <div className="amount-value">{formatCurrency(contract.depositAmount)}</div>
          </div>
          {contract.totalFines > 0 && (
            <div className="amount-box danger">
              <div className="amount-label">Multas</div>
              <div className="amount-value">{formatCurrency(contract.totalFines)}</div>
            </div>
          )}
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
        </div>
        {(!contract.payments || contract.payments.length === 0) ? (
          <div className="empty-state">
            <FiDollarSign />
            <p>Nenhum pagamento registrado</p>
          </div>
        ) : (
          contract.payments.map((payment) => (
            <div key={payment.paymentId} className="payment-item">
              <div className="payment-info">
                <h4>
                  {formatCurrency(payment.amount)}
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
              {payment.status !== 'PAID' && canManage && (
                <div className="payment-actions">
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
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Fines */}
      {contract.fines && contract.fines.length > 0 && (
        <div className="payments-section">
          <div className="section-header">
            <h2><FiAlertTriangle style={{ marginRight: 8, verticalAlign: 'middle' }} />Multas</h2>
          </div>
          {contract.fines.map((fine) => (
            <div key={fine.fineId} className="fine-item">
              <div className="fine-info">
                <h4>
                  {formatCurrency(fine.amount)}
                  <span
                    className="status-badge"
                    style={{
                      background: fine.paid ? 'var(--success-bg)' : 'var(--danger-bg)',
                      color: fine.paid ? 'var(--success)' : 'var(--danger)',
                      marginLeft: 8,
                    }}
                  >
                    {fine.paid ? 'Paga' : 'Pendente'}
                  </span>
                </h4>
                <p>
                  {fine.reason} &middot; {formatDateTime(fine.createdAt)}
                  {fine.paidAt && ` — Pago em: ${formatDateTime(fine.paidAt)}`}
                </p>
              </div>
              {!fine.paid && canManage && (
                <button className="btn-primary btn-sm" onClick={() => handlePayFine(fine.fineId)}>
                  <FiCheckCircle /> Pagar
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Fine Modal */}
      {showFineModal && (
        <div className="modal-overlay" onClick={() => setShowFineModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Adicionar Multa</h3>
              <button className="btn-icon" onClick={() => setShowFineModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleAddFine}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label>Valor (R$) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={fineForm.amount}
                    onChange={(e) => setFineForm((p) => ({ ...p, amount: e.target.value }))}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Motivo <span className="required">*</span></label>
                  <input
                    value={fineForm.reason}
                    onChange={(e) => setFineForm((p) => ({ ...p, reason: e.target.value }))}
                    placeholder="Motivo da multa"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary btn-sm" onClick={() => setShowFineModal(false)}>Cancelar</button>
                <button type="submit" className="btn-primary btn-sm">Adicionar</button>
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
