import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiSearch, FiUsers, FiUserCheck, FiUserX,
  FiChevronRight, FiFilter, FiX, FiPhone, FiMail,
  FiGrid, FiList,
} from 'react-icons/fi';
import userService from '../../services/userService';
import { formatCPF, formatPhone } from '../../utils/formatters';
import './CustomerList.css';

/* Paleta de cores para avatares sem foto */
const AVATAR_COLORS = [
  ['#7C3AED', '#EDE9FE'],
  ['#0EA5E9', '#E0F2FE'],
  ['#10B981', '#D1FAE5'],
  ['#F59E0B', '#FEF3C7'],
  ['#EF4444', '#FEE2E2'],
  ['#EC4899', '#FCE7F3'],
  ['#6366F1', '#EEF2FF'],
  ['#14B8A6', '#CCFBF1'],
];

function getAvatarColor(name = '') {
  const idx = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function Avatar({ customer, size = 'md' }) {
  const [imgError, setImgError] = useState(false);
  const [color, bg] = getAvatarColor(customer.name);
  const initial = customer.name?.charAt(0).toUpperCase() || '?';

  if (customer.pictureUrl && !imgError) {
    return (
      <img
        src={customer.pictureUrl}
        alt={customer.name}
        className={`cl-avatar cl-avatar-${size}`}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className={`cl-avatar cl-avatar-${size} cl-avatar-initial`}
      style={{ background: bg, color }}
    >
      {initial}
    </div>
  );
}

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [filterActive, setFilterActive] = useState('all'); // 'all' | 'with-contract' | 'no-contract'
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

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    return customers.filter((c) => {
      const matchSearch =
        !term ||
        c.name?.toLowerCase().includes(term) ||
        c.cpf?.includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.phone?.includes(term);
      return matchSearch;
    });
  }, [customers, search]);

  const totalWithDocs = customers.filter(
    (c) => c.documents && Object.values(c.documents).some(Boolean)
  ).length;

  const clearSearch = () => setSearch('');

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="cl-page">

      {/* ── Page header ── */}
      <div className="cl-header">
        <div className="cl-header-left">
          <h1 className="cl-title">Locadores</h1>
          <span className="cl-subtitle">{customers.length} cadastrado{customers.length !== 1 ? 's' : ''}</span>
        </div>
        <button className="cl-btn-new" onClick={() => navigate('/locadores/novo')}>
          <FiPlus /> Novo Locador
        </button>
      </div>

      {/* ── KPI row ── */}
      <div className="cl-kpis">
        <div className="cl-kpi">
          <div className="cl-kpi-icon primary"><FiUsers /></div>
          <div className="cl-kpi-body">
            <span className="cl-kpi-value">{customers.length}</span>
            <span className="cl-kpi-label">Total de locadores</span>
          </div>
        </div>
        <div className="cl-kpi">
          <div className="cl-kpi-icon success"><FiUserCheck /></div>
          <div className="cl-kpi-body">
            <span className="cl-kpi-value">{totalWithDocs}</span>
            <span className="cl-kpi-label">Com documentos</span>
          </div>
        </div>
        <div className="cl-kpi">
          <div className="cl-kpi-icon warning"><FiUserX /></div>
          <div className="cl-kpi-body">
            <span className="cl-kpi-value">{customers.length - totalWithDocs}</span>
            <span className="cl-kpi-label">Sem documentos</span>
          </div>
        </div>
        <div className="cl-kpi">
          <div className="cl-kpi-icon info"><FiFilter /></div>
          <div className="cl-kpi-body">
            <span className="cl-kpi-value">{filtered.length}</span>
            <span className="cl-kpi-label">Resultado da busca</span>
          </div>
        </div>
      </div>

      {/* ── Toolbar ── */}
      <div className="cl-toolbar">
        <div className="cl-search">
          <FiSearch className="cl-search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome, CPF, e-mail ou telefone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="cl-search-clear" onClick={clearSearch}>
              <FiX />
            </button>
          )}
        </div>

        <div className="cl-view-toggle">
          <button
            className={`cl-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Cards"
          >
            <FiGrid />
          </button>
          <button
            className={`cl-view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
            title="Lista"
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div className="cl-empty">
          <div className="cl-empty-icon"><FiUsers /></div>
          <h3>{search ? 'Nenhum locador encontrado' : 'Nenhum locador cadastrado'}</h3>
          <p>{search ? 'Tente outro termo de busca.' : 'Clique em "Novo Locador" para começar.'}</p>
          {search && (
            <button className="cl-btn-ghost" onClick={clearSearch}>
              <FiX /> Limpar busca
            </button>
          )}
        </div>
      )}

      {/* ── Grid view ── */}
      {viewMode === 'grid' && filtered.length > 0 && (
        <div className="cl-grid">
          {filtered.map((customer) => {
            const docsCount = customer.documents
              ? Object.values(customer.documents).filter(Boolean).length
              : 0;
            const totalDocs = 6;

            return (
              <div
                key={customer.customerId}
                className="cl-card"
                onClick={() => navigate(`/locadores/${customer.customerId}`)}
              >
                <div className="cl-card-top">
                  <Avatar customer={customer} size="lg" />
                  <div className="cl-card-meta">
                    <h3 className="cl-card-name">{customer.name}</h3>
                    {customer.occupation && (
                      <span className="cl-card-occupation">{customer.occupation}</span>
                    )}
                  </div>
                  <FiChevronRight className="cl-card-arrow" />
                </div>

                <div className="cl-card-contacts">
                  {customer.phone && (
                    <div className="cl-card-contact-row">
                      <FiPhone className="cl-card-contact-icon" />
                      <span>{formatPhone(customer.phone)}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="cl-card-contact-row">
                      <FiMail className="cl-card-contact-icon" />
                      <span className="cl-card-email">{customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="cl-card-footer">
                  <span className="cl-card-cpf">{formatCPF(customer.cpf)}</span>
                  <div className="cl-card-docs" title={`${docsCount} de ${totalDocs} documentos enviados`}>
                    <div className="cl-card-docs-bar">
                      <div
                        className="cl-card-docs-fill"
                        style={{ width: `${(docsCount / totalDocs) * 100}%` }}
                      />
                    </div>
                    <span className={`cl-card-docs-label ${docsCount === totalDocs ? 'complete' : docsCount > 0 ? 'partial' : 'empty'}`}>
                      {docsCount}/{totalDocs} docs
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── List view ── */}
      {viewMode === 'list' && filtered.length > 0 && (
        <div className="cl-list">
          <div className="cl-list-header">
            <span>Locador</span>
            <span className="cl-list-col-hide-sm">CPF</span>
            <span className="cl-list-col-hide-sm">Telefone</span>
            <span className="cl-list-col-hide-xs">E-mail</span>
            <span className="cl-list-col-hide-sm">Docs</span>
            <span />
          </div>
          {filtered.map((customer) => {
            const docsCount = customer.documents
              ? Object.values(customer.documents).filter(Boolean).length
              : 0;
            return (
              <div
                key={customer.customerId}
                className="cl-list-row"
                onClick={() => navigate(`/locadores/${customer.customerId}`)}
              >
                <div className="cl-list-name-cell">
                  <Avatar customer={customer} size="sm" />
                  <div>
                    <span className="cl-list-name">{customer.name}</span>
                    {customer.occupation && (
                      <span className="cl-list-occupation">{customer.occupation}</span>
                    )}
                  </div>
                </div>
                <span className="cl-list-col-hide-sm cl-list-muted">{formatCPF(customer.cpf)}</span>
                <span className="cl-list-col-hide-sm cl-list-muted">{formatPhone(customer.phone)}</span>
                <span className="cl-list-col-hide-xs cl-list-muted cl-list-email">{customer.email}</span>
                <span className="cl-list-col-hide-sm">
                  <span className={`cl-doc-badge ${docsCount === 6 ? 'complete' : docsCount > 0 ? 'partial' : 'empty'}`}>
                    {docsCount}/6
                  </span>
                </span>
                <FiChevronRight className="cl-list-arrow" />
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}

export default CustomerList;

