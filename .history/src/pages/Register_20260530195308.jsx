import { useState } from 'react'
import { register } from '../api'

function Register({ onRegister, goToLogin }) {
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
        username,
        email,
        password,
        isAdmin ? 'Admin' : 'Employee',
        isAdmin ? organizationName : null,
        !isAdmin ? parseInt(organizationId) : null
      )
      goToLogin()
    } catch {
      setError('حدث خطأ — جرب إيميل آخر')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#020B18' }}>

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-64 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(ellipse,#0ea5e9,transparent)', top: '-80px', right: '-80px' }} />
        <div className="absolute w-80 h-48 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(ellipse,#1e3a8a,transparent)', bottom: '-60px', left: '-60px' }} />
      </div>

      <div className="relative z-10 w-full max-w-md">
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
              <span className="font-bold text-base" style={{ color: '#e2f0ff', letterSpacing: '0.5px' }}>TaskFlow</span>
            </div>

            {/* Role Toggle */}
            <div className="relative flex rounded-xl p-1 mb-6"
              style={{ background: 'rgba(4,15,35,0.8)