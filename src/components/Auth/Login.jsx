import { useState } from 'react';
import { ArrowRight, BadgeCheck, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import PropTypes from 'prop-types';

const demoAccounts = [
  {
    role: 'ADMIN',
    label: 'Admin demo',
    email: import.meta.env.VITE_DEMO_ADMIN_EMAIL,
    password: import.meta.env.VITE_DEMO_ADMIN_PASSWORD,
    Icon: ShieldCheck,
  },
  {
    role: 'EMPLOYEE',
    label: 'Employee demo',
    email: import.meta.env.VITE_DEMO_EMPLOYEE_EMAIL,
    password: import.meta.env.VITE_DEMO_EMPLOYEE_PASSWORD,
    Icon: UserRound,
  },
];

export default function Login({ onLogin, error = '' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const reduceMotion = useReducedMotion();

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await onLogin(email.trim(), password);
    } catch (loginError) {
      setFormError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemoAccount(account) {
    setEmail(account.email);
    setPassword(account.password);
    setFormError('');
  }

  return (
    <main className="login-page">
      <section className="login-story" aria-label="EMS introduction">
        <div className="story-grain" aria-hidden="true" />
        <a className="brand brand-light" href="/" aria-label="EMS home">
          <span className="brand-mark">e</span>
          <span>ems<span className="brand-period">.</span></span>
        </a>

        <motion.div
          className="story-copy"
          initial={reduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="eyebrow eyebrow-light"><span /> PEOPLE, IN PROGRESS</p>
          <h1>Good work<br />starts with<br /><em>good people.</em></h1>
          <p className="story-description">
            A calmer place to bring your team together, make work visible, and keep the important things moving.
          </p>
          <div className="story-proof">
            <span className="proof-icon"><BadgeCheck size={17} strokeWidth={1.8} /></span>
            <span>One considered space for people and progress.</span>
          </div>
        </motion.div>

        <div className="orbit-art" aria-hidden="true">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="orbit orbit-three" />
          <span className="orbit-core">e</span>
          <span className="orbit-node orbit-node-a" />
          <span className="orbit-node orbit-node-b" />
        </div>

        <div className="story-footer">
          <span>BUILT FOR THE WAY TEAMS WORK</span>
          <span>01 — 04</span>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-panel-top">
          <span className="login-context">TEAM WORKSPACE</span>
          <span className="secure-label"><LockKeyhole size={14} /> SECURE SIGN IN</span>
        </div>

        <motion.div
          className="login-form-wrap"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.5, delay: reduceMotion ? 0 : 0.08 }}
        >
          <div className="form-heading">
            <p className="eyebrow">WELCOME BACK</p>
            <h2>Sign in to EMS</h2>
            <p>Your people and today’s priorities are right where you left them.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label htmlFor="email">Work email</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="you@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />

            <div className="password-label">
              <label htmlFor="password">Password</label>
            </div>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />

            {(formError || error) && (
              <p className="form-error" role="alert">{formError || error}</p>
            )}

            <button className="button button-primary login-submit" type="submit" disabled={submitting}>
              <span>{submitting ? 'Signing in…' : 'Continue to workspace'}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </form>

          {demoAccounts.every((account) => account.email && account.password) && (
            <section className="demo-access" aria-labelledby="demo-access-title">
              <div className="demo-access-heading">
                <div>
                  <p className="eyebrow">OPEN WORKSPACE PREVIEW</p>
                  <h3 id="demo-access-title">Try a demo account</h3>
                </div>
                <span className="demo-live-indicator"><span /> LIVE</span>
              </div>
              <p className="demo-access-note">
                Shared demo accounts — other visitors can see and change demo data.
              </p>
              <div className="demo-account-list">
                {demoAccounts.map(({ role, label, email: demoEmail, password: demoPassword, Icon }) => (
                  <button
                    key={role}
                    className="demo-account"
                    type="button"
                    onClick={() => fillDemoAccount({ email: demoEmail, password: demoPassword })}
                    aria-label={`Use ${label} credentials`}
                  >
                    <span className="demo-account-icon"><Icon size={17} aria-hidden="true" /></span>
                    <span className="demo-account-info">
                      <span className="demo-account-role">{role}</span>
                      <strong>{demoEmail}</strong>
                      <code>{demoPassword}</code>
                    </span>
                    <span className="demo-account-action">USE <ArrowRight size={13} aria-hidden="true" /></span>
                  </button>
                ))}
              </div>
            </section>
          )}

          <div className="login-security">
            <span className="security-dot" />
            <p>Your account is provisioned by your workspace administrator.</p>
          </div>
        </motion.div>

        <div className="login-legal">
          <span>© {new Date().getFullYear()} EMS</span>
          <span>PEOPLE OPERATIONS, MADE HUMAN</span>
        </div>
      </section>
    </main>
  );
}

Login.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.string,
};
