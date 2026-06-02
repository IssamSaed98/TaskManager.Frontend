import { useState } from 'react'
import { register } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitcher from '../components/LanguageSwitcher'

function Register({ onRegister, goToLogin }) {
  const { t, isRTL } = useLanguage()
  const [role, setRole] = useState('employee')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [organizationId, setOrganizationId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdmin = role === 'admin'

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

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: '#020B18', direction: isRTL ? 'rtl' : 'ltr' }}>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(ellipse,#0ea5e9,transparent)', top: '-80px', right: '-80px' }} />
        <div className="absolute w-80 h-48 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(ellipse,#1e3a8a,transparent)', bottom: '-60px', left: '-60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">

        <div className="flex justify-center mb-4">
          <LanguageSwitcher />
        </div>

        <div className="rounded-2xl overflow-hidden border"
          style={{ background: 'linear-gradient(160deg,#060D1B,#050A14)', borderColor: 'rgba(14,165,233,0.08)' }}>

          <div className="h-px w-full overflow-hidden" style={{ background: 'rgba(14,165,233,0.06)' }}>
            <div className="h-full w-full"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(14,165,233,0.6),transparent)', animation: 'shimmer 3s infinite' }} />
          </div>

          <div className="p-9">

            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all duration-700"
                style={{ background: isAdmin ? 'linear-gradient(135deg,#1e3a5f,#2563eb)' : 'linear-gradient(135deg,#0c4a6e,#0ea5e9)', boxShadow: isAdmin ? '0 0 16px rgba(37,99,235,0.35)' : '0 0 16px rgba(14,165,233,0.3)' }}>
                ✦
              </div>
              <span className="font-bold text-base" style={{ color: '#e2f0ff' }}>TaskFlow</span>
            </div>

            <div className="relative flex rounded-xl p-1 mb-6"
              style={{ background: 'rgba(4,15,35,0.8)', border: '1px solid rgba(14,165,233,0.08)' }}>
              <div className="absolute top-1 bottom-1 rounded-lg transition-all"
                style={{
                  width: 'calc(50% - 4px)',
                  right: isAdmin ? 'calc(50%)' : '4px',
                  background: isAdmin ? 'linear-gradient(135deg,#1e3a5f,#2563eb)' : 'linear-gradient(135deg,#0c4a6e,#0ea5e9)',
                  boxShadow: isAdmin ? '0 0 16px rgba(37,99,235,0.5)' : '0 0 16px rgba(14,165,233,0.5)',
                  transition: 'right 0.55s cubic-bezier(0.23,1,0.32,1), background 0.7s ease'
                }} />
              <button onClick={() => setRole('employee')}
                className="flex-1 py-2 text-xs font-medium relative z-10 flex items-center justify-center gap-1"
                style={{ color: !isAdmin ? '#e2f0ff' : 'rgba(14,165,233,0.25)', transition: 'color 0.4s' }}>
                👤 {t('employee')}
              </button>
              <button onClick={() => setRole('admin')}
                className="flex-1 py-2 text-xs font-medium relative z-10 flex items-center justify-center gap-1"
                style={{ color: isAdmin ? '#e2f0ff' : 'rgba(14,165,233,0.25)', transition: 'color 0.4s' }}>
                👑 {t('admin')}
              </button>
            </div>

            <div className="mb-5">
              <h2 className="text-xl font-bold mb-1" style={{ color: '#e2f0ff' }}>
                {isAdmin ? t('admin_account') : t('new_account')}
              </h2>
              <p className="text-xs" style={{ color: 'rgba(14,165,233,0.35)' }}>{t('join_us')}</p>
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(14,165,233,0.35)', letterSpacing: '0.8px' }}>{t('username')}</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                placeholder="Issam Saed"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(4,15,35,0.6)', border: '1px solid rgba(14,165,233,0.08)', color: '#7dd3fc', fontFamily: 'inherit' }} />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(14,165,233,0.35)', letterSpacing: '0.8px' }}>{t('email')}</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="issam@example.com"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(4,15,35,0.6)', border: '1px solid rgba(14,165,233,0.08)', color: '#7dd3fc', fontFamily: 'inherit' }} />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(14,165,233,0.35)', letterSpacing: '0.8px' }}>{t('password')}</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(4,15,35,0.6)', border: '1px solid rgba(14,165,233,0.08)', color: '#7dd3fc', fontFamily: 'inherit' }} />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2" style={{ color: 'rgba(14,165,233,0.35)', letterSpacing: '0.8px' }}>
                {isAdmin ? t('organization_name') : t('organization_id')}
              </label>
              <input
                type={isAdmin ? 'text' : 'number'}
                value={isAdmin ? organizationName : organizationId}
                onChange={e => isAdmin ? setOrganizationName(e.target.value) : setOrganizationId(e.target.value)}
                placeholder={isAdmin ? 'Muster GmbH' : '1'}
                className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                style={{ background: 'rgba(4,15,35,0.6)', border: '1px solid rgba(14,165,233,0.08)', color: '#7dd3fc', fontFamily: 'inherit' }} />
              {!isAdmin && (
                <p className="text-xs mt-1" style={{ color: 'rgba(14,165,233,0.25)' }}>{t('org_id_hint')}</p>
              )}
            </div>

            {error && <p className="text-red-400 text-xs mb-3 text-center">{error}</p>}

            <button onClick={handleRegister} disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{
                background: isAdmin ? 'linear-gradient(135deg,#1e3a5f,#2563eb)' : 'linear-gradient(135deg,#0c4a6e,#0ea5e9)',
                color: '#e2f0ff',
                boxShadow: isAdmin ? '0 0 22px rgba(37,99,235,0.22)' : '0 0 22px rgba(14,165,233,0.22)',
              }}>
              {loading ? t('creating') : t('sign_up')}
            </button>

            <p className="text-center mt-4 text-xs" style={{ color: 'rgba(14,165,233,0.2)' }}>
              {t('have_account')}{' '}
              <span onClick={goToLogin} className="cursor-pointer" style={{ color: '#38bdf8' }}>
                {t('sign_in_now')}
              </span>
            </p>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
      `}</style>
    </div>
  )
}

export default Register