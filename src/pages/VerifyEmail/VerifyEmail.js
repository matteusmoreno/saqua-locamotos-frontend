import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiXCircle, FiLoader, FiKey } from 'react-icons/fi';
import userService from '../../services/userService';
import './VerifyEmail.css';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const urlToken = searchParams.get('token');

  const [tokenInput, setTokenInput] = useState(urlToken || '');
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async (tokenToVerify) => {
    const t = (tokenToVerify ?? tokenInput).trim();
    if (!t) {
      setErrorMessage('Informe o token de verificação.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      await userService.verifyEmail(t);
      setStatus('success');
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        'O token é inválido ou já foi utilizado.';
      setErrorMessage(typeof msg === 'string' ? msg : 'Erro ao verificar e-mail.');
      setStatus('error');
    }
  };

  // Auto-submit when the page is opened with a token in the URL
  useEffect(() => {
    if (urlToken) {
      handleVerify(urlToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlToken]);

  const canRetry = status === 'error' || status === 'idle';

  return (
    <div className="verify-email-page">
      <div className="verify-email-card">
        {/* ---- Loading ---- */}
        {status === 'loading' && (
          <>
            <div className="ve-icon loading">
              <FiLoader className="spin" />
            </div>
            <h2>Verificando e-mail…</h2>
            <p>Aguarde enquanto confirmamos seu endereço de e-mail.</p>
          </>
        )}

        {/* ---- Success ---- */}
        {status === 'success' && (
          <>
            <div className="ve-icon success">
              <FiCheckCircle />
            </div>
            <h2>E-mail verificado!</h2>
            <p>Seu endereço de e-mail foi confirmado com sucesso.</p>
            <button className="ve-btn" onClick={() => navigate('/minha-conta')}>
              Ir para Meu Perfil
            </button>
          </>
        )}

        {/* ---- Idle / Error – show token input ---- */}
        {canRetry && (
          <>
            {status === 'error' && (
              <div className="ve-icon error">
                <FiXCircle />
              </div>
            )}
            {status === 'idle' && (
              <div className="ve-icon loading">
                <FiKey />
              </div>
            )}

            <h2>{status === 'error' ? 'Falha na verificação' : 'Verificar e-mail'}</h2>

            {status === 'error' && <p className="ve-error-msg">{errorMessage}</p>}

            {status === 'idle' && (
              <p>Cole abaixo o token de verificação recebido no seu e-mail.</p>
            )}

            <div className="ve-input-group">
              <label htmlFor="ve-token" className="ve-label">
                <FiKey /> Token de verificação
              </label>
              <input
                id="ve-token"
                type="text"
                className="ve-input"
                placeholder="ex.: a3f7c2d1-…"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                autoFocus
              />
            </div>

            <div className="ve-actions">
              <button
                className="ve-btn"
                onClick={() => handleVerify()}
                disabled={!tokenInput.trim()}
              >
                Verificar e-mail
              </button>
              <button className="ve-btn-secondary" onClick={() => navigate('/minha-conta')}>
                Voltar para Meu Perfil
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default VerifyEmail;
