import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiDollarSign, FiTrendingUp, FiAlertTriangle, FiCheckCircle,
  FiTruck, FiCalendar, FiInbox,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import contractService from '../../services/contractService';
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
      setContracts(Array.isArray(data) ? data : []);
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

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  return (
    <div className="financial-page">
      <div className="page-header">
        <h1>Financeiro</h1>
      </div>

      {/* KPI Cards */}
      <div className="fin-kpi-grid">
        <div className="fin-kpi-card success">
          <div className="fin-kpi-icon"><FiCheckCircle /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Total Recebido</span>
            <span className="fin-kpi-value">{formatCurrency(grandTotalReceived)}</span>
          </div>
        </div>
        <div className="fin-kpi-card warning">
          <div className="fin-kpi-icon"><FiCalendar /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Pendente</span>
            <span className="fin-kpi-value">{formatCurrency(totalPending)}</span>
          </div>
        </div>
        <div className="fin-kpi-card danger">
          <div className="fin-kpi-icon"><FiAlertTriangle /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Atrasado</span>
            <span className="fin-kpi-value">{formatCurrency(totalOverdue)}</span>
          </div>
        </div>
        <div className="fin-kpi-card amber">
          <div className="fin-kpi-icon"><FiDollarSign /></div>
          <div className="fin-kpi-info">
            <span className="fin-kpi-label">Multas Pendentes</span>
            <span className="fin-kpi-value">{formatCurrency(totalFinesPending)}</span>
          </div>
        </div>
      </div>

      {/* Contract status summary */}
      <div className="fin-status-bar">
        <div className="fin-status-item">
          <span className="fin-status-dot active" />
          <span>{activeContracts} Ativos</span>
        </div>
        <div className="fin-status-item">
          <span className="fin-status-dot overdue" />
          <span>{overdueCount} Atrasados</span>
        </div>
        <div className="fin-status-item">
          <span className="fin-status-dot finished" />
          <span>{finishedCount} Finalizados</span>
        </div>
        <div className="fin-status-item">
          <span className="fin-status-dot total" />
          <span>{contracts.length} Total</span>
        </div>
      </div>

      <div className="fin-grid">
        {/* Revenue per motorcycle */}
        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiTruck style={{ marginRight: 8 }} />Receita por Moto</h2>
          </div>
          {motoRevenueList.length === 0 ? (
            <div className="empty-state">
              <FiInbox />
              <p>Nenhuma receita registrada</p>
            </div>
          ) : (
            <div className="fin-moto-list">
              {motoRevenueList.map((moto, idx) => {
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
                      <div
                        className="fin-moto-bar-fill"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Overdue clients */}
        <div className="fin-section">
          <div className="fin-section-header">
            <h2><FiAlertTriangle style={{ marginRight: 8 }} />Locadores em Atraso</h2>
          </div>
          {overdueContracts.length === 0 ? (
            <div className="empty-state">
              <FiCheckCircle />
              <p>Nenhum locador em atraso</p>
            </div>
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
                        <p>
                          {contract.motorcycle?.brand} {contract.motorcycle?.model} ·
                          {overduePaymentsCount} pagamento{overduePaymentsCount > 1 ? 's' : ''} atrasado{overduePaymentsCount > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <span className="fin-overdue-amount">{formatCurrency(overdueTotal)}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Recent paid payments */}
      <div className="fin-section fin-section-full">
        <div className="fin-section-header">
          <h2><FiTrendingUp style={{ marginRight: 8 }} />Últimos Pagamentos Recebidos</h2>
        </div>
        {paidPayments.length === 0 ? (
          <div className="empty-state">
            <FiInbox />
            <p>Nenhum pagamento recebido</p>
          </div>
        ) : (
          <div className="fin-payments-list">
            {paidPayments
              .sort((a, b) => new Date(b.paidDate || b.dueDate) - new Date(a.paidDate || a.dueDate))
              .slice(0, 15)
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
                        {payment.contract.motorcycle?.brand} {payment.contract.motorcycle?.model} ·
                        {payment.description || 'Pagamento'} ·
                        {payment.paidDate ? formatDate(payment.paidDate) : formatDate(payment.dueDate)}
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
  );
}

export default Financial;
