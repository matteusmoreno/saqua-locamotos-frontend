import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCheckCircle,
  FiTruck, FiCalendar, FiInbox, FiBarChart2, FiPieChart, FiFileText,
  FiTool, FiPlus, FiX, FiCreditCard, FiTrendingDown,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import paymentService from '../../services/paymentService';
import motorcycleService from '../../services/motorcycleService';
import expenseService from '../../services/expenseService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import './Financial.css';

const EXPENSE_TYPE_LABELS = {
  MAINTENANCE: 'Manutenção',
  UTILITIES: 'Utilidades',
  TAXES: 'Impostos',
  INSURANCE: 'Seguro',
  OTHER: 'Outros',
};

const EXPENSE_TYPE_COLORS = {
  MAINTENANCE: 'var(--warning)',
  UTILITIES: 'var(--info, #3b82f6)',
  TAXES: 'var(--danger)',
  INSURANCE: 'var(--primary)',
  OTHER: 'var(--text-muted)',
};

const PAYMENT_METHOD_LABELS = {
  PIX: 'Pix',
  CASH: 'Dinheiro',
  CARD: 'Cartão',
};

function Financial() {
  const [contracts, setContracts] = useState([]);
  const [motorcycles, setMotorcycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Expense modal state
  const [showCreateExpense, setShowCreateExpense] = useState(false);
  const [showRegisterExpense, setShowRegisterExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [expenseForm, setExpenseForm] = useState({
    motorcycleId: '', type: 'MAINTENANCE', amount: '', method: 'PIX', description: '', dueDate: '',
  });
  const [registerForm, setRegisterForm] = useState({ expenseId: '', method: 'PIX' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    try {
      const [contractsData, motorcyclesData] = await Promise.all([
        contractService.findAll(),
        motorcycleService.findAll(),
      ]);
      const rawContracts = Array.isArray(contractsData) ? contractsData : [];
      const enriched = await Promise.all(
        rawContracts.map(async (contract) => {
          try {
            const payments = await paymentService.findByContractId(contract.contractId);
            return { ...contract, payments: Array.isArray(payments) ? payments : [] };
          } catch {
            return { ...contract, payments: [] };
          }
        })
      );
      setContracts(enriched);
      setMotorcycles(Array.isArray(motorcyclesData) ? motorcyclesData : []);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast.error('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
    }
  };

  // ---- Compute financial metrics ----
  const allPayments = contracts.flatMap((c) => (c.payments || []).map((p) => ({ ...p, contract: c })));
  const paidPayments = allPayments.filter((p) => p.status === 'PAID');
  const pendingPayments = allPayments.filter((p) => p.status === 'PENDING');
  const overduePayments = allPayments.filter((p) => p.status === 'OVERDUE');

  const totalReceived = paidPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = pendingPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // Fine payments (type === 'FINE')
  const finePayments = allPayments.filter((p) => p.type === 'FINE');
  const paidFinePayments = finePayments.filter((p) => p.status === 'PAID');
  const pendingFinePayments = finePayments.filter((p) => p.status !== 'PAID');
  const totalFinesReceived = paidFinePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalFinesPending = pendingFinePayments.reduce((sum, p) => sum + (p.amount || 0), 0);

  // ---- Expense metrics (from motorcycle.financial.expenses) ----
  const allExpenses = motorcycles.flatMap((m) =>
    ((m.financial && m.financial.expenses) || []).map((e) => ({ ...e, motorcycle: m }))
  );
  const paidExpenses    = allExpenses.filter((e) => e.status === 'PAID');
  const pendingExpenses = allExpenses.filter((e) => e.status === 'PENDING');
  const overdueExpenses = allExpenses.filter((e) => e.status === 'OVERDUE');

  const totalExpensesPaid    = paidExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpensesPending = pendingExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalExpensesOverdue = overdueExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netBalance           = totalReceived - totalExpensesPaid;

  // Expenses grouped by type
  const expensesByType = {};
  allExpenses.forEach((e) => {
    if (!expensesByType[e.type]) expensesByType[e.type] = { paid: 0, pending: 0, overdue: 0, count: 0 };
    expensesByType[e.type].count += 1;
    if (e.status === 'PAID')         expensesByType[e.type].paid    += e.amount || 0;
    else if (e.status === 'PENDING') expensesByType[e.type].pending += e.amount || 0;
    else if (e.status === 'OVERDUE') expensesByType[e.type].overdue += e.amount || 0;
  });
  const expenseTypeList = Object.entries(expensesByType)
    .map(([type, data]) => ({ type, ...data, total: data.paid + data.pending + data.overdue }))
    .sort((a, b) => b.total - a.total);
  const maxExpenseType = expenseTypeList[0]?.total || 1;

  // Revenue per motorcycle
  const motoRevenue = {};
  contracts.forEach((c) => {
    const motoKey = c.motorcycle?.motorcycleId || 'unknown';
    const motoLabel = `${c.motorcycle?.brand || '?'} ${c.motorcycle?.model || ''} — ${c.motorcycle?.plate?.toUpperCase() || ''}`;
    if (!motoRevenue[motoKey]) {
      motoRevenue[motoKey] = { label: motoLabel, total: 0, motorcycle: c.motorcycle };
    }
    (c.payments || []).forEach((p) => {
      if (p.status === 'PAID') motoRevenue[motoKey].total += p.amount || 0;
    });
  });
  const motoRevenueList = Object.values(motoRevenue).sort((a, b) => b.total - a.total);

  // Active contracts with overdue payments (who's not paying)
  const overdueContracts = contracts.filter(
    (c) => (c.status === 'ACTIVE' || c.status === 'OVERDUE') &&
           (c.payments || []).some((p) => p.status === 'OVERDUE')
  );

  // Contracts by status
  const activeContracts = contracts.filter((c) => c.status === 'ACTIVE').length;
  const overdueCount = contracts.filter((c) => c.status === 'OVERDUE').length;
  const finishedCount = contracts.filter((c) => c.status === 'FINISHED').length;
  const cancelledCount = contracts.filter((c) => c.status === 'CANCELLED').length;

  // Monthly revenue (last 12 months)
  const monthlyMap = {};
  paidPayments.forEach((p) => {
    const d = new Date(p.paidDate || p.dueDate);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
    if (!monthlyMap[key]) monthlyMap[key] = { key, label, total: 0, count: 0 };
    monthlyMap[key].total += p.amount || 0;
    monthlyMap[key].count += 1;
  });
  const monthlyData = Object.values(monthlyMap)
    .sort((a, b) => a.key.localeCompare(b.key))
    .slice(-12);
  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  // Revenue split percentages
  const revenueBase = totalReceived + totalPending + totalOverdue || 1;
  const pctReceived = Math.round((totalReceived / revenueBase) * 100);
  const pctPending = Math.round((totalPending / revenueBase) * 100);
  const pctOverdue = Math.max(100 - pctReceived - pctPending, 0);

  // ---- Expense modal handlers ----
  const handleCreateExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await expenseService.create({ ...expenseForm, amount: parseFloat(expenseForm.amount) });
      toast.success('Despesa criada com sucesso!');
      setShowCreateExpense(false);
      setExpenseForm({ motorcycleId: '', type: 'MAINTENANCE', amount: '', method: 'PIX', description: '', dueDate: '' });
      await loadData();
    } catch {
      toast.error('Erro ao criar despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await expenseService.registerExpense({ expenseId: registerForm.expenseId, method: registerForm.method });
      toast.success('Despesa registrada como paga!');
      setShowRegisterExpense(false);
      setSelectedExpense(null);
      await loadData();
    } catch {
      toast.error('Erro ao registrar pagamento da despesa');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRegister = (expense) => {
    setSelectedExpense(expense);
    setRegisterForm({ expenseId: expense.expenseId, method: expense.method || 'PIX' });
    setShowRegisterExpense(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
    try {
      await expenseService.deleteExpense(expenseId);
      toast.success('Despesa excluída');
      await loadData();
    } catch {
      toast.error('Erro ao excluir despesa');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="financial-page">
      <div className="page-header">
        <div>
          <h1>Financeiro</h1>
          <span className="page-header-sub">
            {contracts.length} contratos · {allPayments.length} pagamentos · {allExpenses.length} despesas
          </span>
        </div>
        <button className="btn-primary" onClick={() => setShowCreateExpense(true)}>
          <FiPlus style={{ marginRight: 6 }} /> Nova Despesa
        </button>
      </div>

      {/* ── RECEITAS KPIs ── */}
      <div className="fin-section-title">
        <FiTrendingUp style={{ marginRight: 6 }} /> Receitas
      </div>
      <div className="fin-kpi-grid">
        <div className="fin-kpi-card success">
          <div className="fin-kpi-icon"><FiCheckCircle /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Total Recebido</span>
            <span className="fin-kpi-value">{formatCurrency(totalReceived)}</span>
            <span className="fin-kpi-sub">{paidPayments.length} pagamentos</span>
          </div>
        </div>
        <div className="fin-kpi-card warning">
          <div className="fin-kpi-icon"><FiCalendar /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">A Receber</span>
            <span className="fin-kpi-value">{formatCurrency(totalPending)}</span>
            <span className="fin-kpi-sub">{pendingPayments.length} pendentes</span>
          </div>
        </div>
        <div className="fin-kpi-card danger">
          <div className="fin-kpi-icon"><FiAlertTriangle /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Em Atraso</span>
            <span className="fin-kpi-value">{formatCurrency(totalOverdue)}</span>
            <span className="fin-kpi-sub">{overduePayments.length} vencidos</span>
          </div>
        </div>
        <div className="fin-kpi-card amber">
          <div className="fin-kpi-icon"><FiDollarSign /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Multas</span>
            <span className="fin-kpi-value">{formatCurrency(totalFinesReceived)}</span>
            <span className="fin-kpi-sub">
              {pendingFinePayments.length > 0
                ? `${pendingFinePayments.length} pendente(s) — ${formatCurrency(totalFinesPending)}`
                : `${paidFinePayments.length} cobradas`}
            </span>
          </div>
        </div>
      </div>

      {/* ── DESPESAS & SALDO KPIs ── */}
      <div className="fin-section-title">
        <FiTrendingDown style={{ marginRight: 6 }} /> Despesas &amp; Saldo
      </div>
      <div className="fin-kpi-grid">
        <div className="fin-kpi-card expense-paid">
          <div className="fin-kpi-icon"><FiTool /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Despesas Pagas</span>
            <span className="fin-kpi-value">{formatCurrency(totalExpensesPaid)}</span>
            <span className="fin-kpi-sub">{paidExpenses.length} despesas</span>
          </div>
        </div>
        <div className="fin-kpi-card expense-pending">
          <div className="fin-kpi-icon"><FiCalendar /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Despesas Pendentes</span>
            <span className="fin-kpi-value">{formatCurrency(totalExpensesPending)}</span>
            <span className="fin-kpi-sub">{pendingExpenses.length} pendentes</span>
          </div>
        </div>
        <div className="fin-kpi-card expense-overdue">
          <div className="fin-kpi-icon"><FiAlertTriangle /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Despesas Vencidas</span>
            <span className="fin-kpi-value">{formatCurrency(totalExpensesOverdue)}</span>
            <span className="fin-kpi-sub">{overdueExpenses.length} vencidas</span>
          </div>
        </div>
        <div className={`fin-kpi-card ${netBalance >= 0 ? 'net-positive' : 'net-negative'}`}>
          <div className="fin-kpi-icon">
            {netBalance >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
          </div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Saldo Líquido</span>
            <span className="fin-kpi-value">{formatCurrency(netBalance)}</span>
            <span className="fin-kpi-sub">Receitas pagas − Despesas pagas</span>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="fin-section">
        <div className="fin-section-header">
          <h2><FiBarChart2 style={{ marginRight: 8 }} />Receita Mensal</h2>
          {totalReceived > 0 && (
            <span className="fin-section-sub">{formatCurrency(totalReceived)} acumulado</span>
          )}
        </div>
        {monthlyData.length === 0 ? (
          <div className="fin-section-empty"><FiInbox /><p>Nenhum pagamento recebido ainda</p></div>
        ) : (
          <div className="fin-vchart-wrap">
            <div className="fin-vchart">
              {monthlyData.map((m) => (
                <div key={m.key} className="fin-vchart-col">
                  <span className="fin-vchart-tip">{formatCurrency(m.total)}</span>
                  <div className="fin-vchart-bar-wrap">
                    <div
                      className="fin-vchart-bar"
                      style={{ height: `${Math.max((m.total / maxMonthly) * 100, 2)}%` }}
                    />
                  </div>
                  <span className="fin-vchart-label">{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: moto revenue + revenue split */}
      <div className="fin-grid">
        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiTruck style={{ marginRight: 8 }} />Motos que Mais Renderam</h2>
          </div>
          {motoRevenueList.length === 0 ? (
            <div className="fin-section-empty"><FiInbox /><p>Nenhuma receita registrada</p></div>
          ) : (
            <div className="fin-moto-list">
              {motoRevenueList.slice(0, 8).map((moto, idx) => {
                const maxRevenue = motoRevenueList[0]?.total || 1;
                const pct = maxRevenue > 0 ? (moto.total / maxRevenue) * 100 : 0;
                return (
                  <div
                    key={idx}
                    className="fin-moto-item"
                    onClick={() => moto.motorcycle?.motorcycleId && navigate(`/motos/${moto.motorcycle.motorcycleId}`)}
                  >
                    <div className="fin-moto-info">
                      <span className="fin-moto-rank">#{idx + 1}</span>
                      <span className="fin-moto-label">{moto.label}</span>
                      <span className="fin-moto-value">{formatCurrency(moto.total)}</span>
                    </div>
                    <div className="fin-moto-bar-bg">
                      <div className="fin-moto-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiPieChart style={{ marginRight: 8 }} />Distribuição de Receitas</h2>
          </div>
          <div className="fin-split-section">
            <div className="fin-split-bar-wrap">
              <div className="fin-split-bar">
                <div className="fin-split-seg received" style={{ width: `${pctReceived}%` }} />
                <div className="fin-split-seg pending"  style={{ width: `${pctPending}%` }} />
                <div className="fin-split-seg overdue"  style={{ width: `${pctOverdue}%` }} />
              </div>
            </div>
            <div className="fin-split-legend">
              <div className="fin-split-item">
                <span className="fin-split-dot received" />
                <div className="fin-split-detail">
                  <span className="fin-split-pct">{pctReceived}%</span>
                  <span className="fin-split-desc">Recebido</span>
                </div>
                <span className="fin-split-amount success">{formatCurrency(totalReceived)}</span>
              </div>
              <div className="fin-split-item">
                <span className="fin-split-dot pending" />
                <div className="fin-split-detail">
                  <span className="fin-split-pct">{pctPending}%</span>
                  <span className="fin-split-desc">Pendente</span>
                </div>
                <span className="fin-split-amount warning">{formatCurrency(totalPending)}</span>
              </div>
              <div className="fin-split-item">
                <span className="fin-split-dot overdue" />
                <div className="fin-split-detail">
                  <span className="fin-split-pct">{pctOverdue}%</span>
                  <span className="fin-split-desc">Atrasado</span>
                </div>
                <span className="fin-split-amount danger">{formatCurrency(totalOverdue)}</span>
              </div>
            </div>
          </div>
          <div className="fin-section-header" style={{ borderTop: '1px solid var(--border)', marginTop: 0 }}>
            <h2><FiFileText style={{ marginRight: 8 }} />Status dos Contratos</h2>
          </div>
          <div className="fin-status-rows">
            {[
              { label: 'Ativos',      count: activeContracts, color: 'var(--success)' },
              { label: 'Em Atraso',   count: overdueCount,    color: 'var(--warning)' },
              { label: 'Finalizados', count: finishedCount,   color: 'var(--info, #3b82f6)' },
              { label: 'Cancelados',  count: cancelledCount,  color: 'var(--danger)' },
            ].map((row) => {
              const pct = contracts.length > 0 ? (row.count / contracts.length) * 100 : 0;
              return (
                <div key={row.label} className="fin-status-row">
                  <div className="fin-status-row-left">
                    <span className="fin-status-row-dot" style={{ background: row.color }} />
                    <span className="fin-status-row-label">{row.label}</span>
                  </div>
                  <div className="fin-status-row-track">
                    <div className="fin-status-row-fill" style={{ width: `${pct}%`, background: row.color }} />
                  </div>
                  <span className="fin-status-row-count">{row.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overdue contracts + recent payments */}
      <div className="fin-grid">
        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiAlertTriangle style={{ marginRight: 8 }} />Locadores em Atraso</h2>
            {overdueContracts.length > 0 && (
              <span className="fin-badge danger">{overdueContracts.length}</span>
            )}
          </div>
          {overdueContracts.length === 0 ? (
            <div className="fin-section-empty">
              <FiCheckCircle style={{ color: 'var(--success)' }} />
              <p>Nenhum locador em atraso</p>
            </div>
          ) : (
            <ul className="fin-overdue-list">
              {overdueContracts.map((contract) => {
                const odCount = (contract.payments || []).filter((p) => p.status === 'OVERDUE').length;
                const odTotal = (contract.payments || [])
                  .filter((p) => p.status === 'OVERDUE')
                  .reduce((s, p) => s + (p.amount || 0), 0);
                return (
                  <li
                    key={contract.contractId}
                    className="fin-overdue-item"
                    onClick={() => navigate(`/contratos/${contract.contractId}`)}
                  >
                    <div className="fin-overdue-left">
                      <div className="fin-overdue-avatar">
                        {contract.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4>{contract.user?.name || '—'}</h4>
                        <p>{contract.motorcycle?.brand} {contract.motorcycle?.model} · {odCount} pag. atrasado{odCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className="fin-overdue-amount">{formatCurrency(odTotal)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiTrendingUp style={{ marginRight: 8 }} />Últimos Recebimentos</h2>
          </div>
          {paidPayments.length === 0 ? (
            <div className="fin-section-empty"><FiInbox /><p>Nenhum pagamento recebido</p></div>
          ) : (
            <div className="fin-payments-list">
              {paidPayments
                .sort((a, b) => new Date(b.paidDate || b.dueDate) - new Date(a.paidDate || a.dueDate))
                .slice(0, 12)
                .map((payment, idx) => (
                  <div
                    key={idx}
                    className="fin-payment-item"
                    onClick={() => navigate(`/contratos/${payment.contract.contractId}`)}
                  >
                    <div className="fin-payment-left">
                      <div className="fin-payment-avatar">
                        {payment.contract.user?.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <h4>{payment.contract.user?.name || '—'}</h4>
                        <p>
                          {payment.contract.motorcycle?.brand} {payment.contract.motorcycle?.model}
                          {' '}· {payment.description || 'Pagamento'}
                          {' '}· {payment.paidDate ? formatDate(payment.paidDate) : formatDate(payment.dueDate)}
                        </p>
                      </div>
                    </div>
                    <span className="fin-payment-amount">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── DESPESAS SECTION ── */}
      <div className="fin-grid">
        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiTool style={{ marginRight: 8 }} />Despesas por Categoria</h2>
            {allExpenses.length > 0 && (
              <span className="fin-section-sub">{allExpenses.length} no total</span>
            )}
          </div>
          {expenseTypeList.length === 0 ? (
            <div className="fin-section-empty"><FiInbox /><p>Nenhuma despesa registrada</p></div>
          ) : (
            <div className="fin-expense-type-list">
              {expenseTypeList.map(({ type, total, paid, pending, overdue, count }) => (
                <div key={type} className="fin-expense-type-item">
                  <div className="fin-expense-type-header">
                    <span className="fin-expense-type-dot" style={{ background: EXPENSE_TYPE_COLORS[type] }} />
                    <span className="fin-expense-type-label">{EXPENSE_TYPE_LABELS[type] || type}</span>
                    <span className="fin-expense-type-count">{count}</span>
                    <span className="fin-expense-type-value">{formatCurrency(total)}</span>
                  </div>
                  <div className="fin-expense-type-bar-bg">
                    <div
                      className="fin-expense-type-bar-fill"
                      style={{ width: `${(total / maxExpenseType) * 100}%`, background: EXPENSE_TYPE_COLORS[type] }}
                    />
                  </div>
                  {(pending > 0 || overdue > 0) && (
                    <div className="fin-expense-type-sub">
                      {paid > 0    && <span className="fin-expense-badge paid">Pago: {formatCurrency(paid)}</span>}
                      {pending > 0 && <span className="fin-expense-badge pending">Pendente: {formatCurrency(pending)}</span>}
                      {overdue > 0 && <span className="fin-expense-badge overdue">Vencido: {formatCurrency(overdue)}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiCreditCard style={{ marginRight: 8 }} />Despesas Recentes</h2>
            <button className="fin-btn-add" onClick={() => setShowCreateExpense(true)}>
              <FiPlus /> Nova
            </button>
          </div>
          {allExpenses.length === 0 ? (
            <div className="fin-section-empty"><FiInbox /><p>Nenhuma despesa registrada</p></div>
          ) : (
            <div className="fin-payments-list">
              {[...allExpenses]
                .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
                .slice(0, 15)
                .map((expense, idx) => (
                  <div key={idx} className="fin-expense-item">
                    <div className="fin-expense-left">
                      <div
                        className="fin-expense-avatar"
                        style={{
                          background: EXPENSE_TYPE_COLORS[expense.type] + '22',
                          color: EXPENSE_TYPE_COLORS[expense.type],
                        }}
                      >
                        <FiTool />
                      </div>
                      <div>
                        <h4>
                          {EXPENSE_TYPE_LABELS[expense.type] || expense.type}
                          {expense.description && (
                            <span className="fin-expense-desc"> — {expense.description}</span>
                          )}
                        </h4>
                        <p>
                          {expense.motorcycle?.brand} {expense.motorcycle?.model}
                          {expense.motorcycle?.plate && ` · ${expense.motorcycle.plate.toUpperCase()}`}
                          {' '}· Vence: {formatDate(expense.dueDate)}
                          {expense.paidDate && ` · Pago: ${formatDate(expense.paidDate)}`}
                        </p>
                      </div>
                    </div>
                    <div className="fin-expense-right">
                      <span className="fin-expense-amount" style={{ color: EXPENSE_TYPE_COLORS[expense.type] }}>
                        {formatCurrency(expense.amount)}
                      </span>
                      <span className={`fin-expense-status ${expense.status?.toLowerCase()}`}>
                        {expense.status === 'PAID' ? 'Paga' : expense.status === 'PENDING' ? 'Pendente' : 'Vencida'}
                      </span>
                      {expense.status !== 'PAID' && (
                        <button
                          className="fin-btn-register"
                          onClick={() => handleOpenRegister(expense)}
                          title="Registrar pagamento"
                        >
                          <FiCheckCircle />
                        </button>
                      )}
                      <button
                        className="fin-btn-delete"
                        onClick={() => handleDeleteExpense(expense.expenseId)}
                        title="Excluir despesa"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CREATE EXPENSE MODAL ── */}
      {showCreateExpense && (
        <div className="modal-overlay" onClick={() => setShowCreateExpense(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FiTool style={{ marginRight: 8 }} />Nova Despesa</h2>
              <button className="modal-close" onClick={() => setShowCreateExpense(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreateExpense} className="modal-form">
              <div className="form-row">
                <label>
                  Moto *
                  <select
                    required
                    value={expenseForm.motorcycleId}
                    onChange={(e) => setExpenseForm({ ...expenseForm, motorcycleId: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {motorcycles.filter((m) => m.active !== false).map((m) => (
                      <option key={m.motorcycleId} value={m.motorcycleId}>
                        {m.brand} {m.model} — {m.plate?.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Categoria *
                  <select
                    required
                    value={expenseForm.type}
                    onChange={(e) => setExpenseForm({ ...expenseForm, type: e.target.value })}
                  >
                    {Object.entries(EXPENSE_TYPE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="form-row">
                <label>
                  Valor (R$) *
                  <input
                    type="number" step="0.01" min="0.01" required placeholder="0,00"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </label>
                <label>
                  Data Vencimento *
                  <input
                    type="date" required
                    value={expenseForm.dueDate}
                    onChange={(e) => setExpenseForm({ ...expenseForm, dueDate: e.target.value })}
                  />
                </label>
              </div>
              <div className="form-row">
                <label>
                  Método de Pagamento
                  <select
                    value={expenseForm.method}
                    onChange={(e) => setExpenseForm({ ...expenseForm, method: e.target.value })}
                  >
                    {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Descrição
                  <input
                    type="text" placeholder="Opcional"
                    value={expenseForm.description}
                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                  />
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateExpense(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Salvando...' : 'Criar Despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── REGISTER EXPENSE MODAL ── */}
      {showRegisterExpense && selectedExpense && (
        <div className="modal-overlay" onClick={() => setShowRegisterExpense(false)}>
          <div className="modal-box modal-box--sm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FiCheckCircle style={{ marginRight: 8 }} />Registrar Pagamento</h2>
              <button className="modal-close" onClick={() => setShowRegisterExpense(false)}><FiX /></button>
            </div>
            <div className="modal-expense-info">
              <p><strong>Categoria:</strong> {EXPENSE_TYPE_LABELS[selectedExpense.type] || selectedExpense.type}</p>
              <p><strong>Valor:</strong> <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatCurrency(selectedExpense.amount)}</span></p>
              {selectedExpense.description && <p><strong>Descrição:</strong> {selectedExpense.description}</p>}
              <p>
                <strong>Moto:</strong> {selectedExpense.motorcycle?.brand} {selectedExpense.motorcycle?.model}
                {selectedExpense.motorcycle?.plate && ` — ${selectedExpense.motorcycle.plate.toUpperCase()}`}
              </p>
            </div>
            <form onSubmit={handleRegisterExpense} className="modal-form">
              <label>
                Método de Pagamento *
                <select
                  required
                  value={registerForm.method}
                  onChange={(e) => setRegisterForm({ ...registerForm, method: e.target.value })}
                >
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowRegisterExpense(false)}>Cancelar</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Registrando...' : 'Confirmar Pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Financial;

