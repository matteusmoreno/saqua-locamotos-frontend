import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiTruck, FiChevronRight, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import motorcycleService from '../../services/motorcycleService';
import './MotorcycleList.css';

function MotorcycleList() {
  const [motorcycles, setMotorcycles] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadMotorcycles();
  }, []);

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

  const STATUS_META = {
    AVAILABLE: { label: 'Disponível', color: 'var(--success)', bg: 'var(--success-bg)', stripe: '#34d399' },
    RENTED:    { label: 'Alugada',    color: 'var(--warning)', bg: 'var(--warning-bg)', stripe: '#fbbf24' },
    INACTIVE:  { label: 'Inativa',    color: 'var(--danger)',  bg: 'var(--danger-bg)',  stripe: '#f87171' },
  };

  const getStatus = (moto) => {
    if (!moto.active) return 'INACTIVE';
    if (moto.available) return 'AVAILABLE';
    return 'RENTED';
  };

  const filtered = motorcycles
    .filter((m) => {
      const s = getStatus(m);
      if (filter === 'AVAILABLE') return s === 'AVAILABLE';
      if (filter === 'RENTED')    return s === 'RENTED';
      if (filter === 'INACTIVE')  return s === 'INACTIVE';
      return true;
    })
    .filter((m) => {
      const term = search.toLowerCase();
      return (
        m.brand?.toLowerCase().includes(term) ||
        m.model?.toLowerCase().includes(term) ||
        m.plate?.toLowerCase().includes(term) ||
        m.color?.toLowerCase().includes(term)
      );
    });

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
        <div>
          <h1 className="ml-title">Motos</h1>
          <span className="ml-subtitle">{total} cadastrada{total !== 1 ? 's' : ''}</span>
        </div>
        <button className="btn-primary" onClick={() => navigate('/motos/nova')}>
          <FiPlus /> Nova Moto
        </button>
      </div>

      {/* KPIs */}
      <div className="ml-kpis">
        <div className="ml-kpi">
          <div className="ml-kpi-icon neutral"><FiTruck /></div>
          <div>
            <span className="ml-kpi-value">{total}</span>
            <span className="ml-kpi-label">Total</span>
          </div>
        </div>
        <div className="ml-kpi" onClick={() => setFilter(filter === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')} style={{ cursor: 'pointer' }}>
          <div className="ml-kpi-icon available"><FiCheckCircle /></div>
          <div>
            <span className="ml-kpi-value">{available}</span>
            <span className="ml-kpi-label">Disponíveis</span>
          </div>
        </div>
        <div className="ml-kpi" onClick={() => setFilter(filter === 'RENTED' ? 'ALL' : 'RENTED')} style={{ cursor: 'pointer' }}>
          <div className="ml-kpi-icon rented"><FiAlertTriangle /></div>
          <div>
            <span className="ml-kpi-value">{rented}</span>
            <span className="ml-kpi-label">Alugadas</span>
          </div>
        </div>
        <div className="ml-kpi" onClick={() => setFilter(filter === 'INACTIVE' ? 'ALL' : 'INACTIVE')} style={{ cursor: 'pointer' }}>
          <div className="ml-kpi-icon inactive"><FiXCircle /></div>
          <div>
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
      </div>

      {/* Card Grid */}
      <div className="ml-grid">
        {filtered.map((moto) => {
          const s = getStatus(moto);
          const meta = STATUS_META[s];
          return (
            <div
              key={moto.motorcycleId}
              className="ml-card"
              onClick={() => navigate(`/motos/${moto.motorcycleId}`)}
            >
              <div className="ml-card-stripe" style={{ background: meta.stripe }} />
              <div className="ml-card-icon"><FiTruck /></div>
              <div className="ml-card-body">
                <div className="ml-card-top">
                  <span className="ml-card-name">{moto.brand} {moto.model}</span>
                  <span className="ml-card-status" style={{ background: meta.bg, color: meta.color }}>
                    {meta.label}
                  </span>
                </div>
                <div className="ml-card-plate">{moto.plate?.toUpperCase()}</div>
                <div className="ml-card-meta">
                  <span>{moto.year}</span>
                  <span className="ml-card-dot">·</span>
                  <span>{moto.color}</span>
                  {moto.mileage != null && (
                    <>
                      <span className="ml-card-dot">·</span>
                      <span>{moto.mileage.toLocaleString('pt-BR')} km</span>
                    </>
                  )}
                </div>
              </div>
              <FiChevronRight className="ml-card-arrow" />
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="ml-empty">
            <FiTruck />
            <p>Nenhuma moto encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MotorcycleList;
