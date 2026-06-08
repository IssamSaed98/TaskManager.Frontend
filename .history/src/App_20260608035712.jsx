import { useState, useEffect, useCallback } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import LanguageSwitcher from './components/LanguageSwitcher'
import Events from './pages/Events'
import { useLanguage } from './hooks/useLanguage'
import { usePushNotifications } from './hooks/usePushNotifications'
import { usePolling } from './hooks/usePolling'
import { getTasks, updateTask, getMyEventStats } from './api'

const getUserRole = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee'
  } catch { return 'Employee' }
}

const getUserName = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
           payload['name'] || 'Mitarbeiter'
  } catch { return 'Mitarbeiter' }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')
  const [activePage, setActivePage] = useState('dashboard')
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [eventStats, setEventStats] = useState({ attended: 0, pending: 0 })
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const { t, isRTL } = useLanguage()
  const { isSubscribed, isSupported, subscribe, unsubscribe } = usePushNotifications()

  const userRole = token ? getUserRole(token) : null
  const userName = token ? getUserName(token) : 'Mitarbeiter'

  useEffect(() => {
    if (token && userRole === 'Employee') {
      loadTasks()
      loadEventStats()
    }
  }, [token])

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const shown = localStorage.getItem('iosGuideShown')
    if (isIOS && !isStandalone && !shown && token) {
      setTimeout(() => setShowIOSGuide(true), 3000)
    }
  }, [token])

  const loadTasks = useCallback(async () => {
    try {
      const res = await getTasks()
      setTasks(res.data)
    } catch { } finally {
      setLoading(false)
    }
  }, [])

  const loadEventStats = useCallback(async () => {
    try {
      const res = await getMyEventStats()
      setEventStats(res.data)
    } catch { }
  }, [])

  usePolling(loadTasks, 5000, !!token && userRole === 'Employee')
  usePolling(loadEventStats, 5000, !!token && userRole === 'Employee')

  const handleToggle = async (task) => {
    try {
      await updateTask(task.id, { ...task, isCompleted: !task.isCompleted })
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t))
    } catch { }
  }

  const handleLogin = (newToken) => { setToken(newToken) }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setPage('login')
    setTasks([])
    setActivePage('dashboard')
  }

  const completedTasks = tasks.filter(t => t.isCompleted).length
  const activeTasks = tasks.filter(t => !t.isCompleted).length

  const filteredTasks = tasks.filter(task => {
    if (filter === 'active') return !task.isCompleted
    if (filter === 'completed') return task.isCompleted
    if (filter === 'high') return task.priority === 'High' && !task.isCompleted
    if (filter === 'medium') return task.priority === 'Medium' && !task.isCompleted
    if (filter === 'low') return task.priority === 'Low' && !task.isCompleted
    return true
  })

  const priorityConfig = {
    High:   { label: '🔴 Hoch',    tag: 'bg-red-900/30 text-red-300',     dot: '#f87171' },
    Medium: { label: '🟡 Mittel',  tag: 'bg-yellow-900/30 text-yellow-300', dot: '#fbbf24' },
    Low:    { label: '🟢 Niedrig', tag: 'bg-green-900/30 text-green-300',  dot: '#4ade80' },
  }

  if (!token) {
    if (page === 'register')
      return <Register onRegister={() => setPage('login')} goToLogin={() => setPage('login')} />
    return <Login onLogin={handleLogin} goToRegister={() => setPage('register')} />
  }

  if (userRole === 'Admin') return <AdminDashboard onLogout={handleLogout} />

  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'tasks',     icon: '📋', label: 'Meine Aufgaben', badge: activeTasks > 0 ? activeTasks : null },
    { key: 'events',    icon: '📅', label: 'Veranstaltungen' },
    { key: 'progress',  icon: '📊', label: 'Fortschritt' },
    { key: 'settings',  icon: '⚙️', label: 'Einstellungen' },
  ]

  const DashboardPage = () => (
    <div>
      <div className="rounded-2xl p-6 mb-6 flex items-center justify-between overflow-hidden"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', border: '0.5px solid rgba(99,102,241,0.2)' }}>
        <div>
          <h2 className="text-xl font-bold mb-1" style={{ color: '#ffffff' }}>Hallo {userName}! 👋</h2>
          <p style={{ color: '#7090b0', fontSize: 13 }}>Schön, dass du wieder da bist.</p>
          <p className="mt-2 text-xs" style={{ color: '#4a6080' }}>
            📅 {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="text-6xl opacity-40">💻</div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: '📅', num: eventStats.attended,  label: 'Events besucht',      color: '#a5b4fc', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.2)',  page: 'events' },
          { icon: '⚡', num: activeTasks,            label: 'Offene Aufgaben',     color: '#f87171', bg: 'rgba(239,68,68,0.06)',   border: 'rgba(239,68,68,0.15)',  page: 'tasks' },
          { icon: '✅', num: completedTasks,         label: 'Erledigte Aufgaben',  color: '#4ade80', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   page: 'tasks' },
          { icon: '🔔', num: eventStats.pending,     label: 'Ausstehende Events',  color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  page: 'events' },
        ].map((s, i) => (
          <div key={i} onClick={() => setActivePage(s.page)}
            className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-105"
            style={{ background: s.bg, border: `0.5px solid ${s.border}` }}>
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.num}</div>
            <div className="text-xs" style={{ color: '#7090b0' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '0.5px solid #1e2d40' }}>
          <span className="font-semibold text-sm" style={{ color: '#ffffff' }}>Letzte Aufgaben</span>
          <button onClick={() => setActivePage('tasks')} className="text-xs" style={{ color: '#a5b4fc' }}>
            Alle anzeigen →
          </button>
        </div>
        {loading ? (
          <div className="text-center py-8 text-xs" style={{ color: '#3a5070' }}>Wird geladen...</div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-xs" style={{ color: '#3a5070' }}>Keine Aufgaben vorhanden</div>
        ) : tasks.slice(0, 5).map(task => {
          const config = priorityConfig[task.priority] || priorityConfig.Medium
          return (
            <div key={task.id} className="flex items-center gap-3 px-5 py-3"
              style={{ borderBottom: '0.5px solid #0f1a27' }}>
              <button onClick={() => !task.isCompleted && handleToggle(task)}
                className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: task.isCompleted ? '#4ade80' : 'transparent',
                  borderColor: task.isCompleted ? '#4ade80' : '#1e2d40',
                  cursor: task.isCompleted ? 'default' : 'pointer'
                }}>
                {task.isCompleted && <span className="text-white" style={{ fontSize: 9 }}>✓</span>}
              </button>
              <div className="flex-1">
                <div className={`text-sm font-medium ${task.isCompleted ? 'line-through' : ''}`}
                  style={{ color: task.isCompleted ? '#4a6080' : '#ffffff' }}>
                  {task.title}
                </div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full ${config.tag}`}>{config.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )

  const TasksPage = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-sm" style={{ color: '#ffffff' }}>Meine Aufgaben</span>
        <span className="text-xs" style={{ color: '#3a5070' }}>{tasks.length} Aufgaben</span>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { key: 'all',       label: `Alle (${tasks.length})` },
          { key: 'active',    label: `Offen (${activeTasks})` },
          { key: 'high',      label: '🔴 Hoch' },
          { key: 'medium',    label: '🟡 Mittel' },
          { key: 'low',       label: '🟢 Niedrig' },
          { key: 'completed', label: `✓ Erledigt (${completedTasks})` },
        ].map(f => (
          <button key={f.key} onClick={() => setFilter(f.key)}
            className="px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
            style={{
              background: filter === f.key ? 'rgba(99,102,241,0.15)' : '#0a0f1a',
              color: filter === f.key ? '#a5b4fc' : '#4a6080',
              border: `0.5px solid ${filter === f.key ? 'rgba(99,102,241,0.3)' : '#1e2d40'}`
            }}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        {loading ? (
          <div className="text-center py-12 text-xs" style={{ color: '#3a5070' }}>Wird geladen...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-xs" style={{ color: '#3a5070' }}>Keine Aufgaben in dieser Kategorie</p>
          </div>
        ) : filteredTasks.map(task => {
          const config = priorityConfig[task.priority] || priorityConfig.Medium
          return (
            <div key={task.id}
              className="flex items-center gap-4 px-5 py-4 transition-all"
              style={{ borderBottom: '0.5px solid #0f1a27', cursor: task.isCompleted ? 'default' : 'pointer' }}
              onClick={() => !task.isCompleted && handleToggle(task)}>
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: task.isCompleted ? '#4ade80' : 'transparent',
                  borderColor: task.isCompleted ? '#4ade80' : '#1e2d40',
                }}>
                {task.isCompleted && <span className="text-white" style={{ fontSize: 11 }}>✓</span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium mb-0.5 ${task.isCompleted ? 'line-through' : ''}`}
                  style={{ color: task.isCompleted ? '#4a6080' : '#ffffff' }}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs truncate" style={{ color: '#7090b0' }}>{task.description}</div>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ${config.tag}`}>
                {config.label}
              </span>
              {task.dueDate && (
                <span className="text-xs flex-shrink-0" style={{ color: '#4a6080' }}>
                  📅 {new Date(task.dueDate).toLocaleDateString('de-DE')}
                </span>
              )}
              {task.isCompleted && (
                <span className="text-xs px-2 py-1 rounded-lg flex-shrink-0"
                  style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                  ✓ Erledigt
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )

  const ProgressPage = () => {
    const total = tasks.length
    const done = completedTasks
    const pct = total > 0 ? Math.round((done / total) * 100) : 0

    return (
      <div>
        <div className="font-semibold text-sm mb-4" style={{ color: '#ffffff' }}>Mein Fortschritt</div>
        <div className="rounded-2xl p-6 mb-4" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
          <div className="text-xs mb-2" style={{ color: '#7090b0' }}>Gesamtfortschritt</div>
          <div className="text-4xl font-bold mb-4" style={{ color: '#a5b4fc' }}>{pct}%</div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: '#1e2d40' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#4a6080' }}>
            <span>{done} erledigt</span>
            <span>{total - done} offen</span>
          </div>
        </div>
        {[
          { label: '🔴 Hohe Priorität', priority: 'High', color: '#f87171' },
          { label: '🟡 Mittlere Priorität', priority: 'Medium', color: '#fbbf24' },
          { label: '🟢 Niedrige Priorität', priority: 'Low', color: '#4ade80' },
        ].map((item, i) => {
          const pTasks = tasks.filter(t => t.priority === item.priority)
          const pDone = pTasks.filter(t => t.isCompleted).length
          const p = pTasks.length > 0 ? Math.round((pDone / pTasks.length) * 100) : 0
          return (
            <div key={i} className="rounded-2xl p-4 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#ffffff' }}>{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{p}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#1e2d40' }}>
                <div className="h-full rounded-full" style={{ width: `${p}%`, background: item.color }} />
              </div>
              <div className="text-xs" style={{ color: '#4a6080' }}>{pDone}/{pTasks.length} erledigt</div>
            </div>
          )
        })}
      </div>
    )
  }

  const SettingsPage = () => (
    <div>
      <div className="font-semibold text-sm mb-4" style={{ color: '#ffffff' }}>Einstellungen</div>
      <div className="rounded-2xl p-5 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <div className="text-xs mb-3" style={{ color: '#7090b0' }}>Sprache / Language / اللغة</div>
        <LanguageSwitcher />
      </div>
      {isSupported && (
        <div className="rounded-2xl p-5 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
          <div className="text-xs mb-3" style={{ color: '#7090b0' }}>Benachrichtigungen</div>
          <button onClick={isSubscribed ? unsubscribe : subscribe}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full"
            style={{
              background: isSubscribed ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.08)',
              color: isSubscribed ? '#4ade80' : '#a5b4fc',
              border: `0.5px solid ${isSubscribed ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)'}`,
            }}>
            {isSubscribed ? '🔔 Benachrichtigungen aktiv' : '🔕 Benachrichtigungen aktivieren'}
          </button>
        </div>
      )}
      <div className="rounded-2xl p-5" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full"
          style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
          🚪 Abmelden
        </button>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'tasks':     return <TasksPage />
      case 'events':    return <Events userRole="Employee" />
      case 'progress':  return <ProgressPage />
      case 'settings':  return <SettingsPage />
      default:          return <DashboardPage />
    }
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0d1117', direction: 'ltr' }}>

      {/* iOS Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-5"
            style={{ background: '#0a0f1a', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div className="text-center mb-4">
              <div className="text-4xl mb-3">📱</div>
              <div className="font-bold mb-2" style={{ color: '#ffffff' }}>Benachrichtigungen aktivieren</div>
              <div className="text-sm" style={{ color: '#7090b0' }}>
                Um Benachrichtigungen auf iPhone zu erhalten:
              </div>
            </div>
            <div className="flex flex-col gap-2 mb-5">
              {[
                '1. Tippe auf das Teilen-Symbol 📤',
                '2. Wähle "Zum Home-Bildschirm"',
                '3. Öffne TaskFlow vom Home-Bildschirm',
                '4. Aktiviere Benachrichtigungen in Einstellungen'
              ].map((step, i) => (
                <div key={i} className="text-xs p-2 rounded-lg" style={{ background: '#111827', color: '#7090b0' }}>
                  {step}
                </div>
              ))}
            </div>
            <button
              onClick={() => { setShowIOSGuide(false); localStorage.setItem('iosGuideShown', 'true') }}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
              Verstanden
            </button>
          </div>
        </div>
      )}

      {/* Sidebar Desktop */}
      <div className="hidden md:flex w-56 flex-col py-5 px-3 gap-1 flex-shrink-0"
        style={{ background: '#0a0f1a', borderRight: '1px solid #1e2d40' }}>
        <div className="flex items-center gap-2 px-2 pb-4 mb-2" style={{ borderBottom: '1px solid #1e2d40' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>
            ✦
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: '#ffffff' }}>TaskFlow</div>
            <div className="text-xs" style={{ color: '#3a5070' }}>Employee Portal</div>
          </div>
        </div>

        {navItems.map(item => (
          <button key={item.key} onClick={() => setActivePage(item.key)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all w-full text-left"
            style={{
              background: activePage === item.key ? 'rgba(99,102,241,0.15)' : 'transparent',
              color: activePage === item.key ? '#a5b4fc' : '#4a6080',
              border: activePage === item.key ? '0.5px solid rgba(99,102,241,0.25)' : '0.5px solid transparent',
            }}>
            <span>{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="text-xs px-1.5 py-0.5 rounded-full"
                style={{ background: '#6366f1', color: '#fff', fontSize: 9 }}>
                {item.badge}
              </span>
            )}
          </button>
        ))}

        <div className="mt-auto pt-4" style={{ borderTop: '1px solid #1e2d40' }}>
          <div className="flex items-center gap-2 px-2 py-2 rounded-xl mb-2"
            style={{ background: 'rgba(99,102,241,0.06)', border: '0.5px solid rgba(99,102,241,0.1)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
              {userName.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate" style={{ color: '#ffffff' }}>{userName}</div>
              <div className="text-xs" style={{ color: '#3a5070' }}>Mitarbeiter</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center gap-2 px-4 py-3 sticky top-0 z-50"
          style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2d40' }}>
          <span className="md:hidden font-bold text-sm" style={{ color: '#ffffff' }}>✦ TaskFlow</span>
          <div className="flex-1" />
          <div className="hidden md:block">
            <LanguageSwitcher />
          </div>
          {isSupported && (
            <button onClick={isSubscribed ? unsubscribe : subscribe}
              className="text-xs px-2 py-1 rounded-lg transition-all"
              style={{
                background: isSubscribed ? 'rgba(34,197,94,0.1)' : 'rgba(99,102,241,0.1)',
                color: isSubscribed ? '#4ade80' : '#a5b4fc',
                border: `0.5px solid ${isSubscribed ? 'rgba(34,197,94,0.2)' : 'rgba(99,102,241,0.2)'}`,
              }}>
              {isSubscribed ? '🔔' : '🔕'}
            </button>
          )}
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
            {userName.slice(0, 2).toUpperCase()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 pb-24 md:pb-6">
          {renderContent()}
        </div>

        {/* Bottom Nav Mobile */}
        <div className="md:hidden fixed bottom-0 left-0 right-0"
          style={{ background: '#0a0f1a', borderTop: '1px solid #1e2d40', paddingBottom: 'env(safe-area-inset-bottom)' }}>
          <div className="flex">
            {navItems.map(item => (
              <button key={item.key} onClick={() => setActivePage(item.key)}
                className="flex-1 flex flex-col items-center gap-1 py-2"
                style={{ background: 'transparent', border: 'none' }}>
                <span className="text-lg">{item.icon}</span>
                <span style={{ color: activePage === item.key ? '#a5b4fc' : '#3a5070', fontSize: 9 }}>
                  {item.label}
                </span>
                {activePage === item.key && (
                  <div className="w-1 h-1 rounded-full" style={{ background: '#6366f1' }}></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App