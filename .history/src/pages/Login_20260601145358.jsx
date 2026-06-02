import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { login } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitcher from '../components/LanguageSwitcher'
import passImage from '../images/password.png'

function Login({ onLogin, goToRegister }) {
  const { t, isRTL } = useLanguage()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [particles, setParticles] = useState([])

  useEffect(() => {
    setParticles(Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 4,
      delay: Math.random() * 4,
    })))
  }, [])

  const handleLogin = async () => {
    if (!email || !password) return
    try {
      setLoading(true)
      setError('')
      const response = await login(email, password)
      localStorage.setItem('token', response.data.token)
      onLogin(response.data.token)
    } catch {
      setError(t('error_login'))
    } finally {
      setLoading(false)
    }
  }

  const myStyle = {
    width: '10px',
    height: '10px',
   
}
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start overflow-hidden relative"
      style={{ background: 'linear-gradient(160deg, #020B1A 0%, #031B3D 50%, #041C45 100%)', direction: isRTL ? 'rtl' : 'ltr' }}
    >
      {/* Particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: '#22B8FF', opacity: 0.3 }}
          animate={{ y: [0, -30, 0], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[300, 500, 700].map((size, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: size, height: size, border: '1px solid rgba(34,184,255,0.06)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,184,255,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />

      {/* Language switcher */}
      <div className="absolute top-4 left-4 z-20">
        <LanguageSwitcher />
      </div>

      <motion.div
        className="w-full max-w-sm px-4 pt-16 pb-8 z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-8"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <motion.div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: 'linear-gradient(135deg, rgba(34,184,255,0.2), rgba(14,165,233,0.1))',
              border: '1px solid rgba(34,184,255,0.3)',
              boxShadow: '0 0 30px rgba(34,184,255,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <span style={{ fontSize: 28 }}>✦</span>
          </motion.div>
          <h1 className="text-3xl font-bold">
            <span className="text-white">Task</span>
            <span style={{ color: '#22B8FF' }}>Flow</span>
          </h1>
        </motion.div>

        {/* Welcome */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">{t('welcome_back')}</h2>
          <p className="text-sm" style={{ color: 'rgba(148,180,220,0.7)' }}>
            {t('join_us')}
          </p>
        </div>

        {/* Glass Card */}
        <motion.div
          className="rounded-3xl p-6"
          style={{
            background: 'rgba(3,27,61,0.6)',
            border: '1px solid rgba(34,184,255,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(34,184,255,0.08), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Tab Switch */}
          <div className="flex rounded-2xl p-1 mb-6 gap-1"
            style={{ background: 'rgba(2,11,26,0.6)', border: '1px solid rgba(34,184,255,0.1)' }}>
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={{
                background: 'linear-gradient(135deg,#22B8FF,#0EA5E9)',
                color: '#fff',
                boxShadow: '0 0 20px rgba(34,184,255,0.3)',
              }}>
              {t('sign_in')}
            </button>
            <button
              onClick={goToRegister}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{ background: 'transparent', color: 'rgba(148,180,220,0.5)' }}>
              {t('sign_up')}
            </button>
          </div>

          {/* Email */}
          <div className="mb-4">
            {/* Email */}

  <div
    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
    style={{
      background: 'rgba(2,11,26,0.6)',
      border: `1px solid ${focusedField === 'email' ? 'rgba(34,184,255,0.6)' : 'rgba(34,184,255,0.1)'}`,
      boxShadow: focusedField === 'email' ? '0 0 15px rgba(34,184,255,0.12)' : 'none',
      transition: 'all 0.15s ease',
    }}
  >
    <span style={{ color: focusedField === 'email' ? '#22B8FF' : '#3a5070' }}>✉</span>
    <input
      type="email"
      value={email}
      onChange={e => setEmail(e.target.value)}
      onFocus={() => setFocusedField('email')}
      onBlur={() => setFocusedField(null)}
      placeholder={t('email')}
      className="flex-1 bg-transparent outline-none text-sm"
      style={{ color: '#c0d8f0', fontFamily: 'inherit' }}
    />
  </div>
</div>
        

          {/* Password */}
          {/* Password */}
<div className="mb-4">
  <div
    className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
    style={{
      background: 'rgba(2,11,26,0.6)',
      border: `1px solid ${focusedField === 'password' ? 'rgba(34,184,255,0.6)' : 'rgba(34,184,255,0.1)'}`,
      boxShadow: focusedField === 'password' ? '0 0 15px rgba(34,184,255,0.12)' : 'none',
      transition: 'all 0.15s ease',
    }}
  >
    <span style={{ color: focusedField === 'password' ? '#22B8FF' : '#3a5070' }}>
      <img src={passImage} className='passImage' style={width="5px"}/></span>
    <input
      type={showPassword ? 'text' : 'password'}
      value={password}
      onChange={e => setPassword(e.target.value)}
      onFocus={() => setFocusedField('password')}
      onBlur={() => setFocusedField(null)}
      placeholder={t('password')}
      className="flex-1 bg-transparent outline-none text-sm"
      style={{ color: '#c0d8f0', fontFamily: 'inherit' }}
    />
    <button onClick={() => setShowPassword(!showPassword)} style={{ color: '#3a5070' }}>
      {showPassword ? '🙈' : '👁'}
    </button>
  </div>
</div>

          {/* Remember + Forgot */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setRemember(!remember)}
              className="flex items-center gap-2 text-xs"
              style={{ color: '#4a6080' }}>
              <div className="w-4 h-4 rounded flex items-center justify-center"
                style={{ background: remember ? '#22B8FF' : 'transparent', border: `1px solid ${remember ? '#22B8FF' : '#1e2d40'}` }}>
                {remember && <span className="text-white" style={{ fontSize: 10 }}>✓</span>}
              </div>
              {t('remember_me')}
            </button>
            <button className="text-xs" style={{ color: '#22B8FF' }}>
              {t('forgot_password')}
            </button>
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-center mb-4"
              style={{ color: '#f87171' }}>
              {error}
            </motion.p>
          )}

          {/* Login Button */}
          <motion.button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-sm mb-5"
            style={{
              background: 'linear-gradient(135deg, #22B8FF, #0EA5E9)',
              boxShadow: '0 0 30px rgba(34,184,255,0.3)',
            }}
            whileHover={{ scale: 1.03, boxShadow: '0 0 40px rgba(34,184,255,0.5)' }}
            whileTap={{ scale: 0.97 }}
          >
            {loading ? '...' : t('sign_in')}
          </motion.button>

          {/* Register link */}
          <p className="text-center text-xs" style={{ color: '#3a5070' }}>
            {t('no_account')}{' '}
            <button onClick={goToRegister} style={{ color: '#22B8FF', fontWeight: 600 }}>
              {t('register_now')}
            </button>
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default Login