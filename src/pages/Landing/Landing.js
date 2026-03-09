import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiCheck, FiCalendar, FiClock, FiShield, FiTool, FiZap,
  FiPhoneCall, FiCheckCircle, FiArrowRight, FiX, FiLogIn,
  FiMail, FiMapPin,
} from 'react-icons/fi';
import './Landing.css';



/* ——— WhatsApp SVG ——— */
function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* ——— Instagram SVG ——— */
function InstagramIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function Logo({ size = 'md' }) {
  return (
    <div className={`land-logo land-logo-${size}`}>
      <div className="land-logo-wordmark">
        <span className="land-logo-brand">SAQUA</span>
        <div className="land-logo-divider" />
        <span className="land-logo-tagline">LOCAMOTOS</span>
      </div>
    </div>
  );
}

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
  const contactRef = useRef(null);

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

  const openWhatsApp = () => {
    window.open('https://wa.me/5522998603048?text=Olá!%20Tenho%20interesse%20em%20alugar%20uma%20moto%20na%20Saqua%20Locamotos.', '_blank');
  };

  return (
    <div className="landing">

      {/* ======== FLOATING WHATSAPP ======== */}
      <a
        className="land-whatsapp-float"
        href="https://wa.me/5522998603048?text=Olá!%20Tenho%20interesse%20em%20alugar%20uma%20moto%20na%20Saqua%20Locamotos."
        target="_blank"
        rel="noreferrer"
        title="Fale no WhatsApp"
      >
        <WhatsAppIcon size={28} />
      </a>

      {/* ======== NAVBAR ======== */}
      <nav className={`land-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="land-nav-brand">
          <Logo size="sm" />
        </div>

        <div className="land-nav-links">
          <button className="land-nav-link" onClick={() => scrollTo(plansRef)}>Planos</button>
          <button className="land-nav-link" onClick={() => scrollTo(howRef)}>Como Funciona</button>
          <button className="land-nav-link" onClick={() => scrollTo(benefitsRef)}>Vantagens</button>
          <button className="land-nav-link" onClick={() => scrollTo(contactRef)}>Contato</button>
          {isAuthenticated ? (
            <button className="land-nav-login" onClick={() => navigate('/painel')}>
              <FiLogIn /> Ir para o Painel
            </button>
          ) : (
            <button className="land-nav-login" onClick={openLogin}>
              <FiLogIn /> Entrar
            </button>
          )}
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
          <div className="land-mobile-brand"><Logo size="md" /></div>
          <button className="land-mobile-link" onClick={() => scrollTo(plansRef)}>Planos</button>
          <button className="land-mobile-link" onClick={() => scrollTo(howRef)}>Como Funciona</button>
          <button className="land-mobile-link" onClick={() => scrollTo(benefitsRef)}>Vantagens</button>
          <button className="land-mobile-link" onClick={() => scrollTo(contactRef)}>Contato</button>
          <div className="land-mobile-actions">
            {isAuthenticated ? (
              <button className="land-nav-login" onClick={() => { setMobileMenu(false); navigate('/painel'); }}>
                <FiLogIn /> Ir para o Painel
              </button>
            ) : (
              <button className="land-nav-login" onClick={openLogin}>
                <FiLogIn /> Entrar
              </button>
            )}
          </div>
        </div>
      )}

      {/* ======== HERO ======== */}
      <section className="land-hero">
        <div className="land-hero-bg" />
        <div className="land-hero-glow" />
        <div className="land-hero-content">
          <div className="land-hero-pill">
            <FiMapPin className="land-hero-pill-icon" />
            Saquarema, Rio de Janeiro
          </div>
          <h1>
            Alugue sua moto<br />
            em <span className="highlight">Saquarema</span>
          </h1>
          <p className="land-hero-sub">
            Planos flexíveis, sem burocracia e com <strong>seguro incluso em todas as motos</strong>.
            Alugue por 15 dias ou mensalmente e comece a trabalhar hoje mesmo.
          </p>

          <div className="land-insurance-badge">
            <div className="land-insurance-icon"><FiShield /></div>
            <div>
              <span className="land-insurance-title">Todas as motos com seguro incluso</span>
              <span className="land-insurance-sub">Trabalhe com a tranquilidade que você merece</span>
            </div>
          </div>

          <div className="land-hero-actions">
            <button className="land-btn land-btn-primary" onClick={() => scrollTo(plansRef)}>
              Ver Planos <FiArrowRight />
            </button>
            <button className="land-btn land-btn-whatsapp" onClick={openWhatsApp}>
              <WhatsAppIcon size={17} /> Falar no WhatsApp
            </button>
          </div>

          <div className="land-hero-stats">
            <div className="land-stat">
              <span className="land-stat-value">R$ 300</span>
              <span className="land-stat-label">Plano mensal/sem</span>
            </div>
            <div className="land-stat-divider" />
            <div className="land-stat">
              <span className="land-stat-value">R$ 600</span>
              <span className="land-stat-label">Plano quinzenal</span>
            </div>
            <div className="land-stat-divider" />
            <div className="land-stat">
              <span className="land-stat-value"><FiShield /></span>
              <span className="land-stat-label">Seguro incluso</span>
            </div>
          </div>
        </div>
      </section>

      {/* ======== PLANS ======== */}
      <div ref={plansRef}>
        <section className="land-section">
          <div className="land-section-header">
            <div className="land-section-tag">Planos</div>
            <h2>Escolha Seu Plano</h2>
            <p>Duas modalidades sob medida para você — ambas com seguro incluso</p>
          </div>

          <div className="land-plans-grid">
            <div className="land-plan featured">
              <span className="land-plan-badge">Mais Popular</span>
              <div className="land-plan-icon"><FiCalendar /></div>
              <h3>Mensal</h3>
              <p className="land-plan-duration">30 dias de contrato com renovação</p>
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
                <li className="land-plan-feature-highlight"><FiShield /> Seguro total incluso</li>
              </ul>
              <div className="land-plan-cta-group">
                <button className="land-btn land-btn-whatsapp land-plan-cta" onClick={openWhatsApp}>
                  <WhatsAppIcon size={16} /> Contratar
                </button>
                <button className="land-btn land-btn-outline land-plan-details" onClick={() => navigate('/planos/mensal')}>
                  Saiba mais <FiArrowRight />
                </button>
              </div>
            </div>

            <div className="land-plan">
              <div className="land-plan-icon"><FiClock /></div>
              <h3>Quinzenal</h3>
              <p className="land-plan-duration">15 dias de contrato flexível</p>
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
                <li className="land-plan-feature-highlight"><FiShield /> Seguro total incluso</li>
              </ul>
              <div className="land-plan-cta-group">
                <button className="land-btn land-btn-ghost land-plan-cta" onClick={openWhatsApp}>
                  <WhatsAppIcon size={16} /> Contratar
                </button>
                <button className="land-btn land-btn-outline land-plan-details" onClick={() => navigate('/planos/quinzenal')}>
                  Saiba mais <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ======== INSURANCE SECTION ======== */}
      <div className="land-section-alt">
        <section className="land-section land-section-insurance">
          <div className="land-insurance-main">
            <div className="land-insurance-left">
              <div className="land-section-tag">Seguro</div>
              <h2>Todas as Motos Têm <span className="land-text-primary">Seguro Incluso</span></h2>
              <p>
                Na Saqua Locamotos, sua segurança vem em primeiro lugar. Todas as nossas motos possuem seguro, garantindo que você possa trabalhar sem preocupações, com cobertura durante todo o período do contrato.
              </p>
              <div className="land-insurance-features">
                <div className="land-insurance-feat"><FiCheckCircle /> Cobertura para danos ao veículo</div>
                <div className="land-insurance-feat"><FiCheckCircle /> Proteção durante todo o contrato</div>
                <div className="land-insurance-feat"><FiCheckCircle /> Suporte em caso de sinistro</div>
                <div className="land-insurance-feat"><FiCheckCircle /> Sem custo adicional — já incluso no plano</div>
              </div>
            </div>
            <div className="land-insurance-right">
              <div className="land-insurance-card">
                <div className="land-insurance-card-icon"><FiShield /></div>
                <h3>Seguro Total</h3>
                <p>Todas as motos disponíveis para aluguel possuem seguro ativo. Você pega a moto, nós cuidamos da proteção.</p>
                <div className="land-insurance-card-tags">
                  <span>✓ Incluso nos dois planos</span>
                  <span>✓ Sem taxa extra</span>
                  <span>✓ Cobertura completa</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ======== HOW IT WORKS ======== */}
      <div className="land-section-alt" ref={howRef}>
        <section className="land-section">
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
              <p>Retire e comece a rodar na hora — com seguro incluso!</p>
            </div>
          </div>
        </section>
      </div>

      {/* ======== BENEFITS ======== */}
      <section className="land-section" ref={benefitsRef}>
        <div className="land-section-header">
          <div className="land-section-tag">Vantagens</div>
          <h2>Por que a Saqua Locamotos?</h2>
          <p>Confiança, transparência e praticidade em cada contrato</p>
        </div>

        <div className="land-benefits-grid">
          <div className="land-benefit">
            <div className="land-benefit-icon"><FiShield /></div>
            <h4>Seguro em Todas as Motos</h4>
            <p>Nossas motos possuem seguro incluso — você trabalha com segurança e tranquilidade</p>
          </div>
          <div className="land-benefit">
            <div className="land-benefit-icon"><FiTool /></div>
            <h4>Motos Revisadas</h4>
            <p>Revisão completa antes de cada aluguel, pronta para o dia a dia</p>
          </div>
          <div className="land-benefit">
            <div className="land-benefit-icon"><FiZap /></div>
            <h4>Sem Burocracia</h4>
            <p>Processo rápido e direto, sem enrolação e sem papelada desnecessária</p>
          </div>
          <div className="land-benefit">
            <div className="land-benefit-icon"><FiCalendar /></div>
            <h4>Planos Flexíveis</h4>
            <p>Mensal ou quinzenal, com pagamento que cabe no seu bolso</p>
          </div>
          <div className="land-benefit">
            <div className="land-benefit-icon"><FiPhoneCall /></div>
            <h4>Atendimento Direto</h4>
            <p>Fale direto com a nossa equipe pelo WhatsApp quando precisar</p>
          </div>
          <div className="land-benefit">
            <div className="land-benefit-icon"><FiCheckCircle /></div>
            <h4>Transparência Total</h4>
            <p>Sem taxas escondidas, sem surpresas — tudo claro no contrato</p>
          </div>
        </div>
      </section>

      {/* ======== CONTACT & MAP ======== */}
      <div className="land-section-alt" ref={contactRef}>
        <section className="land-section">
          <div className="land-section-header">
            <div className="land-section-tag">Localização</div>
            <h2>Como nos encontrar</h2>
            <p>Venha nos visitar ou entre em contato pelo canal de sua preferência</p>
          </div>

          <div className="land-contact-grid">
            <div className="land-contact-cards">

              <a className="land-contact-card" href="https://wa.me/5522998603048" target="_blank" rel="noreferrer">
                <div className="land-contact-card-icon whatsapp">
                  <WhatsAppIcon size={22} />
                </div>
                <div className="land-contact-card-info">
                  <span className="land-contact-card-label">WhatsApp</span>
                  <span className="land-contact-card-value">(22) 99860-3048</span>
                  <span className="land-contact-card-action">Clique para conversar →</span>
                </div>
              </a>

              <a className="land-contact-card" href="https://instagram.com/saqua_locamotos" target="_blank" rel="noreferrer">
                <div className="land-contact-card-icon instagram">
                  <InstagramIcon size={22} />
                </div>
                <div className="land-contact-card-info">
                  <span className="land-contact-card-label">Instagram</span>
                  <span className="land-contact-card-value">@saqua_locamotos</span>
                  <span className="land-contact-card-action">Siga a gente →</span>
                </div>
              </a>

              <a className="land-contact-card" href="mailto:saqualocamotos@gmail.com">
                <div className="land-contact-card-icon email">
                  <FiMail />
                </div>
                <div className="land-contact-card-info">
                  <span className="land-contact-card-label">E-mail</span>
                  <span className="land-contact-card-value">saqualocamotos@gmail.com</span>
                  <span className="land-contact-card-action">Enviar e-mail →</span>
                </div>
              </a>

              <div className="land-contact-card no-link">
                <div className="land-contact-card-icon address">
                  <FiMapPin />
                </div>
                <div className="land-contact-card-info">
                  <span className="land-contact-card-label">Endereço</span>
                  <span className="land-contact-card-value">Rua Alfreno Menezes, 223</span>
                  <span className="land-contact-card-sub">Bacaxá, Saquarema – RJ</span>
                </div>
              </div>

            </div>

            <div className="land-map-container">
              <div className="land-map-header">
                <FiMapPin /> Saqua Locamotos — Bacaxá, Saquarema/RJ
              </div>
              <iframe
                title="Localização Saqua Locamotos"
                src="https://maps.google.com/maps?q=Rua+Alfreno+Menezes+223+Bacax%C3%A1+Saquarema+RJ+Brazil&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              <a
                className="land-map-open"
                href="https://maps.google.com/?q=Rua+Alfreno+Menezes+223+Bacaxá+Saquarema+RJ"
                target="_blank"
                rel="noreferrer"
              >
                <FiMapPin /> Abrir no Google Maps
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* ======== CTA ======== */}
      <section className="land-cta">
        <div className="land-cta-glow" />
        <div className="land-cta-inner">
          <div className="land-cta-badge"><FiShield /> Seguro incluso em todas as motos</div>
          <h2>Pronto pra começar a trabalhar?</h2>
          <p>Fale agora pelo WhatsApp ou acesse sua conta para acompanhar seus contratos.</p>
          <div className="land-cta-actions">
            <button className="land-btn land-btn-whatsapp" onClick={openWhatsApp}>
              <WhatsAppIcon size={17} /> Falar no WhatsApp
            </button>
            <button className="land-btn land-btn-ghost" onClick={openLogin}>
              <FiLogIn /> Acessar Minha Conta
            </button>
          </div>
        </div>
      </section>

      {/* ======== FOOTER ======== */}
      <footer className="land-footer">
        <div className="land-footer-inner">
          <div className="land-footer-brand">
            <Logo size="sm" />
            <p className="land-footer-tagline">
              Aluguel de motos em Saquarema<br />com seguro incluso em todos os planos.
            </p>
            <div className="land-footer-social">
              <a href="https://wa.me/5522998603048" target="_blank" rel="noreferrer" className="land-footer-social-link whatsapp" title="WhatsApp">
                <WhatsAppIcon size={18} />
              </a>
              <a href="https://instagram.com/saqua_locamotos" target="_blank" rel="noreferrer" className="land-footer-social-link instagram" title="Instagram">
                <InstagramIcon size={18} />
              </a>
              <a href="mailto:saqualocamotos@gmail.com" className="land-footer-social-link email" title="E-mail">
                <FiMail />
              </a>
            </div>
          </div>

          <div className="land-footer-col">
            <h4 className="land-footer-col-title">Planos</h4>
            <ul className="land-footer-links">
              <li><button onClick={() => navigate('/planos/mensal')}>Plano Mensal</button></li>
              <li><button onClick={() => navigate('/planos/quinzenal')}>Plano Quinzenal</button></li>
              <li><button onClick={() => scrollTo(howRef)}>Como Funciona</button></li>
            </ul>
          </div>

          <div className="land-footer-col">
            <h4 className="land-footer-col-title">Contato</h4>
            <ul className="land-footer-contact">
              <li>
                <WhatsAppIcon size={14} />
                <a href="https://wa.me/5522998603048" target="_blank" rel="noreferrer">(22) 99860-3048</a>
              </li>
              <li>
                <FiMail />
                <a href="mailto:saqualocamotos@gmail.com">saqualocamotos@gmail.com</a>
              </li>
              <li>
                <InstagramIcon size={14} />
                <a href="https://instagram.com/saqua_locamotos" target="_blank" rel="noreferrer">@saqua_locamotos</a>
              </li>
              <li>
                <FiMapPin />
                <span>Rua Alfreno Menezes, 223<br />Bacaxá, Saquarema – RJ</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="land-footer-bottom">
          <p>&copy; {new Date().getFullYear()} Saqua Locamotos. Todos os direitos reservados.</p>
          <div className="land-footer-bottom-badge">
            <FiShield /> Todas as motos com seguro
          </div>
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
              <Logo size="md" />
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
              <button
                type="button"
                className="land-modal-forgot"
                onClick={() => { setShowLogin(false); navigate('/esqueci-senha'); }}
              >
                Esqueci minha senha
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Landing;
