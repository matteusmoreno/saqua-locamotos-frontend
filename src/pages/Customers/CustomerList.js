import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiSearch, FiChevronRight, FiUsers } from 'react-icons/fi';
import userService from '../../services/userService';
import { formatCPF, formatPhone } from '../../utils/formatters';
import './CustomerList.css';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await userService.findAllCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao carregar locadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = customers.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(term) ||
      c.cpf?.includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.phone?.includes(term)
    );
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Locadores</h1>
          <span className="page-header-sub">{customers.length} cadastrados</span>
        </div>
        <button className="btn-primary" onClick={() => navigate('/locadores/novo')}>
          <FiPlus />
          Novo Locador
        </button>
      </div>

      <div className="mini-kpi-row">
        <div className="mini-kpi">
          <div className="mini-kpi-icon"><FiUsers /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{customers.length}</span>
            <span className="mini-kpi-label">Total</span>
          </div>
        </div>
        <div className="mini-kpi success">
          <div className="mini-kpi-icon"><FiUsers /></div>
          <div className="mini-kpi-info">
            <span className="mini-kpi-value">{filtered.length}</span>
            <span className="mini-kpi-label">Filtrados</span>
          </div>
        </div>
      </div>

      <div className="search-bar" style={{ marginBottom: 16 }}>        <FiSearch />
        <input
          type="text"
          placeholder="Buscar por nome, CPF, e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Desktop Table */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Telefone</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer) => (
                <tr key={customer.customerId} onClick={() => navigate(`/locadores/${customer.customerId}`)}>
                  <td style={{ fontWeight: 600 }}>{customer.name}</td>
                  <td>{formatCPF(customer.cpf)}</td>
                  <td>{formatPhone(customer.phone)}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{customer.email}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 40 }}>
                    Nenhum locador encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="customer-cards">
        {filtered.map((customer) => (
          <div
            key={customer.customerId}
            className="customer-card"
            onClick={() => navigate(`/locadores/${customer.customerId}`)}
          >
            <div className="customer-card-avatar">
              {customer.name?.charAt(0).toUpperCase()}
            </div>
            <div className="customer-card-info">
              <h4>{customer.name}</h4>
              <p>{formatCPF(customer.cpf)} &middot; {formatPhone(customer.phone)}</p>
            </div>
            <FiChevronRight className="customer-card-arrow" />
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <p>Nenhum locador encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CustomerList;
