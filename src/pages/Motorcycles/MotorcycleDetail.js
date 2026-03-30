import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiTruck, FiFileText, FiUpload, FiTrash2,
  FiChevronRight, FiCheckCircle, FiXCircle,
  FiDollarSign, FiTool, FiTrendingUp, FiTrendingDown, FiInbox, FiCamera, FiAlertTriangle,
  FiCalendar, FiExternalLink, FiUser,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import motorcycleService from '../../services/motorcycleService';
import {
  formatDate, formatCurrency,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  getStatusColor, getStatusBgColor
} from '../../utils/formatters';
import './MotorcycleDetail.css';

function MotorcycleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const pictureInputRef = useRef(null);

  const [moto, setMoto] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmToggle, setConfirmToggle] = useState(false);
  const [avatarHover, setAvatarHover] = useState(false);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      const [motoData, contractsData] = await Promise.all([
        motorcycleService.findById(id),
        motorcycleService.findContractsByMotorcycleId(id),
      ]);
      setMoto(motoData);
      setContracts(Array.isArray(contractsData) ? contractsData : []);
    } catch (error) {
      toast.error('Erro ao carregar dados da moto');
      navigate('/motos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    setConfirmToggle(false);
    try {
      let data;
      if (moto.active) {
        data = await motorcycleService.disable(id);
        toast.success('Moto desativada');
      } else {
        data = await motorcycleService.enable(id);
        toast.success('Moto ativada');
      }
      setMoto(data);
    } catch {
      toast.error('Erro ao alterar status da moto');
    }
  };

  const handleUploadPicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await motorcycleService.uploadPicture(id, file);
      const data = await motorcycleService.findById(id);
      setMoto(data);
      toast.success('Foto enviada com sucesso!');
    } catch {
      toast.error('Erro ao enviar foto');
    }
    e.target.value = '';
  };

  const handleDeletePicture = async () => {
    try {
      await motorcycleService.deletePicture(id);
      const data = await motorcycleService.findById(id);
      setMoto(data);
      toast.success('Foto removida');
    } catch {
      toast.error('Erro ao remover foto');
    }
  };

  const handleUploadDocument = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await motorcycleService.uploadDocument(id, file);
      setMoto(data);
      toast.success('Documento enviado com sucesso!');
    } catch {
      toast.error('Erro ao enviar documento');
    }
  };

  const handleDeleteDocument = async () => {
    try {
      const data = await motorcycleService.deleteDocument(id);
      setMoto(data);
      toast.success('Documento removido');
    } catch {
      toast.error('Erro ao remover documento');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (!moto) return null;

  const statusMeta = !moto.active
    ? { label: 'Inativa',    color: 'var(--danger)',  bg: 'var(--danger-bg)',  stripe: '#f87171' }
    : moto.available
    ? { label: 'Disponível', color: 'var(--success)', bg: 'var(--success-bg)', stripe: '#34d399' }
    : { label: 'Alugada',    color: 'var(--warning)', bg: 'var(--warning-bg)', stripe: '#fbbf24' };

  return (
    <div className="md-page">
      <button className="back-link" onClick={() => navigate('/motos')}>
        <FiArrowLeft /> Voltar para motos
      </button>

      {/* ── Confirmation Modal ── */}
      {confirmToggle && (
        <div className="md-modal-backdrop" onClick={() => setConfirmToggle(false)}>
          <div className="md-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`md-modal-icon ${moto.active ? 'warning' : 'success'}`}>
              <FiAlertTriangle />
            </div>
            <h3 className="md-modal-title">
              {moto.active ? 'Desativar moto?' : 'Ativar moto?'}
            </h3>
            <p className="md-modal-body">
              {moto.active
                ? `A moto ${moto.brand} ${moto.model} (${moto.plate?.toUpperCase()}) será desativada e não aparecerá como disponível para aluguel.`
                : `A moto ${moto.brand} ${moto.model} (${moto.plate?.toUpperCase()}) será reativada no sistema.`}
            </p>
            <div className="md-modal-actions">
              <button className="md-modal-btn cancel" onClick={() => setConfirmToggle(false)}>
                Cancelar
              </button>
              <button
                className={`md-modal-btn confirm ${moto.active ? 'warning' : 'success'}`}
                onClick={handleToggleActive}
              >
                {moto.active ? 'Sim, desativar' : 'Sim, ativar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Hero ── */}
      <div className="md-hero">
        <div className="md-hero-stripe" style={{ background: statusMeta.stripe }} />
        <div className="md-hero-body">
          <div className="md-hero-main">
            <div
              className="md-hero-avatar-wrap"
              onMouseEnter={() => setAvatarHover(true)}
              onMouseLeave={() => setAvatarHover(false)}
              onClick={() => pictureInputRef.current?.click()}
            >
              {moto.pictureUrl
                ? <img src={moto.pictureUrl} alt={`${moto.brand} ${moto.model}`} className="md-hero-avatar-img" />
                : <div className="md-hero-avatar-fallback"><FiTruck /></div>}
              <div className={`md-hero-avatar-overlay ${avatarHover ? 'visible' : ''}`}>
                <FiCamera />
                <span>{moto.pictureUrl ? 'Trocar foto' : 'Adicionar'}</span>
                {moto.pictureUrl && (
                  <button
                    className="md-hero-avatar-del"
                    title="Remover foto"
                    onClick={(e) => { e.stopPropagation(); handleDeletePicture(); }}
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
            <div className="md-hero-info">
              <div className="md-hero-title-row">
                <h1 className="md-hero-title">{moto.brand} {moto.model}</h1>
                <span className="md-plate">{moto.plate?.toUpperCase()}</span>
                <span className="md-status-chip" style={{ background: statusMeta.bg, color: statusMeta.color }}>
                  {statusMeta.label}
                </span>
              </div>
              <p className="md-hero-sub">
                {moto.year} · {moto.color}
                {moto.mileage != null && ` · ${moto.mileage.toLocaleString('pt-BR')} km`}
              </p>
            </div>
          </div>
          <div className="md-hero-actions">
            <button
              className={`md-action-btn ${moto.active ? 'warning' : 'success'}`}
              onClick={() => setConfirmToggle(true)}
            >
              {moto.active ? <FiXCircle /> : <FiCheckCircle />}
              <span>{moto.active ? 'Desativar' : 'Ativar'}</span>
            </button>
            <button className="md-action-btn primary" onClick={() => navigate(`/motos/editar/${id}`)}>
              <FiEdit2 /><span>Editar</span>
            </button>
            <input ref={pictureInputRef} type="file" accept="image/*" className="upload-input" onChange={handleUploadPicture} />
            <input ref={fileInputRef} type="file" className="upload-input" onChange={handleUploadDocument} />
          </div>
        </div>
      </div>



      {/* ── Info Cards ── */}
      <div className="md-card">
        <div className="md-card-header">
          <FiTruck className="md-card-header-icon" />
          <h3>Dados da Moto</h3>
        </div>
        <div className="md-card-body">
          <div className="md-spec-row"><span className="md-spec-label">Marca</span><span className="md-spec-value">{moto.brand}</span></div>
          <div className="md-spec-row"><span className="md-spec-label">Modelo</span><span className="md-spec-value">{moto.model}</span></div>
          <div className="md-spec-row"><span className="md-spec-label">Placa</span><span className="md-spec-value md-spec-plate">{moto.plate?.toUpperCase()}</span></div>
          <div className="md-spec-row"><span className="md-spec-label">Ano</span><span className="md-spec-value">{moto.year}</span></div>
          <div className="md-spec-row"><span className="md-spec-label">Cor</span><span className="md-spec-value">{moto.color}</span></div>
          <div className="md-spec-row"><span className="md-spec-label">RENAVAM</span><span className="md-spec-value">{moto.renavam}</span></div>
          <div className="md-spec-row"><span className="md-spec-label">Chassi</span><span className="md-spec-value">{moto.chassis}</span></div>
          <div className="md-spec-row">
            <span className="md-spec-label">Quilometragem</span>
            <span className="md-spec-value">{moto.mileage != null ? `${moto.mileage.toLocaleString('pt-BR')} km` : '—'}</span>
          </div>
          <div className="md-spec-row">
            <span className="md-spec-label">Documento</span>
            <span className="md-spec-value md-doc-row">
              {moto.documentUrl ? (
                <>
                  <a href={moto.documentUrl} target="_blank" rel="noopener noreferrer" className="md-doc-link-inline">
                    <FiExternalLink /> Ver PDF
                  </a>
                  <button className="md-icon-btn-sm" title="Substituir" onClick={() => fileInputRef.current?.click()}><FiUpload /></button>
                  <button className="md-icon-btn-sm danger" title="Remover" onClick={handleDeleteDocument}><FiTrash2 /></button>
                </>
              ) : (
                <button className="md-doc-upload-btn" onClick={() => fileInputRef.current?.click()}>
                  <FiUpload /> Enviar
                </button>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* ── Contracts ── */}
      <div className="md-section">
        <div className="md-section-header">
          <FiFileText className="md-section-icon" />
          <h2>Contratos ({contracts.length})</h2>
        </div>
        {contracts.length === 0 ? (
          <div className="md-empty">
            <FiInbox />
            <p>Nenhum contrato encontrado</p>
          </div>
        ) : (
          <div className="md-contract-list">
            {contracts.map((contract) => (
              <div
                key={contract.contractId}
                className="md-contract-item"
                onClick={() => navigate(`/contratos/${contract.contractId}`)}
              >
                <div className="md-contract-icon-wrap">
                  <FiUser />
                </div>
                <div className="md-contract-left">
                  <h4 className="md-contract-user">{contract.user?.name}</h4>
                  <div className="md-contract-meta">
                    <span className="md-contract-type-badge">{RENTAL_TYPE_LABELS[contract.rentalType]}</span>
                    <span className="md-contract-dates">
                      <FiCalendar />
                      {formatDate(contract.startDate)} → {formatDate(contract.endDate)}
                    </span>
                  </div>
                </div>
                <div className="md-contract-right">
                  <div className="md-contract-amount-wrap">
                    <span className="md-contract-amount">{formatCurrency(contract.weeklyAmount)}</span>
                    <span className="md-contract-amount-unit">/sem</span>
                  </div>
                  <span
                    className="md-contract-status"
                    style={{ background: getStatusBgColor(contract.status), color: getStatusColor(contract.status) }}
                  >
                    {CONTRACT_STATUS_LABELS[contract.status]}
                  </span>
                  <FiChevronRight className="md-contract-arrow" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Financial ── */}
      {moto.financial && (
        <div className="md-section">
          <div className="md-section-header">
            <FiDollarSign className="md-section-icon" />
            <h2>Financeiro</h2>
          </div>

          <div className="md-fin-summary">
            <div className={`md-fin-card ${(moto.financial.total || 0) >= 0 ? 'positive' : 'negative'}`}>
              <div className="md-fin-icon">
                {(moto.financial.total || 0) >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
              </div>
              <div>
                <span className="md-fin-label">Saldo Líquido</span>
                <span className="md-fin-value">{formatCurrency(moto.financial.total || 0)}</span>
              </div>
            </div>
            <div className="md-fin-card earnings">
              <div className="md-fin-icon"><FiTrendingUp /></div>
              <div>
                <span className="md-fin-label">Receitas Pagas</span>
                <span className="md-fin-value">
                  {formatCurrency(
                    (moto.financial.earnings || []).filter((e) => e.status === 'PAID').reduce((s, e) => s + (e.amount || 0), 0)
                  )}
                </span>
              </div>
            </div>
            <div className="md-fin-card expenses">
              <div className="md-fin-icon"><FiTool /></div>
              <div>
                <span className="md-fin-label">Despesas Pagas</span>
                <span className="md-fin-value">
                  {formatCurrency(
                    (moto.financial.expenses || []).filter((e) => e.status === 'PAID').reduce((s, e) => s + (e.amount || 0), 0)
                  )}
                </span>
              </div>
            </div>
          </div>

          {(moto.financial.expenses || []).length === 0 ? (
            <div className="md-empty">
              <FiInbox />
              <p>Nenhuma despesa registrada</p>
            </div>
          ) : (
            <div className="md-expense-list">
              {[...(moto.financial.expenses || [])]
                .sort((a, b) => new Date(b.createdAt || b.dueDate) - new Date(a.createdAt || a.dueDate))
                .map((expense, idx) => {
                  const sc = expense.status === 'PAID' ? 'var(--success)' : expense.status === 'OVERDUE' ? 'var(--danger)' : 'var(--warning)';
                  const sl = expense.status === 'PAID' ? 'Paga' : expense.status === 'PENDING' ? 'Pendente' : 'Vencida';
                  const tl = { MAINTENANCE: 'Manutenção', UTILITIES: 'Utilidades', TAXES: 'Impostos', INSURANCE: 'Seguro', OTHER: 'Outros' };
                  return (
                    <div key={idx} className="md-expense-item">
                      <div className="md-expense-left">
                        <div className="md-expense-icon"><FiTool /></div>
                        <div>
                          <h4 className="md-expense-type">
                            {tl[expense.type] || expense.type}
                            {expense.description && <span className="md-expense-desc"> — {expense.description}</span>}
                          </h4>
                          <p className="md-expense-dates">
                            Vence: {formatDate(expense.dueDate)}
                            {expense.paidDate && ` · Pago: ${formatDate(expense.paidDate)}`}
                          </p>
                        </div>
                      </div>
                      <div className="md-expense-right">
                        <span className="md-expense-amount">{formatCurrency(expense.amount)}</span>
                        <span className="md-expense-status" style={{ background: sc + '22', color: sc }}>{sl}</span>
                        {expense.method && (
                          <span className="md-expense-method">
                            {{ PIX: 'Pix', CASH: 'Dinheiro', CARD: 'Cartão' }[expense.method] || expense.method}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MotorcycleDetail;
