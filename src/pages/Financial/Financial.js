import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCheckCircle,
  FiTruck, FiCalendar, FiInbox, FiBarChart2, FiPieChart, FiFileText,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
import paymentService from '../../services/paymentService';
import {
  formatCurrency, formatDate,
} from '../../utils/formatters';
import './Financial.css';

function Financial() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await contractService.findAll();
      const contracts = Array.isArray(data) ? data : [];

      // Enrich each contract with its payments (now a separate entity)
      const enriched = await Promise.all(
        contracts.map(async (contract) => {
          try {
            const payments = await paymentService.findByContractId(contract.contractId);
            return { ...contract, payments: Array.isArray(payments) ? payments : [] };
          } catch {
            return { ...contract, payments: [] };
          }
        })
      );
      setContracts(enriched);
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

  // Fines
  const allFines = contracts.flatMap((c) => (c.fines || []).map((f) => ({ ...f, contract: c })));
  const paidFines = allFines.filter((f) => f.paid);
  const unpaidFines = allFines.filter((f) => !f.paid);
  const totalFinesReceived = paidFines.reduce((sum, f) => sum + (f.amount || 0), 0);
  const totalFinesPending = unpaidFines.reduce((sum, f) => sum + (f.amount || 0), 0);

  const grandTotalReceived = totalReceived + totalFinesReceived;

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

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="financial-page">
      <div className="page-header">
        <div>
          <h1>Financeiro</h1>
          <span className="page-header-sub">{contracts.length} contratos · {allPayments.length} pagamentos</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="fin-kpi-grid">
        <div className="fin-kpi-card success">
          <div className="fin-kpi-icon"><FiCheckCircle /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Total Recebido</span>
            <span className="fin-kpi-value">{formatCurrency(grandTotalReceived)}</span>
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
            <span className="fin-kpi-label">Multas Pendentes</span>
            <span className="fin-kpi-value">{formatCurrency(totalFinesPending)}</span>
            <span className="fin-kpi-sub">{unpaidFines.length} multas</span>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="fin-section">
        <div className="fin-section-header">
          <h2><FiBarChart2 style={{ marginRight: 8 }} />Receita Mensal</h2>
          {grandTotalReceived > 0 && (
            <span className="fin-section-sub">{formatCurrency(grandTotalReceived)} acumulado</span>
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
        {/* Revenue per motorcycle */}
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

        {/* Revenue Split + Contract Status */}
        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiPieChart style={{ marginRight: 8 }} />Distribuição de Receitas</h2>
          </div>
          <div className="fin-split-section">
            {/* Segmented bar */}
            <div className="fin-split-bar-wrap">
              <div className="fin-split-bar">
                <div className="fin-split-seg received" style={{ width: `${pctReceived}%` }} />
                <div className="fin-split-seg pending" style={{ width: `${pctPending}%` }} />
                <div className="fin-split-seg overdue" style={{ width: `${pctOverdue}%` }} />
              </div>
            </div>
            {/* Legend */}
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

          {/* Contract Status Distribution */}
          <div className="fin-section-header" style={{ borderTop: '1px solid var(--border)', marginTop: 0 }}>
            <h2><FiFileText style={{ marginRight: 8 }} />Status dos Contratos</h2>
          </div>
          <div className="fin-status-rows">
            {[{ label: 'Ativos', count: activeContracts, color: 'var(--success)' },
              { label: 'Em Atraso', count: overdueCount, color: 'var(--warning)' },
              { label: 'Finalizados', count: finishedCount, color: 'var(--info)' },
              { label: 'Cancelados', count: cancelledCount, color: 'var(--danger)' },
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

      {/* Bottom Grid: overdue + paid feed */}
      <div className="fin-grid">
        {/* Overdue clients */}
        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiAlertTriangle style={{ marginRight: 8 }} />Locadores em Atraso</h2>
            {overdueContracts.length > 0 && (
              <span className="fin-badge danger">{overdueContracts.length}</span>
            )}
          </div>
          {overdueContracts.length === 0 ? (
            <div className="fin-section-empty"><FiCheckCircle style={{ color: 'var(--success)' }} /><p>Nenhum locador em atraso</p></div>
          ) : (
            <ul className="fin-overdue-list">
              {overdueContracts.map((contract) => {
                const overduePaymentsCount = (contract.payments || []).filter((p) => p.status === 'OVERDUE').length;
                const overdueTotal = (contract.payments || [])
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
                        <p>{contract.motorcycle?.brand} {contract.motorcycle?.model} · {overduePaymentsCount} pag. atrasado{overduePaymentsCount > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <span className="fin-overdue-amount">{formatCurrency(overdueTotal)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Recent paid payments */}
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
                        <p>{payment.contract.motorcycle?.brand} {payment.contract.motorcycle?.model} · {payment.description || 'Pagamento'} · {payment.paidDate ? formatDate(payment.paidDate) : formatDate(payment.dueDate)}</p>
                      </div>
                    </div>
                    <span className="fin-payment-amount">{formatCurrency(payment.amount)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Financial;
