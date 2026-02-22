import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUser, FiFileText, FiDollarSign, FiCalendar,
  FiTruck, FiPhone, FiMail, FiMapPin,
  FiCheckCircle, FiAlertTriangle, FiClock, FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import {
  formatCurrency, formatDate, formatPhone,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  PAYMENT_STATUS_LABELS, getStatusColor, getStatusBgColor,
} from '../../utils/formatters';
import './CustomerHome.css';

function CustomerHome() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [profile, userContracts] = await Promise.all([
        userService.findById(authUser.userId),
        userService.findContractsByUserId(authUser.userId),
      ]);
      setUserData(profile);
      setContracts(Array.isArray(userContracts) ? userContracts : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const activeContract = contracts.find((c) => c.status === 'ACTIVE' || c.status === 'OVERDUE');
  const allPayments = activeContract?.payments || [];
  const paidPayments = allPayments.filter((p) => p.status === 'PAID');
  const pendingPayments = allPayments.filter((p) => p.status === 'PENDING');
  const overduePayments = allPayments.filter((p) => p.status === 'OVERDUE');
  const nextPayment = [...pendingPayments, ...overduePayments].sort(
    (a, b) => new Date(a.dueDate) - new Date(b.dueDate)
  )[0];

  return (
    <div className="ch-page">
      {/* Greeting */}
      <div className="ch-greeting">
        <div className="ch-greeting-avatar">
          {userData?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1>Olá, {userData?.name?.split(' ')[0] || 'Locador'}!</h1>
          <p>Acompanhe seu contrato e pagamentos</p>
        </div>
      </div>

      {/* Quick stats */}
      {activeContract && (
        <div className="ch-stats">
          <div className="ch-stat-card success">
            <FiCheckCircle />
            <div>
              <span className="ch-stat-value">{paidPayments.length}</span>
              <span className="ch-stat-label">Pagos</span>
            </div>
          </div>
          <div className="ch-stat-card warning">
            <FiClock />
            <div>
              <span className="ch-stat-value">{pendingPayments.length}</span>
              <span className="ch-stat-label">Pendentes</span>
            </div>
          </div>
          <div className="ch-stat-card danger">
            <FiAlertTriangle />
            <div>
              <span className="ch-stat-value">{overduePayments.length}</span>
              <span className="ch-stat-label">Atrasados</span>
            </div>
          </div>
          <div className="ch-stat-card amber">
            <FiDollarSign />
            <div>
              <span className="ch-stat-value">{formatCurrency(activeContract.weeklyAmount)}</span>
              <span className="ch-stat-label">Semanal</span>
            </div>
          </div>
        </div>
      )}

      {/* Next payment alert */}
      {nextPayment && (
        <div className={`ch-alert ${nextPayment.status === 'OVERDUE' ? 'danger' : 'warning'}`}>
          <div className="ch-alert-icon">
            {nextPayment.status === 'OVERDUE' ? <FiAlertTriangle /> : <FiCalendar />}
          </div>
          <div className="ch-alert-content">
            <h4>
              {nextPayment.status === 'OVERDUE'
                ? 'Pagamento em atraso!'
                : 'Próximo pagamento'}
            </h4>
            <p>
              {formatCurrency(nextPayment.amount)} — vencimento {formatDate(nextPayment.dueDate)}
              {nextPayment.description && ` · ${nextPayment.description}`}
            </p>
          </div>
        </div>
      )}

      <div className="ch-grid">
        {/* Active contract card */}
        <div className="ch-section">
          <div className="ch-section-header">
            <h2><FiFileText style={{ marginRight: 8 }} />Meu Contrato</h2>
            <button className="ch-view-all" onClick={() => navigate('/meus-contratos')}>
              Ver todos <FiChevronRight />
            </button>
          </div>
          {activeContract ? (
            <div className="ch-contract-card" onClick={() => navigate(`/meus-contratos/${activeContract.contractId}`)}>
              <div className="ch-contract-top">
                <div className="ch-contract-moto">
                  <div className="ch-moto-icon"><FiTruck /></div>
                  <div>
                    <h4>{activeContract.motorcycle?.brand} {activeContract.motorcycle?.model}</h4>
                    <p>{activeContract.motorcycle?.plate?.toUpperCase()} · {activeContract.motorcycle?.color} · {activeContract.motorcycle?.year}</p>
                  </div>
                </div>
                <span
                  className="status-badge"
                  style={{
                    background: getStatusBgColor(activeContract.status),
                    color: getStatusColor(activeContract.status),
                  }}
                >
                  {CONTRACT_STATUS_LABELS[activeContract.status]}
                </span>
              </div>
              <div className="ch-contract-details">
                <div className="ch-contract-detail">
                  <span className="label">Tipo</span>
                  <span className="value">{RENTAL_TYPE_LABELS[activeContract.rentalType]}</span>
                </div>
                <div className="ch-contract-detail">
                  <span className="label">Período</span>
                  <span className="value">{formatDate(activeContract.startDate)} — {formatDate(activeContract.endDate)}</span>
                </div>
                <div className="ch-contract-detail">
                  <span className="label">Valor Semanal</span>
                  <span className="value highlight">{formatCurrency(activeContract.weeklyAmount)}</span>
                </div>
                <div className="ch-contract-detail">
                  <span className="label">Caução</span>
                  <span className="value">{formatCurrency(activeContract.depositAmount)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="ch-empty">
              <FiFileText />
              <p>Nenhum contrato ativo no momento</p>
            </div>
          )}
        </div>

        {/* Profile summary card */}
        <div className="ch-section">
          <div className="ch-section-header">
            <h2><FiUser style={{ marginRight: 8 }} />Meus Dados</h2>
            <button className="ch-view-all" onClick={() => navigate('/minha-conta')}>
              Ver perfil <FiChevronRight />
            </button>
          </div>
          <div className="ch-profile-card">
            <div className="ch-profile-row">
              <FiUser />
              <div>
                <span className="label">Nome</span>
                <span className="value">{userData?.name || '—'}</span>
              </div>
            </div>
            <div className="ch-profile-row">
              <FiMail />
              <div>
                <span className="label">E-mail</span>
                <span className="value">{userData?.email || '—'}</span>
              </div>
            </div>
            <div className="ch-profile-row">
              <FiPhone />
              <div>
                <span className="label">Telefone</span>
                <span className="value">{formatPhone(userData?.phone) || '—'}</span>
              </div>
            </div>
            {userData?.address && (
              <div className="ch-profile-row">
                <FiMapPin />
                <div>
                  <span className="label">Endereço</span>
                  <span className="value">
                    {userData.address.street}, {userData.address.number}
                    {userData.address.complement && ` — ${userData.address.complement}`}
                    , {userData.address.neighborhood} — {userData.address.city}/{userData.address.state}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payments timeline */}
      {activeContract && allPayments.length > 0 && (
        <div className="ch-section ch-section-full">
          <div className="ch-section-header">
            <h2><FiDollarSign style={{ marginRight: 8 }} />Meus Pagamentos</h2>
          </div>
          <div className="ch-payments">
            {allPayments
              .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
              .map((payment, idx) => (
                <div key={idx} className={`ch-payment-item ${payment.status?.toLowerCase()}`}>
                  <div className="ch-payment-status-icon">
                    {payment.status === 'PAID' && <FiCheckCircle />}
                    {payment.status === 'PENDING' && <FiClock />}
                    {payment.status === 'OVERDUE' && <FiAlertTriangle />}
                  </div>
                  <div className="ch-payment-info">
                    <h4>{formatCurrency(payment.amount)}</h4>
                    <p>
                      {payment.description || `Pagamento ${idx + 1}`} ·
                      Vencimento: {formatDate(payment.dueDate)}
                      {payment.paidDate && ` · Pago em ${formatDate(payment.paidDate)}`}
                    </p>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      background: getStatusBgColor(payment.status),
                      color: getStatusColor(payment.status),
                    }}
                  >
                    {PAYMENT_STATUS_LABELS[payment.status]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Past contracts */}
      {contracts.filter((c) => c.status === 'FINISHED' || c.status === 'CANCELLED').length > 0 && (
        <div className="ch-section ch-section-full">
          <div className="ch-section-header">
            <h2><FiCalendar style={{ marginRight: 8 }} />Contratos Anteriores</h2>
          </div>
          <div className="ch-past-contracts">
            {contracts
              .filter((c) => c.status === 'FINISHED' || c.status === 'CANCELLED')
              .map((contract) => (
                <div
                  key={contract.contractId}
                  className="ch-past-item"
                  onClick={() => navigate(`/meus-contratos/${contract.contractId}`)}
                >
                  <div className="ch-past-left">
                    <div className="ch-moto-icon small"><FiTruck /></div>
                    <div>
                      <h4>{contract.motorcycle?.brand} {contract.motorcycle?.model}</h4>
                      <p>{formatDate(contract.startDate)} — {formatDate(contract.endDate)}</p>
                    </div>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      background: getStatusBgColor(contract.status),
                      color: getStatusColor(contract.status),
                    }}
                  >
                    {CONTRACT_STATUS_LABELS[contract.status]}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerHome;
