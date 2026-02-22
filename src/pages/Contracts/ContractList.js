import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiFileText, FiInbox,
  FiTruck, FiCalendar, FiDollarSign, FiAlertTriangle, FiCheckCircle,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import {
  formatCurrency, formatDate,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  getStatusColor, getStatusBgColor,
} from '../../utils/formatters';
import '../Customers/CustomerList.css';
import './ContractList.css';

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      const data = await contractService.findAll();
      setContracts(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar contratos:', error);
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const filtered = contracts.filter((c) => {
    const matchesSearch =
      !search ||
      c.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.motorcycle?.plate?.toLowerCase().includes(search.toLowerCase()) ||
      c.motorcycle?.model?.toLowerCase().includes(search.toLowerCase()) ||
      c.motorcycle?.brand?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusCounts = {
    ALL: contracts.length,
    ACTIVE: contracts.filter((c) => c.status === 'ACTIVE').length,
    OVERDUE: contracts.filter((c) => c.status === 'OVERDUE').length,
    FINISHED: contracts.filter((c) => c.status === 'FINISHED').length,
    CANCELLED: contracts.filter((c) => c.status === 'CANCELLED').length,
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="contract-list-page">
      <div className="page-header">
        <div>
          <h1>Contratos</h1>
          <span className="page-header-sub">{contracts.length} cadastrados</span>
        </div>
        <button className="btn-primary" onClick={() => navigate('/contratos/novo')}>
          <FiPlus /> Novo Contrato
        </button>
      </div>

      <div className="mini-kpi-row">
        <div className="mini-kpi">
          <div className="mini-kpi-icon"><FiFileText /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{statusCounts.ALL}</span>
            <span className="mini-kpi-label">Total</span>
          </div>
        </div>
        <div className="mini-kpi success">
          <div className="mini-kpi-icon"><FiCheckCircle /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{statusCounts.ACTIVE}</span>
            <span className="mini-kpi-label">Ativos</span>
          </div>
        </div>
        <div className="mini-kpi warning">
          <div className="mini-kpi-icon"><FiAlertTriangle /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{statusCounts.OVERDUE}</span>
            <span className="mini-kpi-label">Em Atraso</span>
          </div>
        </div>
        <div className="mini-kpi info">
          <div className="mini-kpi-icon"><FiCalendar /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{statusCounts.FINISHED}</span>
            <span className="mini-kpi-label">Finalizados</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="contracts-filters">
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Buscar por locador, moto ou placa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="status-chips">
          {Object.entries(statusCounts).map(([status, count]) => (
            <button
              key={status}
              className={`status-chip ${statusFilter === status ? 'active' : ''} ${status.toLowerCase()}`}
              onClick={() => setStatusFilter(status)}
            >
              {status === 'ALL' ? 'Todos' : CONTRACT_STATUS_LABELS[status]} ({count})
            </button>
          ))}
        </div>
      </div>

      {/* Contracts */}
      {filtered.length === 0 ? (
        <div className="empty-state-card">
          <FiInbox />
          <p>Nenhum contrato encontrado</p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="table-container contracts-table-desktop">
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Locador</th>
                    <th>Moto</th>
                    <th>Tipo</th>
                    <th>Período</th>
                    <th>Semanal</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((contract) => (
                    <tr key={contract.contractId} onClick={() => navigate(`/contratos/${contract.contractId}`)}>
                      <td>
                        <div className="contract-cell-user">
                          <div className="contract-cell-avatar">
                            {contract.user?.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <span>{contract.user?.name || '—'}</span>
                        </div>
                      </td>
                      <td>{contract.motorcycle?.brand} {contract.motorcycle?.model}</td>
                      <td>{RENTAL_TYPE_LABELS[contract.rentalType] || contract.rentalType}</td>
                      <td>{formatDate(contract.startDate)} — {formatDate(contract.endDate)}</td>
                      <td>{formatCurrency(contract.weeklyAmount)}</td>
                      <td>{formatCurrency(contract.totalAmount)}</td>
                      <td>
                        <span
                          className="status-badge"
                          style={{
                            background: getStatusBgColor(contract.status),
                            color: getStatusColor(contract.status),
                          }}
                        >
                          {CONTRACT_STATUS_LABELS[contract.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="contracts-cards-mobile">
            {filtered.map((contract) => (
              <div
                key={contract.contractId}
                className="contract-card"
                onClick={() => navigate(`/contratos/${contract.contractId}`)}
              >
                <div className="contract-card-top">
                  <div className="contract-card-user">
                    <div className="contract-cell-avatar">
                      {contract.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <h4>{contract.user?.name || '—'}</h4>
                      <p className="contract-card-moto">
                        <FiTruck /> {contract.motorcycle?.brand} {contract.motorcycle?.model} — {contract.motorcycle?.plate?.toUpperCase()}
                      </p>
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
                <div className="contract-card-details">
                  <div className="contract-card-detail">
                    <FiCalendar />
                    <span>{formatDate(contract.startDate)} — {formatDate(contract.endDate)}</span>
                  </div>
                  <div className="contract-card-detail">
                    <FiFileText />
                    <span>{RENTAL_TYPE_LABELS[contract.rentalType]}</span>
                  </div>
                  <div className="contract-card-detail">
                    <FiDollarSign />
                    <span>{formatCurrency(contract.weeklyAmount)}/sem · Total {formatCurrency(contract.totalAmount)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ContractList;
