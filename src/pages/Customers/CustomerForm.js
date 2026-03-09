import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiUser, FiMapPin, FiSearch, FiMail, FiPhone,
  FiHash, FiBriefcase, FiHeart, FiSave, FiUserPlus, FiCheck,
  FiLoader,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import MaskedInput from '../../components/MaskedInput/MaskedInput';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import './CustomerForm.css';

/* Avatar preview colors (same palette as CustomerList/Detail) */
const AVATAR_COLORS = [
  ['#7C3AED', '#EDE9FE'], ['#0EA5E9', '#E0F2FE'], ['#10B981', '#D1FAE5'],
  ['#F59E0B', '#FEF3C7'], ['#EF4444', '#FEE2E2'], ['#EC4899', '#FCE7F3'],
  ['#6366F1', '#EEF2FF'], ['#14B8A6', '#CCFBF1'],
];
const getAvatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length] || AVATAR_COLORS[0];

function CustomerForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', phone: '', cpf: '', rg: '',
    occupation: '', maritalStatus: '',
    address: { cep: '', street: '', neighborhood: '', city: '', state: '', number: '', complement: '' },
  });
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);
  const [pictureUrl, setPictureUrl] = useState('');

  useEffect(() => {
    if (isEditing) loadCustomer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCustomer = async () => {
    try {
      const data = await userService.findById(id);
      setPictureUrl(data.pictureUrl || '');
      setForm({
        name: data.name || '', email: data.email || '', phone: data.phone || '',
        cpf: data.cpf || '', rg: data.rg || '', occupation: data.occupation || '',
        maritalStatus: data.maritalStatus || '',
        address: {
          cep: data.address?.zipCode || '', street: data.address?.street || '',
          neighborhood: data.address?.neighborhood || '', city: data.address?.city || '',
          state: data.address?.state || '', number: data.address?.number || '',
          complement: data.address?.complement || '',
        },
      });
    } catch {
      toast.error('Erro ao carregar locador');
      navigate('/locadores');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepSearch = async () => {
    const cleanCep = form.address.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    setLoadingCep(true);
    try {
      const data = await addressService.getAddress(cleanCep, form.address.number, form.address.complement);
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          street: data.street || '', neighborhood: data.neighborhood || '',
          city: data.city || '', state: data.state || '',
        },
      }));
      toast.success('Endereço preenchido!');
    } catch {
      toast.warning('CEP não encontrado');
    } finally {
      setLoadingCep(false);
    }
  };

  const cleanMask = (v) => (v || '').replace(/\D/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: form.name, email: form.email, phone: form.phone,
        cpf: form.cpf, rg: form.rg, occupation: form.occupation,
        maritalStatus: form.maritalStatus,
        address: {
          zipCode: cleanMask(form.address.cep), street: form.address.street,
          neighborhood: form.address.neighborhood, city: form.address.city,
          state: form.address.state, number: form.address.number,
          complement: form.address.complement,
        },
      };
      if (isEditing) {
        await userService.updateCustomer({ userId: id, ...payload });
        toast.success('Locador atualizado com sucesso!');
      } else {
        await userService.createCustomer(payload);
        toast.success('Locador cadastrado com sucesso!');
      }
      navigate('/locadores');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Erro ao salvar locador';
      toast.error(typeof message === 'string' ? message : 'Erro ao salvar locador');
    } finally {
      setLoading(false);
    }
  };

  /* Avatar preview */
  const [color, bg] = getAvatarColor(form.name);
  const initial = form.name?.charAt(0).toUpperCase() || '?';
  const cepReady = form.address.cep.replace(/\D/g, '').length === 8;

  return (
    <div className="cf-page">

      {/* Back */}
      <button className="cf-back" onClick={() => navigate('/locadores')}>
        <FiArrowLeft /> Voltar para locadores
      </button>

      {/* Hero header */}
      <div className="cf-hero">
        <div className="cf-hero-stripe" />
        {pictureUrl ? (
          <img src={pictureUrl} alt={form.name} className="cf-hero-avatar cf-hero-avatar-img" />
        ) : (
          <div className="cf-hero-avatar" style={{ background: bg, color }}>
            {form.name ? initial : <FiUser />}
          </div>
        )}
        <div className="cf-hero-info">
          <h1 className="cf-hero-title">
            {isEditing ? 'Editar Locador' : 'Novo Locador'}
          </h1>
          <p className="cf-hero-sub">
            {form.name
              ? form.name
              : isEditing
                ? 'Atualize os dados do locador abaixo'
                : 'Preencha os dados para cadastrar um novo locador'}
          </p>
        </div>
        <div className="cf-hero-badge">
          {isEditing ? <><FiCheck /> Editando</> : <><FiUserPlus /> Novo cadastro</>}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>

        {/* ── Dados Pessoais ── */}
        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon"><FiUser /></div>
            <div>
              <h2>Dados Pessoais</h2>
              <p>Informações de identificação do locador</p>
            </div>
          </div>
          <div className="cf-section-body">
            <div className="cf-grid">

              {/* Nome — full width */}
              <div className="cf-field cf-full">
                <label>Nome completo <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiUser className="cf-input-icon" />
                  <input
                    name="name" value={form.name} onChange={handleChange}
                    placeholder="Nome completo do locador" required autoFocus
                  />
                </div>
              </div>

              {/* E-mail */}
              <div className="cf-field">
                <label>E-mail <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiMail className="cf-input-icon" />
                  <input
                    name="email" type="email" value={form.email} onChange={handleChange}
                    placeholder="email@exemplo.com" required
                  />
                </div>
              </div>

              {/* Telefone */}
              <div className="cf-field">
                <label>Telefone <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiPhone className="cf-input-icon" />
                  <MaskedInput
                    mask="phone" name="phone" value={form.phone} onChange={handleChange}
                    placeholder="(00) 00000-0000" required
                  />
                </div>
              </div>

              {/* CPF */}
              <div className="cf-field">
                <label>CPF <span className="cf-required">*</span></label>
                <div className={`cf-input-wrap ${isEditing ? 'cf-disabled' : ''}`}>
                  <FiHash className="cf-input-icon" />
                  <MaskedInput
                    mask="cpf" name="cpf" value={form.cpf} onChange={handleChange}
                    placeholder="000.000.000-00" disabled={isEditing} required
                  />
                </div>
                {isEditing && <span className="cf-hint">CPF não pode ser alterado</span>}
              </div>

              {/* RG */}
              <div className="cf-field">
                <label>RG <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiHash className="cf-input-icon" />
                  <input
                    name="rg" value={form.rg} onChange={handleChange}
                    placeholder="Número do RG" required
                  />
                </div>
              </div>

              {/* Profissão */}
              <div className="cf-field">
                <label>Profissão</label>
                <div className="cf-input-wrap">
                  <FiBriefcase className="cf-input-icon" />
                  <input
                    name="occupation" value={form.occupation} onChange={handleChange}
                    placeholder="Ex: Entregador, Mototaxista"
                  />
                </div>
              </div>

              {/* Estado Civil */}
              <div className="cf-field">
                <label>Estado Civil</label>
                <div className="cf-input-wrap">
                  <FiHeart className="cf-input-icon" />
                  <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange} className="cf-select">
                    <option value="">Selecione...</option>
                    <option value="SINGLE">Solteiro(a)</option>
                    <option value="MARRIED">Casado(a)</option>
                    <option value="DIVORCED">Divorciado(a)</option>
                    <option value="WIDOWED">Viúvo(a)</option>
                    <option value="UNKNOWN">Não informado</option>
                  </select>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Endereço ── */}
        <div className="cf-section">
          <div className="cf-section-header">
            <div className="cf-section-icon"><FiMapPin /></div>
            <div>
              <h2>Endereço</h2>
              <p>Localização do locador — preencha o CEP para autocompletar</p>
            </div>
          </div>
          <div className="cf-section-body">
            <div className="cf-grid">

              {/* CEP */}
              <div className="cf-field">
                <label>CEP</label>
                <div className="cf-cep-row">
                  <div className="cf-input-wrap cf-input-wrap-grow">
                    <FiMapPin className="cf-input-icon" />
                    <MaskedInput
                      mask="cep" name="address.cep" value={form.address.cep}
                      onChange={handleChange} placeholder="00000-000"
                      onBlur={cepReady ? handleCepSearch : undefined}
                    />
                  </div>
                  <button
                    type="button"
                    className={`cf-cep-btn ${loadingCep ? 'loading' : ''} ${cepReady ? 'active' : ''}`}
                    onClick={handleCepSearch}
                    disabled={loadingCep || !cepReady}
                    title="Buscar endereço pelo CEP"
                  >
                    {loadingCep ? <FiLoader className="cf-spin" /> : <FiSearch />}
                    {loadingCep ? 'Buscando…' : 'Buscar'}
                  </button>
                </div>
              </div>

              {/* Rua — full width */}
              <div className="cf-field cf-full">
                <label>Rua</label>
                <div className="cf-input-wrap">
                  <FiMapPin className="cf-input-icon" />
                  <input name="address.street" value={form.address.street} onChange={handleChange} placeholder="Rua / Avenida" />
                </div>
              </div>

              {/* Número */}
              <div className="cf-field cf-short">
                <label>Número</label>
                <div className="cf-input-wrap">
                  <FiHash className="cf-input-icon" />
                  <input name="address.number" value={form.address.number} onChange={handleChange} placeholder="Nº" />
                </div>
              </div>

              {/* Complemento */}
              <div className="cf-field">
                <label>Complemento</label>
                <div className="cf-input-wrap">
                  <FiHash className="cf-input-icon" />
                  <input name="address.complement" value={form.address.complement} onChange={handleChange} placeholder="Apt, Bloco, Casa, etc." />
                </div>
              </div>

              {/* Bairro */}
              <div className="cf-field">
                <label>Bairro</label>
                <div className="cf-input-wrap">
                  <FiMapPin className="cf-input-icon" />
                  <input name="address.neighborhood" value={form.address.neighborhood} onChange={handleChange} placeholder="Bairro" />
                </div>
              </div>

              {/* Cidade */}
              <div className="cf-field">
                <label>Cidade</label>
                <div className="cf-input-wrap">
                  <FiMapPin className="cf-input-icon" />
                  <input name="address.city" value={form.address.city} onChange={handleChange} placeholder="Cidade" />
                </div>
              </div>

              {/* Estado */}
              <div className="cf-field cf-short">
                <label>Estado (UF)</label>
                <div className="cf-input-wrap">
                  <FiMapPin className="cf-input-icon" />
                  <input name="address.state" value={form.address.state} onChange={handleChange} placeholder="UF" maxLength={2} />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="cf-actions">
          <button type="button" className="cf-btn-cancel" onClick={() => navigate('/locadores')}>
            Cancelar
          </button>
          <button type="submit" className="cf-btn-submit" disabled={loading}>
            {loading
              ? <><FiLoader className="cf-spin" /> Salvando...</>
              : isEditing
                ? <><FiSave /> Salvar alterações</>
                : <><FiUserPlus /> Cadastrar locador</>
            }
          </button>
        </div>

      </form>
    </div>
  );
}

export default CustomerForm;
