import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiTruck, FiFileText, FiAlertTriangle, FiInbox,
  FiDollarSign, FiCheckCircle, FiClock, FiPlus, FiArrowRight,
  FiTrendingUp, FiActivity,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import motorcycleService from '../../services/motorcycleService';
import contractService from '../../services/contractService';
import paymentService from '../../services/paymentService';
import { formatCurrency, formatDate, formatCPF } from '../../utils/formatters';
import './Dashboard.css';

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [customersData, motorcyclesData, contractsData] = await Promise.all([
        userService.findAllCustomers(),
        motorcycleService.findAll(),
        contractService.findAll(),
      ]);
      const custs = Array.isArray(customersData) ? customersData : [];
      const motos = Array.isArray(motorcyclesData) ? motorcyclesData : [];
      const rawContracts = Array.isArray(contractsData) ? contractsData : [];

      const enriched = await Promise.all(
        rawContracts.map(async (c) => {
          try {
            const payments = await paymentService.findByContractId(c.contractId);
            return { ...c, payments: Array.isArray(payments) ? payments : [] };
          } catch {
            return { ...c, payments: [] };
          }
        })
      );

      setCustomers(custs);
      setMotorcycles(motos);
      setContracts(enriched);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  // ── Metrics ──────────────────────────────────────────────
  const activeMotos = motorcycles.filter((m) => m.active);
  const availableMotos = motorcycles.filter((m) => m.available && m.active);
  const rentedMotos = motorcycles.filter((m) => !m.available && m.active);

  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE');
  const overdueContracts = contracts.filter((c) => c.status === 'OVERDUE');
  const finishedContracts = contracts.filter((c) => c.status === 'FINISHED');

  const allPayments = contracts.flatMap((c) => c.payments || []);
  const paidPayments = allPayments.filter((p) => p.status === 'PAID');
  const pendingPayments = allPayments.filter((p) => p.status === 'PENDING');
  const overduePayments = allPayments.filter((p) => p.status === 'OVERDUE');
  const totalReceived = paidPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPending = pendingPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalOverdue = overduePayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);

  // Revenue per motorcycle
  const motoRevMap = {};
  contracts.forEach((c) => {
    const id = c.motorcycle?.motorcycleId || 'unknown';
    if (!motoRevMap[id]) {
      motoRevMap[id] = {
        label: `${c.motorcycle?.brand || '?'} ${c.motorcycle?.model || ''} · ${(c.motorcycle?.plate || '').toUpperCase()}`,
        total: 0,
      };
    }
    (c.payments || []).forEach((p) => {
      if (p.status === 'PAID') motoRevMap[id].total += Number(p.amount) || 0;
    });
  });
  const motoRevList = Object.values(motoRevMap)
    .filter((m) => m.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);
  const maxRev = motoRevList[0]?.total || 1;

  // Overdue list: contracts with OVERDUE status or active with overdue payments
  const overdueList = contracts
    .filter(
      (c) =>
        c.status === 'OVERDUE' ||
        (c.status === 'ACTIVE' && (c.payments || []).some((p) => p.status === 'OVERDUE'))
    )
    .slice(0, 6);

  const totalContracts = contracts.length || 1;
  const statusData = [
    { label: 'Ativos', count: activeContracts.length, color: 'var(--success)' },
    { label: 'Atrasados', count: overdueContracts.length, color: 'var(--danger)' },
    { label: 'Finalizados', count: finishedContracts.length, color: 'var(--info)' },
  ];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="db-page">

      {/* ── Quick Actions ──────────────────────── */}
      <div className="db-actions">
        <button className="db-action-btn primary" onClick={() => navigate('/locadores/novo')}>
          <FiPlus /> Novo Locador
        </button>
        <button className="db-action-btn" onClick={() => navigate('/motos/nova')}>
          <FiPlus /> Nova Moto
        </button>
        <button className="db-action-btn" onClick={() => navigate('/contratos/novo')}>
          <FiPlus /> Novo Contrato
        </button>
        <button className="db-action-btn ghost" onClick={() => navigate('/financeiro')}>
          <FiTrendingUp /> Ver Financeiro
        </button>
      </div>

      {/* ── KPI Grid ──────────────────────────── */}
      <div className="db-kpi-grid">
        <div className="db-kpi-card" onClick={() => navigate('/locadores')}>
          <div className="db-kpi-icon amber"><FiUsers /></div>
          <div className="db-kpi-body">
            <span className="db-kpi-value">{customers.length}</span>
            <span className="db-kpi-label">Locadores</span>
          </div>
          <FiArrowRight className="db-kpi-arrow" />
        </div>

        <div className="db-kpi-card" onClick={() => navigate('/motos')}>
          <div className="db-kpi-icon blue"><FiTruck /></div>
          <div className="db-kpi-body">
            <span className="db-kpi-value">{activeMotos.length}</span>
            <span className="db-kpi-label">Motos Ativas</span>
            <span className="db-kpi-sub">{availableMotos.length} disp. · {rentedMotos.length} alugadas</span>
          </div>
          <FiArrowRight className="db-kpi-arrow" />
        </div>

        <div className="db-kpi-card" onClick={() => navigate('/contratos')}>
          <div className="db-kpi-icon green"><FiFileText /></div>
          <div className="db-kpi-body">
            <span className="db-kpi-value">{activeContracts.length}</span>
            <span className="db-kpi-label">Contratos Ativos</span>
            <span className="db-kpi-sub">{finishedContracts.length} finalizados</span>
          </div>
          <FiArrowRight className="db-kpi-arrow" />
        </div>

        <div className="db-kpi-card danger-card" onClick={() => navigate('/contratos')}>
          <div className="db-kpi-icon red"><FiAlertTriangle /></div>
          <div className="db-kpi-body">
            <span className="db-kpi-value">{overdueList.length}</span>
            <span className="db-kpi-label">Em Atraso</span>
            <span className="db-kpi-sub">{formatCurrency(totalOverdue)} em aberto</span>
          </div>
          <FiArrowRight className="db-kpi-arrow" />
        </div>

        <div className="db-kpi-card" onClick={() => navigate('/financeiro')}>
          <div className="db-kpi-icon emerald"><FiCheckCircle /></div>
          <div className="db-kpi-body">
            <span className="db-kpi-value">{formatCurrency(totalReceived)}</span>
            <span className="db-kpi-label">Total Recebido</span>
            <span className="db-kpi-sub">{paidPayments.length} pagamentos</span>
          </div>
          <FiArrowRight className="db-kpi-arrow" />
        </div>

        <div className="db-kpi-card" onClick={() => navigate('/financeiro')}>
          <div className="db-kpi-icon orange"><FiClock /></div>
          <div className="db-kpi-body">
            <span className="db-kpi-value">{formatCurrency(totalPending)}</span>
            <span className="db-kpi-label">A Receber</span>
            <span className="db-kpi-sub">{pendingPayments.length} pendentes</span>
          </div>
          <FiArrowRight className="db-kpi-arrow" />
        </div>
      </div>

      {/* ── Main grid: Overdue + Revenue by moto ─ */}
      <div className="db-main-grid">
        <div className="db-section">
          <div className="db-section-header">
            <h2><FiAlertTriangle className="db-section-icon danger-icon" />Locadores em Atraso</h2>
            <button className="db-view-all" onClick={() => navigate('/contratos')}>
              Ver todos <FiArrowRight />
            </button>
          </div>
          {overdueList.length === 0 ? (
            <div className="db-empty">
              <FiCheckCircle />
              <span>Nenhum locador em atraso</span>
            </div>
          ) : (
            <ul className="db-list">
              {overdueList.map((c) => {
                const overdueAmt = (c.payments || [])
                  .filter((p) => p.status === 'OVERDUE')
                  .reduce((s, p) => s + (Number(p.amount) || 0), 0);
                return (
                  <li key={c.contractId} className="db-list-item" onClick={() => navigate(`/contratos/${c.contractId}`)}>
                    <div className="db-list-avatar danger-avatar">
                      {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="db-list-info">
                      <h4>{c.user?.name || '—'}</h4>
                      <p>{c.motorcycle?.brand} {c.motorcycle?.model} · {(c.motorcycle?.plate || '').toUpperCase()}</p>
                    </div>
                    <div className="db-list-right">
                      <span className="db-amount-danger">{formatCurrency(overdueAmt)}</span>
                      <span className="db-sub-text">em atraso</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="db-section">
          <div className="db-section-header">
            <h2><FiTrendingUp className="db-section-icon" />Receita por Moto</h2>
            <button className="db-view-all" onClick={() => navigate('/financeiro')}>
              Financeiro <FiArrowRight />
            </button>
          </div>
          {motoRevList.length === 0 ? (
            <div className="db-empty">
              <FiInbox />
              <span>Nenhuma receita registrada</span>
            </div>
          ) : (
            <div className="db-bars">
              {motoRevList.map((m, i) => (
                <div key={i} className="db-bar-row">
                  <span className="db-bar-label">{m.label}</span>
                  <div className="db-bar-track">
                    <div
                      className="db-bar-fill"
                      style={{ width: `${(m.total / maxRev) * 100}%` }}
                    />
                  </div>
                  <span className="db-bar-value">{formatCurrency(m.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom grid: Status + Customers + Last payments ── */}
      <div className="db-bottom-grid">
        <div className="db-section">
          <div className="db-section-header">
            <h2><FiActivity className="db-section-icon" />Status dos Contratos</h2>
          </div>
          <div className="db-status-dist">
            {statusData.map((s) => (
              <div key={s.label} className="db-status-row">
                <div className="db-status-left">
                  <span className="db-status-dot" style={{ background: s.color }} />
                  <span className="db-status-label">{s.label}</span>
                </div>
                <div className="db-status-bar-track">
                  <div
                    className="db-status-bar-fill"
                    style={{
                      width: `${(s.count / totalContracts) * 100}%`,
                      background: s.color,
                    }}
                  />
                </div>
                <span className="db-status-count">{s.count}</span>
              </div>
            ))}
            <div className="db-status-total">
              <span>Total</span>
              <span>{contracts.length} contratos</span>
            </div>
          </div>
        </div>

        <div className="db-section">
          <div className="db-section-header">
            <h2><FiUsers className="db-section-icon" />Locadores Recentes</h2>
            <button className="db-view-all" onClick={() => navigate('/locadores')}>Ver todos <FiArrowRight /></button>
          </div>
          {customers.length === 0 ? (
            <div className="db-empty"><FiInbox /><span>Nenhum locador</span></div>
          ) : (
            <ul className="db-list">
              {customers.slice(0, 5).map((c) => (
                <li key={c.customerId} className="db-list-item" onClick={() => navigate(`/locadores/${c.customerId}`)}>
                  <div className="db-list-avatar">{c.name?.charAt(0)?.toUpperCase()}</div>
                  <div className="db-list-info">
                    <h4>{c.name}</h4>
                    <p>{formatCPF(c.cpf)}</p>
                  </div>
                  <FiArrowRight className="db-list-arrow" />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="db-section">
          <div className="db-section-header">
            <h2><FiDollarSign className="db-section-icon" />Últimos Pagamentos Recebidos</h2>
          </div>
          {paidPayments.length === 0 ? (
            <div className="db-empty"><FiInbox /><span>Nenhum pagamento recebido</span></div>
          ) : (
            <ul className="db-list">
              {[...paidPayments]
                .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))
                .slice(0, 5)
                .map((p, i) => {
                  const contract = contracts.find((c) => c.contractId === p.contractId);
                  return (
                    <li
                      key={i}
                      className="db-list-item"
                      onClick={() => contract && navigate(`/contratos/${contract.contractId}`)}
                    >
                      <div className="db-list-avatar success-avatar"><FiCheckCircle /></div>
                      <div className="db-list-info">
                        <h4>{contract?.user?.name || '—'}</h4>
                        <p>Pago em {formatDate(p.paidDate)}</p>
                      </div>
                      <span className="db-amount-success">{formatCurrency(p.amount)}</span>
                    </li>
                  );
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
