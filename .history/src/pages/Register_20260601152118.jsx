import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { register } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitcher from '../components/LanguageSwitcher'
import cheff from '../images/businessman.png'
import mitAr from '../images/user.png'
import { space } from 'postcss/lib/list'
function Register({ onRegister, goToLogin }) {
  const { t, isRTL } = useLanguage()
  const [role, setRole] = useState('employee')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [organizationName, setOrganizationName] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [particles, setParticles] = useState([])

  const isAdmin = role === 'admin'

  useEffect(() => {
    setParticles(Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 6 + 4,
      delay: Math.random() * 3,
    })))
  }, [])

  const handleRegister = async () => {
    if (!username || !email || !password) return
    if (isAdmin && !organizationName) return
    if (!isAdmin && !organizationId) return
    try {
      setLoading(true)
      setError('')
      await register(
        username, email, password,
        isAdmin ? 'Admin' : 'Employee',
        isAdmin ? organizationName : null,
        !isAdmin ? parseInt(organizationId) : null
      )
      goToLogin()
    } catch {
      setError(t('error_email'))
    } finally {
      setLoading(false)
    }
  }

  const getFieldStyle = (field) => ({
    background: 'rgba(2,11,26,0.6)',
    border: `1px solid ${focusedField === field ? 'rgba(34,184,255,0.6)' : 'rgba(34,184,255,0.1)'}`,
    boxShadow: focusedField === field ? '0 0 15px rgba(34,184,255,0.12)' : 'none',
    transition: 'all 0.15s ease',
  })

    const myStyleSecond = {
    width: '16px',
    height: '16px',
   
}
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start overflow-y-auto relative"
      style={{
        background: 'linear-gradient(160deg, #020B1A 0%, #031B3D 50%, #041C45 100%)',
        direction: isRTL ? 'rtl' : 'ltr'
      }}
    >
      {/* Particles — خفيفة وسريعة */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: '#22B8FF' }}
          animate={{ y: [0, -20, 0], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        {[300, 500].map((size, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{ width: size, height: size, border: '1px solid rgba(34,184,255,0.05)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 40 + i * 10, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(34,184,255,0.1) 0%, transparent 70%)', filter: 'blur(30px)' }} />

      {/* Language */}
      <div className="absolute top-4 left-4 z-20">
        <LanguageSwitcher />
      </div>

      <div className="w-full max-w-sm px-4 pt-14 pb-8 z-10">

        {/* Logo */}
        <motion.div
          className="flex flex-col items-center mb-6"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(34,184,255,0.2), rgba(14,165,233,0.1))',
              border: '1px solid rgba(34,184,255,0.3)',
              boxShadow: '0 0 25px rgba(34,184,255,0.2)',
            }}
          >
            <span style={{ fontSize: 24 }}>✦</span>
          </div>
          <h1 className="text-2xl font-bold">
            <span className="text-white">Task</span>
            <span style={{ color: '#22B8FF' }}>Flow</span>
          </h1>
        </motion.div>

        {/* Glass Card */}
        <div
          className="rounded-3xl p-5"
          style={{
            background: 'rgba(3,27,61,0.65)',
            border: '1px solid rgba(34,184,255,0.15)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 0 40px rgba(34,184,255,0.07), 0 20px 60px rgba(0,0,0,0.5)',
          }}
        >
          {/* Tab Switch */}
          <div className="flex rounded-2xl p-1 mb-5 gap-1"
            style={{ background: 'rgba(2,11,26,0.6)', border: '1px solid rgba(34,184,255,0.1)' }}>
            <button
              onClick={goToLogin}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium"
              style={{ background: 'transparent', color: 'rgba(148,180,220,0.5)' }}>
              {t('sign_in')}
            </button>
            <button
              className="flex-1 py-2.5 rounded-xl text-sm font-bold"
              style={{
                background: 'linear-gradient(135deg,#22B8FF,#0EA5E9)',
                color: '#fff',
                boxShadow: '0 0 15px rgba(34,184,255,0.3)',
              }}>
              {t('sign_up')}
            </button>
          </div>

          {/* Role buttons — بسيطة بدون انيميشن */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setRole('employee')}
              className="flex-1 py-2 rounded-xl text-xs font-medium"
              style={{
                background: !isAdmin ? 'rgba(34,184,255,0.15)' : 'rgba(2,11,26,0.4)',
                border: `1px solid ${!isAdmin ? 'rgba(34,184,255,0.4)' : 'rgba(34,184,255,0.08)'}`,
                color: !isAdmin ? '#22B8FF' : 'rgba(148,180,220,0.4)',
                display: 'flex',
               
                justifyContent: 'space-around',
               
              }}>
                 <img src={mitAr} style={myStyleSecond}/>
               {t('employee')}
            </button>
            <button
              onClick={() => setRole('admin')}
              className="flex-1 py-2 rounded-xl text-xs font-medium"
              style={{
                background: isAdmin ? 'rgba(34,184,255,0.15)' : 'rgba(2,11,26,0.4)',
                border: `1px solid ${isAdmin ? 'rgba(34,184,255,0.4)' : 'rgba(34,184,255,0.08)'}`,
                color: isAdmin ? '#22B8FF' : 'rgba(148,180,220,0.4)',
              }}>
            <img src={cheff} style={myStyleSecond}/> {t('admin')}
            </button>
          </div>

          {/* Username */}
          <div className="mb-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={getFieldStyle('username')}>
              <span style={{ color: focusedField === 'username' ? '#22B8FF' : '#3a5070', fontSize: 14 }}> <img src={mitAr} style={myStyleSecond}/></span>
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onFocus={() => setFocusedField('username')}
                onBlur={() => setFocusedField(null)}
                placeholder={t('username')}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#c0d8f0', fontFamily: 'inherit' }}
              />
            </div>
          </div>

          {/* Email */}
          <div className="mb-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={getFieldStyle('email')}>
              <span style={{ color: focusedField === 'email' ? '#22B8FF' : '#3a5070', fontSize: 14 }}>✉</span>
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
          <div className="mb-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={getFieldStyle('password')}>
              <span style={{ color: focusedField === 'password' ? '#22B8FF' : '#3a5070', fontSize: 14 }}>🔒</span>
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
              <button onClick={() => setShowPassword(!showPassword)} style={{ color: '#3a5070', fontSize: 14 }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Org */}
          <div className="mb-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
              style={getFieldStyle('org')}>
              <span style={{ color: focusedField === 'org' ? '#22B8FF' : '#3a5070', fontSize: 14 }}>🏢</span>
              <input
                type={isAdmin ? 'text' : 'number'}
                value={isAdmin ? organizationName : organizationId}
                onChange={e => isAdmin ? setOrganizationName(e.target.value) : setOrganizationId(e.target.value)}
                onFocus={() => setFocusedField('org')}
                onBlur={() => setFocusedField(null)}
                placeholder={isAdmin ? t('organization_name') : t('organization_id')}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: '#c0d8f0', fontFamily: 'inherit' }}
              />
            </div>
            {!isAdmin && (
              <p className="text-xs mt-1 px-1" style={{ color: 'rgba(148,180,220,0.35)' }}>{t('org_id_hint')}</p>
            )}
          </div>

          {/* Terms */}
          <button
            onClick={() => setAgreed(!agreed)}
            className="flex items-center gap-2 text-xs mb-4 w-full"
            style={{ color: '#4a6080' }}>
            <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
              style={{
                background: agreed ? '#22B8FF' : 'transparent',
                border: `1px solid ${agreed ? '#22B8FF' : '#1e2d40'}`,
                transition: 'all 0.15s ease'
              }}>
              {agreed && <span className="text-white" style={{ fontSize: 10 }}>✓</span>}
            </div>
            {t('terms')}
          </button>

          {error && (
            <p className="text-xs text-center mb-3" style={{ color: '#f87171' }}>{error}</p>
          )}

          {/* Register Button */}
          <motion.button
            onClick={handleRegister}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl text-white font-bold text-sm mb-4"
            style={{
              background: 'linear-gradient(135deg, #22B8FF, #0EA5E9)',
              boxShadow: '0 0 25px rgba(34,184,255,0.3)',
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? '...' : t('sign_up')}
          </motion.button>

          {/* Login link */}
          <p className="text-center text-xs" style={{ color: '#3a5070' }}>
            {t('have_account')}{' '}
            <button onClick={goToLogin} style={{ color: '#22B8FF', fontWeight: 600 }}>
              {t('sign_in_now')}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register