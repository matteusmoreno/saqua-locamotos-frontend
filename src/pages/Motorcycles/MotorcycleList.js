import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiTruck, FiChevronRight,
  FiCheckCircle, FiAlertTriangle, FiXCircle,
  FiGrid, FiList, FiX, FiHash, FiDroplet,
} from 'react-icons/fi';
import motorcycleService from '../../services/motorcycleService';
import './MotorcycleList.css';
import '../Customers/CustomerList.css';

const STATUS_META = {
  AVAILABLE: { label: 'Disponível', color: 'var(--success)', bg: 'var(--success-bg)', stripe: '#34d399' },
  RENTED:    { label: 'Alugada',    color: 'var(--warning)', bg: 'var(--warning-bg)', stripe: '#fbbf24' },
  INACTIVE:  { label: 'Inativa',    color: 'var(--danger)',  bg: 'var(--danger-bg)',  stripe: '#f87171' },
};

function getStatus(moto) {
  if (!moto.active) return 'INACTIVE';
  if (moto.available) return 'AVAILABLE';
  return 'RENTED';
}

function MotoThumb({ moto, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  if (moto.pictureUrl && !imgError) {
    return (
      <img
        src={moto.pictureUrl}
        alt={`${moto.brand} ${moto.model}`}
        className={`cl-avatar cl-avatar-${size}`}
        onError={() => setImgError(true)}
      />
    );
  }
  // Usa a cor baseada na placa para variar entre motos
  const COLORS = [
    ['#7C3AED','#EDE9FE'],['#0EA5E9','#E0F2FE'],['#10B981','#D1FAE5'],
    ['#F59E0B','#FEF3C7'],['#EF4444','#FEE2E2'],['#6366F1','#EEF2FF'],
  ];
  const [color, bg] = COLORS[(moto.plate?.charCodeAt(0) || 0) % COLORS.length];
  return (
    <div
      className={`cl-avatar cl-avatar-${size} cl-avatar-initial`}
      style={{ background: bg, color }}
    >
      <FiTruck style={{ fontSize: size === 'lg' ? '1.35rem' : '0.85rem' }} />
    </div>
  );
}

function MotorcycleList() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('grid');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadMotorcycles(); }, []);

  const loadMotorcycles = async () => {
    try {
      const data = await motorcycleService.findAll();
      setMotorcycles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar motos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return motorcycles.filter((m) => {
      const s = getStatus(m);
      const matchFilter =
        filter === 'ALL' ||
        (filter === 'AVAILABLE' && s === 'AVAILABLE') ||
        (filter === 'RENTED'    && s === 'RENTED') ||
        (filter === 'INACTIVE'  && s === 'INACTIVE');
      const matchSearch =
        !term ||
        m.brand?.toLowerCase().includes(term) ||
        m.model?.toLowerCase().includes(term) ||
        m.plate?.toLowerCase().includes(term) ||
        m.color?.toLowerCase().includes(term);
      return matchFilter && matchSearch;
    });
  }, [motorcycles, search, filter]);

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const total    = motorcycles.length;
  const available = motorcycles.filter((m) => m.available && m.active).length;
  const rented   = motorcycles.filter((m) => !m.available && m.active).length;
  const inactive = motorcycles.filter((m) => !m.active).length;

  return (
    <div className="ml-page">

      {/* Header */}
      <div className="ml-header">
        <div className="ml-header-left">
          <h1 className="ml-title">Motos</h1>
          <span className="ml-subtitle">{total} cadastrada{total !== 1 ? 's' : ''}</span>
        </div>
        <button className="ml-btn-new" onClick={() => navigate('/motos/nova')}>
          <FiPlus /> Nova Moto
        </button>
      </div>

      {/* KPIs */}
      <div className="ml-kpis">
        <div className="ml-kpi">
          <div className="ml-kpi-icon neutral"><FiTruck /></div>
          <div className="ml-kpi-body">
            <span className="ml-kpi-value">{total}</span>
            <span className="ml-kpi-label">Total</span>
          </div>
        </div>
        <div className="ml-kpi ml-kpi-clickable" onClick={() => setFilter(filter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')} data-active={filter === 'AVAILABLE'}>
          <div className="ml-kpi-icon available"><FiCheckCircle /></div>
          <div className="ml-kpi-body">
            <span className="ml-kpi-value">{available}</span>
            <span className="ml-kpi-label">Disponíveis</span>
          </div>
        </div>
        <div className="ml-kpi ml-kpi-clickable" onClick={() => setFilter(filter === 'RENTED' ? 'ALL' : 'RENTED')} data-active={filter === 'RENTED'}>
          <div className="ml-kpi-icon rented"><FiAlertTriangle /></div>
          <div className="ml-kpi-body">
            <span className="ml-kpi-value">{rented}</span>
            <span className="ml-kpi-label">Alugadas</span>
          </div>
        </div>
        <div className="ml-kpi ml-kpi-clickable" onClick={() => setFilter(filter === 'INACTIVE' ? 'ALL' : 'INACTIVE')} data-active={filter === 'INACTIVE'}>
          <div className="ml-kpi-icon inactive"><FiXCircle /></div>
          <div className="ml-kpi-body">
            <span className="ml-kpi-value">{inactive}</span>
            <span className="ml-kpi-label">Inativas</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="ml-toolbar">
        <div className="ml-search">
          <FiSearch className="ml-search-icon" />
          <input
            className="ml-search-input"
            placeholder="Buscar por marca, modelo, placa ou cor…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="ml-search-clear" onClick={() => setSearch('')}><FiX /></button>
          )}
        </div>

        <div className="ml-filters">
          {[
            { key: 'ALL',       label: 'Todas' },
            { key: 'AVAILABLE', label: 'Disponíveis' },
            { key: 'RENTED',    label: 'Alugadas' },
            { key: 'INACTIVE',  label: 'Inativas' },
          ].map((f) => (
            <button
              key={f.key}
              className={`ml-filter-btn${filter === f.key ? ' active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="ml-view-toggle">
          <button
            className={`ml-view-btn${viewMode === 'grid' ? ' active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Cards"
          >
            <FiGrid />
          </button>
          <button
            className={`ml-view-btn${viewMode === 'list' ? ' active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Lista"
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* Empty */}
      {filtered.length === 0 && (
        <div className="ml-empty-state">
          <div className="ml-empty-icon"><FiTruck /></div>
          <h3>{search || filter !== 'ALL' ? 'Nenhuma moto encontrada' : 'Nenhuma moto cadastrada'}</h3>
          <p>{search || filter !== 'ALL' ? 'Tente outro termo ou filtro.' : 'Clique em "Nova Moto" para começar.'}</p>
          {(search || filter !== 'ALL') && (
            <button className="ml-btn-ghost" onClick={() => { setSearch(''); setFilter('ALL'); }}>
              <FiX /> Limpar filtros
            </button>
          )}
        </div>
      )}

      {/* Grid view */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="cl-grid">
          {filtered.map((moto) => {
            const meta = STATUS_META[getStatus(moto)];
            return (
              <div
                key={moto.motorcycleId}
                className="cl-card"
                onClick={() => navigate(`/motos/${moto.motorcycleId}`)}
              >
                <div className="cl-card-top">
                  <MotoThumb moto={moto} size="lg" />
                  <div className="cl-card-meta">
                    <h3 className="cl-card-name">{moto.brand} {moto.model}</h3>
                    <span className="cl-card-occupation">{moto.year} &middot; {moto.color}</span>
                  </div>
                  <FiChevronRight className="cl-card-arrow" />
                </div>

                <div className="cl-card-contacts">
                  <div className="cl-card-contact-row">
                    <FiHash className="cl-card-contact-icon" />
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.5px' }}>
                      {moto.plate?.toUpperCase()}
                    </span>
                  </div>
                  {moto.mileage != null && (
                    <div className="cl-card-contact-row">
                      <FiDroplet className="cl-card-contact-icon" />
                      <span>{moto.mileage.toLocaleString('pt-BR')} km</span>
                    </div>
                  )}
                </div>

                <div className="cl-card-footer">
                  <span
                    style={{
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '2px 10px', borderRadius: '9999px',
                      background: meta.bg, color: meta.color,
                    }}
                  >
                    {meta.label}
                  </span>
                  <span
                    className={`cl-doc-badge ${moto.documentUrl ? 'complete' : 'empty'}`}
                  >
                    {moto.documentUrl ? 'doc ✓' : 'sem doc'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && filtered.length > 0 && (
        <div className="ml-list">
          <div className="ml-list-header">
            <span>Moto</span>
            <span className="ml-col-hide-sm">Placa</span>
            <span className="ml-col-hide-sm">Ano / Cor</span>
            <span className="ml-col-hide-xs">Quilometragem</span>
            <span>Status</span>
            <span />
          </div>
          {filtered.map((moto) => {
            const meta = STATUS_META[getStatus(moto)];
            return (
              <div
                key={moto.motorcycleId}
                className="ml-list-row"
                onClick={() => navigate(`/motos/${moto.motorcycleId}`)}
              >
                <div className="ml-list-name-cell">
                  <MotoThumb moto={moto} size="sm" />
                  <div>
                    <span className="ml-list-name">{moto.brand} {moto.model}</span>
                    <span className="ml-list-sub">{moto.plate?.toUpperCase()}</span>
                  </div>
                </div>
                <span className="ml-col-hide-sm ml-list-muted ml-list-mono">{moto.plate?.toUpperCase()}</span>
                <span className="ml-col-hide-sm ml-list-muted">{moto.year} · {moto.color}</span>
                <span className="ml-col-hide-xs ml-list-muted">
                  {moto.mileage != null ? `${moto.mileage.toLocaleString('pt-BR')} km` : '—'}
                </span>
                <span>
                  <span className="ml-status-chip" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </span>
                <FiChevronRight className="ml-list-arrow" />
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default MotorcycleList;
