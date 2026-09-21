import { useRef, useState } from 'react'
import { auth } from '../api'

const BLANK = { name: '', email: '', password: '', confirmPassword: '' }
const EMAIL_RE = /^\S+@\S+\.\S+$/

function validate(mode, form) {
  const errors = {}
  if (mode === 'register' && !form.name.trim()) errors.name = 'Enter your name'
  if (!form.email.trim()) errors.email = 'Enter your email address'
  else if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Enter a valid email address'
  if (!form.password) errors.password = 'Enter your password'
  else if (mode === 'register' && form.password.length < 8) errors.password = 'Use at least 8 characters'
  if (mode === 'register' && form.confirmPassword !== form.password) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(BLANK)
  const [touched, setTouched] = useState({})
  const [serverError, setServerError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const summaryRef = useRef(null)

  const errors = validate(mode, form)

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  const blur = (e) => setTouched((t) => ({ ...t, [e.target.name]: true }))

  const switchMode = (next) => {
    setMode(next)
    setForm(BLANK)
    setTouched({})
    setServerError('')
  }

  const submit = async (e) => {
    e.preventDefault()
    setTouched({ name: true, email: true, password: true, confirmPassword: true })
    setServerError('')

    if (Object.keys(errors).length > 0) {
      summaryRef.current?.focus()
      return
    }

    setLoading(true)
    try {
      const user =
        mode === 'login'
          ? await auth.login({ email: form.email.trim(), password: form.password })
          : await auth.register({ name: form.name.trim(), email: form.email.trim(), password: form.password })
      onAuthenticated(user)
    } catch (err) {
      setServerError(err.response?.data?.message || 'That request failed. Try again.')
      summaryRef.current?.focus()
    } finally {
      setLoading(false)
    }
  }

  const fieldError = (name) => (touched[name] && errors[name] ? errors[name] : '')

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit} noValidate>
        <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        <p className="muted">
          {mode === 'login' ? 'Sign in to manage your tasks.' : 'Set up an account to start tracking tasks.'}
        </p>

        {serverError && (
          <div className="error" role="alert" tabIndex={-1} ref={summaryRef}>
            {serverError}
          </div>
        )}

        {mode === 'register' && (
          <label>
            Name
            <input
              name="name"
              value={form.name}
              onChange={change}
              onBlur={blur}
              autoComplete="name"
              aria-invalid={Boolean(fieldError('name'))}
              aria-describedby={fieldError('name') ? 'name-error' : undefined}
            />
            {fieldError('name') && (
              <span className="field-error" id="name-error">
                {fieldError('name')}
              </span>
            )}
          </label>
        )}

        <label>
          Email
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={change}
            onBlur={blur}
            autoComplete="email"
            aria-invalid={Boolean(fieldError('email'))}
            aria-describedby={fieldError('email') ? 'email-error' : undefined}
          />
          {fieldError('email') && (
            <span className="field-error" id="email-error">
              {fieldError('email')}
            </span>
          )}
        </label>

        <label>
          Password
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={change}
              onBlur={blur}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              aria-invalid={Boolean(fieldError('password'))}
              aria-describedby={fieldError('password') ? 'password-error' : undefined}
            />
            <button
              type="button"
              className="ghost"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          {fieldError('password') && (
            <span className="field-error" id="password-error">
              {fieldError('password')}
            </span>
          )}
        </label>

        {mode === 'register' && (
          <label>
            Confirm password
            <input
              type={showPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={change}
              onBlur={blur}
              autoComplete="new-password"
              aria-invalid={Boolean(fieldError('confirmPassword'))}
              aria-describedby={fieldError('confirmPassword') ? 'confirm-error' : undefined}
            />
            {fieldError('confirmPassword') && (
              <span className="field-error" id="confirm-error">
                {fieldError('confirmPassword')}
              </span>
            )}
          </label>
        )}

        <button className="primary" disabled={loading}>
          {loading ? (mode === 'login' ? 'Signing in…' : 'Creating account…') : mode === 'login' ? 'Sign in' : 'Create account'}
        </button>

        <p className="muted switch">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button type="button" className="link" onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </form>
    </main>
  )
}
