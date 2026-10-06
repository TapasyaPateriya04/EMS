import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useAuth } from './context/authContext';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import EmployeeDashboard from './components/Dashboard/EmployeeDashboard';
import Login from './components/Auth/Login';

function SessionLoading() {
  return (
    <main className="session-screen" aria-live="polite" aria-busy="true">
      <div className="loading-mark" aria-hidden="true">A</div>
      <p>Opening your workspace…</p>
    </main>
  );
}

export default function App() {
  const { user, loading, error, login, logout } = useAuth();
  const reduceMotion = useReducedMotion();

  if (loading) return <SessionLoading />;

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div
          key={`workspace-${user.id}`}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
        >
          {user.role === 'ADMIN'
            ? <AdminDashboard user={user} onLogout={logout} />
            : <EmployeeDashboard user={user} onLogout={logout} />}
        </motion.div>
      ) : (
        <motion.div
          key="login"
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
          transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeOut' }}
        >
          <Login onLogin={login} error={error} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
