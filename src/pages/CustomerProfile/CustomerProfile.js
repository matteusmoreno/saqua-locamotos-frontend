import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import { formatCPF, formatPhone, formatCEP, formatDate, MARITAL_STATUS_LABELS } from '../../utils/formatters';
import { FiUser, FiMapPin, FiMail, FiShield } from 'react-icons/fi';
import './CustomerProfile.css';

function CustomerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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
          <span className="cp-role-badge">
            <FiShield /> Locador
          </span>
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
            <span className="cp-field-value">{profile.email}</span>
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
    </div>
  );
}

export default CustomerProfile;
