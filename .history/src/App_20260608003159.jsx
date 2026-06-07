import { useState, useEffect, useCallback } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import LanguageSwitcher from './components/LanguageSwitcher'
import Events from './pages/Events'
import { useLanguage } from './hooks/useLanguage'
import { usePushNotifications } from './hooks/usePushNotifications'
import { getTasks, updateTask } from './api'
import { usePolling } from './hooks/usePolling'
import { getTasks, updateTask, getMyEventStats } from './api'

const getUserRole = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee'
  } catch { return 'Employee' }
}

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')
  const [activePage, setActivePage] = useState('dashboard')
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const { t, isRTL } = useLanguage()
  const { isSubscribed, isSupported, subscribe, unsubscribe } = usePushNotifications()

  const userRole = token ? getUserRole(token) : null

  const getUserName = () => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      return payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
             payload['name'] || 'Mitarbeiter'
    } catch { return 'Mitarbeiter' }
  }

  useEffect(() => {
    if (token && userRole === 'Employee') loadTasks()
  }, [token])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const res = await getTasks()
      setTasks(res.data)
    } catch { } finally { setLoading(false) }
  }
// Polling كل 5 ثوان
usePolling(loadTasks, 5000, !!token && userRole === 'Employee')




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
    High:   { label: '🔴 Hoch',   tag: 'bg-red-900/30 text-red-300',    dot: '#f87171' },
    Medium: { label: '🟡 Mittel', tag: 'bg-yellow-900/30 text-yellow-300', dot: '#fbbf24' },
    Low:    { label: '🟢 Niedrig',tag: 'bg-green-900/30 text-green-300', dot: '#4ade80' },
  }

  if (!token) {
    if (page === 'register')
      return <Register onRegister={() => setPage('login')} goToLogin={() => setPage('login')} />
    return <Login onLogin={handleLogin} goToRegister={() => setPage('register')} />
  }

  if (userRole === 'Admin') return <AdminDashboard onLogout={handleLogout} />

  // ── Employee Portal ──
  const navItems = [
    { key: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { key: 'tasks',     icon: '📋', label: 'Meine Aufgaben', badge: activeTasks > 0 ? activeTasks : null },
    { key: 'events',    icon: '📅', label: 'Veranstaltungen' },
    { key: 'progress',  icon: '📊', label: 'Mein Fortschritt' },
  ]

  const renderContent = () => {
    switch (activePage) {
      case 'dashboard': return <DashboardPage />
      case 'tasks':     return <TasksPage />
      case 'events':    return <Events userRole="Employee" />
      case 'progress':  return <ProgressPage />
      case 'settings': return <SettingsPage />
      default:          return <DashboardPage />
    }
  }



  const SettingsPage = () => (
    <div>
      <div className="font-semibold text-white text-sm mb-4">Einstellungen</div>
      <div className="rounded-2xl p-5 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <div className="text-xs mb-3" style={{ color: '#3a5070' }}>Sprache / Language / اللغة</div>
        <LanguageSwitcher />
      </div>
      <div className="rounded-2xl p-5 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <div className="text-xs mb-3" style={{ color: '#3a5070' }}>Benachrichtigungen</div>
        {isSupported && (
          <button onClick={isSubscribed ? unsubscribe : subscribe}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full"
            style={{
              background: isSubscribed ? 'rgba(34,197,94,0.08)' : 'rgba(14,165,233,0.08)',
              color: isSubscribed ? '#4ade80' : '#60a5fa',
              border: `0.5px solid ${isSubscribed ? 'rgba(34,197,94,0.2)' : 'rgba(14,165,233,0.2)'}`,
            }}>
            {isSubscribed ? '🔔 Benachrichtigungen aktiv' : '🔕 Benachrichtigungen aktivieren'}
          </button>
        )}
      </div>
      <div className="rounded-2xl p-5" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm w-full"
          style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
          🚪 Abmelden
        </button>
      </div>
    </div>
  )




  const DashboardPage = () => {
    const [eventStats, setEventStats] = useState({ attended: 0, pending: 0 })
  
    useEffect(() => {
      getMyEventStats().then(res => setEventStats(res.data)).catch(() => {})
    }, [])
  
    usePolling(() => {
      return getMyEventStats().then(res => setEventStats(res.data)).catch(() => {})
    }, 5000, true)
  
    return (
      <div>
        {/* Welcome Banner */}
        <div className="rounded-2xl p-6 mb-6 flex items-center justify-between overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))', border: '0.5px solid rgba(99,102,241,0.2)' }}>
          <div>
            <h2 className="text-xl font-bold text-white mb-1">Hallo {getUserName()}! 👋</h2>
            <p style={{ color: '#7090b0', fontSize: 13 }}>Schön, dass du wieder da bist.</p>
            <p className="mt-2 text-xs" style={{ color: '#3a5070' }}>
              📅 {new Date().toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="text-6xl opacity-50">💻</div>
        </div>
  
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '📅', num: eventStats.attended, label: 'Events besucht', color: '#a5b4fc', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', page: 'events' },
            { icon: '⚡', num: activeTasks, label: 'Offene Aufgaben', color: '#f87171', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.15)', page: 'tasks' },
            { icon: '✅', num: completedTasks, label: 'Erledigte Aufgaben', color: '#4ade80', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', page: 'tasks' },
            { icon: '🔔', num: eventStats.pending, label: 'Ausstehende Events', color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', page: 'events' },
          ].map((s, i) => (
            <div key={i} onClick={() => setActivePage(s.page)}
              className="rounded-2xl p-4 cursor-pointer transition-all hover:scale-105"
              style={{ background: s.bg, border: `0.5px solid ${s.border}` }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="text-2xl font-bold mb-1" style={{ color: s.color }}>{s.num}</div>
              <div className="text-xs" style={{ color: '#4a7090' }}>{s.label}</div>
            </div>
          ))}
        </div>
  
        {/* Recent Tasks */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
          <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: '0.5px solid #1e2d40' }}>
            <span className="font-semibold text-white text-sm">Meine Aufgaben</span>
            <button onClick={() => setActivePage('tasks')} className="text-xs" style={{ color: '#6366f1' }}>
              Alle anzeigen →
            </button>
          </div>
          {tasks.slice(0, 5).map(task => {
            const config = priorityConfig[task.priority] || priorityConfig.Medium
            return (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3 transition-all"
                style={{ borderBottom: '0.5px solid #0f1a27' }}>
                <button onClick={() => handleToggle(task)}
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                  style={{
                    background: task.isCompleted ? '#4ade80' : 'transparent',
                    borderColor: task.isCompleted ? '#4ade80' : '#1e2d40',
                  }}>
                  {task.isCompleted && <span className="text-white" style={{ fontSize: 10 }}>✓</span>}
                </button>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${task.isCompleted ? 'line-through' : ''}`}
                    style={{ color: task.isCompleted ? '#3a5070' : '#e2f0ff' }}>
                    {task.title}
                  </div>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${config.tag}`}>{config.label}</span>
                {task.dueDate && (
                  <span className="text-xs" style={{ color: '#3a5070' }}>
                    📅 {new Date(task.dueDate).toLocaleDateString('de-DE')}
                  </span>
                )}
              </div>
            )
          })}
          {tasks.length === 0 && !loading && (
            <div className="text-center py-8 text-xs" style={{ color: '#3a5070' }}>Keine Aufgaben vorhanden</div>
          )}
        </div>
      </div>
    )
  }
  const TasksPage = () => (
    <div>
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-white text-sm">Meine Aufgaben</span>
        <span className="text-xs" style={{ color: '#3a5070' }}>{tasks.length} Aufgaben</span>
      </div>

      {/* Filter tabs */}
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

      {/* Tasks list */}
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
              className="flex items-center gap-4 px-5 py-4 transition-all cursor-pointer group"
              style={{ borderBottom: '0.5px solid #0f1a27' }}
              onClick={() => !task.isCompleted && handleToggle(task)}>

              {/* Circle check */}
              <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all"
                style={{
                  background: task.isCompleted ? '#4ade80' : 'transparent',
                  borderColor: task.isCompleted ? '#4ade80' : '#1e2d40',
                  boxShadow: !task.isCompleted ? '0 0 0 0 rgba(99,102,241,0)' : 'none',
                }}
                title={task.isCompleted ? 'Erledigt' : 'Als erledigt markieren'}>
                {task.isCompleted && <span className="text-white" style={{ fontSize: 11 }}>✓</span>}
              </div>

              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium mb-0.5 ${task.isCompleted ? 'line-through' : ''}`}
                  style={{ color: task.isCompleted ? '#3a5070' : '#e2f0ff' }}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs truncate" style={{ color: '#4a6080' }}>{task.description}</div>
                )}
              </div>

              <span className={`text-xs px-2 py-1 rounded-lg font-medium flex-shrink-0 ${config.tag}`}>
                {config.label}
              </span>

              {task.dueDate && (
                <span className="text-xs flex-shrink-0" style={{ color: '#3a5070' }}>
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
    const highDone = tasks.filter(t => t.priority === 'High' && t.isCompleted).length
    const medDone = tasks.filter(t => t.priority === 'Medium' && t.isCompleted).length
    const lowDone = tasks.filter(t => t.priority === 'Low' && t.isCompleted).length

    return (
      <div>
        <div className="font-semibold text-white text-sm mb-4">Mein Fortschritt</div>

        {/* Overall */}
        <div className="rounded-2xl p-6 mb-4" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
          <div className="text-xs mb-2" style={{ color: '#3a5070' }}>Gesamtfortschritt</div>
          <div className="text-4xl font-bold mb-4" style={{ color: '#a5b4fc' }}>{pct}%</div>
          <div className="h-3 rounded-full overflow-hidden mb-2" style={{ background: '#1e2d40' }}>
            <div className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }} />
          </div>
          <div className="flex justify-between text-xs" style={{ color: '#3a5070' }}>
            <span>{done} erledigt</span>
            <span>{total - done} offen</span>
          </div>
        </div>

        {/* By priority */}
        {[
          { label: '🔴 Hohe Priorität', done: highDone, total: tasks.filter(t => t.priority === 'High').length, color: '#f87171' },
          { label: '🟡 Mittlere Priorität', done: medDone, total: tasks.filter(t => t.priority === 'Medium').length, color: '#fbbf24' },
          { label: '🟢 Niedrige Priorität', done: lowDone, total: tasks.filter(t => t.priority === 'Low').length, color: '#4ade80' },
        ].map((item, i) => {
          const p = item.total > 0 ? Math.round((item.done / item.total) * 100) : 0
          return (
            <div key={i} className="rounded-2xl p-4 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm" style={{ color: '#c0d8f0' }}>{item.label}</span>
                <span className="text-sm font-bold" style={{ color: item.color }}>{p}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-1" style={{ background: '#1e2d40' }}>
                <div className="h-full rounded-full" style={{ width: `${p}%`, background: item.color }} />
              </div>
              <div className="text-xs" style={{ color: '#3a5070' }}>{item.done}/{item.total} erledigt</div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex min-h-screen" style={{ background: '#0d1117', direction: 'ltr' }}>

      {/* Sidebar — Desktop */}
      <div className="hidden md:flex w-56 flex-col py-5 px-3 gap-1 flex-shrink-0"
        style={{ background: '#0a0f1a', borderRight: '1px solid #1e2d40' }}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pb-4 mb-2" style={{ borderBottom: '1px solid #1e2d40' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 12px rgba(99,102,241,0.4)' }}>
            ✦
          </div>
          <div>
            <div className="font-bold text-white text-sm">TaskFlow</div>
            <div className="text-xs" style={{ color: '#3a5070' }}>Employee Portal</div>
          </div>
        </div>

        {/* Nav */}
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

        {/* Bottom */}
        <div className="mt-auto pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid #1e2d40' }}>
          <LanguageSwitcher />
          {isSupported && (
            <button onClick={isSubscribed ? unsubscribe : subscribe}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
              style={{
                background: isSubscribed ? 'rgba(34,197,94,0.08)' : 'transparent',
                color: isSubscribed ? '#4ade80' : '#4a6080',
                border: `0.5px solid ${isSubscribed ? 'rgba(34,197,94,0.2)' : 'transparent'}`,
              }}>
              {isSubscribed ? '🔔' : '🔕'}
              <span>{isSubscribed ? 'Benachrichtigungen an' : 'Benachrichtigungen aus'}</span>
            </button>
          )}
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs transition-all"
            style={{ color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)', background: 'rgba(239,68,68,0.04)' }}>
            🚪 <span>Abmelden</span>
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center gap-3 px-6 py-3 sticky top-0 z-50"
          style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2d40' }}>

          {/* Mobile menu */}
          <span className="md:hidden font-bold text-white text-sm">✦ TaskFlow</span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="text-xs px-3 py-1.5 rounded-xl"
              style={{ background: 'rgba(99,102,241,0.1)', color: '#a5b4fc', border: '0.5px solid rgba(99,102,241,0.2)' }}>
              {navItems.find(n => n.key === activePage)?.icon} {navItems.find(n => n.key === activePage)?.label}
            </div>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              {getUserName().slice(0, 2).toUpperCase()}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {renderContent()}
        </div>

       {/* Bottom nav — Mobile */}
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
    {/* زر الإعدادات */}
    <button onClick={() => setActivePage('settings')}
      className="flex-1 flex flex-col items-center gap-1 py-2"
      style={{ background: 'transparent', border: 'none' }}>
      <span className="text-lg">⚙️</span>
      <span style={{ color: activePage === 'settings' ? '#a5b4fc' : '#3a5070', fontSize: 9 }}>Einstellungen</span>
    </button>
  </div>
</div>

      </div>
    </div>
  )
}

export default App