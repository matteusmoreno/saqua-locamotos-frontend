import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contractService from '../../services/contractService';
import paymentService from '../../services/paymentService';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  CONTRACT_STATUS_LABELS,
  RENTAL_TYPE_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_TYPE_LABELS,
  getStatusColor,
  getStatusBgColor,
} from '../../utils/formatters';
import {
  FiArrowLeft,
  FiTruck,
  FiDollarSign,
  FiCheckCircle,
  FiFileText,
  FiExternalLink,
} from 'react-icons/fi';
import './MyContractDetail.css';

function MyContractDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

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
      console.error('Erro ao carregar contrato');
      navigate('/meus-contratos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-contract-detail">
        <div className="mcd-loading">
          <div className="spinner" />
          <span>Carregando contrato...</span>
        </div>
      </div>
    );
  }

  if (!contract) return null;

  const moto = contract.motorcycle;

  // Compute totals from payments state
  const totalReceived = payments.filter((p) => p.status === 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
  const totalPending = payments.filter((p) => p.status !== 'PAID').reduce((s, p) => s + (p.amount || 0), 0);
  const finePayments = payments.filter((p) => p.type === 'FINE');
  const totalFines = finePayments.reduce((s, p) => s + (p.amount || 0), 0);

  return (
    <div className="my-contract-detail">
      <button className="mcd-back" onClick={() => navigate('/meus-contratos')}>
        <FiArrowLeft /> Voltar aos contratos
      </button>

      {/* Header */}
      <div className="mcd-header">
        <div className="mcd-header-top">
          <h1>
            {moto?.brand} {moto?.model}
            <span
              className="mcd-status"
              style={{
                color: getStatusColor(contract.status),
                background: getStatusBgColor(contract.status),
              }}
            >
              {CONTRACT_STATUS_LABELS[contract.status]}
            </span>
          </h1>
        </div>
        <p className="mcd-header-sub">
          Aluguel {RENTAL_TYPE_LABELS[contract.rentalType]} · {formatDate(contract.startDate)} a{' '}
          {formatDate(contract.endDate)}
        </p>
      </div>

      {/* Amount Boxes */}
      <div className="mcd-amounts">
        <div className="mcd-amount-box">
          <p className="mcd-amount-label">Valor Semanal</p>
          <p className="mcd-amount-value">{formatCurrency(contract.weeklyAmount)}</p>
        </div>
        <div className="mcd-amount-box">
          <p className="mcd-amount-label">Total do Contrato</p>
          <p className="mcd-amount-value info">{formatCurrency(contract.totalAmount)}</p>
        </div>
        <div className="mcd-amount-box">
          <p className="mcd-amount-label">Total Recebido</p>
          <p className="mcd-amount-value success">{formatCurrency(totalReceived)}</p>
        </div>
        <div className="mcd-amount-box">
          <p className="mcd-amount-label">Total Pendente</p>
          <p className={`mcd-amount-value ${totalPending > 0 ? 'warning' : 'success'}`}>
            {formatCurrency(totalPending)}
          </p>
        </div>
        <div className="mcd-amount-box">
          <p className="mcd-amount-label">Caução</p>
          <p className="mcd-amount-value">{formatCurrency(contract.depositAmount)}</p>
        </div>
        <div className="mcd-amount-box">
          <p className="mcd-amount-label">Multas</p>
          <p className={`mcd-amount-value ${totalFines > 0 ? 'danger' : ''}`}>
            {formatCurrency(totalFines)}
          </p>
        </div>
      </div>

      {/* Motorcycle Info */}
      {moto && (
        <div className="mcd-card">
          <div className="mcd-card-header">
            <FiTruck /> Moto
          </div>
          <div className="mcd-card-body">
            <div className="mcd-info-grid">
              <div className="mcd-info-item">
                <span className="mcd-info-label">Marca / Modelo</span>
                <span className="mcd-info-value">
                  {moto.brand} {moto.model}
                </span>
              </div>
              <div className="mcd-info-item">
                <span className="mcd-info-label">Placa</span>
                <span className="mcd-info-value">{moto.plate}</span>
              </div>
              <div className="mcd-info-item">
                <span className="mcd-info-label">Cor</span>
                <span className="mcd-info-value">{moto.color}</span>
              </div>
              <div className="mcd-info-item">
                <span className="mcd-info-label">Ano</span>
                <span className="mcd-info-value">{moto.year}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contract Document */}
      <div className="mcd-card">
        <div className="mcd-card-header">
          <FiFileText /> Documento do Contrato
        </div>
        <div className="mcd-card-body">
          {contract.contractUrl ? (
            <a
              href={contract.contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mcd-contract-link"
            >
              <FiExternalLink /> Visualizar contrato
            </a>
          ) : (
            <p className="mcd-no-file">Nenhum documento disponível</p>
          )}
        </div>
      </div>

      {/* Payments */}
      <div className="mcd-card">
        <div className="mcd-card-header">
          <FiDollarSign /> Pagamentos ({payments.length})
        </div>
        {payments.length === 0 ? (
          <div className="mcd-empty-section">Nenhum pagamento registrado</div>
        ) : (
          <div className="mcd-payments-list">
            {payments.map((payment, index) => (
              <div key={payment.paymentId || index} className="mcd-payment-row">
                <div className="mcd-payment-left">
                  <span className="mcd-payment-period">
                    {PAYMENT_TYPE_LABELS[payment.type] || payment.type || `Pagamento ${index + 1}`}
                    {payment.method ? ` · ${PAYMENT_METHOD_LABELS[payment.method] || payment.method}` : ''}
                  </span>
                  <span className="mcd-payment-date">
                    Vencimento: {formatDate(payment.dueDate)}
                    {payment.paidDate && ` · Pago em: ${formatDateTime(payment.paidDate)}`}
                    {payment.description && ` · ${payment.description}`}
                  </span>
                </div>
                <div className="mcd-payment-right">
                  <span className="mcd-payment-amount">{formatCurrency(payment.amount)}</span>
                  <span
                    className="mcd-payment-status"
                    style={{
                      color: getStatusColor(payment.status),
                      background: getStatusBgColor(payment.status),
                    }}
                  >
                    {payment.status === 'PAID' && <FiCheckCircle />}
                    {PAYMENT_STATUS_LABELS[payment.status] || payment.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>


    </div>
  );
}

export default MyContractDetail;
