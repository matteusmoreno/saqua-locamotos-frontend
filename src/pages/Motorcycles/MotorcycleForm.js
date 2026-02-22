import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiArrowLeft, FiTruck } from 'react-icons/fi';
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
      if (isEditing) {
        await motorcycleService.update({ motorcycleId: id, ...form });
        toast.success('Moto atualizada com sucesso!');
      } else {
        await motorcycleService.create(form);
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
    <div className="form-page">
      <button className="back-link" onClick={() => navigate('/motos')}>
        <FiArrowLeft />
        Voltar para motos
      </button>

      <div className="page-header">
        <h1>{isEditing ? 'Editar Moto' : 'Nova Moto'}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-card">
          <div className="form-card-header">
            <FiTruck />
            <h2>Dados da Moto</h2>
          </div>
          <div className="form-card-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Marca <span className="required">*</span></label>
                <input name="brand" value={form.brand} onChange={handleChange} placeholder="Ex: Honda" required />
              </div>
              <div className="form-group">
                <label>Modelo <span className="required">*</span></label>
                <input name="model" value={form.model} onChange={handleChange} placeholder="Ex: CG 160" required />
              </div>
              <div className="form-group">
                <label>Placa <span className="required">*</span></label>
                <input name="plate" value={form.plate} onChange={handleChange} placeholder="ABC-1234" required style={{ textTransform: 'uppercase' }} />
              </div>
              <div className="form-group">
                <label>Ano <span className="required">*</span></label>
                <input name="year" value={form.year} onChange={handleChange} placeholder="2024" required />
              </div>
              <div className="form-group">
                <label>Cor <span className="required">*</span></label>
                <input name="color" value={form.color} onChange={handleChange} placeholder="Preta" required />
              </div>
              <div className="form-group">
                <label>RENAVAM <span className="required">*</span></label>
                <input name="renavam" value={form.renavam} onChange={handleChange} placeholder="00000000000" required />
              </div>
              <div className="form-group full-width">
                <label>Chassi <span className="required">*</span></label>
                <input name="chassis" value={form.chassis} onChange={handleChange} placeholder="Número do chassi" required />
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/motos')}>
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

export default MotorcycleForm;
