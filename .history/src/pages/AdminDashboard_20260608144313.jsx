import { useState, useEffect, useCallback } from 'react'
import { getUsers, getUserTasks, createTaskForUser, updateTask, deleteTask, getOrganization, deleteUser } from '../api'
import { useLanguage } from '../hooks/useLanguage'
import { usePolling } from '../hooks/usePolling'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Events from './Events'
import { usePushNotifications } from '../hooks/usePushNotifications'

function AdminDashboard({ onLogout }) {
  const { t, isRTL } = useLanguage()
  const { isSubscribed, isSupported, subscribe, unsubscribe } = usePushNotifications()
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

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await getUsers()
      setUsers(response.data)
    } catch {
      console.error('error')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadOrgInfo = useCallback(async () => {
    try {
      const response = await getOrganization()
      setOrgInfo(response.data)
    } catch {
      console.error('error')
    }
  }, [])

  useEffect(() => {
    loadUsers()
    loadOrgInfo()
  }, [])

  usePolling(loadUsers, 5000, true)

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

  const refreshUserTasks = useCallback(async () => {
    if (!selectedUser) return
    try {
      const response = await getUserTasks(selectedUser.id)
      setUserTasks(response.data)
    } catch { }
  }, [selectedUser])

  usePolling(refreshUserTasks, 5000, !!selectedUser && activePage === 'tasks')

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
      refreshUserTasks()
      loadUsers()
    } catch { console.error('error') }
  }

  const handleToggle = async (task) => {
    await updateTask(task.id, { ...task, isCompleted: !task.isCompleted })
    refreshUserTasks()
    loadUsers()
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    refreshUserTasks()
    loadUsers()
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Möchten Sie diesen Mitarbeiter wirklich löschen? Alle zugehörigen Daten werden gelöscht.')) return
    try {
      await deleteUser(userId)
      await loadUsers()
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
        setUserTasks([])
      }
    } catch (err) {
      console.error('Delete user error:', err)
      alert('Fehler beim Löschen des Benutzers.')
    }
  }

  const totalTasks = users.reduce((s, u) => s + u.totalTasks, 0)
  const completedTasks = users.reduce((s, u) => s + u.completedTasks, 0)
  const activeTasks = users.reduce((s, u) => s + u.activeTasks, 0)

  const priorityConfig = {
    High:   { tag: 'bg-red-900/30 text-red-300',    label: '🔴 Hoch' },
    Medium: { tag: 'bg-yellow-900/30 text-yellow-300', label: '🟡 Mittel' },
    Low:    { tag: 'bg-green-900/30 text-green-300',  label: '🟢 Niedrig' },
  }

  const avatarColors = [
    'from-blue-600 to-blue-400', 'from-green-600 to-green-400',
    'from-purple-600 to-purple-400', 'from-yellow-600 to-yellow-400',
  ]

  const navItems = [
    { key: 'home',      icon: '🏠', label: t('admin_dashboard') },
    { key: 'employees', icon: '👥', label: t('employees') },
    { key: 'tasks',     icon: '📋', label: t('all_tasks') },
    { key: 'events',    icon: '📅', label: t('events') },
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
        <div key={i} className="rounded-2xl p-4 flex items-center gap-3"
          style={{ background: s.bg, border: `0.5px solid ${s.border}` }}>
          <div className="text-xl">{s.icon}</div>
          <div>
            <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-0.5" style={{ color: '#93B5CC' }}>{s.label}</div>
          </div>
        </div>
      ))}
    </div>
  )

  const EmployeeList = () => (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>{t('employees')}</span>
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
          <div key={user.id}
            className="rounded-2xl p-4 mb-3"
            style={{
              background: isSelected ? 'rgba(21,101,192,0.1)' : '#0a0f1a',
              border: isSelected ? '0.5px solid rgba(21,101,192,0.35)' : '0.5px solid #1e2d40'
            }}>
            <div className="flex items-center gap-3 mb-3 cursor-pointer" onClick={() => selectUser(user)}>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-sm font-bold text-white flex-shrink-0`}>
                {user.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium" style={{ color: '#ffffff' }}>{user.username}</div>
                <div className="text-xs mt-0.5" style={{ color: '#7090b0' }}>
                  {user.completedTasks}/{user.totalTasks} {t('completed_tasks')}
                </div>
              </div>
              <div className="text-sm font-bold" style={{ color: '#60a5fa' }}>{pct}%</div>
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteUser(user.id) }}
                className="text-xs px-2 py-1 rounded-lg transition-all"
                style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
                🗑
              </button>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1e2d40' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#60a5fa' }} />
            </div>
          </div>
        )
      })}
    </div>
  )

  const TasksList = () => (
    <div>
      {!selectedUser ? (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: '#3a5070' }}>
          <div className="text-4xl mb-3">👈</div>
          <p className="text-xs">{t('click_employee')}</p>
        </div>
      ) : userTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: '#3a5070' }}>
          <div className="text-4xl mb-3">📭</div>
          <p className="text-xs">{t('no_tasks_employee')}</p>
        </div>
      ) : userTasks.map(task => {
        const config = priorityConfig[task.priority] || priorityConfig.Medium
        return (
          <div key={task.id} className="rounded-2xl p-4 mb-3 flex items-start gap-3"
            style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
            <div className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
              style={{ background: task.isCompleted ? '#4ade80' : task.priority === 'High' ? '#f87171' : '#fbbf24' }} />
            <div className="flex-1">
              <div className={`text-sm font-medium ${task.isCompleted ? 'line-through' : ''}`}
                style={{ color: task.isCompleted ? '#3a5070' : '#ffffff' }}>
                {task.title}
              </div>
              {task.description && (
                <div className="text-xs mt-0.5" style={{ color: '#7090b0' }}>{task.description}</div>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.tag}`}>{config.label}</span>
                <button onClick={() => handleToggle(task)}
                  className="text-xs px-2 py-0.5 rounded-full transition-all"
                  style={{
                    background: task.isCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(21,101,192,0.1)',
                    color: task.isCompleted ? '#4ade80' : '#60a5fa'
                  }}>
                  {task.isCompleted ? t('status_done') : t('status_active')}
                </button>
                <button onClick={() => handleDelete(task.id)} style={{ color: '#3a5070', marginRight: 'auto' }}>🗑</button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  const Reports = () => (
    <div>
      <div className="text-sm font-semibold mb-4" style={{ color: '#ffffff' }}>{t('team_report')}</div>
      <div className="rounded-2xl p-5 mb-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
        <div className="text-xs mb-3" style={{ color: '#7090b0' }}>{t('team_progress')}</div>
        <div className="text-3xl font-bold mb-3" style={{ color: '#60a5fa' }}>
          {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: '#1e2d40' }}>
          <div className="h-full rounded-full"
            style={{ width: `${totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0}%`, background: '#60a5fa' }} />
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
                <span className="text-sm" style={{ color: '#ffffff' }}>{user.username}</span>
              </div>
              <span className="text-sm font-bold" style={{ color: '#60a5fa' }}>{pct}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden mb-2" style={{ background: '#1e2d40' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: '#60a5fa' }} />
            </div>
            <div className="flex gap-3">
              <span className="text-xs" style={{ color: '#4ade80' }}>✅ {user.completedTasks} {t('completed_tasks')}</span>
              <span className="text-xs" style={{ color: '#fbbf24' }}>⚡ {user.activeTasks} {t('active_tasks')}</span>
              <span className="text-xs" style={{ color: '#7090b0' }}>📋 {user.totalTasks} {t('total_tasks')}</span>
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
      case 'tasks': return (
        <>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
              {selectedUser ? `${t('all_tasks')} — ${selectedUser.username}` : t('select_employee')}
            </span>
            {selectedUser && (
              <button onClick={() => setShowForm(!showForm)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium"
                style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
                {t('add_task_btn')}
              </button>
            )}
          </div>

          {showForm && selectedUser && (
            <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
              style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder={t('task_title')}
                className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
                style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
              <input value={description} onChange={e => setDescription(e.target.value)}
                placeholder={t('description')}
                className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
                style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
              <div className="grid grid-cols-2 gap-3">
                <select value={priority} onChange={e => setPriority(e.target.value)}
                  className="rounded-xl px-3 py-2.5 text-xs outline-none"
                  style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }}>
                  <option value="Low">{t('low')}</option>
                  <option value="Medium">{t('medium')}</option>
                  <option value="High">{t('high')}</option>
                </select>
                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                  className="rounded-xl px-3 py-2.5 text-xs outline-none"
                  style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddTask}
                  className="flex-1 rounded-xl py-2.5 text-xs font-medium"
                  style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
                  {t('save_task')}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="px-4 rounded-xl text-xs"
                  style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
                  ✕
                </button>
              </div>
            </div>
          )}
          <TasksList />
        </>
      )
      case 'events': return <Events userRole="Admin" />
      case 'reports': return <Reports />
      default: return <StatsGrid />
    }
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0d1117', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-50"
        style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2d40' }}>
        <button onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-9 h-9 rounded-xl flex flex-col items-center justify-center gap-1 flex-shrink-0 md:hidden"
          style={{ background: 'rgba(14,165,233,0.1)', border: '0.5px solid rgba(14,165,233,0.2)' }}>
          <div className="w-4 h-0.5 rounded bg-blue-400"></div>
          <div className="w-4 h-0.5 rounded bg-blue-400"></div>
          <div className="w-4 h-0.5 rounded bg-blue-400"></div>
        </button>
        <span className="font-semibold text-sm flex-1" style={{ color: '#ffffff' }}>
          {navItems.find(n => n.key === activePage)?.label || t('admin_dashboard')}
        </span>
        <LanguageSwitcher />
        {orgInfo && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{ background: 'rgba(14,165,233,0.08)', border: '0.5px solid rgba(14,165,233,0.2)' }}>
            <span className="text-xs" style={{ color: 'rgba(14,165,233,0.6)' }}>🏢 {orgInfo.name}</span>
          </div>
        )}
        {isSupported && (
          <button onClick={isSubscribed ? unsubscribe : subscribe}
            className="text-xs px-2 py-1 rounded-lg"
            style={{
              background: isSubscribed ? 'rgba(34,197,94,0.1)' : 'rgba(14,165,233,0.1)',
              color: isSubscribed ? '#4ade80' : '#60a5fa',
              border: `0.5px solid ${isSubscribed ? 'rgba(34,197,94,0.2)' : 'rgba(14,165,233,0.2)'}`,
            }}>
            {isSubscribed ? '🔔' : '🔕'}
          </button>
        )}
        <span className="text-xs px-2 py-1 rounded-full"
          style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '0.5px solid rgba(251,191,36,0.2)' }}>
          👑
        </span>
        <button onClick={onLogout} className="hidden md:block text-xs px-3 py-1 rounded-lg"
          style={{ color: '#f87171', border: '0.5px solid rgba(239,68,68,0.2)', background: 'transparent' }}>
          {t('logout')}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden" onClick={() => setSidebarOpen(false)}
          style={{ background: 'rgba(0,0,0,0.6)' }}>
          <div className="absolute top-0 right-0 h-full w-64 flex flex-col py-6 px-4 gap-2"
            style={{ background: '#0a0f1a', borderLeft: '1px solid #1e2d40' }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-2 pb-4 mb-2" style={{ borderBottom: '1px solid #1e2d40' }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)' }}>✦</div>
              <span className="font-bold text-white text-sm">TaskFlow</span>
            </div>
            {orgInfo && (
              <div className="px-3 py-2 rounded-xl mb-2"
                style={{ background: 'rgba(14,165,233,0.06)', border: '0.5px solid rgba(14,165,233,0.15)' }}>
                <div className="text-xs" style={{ color: '#7dd3fc' }}>🏢 {orgInfo.name}</div>
              </div>
            )}
            {navItems.map(item => (
              <div key={item.key} onClick={() => { setActivePage(item.key); setSidebarOpen(false) }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer"
                style={{
                  background: activePage === item.key ? 'rgba(21,101,192,0.15)' : 'transparent',
                  color: activePage === item.key ? '#60a5fa' : '#4a6080',
                }}>
                <span>{item.icon}</span>
                {item.label}jjjjjjjjjjjjjjj
              </div>
            ))}
            <div className="mt-auto">
              <button onClick={onLogout} className="w-full text-sm py-2.5 rounded-xl"
                style={{ color: '#f87171', border: '0.5px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)' }}>
                {t('logout')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex w-52 flex-col py-5 px-3 gap-1 flex-shrink-0"
          style={{ background: '#0a0f1a', borderLeft: '1px solid #1e2d40' }}>
          {navItems.map(item => (
            <div key={item.key} onClick={() => setActivePage(item.key)}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer"
              style={{
                background: activePage === item.key ? 'rgba(21,101,192,0.15)' : 'transparent',
                color: activePage === item.key ? '#60a5fa' : '#4a6080',
                border: activePage === item.key ? '0.5px solid rgba(21,101,192,0.25)' : '0.5px solid transparent'
              }}>
              <span>{item.icon}</span>
              {item.label}
            </div>
          ))}
          <div className="mt-auto pt-4 flex items-center gap-2 px-2"
            style={{ borderTop: '1px solid #1e2d40' }}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white">
              AD
            </div>
            <div>
              <div className="text-xs" style={{ color: '#ffffff' }}>Admin</div>
              
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 pb-20 md:pb-4">
          {renderPage()}
        </div>
      </div>

      {/* Bottom Nav Mobile */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden flex"
        style={{ background: '#0a0f1a', borderTop: '1px solid #1e2d40', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(item => (
          <button key={item.key} onClick={() => setActivePage(item.key)}
            className="flex-1 flex flex-col items-center gap-1 py-2"
            style={{ background: 'transparent', border: 'none' }}>
            <span className="text-lg">{item.icon}</span>
            <span style={{ color: activePage === item.key ? '#60a5fa' : '#3a5070', fontSize: 9 }}>{item.label}</span>
            {activePage === item.key && <div className="w-1 h-1 rounded-full" style={{ background: '#60a5fa' }}></div>}
          </button>
        ))}
      </div>
    </div>
  )
}

export default AdminDashboard