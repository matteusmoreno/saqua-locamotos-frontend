import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;
