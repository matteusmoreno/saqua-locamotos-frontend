import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiFileText, FiTruck, FiCalendar,
  FiDollarSign, FiAlertTriangle, FiCheckCircle, FiX,
  FiChevronRight, FiClock, FiXCircle, FiInbox,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import {
  formatCurrency, formatDate,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  getStatusColor, getStatusBgColor,
} from '../../utils/formatters';
import './ContractList.css';

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

const STATUS_FILTERS = [
  { key: 'ALL',       label: 'Todos',      icon: <FiFileText /> },
  { key: 'ACTIVE',    label: 'Ativos',     icon: <FiCheckCircle /> },
  { key: 'OVERDUE',   label: 'Em Atraso',  icon: <FiAlertTriangle /> },
  { key: 'FINISHED',  label: 'Finalizados',icon: <FiClock /> },
  { key: 'CANCELLED', label: 'Cancelados', icon: <FiXCircle /> },
];

function ContractAvatar({ name, pictureUrl }) {
  const [imgError, setImgError] = useState(false);
  const [color, bg] = getAvatarColor(name);
  const initial = name?.charAt(0).toUpperCase() || '?';
  if (pictureUrl && !imgError) {
    return (
      <img
        src={pictureUrl}
        alt={name}
        className="clist-avatar clist-avatar-photo"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="clist-avatar clist-avatar-initial" style={{ background: bg, color }}>
      {initial}
    </div>
  );
}

function ContractList() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => { loadContracts(); }, []);

  const loadContracts = async () => {
    try {
      const data = await contractService.findAll();
      setContracts(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Erro ao carregar contratos');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return contracts.filter((c) => {
      const matchSearch = !term
        || c.user?.name?.toLowerCase().includes(term)
        || c.motorcycle?.plate?.toLowerCase().includes(term)
        || c.motorcycle?.model?.toLowerCase().includes(term)
        || c.motorcycle?.brand?.toLowerCase().includes(term);
      const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [contracts, search, statusFilter]);

  const counts = {
    ALL:       contracts.length,
    ACTIVE:    contracts.filter((c) => c.status === 'ACTIVE').length,
    OVERDUE:   contracts.filter((c) => c.status === 'OVERDUE').length,
    FINISHED:  contracts.filter((c) => c.status === 'FINISHED').length,
    CANCELLED: contracts.filter((c) => c.status === 'CANCELLED').length,
  };

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  return (
    <div className="clist-page">

      {/* ── Header ── */}
      <div className="clist-header">
        <div className="clist-header-left">
          <h1 className="clist-title">Contratos</h1>
          <span className="clist-subtitle">{contracts.length} cadastrado{contracts.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="clist-btn-new" onClick={() => navigate('/contratos/novo')}>
          <FiPlus /> Novo Contrato
        </button>
      </div>

      {/* ── KPI row ── */}
      <div className="clist-kpis">
        <div className="clist-kpi">
          <div className="clist-kpi-icon neutral"><FiFileText /></div>
          <div className="clist-kpi-body">
            <span className="clist-kpi-value">{counts.ALL}</span>
            <span className="clist-kpi-label">Total</span>
          </div>
        </div>
        <div className="clist-kpi">
          <div className="clist-kpi-icon success"><FiCheckCircle /></div>
          <div className="clist-kpi-body">
            <span className="clist-kpi-value">{counts.ACTIVE}</span>
            <span className="clist-kpi-label">Ativos</span>
          </div>
        </div>
        <div className="clist-kpi">
          <div className="clist-kpi-icon warning"><FiAlertTriangle /></div>
          <div className="clist-kpi-body">
            <span className="clist-kpi-value">{counts.OVERDUE}</span>
            <span className="clist-kpi-label">Em Atraso</span>
          </div>
        </div>
        <div className="clist-kpi">
          <div className="clist-kpi-icon info"><FiClock /></div>
          <div className="clist-kpi-body">
            <span className="clist-kpi-value">{counts.FINISHED}</span>
            <span className="clist-kpi-label">Finalizados</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="clist-toolbar">
        <div className="clist-search">
          <FiSearch className="clist-search-icon" />
          <input
            type="text"
            placeholder="Buscar por locador, moto ou placa…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clist-search-clear" onClick={() => setSearch('')}>
              <FiX />
            </button>
          )}
        </div>

        <div className="clist-filters">
          {STATUS_FILTERS.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`clist-filter-chip ${statusFilter === key ? 'active' : ''} clist-chip-${key.toLowerCase()}`}
              onClick={() => setStatusFilter(key)}
            >
              {icon} {label}
              {counts[key] > 0 && (
                <span className="clist-chip-count">{counts[key]}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      {filtered.length === 0 ? (
        <div className="clist-empty">
          <FiInbox className="clist-empty-icon" />
          <h3>Nenhum contrato encontrado</h3>
          <p>{search || statusFilter !== 'ALL' ? 'Tente ajustar os filtros de busca.' : 'Crie o primeiro contrato para começar.'}</p>
          {!search && statusFilter === 'ALL' && (
            <button className="clist-btn-new" onClick={() => navigate('/contratos/novo')}>
              <FiPlus /> Novo Contrato
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="clist-results-count">
            {filtered.length} contrato{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="clist-grid">
            {filtered.map((contract) => {
              const stripe = STATUS_STRIPE[contract.status] || '#64748B';
              return (
                <div
                  key={contract.contractId}
                  className="clist-card"
                  onClick={() => navigate(`/contratos/${contract.contractId}`)}
                  style={{ '--stripe': stripe }}
                >
                  {/* Status stripe */}
                  <div className="clist-card-stripe" />

                  {/* Top row */}
                  <div className="clist-card-top">
                    <div className="clist-card-user">
                      <ContractAvatar
                        name={contract.user?.name}
                        pictureUrl={contract.user?.pictureUrl}
                      />
                      <div className="clist-card-user-info">
                        <span className="clist-card-name">{contract.user?.name || '—'}</span>
                        <span className="clist-card-rental-type">
                          {RENTAL_TYPE_LABELS[contract.rentalType] || contract.rentalType}
                        </span>
                      </div>
                    </div>
                    <div className="clist-card-top-right">
                      <span
                        className="clist-status-badge"
                        style={{
                          background: getStatusBgColor(contract.status),
                          color: getStatusColor(contract.status),
                        }}
                      >
                        {CONTRACT_STATUS_LABELS[contract.status]}
                      </span>
                      <span className="clist-card-id">#{contract.contractId?.toString().slice(-4) || '—'}</span>
                    </div>
                  </div>

                  {/* Moto row */}
                  <div className="clist-card-moto">
                    <div className="clist-card-moto-icon"><FiTruck /></div>
                    <div className="clist-card-moto-info">
                      <span className="clist-card-moto-name">
                        {contract.motorcycle?.brand} {contract.motorcycle?.model}
                      </span>
                      <span className="clist-card-moto-plate">
                        {contract.motorcycle?.plate?.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="clist-card-divider" />

                  {/* Details row */}
                  <div className="clist-card-details">
                    <div className="clist-card-detail">
                      <FiCalendar className="clist-detail-icon" />
                      <span>{formatDate(contract.startDate)} → {formatDate(contract.endDate)}</span>
                    </div>
                    <div className="clist-card-detail">
                      <FiDollarSign className="clist-detail-icon" />
                      <span>{formatCurrency(contract.weeklyAmount)}<span className="clist-per">/sem</span></span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="clist-card-footer">
                    <div className="clist-card-total">
                      <span className="clist-total-label">Total do contrato</span>
                      <span className="clist-total-value">{formatCurrency(contract.totalAmount)}</span>
                    </div>
                    <div className="clist-card-arrow">
                      <FiChevronRight />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export default ContractList;
