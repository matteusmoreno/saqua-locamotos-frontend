import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiTruck, FiChevronRight, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';
import motorcycleService from '../../services/motorcycleService';
import './MotorcycleList.css';
import '../Customers/CustomerList.css';

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

  const getStatusLabel = (moto) => {
    if (!moto.active) return 'Inativa';
    if (moto.available) return 'Disponível';
    return 'Alugada';
  };

  const getStatusBadge = (moto) => {
    if (!moto.active) return { bg: 'var(--danger-bg)', color: 'var(--danger)' };
    if (moto.available) return { bg: 'var(--success-bg)', color: 'var(--success)' };
    return { bg: 'var(--warning-bg)', color: 'var(--warning)' };
  };

  const filtered = motorcycles
    .filter((m) => {
      if (filter === 'AVAILABLE') return m.available && m.active;
      if (filter === 'RENTED') return !m.available && m.active;
      if (filter === 'INACTIVE') return !m.active;
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

  const totalMotos = motorcycles.length;
  const availableCount = motorcycles.filter((m) => m.available && m.active).length;
  const rentedCount = motorcycles.filter((m) => !m.available && m.active).length;
  const inactiveCount = motorcycles.filter((m) => !m.active).length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Motos</h1>
          <span className="page-header-sub">{totalMotos} cadastradas</span>
        </div>
        <button className="btn-primary" onClick={() => navigate('/motos/nova')}>
          <FiPlus />
          Nova Moto
        </button>
      </div>

      <div className="mini-kpi-row">
        <div className="mini-kpi">
          <div className="mini-kpi-icon"><FiTruck /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{totalMotos}</span>
            <span className="mini-kpi-label">Total</span>
          </div>
        </div>
        <div className="mini-kpi success">
          <div className="mini-kpi-icon"><FiCheckCircle /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{availableCount}</span>
            <span className="mini-kpi-label">Disponíveis</span>
          </div>
        </div>
        <div className="mini-kpi warning">
          <div className="mini-kpi-icon"><FiTruck /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{rentedCount}</span>
            <span className="mini-kpi-label">Alugadas</span>
          </div>
        </div>
        <div className="mini-kpi danger">
          <div className="mini-kpi-icon"><FiAlertTriangle /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{inactiveCount}</span>
            <span className="mini-kpi-label">Inativas</span>
          </div>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 12 }}>
        <FiSearch />
        <input
          type="text"
          placeholder="Buscar por marca, modelo, placa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="filters-bar">
        {['ALL', 'AVAILABLE', 'RENTED', 'INACTIVE'].map((f) => (
          <button
            key={f}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {{ ALL: 'Todas', AVAILABLE: 'Disponíveis', RENTED: 'Alugadas', INACTIVE: 'Inativas' }[f]}
          </button>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Marca / Modelo</th>
                <th>Placa</th>
                <th>Ano</th>
                <th>Cor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((moto) => (
                <tr key={moto.motorcycleId} onClick={() => navigate(`/motos/${moto.motorcycleId}`)}>
                  <td style={{ fontWeight: 600 }}>{moto.brand} {moto.model}</td>
                  <td>{moto.plate?.toUpperCase()}</td>
                  <td>{moto.year}</td>
                  <td>{moto.color}</td>
                  <td>
                    <span
                      className="status-badge"
                      style={{ background: getStatusBadge(moto).bg, color: getStatusBadge(moto).color }}
                    >
                      {getStatusLabel(moto)}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    Nenhuma moto encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="moto-cards">
        {filtered.map((moto) => (
          <div
            key={moto.motorcycleId}
            className="moto-card"
            onClick={() => navigate(`/motos/${moto.motorcycleId}`)}
          >
            <div className="moto-card-icon">
              <FiTruck />
            </div>
            <div className="moto-card-info">
              <h4>{moto.brand} {moto.model}</h4>
              <p>{moto.plate?.toUpperCase()} &middot; {moto.year} &middot; {moto.color}</p>
            </div>
            <div className="moto-card-right">
              <span
                className="status-badge"
                style={{ background: getStatusBadge(moto).bg, color: getStatusBadge(moto).color }}
              >
                {getStatusLabel(moto)}
              </span>
              <FiChevronRight style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>Nenhuma moto encontrada</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MotorcycleList;
