import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import {
  formatCurrency,
  formatDate,
  RENTAL_TYPE_LABELS,
  CONTRACT_STATUS_LABELS,
  getStatusColor,
  getStatusBgColor,
} from '../../utils/formatters';
import { FiFileText, FiCalendar, FiTruck } from 'react-icons/fi';
import './MyContracts.css';

function MyContracts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContracts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const loadContracts = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const data = await userService.findContractsByUserId(user.userId);
      setContracts(data);
    } catch (err) {
      console.error('Erro ao carregar contratos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="my-contracts">
        <div className="my-contracts-loading">
          <div className="spinner" />
          <span>Carregando contratos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="my-contracts">
      <div className="mc-page-header">
        <h1>Meus Contratos</h1>
        <p>Acompanhe o status e detalhes dos seus contratos de aluguel</p>
      </div>

      {contracts.length === 0 ? (
        <div className="mc-empty">
          <div className="mc-empty-icon">
            <FiFileText />
          </div>
          <h3>Nenhum contrato encontrado</h3>
          <p>Você ainda não possui contratos de aluguel registrados.</p>
        </div>
      ) : (
        <div className="mc-list">
          {contracts.map((contract) => (
            <div
              key={contract.contractId}
              className={`mc-card status-${contract.status}`}
              onClick={() => navigate(`/meus-contratos/${contract.contractId}`)}
            >
              <div className="mc-card-top">
                <div className="mc-card-type">
                  <div className="mc-card-type-icon">
                    <FiCalendar />
                  </div>
                  <div className="mc-card-type-info">
                    <h3>Aluguel {RENTAL_TYPE_LABELS[contract.rentalType] || contract.rentalType}</h3>
                    <span>Contrato #{contract.contractId?.slice(-6).toUpperCase()}</span>
                  </div>
                </div>
                <span
                  className="mc-card-status"
                  style={{
                    color: getStatusColor(contract.status),
                    background: getStatusBgColor(contract.status),
                  }}
                >
                  {CONTRACT_STATUS_LABELS[contract.status] || contract.status}
                </span>
              </div>

              {contract.motorcycle && (
                <div className="mc-card-moto">
                  <FiTruck />
                  <span>
                    <strong>{contract.motorcycle.brand} {contract.motorcycle.model}</strong>
                    {' · '}{contract.motorcycle.plate}
                  </span>
                </div>
              )}

              <div className="mc-card-details">
                <div className="mc-detail">
                  <span className="mc-detail-label">Início</span>
                  <span className="mc-detail-value">{formatDate(contract.startDate)}</span>
                </div>
                <div className="mc-detail">
                  <span className="mc-detail-label">Término</span>
                  <span className="mc-detail-value">{formatDate(contract.endDate)}</span>
                </div>
                <div className="mc-detail">
                  <span className="mc-detail-label">Valor Semanal</span>
                  <span className="mc-detail-value">{formatCurrency(contract.weeklyAmount)}</span>
                </div>
                <div className="mc-detail">
                  <span className="mc-detail-label">Total</span>
                  <span className="mc-detail-value">{formatCurrency(contract.totalAmount)}</span>
                </div>
                <div className="mc-detail">
                  <span className="mc-detail-label">Recebido</span>
                  <span className="mc-detail-value" style={{ color: 'var(--success)' }}>
                    {formatCurrency(contract.totalReceived)}
                  </span>
                </div>
                <div className="mc-detail">
                  <span className="mc-detail-label">Pendente</span>
                  <span
                    className="mc-detail-value"
                    style={{
                      color: contract.totalPending > 0 ? 'var(--warning)' : 'var(--success)',
                    }}
                  >
                    {formatCurrency(contract.totalPending)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyContracts;
