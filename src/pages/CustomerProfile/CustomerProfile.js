import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import userService from '../../services/userService';
import { formatCPF, formatPhone, formatCEP, formatDate, MARITAL_STATUS_LABELS } from '../../utils/formatters';
import { FiUser, FiMapPin, FiMail, FiShield, FiFileText, FiUpload, FiTrash2, FiExternalLink, FiCheckCircle, FiAlertCircle, FiSend, FiX, FiKey } from 'react-icons/fi';
import './CustomerProfile.css';

function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingDocType, setPendingDocType] = useState(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const docFileInputRef = useRef(null);

  // Verify-email modal
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [tokenInput, setTokenInput] = useState('');
  const [verifyStatus, setVerifyStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [verifyError, setVerifyError] = useState('');
  const tokenInputRef = useRef(null);

  const DOC_TYPES = [
    { key: 'cnh',                field: 'cnh',                 label: 'CNH' },
    { key: 'cpf',                field: 'cpfUrl',              label: 'CPF' },
    { key: 'rg',                 field: 'rgUrl',               label: 'RG' },
    { key: 'proof_of_residence', field: 'proofOfResidenceUrl', label: 'Comp. de Residência' },
    { key: 'criminal_record',    field: 'criminalRecordUrl',   label: 'Antecedentes' },
    { key: 'passport',           field: 'passportUrl',         label: 'Passaporte' },
  ];

  useEffect(() => {
    loadProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.userId]);

  const loadProfile = async () => {
    if (!user?.userId) return;
    try {
      setLoading(true);
      const data = await userService.findById(user.userId);
      setProfile(data);
    } catch (err) {
      console.error('Erro ao carregar perfil:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadDoc = (key) => {
    setPendingDocType(key);
    docFileInputRef.current?.click();
  };

  const handleDocFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !pendingDocType) return;
    e.target.value = '';
    try {
      const updated = await userService.uploadDocuments(user.userId, { [pendingDocType]: file });
      setProfile(updated);
      toast.success('Documento enviado com sucesso!');
    } catch {
      toast.error('Erro ao enviar documento');
    } finally {
      setPendingDocType(null);
    }
  };

  const handleDeleteDoc = async (key) => {
    try {
      const updated = await userService.deleteDocuments(user.userId, [key]);
      setProfile(updated);
      toast.success('Documento removido!');
    } catch {
      toast.error('Erro ao remover documento');
    }
  };

  const openVerifyModal = () => {
    setTokenInput('');
    setVerifyStatus('idle');
    setVerifyError('');
    setVerifyModalOpen(true);
    setTimeout(() => tokenInputRef.current?.focus(), 80);
  };

  const closeVerifyModal = () => {
    if (verifyStatus === 'loading') return;
    setVerifyModalOpen(false);
    setVerifyStatus('idle');
    setTokenInput('');
    setVerifyError('');
  };

  const handleSendVerificationEmail = async () => {
    if (sendingEmail) return;
    try {
      setSendingEmail(true);
      await userService.sendVerificationEmail(user.userId);
      toast.success('E-mail de verificação enviado! Cole o token abaixo.');
      openVerifyModal();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Erro ao enviar e-mail de verificação.';
      toast.error(typeof msg === 'string' ? msg : 'Erro ao enviar e-mail de verificação.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleVerifyToken = async () => {
    const t = tokenInput.trim();
    if (!t) return;
    setVerifyStatus('loading');
    setVerifyError('');
    try {
      await userService.verifyEmail(t);
      setVerifyStatus('success');
      await loadProfile();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || 'Token inválido ou já utilizado.';
      setVerifyError(typeof msg === 'string' ? msg : 'Erro ao verificar e-mail.');
      setVerifyStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="customer-profile">
        <div className="customer-profile-loading">
          <div className="spinner" />
          <span>Carregando perfil...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="customer-profile">
        <div className="customer-profile-loading">
          <span>Não foi possível carregar seu perfil.</span>
        </div>
      </div>
    );
  }

  const initial = profile.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div className="customer-profile">
      {/* Header */}
      <div className="cp-header">
        <div className="cp-avatar">
          {profile.pictureUrl ? (
            <img src={profile.pictureUrl} alt={profile.name} />
          ) : (
            <div className="cp-avatar-initial">{initial}</div>
          )}
        </div>
        <div className="cp-header-info">
          <h1>{profile.name}</h1>
          <p className="cp-email">{profile.email}</p>
          <div className="cp-header-badges">
            <span className="cp-role-badge">
              <FiShield /> Locador
            </span>
            {profile.emailVerified ? (
              <span className="cp-email-badge verified">
                <FiCheckCircle /> E-mail verificado
              </span>
            ) : (
              <span className="cp-email-badge unverified">
                <FiAlertCircle /> E-mail não verificado
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div className="cp-section">
        <div className="cp-section-header">
          <FiUser /> Dados Pessoais
        </div>
        <div className="cp-fields">
          <div className="cp-field">
            <span className="cp-field-label">Nome Completo</span>
            <span className="cp-field-value">{profile.name}</span>
          </div>
          <div className="cp-field">
            <span className="cp-field-label">CPF</span>
            <span className="cp-field-value">{formatCPF(profile.cpf)}</span>
          </div>
          <div className="cp-field">
            <span className="cp-field-label">RG</span>
            <span className={`cp-field-value ${!profile.rg ? 'empty' : ''}`}>
              {profile.rg || 'Não informado'}
            </span>
          </div>
          <div className="cp-field">
            <span className="cp-field-label">Estado Civil</span>
            <span className="cp-field-value">
              {MARITAL_STATUS_LABELS[profile.maritalStatus] || profile.maritalStatus}
            </span>
          </div>
          <div className="cp-field">
            <span className="cp-field-label">Profissão</span>
            <span className={`cp-field-value ${!profile.occupation ? 'empty' : ''}`}>
              {profile.occupation || 'Não informado'}
            </span>
          </div>
          <div className="cp-field">
            <span className="cp-field-label">Cadastrado em</span>
            <span className="cp-field-value">{formatDate(profile.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="cp-section">
        <div className="cp-section-header">
          <FiMail /> Contato
        </div>
        <div className="cp-fields">
          <div className="cp-field">
            <span className="cp-field-label">E-mail</span>
            <div className="cp-field-email-row">
              <span className="cp-field-value">{profile.email}</span>
              {profile.emailVerified ? (
                <span className="cp-email-status verified"><FiCheckCircle /> Verificado</span>
              ) : (
                <button
                  className="cp-verify-btn"
                  onClick={handleSendVerificationEmail}
                  disabled={sendingEmail}
                  title="Enviar e-mail de verificação"
                >
                  <FiSend /> {sendingEmail ? 'Enviando…' : 'Verificar e-mail'}
                </button>
              )}
            </div>
          </div>
          <div className="cp-field">
            <span className="cp-field-label">Telefone</span>
            <span className="cp-field-value">{formatPhone(profile.phone)}</span>
          </div>
        </div>
      </div>

      {/* Address */}
      {profile.address && (
        <div className="cp-section">
          <div className="cp-section-header">
            <FiMapPin /> Endereço
          </div>
          <div className="cp-fields">
            <div className="cp-field full">
              <span className="cp-field-label">Logradouro</span>
              <span className="cp-field-value">{profile.address.street}</span>
            </div>
            <div className="cp-field">
              <span className="cp-field-label">Número</span>
              <span className="cp-field-value">{profile.address.number}</span>
            </div>
            <div className="cp-field">
              <span className="cp-field-label">Complemento</span>
              <span className={`cp-field-value ${!profile.address.complement ? 'empty' : ''}`}>
                {profile.address.complement || 'Sem complemento'}
              </span>
            </div>
            <div className="cp-field">
              <span className="cp-field-label">Bairro</span>
              <span className="cp-field-value">{profile.address.neighborhood}</span>
            </div>
            <div className="cp-field">
              <span className="cp-field-label">Cidade / UF</span>
              <span className="cp-field-value">
                {profile.address.city} / {profile.address.state}
              </span>
            </div>
            <div className="cp-field">
              <span className="cp-field-label">CEP</span>
              <span className="cp-field-value">{formatCEP(profile.address.zipCode)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Documents */}
      <div className="cp-section">
        <div className="cp-section-header">
          <FiFileText />
          Documentos
          <span className="cp-doc-badge">
            {DOC_TYPES.filter((d) => profile.documents?.[d.field]).length}/{DOC_TYPES.length}
          </span>
        </div>
        <div className="cp-doc-grid">
          {DOC_TYPES.map((doc) => {
            const url = profile.documents?.[doc.field];
            return (
              <div key={doc.key} className={`cp-doc-card ${url ? 'sent' : 'missing'}`}>
                <div className="cp-doc-icon">
                  <FiFileText />
                </div>
                <div className="cp-doc-info">
                  <span className="cp-doc-label">{doc.label}</span>
                  {url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="cp-doc-link">
                      <FiExternalLink /> Ver
                    </a>
                  ) : (
                    <span className="cp-doc-missing">Não enviado</span>
                  )}
                </div>
                <button
                  className={`cp-doc-btn ${url ? 'remove' : 'upload'}`}
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
          style={{ display: 'none' }}
          onChange={handleDocFileChange}
        />
      </div>

      {/* ---- Verify-email modal ---- */}
      {verifyModalOpen && (
        <div className="ve-modal-overlay" onClick={closeVerifyModal}>
          <div className="ve-modal" onClick={(e) => e.stopPropagation()}>
            <button className="ve-modal-close" onClick={closeVerifyModal} disabled={verifyStatus === 'loading'}>
              <FiX />
            </button>

            {verifyStatus !== 'success' ? (
              <>
                <div className="ve-modal-icon">
                  <FiKey />
                </div>
                <h3 className="ve-modal-title">Verificar e-mail</h3>
                <p className="ve-modal-desc">
                  Enviamos um token para <strong>{profile.email}</strong>.<br />
                  Cole-o abaixo para confirmar seu endereço.
                </p>

                {verifyError && (
                  <div className="ve-modal-error">{verifyError}</div>
                )}

                <input
                  ref={tokenInputRef}
                  className="ve-modal-input"
                  type="text"
                  placeholder="Cole o token aqui…"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyToken()}
                  disabled={verifyStatus === 'loading'}
                />

                <button
                  className="ve-modal-btn"
                  onClick={handleVerifyToken}
                  disabled={!tokenInput.trim() || verifyStatus === 'loading'}
                >
                  {verifyStatus === 'loading' ? 'Verificando…' : 'Confirmar'}
                </button>
              </>
            ) : (
              <>
                <div className="ve-modal-icon success">
                  <FiCheckCircle />
                </div>
                <h3 className="ve-modal-title">E-mail verificado!</h3>
                <p className="ve-modal-desc">Seu endereço de e-mail foi confirmado com sucesso.</p>
                <button className="ve-modal-btn" onClick={closeVerifyModal}>Fechar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerProfile;
