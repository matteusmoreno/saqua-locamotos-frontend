import { useNavigate } from 'react-router-dom';
import {
  FiArrowLeft, FiCalendar, FiShield, FiCheck, FiDollarSign,
  FiPhone, FiClock, FiAlertCircle,
  FiCheckCircle, FiStar, FiZap, FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Plans.css';

function PlanMensal() {
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
    window.open('https://wa.me/5522998603048?text=Olá!%20Tenho%20interesse%20no%20Plano%20Mensal%20da%20Saqua%20Locamotos.', '_blank');
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
        <div className="plan-hero-glow plan-hero-glow-mensal" />
        <div className="plan-hero-content">
          <div className="plan-hero-badge">
            <FiStar /> Mais Popular
          </div>
          <div className="plan-hero-icon mensal"><FiCalendar /></div>
          <h1>Plano <span className="plan-highlight">Mensal</span></h1>
          <p className="plan-hero-sub">
            O plano ideal para entregadores que querem estabilidade, economia e liberdade para trabalhar todos os dias.
          </p>
          <div className="plan-hero-price-box">
            <div className="plan-price-main">
              <span className="plan-currency">R$</span>
              <span className="plan-amount">300</span>
              <span className="plan-period">/ semana</span>
            </div>
            <div className="plan-price-detail">Caução reembolsável de R$ 400,00</div>
          </div>
          <div className="plan-hero-actions">
            <button className="plan-btn plan-btn-primary" onClick={openWhatsApp}>
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
              <div className="plan-card-icon mensal"><FiCalendar /></div>
              <h2>Visão Geral do Plano</h2>
            </div>
            <div className="plan-info-list">
              <div className="plan-info-item">
                <span className="plan-info-label">Duração do contrato</span>
                <span className="plan-info-value">30 dias (renovável)</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Pagamento</span>
                <span className="plan-info-value highlight">R$ 300 por semana</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Caução</span>
                <span className="plan-info-value">R$ 400,00 (reembolsável)</span>
              </div>
              <div className="plan-info-item">
                <span className="plan-info-label">Renovação</span>
                <span className="plan-info-value">Automática a cada 30 dias</span>
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
              <div className="plan-card-icon mensal"><FiCheckCircle /></div>
              <h2>O que está Incluso</h2>
            </div>
            <ul className="plan-features-list">
              <li><FiCheck /> Moto revisada e pronta para uso imediato</li>
              <li><FiCheck /> <strong>Seguro total incluso</strong> — todas as nossas motos têm seguro</li>
              <li><FiCheck /> Documentação em dia</li>
              <li><FiCheck /> Suporte técnico durante todo o contrato</li>
              <li><FiCheck /> Contrato transparente, sem taxas ocultas</li>
              <li><FiCheck /> Renovação facilitada sem burocracia</li>
              <li><FiCheck /> Caução 100% reembolsável ao encerrar o contrato</li>
              <li><FiCheck /> Atendimento direto via WhatsApp</li>
            </ul>
          </div>

          {/* Seguro */}
          <div className="plan-card plan-card-highlight">
            <div className="plan-card-head">
              <div className="plan-card-icon mensal"><FiShield /></div>
              <h2>Seguro Incluso em Todas as Motos</h2>
            </div>
            <p className="plan-card-desc">
              Sua tranquilidade é prioridade. Todas as motos da Saqua Locamotos possuem seguro, para que você possa trabalhar com segurança e sem preocupações.
            </p>
            <ul className="plan-features-list">
              <li><FiShield /> Cobertura para danos ao veículo</li>
              <li><FiShield /> Proteção total durante o contrato</li>
              <li><FiShield /> Suporte em caso de sinistro</li>
              <li><FiShield /> Tranquilidade para focar no trabalho</li>
            </ul>
          </div>

          {/* Como Funciona */}
          <div className="plan-card">
            <div className="plan-card-head">
              <div className="plan-card-icon mensal"><FiZap /></div>
              <h2>Como Funciona</h2>
            </div>
            <div className="plan-steps-mini">
              <div className="plan-step-mini">
                <div className="plan-step-mini-num">1</div>
                <div>
                  <strong>Entre em Contato</strong>
                  <p>Fale conosco pelo WhatsApp ou venha pessoalmente</p>
                </div>
              </div>
              <div className="plan-step-mini">
                <div className="plan-step-mini-num">2</div>
                <div>
                  <strong>Apresente os Documentos</strong>
                  <p>CNH válida, RG, CPF e comprovante de residência</p>
                </div>
              </div>
              <div className="plan-step-mini">
                <div className="plan-step-mini-num">3</div>
                <div>
                  <strong>Assine o Contrato</strong>
                  <p>Contrato claro e transparente, sem surpresas</p>
                </div>
              </div>
              <div className="plan-step-mini">
                <div className="plan-step-mini-num">4</div>
                <div>
                  <strong>Retire e Comece a Trabalhar</strong>
                  <p>Moto revisada, com seguro, pronta na hora</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* PAGAMENTO */}
      <div className="plan-section-alt">
        <section className="plan-section">
          <div className="plan-section-header">
            <div className="plan-section-tag">Financeiro</div>
            <h2>Como é o Pagamento?</h2>
            <p>Simples, transparente e sem surpresas</p>
          </div>
          <div className="plan-payment-grid">
            <div className="plan-payment-card">
              <div className="plan-payment-icon"><FiDollarSign /></div>
              <h3>R$ 300 por semana</h3>
              <p>O pagamento é feito <strong>semanalmente</strong>, facilitando seu controle financeiro ao longo do mês.</p>
            </div>
            <div className="plan-payment-card">
              <div className="plan-payment-icon"><FiShield /></div>
              <h3>R$ 400 de caução</h3>
              <p>A caução é uma garantia <strong>totalmente reembolsável</strong> ao encerrar o contrato sem pendências.</p>
            </div>
            <div className="plan-payment-card">
              <div className="plan-payment-icon"><FiClock /></div>
              <h3>Renovação fácil</h3>
              <p>Ao término dos 30 dias, a renovação é feita de forma simples, <strong>sem burocracia</strong>.</p>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ */}
      <section className="plan-section">
        <div className="plan-section-header">
          <div className="plan-section-tag">Dúvidas</div>
          <h2>Perguntas Frequentes</h2>
        </div>
        <div className="plan-faq-list">
          <div className="plan-faq-item">
            <div className="plan-faq-q"><FiAlertCircle /> Posso cancelar antes de 30 dias?</div>
            <div className="plan-faq-a">Sim. Basta entrar em contato conosco com antecedência para acertar os detalhes do encerramento do contrato.</div>
          </div>
          <div className="plan-faq-item">
            <div className="plan-faq-q"><FiAlertCircle /> A caução é reembolsada sempre?</div>
            <div className="plan-faq-a">A caução é devolvida integralmente ao final do contrato, desde que a moto seja devolvida nas mesmas condições em que foi retirada, sem danos ou pendências.</div>
          </div>
          <div className="plan-faq-item">
            <div className="plan-faq-q"><FiAlertCircle /> Que documentos preciso?</div>
            <div className="plan-faq-a">CNH (Carteira Nacional de Habilitação) válida, RG, CPF e comprovante de residência atualizado.</div>
          </div>
          <div className="plan-faq-item">
            <div className="plan-faq-q"><FiAlertCircle /> As motos têm seguro?</div>
            <div className="plan-faq-a">Sim! Todas as nossas motos possuem seguro. Você aluga com total tranquilidade e segurança.</div>
          </div>
          <div className="plan-faq-item">
            <div className="plan-faq-q"><FiAlertCircle /> Posso renovar por mais de um mês?</div>
            <div className="plan-faq-a">Com certeza! A renovação é simples e pode ser feita quantas vezes quiser, mantendo as mesmas condições do contrato.</div>
          </div>
          <div className="plan-faq-item">
            <div className="plan-faq-q"><FiAlertCircle /> Preciso levar a moto para revisão?</div>
            <div className="plan-faq-a">Não! Entregamos a moto já revisada e pronta para uso. Qualquer problema durante o contrato, nossa equipe oferece suporte técnico.</div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="plan-cta">
        <div className="plan-cta-glow plan-cta-glow-mensal" />
        <div className="plan-cta-inner">
          <div className="plan-cta-badge"><FiShield /> Seguro Incluso</div>
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

export default PlanMensal;
