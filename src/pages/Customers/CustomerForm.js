import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMapPin, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import MaskedInput from '../../components/MaskedInput/MaskedInput';
import userService from '../../services/userService';
import addressService from '../../services/addressService';
import './CustomerForm.css';

function CustomerForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    rg: '',
    occupation: '',
    maritalStatus: '',
    address: {
      cep: '',
      street: '',
      neighborhood: '',
      city: '',
      state: '',
      number: '',
      complement: '',
    },
  });
  const [loading, setLoading] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  useEffect(() => {
    if (isEditing) {
      loadCustomer();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadCustomer = async () => {
    try {
      const data = await userService.findById(id);
      setForm({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        cpf: data.cpf || '',
        rg: data.rg || '',
        occupation: data.occupation || '',
        maritalStatus: data.maritalStatus || '',
        address: {
          cep: data.address?.zipCode || '',
          street: data.address?.street || '',
          neighborhood: data.address?.neighborhood || '',
          city: data.address?.city || '',
          state: data.address?.state || '',
          number: data.address?.number || '',
          complement: data.address?.complement || '',
        },
      });
    } catch (error) {
      toast.error('Erro ao carregar locador');
      navigate('/locadores');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [field]: value },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCepBlur = async () => {
    const cleanCep = form.address.cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const data = await addressService.getAddress(cleanCep, form.address.number, form.address.complement);
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          street: data.street || '',
          neighborhood: data.neighborhood || '',
          city: data.city || '',
          state: data.state || '',
        },
      }));
    } catch {
      toast.warning('CEP não encontrado');
    } finally {
      setLoadingCep(false);
    }
  };

  const cleanMask = (value) => (value || '').replace(/\D/g, '');

  const buildPayload = () => ({
    name: form.name,
    email: form.email,
    phone: form.phone,
    cpf: form.cpf,
    rg: form.rg,
    occupation: form.occupation,
    maritalStatus: form.maritalStatus,
    address: {
      zipCode: cleanMask(form.address.cep),
      street: form.address.street,
      neighborhood: form.address.neighborhood,
      city: form.address.city,
      state: form.address.state,
      number: form.address.number,
      complement: form.address.complement,
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = buildPayload();
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

  return (
    <div className="form-page">
      <button className="back-link" onClick={() => navigate('/locadores')}>
        <FiArrowLeft />
        Voltar para locadores
      </button>

      <div className="page-header">
        <h1>{isEditing ? 'Editar Locador' : 'Novo Locador'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-card" style={{ marginBottom: 16 }}>
          <div className="form-card-header">
            <FiUser />
            <h2>Dados Pessoais</h2>
          </div>
          <div className="form-card-body">
            <div className="form-grid">
              <div className="form-group full-width">
                <label>Nome completo <span className="required">*</span></label>
                <input name="name" value={form.name} onChange={handleChange} placeholder="Nome do locador" required />
              </div>
              <div className="form-group">
                <label>E-mail <span className="required">*</span></label>
                <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="email@exemplo.com" required />
              </div>
              <div className="form-group">
                <label>Telefone <span className="required">*</span></label>
                <MaskedInput mask="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="(00)00000-0000" required />
              </div>
              <div className="form-group">
                <label>CPF <span className="required">*</span></label>
                <MaskedInput mask="cpf" name="cpf" value={form.cpf} onChange={handleChange} placeholder="000.000.000-00" disabled={isEditing} required />
              </div>
              <div className="form-group">
                <label>RG <span className="required">*</span></label>
                <input name="rg" value={form.rg} onChange={handleChange} placeholder="Número do RG" required />
              </div>
              <div className="form-group">
                <label>Profissão</label>
                <input name="occupation" value={form.occupation} onChange={handleChange} placeholder="Profissão" />
              </div>
              <div className="form-group">
                <label>Estado civil</label>
                <select name="maritalStatus" value={form.maritalStatus} onChange={handleChange}>
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

        <div className="form-card">
          <div className="form-card-header">
            <FiMapPin />
            <h2>Endereço</h2>
          </div>
          <div className="form-card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>CEP</label>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <MaskedInput mask="cep" name="address.cep" value={form.address.cep} onChange={handleChange} placeholder="00000-000" style={{ flex: 1 }} />
                  <button
                    type="button"
                    title="Buscar endereço pelo CEP"
                    disabled={loadingCep || form.address.cep.replace(/\D/g, '').length !== 8}
                    onClick={handleCepBlur}
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      color: loadingCep ? 'var(--text-muted)' : 'var(--primary)',
                      cursor: loadingCep ? 'wait' : 'pointer',
                      padding: '6px 8px',
                      display: 'flex',
                      alignItems: 'center',
                      fontSize: '1rem',
                      transition: 'border-color 0.2s, color 0.2s',
                    }}
                  >
                    <FiSearch />
                  </button>
                </div>
                {loadingCep && <small style={{ color: 'var(--primary)', fontSize: '0.72rem', marginTop: 4 }}>Buscando endereço...</small>}
              </div>
              <div className="form-group">
                <label>Rua</label>
                <input name="address.street" value={form.address.street} onChange={handleChange} placeholder="Rua / Avenida" />
              </div>
              <div className="form-group">
                <label>Número</label>
                <input name="address.number" value={form.address.number} onChange={handleChange} placeholder="Nº" />
              </div>
              <div className="form-group">
                <label>Complemento</label>
                <input name="address.complement" value={form.address.complement} onChange={handleChange} placeholder="Apt, Bloco, etc." />
              </div>
              <div className="form-group">
                <label>Bairro</label>
                <input name="address.neighborhood" value={form.address.neighborhood} onChange={handleChange} placeholder="Bairro" />
              </div>
              <div className="form-group">
                <label>Cidade</label>
                <input name="address.city" value={form.address.city} onChange={handleChange} placeholder="Cidade" />
              </div>
              <div className="form-group">
                <label>Estado</label>
                <input name="address.state" value={form.address.state} onChange={handleChange} placeholder="UF" />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/locadores')}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Salvando...' : isEditing ? 'Atualizar' : 'Cadastrar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CustomerForm;
