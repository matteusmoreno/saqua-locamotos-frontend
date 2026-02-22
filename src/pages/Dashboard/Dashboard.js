import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUsers, FiTruck, FiFileText, FiAlertTriangle, FiInbox } from 'react-icons/fi';
import userService from '../../services/userService';
import motorcycleService from '../../services/motorcycleService';
import { formatCPF } from '../../utils/formatters';
import './Dashboard.css';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [customersData, motorcyclesData] = await Promise.all([
        userService.findAllCustomers(),
        motorcycleService.findAll(),
      ]);
      setCustomers(Array.isArray(customersData) ? customersData : []);
      setMotorcycles(Array.isArray(motorcyclesData) ? motorcyclesData : []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableMotos = motorcycles.filter((m) => m.available && m.active);
  const rentedMotos = motorcycles.filter((m) => !m.available && m.active);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/locadores')}>
          <div className="stat-icon amber">
            <FiUsers />
          </div>
          <div className="stat-info">
            <h3>{customers.length}</h3>
            <p>Locadores cadastrados</p>
          </div>
        </div>

        <div className="stat-card" onClick={() => navigate('/motos')}>
          <div className="stat-icon blue">
            <FiTruck />
          </div>
          <div className="stat-info">
            <h3>{motorcycles.filter((m) => m.active).length}</h3>
            <p>Motos ativas</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <FiFileText />
          </div>
          <div className="stat-info">
            <h3>{availableMotos.length}</h3>
            <p>Motos disponíveis</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon red">
            <FiAlertTriangle />
          </div>
          <div className="stat-info">
            <h3>{rentedMotos.length}</h3>
            <p>Motos alugadas</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Locadores Recentes</h2>
            <button className="view-all" onClick={() => navigate('/locadores')}>
              Ver todos
            </button>
          </div>
          {customers.length === 0 ? (
            <div className="empty-state">
              <FiInbox />
              <p>Nenhum locador cadastrado</p>
            </div>
          ) : (
            <ul className="quick-list">
              {customers.slice(0, 5).map((customer) => (
                <li
                  key={customer.customerId}
                  className="quick-list-item"
                  onClick={() => navigate(`/locadores/${customer.customerId}`)}
                >
                  <div className="quick-list-left">
                    <div className="quick-list-avatar">
                      {customer.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="quick-list-info">
                      <h4>{customer.name}</h4>
                      <p>{formatCPF(customer.cpf)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Motos Disponíveis</h2>
            <button className="view-all" onClick={() => navigate('/motos')}>
              Ver todas
            </button>
          </div>
          {availableMotos.length === 0 ? (
            <div className="empty-state">
              <FiInbox />
              <p>Nenhuma moto disponível</p>
            </div>
          ) : (
            <ul className="quick-list">
              {availableMotos.slice(0, 5).map((moto) => (
                <li
                  key={moto.motorcycleId}
                  className="quick-list-item"
                  onClick={() => navigate(`/motos/${moto.motorcycleId}`)}
                >
                  <div className="quick-list-left">
                    <div className="quick-list-avatar">
                      {moto.brand?.charAt(0).toUpperCase()}
                    </div>
                    <div className="quick-list-info">
                      <h4>{moto.brand} {moto.model}</h4>
                      <p>{moto.plate} &middot; {moto.year} &middot; {moto.color}</p>
                    </div>
                  </div>
                  <span
                    className="status-badge"
                    style={{ background: 'var(--success-bg)', color: 'var(--success)' }}
                  >
                    Disponível
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
