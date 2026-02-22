import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiCheck, FiCalendar, FiClock, FiShield, FiTool, FiZap,
  FiPhoneCall, FiCheckCircle, FiArrowRight, FiX, FiLogIn,
  FiStar, FiDollarSign,
} from 'react-icons/fi';
import './Landing.css';

function Landing() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const plansRef = useRef(null);
  const howRef = useRef(null);
  const benefitsRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) navigate('/painel', { replace: true });
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (ref) => {
    setMobileMenu(false);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const openLogin = () => {
    setMobileMenu(false);
    setShowLogin(true);
    setLoginError('');
  };

  return (
    <div className="landing">
      {/* ======== NAVBAR ======== */}
      <nav className={`land-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="land-nav-brand">
          <div className="land-logo">
            <div className="land-logo-icon">
              <span>S</span>
              <div className="land-logo-stripe" />
            </div>
            <div className="land-logo-text">
              <span className="land-logo-main">SAQUA<span className="land-logo-accent">LOCA</span></span>
              <span className="land-logo-sub">MOTOS</span>
            </div>
          </div>
        </div>

        <div className="land-nav-links">
          <button className="land-nav-link" onClick={() => scrollTo(plansRef)}>Planos</button>
          <button className="land-nav-link" onClick={() => scrollTo(howRef)}>Como Funciona</button>
          <button className="land-nav-link" onClick={() => scrollTo(benefitsRef)}>Vantagens</button>
          <button className="land-nav-login" onClick={openLogin}>
            <FiLogIn /> Entrar
          </button>
        </div>

        <button className="land-nav-toggle" onClick={() => setMobileMenu(true)}>
          <span /><span /><span />
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileMenu && (
        <div className="land-mobile-menu">
          <button className="land-mobile-menu-close" onClick={() => setMobileMenu(false)}>
            <FiX />
          </button>
          <div className="land-mobile-brand">
            <div className="land-logo">
              <div className="land-logo-icon"><span>S</span><div className="land-logo-stripe" /></div>
              <div className="land-logo-text">
                <span className="land-logo-main">SAQUA<span className="land-logo-accent">LOCA</span></span>
                <span className="land-logo-sub">MOTOS</span>
              </div>
            </div>
          </div>
          <button className="land-mobile-link" onClick={() => scrollTo(plansRef)}>Planos</button>
          <button className="land-mobile-link" onClick={() => scrollTo(howRef)}>Como Funciona</button>
          <button className="land-mobile-link" onClick={() => scrollTo(benefitsRef)}>Vantagens</button>
          <button className="land-nav-login" onClick={openLogin}>
            <FiLogIn /> Entrar
          </button>
        </div>
      )}

      {/* ======== HERO ======== */}
      <section className="land-hero">
        <div className="land-hero-bg" />
        <div className="land-hero-glow" />
        <div className="land-hero-content">
          <div className="land-hero-pill">
            <FiStar className="land-hero-pill-icon" />
            Aluguel de motos em Saquarema
          </div>
          <h1>
            Sua moto pronta<br />
            pra <span className="highlight">rodar agora</span>
          </h1>
          <p className="land-hero-sub">
            Planos flexíveis, sem burocracia. Alugue por 15 dias ou mensal
            e comece a trabalhar hoje mesmo.
          </p>
          <div className="land-hero-actions">
            <button className="land-btn land-btn-primary" onClick={() => scrollTo(plansRef)}>
              Ver Planos <FiArrowRight />
            </button>
            <button className="land-btn land-btn-ghost" onClick={openLogin}>
              Acessar Minha Conta
            </button>
          </div>

          {/* Floating price chips */}
          <div className="land-hero-prices">
            <div className="land-price-chip">
              <FiDollarSign />
              <div>
                <span className="land-price-chip-label">A partir de</span>
                <span className="land-price-chip-value">R$ 300/sem</span>
              </div>
            </div>
            <div className="land-price-chip gold">
              <FiShield />
              <div>
                <span className="land-price-chip-label">Caução</span>
                <span className="land-price-chip-value">R$ 400</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ======== PLANS ======== */}
      <div className="land-section-alt" ref={plansRef}>
        <section className="land-section">
          <div className="land-section-header">
            <div className="land-section-tag">Planos</div>
            <h2>Escolha Seu Plano</h2>
            <p>Duas modalidades sob medida para você</p>
          </div>

          <div className="land-plans-grid">
            {/* Monthly */}
            <div className="land-plan featured">
              <span className="land-plan-badge">Mais Popular</span>
              <div className="land-plan-icon"><FiCalendar /></div>
              <h3>Mensal</h3>
              <p className="land-plan-duration">30 dias de contrato</p>
              <div className="land-plan-price">
                <span className="land-plan-currency">R$</span>
                <span className="land-plan-amount">300</span>
                <span className="land-plan-period">/semana</span>
              </div>
              <div className="land-plan-deposit">
                <FiShield /> Caução: <strong>R$ 400,00</strong>
              </div>
              <ul className="land-plan-features">
                <li><FiCheck /> Contrato de 30 dias com renovação</li>
                <li><FiCheck /> Pagamento semanal facilitado</li>
                <li><FiCheck /> Moto pronta para uso imediato</li>
                <li><FiCheck /> Caução reembolsável ao final</li>
                <li><FiCheck /> Ideal para entregadores</li>
              </ul>
              <button className="land-btn land-btn-primary land-plan-cta" onClick={openLogin}>
                Começar Agora <FiArrowRight />
              </button>
            </div>

            {/* 15-day */}
            <div className="land-plan">
              <div className="land-plan-icon"><FiClock /></div>
              <h3>Quinzenal</h3>
              <p className="land-plan-duration">15 dias de contrato</p>
              <div className="land-plan-price">
                <span className="land-plan-currency">R$</span>
                <span className="land-plan-amount">600</span>
                <span className="land-plan-period">à vista</span>
              </div>
              <div className="land-plan-deposit">
                <FiShield /> Caução: <strong>R$ 400,00</strong>
              </div>
              <ul className="land-plan-features">
                <li><FiCheck /> Contrato de 15 dias flexível</li>
                <li><FiCheck /> Pagamento único à vista</li>
                <li><FiCheck /> Sem compromisso de longo prazo</li>
                <li><FiCheck /> Caução reembolsável ao final</li>
                <li><FiCheck /> Perfeito para demandas rápidas</li>
              </ul>
              <button className="land-btn land-btn-ghost land-plan-cta" onClick={openLogin}>
                Escolher Plano <FiArrowRight />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ======== HOW IT WORKS ======== */}
      <section className="land-section" ref={howRef}>
        <div className="land-section-header">
          <div className="land-section-tag">Passo a Passo</div>
          <h2>Como Funciona</h2>
          <p>Em 4 etapas simples, sua moto estará pronta</p>
        </div>

        <div className="land-steps">
          <div className="land-step">
            <div className="land-step-num">1</div>
            <h4>Cadastro</h4>
            <p>Traga seus documentos e faça seu cadastro rapidamente</p>
          </div>
          <div className="land-step-connector" />
          <div className="land-step">
            <div className="land-step-num">2</div>
            <h4>Escolha o Plano</h4>
            <p>Mensal ou quinzenal — você decide</p>
          </div>
          <div className="land-step-connector" />
          <div className="land-step">
            <div className="land-step-num">3</div>
            <h4>Assine o Contrato</h4>
            <p>Contrato transparente, sem letras miúdas</p>
          </div>
          <div className="land-step-connector" />
          <div className="land-step">
            <div className="land-step-num">4</div>
            <h4>Retire Sua Moto</h4>
            <p>Retire e comece a rodar na hora!</p>
          </div>
        </div>
      </section>

      {/* ======== BENEFITS ======== */}
      <div className="land-section-alt" ref={benefitsRef}>
        <section className="land-section">
          <div className="land-section-header">
            <div className="land-section-tag">Vantagens</div>
            <h2>Por que a SaquaLocaMotos?</h2>
            <p>Confiança, transparência e praticidade</p>
          </div>

          <div className="land-benefits-grid">
            <div className="land-benefit">
              <div className="land-benefit-icon"><FiShield /></div>
              <h4>Motos Revisadas</h4>
              <p>Revisão completa antes de cada aluguel</p>
            </div>
            <div className="land-benefit">
              <div className="land-benefit-icon"><FiTool /></div>
              <h4>Suporte Técnico</h4>
              <p>Assistência durante todo o contrato</p>
            </div>
            <div className="land-benefit">
              <div className="land-benefit-icon"><FiZap /></div>
              <h4>Sem Burocracia</h4>
              <p>Processo rápido e direto, sem enrolação</p>
            </div>
            <div className="land-benefit">
              <div className="land-benefit-icon"><FiCalendar /></div>
              <h4>Planos Flexíveis</h4>
              <p>Mensal ou quinzenal, você escolhe</p>
            </div>
            <div className="land-benefit">
              <div className="land-benefit-icon"><FiPhoneCall /></div>
              <h4>Atendimento Direto</h4>
              <p>Fale direto com a equipe quando precisar</p>
            </div>
            <div className="land-benefit">
              <div className="land-benefit-icon"><FiCheckCircle /></div>
              <h4>Transparência Total</h4>
              <p>Sem taxas escondidas, sem surpresas</p>
            </div>
          </div>
        </section>
      </div>

      {/* ======== CTA ======== */}
      <section className="land-cta">
        <div className="land-cta-glow" />
        <div className="land-cta-inner">
          <h2>Pronto pra começar?</h2>
          <p>Acesse sua conta ou entre em contato para acompanhar seus contratos.</p>
          <div className="land-cta-actions">
            <button className="land-btn land-btn-primary" onClick={openLogin}>
              <FiLogIn /> Acessar Minha Conta
            </button>
            <button className="land-btn land-btn-ghost" onClick={() => scrollTo(plansRef)}>
              Ver Planos
            </button>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div className="land-logo land-logo-sm">
            <div className="land-logo-icon"><span>S</span><div className="land-logo-stripe" /></div>
            <div className="land-logo-text">
              <span className="land-logo-main">SAQUA<span className="land-logo-accent">LOCA</span></span>
              <span className="land-logo-sub">MOTOS</span>
            </div>
          </div>
          <p className="land-footer-copy">&copy; {new Date().getFullYear()} SaquaLocaMotos. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* ======== LOGIN MODAL ======== */}
      {showLogin && (
        <div className="land-modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowLogin(false)}>
          <div className="land-modal">
            <button className="land-modal-close" onClick={() => setShowLogin(false)}>
              <FiX />
            </button>
            <div className="land-modal-header">
              <div className="land-logo land-logo-md">
                <div className="land-logo-icon"><span>S</span><div className="land-logo-stripe" /></div>
                <div className="land-logo-text">
                  <span className="land-logo-main">SAQUA<span className="land-logo-accent">LOCA</span></span>
                  <span className="land-logo-sub">MOTOS</span>
                </div>
              </div>
              <h2>Entrar</h2>
              <p>Acesse sua conta para continuar</p>
            </div>
            <form className="land-modal-form" onSubmit={handleLogin}>
              {loginError && <div className="land-modal-error">{loginError}</div>}
              <div className="land-modal-field">
                <label>E-mail</label>
                <input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" autoFocus />
              </div>
              <div className="land-modal-field">
                <label>Senha</label>
                <input type="password" placeholder="Digite sua senha" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
              </div>
              <button type="submit" className="land-modal-submit" disabled={loginLoading}>
                {loginLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
