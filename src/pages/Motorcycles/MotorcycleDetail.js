import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiTruck, FiFileText, FiUpload, FiTrash2,
  FiChevronRight, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import motorcycleService from '../../services/motorcycleService';
import {
  formatDate, formatCurrency,
  CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  getStatusColor, getStatusBgColor
} from '../../utils/formatters';
import './MotorcycleDetail.css';
import '../Customers/CustomerDetail.css';

function MotorcycleDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [moto, setMoto] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = () => {
    if (!moto.active) return { bg: 'var(--danger-bg)', color: 'var(--danger)', label: 'Inativa' };
    if (moto.available) return { bg: 'var(--success-bg)', color: 'var(--success)', label: 'Disponível' };
    return { bg: 'var(--warning-bg)', color: 'var(--warning)', label: 'Alugada' };
  };

  const badge = getStatusBadge();

  return (
    <div className="detail-page">
      <button className="back-link" onClick={() => navigate('/motos')}>
        <FiArrowLeft /> Voltar para motos
      </button>

      {/* Header */}
      <div className="moto-detail-header">
        <div className="moto-detail-icon">
          <FiTruck />
        </div>
        <div className="moto-detail-info">
          <h1>{moto.brand} {moto.model}</h1>
          <p>
            {moto.plate?.toUpperCase()} &middot; {moto.year} &middot; {moto.color}
            <span className="status-badge" style={{ background: badge.bg, color: badge.color, marginLeft: 12 }}>
              {badge.label}
            </span>
          </p>
        </div>
        <div className="moto-detail-actions">
          <button className="btn-icon" title="Upload documento" onClick={() => fileInputRef.current?.click()}>
            <FiUpload />
          </button>
          {moto.documentUrl && (
            <button className="btn-icon" title="Remover documento" onClick={handleDeleteDocument}>
              <FiTrash2 />
            </button>
          )}
          {moto.active ? (
            <button className="btn-warning btn-sm" onClick={handleToggleActive}>
              <FiXCircle /> Desativar
            </button>
          ) : (
            <button className="btn-success btn-sm" onClick={handleToggleActive}>
              <FiCheckCircle /> Ativar
            </button>
          )}
          <button className="btn-primary btn-sm" onClick={() => navigate(`/motos/editar/${id}`)}>
            <FiEdit2 /> Editar
          </button>
          <input ref={fileInputRef} type="file" className="upload-input" onChange={handleUploadDocument} />
        </div>
      </div>

      {/* Info */}
      <div className="info-grid">
        <div className="info-card">
          <div className="info-card-header">
            <FiTruck />
            <h3>Dados da Moto</h3>
          </div>
          <div className="info-card-body">
            <div className="info-row">
              <span className="label">Marca</span>
              <span className="value">{moto.brand}</span>
            </div>
            <div className="info-row">
              <span className="label">Modelo</span>
              <span className="value">{moto.model}</span>
            </div>
            <div className="info-row">
              <span className="label">Placa</span>
              <span className="value">{moto.plate?.toUpperCase()}</span>
            </div>
            <div className="info-row">
              <span className="label">Ano</span>
              <span className="value">{moto.year}</span>
            </div>
            <div className="info-row">
              <span className="label">Cor</span>
              <span className="value">{moto.color}</span>
            </div>
            <div className="info-row">
              <span className="label">RENAVAM</span>
              <span className="value">{moto.renavam}</span>
            </div>
            <div className="info-row">
              <span className="label">Chassi</span>
              <span className="value">{moto.chassis}</span>
            </div>
          </div>
        </div>

        <div className="info-card">
          <div className="info-card-header">
            <FiFileText />
            <h3>Documentação</h3>
          </div>
          <div className="info-card-body">
            <div className="info-row">
              <span className="label">Documento</span>
              <span className="value">
                {moto.documentUrl ? (
                  <a href={moto.documentUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-dark)', fontWeight: 600 }}>
                    Ver documento
                  </a>
                ) : (
                  '—'
                )}
              </span>
            </div>
            <div className="info-row">
              <span className="label">Disponível</span>
              <span className="value">{moto.available ? 'Sim' : 'Não'}</span>
            </div>
            <div className="info-row">
              <span className="label">Ativa</span>
              <span className="value">{moto.active ? 'Sim' : 'Não'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contracts */}
      <div className="contracts-section">
        <div className="section-header">
          <h2><FiFileText style={{ marginRight: 8, verticalAlign: 'middle' }} />Contratos</h2>
        </div>
        {contracts.length === 0 ? (
          <div className="empty-state">
            <FiFileText />
            <p>Nenhum contrato encontrado</p>
          </div>
        ) : (
          contracts.map((contract) => (
            <div
              key={contract.contractId}
              className="contract-item"
              onClick={() => navigate(`/contratos/${contract.contractId}`)}
            >
              <div className="contract-item-left">
                <h4>{contract.user?.name}</h4>
                <p>
                  {RENTAL_TYPE_LABELS[contract.rentalType]} &middot; {formatDate(contract.startDate)} a {formatDate(contract.endDate)} &middot; {formatCurrency(contract.weeklyAmount)}/semana
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  className="status-badge"
                  style={{ background: getStatusBgColor(contract.status), color: getStatusColor(contract.status) }}
                >
                  {CONTRACT_STATUS_LABELS[contract.status]}
                </span>
                <FiChevronRight style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MotorcycleDetail;
