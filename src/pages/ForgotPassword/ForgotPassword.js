import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiKey, FiLock, FiEye, FiEyeOff, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import userService from '../../services/userService';
import logo from '../../assets/saqua-locamotos-logo.png';
import './ForgotPassword.css';

// ---- password strength helper ----
function getStrength(pwd) {
  if (!pwd) return { level: 0, label: '', color: '' };
  let score = 0;
  if (pwd.length >= 8)             score++;
  if (/[A-Z]/.test(pwd))           score++;
  if (/[0-9]/.test(pwd))           score++;
  if (/[^A-Za-z0-9]/.test(pwd))   score++;
  const map = [
    { level: 1, label: 'Muito fraca', color: '#ef4444' },
    { level: 2, label: 'Fraca',       color: '#f97316' },
    { level: 3, label: 'Média',       color: '#eab308' },
    { level: 4, label: 'Forte',       color: '#22c55e' },
  ];
  return map[score - 1] ?? map[0];
}

function ForgotPassword() {
  // steps: 'email' | 'reset' | 'success'
  const [step, setStep] = useState('email');

  // Step 1 state
  const [email, setEmail]               = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailError, setEmailError]     = useState('');

  // Step 2 state
  const [token, setToken]               = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew]           = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [resetting, setResetting]       = useState(false);
  const [resetError, setResetError]     = useState('');

  // ---- Step 1: send email ----
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setEmailError('');
    setSendingEmail(true);
    try {
      await userService.sendResetPasswordEmail(email);
      setStep('reset');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data;
      setEmailError(typeof msg === 'string' ? msg : 'E-mail não encontrado ou não verificado.');
    } finally {
      setSendingEmail(false);
    }
  };

  // ---- Step 2: reset password ----
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
  const canSubmit = token.trim() && newPassword.length >= 6 && passwordsMatch;

  const handleReset = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;
    setResetError('');
    setResetting(true);
    try {
      await userService.resetPassword(token.trim(), newPassword);
      setStep('success');
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data;
      setResetError(typeof msg === 'string' ? msg : 'Token inválido ou já utilizado.');
    } finally {
      setResetting(false);
    }
  };

  const strength = getStrength(newPassword);

  return (
    <div className="fp-page">
      <div className="fp-card">

        {/* Logo */}
        <div className="fp-logo">
          <img src={logo} alt="Saqua Locamotos" />
          <h1>Saqua Locamotos</h1>
        </div>

        {/* ======== STEP 1 – Email ======== */}
        {step === 'email' && (
          <>
            <div className="fp-header">
              <div className="fp-icon">
                <FiMail />
              </div>
              <h2>Esqueci minha senha</h2>
              <p>Informe seu e-mail cadastrado. Enviaremos um token para redefinir sua senha.</p>
            </div>

            <form className="fp-form" onSubmit={handleSendEmail}>
              {emailError && <div className="fp-error">{emailError}</div>}

              <div className="fp-field">
                <label>E-mail</label>
                <input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <button className="fp-btn" type="submit" disabled={sendingEmail}>
                {sendingEmail ? 'Enviando…' : 'Enviar token'}
              </button>
            </form>

            <Link to="/login" className="fp-back">
              <FiArrowLeft /> Voltar para o login
            </Link>
          </>
        )}

        {/* ======== STEP 2 – Token + New password ======== */}
        {step === 'reset' && (
          <>
            <div className="fp-header">
              <div className="fp-icon">
                <FiKey />
              </div>
              <h2>Redefinir senha</h2>
              <p>
                Enviamos um token para <strong>{email}</strong>.<br />
                Cole-o abaixo e escolha uma nova senha.
              </p>
            </div>

            <form className="fp-form" onSubmit={handleReset}>
              {resetError && <div className="fp-error">{resetError}</div>}

              {/* Token */}
              <div className="fp-field">
                <label>Token recebido no e-mail</label>
                <input
                  type="text"
                  placeholder="Cole o token aqui…"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  autoFocus
                  style={{ fontFamily: 'monospace' }}
                />
              </div>

              {/* New password */}
              <div className="fp-field">
                <label>Nova senha</label>
                <div className="fp-password-wrap">
                  <input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button type="button" className="fp-eye" onClick={() => setShowNew((v) => !v)}>
                    {showNew ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {/* Strength bar */}
                {newPassword && (
                  <div className="fp-strength">
                    <div className="fp-strength-bar">
                      {[1, 2, 3, 4].map((n) => (
                        <div
                          key={n}
                          className="fp-strength-seg"
                          style={{
                            background: n <= strength.level ? strength.color : 'rgba(255,255,255,0.08)',
                          }}
                        />
                      ))}
                    </div>
                    <span className="fp-strength-label" style={{ color: strength.color }}>
                      {strength.label}
                    </span>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="fp-field">
                <label>Confirmar nova senha</label>
                <div className="fp-password-wrap">
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repita a nova senha"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={confirmPassword ? (passwordsMatch ? 'input-ok' : 'input-err') : ''}
                  />
                  <button type="button" className="fp-eye" onClick={() => setShowConfirm((v) => !v)}>
                    {showConfirm ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {confirmPassword && !passwordsMatch && (
                  <span className="fp-field-hint error">As senhas não coincidem</span>
                )}
                {passwordsMatch && (
                  <span className="fp-field-hint ok"><FiCheckCircle /> Senhas conferem</span>
                )}
              </div>

              <button className="fp-btn" type="submit" disabled={!canSubmit || resetting}>
                {resetting ? 'Redefinindo…' : 'Redefinir senha'}
              </button>
            </form>

            <button className="fp-back btn-link" onClick={() => { setStep('email'); setResetError(''); }}>
              <FiArrowLeft /> Reenviar para outro e-mail
            </button>
          </>
        )}

        {/* ======== STEP 3 – Success ======== */}
        {step === 'success' && (
          <div className="fp-success">
            <div className="fp-icon success">
              <FiCheckCircle />
            </div>
            <h2>Senha redefinida!</h2>
            <p>Sua senha foi atualizada com sucesso. Já pode fazer login com a nova senha.</p>
            <Link to="/login" className="fp-btn">Ir para o login</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
