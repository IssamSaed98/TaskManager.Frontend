import { useState, useEffect } from 'react'
import { getUsers, getUserTasks, createTaskForUser, updateTask, deleteTask, getOrganization } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import LanguageSwitcher from '../components/LanguageSwitcher'

function AdminDashboard({ onLogout }) {
  const { t, isRTL } = useLanguage()
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userTasks, setUserTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [orgInfo, setOrgInfo] = useState(null)
  const [activePage, setActivePage] = useState('home')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    loadUsers()
    loadOrgInfo()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers()
      setUsers(response.data)
    } catch {
      console.error('error')
    } finally {
      setLoading(false)
    }
  }

  const loadOrgInfo = async () => {
    try {
      const response = await getOrganization()
      setOrgInfo(response.data)
    } catch {
      console.error('error')
    }
  }

  const selectUser = async (user) => {
    setSelectedUser(user)
    setShowForm(false)
    setActivePage('tasks')
    setSidebarOpen(false)
    try {
      const response = await getUserTasks(user.id)
      setUserTasks(response.data)
    } catch {
      console.error('error')
    }
  }

  const handleAddTask = async () => {
    if (!title || !selectedUser) return
    try {
      await createTaskForUser({
        title, description, priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        userId: selectedUser.id,
      })
      setTitle(''); setDescription(''); setPriority('Medium'); setDueDate('')
      setShowForm(false)
      const response = await getUserTasks(selectedUser.id)
      setUserTasks(response.data)
      loadUsers()
    } catch { console.error('error') }
  }

  const handleToggle = async (task) => {
    await updateTask(task.id, { ...task, isCompleted: !task.isCompleted })
    const response = await getUserTasks(selectedUser.id)
    setUserTasks(response.data)
    loadUsers()
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    const response = await getUserTasks(selectedUser.id)
    setUserTasks(response.data)
    loadUsers()
  }

  const totalTasks = users.reduce((s, u) => s + u.totalTasks, 0)
  const completedTasks = users.reduce((s, u) => s + u.completedTasks, 0)
  const activeTasks = users.reduce((s, u) => s + u.activeTasks, 0)

  const priorityConfig = {
    High:   { tag: 'bg-red-900/30 text-red-400',    label: t('high') },
    Medium: { tag: 'bg-yellow-900/30 text-yellow-400', label: t('medium') },
    Low:    { tag: 'bg-green-900/30 text-green-400',  label: t('low') },
  }

  const avatarColors = [
    'from-blue-600 to-blue-400', 'from-green-600 to-green-400',
    'from-purple-600 to-purple-400', 'from-yellow-600 to-yellow-400',
  ]

  const navItems = [
    { key: 'home',      icon: '🏠', label: t('admin_dashboard') },
    { key: 'employees', icon: '👥', label: t('employees') },
    { key: 'tasks',     icon: '📋', label: t('all_tasks') },
    { key: 'reports',   icon: '📊', label: t('reports') },
  ]

  const StatsGrid = () => (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {[
        { label: t('total_tasks'),     value: totalTasks,     color: '#60a5fa', bg: 'rgba(21,101,192,0.08)',  border: 'rgba(21,101,192,0.2)',  icon: '📋' },
        { label: t('active_tasks'),    value: activeTasks,    color: '#fbbf24', bg: 'rgba(251,191,36,0.08)',  border: 'rgba(251,191,36,0.2)',  icon: '⚡' },
        { label: t('completed_tasks'), value: completedTasks, color: '#4ade80', bg: 'rgba(34,197,94,0.08)',   border: 'rgba(34,197,94,0.2)',   icon: '✅' },
        { label: t('employees'),       value: users.length,   color: '#a78bfa', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)',  icon: '👥' },
      ].map((s, i) => (
        <div key={i} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: s.bg, border: `0.5px solid ${s.border}` }}>
          <div className="text-xl">{s.icon}</div>
          <div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#3a5070' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )

  const EmployeeList = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-white">{t('employees')}</span>
        <span className="text-xs" style={{ color: '#3a5070' }}>{users.length}</span>
      </div>
      {loading ? (
        <div className="text-center py-8 text-xs" style={{ color: '#3a5070' }}>{t('loading')}</div>
      ) : users.length === 0 ? (
        <div className="text-center py-8 text-xs" style={{ color: '#3a5070' }}>{t('no_employees')}</div>
      ) : users.map((user, i) => {
        const pct = user.totalTasks > 0 ? Math.round((user.completedTasks / user.totalTasks) * 100) : 0
        const isSelected = selectedUser?.id === user.id
        return (
          <div key={user.id} onClick={() => selectUser(user)}
            className="rounded-2xl p-4 mb-3 cursor-pointer transition-all"
            style={{
              background: isSelected ? 'rgba(21,101,192,0.1)' : '#0a0f1a',
              border: isSelected ? '0.5px solid rgba(21,101,192,0.35)' : '0.5px solid #1e2d40'
            }}>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#c0d8f0' }}>{user.username}</div>
                <div className="text-xs mt-0.5" style={{ color: '#3a5070' }}>{user.completedTasks}/{user.totalTasks} {t('completed_tasks')}</div>
              </div>
              <div className="text-sm font-bold" style={{ color: '#60a5fa' }}>{pct}%</div>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e2d40' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#60a5fa' }} />
            </div>
          </div>
        )
      })}
    </div>
  )

  import { useState, useRef, useEffect } from 'react'
  import { useLanguage } from '../hooks/useLanguage'
  
  function LanguageSwitcher() {
    const { changeLanguage, currentLang } = useLanguage()
    const [open, setOpen] = useState(false)
    const ref = useRef(null)
  
    const languages = [
      { code: 'de', label: 'DE', flag: '🇩🇪', name: 'Deutsch' },
      { code: 'en', label: 'EN', flag: '🇬🇧', name: 'English' },
      { code: 'ar', label: 'AR', flag: '🇸🇦', name: 'العربية' },
    ]
  
    const current = languages.find(l => l.code === currentLang) || languages[1]
  
    useEffect(() => {
      const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
          setOpen(false)
        }
      }
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }, [])
  
    return (
      <div ref={ref} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: 'rgba(14,165,233,0.08)',
            border: '0.5px solid rgba(14,165,233,0.2)',
            color: '#60a5fa',
          }}>
          <span className="text-sm">{current.flag}</span>
          <span>{current.label}</span>
          <span style={{ fontSize: '8px', opacity: 0.6 }}>{open ? '▲' : '▼'}</span>
        </button>
  
        {open && (
          <div className="absolute top-full mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background: '#0a0f1a',
              border: '0.5px solid rgba(14,165,233,0.15)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              minWidth: '130px',
              left: '50%',
              transform: 'translateX(-50%)',
            }}>
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => { changeLanguage(lang.code); setOpen(false) }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs transition-all"
                style={{
                  background: currentLang === lang.code ? 'rgba(14,165,233,0.1)' : 'transparent',
                  color: currentLang === lang.code ? '#60a5fa' : '#4a6080',
                  borderBottom: '0.5px solid rgba(14,165,233,0.05)',
                }}>
                <span className="text-base">{lang.flag}</span>
                <div className="text-left">
                  <div className="font-medium">{lang.label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.5 }}>{lang.name}</div>
                </div>
                {currentLang === lang.code && (
                  <span className="mr-auto text-xs" style={{ color: '#60a5fa' }}>✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }
  
  export default LanguageSwitcher

  const Reports = () => (
    <div>
      <div className="text-sm font-semibold text-white mb-4">{t('team_report')}</div>
      <div className="rounded-2xl p-5 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <div className="text-xs mb-3" style={{ color: '#3a5070' }}>{t('team_progress')}</div>
        <div className="text-3xl font-bold mb-3" style={{ color: '#60a5fa' }}>
          {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e2d40' }}>
          <div className="h-full rounded-full" style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`, background: '#60a5fa' }} />
        </div>
      </div>
      {users.map((user, i) => {
        const pct = user.totalTasks > 0 ? Math.round((user.completedTasks / user.totalTasks) * 100) : 0
        return (
          <div key={user.id} className="rounded-2xl p-4 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white`}>
                  {user.username.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-sm" style={{ color: '#c0d8f0' }}>{user.username}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: '#60a5fa' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: '#1e2d40' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#60a5fa' }} />
            </div>
            <div className="flex gap-3">
              <span className="text-xs" style={{ color: '#4ade80' }}>✅ {user.completedTasks} {t('completed_tasks')}</span>
              <span className="text-xs" style={{ color: '#fbbf24' }}>⚡ {user.activeTasks} {t('active_tasks')}</span>
              <span className="text-xs" style={{ color: '#3a5070' }}>📋 {user.totalTasks} {t('total_tasks')}</span>
            </div>
          </div>
        )
      })}
    </div>
  )

  const renderPage = () => {
    switch (activePage) {
      case 'home': return <><StatsGrid /><EmployeeList /></>
      case 'employees': return <EmployeeList />
      case 'tasks': return <TasksList />
      case 'reports': return <Reports />
      default: return <StatsGrid />
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0d1117', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-50" style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2d40' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1 flex-shrink-0 md:hidden"
          style={{ background: 'rgba(14,165,233,0.1)', border: '0.5px solid rgba(14,165,233,0.2)' }}>
          <div className="w-4 h-0.5 rounded bg-blue-400"></div>
          <div className="w-4 h-0.5 rounded bg-blue-400"></div>
          <div className="w-4 h-0.5 rounded bg-blue-400"></div>
        </button>
        <span className="text-white font-semibold text-sm flex-1">
          {navItems.find(n => n.key === activePage)?.label || t('admin_dashboard')}
        </span>
        <LanguageSwitcher />
        {orgInfo && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(14,165,233,0.08)', border: '0.5px solid rgba(14,165,233,0.2)' }}>
            <span className="text-xs" style={{ color: 'rgba(14,165,233,0.6)' }}>🏢 {orgInfo.name}</span>
            <span className="text-xs font-bold" style={{ color: '#60a5fa' }}>ID: {orgInfo.id}</span>
          </div>
        )}
        <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '0.5px solid rgba(251,191,36,0.2)' }}>👑</span>
        <button onClick={onLogout} className="hidden md:block text-xs px-3 py-1 rounded-lg" style={{ color: '#4a6080', border: '0.5px solid #1e2d40', background: 'transparent' }}>
          {t('logout')}
        </button>
      </div>

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="absolute top-0 right-0 h-full w-64 flex flex-col py-6 px-4 gap-2"
            style={{ background: '#0a0f1a', borderLeft: '1px solid #1e2d40' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-2 pb-4 mb-2" style={{ borderBottom: '1px solid #1e2d40' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>✦</div>
              <span className="font-bold text-white text-sm">TaskFlow</span>
            </div>
            {orgInfo && (
              <div className="px-3 py-2 rounded-xl mb-2" style={{ background: 'rgba(14,165,233,0.06)', border: '0.5px solid rgba(14,165,233,0.15)' }}>
                <div className="text-xs" style={{ color: '#7dd3fc' }}>🏢 {orgInfo.name}</div>
                <div className="text-xs font-bold mt-1" style={{ color: '#60a5fa' }}>ID: {orgInfo.id}</div>
              </div>
            )}
            {navItems.map(item => (
              <div key={item.key} onClick={() => { setActivePage(item.key); setSidebarOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-all"
                style={{
                  background: activePage === item.key ? 'rgba(21,101,192,0.15)' : 'transparent',
                  color: activePage === item.key ? '#60a5fa' : '#4a6080',
                  border: activePage === item.key ? '0.5px solid rgba(21,101,192,0.25)' : '0.5px solid transparent'
                }}>
                <span>{item.icon}</span>
                {item.label}
              </div>
            ))}
            <div className="mt-auto">
              <button onClick={onLogout} className="w-full text-sm py-2.5 rounded-xl" style={{ color: '#f87171', border: '0.5px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}>
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden md:flex w-52 flex-col py-5 px-3 gap-1 flex-shrink-0" style={{ background: '#0a0f1a', borderLeft: '1px solid #1e2d40' }}>
          {navItems.map(item => (
            <div key={item.key} onClick={() => setActivePage(item.key)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all"
              style={{
                background: activePage === item.key ? 'rgba(21,101,192,0.15)' : 'transparent',
                color: activePage === item.key ? '#60a5fa' : '#4a6080',
                border: activePage === item.key ? '0.5px solid rgba(21,101,192,0.25)' : '0.5px solid transparent'
              }}>
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="mt-auto pt-4 flex items-center gap-2 px-2" style={{ borderTop: '1px solid #1e2d40' }}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white">IS</div>
            <div>
              <div className="text-xs text-gray-400">Admin</div>
              <div className="text-xs" style={{ color: '#fbbf24' }}>👑</div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
          {renderPage()}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 md:hidden flex" style={{ background: '#0a0f1a', borderTop: '1px solid #1e2d40', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => setActivePage(item.key)}
            className="flex-1 flex flex-col items-center gap-1 py-2 transition-all"
            style={{ background: 'transparent', border: 'none' }}>
            <span className="text-lg">{item.icon}</span>
            <span className="text-xs" style={{ color: activePage === item.key ? '#60a5fa' : '#3a5070' }}>{item.label}</span>
            {activePage === item.key && <div className="w-1 h-1 rounded-full" style={{ background: '#60a5fa' }}></div>}
          </button>
        ))}
      </div>

    </div>
  )
}

export default AdminDashboard