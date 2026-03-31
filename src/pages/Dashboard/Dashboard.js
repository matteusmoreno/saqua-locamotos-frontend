import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiTruck, FiFileText, FiAlertTriangle, FiInbox,
  FiDollarSign, FiCheckCircle, FiClock, FiPlus,
  FiTrendingUp, FiRefreshCw, FiChevronRight, FiZap,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import motorcycleService from '../../services/motorcycleService';
import contractService from '../../services/contractService';
import paymentService from '../../services/paymentService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Dashboard.css';

const AVATAR_COLORS = [
  ['#7c3aed', '#3b0764'], ['#0284c7', '#082f49'], ['#b45309', '#451a03'],
  ['#059669', '#022c22'], ['#dc2626', '#450a0a'], ['#9333ea', '#3b0764'],
];
function getColor(name = '') {
  const i = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[i];
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function Dashboard() {
  const [customers, setCustomers] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
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
    } catch {
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Derived metrics ───────────────────────────────────────
  const activeMotos    = motorcycles.filter((m) => m.active);
  const availableMotos = motorcycles.filter((m) => m.available && m.active);
  const rentedMotos    = motorcycles.filter((m) => !m.available && m.active);
  const inactiveMotos  = motorcycles.filter((m) => !m.active);

  const activeContracts   = contracts.filter((c) => c.status === 'ACTIVE');
  const overdueContracts  = contracts.filter((c) => c.status === 'OVERDUE');
  const finishedContracts = contracts.filter((c) => c.status === 'FINISHED');

  const allPayments     = contracts.flatMap((c) => c.payments || []);
  const paidPayments    = allPayments.filter((p) => p.status === 'PAID');
  const pendingPayments = allPayments.filter((p) => p.status === 'PENDING');
  const overduePayments = allPayments.filter((p) => p.status === 'OVERDUE');
  const totalReceived   = paidPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalPending    = pendingPayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalOverdue    = overduePayments.reduce((s, p) => s + (Number(p.amount) || 0), 0);
  const totalFinancial  = totalReceived + totalPending + totalOverdue || 1;

  const overdueAlerts = contracts.filter(
    (c) => c.status === 'OVERDUE' ||
      (c.status === 'ACTIVE' && (c.payments || []).some((p) => p.status === 'OVERDUE'))
  );

  const recentPayments = [...paidPayments]
    .sort((a, b) => new Date(b.paidDate) - new Date(a.paidDate))
    .slice(0, 6);

  // Donut segments (degrees out of 360)
  const totalFleet = motorcycles.length || 1;
  const rentedDeg  = Math.round((rentedMotos.length / totalFleet) * 360);
  const availDeg   = Math.round((availableMotos.length / totalFleet) * 360);
  const fleetPct   = activeMotos.length
    ? Math.round((rentedMotos.length / activeMotos.length) * 100)
    : 0;
  const donutBg = motorcycles.length === 0
    ? 'var(--bg-elevated)'
    : `conic-gradient(
        #f59e0b 0deg ${rentedDeg}deg,
        #34d399 ${rentedDeg}deg ${rentedDeg + availDeg}deg,
        var(--bg-elevated) ${rentedDeg + availDeg}deg 360deg
      )`;

  const totalContracts = contracts.length || 1;

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  return (
    <div className="db-page">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="db-header">
        <div>
          <h1 className="db-greeting">{getGreeting()} 👋</h1>
          <p className="db-date">{today.charAt(0).toUpperCase() + today.slice(1)}</p>
        </div>
        <div className="db-header-actions">
          <button className="db-btn-ghost" onClick={() => navigate('/locadores/novo')}><FiUsers /> Locador</button>
          <button className="db-btn-ghost" onClick={() => navigate('/motos/nova')}><FiTruck /> Moto</button>
          <button className="db-btn-primary" onClick={() => navigate('/contratos/novo')}><FiPlus /> Novo Contrato</button>
          <button
            className={`db-btn-icon${refreshing ? ' spin' : ''}`}
            onClick={() => loadData(true)}
            title="Atualizar dados"
          >
            <FiRefreshCw />
          </button>
        </div>
      </div>

      {/* ── Alert banner ───────────────────────────────── */}
      {overdueAlerts.length > 0 && (
        <div className="db-alert" onClick={() => navigate('/contratos')}>
          <div className="db-alert-pulse" />
          <FiAlertTriangle className="db-alert-icon" />
          <div className="db-alert-body">
            <strong>
              {overdueAlerts.length === 1
                ? '1 contrato requer atenção imediata'
                : `${overdueAlerts.length} contratos requerem atenção imediata`}
            </strong>
            <span>{formatCurrency(totalOverdue)} em pagamentos vencidos</span>
          </div>
          <span className="db-alert-cta">Ver agora <FiChevronRight /></span>
        </div>
      )}

      {/* ── Stats row ──────────────────────────────────── */}
      <div className="db-stats-row">
        <div className="db-stat" onClick={() => navigate('/locadores')}>
          <div className="db-stat-icon" style={{ background: 'rgba(124,58,237,0.12)', color: '#a78bfa' }}>
            <FiUsers />
          </div>
          <div className="db-stat-body">
            <span className="db-stat-value">{customers.length}</span>
            <span className="db-stat-label">Locadores</span>
          </div>
          <div className="db-stat-accent" style={{ background: '#7c3aed' }} />
        </div>

        <div className="db-stat" onClick={() => navigate('/motos')}>
          <div className="db-stat-icon" style={{ background: 'rgba(3,105,161,0.12)', color: '#38bdf8' }}>
            <FiTruck />
          </div>
          <div className="db-stat-body">
            <span className="db-stat-value">{activeMotos.length}</span>
            <span className="db-stat-label">Motos Ativas</span>
            <span className="db-stat-sub">{availableMotos.length} livres · {rentedMotos.length} alugadas</span>
          </div>
          <div className="db-stat-accent" style={{ background: '#0369a1' }} />
        </div>

        <div className="db-stat" onClick={() => navigate('/contratos')}>
          <div className="db-stat-icon" style={{ background: 'rgba(5,150,105,0.12)', color: '#34d399' }}>
            <FiFileText />
          </div>
          <div className="db-stat-body">
            <span className="db-stat-value">{activeContracts.length}</span>
            <span className="db-stat-label">Contratos Ativos</span>
            <span className="db-stat-sub">{finishedContracts.length} finalizados</span>
          </div>
          <div className="db-stat-accent" style={{ background: '#059669' }} />
        </div>

        <div className={`db-stat${overdueAlerts.length > 0 ? ' db-stat--alert' : ''}`} onClick={() => navigate('/contratos')}>
          <div className="db-stat-icon" style={{ background: 'rgba(220,38,38,0.12)', color: '#f87171' }}>
            <FiAlertTriangle />
          </div>
          <div className="db-stat-body">
            <span className="db-stat-value">{overdueAlerts.length}</span>
            <span className="db-stat-label">Em Atraso</span>
            <span className="db-stat-sub">{formatCurrency(totalOverdue)} em aberto</span>
          </div>
          <div className="db-stat-accent" style={{ background: '#dc2626' }} />
        </div>
      </div>

      {/* ── Financial hero ─────────────────────────────── */}
      <div className="db-fin-hero">
        <div className="db-fin-hero-stripe" />
        <div className="db-fin-hero-header">
          <div className="db-fin-hero-title-wrap">
            <div className="db-fin-hero-icon"><FiDollarSign /></div>
            <div>
              <h2>Balanço Financeiro</h2>
              <p>Todos os pagamentos registrados</p>
            </div>
          </div>
          <button className="db-link-btn" onClick={() => navigate('/financeiro')}>
            Ver relatório completo <FiChevronRight />
          </button>
        </div>

        <div className="db-fin-metrics">
          <div className="db-fin-metric db-fin-metric--received">
            <div className="db-fin-metric-icon"><FiTrendingUp /></div>
            <div>
              <span className="db-fin-metric-value">{formatCurrency(totalReceived)}</span>
              <span className="db-fin-metric-label">Total Recebido</span>
              <span className="db-fin-metric-sub">{paidPayments.length} pagamentos</span>
            </div>
          </div>
          <div className="db-fin-metric-divider" />
          <div className="db-fin-metric db-fin-metric--pending">
            <div className="db-fin-metric-icon"><FiClock /></div>
            <div>
              <span className="db-fin-metric-value">{formatCurrency(totalPending)}</span>
              <span className="db-fin-metric-label">A Receber</span>
              <span className="db-fin-metric-sub">{pendingPayments.length} pendentes</span>
            </div>
          </div>
          <div className="db-fin-metric-divider" />
          <div className={`db-fin-metric${totalOverdue > 0 ? ' db-fin-metric--overdue' : ' db-fin-metric--ok'}`}>
            <div className="db-fin-metric-icon">
              {totalOverdue > 0 ? <FiAlertTriangle /> : <FiCheckCircle />}
            </div>
            <div>
              <span className="db-fin-metric-value">{formatCurrency(totalOverdue)}</span>
              <span className="db-fin-metric-label">Em Atraso</span>
              <span className="db-fin-metric-sub">{overduePayments.length} vencidos</span>
            </div>
          </div>
        </div>

        {/* Stacked proportion bar */}
        <div className="db-fin-bar-wrap">
          <div className="db-fin-bar">
            <div
              className="db-fin-bar-seg received"
              style={{ width: `${(totalReceived / totalFinancial) * 100}%` }}
              title={`Recebido: ${formatCurrency(totalReceived)}`}
            />
            <div
              className="db-fin-bar-seg pending"
              style={{ width: `${(totalPending / totalFinancial) * 100}%` }}
              title={`Pendente: ${formatCurrency(totalPending)}`}
            />
            <div
              className="db-fin-bar-seg overdue"
              style={{ width: `${(totalOverdue / totalFinancial) * 100}%` }}
              title={`Em atraso: ${formatCurrency(totalOverdue)}`}
            />
          </div>
          <div className="db-fin-bar-legend">
            <span><span className="db-fin-dot received" /> Recebido</span>
            <span><span className="db-fin-dot pending" /> Pendente</span>
            <span><span className="db-fin-dot overdue" /> Em atraso</span>
          </div>
        </div>
      </div>

      {/* ── Bottom grid ────────────────────────────────── */}
      <div className="db-bottom-grid">

        {/* Fleet donut card */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-header-icon blue"><FiTruck /></span>
            <h2>Frota</h2>
            <button className="db-link-btn-sm" onClick={() => navigate('/motos')}>
              Ver motos <FiChevronRight />
            </button>
          </div>
          <div className="db-fleet-body">

            {/* Donut ring */}
            <div className="db-donut-wrap">
              <div className="db-donut" style={{ background: donutBg }}>
                <div className="db-donut-hole">
                  <span className="db-donut-pct">{fleetPct}%</span>
                  <span className="db-donut-sub">ocupado</span>
                </div>
              </div>
              <div className="db-donut-legend">
                <div className="db-donut-leg-item">
                  <span className="db-donut-leg-dot" style={{ background: '#f59e0b' }} />
                  <span className="db-donut-leg-label">Alugadas</span>
                  <span className="db-donut-leg-count">{rentedMotos.length}</span>
                </div>
                <div className="db-donut-leg-item">
                  <span className="db-donut-leg-dot" style={{ background: '#34d399' }} />
                  <span className="db-donut-leg-label">Disponíveis</span>
                  <span className="db-donut-leg-count">{availableMotos.length}</span>
                </div>
                <div className="db-donut-leg-item">
                  <span className="db-donut-leg-dot" style={{ background: 'var(--text-muted)', opacity: 0.5 }} />
                  <span className="db-donut-leg-label">Inativas</span>
                  <span className="db-donut-leg-count">{inactiveMotos.length}</span>
                </div>
              </div>
            </div>

            {/* Contract distribution */}
            <div className="db-dist">
              <div className="db-dist-title">Contratos</div>
              {[
                { label: 'Ativos',      count: activeContracts.length,   color: '#34d399' },
                { label: 'Em atraso',   count: overdueContracts.length,  color: '#f87171' },
                { label: 'Finalizados', count: finishedContracts.length, color: 'var(--text-muted)' },
              ].map((s) => (
                <div key={s.label} className="db-dist-row">
                  <span className="db-dist-dot" style={{ background: s.color }} />
                  <span className="db-dist-label">{s.label}</span>
                  <div className="db-dist-track">
                    <div
                      className="db-dist-fill"
                      style={{
                        width: `${(s.count / totalContracts) * 100}%`,
                        background: s.color,
                      }}
                    />
                  </div>
                  <span className="db-dist-count">{s.count}</span>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Overdue contracts */}
        <div className="db-card">
          <div className="db-card-header">
            <span className={`db-card-header-icon${overdueAlerts.length > 0 ? ' red' : ' muted'}`}>
              <FiAlertTriangle />
            </span>
            <h2>Em Atraso</h2>
            {overdueAlerts.length > 0 && (
              <button className="db-link-btn-sm" onClick={() => navigate('/contratos')}>
                Ver todos <FiChevronRight />
              </button>
            )}
          </div>
          {overdueAlerts.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon ok"><FiCheckCircle /></div>
              <span className="db-empty-title">Tudo em dia!</span>
              <span className="db-empty-sub">Nenhum contrato em atraso</span>
            </div>
          ) : (
            <ul className="db-list">
              {overdueAlerts.slice(0, 6).map((c) => {
                const overdueAmt = (c.payments || [])
                  .filter((p) => p.status === 'OVERDUE')
                  .reduce((s, p) => s + (Number(p.amount) || 0), 0);
                const [fg, bg] = getColor(c.user?.name || '?');
                return (
                  <li key={c.contractId} className="db-list-item" onClick={() => navigate(`/contratos/${c.contractId}`)}>
                    <div className="db-avatar" style={{ background: bg, color: fg }}>
                      {c.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="db-list-info">
                      <h4>{c.user?.name || '—'}</h4>
                      <p>{c.motorcycle?.brand} {c.motorcycle?.model} · {(c.motorcycle?.plate || '').toUpperCase()}</p>
                    </div>
                    <div className="db-list-end">
                      <span className="db-amount red">{formatCurrency(overdueAmt)}</span>
                      <span className="db-amount-sub">em atraso</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent payments */}
        <div className="db-card">
          <div className="db-card-header">
            <span className="db-card-header-icon green"><FiZap /></span>
            <h2>Atividade Recente</h2>
            <button className="db-link-btn-sm" onClick={() => navigate('/financeiro')}>
              Financeiro <FiChevronRight />
            </button>
          </div>
          {recentPayments.length === 0 ? (
            <div className="db-empty">
              <div className="db-empty-icon"><FiInbox /></div>
              <span className="db-empty-title">Sem pagamentos</span>
              <span className="db-empty-sub">Nenhum pagamento recebido ainda</span>
            </div>
          ) : (
            <ul className="db-list">
              {recentPayments.map((p, i) => {
                const contract = contracts.find((c) => c.contractId === p.contractId);
                const [fg, bg] = getColor(contract?.user?.name || '');
                return (
                  <li
                    key={i}
                    className="db-list-item"
                    onClick={() => contract && navigate(`/contratos/${contract.contractId}`)}
                  >
                    <div className="db-avatar" style={{ background: bg, color: fg }}>
                      {contract?.user?.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="db-list-info">
                      <h4>{contract?.user?.name || '—'}</h4>
                      <p>{contract?.motorcycle?.brand} {contract?.motorcycle?.model} · {formatDate(p.paidDate)}</p>
                    </div>
                    <span className="db-amount green">{formatCurrency(p.amount)}</span>
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
