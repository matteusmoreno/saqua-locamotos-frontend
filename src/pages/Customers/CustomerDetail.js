import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiEdit2, FiUser, FiMapPin, FiFileText,
  FiUpload, FiTrash2, FiChevronRight, FiExternalLink,
  FiPhone, FiMail, FiCamera, FiBriefcase, FiCalendar,
  FiCheckCircle, FiAlertCircle, FiHome,
} from 'react-icons/fi';
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
  const docFileInputRef = useRef(null);

  const [customer, setCustomer] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingDocType, setPendingDocType] = useState(null);
  const [avatarHover, setAvatarHover] = useState(false);

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

  const DOC_TYPES = [
    { key: 'cnh',                field: 'cnh',                 label: 'CNH' },
    { key: 'cpf',                field: 'cpfUrl',              label: 'CPF' },
    { key: 'rg',                 field: 'rgUrl',               label: 'RG' },
    { key: 'proof_of_residence', field: 'proofOfResidenceUrl', label: 'Comp. de Residência' },
    { key: 'criminal_record',    field: 'criminalRecordUrl',   label: 'Antecedentes' },
    { key: 'passport',           field: 'passportUrl',         label: 'Passaporte' },
  ];

  const handleUploadDoc = (key) => {
    setPendingDocType(key);
    docFileInputRef.current?.click();
  };

  const handleDocFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !pendingDocType) return;
    e.target.value = '';
    try {
      const updated = await userService.uploadDocuments(id, { [pendingDocType]: file });
      setCustomer(updated);
      toast.success('Documento enviado!');
    } catch {
      toast.error('Erro ao enviar documento');
    } finally {
      setPendingDocType(null);
    }
  };

  const handleDeleteDoc = async (key) => {
    try {
      const updated = await userService.deleteDocuments(id, [key]);
      setCustomer(updated);
      toast.success('Documento removido!');
    } catch {
      toast.error('Erro ao remover documento');
    }
  };

  /* Build Google Maps embed URL from address */
  const getMapsEmbedUrl = (address) => {
    if (!address) return null;
    const q = encodeURIComponent(
      `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode}, Brasil`
    );
    return `https://maps.google.com/maps?q=${q}&output=embed&z=16`;
  };

  const getMapsLinkUrl = (address) => {
    if (!address) return null;
    const q = encodeURIComponent(
      `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}`
    );
    return `https://maps.google.com/?q=${q}`;
  };

  /* Avatar initial color */
  const AVATAR_COLORS = [
    ['#7C3AED','#EDE9FE'],['#0EA5E9','#E0F2FE'],['#10B981','#D1FAE5'],
    ['#F59E0B','#FEF3C7'],['#EF4444','#FEE2E2'],['#EC4899','#FCE7F3'],
    ['#6366F1','#EEF2FF'],['#14B8A6','#CCFBF1'],
  ];
  const [avatarColor, avatarBg] = customer
    ? AVATAR_COLORS[(customer.name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
    : ['#FFC30E','#1a1500'];

  const docsCount = customer?.documents
    ? Object.values(customer.documents).filter(Boolean).length
    : 0;

  if (loading) {
    return <div className="loading-container"><div className="spinner" /></div>;
  }

  if (!customer) return null;

  return (
    <div className="cd-page">

      {/* ── Back ── */}
      <button className="cd-back" onClick={() => navigate('/locadores')}>
        <FiArrowLeft /> Voltar para locadores
      </button>

      {/* ── Hero profile card ── */}
      <div className="cd-hero">
        <div className="cd-hero-stripe" />

        {/* Avatar – clicável para upload */}
        <div
          className="cd-avatar-wrap"
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
          onClick={() => fileInputRef.current?.click()}
          title="Clique para alterar foto"
        >
          {customer.pictureUrl ? (
            <img src={customer.pictureUrl} alt={customer.name} className="cd-avatar" />
          ) : (
            <div className="cd-avatar cd-avatar-initial" style={{ background: avatarBg, color: avatarColor }}>
              {customer.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className={`cd-avatar-overlay ${avatarHover ? 'visible' : ''}`}>
            <FiCamera />
            <span>Alterar foto</span>
          </div>
        </div>

        <div className="cd-hero-body">
          <div className="cd-hero-info">
            <h1 className="cd-hero-name">{customer.name}</h1>
            {customer.occupation && (
              <span className="cd-hero-occupation">
                <FiBriefcase /> {customer.occupation}
              </span>
            )}
            <div className="cd-hero-contacts">
              {customer.email && (
                <a className="cd-hero-contact" href={`mailto:${customer.email}`}>
                  <FiMail /> {customer.email}
                </a>
              )}
              {customer.phone && (
                <a className="cd-hero-contact" href={`tel:${customer.phone}`}>
                  <FiPhone /> {formatPhone(customer.phone)}
                </a>
              )}
            </div>
          </div>

          <div className="cd-hero-badges">
            <div className="cd-badge">
              <FiFileText />
              <span>{contracts.length} contrato{contracts.length !== 1 ? 's' : ''}</span>
            </div>
            <div className={`cd-badge ${docsCount === DOC_TYPES.length ? 'success' : docsCount > 0 ? 'warning' : 'muted'}`}>
              {docsCount === DOC_TYPES.length ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{docsCount}/{DOC_TYPES.length} documentos</span>
            </div>
            <div className="cd-badge">
              <FiCalendar />
              <span>Desde {formatDate(customer.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="cd-hero-actions">
          {customer.pictureUrl && (
            <button className="btn-icon" title="Remover foto" onClick={handleDeletePicture}>
              <FiTrash2 />
            </button>
          )}
          <button className="btn-primary btn-sm" onClick={() => navigate(`/locadores/editar/${id}`)}>
            <FiEdit2 /> Editar
          </button>
        </div>

        <input ref={fileInputRef} type="file" accept="image/*" className="upload-input" onChange={handleUploadPicture} />
      </div>

      {/* ── Main content grid ── */}
      <div className="cd-main-grid">

        {/* ── Left column ── */}
        <div className="cd-left-col">

          {/* Personal Data */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="cd-card-header-icon"><FiUser /></div>
              <h2>Dados Pessoais</h2>
            </div>
            <div className="cd-card-body">
              <div className="cd-info-row">
                <span className="cd-info-label">CPF</span>
                <span className="cd-info-value mono">{formatCPF(customer.cpf)}</span>
              </div>
              <div className="cd-info-row">
                <span className="cd-info-label">RG</span>
                <span className="cd-info-value">{customer.rg || '—'}</span>
              </div>
              <div className="cd-info-row">
                <span className="cd-info-label">Profissão</span>
                <span className="cd-info-value">{customer.occupation || '—'}</span>
              </div>
              <div className="cd-info-row">
                <span className="cd-info-label">Estado Civil</span>
                <span className="cd-info-value">{MARITAL_STATUS_LABELS[customer.maritalStatus] || '—'}</span>
              </div>
              <div className="cd-info-row">
                <span className="cd-info-label">Cadastrado em</span>
                <span className="cd-info-value">{formatDate(customer.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="cd-card-header-icon"><FiFileText /></div>
              <h2>Documentos</h2>
              <span className="cd-docs-counter">{docsCount}/{DOC_TYPES.length}</span>
              <div className="cd-docs-progress">
                <div className="cd-docs-progress-fill" style={{ width: `${(docsCount / DOC_TYPES.length) * 100}%` }} />
              </div>
            </div>
            <div className="cd-doc-grid">
              {DOC_TYPES.map((doc) => {
                const url = customer.documents?.[doc.field];
                return (
                  <div key={doc.key} className={`cd-doc-item ${url ? 'sent' : 'missing'}`}>
                    <div className="cd-doc-icon">
                      {url ? <FiCheckCircle /> : <FiFileText />}
                    </div>
                    <div className="cd-doc-info">
                      <span className="cd-doc-label">{doc.label}</span>
                      {url ? (
                        <a href={url} target="_blank" rel="noopener noreferrer" className="cd-doc-link">
                          <FiExternalLink /> Ver doc
                        </a>
                      ) : (
                        <span className="cd-doc-missing">Não enviado</span>
                      )}
                    </div>
                    <button
                      className="cd-doc-action"
                      title={url ? 'Remover' : 'Enviar'}
                      onClick={() => url ? handleDeleteDoc(doc.key) : handleUploadDoc(doc.key)}
                    >
                      {url ? <FiTrash2 /> : <FiUpload />}
                    </button>
                  </div>
                );
              })}
            </div>
            <input
              ref={docFileInputRef}
              type="file"
              accept=".pdf,image/*"
              className="upload-input"
              onChange={handleDocFileChange}
            />
          </div>

        </div>

        {/* ── Right column ── */}
        <div className="cd-right-col">

          {/* Address + Map */}
          <div className="cd-card cd-card-address">
            <div className="cd-card-header">
              <div className="cd-card-header-icon"><FiHome /></div>
              <h2>Endereço</h2>
              {customer.address && (
                <a
                  href={getMapsLinkUrl(customer.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="cd-maps-link"
                >
                  <FiExternalLink /> Ver no Maps
                </a>
              )}
            </div>

            {customer.address ? (
              <>
                <div className="cd-card-body">
                  <div className="cd-info-row">
                    <span className="cd-info-label">CEP</span>
                    <span className="cd-info-value mono">{formatCEP(customer.address.zipCode)}</span>
                  </div>
                  <div className="cd-info-row">
                    <span className="cd-info-label">Logradouro</span>
                    <span className="cd-info-value">{customer.address.street}, {customer.address.number}</span>
                  </div>
                  {customer.address.complement && (
                    <div className="cd-info-row">
                      <span className="cd-info-label">Complemento</span>
                      <span className="cd-info-value">{customer.address.complement}</span>
                    </div>
                  )}
                  <div className="cd-info-row">
                    <span className="cd-info-label">Bairro</span>
                    <span className="cd-info-value">{customer.address.neighborhood}</span>
                  </div>
                  <div className="cd-info-row">
                    <span className="cd-info-label">Cidade / UF</span>
                    <span className="cd-info-value">{customer.address.city} — {customer.address.state}</span>
                  </div>
                </div>

                {/* Google Maps embed – dark mode */}
                <div className="cd-map-wrap">
                  <div className="cd-map-header">
                    <FiMapPin /> {customer.address.street}, {customer.address.number} — {customer.address.city}/{customer.address.state}
                  </div>
                  <div className="cd-map-frame">
                    <iframe
                      title={`Localização de ${customer.name}`}
                      src={getMapsEmbedUrl(customer.address)}
                      width="100%"
                      height="100%"
                      style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <a
                    href={getMapsLinkUrl(customer.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="cd-map-open-btn"
                  >
                    <FiMapPin /> Abrir no Google Maps
                  </a>
                </div>
              </>
            ) : (
              <div className="cd-empty-address">
                <FiMapPin />
                <p>Endereço não cadastrado</p>
                <button className="btn-primary btn-sm" onClick={() => navigate(`/locadores/editar/${id}`)}>
                  <FiEdit2 /> Adicionar endereço
                </button>
              </div>
            )}
          </div>

          {/* Contracts */}
          <div className="cd-card">
            <div className="cd-card-header">
              <div className="cd-card-header-icon"><FiFileText /></div>
              <h2>Contratos</h2>
            </div>
            {contracts.length === 0 ? (
              <div className="cd-empty-contracts">
                <FiFileText />
                <p>Nenhum contrato encontrado</p>
              </div>
            ) : (
              contracts.map((contract) => (
                <div
                  key={contract.contractId}
                  className="cd-contract-item"
                  onClick={() => navigate(`/contratos/${contract.contractId}`)}
                >
                  <div className="cd-contract-left">
                    <h4>{contract.motorcycle?.brand} {contract.motorcycle?.model} — {contract.motorcycle?.plate}</h4>
                    <p>
                      {RENTAL_TYPE_LABELS[contract.rentalType]} &middot; {formatDate(contract.startDate)} a {formatDate(contract.endDate)} &middot; {formatCurrency(contract.weeklyAmount)}/sem
                    </p>
                  </div>
                  <div className="cd-contract-right">
                    <span
                      className="status-badge"
                      style={{ background: getStatusBgColor(contract.status), color: getStatusColor(contract.status) }}
                    >
                      {CONTRACT_STATUS_LABELS[contract.status]}
                    </span>
                    <FiChevronRight className="cd-contract-arrow" />
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default CustomerDetail;
