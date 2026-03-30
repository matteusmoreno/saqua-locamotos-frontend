import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiArrowLeft, FiTruck, FiTag, FiHash, FiCalendar,
  FiDroplet, FiCreditCard, FiKey, FiActivity, FiSave,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import motorcycleService from '../../services/motorcycleService';
import '../Customers/CustomerForm.css';

function MotorcycleForm() {
  const { id } = useParams();
  const isEditing = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    renavam: '',
    brand: '',
    model: '',
    plate: '',
    year: '',
    color: '',
    chassis: '',
    mileage: '',
    available: true,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEditing) loadMotorcycle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadMotorcycle = async () => {
    try {
      const data = await motorcycleService.findById(id);
      setForm({
        renavam: data.renavam || '',
        brand: data.brand || '',
        model: data.model || '',
        plate: data.plate || '',
        year: data.year || '',
        color: data.color || '',
        chassis: data.chassis || '',
        mileage: data.mileage ?? '',
        available: data.available ?? true,
      });
    } catch {
      toast.error('Erro ao carregar moto');
      navigate('/motos');
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? e.target.checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        mileage: form.mileage !== '' ? parseInt(form.mileage, 10) : undefined,
      };
      if (isEditing) {
        await motorcycleService.update({ motorcycleId: id, ...payload });
        toast.success('Moto atualizada com sucesso!');
      } else {
        await motorcycleService.create(payload);
        toast.success('Moto cadastrada com sucesso!');
      }
      navigate('/motos');
    } catch (error) {
      const message = error.response?.data?.message || error.response?.data || 'Erro ao salvar moto';
      toast.error(typeof message === 'string' ? message : 'Erro ao salvar moto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cf-page">
      <button className="cf-back" onClick={() => navigate('/motos')}>
        <FiArrowLeft /> Voltar para motos
      </button>

      {/* Hero */}
      <div className="cf-hero">
        <div className="cf-hero-stripe" />
        <div className="cf-hero-avatar" style={{ background: 'var(--primary-bg)', color: 'var(--primary)' }}>
          <FiTruck />
        </div>
        <div className="cf-hero-info">
          <div className="cf-hero-title">{isEditing ? 'Editar Moto' : 'Nova Moto'}</div>
          <div className="cf-hero-sub">
            {isEditing
              ? `Atualize os dados da moto ${form.brand} ${form.model}`.trim() || 'Atualize os dados da moto'
              : 'Preencha os dados para cadastrar uma nova moto'}
          </div>
        </div>
        <div className="cf-hero-badge">
          <FiTruck /> {isEditing ? 'Editando' : 'Novo cadastro'}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Identificação */}
        <div className="cf-section">
          <div className="cf-section-header">
            <span className="cf-section-icon"><FiTruck /></span>
            <div>
              <h2>Identificação</h2>
              <p>Marca, modelo, placa e ano da moto</p>
            </div>
          </div>
          <div className="cf-section-body">
            <div className="cf-grid">
              <div className="cf-field">
                <label>Marca <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiTag className="cf-input-icon" />
                  <input name="brand" value={form.brand} onChange={handleChange} placeholder="Ex: Honda" required />
                </div>
              </div>
              <div className="cf-field">
                <label>Modelo <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiTruck className="cf-input-icon" />
                  <input name="model" value={form.model} onChange={handleChange} placeholder="Ex: CG 160" required />
                </div>
              </div>
              <div className="cf-field">
                <label>Placa <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiHash className="cf-input-icon" />
                  <input
                    name="plate"
                    value={form.plate}
                    onChange={handleChange}
                    placeholder="ABC-1234"
                    required
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>
              </div>
              <div className="cf-field">
                <label>Ano <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiCalendar className="cf-input-icon" />
                  <input name="year" value={form.year} onChange={handleChange} placeholder="2024" required />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes */}
        <div className="cf-section" style={{ marginTop: 16 }}>
          <div className="cf-section-header">
            <span className="cf-section-icon"><FiKey /></span>
            <div>
              <h2>Detalhes Técnicos</h2>
              <p>Cor, RENAVAM, chassi e quilometragem</p>
            </div>
          </div>
          <div className="cf-section-body">
            <div className="cf-grid">
              <div className="cf-field">
                <label>Cor <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiDroplet className="cf-input-icon" />
                  <input name="color" value={form.color} onChange={handleChange} placeholder="Preta" required />
                </div>
              </div>
              <div className="cf-field">
                <label>Quilometragem <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiActivity className="cf-input-icon" />
                  <input
                    name="mileage"
                    type="number"
                    min="0"
                    value={form.mileage}
                    onChange={handleChange}
                    placeholder="Ex: 15000"
                    required
                  />
                </div>
              </div>
              <div className="cf-field">
                <label>RENAVAM <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiCreditCard className="cf-input-icon" />
                  <input name="renavam" value={form.renavam} onChange={handleChange} placeholder="00000000000" required />
                </div>
              </div>
              <div className="cf-field">
                <label>Chassi <span className="cf-required">*</span></label>
                <div className="cf-input-wrap">
                  <FiKey className="cf-input-icon" />
                  <input name="chassis" value={form.chassis} onChange={handleChange} placeholder="Número do chassi" required />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cf-actions">
          <button type="button" className="cf-btn-cancel" onClick={() => navigate('/motos')}>
            Cancelar
          </button>
          <button type="submit" className="cf-btn-submit" disabled={loading}>
            <FiSave />
            {loading ? 'Salvando...' : isEditing ? 'Atualizar moto' : 'Cadastrar moto'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MotorcycleForm;
