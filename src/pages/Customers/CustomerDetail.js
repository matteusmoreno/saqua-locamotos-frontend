import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiUser, FiMapPin, FiFileText, FiUpload, FiTrash2, FiChevronRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import {
  formatCPF, formatPhone, formatCEP, formatDate, formatCurrency,
  MARITAL_STATUS_LABELS, CONTRACT_STATUS_LABELS, RENTAL_TYPE_LABELS,
  getStatusColor, getStatusBgColor
} from '../../utils/formatters';
import './CustomerDetail.css';

function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [customer, setCustomer] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadData = async () => {
    try {
      const [customerData, contractsData] = await Promise.all([
        userService.findById(id),
        userService.findContractsByUserId(id),
      ]);
      setCustomer(customerData);
      setContracts(Array.isArray(contractsData) ? contractsData : []);
    } catch (error) {
      toast.error('Erro ao carregar dados do locador');
      navigate('/locadores');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPicture = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = await userService.uploadPicture(id, file);
      setCustomer(data);
      toast.success('Foto atualizada com sucesso!');
    } catch {
      toast.error('Erro ao enviar foto');
    }
  };

  const handleDeletePicture = async () => {
    try {
      const data = await userService.deletePicture(id);
      setCustomer(data);
      toast.success('Foto removida com sucesso!');
    } catch {
      toast.error('Erro ao remover foto');
    }
  };

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (!customer) return null;

  return (
    <div className="detail-page">
      <button className="back-link" onClick={() => navigate('/locadores')}>
        <FiArrowLeft /> Voltar para locadores
      </button>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar">
          {customer.pictureUrl ? (
            <img src={customer.pictureUrl} alt={customer.name} />
          ) : (
            customer.name?.charAt(0).toUpperCase()
          )}
        </div>
        <div className="profile-info">
          <h1>{customer.name}</h1>
          <p>{customer.email} &middot; {formatPhone(customer.phone)}</p>
        </div>
        <div className="profile-actions">
          <button className="btn-icon" title="Upload foto" onClick={() => fileInputRef.current?.click()}>
            <FiUpload />
          </button>
          {customer.pictureUrl && (
            <button className="btn-icon" title="Remover foto" onClick={handleDeletePicture}>
              <FiTrash2 />
            </button>
          )}
          <button className="btn-primary btn-sm" onClick={() => navigate(`/locadores/editar/${id}`)}>
            <FiEdit2 /> Editar
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" className="upload-input" onChange={handleUploadPicture} />
        </div>
      </div>

      <div className="info-grid">
        {/* Personal Info */}
        <div className="info-card">
          <div className="info-card-header">
            <FiUser />
            <h3>Dados Pessoais</h3>
          </div>
          <div className="info-card-body">
            <div className="info-row">
              <span className="label">CPF</span>
              <span className="value">{formatCPF(customer.cpf)}</span>
            </div>
            <div className="info-row">
              <span className="label">RG</span>
              <span className="value">{customer.rg || '—'}</span>
            </div>
            <div className="info-row">
              <span className="label">Profissão</span>
              <span className="value">{customer.occupation || '—'}</span>
            </div>
            <div className="info-row">
              <span className="label">Estado Civil</span>
              <span className="value">{MARITAL_STATUS_LABELS[customer.maritalStatus] || '—'}</span>
            </div>
            <div className="info-row">
              <span className="label">Cadastro</span>
              <span className="value">{formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="info-card">
          <div className="info-card-header">
            <FiMapPin />
            <h3>Endereço</h3>
          </div>
          <div className="info-card-body">
            {customer.address ? (
              <>
                <div className="info-row">
                  <span className="label">CEP</span>
                  <span className="value">{formatCEP(customer.address.zipCode)}</span>
                </div>
                <div className="info-row">
                  <span className="label">Rua</span>
                  <span className="value">{customer.address.street || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Número</span>
                  <span className="value">{customer.address.number || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Bairro</span>
                  <span className="value">{customer.address.neighborhood || '—'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Cidade</span>
                  <span className="value">{customer.address.city} - {customer.address.state}</span>
                </div>
                {customer.address.complement && (
                  <div className="info-row">
                    <span className="label">Complemento</span>
                    <span className="value">{customer.address.complement}</span>
                  </div>
                )}
              </>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>Endereço não cadastrado</p>
            )}
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
                <h4>{contract.motorcycle?.brand} {contract.motorcycle?.model} — {contract.motorcycle?.plate}</h4>
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

export default CustomerDetail;
