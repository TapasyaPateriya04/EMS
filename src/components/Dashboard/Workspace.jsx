import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowDownRight,
  ArrowRight,
  CalendarDays,
  Check,
  CircleHelp,
  Clock3,
  LayoutDashboard,
  KeyRound,
  ListTodo,
  LogOut,
  Moon,
  Plus,
  RefreshCw,
  Search,
  SearchX,
  Sun,
  UsersRound,
  X,
} from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion, useScroll } from 'framer-motion';
import PropTypes from 'prop-types';
import { apiRequest } from '../../utils/api';

const statusLabels = {
  NEW: 'New',
  ACTIVE: 'In progress',
  COMPLETED: 'Completed',
  FAILED: 'Needs attention',
};

ConfirmDialog.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  confirmLabel: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired,
};

const statusColors = {
  NEW: 'status-new',
  ACTIVE: 'status-active',
  COMPLETED: 'status-completed',
  FAILED: 'status-failed',
};

function localDateValue() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function formatDate(value) {
  if (!value) return 'No due date';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' })
    .format(new Date(`${value}T00:00:00`));
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function Modal({ title, description, onClose, children }) {
  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <div className="modal-heading">
          <div>
            <p className="eyebrow">WORKSPACE ACTION</p>
            <h2 id="modal-title">{title}</h2>
            <p id="modal-description">{description}</p>
          </div>
          <button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}>
            <X size={19} />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}

function ConfirmDialog({ title, description, confirmLabel, onClose, onConfirm, busy }) {
  return (
    <Modal title={title} description={description} onClose={onClose}>
      <div className="modal-actions">
        <button className="button button-quiet" type="button" onClick={onClose}>Keep account</button>
        <button className="button button-primary" type="button" onClick={onConfirm} disabled={busy}>
          {busy ? 'Updating…' : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone, index, reduceMotion }) {
  return (
    <motion.article
      className={`stat-card ${tone}`}
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduceMotion ? 0 : 0.38, delay: reduceMotion ? 0 : index * 0.055 }}
    >
      <div className="stat-card-top">
        <span>{label}</span>
        <span className="stat-icon"><Icon size={17} strokeWidth={1.8} /></span>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </motion.article>
  );
}

function StatusChart({ tasks }) {
  const values = ['NEW', 'ACTIVE', 'COMPLETED', 'FAILED'].map((status) => ({
    status,
    label: statusLabels[status],
    value: tasks.filter((task) => task.status === status).length,
  }));
  const total = tasks.length;

  return (
    <section className="panel chart-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">WORKLOAD SNAPSHOT</p>
          <h2>How work is moving</h2>
        </div>
        <span className="panel-period">CURRENT</span>
      </div>
      {total ? (
        <>
          <div
            className="status-track"
            role="img"
            aria-label={values.map((item) => `${item.value} ${item.label.toLowerCase()}`).join(', ')}
          >
            {values.map((item) => item.value > 0 && (
              <div
                key={item.status}
                className={`status-segment ${statusColors[item.status]}`}
                style={{ flexGrow: item.value }}
                title={`${item.label}: ${item.value}`}
              />
            ))}
          </div>
          <div className="chart-legend">
            {values.map((item) => (
              <div className="legend-item" key={item.status}>
                <span className={`legend-dot ${statusColors[item.status]}`} />
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="chart-empty">
          <span className="empty-mark"><Activity size={20} /></span>
          <p>Workload signals will appear here once tasks are assigned.</p>
        </div>
      )}
    </section>
  );
}

function TaskCard({ task, isAdmin, onStatusChange, busyId, reduceMotion }) {
  const nextAction = task.status === 'NEW'
    ? { label: 'Accept task', status: 'ACTIVE', icon: ArrowRight }
    : task.status === 'ACTIVE'
      ? { label: 'Mark complete', status: 'COMPLETED', icon: Check }
      : null;

  return (
    <motion.article
      layout={!reduceMotion}
      className="task-card"
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98 }}
      transition={{ duration: reduceMotion ? 0 : 0.22 }}
    >
      <div className="task-card-top">
        <span className={`status-pill ${statusColors[task.status]}`}>
          <span />{statusLabels[task.status] || task.status}
        </span>
        <span className="task-category">{task.category}</span>
      </div>
      <h3>{task.title}</h3>
      <p className="task-description">{task.description}</p>
      <div className="task-card-footer">
        <div className="task-assignee">
          <span className="avatar avatar-small">{initials(task.employeeName)}</span>
          <span>{isAdmin ? task.employeeName : 'Assigned to you'}</span>
        </div>
        <span className="task-date"><CalendarDays size={14} />{formatDate(task.dueDate)}</span>
      </div>
      {nextAction && !isAdmin && (
        <div className="task-actions">
          <button
            type="button"
            className="task-action"
            onClick={() => onStatusChange(task, nextAction.status)}
            disabled={busyId === task.id}
          >
            <nextAction.icon size={15} />
            {busyId === task.id ? 'Saving…' : nextAction.label}
          </button>
          {task.status === 'ACTIVE' && !isAdmin && (
            <button
              type="button"
              className="task-fail-action"
              onClick={() => onStatusChange(task, 'FAILED')}
              disabled={busyId === task.id}
            >
              Flag a blocker
            </button>
          )}
        </div>
      )}
    </motion.article>
  );
}

function EmployeeForm({ onClose, onCreate, busy }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [formError, setFormError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    try {
      await onCreate(form);
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <Modal
      title="Add a teammate"
      description="Create an employee account and give them a secure way into the workspace."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={submit}>
        <label htmlFor="employee-name">Full name</label>
        <input
          autoFocus
          id="employee-name"
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
          maxLength={120}
          required
        />
        <label htmlFor="employee-email">Work email</label>
        <input
          id="employee-email"
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
          maxLength={254}
          required
        />
        <label htmlFor="employee-password">Temporary password</label>
        <input
          id="employee-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          value={form.password}
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
        />
        <p className="field-hint">Use at least 12 characters. Share it with the teammate securely.</p>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create account'}<ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ChangePasswordForm({ onClose, onChange, busy }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmation: '' });
  const [formError, setFormError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    if (form.newPassword !== form.confirmation) {
      setFormError('The new password and confirmation do not match.');
      return;
    }
    try {
      await onChange({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <Modal
      title="Change your password"
      description="Choose a unique password with at least 12 characters. This signs out any active sessions."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={submit}>
        <label htmlFor="current-password">Current password</label>
        <input
          autoFocus
          id="current-password"
          type="password"
          autoComplete="current-password"
          maxLength={72}
          value={form.currentPassword}
          onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
          required
        />
        <label htmlFor="new-password">New password</label>
        <input
          id="new-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          value={form.newPassword}
          onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
          required
        />
        <label htmlFor="confirm-password">Confirm new password</label>
        <input
          id="confirm-password"
          type="password"
          autoComplete="new-password"
          minLength={12}
          maxLength={72}
          value={form.confirmation}
          onChange={(event) => setForm({ ...form, confirmation: event.target.value })}
          required
        />
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={busy}>
            {busy ? 'Updating…' : 'Update password'}<ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

function TaskForm({ employees, onClose, onCreate, busy }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    dueDate: localDateValue(),
    category: '',
    employeeId: '',
  });
  const [formError, setFormError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setFormError('');
    try {
      await onCreate({ ...form, employeeId: Number(form.employeeId) });
    } catch (error) {
      setFormError(error.message);
    }
  }

  return (
    <Modal
      title="Create a task"
      description="Set a clear outcome, due date, and owner. Your teammate will see it in their work queue."
      onClose={onClose}
    >
      <form className="modal-form" onSubmit={submit}>
        <label htmlFor="task-title">Task name</label>
        <input
          autoFocus
          id="task-title"
          value={form.title}
          onChange={(event) => setForm({ ...form, title: event.target.value })}
          maxLength={160}
          required
        />
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={form.description}
          onChange={(event) => setForm({ ...form, description: event.target.value })}
          maxLength={2000}
          rows={3}
          required
        />
        <div className="form-row">
          <div>
            <label htmlFor="task-due-date">Due date</label>
            <input
              id="task-due-date"
              type="date"
              value={form.dueDate}
              onChange={(event) => setForm({ ...form, dueDate: event.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="task-category">Category</label>
            <input
              id="task-category"
              value={form.category}
              onChange={(event) => setForm({ ...form, category: event.target.value })}
              maxLength={80}
              required
            />
          </div>
        </div>
        <label htmlFor="task-employee">Assign to</label>
        <select
          id="task-employee"
          value={form.employeeId}
          onChange={(event) => setForm({ ...form, employeeId: event.target.value })}
          required
        >
          <option value="">Choose a teammate</option>
          {employees.filter((employee) => employee.active).map((employee) => (
            <option value={employee.id} key={employee.id}>{employee.name}</option>
          ))}
        </select>
        {formError && <p className="form-error" role="alert">{formError}</p>}
        <div className="modal-actions">
          <button className="button button-quiet" type="button" onClick={onClose}>Cancel</button>
          <button className="button button-primary" type="submit" disabled={busy || !employees.some((item) => item.active)}>
            {busy ? 'Assigning…' : 'Assign task'}<ArrowRight size={16} />
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default function Workspace({ user, isAdmin, onLogout }) {
  const [employees, setEmployees] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [section, setSection] = useState('overview');
  const [search, setSearch] = useState('');
  const [taskFilter, setTaskFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [busy, setBusy] = useState(false);
  const [busyTaskId, setBusyTaskId] = useState(null);
  const [modal, setModal] = useState('');
  const [toast, setToast] = useState('');
  const [toastError, setToastError] = useState(false);
  const [employeeToToggle, setEmployeeToToggle] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('ems.theme') || 'light');
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const searchInputRef = useRef(null);

  const refreshWorkspace = useCallback(async () => {
    setLoadError('');
    try {
      const taskRequest = apiRequest('/tasks');
      const results = isAdmin
        ? await Promise.all([apiRequest('/employees'), taskRequest])
        : [[], await taskRequest];
      setEmployees(results[0]);
      setTasks(results[1]);
    } catch (error) {
      setLoadError(error.message);
      throw error;
    }
  }, [isAdmin]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    refreshWorkspace()
      .catch((error) => setLoadError(error.message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [refreshWorkspace]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('ems.theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!modal) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') setModal('');
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modal]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    function focusSearch(event) {
      const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target?.tagName)
        || event.target?.isContentEditable;
      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', focusSearch);
    return () => window.removeEventListener('keydown', focusSearch);
  }, []);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === 'COMPLETED').length;
    return {
      people: employees.filter((employee) => employee.active).length,
      open: tasks.filter((task) => task.status === 'NEW' || task.status === 'ACTIVE').length,
      completed,
      completion: tasks.length ? Math.round((completed / tasks.length) * 100) : 0,
    };
  }, [employees, tasks]);

  const visibleEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    return employees.filter((employee) =>
      `${employee.name} ${employee.email}`.toLowerCase().includes(query));
  }, [employees, search]);

  const visibleTasks = useMemo(() => {
    const query = search.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesSearch = `${task.title} ${task.description} ${task.category} ${task.employeeName}`
        .toLowerCase()
        .includes(query);
      const matchesStatus = taskFilter === 'ALL' || task.status === taskFilter;
      return matchesSearch && matchesStatus;
    });
  }, [tasks, search, taskFilter]);

  async function refreshAfterMutation(message) {
    await refreshWorkspace();
    setToastError(false);
    setToast(message);
  }

  function notifyError(message) {
    setToastError(true);
    setToast(message);
  }

  async function createEmployee(form) {
    setBusy(true);
    try {
      await apiRequest('/employees', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setModal('');
      await refreshAfterMutation('Teammate added to your workspace.');
    } finally {
      setBusy(false);
    }
  }

  async function createTask(form) {
    setBusy(true);
    try {
      await apiRequest('/tasks', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setModal('');
      await refreshAfterMutation('Task assigned and ready to move.');
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(form) {
    setBusy(true);
    try {
      await apiRequest('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setModal('');
      onLogout('Your password was updated. Sign in with your new password.');
    } finally {
      setBusy(false);
    }
  }

  async function changeTaskStatus(task, status) {
    setBusyTaskId(task.id);
    try {
      await apiRequest(`/tasks/${task.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      await refreshAfterMutation(`Task marked ${statusLabels[status].toLowerCase()}.`);
    } catch (error) {
      notifyError(error.message);
    } finally {
      setBusyTaskId(null);
    }
  }

  async function toggleEmployee(employee) {
    try {
      await apiRequest(`/employees/${employee.id}/active`, {
        method: 'PATCH',
        body: JSON.stringify({ active: !employee.active }),
      });
      await refreshAfterMutation(`${employee.name} is now ${employee.active ? 'inactive' : 'active'}.`);
    } catch (error) {
      notifyError(error.message);
    }
  }

  async function confirmEmployeeToggle() {
    if (!employeeToToggle) return;
    setBusy(true);
    try {
      await toggleEmployee(employeeToToggle);
    } finally {
      setBusy(false);
      setEmployeeToToggle(null);
    }
  }

  const navigation = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    ...(isAdmin ? [{ id: 'team', label: 'Your team', icon: UsersRound }] : []),
    { id: 'tasks', label: isAdmin ? 'Work queue' : 'My work', icon: ListTodo },
  ];

  const pageTitle = section === 'team'
    ? 'Your team'
    : section === 'tasks'
      ? (isAdmin ? 'Work queue' : 'My work')
      : 'Overview';

  const title = section === 'overview'
    ? `${greeting()}, ${user.name.split(' ')[0]}.`
    : section === 'team'
      ? 'A good team makes good work.'
      : isAdmin
        ? 'Make the next move count.'
        : 'Your next good move.';

  const subtitle = section === 'overview'
    ? 'Here’s what’s moving across your workspace today.'
    : section === 'team'
      ? 'The people behind everything you’re building together.'
      : 'A clear view of what’s on your plate and what’s already moving.';

  return (
    <div className={`workspace theme-${theme}`}>
      {!reduceMotion && (
        <motion.div className="scroll-progress" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      )}
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="EMS overview">
          <span className="brand-mark">e</span><span>ems<span className="brand-period">.</span></span>
        </a>
        <div className="workspace-switcher">
          <span className="workspace-avatar">E</span>
          <span><strong>EMS Workspace</strong><small>People operations</small></span>
        </div>

        <p className="sidebar-label">WORKSPACE</p>
        <nav className="primary-nav" aria-label="Main navigation">
          {navigation.map(({ id, label, icon: Icon }) => (
            <button
              className={`nav-link ${section === id ? 'nav-link-active' : ''}`}
              type="button"
              onClick={() => {
                setSection(id);
                setSearch('');
              }}
              aria-current={section === id ? 'page' : undefined}
              key={id}
            >
              <Icon size={18} strokeWidth={1.8} />
              <span>{label}</span>
              {id === 'tasks' && stats.open > 0 && <span className="nav-count">{stats.open}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-spacer" />
        <div className="sidebar-note">
          <span className="note-icon"><CircleHelp size={16} /></span>
          <div><strong>Need a hand?</strong><span>Keep your team in the loop.</span></div>
        </div>
        <div className="sidebar-profile">
          <span className="avatar">{initials(user.name)}</span>
          <span className="profile-copy"><strong>{user.name}</strong><small>{isAdmin ? 'Workspace admin' : 'Team member'}</small></span>
          <button className="icon-button logout-button" type="button" onClick={() => onLogout()} aria-label="Sign out">
            <LogOut size={17} />
          </button>
        </div>
      </aside>

      <main className="workspace-main">
        <header className="topbar">
          <div className="breadcrumbs"><span>Workspace</span><span>/</span><strong>{pageTitle}</strong></div>
          <div className="topbar-actions">
            <label className="global-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Search people and tasks</span>
              <input
                ref={searchInputRef}
                type="search"
                placeholder="Search people and work"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
              <kbd>/</kbd>
            </label>
            <button
              className="icon-button theme-toggle"
              type="button"
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <span className="topbar-divider" />
            <span className="topbar-date"><CalendarDays size={15} />{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</span>
            <button
              className="icon-button"
              type="button"
              aria-label="Refresh workspace data"
              onClick={() => refreshWorkspace()
                .then(() => {
                  setToastError(false);
                  setToast('Workspace data is up to date.');
                })
                .catch((error) => notifyError(error.message))}
            >
              <RefreshCw size={17} />
            </button>
            <button
              className="avatar topbar-avatar"
              type="button"
              onClick={() => setModal('password')}
              aria-label="Change your password"
            >
              {initials(user.name)}
            </button>
            <button className="icon-button mobile-change-password" type="button" onClick={() => setModal('password')} aria-label="Change your password">
              <KeyRound size={17} />
            </button>
            <button className="icon-button mobile-signout" type="button" onClick={() => onLogout()} aria-label="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <section className="page-intro">
            <div>
              <p className="eyebrow"><span className="eyebrow-rule" /> PEOPLE &amp; PROGRESS</p>
              <h1>{title}</h1>
              <p className="page-subtitle">{subtitle}</p>
            </div>
            <div className="intro-actions">
              {isAdmin && section === 'team' && (
                <button className="button button-primary" type="button" onClick={() => setModal('employee')}>
                  <Plus size={17} /> Add teammate
                </button>
              )}
              {isAdmin && section !== 'team' && (
                <button className="button button-primary" type="button" onClick={() => setModal('task')}>
                  <Plus size={17} /> Create a task
                </button>
              )}
              {!isAdmin && (
                <div className="date-note"><Clock3 size={15} /> Focus on what moves today</div>
              )}
            </div>
          </section>

          {loadError && (
            <div className="inline-alert" role="alert">
              <span>{loadError}</span>
              <button className="button button-quiet" type="button" onClick={() => {
                setLoading(true);
                refreshWorkspace()
                  .catch((error) => setLoadError(error.message))
                  .finally(() => setLoading(false));
              }}>Try again<ArrowRight size={15} /></button>
            </div>
          )}

          {loading ? (
            <div className="loading-grid" aria-label="Loading workspace" aria-busy="true">
              <div /><div /><div /><div />
              <div className="loading-wide" />
            </div>
          ) : section === 'team' && isAdmin ? (
            <TeamSection
              employees={visibleEmployees}
              tasks={tasks}
              onToggle={setEmployeeToToggle}
              reduceMotion={reduceMotion}
            />
          ) : (
            <>
              {section === 'overview' && (
                <section className="stats-grid" aria-label="Workspace metrics">
                  {isAdmin && (
                    <StatCard
                      label="Active teammates"
                      value={stats.people}
                      detail={`${employees.length} people in the directory`}
                      icon={UsersRound}
                      tone="stat-people"
                      index={0}
                      reduceMotion={reduceMotion}
                    />
                  )}
                  <StatCard
                    label={isAdmin ? 'Work in motion' : 'Open work'}
                    value={stats.open}
                    detail="New and in-progress tasks"
                    icon={ListTodo}
                    tone="stat-open"
                    index={isAdmin ? 1 : 0}
                    reduceMotion={reduceMotion}
                  />
                  <StatCard
                    label="Completed"
                    value={stats.completed}
                    detail="Tasks marked complete"
                    icon={Check}
                    tone="stat-done"
                    index={isAdmin ? 2 : 1}
                    reduceMotion={reduceMotion}
                  />
                  <StatCard
                    label="Completion"
                    value={`${stats.completion}%`}
                    detail={tasks.length ? `Across ${tasks.length} assigned tasks` : 'No assigned tasks yet'}
                    icon={Activity}
                    tone="stat-rate"
                    index={isAdmin ? 3 : 2}
                    reduceMotion={reduceMotion}
                  />
                </section>
              )}

              <div className={`dashboard-grid ${section === 'tasks' ? 'dashboard-grid-single' : ''}`}>
                {section === 'overview' && <StatusChart tasks={tasks} />}
                <section className="panel task-panel">
                  <div className="panel-heading task-panel-heading">
                    <div>
                      <p className="eyebrow">{section === 'tasks' ? 'YOUR TASKS, AT A GLANCE' : 'THE WORK THAT MATTERS'}</p>
                      <h2>{isAdmin ? 'Team work queue' : 'Your work queue'}</h2>
                    </div>
                    <div className="task-panel-actions">
                      {section !== 'tasks' && (
                        <button className="text-link" type="button" onClick={() => setSection('tasks')}>
                          View all<ArrowRight size={15} />
                        </button>
                      )}
                      {isAdmin && section === 'tasks' && (
                        <button className="button button-soft" type="button" onClick={() => setModal('task')}>
                          <Plus size={15} /> New task
                        </button>
                      )}
                    </div>
                  </div>
                  {section === 'tasks' && (
                    <div className="filter-row" role="group" aria-label="Filter tasks by status">
                      {['ALL', 'NEW', 'ACTIVE', 'COMPLETED', 'FAILED'].map((filter) => (
                        <button
                          type="button"
                          className={`filter-chip ${taskFilter === filter ? 'filter-chip-active' : ''}`}
                          onClick={() => setTaskFilter(filter)}
                          aria-pressed={taskFilter === filter}
                          key={filter}
                        >
                          {filter === 'ALL' ? 'All work' : statusLabels[filter]}
                        </button>
                      ))}
                    </div>
                  )}
                  {visibleTasks.length ? (
                    <div className="task-grid">
                      <AnimatePresence initial={false}>
                        {(section === 'overview' ? visibleTasks.slice(0, 3) : visibleTasks).map((task) => (
                          <TaskCard
                            key={task.id}
                            task={task}
                            isAdmin={isAdmin}
                            onStatusChange={changeTaskStatus}
                            busyId={busyTaskId}
                            reduceMotion={reduceMotion}
                          />
                        ))}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <span className="empty-mark"><SearchX size={20} /></span>
                      <h3>{search ? 'No work matched that search.' : 'A little room to breathe.'}</h3>
                      <p>{search ? 'Try another name, category, or task title.' : isAdmin ? 'Create a task when your team is ready to get moving.' : 'New tasks assigned to you will show up here.'}</p>
                      {isAdmin && !search && (
                        <button className="button button-soft" type="button" onClick={() => setModal('task')}>
                          <Plus size={15} /> Create first task
                        </button>
                      )}
                    </div>
                  )}
                </section>
                {section === 'overview' && isAdmin && (
                  <TeamPreview employees={employees} tasks={tasks} onViewTeam={() => setSection('team')} />
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <nav className="bottom-navigation" aria-label="Mobile navigation">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button
            type="button"
            className={section === id ? 'bottom-nav-active' : ''}
            onClick={() => setSection(id)}
            aria-current={section === id ? 'page' : undefined}
            key={id}
          >
            <Icon size={19} /><span>{label}</span>
          </button>
        ))}
      </nav>

      <AnimatePresence>
        {modal === 'employee' && (
          <EmployeeForm
            onClose={() => setModal('')}
            onCreate={createEmployee}
            busy={busy}
          />
        )}
        {modal === 'task' && (
          <TaskForm
            employees={employees}
            onClose={() => setModal('')}
            onCreate={createTask}
            busy={busy}
          />
        )}
        {modal === 'password' && (
          <ChangePasswordForm
            onClose={() => setModal('')}
            onChange={changePassword}
            busy={busy}
          />
        )}
        {employeeToToggle && (
          <ConfirmDialog
            title={`${employeeToToggle.active ? 'Pause' : 'Restore'} ${employeeToToggle.name}’s access?`}
            description={employeeToToggle.active
              ? 'They will no longer be able to sign in. Their account and task history will stay in the directory.'
              : 'They will be able to sign in and continue working on their assigned tasks.'}
            confirmLabel={employeeToToggle.active ? 'Pause access' : 'Restore access'}
            onClose={() => setEmployeeToToggle(null)}
            onConfirm={confirmEmployeeToggle}
            busy={busy}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div
            role={toastError ? 'alert' : 'status'}
            className={`toast-message ${toastError ? 'toast-error' : ''}`}
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
          >
            <span className="toast-check">{toastError ? <AlertCircle size={15} /> : <Check size={15} />}</span>{toast}
            <button type="button" aria-label="Dismiss notification" onClick={() => setToast('')}><X size={15} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TeamSection({ employees, tasks, onToggle, reduceMotion }) {
  return (
    <section className="panel directory-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">PEOPLE DIRECTORY</p>
          <h2>Everyone on the team <span className="heading-count">{employees.length}</span></h2>
        </div>
        <span className="directory-caption">Sorted by name</span>
      </div>
      {employees.length ? (
        <>
          <div className="directory-table-wrap">
            <table className="directory-table">
              <thead>
                <tr>
                  <th scope="col">Teammate</th>
                  <th scope="col">Access</th>
                  <th scope="col">Open work</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Account actions</span></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((employee, index) => {
                  const openTasks = tasks.filter((task) =>
                    task.employeeId === employee.id
                    && (task.status === 'NEW' || task.status === 'ACTIVE')).length;
                  return (
                    <motion.tr
                      key={employee.id}
                      initial={reduceMotion ? false : { opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: reduceMotion ? 0 : 0.2, delay: reduceMotion ? 0 : index * 0.025 }}
                    >
                      <td>
                        <div className="directory-person">
                          <span className={`avatar ${index % 4 === 1 ? 'avatar-blue' : index % 4 === 2 ? 'avatar-coral' : index % 4 === 3 ? 'avatar-lilac' : ''}`}>
                            {initials(employee.name)}
                          </span>
                          <span><strong>{employee.name}</strong><small>{employee.email}</small></span>
                        </div>
                      </td>
                      <td><span className={`role-label ${employee.role === 'ADMIN' ? 'role-admin' : ''}`}>{employee.role === 'ADMIN' ? 'Administrator' : 'Team member'}</span></td>
                      <td><span className="task-count">{openTasks}<small> open</small></span></td>
                      <td><span className={`employee-status ${employee.active ? 'employee-active' : 'employee-inactive'}`}><span />{employee.active ? 'Active' : 'Inactive'}</span></td>
                      <td>
                        {employee.role !== 'ADMIN' && (
                          <button
                            className="table-action"
                            type="button"
                            onClick={() => onToggle(employee)}
                            aria-label={`${employee.active ? 'Deactivate' : 'Reactivate'} ${employee.name}`}
                          >
                            {employee.active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="directory-mobile-list">
            {employees.map((employee) => {
              const openTasks = tasks.filter((task) =>
                task.employeeId === employee.id
                && (task.status === 'NEW' || task.status === 'ACTIVE')).length;
              return (
                <article className="directory-mobile-card" key={employee.id}>
                  <div className="directory-person">
                    <span className="avatar">{initials(employee.name)}</span>
                    <span><strong>{employee.name}</strong><small>{employee.email}</small></span>
                  </div>
                  <div className="directory-mobile-meta">
                    <span className={`employee-status ${employee.active ? 'employee-active' : 'employee-inactive'}`}><span />{employee.active ? 'Active' : 'Inactive'}</span>
                    <span className="mobile-open-work">{openTasks} open tasks</span>
                  </div>
                  {employee.role !== 'ADMIN' && (
                    <button
                      className="table-action"
                      type="button"
                      onClick={() => onToggle(employee)}
                      aria-label={`${employee.active ? 'Deactivate' : 'Reactivate'} ${employee.name}`}
                    >
                      {employee.active ? 'Deactivate access' : 'Reactivate access'}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
          <p className="directory-footnote">Account passwords are stored as hashes. Admins can pause access without deleting a teammate’s task history.</p>
        </>
      ) : (
        <div className="empty-state directory-empty">
          <span className="empty-mark"><UsersRound size={20} /></span>
          <h3>No teammates match your search.</h3>
          <p>Try another name or email address.</p>
        </div>
      )}
    </section>
  );
}

function TeamPreview({ employees, tasks, onViewTeam }) {
  const preview = employees.filter((employee) => employee.active).slice(0, 4);

  return (
    <section className="panel team-preview">
      <div className="panel-heading">
        <div><p className="eyebrow">THE PEOPLE BEHIND IT</p><h2>Your team</h2></div>
        <button className="icon-button" type="button" onClick={onViewTeam} aria-label="View team directory">
          <ArrowRight size={17} />
        </button>
      </div>
      {preview.length ? (
        <div className="preview-list">
          {preview.map((employee, index) => {
            const openCount = tasks.filter((task) => task.employeeId === employee.id
              && (task.status === 'NEW' || task.status === 'ACTIVE')).length;
            return (
              <div className="preview-person" key={employee.id}>
                <span className={`avatar ${index % 4 === 1 ? 'avatar-blue' : index % 4 === 2 ? 'avatar-coral' : index % 4 === 3 ? 'avatar-lilac' : ''}`}>
                  {initials(employee.name)}
                </span>
                <span className="preview-name"><strong>{employee.name}</strong><small>{employee.role === 'ADMIN' ? 'Workspace admin' : 'Team member'}</small></span>
                <span className="preview-work">{openCount}<small>open</small></span>
              </div>
            );
          })}
          <button className="text-link preview-link" type="button" onClick={onViewTeam}>
            Meet the whole team<ArrowRight size={15} />
          </button>
        </div>
      ) : (
        <div className="preview-empty">
          <p>Your directory is ready for the people who make the work happen.</p>
          <span><ArrowDownRight size={16} /> Add teammates from the team directory</span>
        </div>
      )}
    </section>
  );
}

const employeeShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  role: PropTypes.string.isRequired,
  active: PropTypes.bool.isRequired,
  createdAt: PropTypes.string,
});

const taskShape = PropTypes.shape({
  id: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  dueDate: PropTypes.string.isRequired,
  category: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  employeeId: PropTypes.number.isRequired,
  employeeName: PropTypes.string.isRequired,
});

Modal.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  detail: PropTypes.string.isRequired,
  icon: PropTypes.elementType.isRequired,
  tone: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  reduceMotion: PropTypes.bool,
};

StatusChart.propTypes = {
  tasks: PropTypes.arrayOf(taskShape).isRequired,
};

TaskCard.propTypes = {
  task: taskShape.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onStatusChange: PropTypes.func.isRequired,
  busyId: PropTypes.number,
  reduceMotion: PropTypes.bool,
};

EmployeeForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired,
};

TaskForm.propTypes = {
  employees: PropTypes.arrayOf(employeeShape).isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired,
};

ChangePasswordForm.propTypes = {
  onClose: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  busy: PropTypes.bool.isRequired,
};

Workspace.propTypes = {
  user: employeeShape.isRequired,
  isAdmin: PropTypes.bool.isRequired,
  onLogout: PropTypes.func.isRequired,
};

TeamSection.propTypes = {
  employees: PropTypes.arrayOf(employeeShape).isRequired,
  tasks: PropTypes.arrayOf(taskShape).isRequired,
  onToggle: PropTypes.func.isRequired,
  reduceMotion: PropTypes.bool,
};

TeamPreview.propTypes = {
  employees: PropTypes.arrayOf(employeeShape).isRequired,
  tasks: PropTypes.arrayOf(taskShape).isRequired,
  onViewTeam: PropTypes.func.isRequired,
};
