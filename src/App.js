import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Landing from './pages/Landing/Landing';
import Dashboard from './pages/Dashboard/Dashboard';
import CustomerList from './pages/Customers/CustomerList';
import CustomerForm from './pages/Customers/CustomerForm';
import CustomerDetail from './pages/Customers/CustomerDetail';
import MotorcycleList from './pages/Motorcycles/MotorcycleList';
import MotorcycleForm from './pages/Motorcycles/MotorcycleForm';
import MotorcycleDetail from './pages/Motorcycles/MotorcycleDetail';
import ContractList from './pages/Contracts/ContractList';
import ContractForm from './pages/Contracts/ContractForm';
import ContractDetail from './pages/Contracts/ContractDetail';
import Financial from './pages/Financial/Financial';
import CustomerHome from './pages/CustomerHome/CustomerHome';
import CustomerProfile from './pages/CustomerProfile/CustomerProfile';
import MyContracts from './pages/MyContracts/MyContracts';
import MyContractDetail from './pages/MyContracts/MyContractDetail';
import './App.css';

/** Routes only accessible by ADMIN */
function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return null;
  return isAdmin ? children : <Navigate to="/painel" replace />;
}

function AppRoutes() {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      {/* Public landing – only when NOT authenticated */}
      <Route
        path="/"
        element={isAuthenticated ? <Navigate to="/painel" replace /> : <Landing />}
      />

      {/* Authenticated area */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Home (panel) – different per role */}
        <Route
          path="/painel"
          element={isAdmin ? <Dashboard /> : <CustomerHome />}
        />

        {/* Admin-only */}
        <Route path="/locadores" element={<AdminRoute><CustomerList /></AdminRoute>} />
        <Route path="/locadores/novo" element={<AdminRoute><CustomerForm /></AdminRoute>} />
        <Route path="/locadores/editar/:id" element={<AdminRoute><CustomerForm /></AdminRoute>} />
        <Route path="/locadores/:id" element={<AdminRoute><CustomerDetail /></AdminRoute>} />
        <Route path="/motos" element={<AdminRoute><MotorcycleList /></AdminRoute>} />
        <Route path="/motos/nova" element={<AdminRoute><MotorcycleForm /></AdminRoute>} />
        <Route path="/motos/editar/:id" element={<AdminRoute><MotorcycleForm /></AdminRoute>} />
        <Route path="/motos/:id" element={<AdminRoute><MotorcycleDetail /></AdminRoute>} />
        <Route path="/contratos" element={<AdminRoute><ContractList /></AdminRoute>} />
        <Route path="/contratos/novo" element={<AdminRoute><ContractForm /></AdminRoute>} />
        <Route path="/contratos/:id" element={<AdminRoute><ContractDetail /></AdminRoute>} />
        <Route path="/financeiro" element={<AdminRoute><Financial /></AdminRoute>} />

        {/* Customer */}
        <Route path="/minha-conta" element={<CustomerProfile />} />
        <Route path="/meus-contratos" element={<MyContracts />} />
        <Route path="/meus-contratos/:id" element={<MyContractDetail />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  );
}

export default App;
