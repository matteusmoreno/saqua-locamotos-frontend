import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiClock, FiShield, FiCheck, FiDollarSign,
  FiPhone, FiArrowRight, FiCalendar, FiAlertCircle,
  FiCheckCircle, FiZap, FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Plans.css';

function PlanQuinzenal() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      await login(email, password);
      navigate('/painel', { replace: true });
    } catch {
      setLoginError('E-mail ou senha inválidos.');
    } finally {
      setLoginLoading(false);
    }
  };

  const openWhatsApp = () => {
    window.open('https://wa.me/5522998603048?text=Olá!%20Tenho%20interesse%20no%20Plano%20Quinzenal%20da%20Saqua%20Locamotos.', '_blank');
  };

  return (
    <div className="plan-page">
      {/* NAV */}
      <nav className="plan-nav">
        <button className="plan-nav-back" onClick={() => navigate('/')}>
          <FiArrowLeft /> Voltar
        </button>
        <div className="plan-nav-logo">
          <div className="plan-logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/>
              <path d="M15 6H9l-2 6h10l-2-6z"/><path d="M9 12H5l-2 5.5"/><path d="M15 12h4l2 5.5"/>
            </svg>
          </div>
          <div className="plan-logo-text">
            <span className="plan-logo-main">SAQUA<span className="plan-logo-accent">LOCA</span></span>
            <span className="plan-logo-sub">MOTOS</span>
          </div>
        </div>
        <button className="plan-nav-cta" onClick={openWhatsApp}>
          <FiPhone /> Falar no WhatsApp
        </button>
      </nav>

      {/* HERO */}
      <section className="plan-hero">
        <div className="plan-hero-glow plan-hero-glow-quinzenal" />
        <div className="plan-hero-content">
          <div className="plan-hero-badge quinzenal">
            <FiZap /> Sem Compromisso Longo
          </div>
          <div className="plan-hero-icon quinzenal"><FiClock /></div>
          <h1>Plano <span className="plan-highlight-quinzenal">Quinzenal</span></h1>
          <p className="plan-hero-sub">
            Flexibilidade para quem precisa de uma moto por 15 dias. Pagamento único, sem compromisso de longo prazo e com toda a estrutura da Saqua Locamotos.
          </p>
          <div className="plan-hero-price-box quinzenal">
            <div className="plan-price-main">
              <span className="plan-currency">R$</span>
              <span className="plan-amount quinzenal">600</span>
              <span className="plan-period">à vista</span>
            </div>
            <div className="plan-price-detail">Caução reembolsável de R$ 400,00</div>
          </div>
          <div className="plan-hero-actions">
            <button className="plan-btn plan-btn-quinzenal" onClick={openWhatsApp}>
              <FiPhone /> Contratar pelo WhatsApp
            </button>
            <button className="plan-btn plan-btn-ghost" onClick={() => setShowLogin(true)}>
              Acessar Minha Conta
            </button>
          </div>
        </div>
      </section>

      {/* DETAILS */}
      <section className="plan-section">
        <div className="plan-grid-2">

          {/* Visão Geral */}
          <div className="plan-card">
            <div className="plan-card-head">
              <div className="plan-card-icon quinzenal"><FiClock /></div>
              <h2>Visão Geral do Plano</h2>
            </div>
            <div className="plan-info-list">
              <div className="plan-info-item">
                <span className="plan-info-label">Duração do contrato</span>
                <span className="plan-info-value">15 dias</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Pagamento</span>
                <span className="plan-info-value highlight">R$ 600 à vista</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Caução</span>
                <span className="plan-info-value">R$ 400,00 (reembolsável)</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Renovação</span>
                <span className="plan-info-value">Disponível a cada 15 dias</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Seguro</span>
                <span className="plan-info-value highlight">✓ Incluso</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Revisão antes da entrega</span>
                <span className="plan-info-value">✓ Garantida</span>
              </div>
            </div>
          </div>

          {/* O que está incluso */}
          <div className="plan-card">
            <div className="plan-card-head">
              <div className="plan-card-icon quinzenal"><FiCheckCircle /></div>
              <h2>O que está Incluso</h2>
            </div>
            <ul className="plan-features-list">
              <li><FiCheck /> Moto revisada e pronta para uso imediato</li>
              <li><FiCheck /> <strong>Seguro total incluso</strong> — todas as nossas motos têm seguro</li>
              <li><FiCheck /> Documentação em dia</li>
              <li><FiCheck /> Suporte técnico durante o contrato</li>
              <li><FiCheck /> Contrato transparente, sem taxas ocultas</li>
              <li><FiCheck /> Pagamento único sem parcelas</li>
              <li><FiCheck /> Caução 100% reembolsável ao encerrar</li>
              <li><FiCheck /> Atendimento direto via WhatsApp</li>
            </ul>
          </div>

          {/* Seguro */}
          <div className="plan-card plan-card-highlight quinzenal">
            <div className="plan-card-head">
              <div className="plan-card-icon quinzenal"><FiShield /></div>
              <h2>Seguro Incluso em Todas as Motos</h2>
            </div>
            <p className="plan-card-desc">
              Mesmo no plano de 15 dias, você conta com o seguro incluído. Trabalhe com tranquilidade sabendo que sua moto tem proteção durante todo o período.
            </p>
            <ul className="plan-features-list">
              <li><FiShield /> Cobertura para danos ao veículo</li>
              <li><FiShield /> Proteção durante os 15 dias de contrato</li>
              <li><FiShield /> Suporte em caso de sinistro</li>
              <li><FiShield /> Tranquilidade para focar no trabalho</li>
            </ul>
          </div>

          {/* Para quem é */}
          <div className="plan-card">
            <div className="plan-card-head">
              <div className="plan-card-icon quinzenal"><FiZap /></div>
              <h2>Para quem é esse plano?</h2>
            </div>
            <p className="plan-card-desc">O plano quinzenal foi criado para quem precisa de flexibilidade máxima:</p>
            <ul className="plan-features-list">
              <li><FiCheck /> Entregadores que querem testar antes de se comprometer</li>
              <li><FiCheck /> Quem precisa de moto por um período curto específico</li>
              <li><FiCheck /> Para cobrir um período de alta demanda de trabalho</li>
              <li><FiCheck /> Quem não quer contrato de longo prazo</li>
              <li><FiCheck /> Ideal para experimentar a Saqua Locamotos</li>
              <li><FiCheck /> Situações de emergência ou demanda temporária</li>
            </ul>
          </div>

        </div>
      </section>

      {/* PAGAMENTO */}
      <div className="plan-section-alt">
        <section className="plan-section">
          <div className="plan-section-header">
            <div className="plan-section-tag quinzenal">Financeiro</div>
            <h2>Como é o Pagamento?</h2>
            <p>Simples, transparente e sem surpresas</p>
          </div>
          <div className="plan-payment-grid">
            <div className="plan-payment-card">
              <div className="plan-payment-icon quinzenal"><FiDollarSign /></div>
              <h3>R$ 600 à vista</h3>
              <p>O pagamento é feito <strong>integralmente no início</strong> do contrato. Sem parcelamento, sem complicação.</p>
            </div>
            <div className="plan-payment-card">
              <div className="plan-payment-icon quinzenal"><FiShield /></div>
              <h3>R$ 400 de caução</h3>
              <p>A caução é uma garantia <strong>totalmente reembolsável</strong> ao encerrar o contrato sem pendências.</p>
            </div>
            <div className="plan-payment-card">
              <div className="plan-payment-icon quinzenal"><FiCalendar /></div>
              <h3>15 dias completos</h3>
              <p>Você utiliza a moto por <strong>15 dias corridos</strong>, com todo o suporte e seguro inclusos.</p>
            </div>
          </div>
        </section>
      </div>

      {/* COMPARATIVO */}
      <section className="plan-section">
        <div className="plan-section-header">
          <div className="plan-section-tag">Comparativo</div>
          <h2>Quinzenal vs. Mensal</h2>
          <p>Qual o melhor plano para você?</p>
        </div>
        <div className="plan-compare">
          <div className="plan-compare-card active">
            <div className="plan-compare-icon quinzenal"><FiClock /></div>
            <h3>Quinzenal</h3>
            <p className="plan-compare-price"><strong>R$ 600</strong> à vista</p>
            <ul>
              <li><FiCheck /> 15 dias de uso</li>
              <li><FiCheck /> Pagamento único</li>
              <li><FiCheck /> Sem compromisso extra</li>
              <li><FiCheck /> Seguro incluso</li>
              <li><FiX className="plan-compare-x" /> Renovação opcional</li>
            </ul>
          </div>
          <div className="plan-compare-card">
            <div className="plan-compare-icon mensal"><FiCalendar /></div>
            <h3>Mensal</h3>
            <p className="plan-compare-price"><strong>R$ 300</strong>/semana</p>
            <ul>
              <li><FiCheck /> 30 dias de uso</li>
              <li><FiCheck /> Pagamento semanal</li>
              <li><FiCheck /> Melhor custo-benefício</li>
              <li><FiCheck /> Seguro incluso</li>
              <li><FiCheck /> Renovação facilitada</li>
            </ul>
            <button className="plan-btn plan-btn-compare" onClick={() => navigate('/planos/mensal')}>
              Ver Plano Mensal <FiArrowRight />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <div className="plan-section-alt">
        <section className="plan-section">
          <div className="plan-section-header">
            <div className="plan-section-tag quinzenal">Dúvidas</div>
            <h2>Perguntas Frequentes</h2>
          </div>
          <div className="plan-faq-list">
            <div className="plan-faq-item">
              <div className="plan-faq-q"><FiAlertCircle /> Posso renovar o plano quinzenal?</div>
              <div className="plan-faq-a">Sim! Ao final dos 15 dias, você pode renovar por mais 15 dias ou migrar para o plano mensal com condições especiais.</div>
            </div>
            <div className="plan-faq-item">
              <div className="plan-faq-q"><FiAlertCircle /> Posso devolver antes de 15 dias?</div>
              <div className="plan-faq-a">Sim. Entre em contato conosco para acertar os detalhes da devolução antecipada.</div>
            </div>
            <div className="plan-faq-item">
              <div className="plan-faq-q"><FiAlertCircle /> A caução é reembolsada?</div>
              <div className="plan-faq-a">A caução é devolvida integralmente ao final do contrato, desde que a moto seja devolvida nas mesmas condições, sem danos ou pendências.</div>
            </div>
            <div className="plan-faq-item">
              <div className="plan-faq-q"><FiAlertCircle /> As motos têm seguro?</div>
              <div className="plan-faq-a">Sim! Todas as nossas motos possuem seguro, independentemente do plano escolhido. Você trabalha com total tranquilidade.</div>
            </div>
            <div className="plan-faq-item">
              <div className="plan-faq-q"><FiAlertCircle /> Que documentos preciso?</div>
              <div className="plan-faq-a">CNH (Carteira Nacional de Habilitação) válida, RG, CPF e comprovante de residência atualizado.</div>
            </div>
          </div>
        </section>
      </div>

      {/* CTA */}
      <section className="plan-cta">
        <div className="plan-cta-glow plan-cta-glow-quinzenal" />
        <div className="plan-cta-inner">
          <div className="plan-cta-badge quinzenal"><FiShield /> Seguro Incluso</div>
          <h2>Pronto pra começar?</h2>
          <p>Entre em contato agora pelo WhatsApp e saia hoje mesmo com sua moto.</p>
          <div className="plan-cta-actions">
            <button className="plan-btn plan-btn-whatsapp" onClick={openWhatsApp}>
              <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Contratar pelo WhatsApp
            </button>
            <button className="plan-btn plan-btn-ghost" onClick={() => navigate('/')}>
              <FiArrowLeft /> Ver Todos os Planos
            </button>
          </div>
          <div className="plan-cta-contact">
            <span>ou ligue: <strong>(22) 99860-3048</strong></span>
            <span>•</span>
            <span>Rua Alfreno Menezes 223, Bacaxá – Saquarema/RJ</span>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="plan-footer">
        <div className="plan-footer-inner">
          <div className="plan-logo-sm">
            <div className="plan-logo-icon-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="5.5" cy="17.5" r="2.5"/><circle cx="18.5" cy="17.5" r="2.5"/>
                <path d="M15 6H9l-2 6h10l-2-6z"/><path d="M9 12H5l-2 5.5"/><path d="M15 12h4l2 5.5"/>
              </svg>
            </div>
            <div>
              <span className="plan-logo-main">SAQUA<span className="plan-logo-accent">LOCA</span></span>
              <span className="plan-logo-sub">MOTOS</span>
            </div>
          </div>
          <p className="plan-footer-copy">&copy; {new Date().getFullYear()} SaquaLocaMotos. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* LOGIN MODAL */}
      {showLogin && (
        <div className="plan-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="plan-modal">
            <button className="plan-modal-close" onClick={() => setShowLogin(false)}><FiX /></button>
            <div className="plan-modal-header">
              <h2>Entrar</h2>
              <p>Acesse sua conta para continuar</p>
            </div>
            <form className="plan-modal-form" onSubmit={handleLogin}>
              {loginError && <div className="plan-modal-error">{loginError}</div>}
              <div className="plan-modal-field">
                <label>E-mail</label>
                <input type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" autoFocus />
              </div>
              <div className="plan-modal-field">
                <label>Senha</label>
                <input type="password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <button type="submit" className="plan-modal-submit" disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PlanQuinzenal;
