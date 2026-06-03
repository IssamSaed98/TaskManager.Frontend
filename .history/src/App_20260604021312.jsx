import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import TaskForm from './components/TaskForm'
import KanbanBoard from './components/KanbanBoard'
import LanguageSwitcher from './components/LanguageSwitcher'
import Events from './pages/Events'
import { useLanguage } from './hooks/useLanguage'
import { getTasks, createTask, updateTask, deleteTask } from './api'

const getUserRole = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 'Employee'
  } catch {
    return 'Employee'
  }
}

function App() {
  const { t, isRTL } = useLanguage()
  const [token, setToken] = useState(
    localStorage.getItem('token') || sessionStorage.getItem('token')
  )
  const [page, setPage] = useState('login')
  const [tasks, setTasks] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [activeTab, setActiveTab] = useState('tasks')
  const userRole = token ? getUserRole(token) : null
  const isMobile = window.innerWidth < 768

  useEffect(() => {
    if (token) loadTasks()
  }, [token])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await getTasks()
      setTasks(response.data)
      setError(null)
    } catch {
      setError('تعذر الاتصال بالسيرفر')
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (newToken) => setToken(newToken)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('remember')
    sessionStorage.removeItem('token')
    setToken(null)
    setPage('login')
  }
  const handleAddTask = async (newTask) => {
    await createTask(newTask)
    loadTasks()
    setShowForm(false)
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    loadTasks()
  }

  const handleToggle = async (task) => {
    await updateTask(task.id, { ...task, isCompleted: !task.isCompleted })
    loadTasks()
  }

  const completedCount = tasks.filter(t => t.isCompleted).length
  const activeCount = tasks.filter(t => !t.isCompleted).length

  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'active') return !task.isCompleted
    if (activeFilter === 'completed') return task.isCompleted
    return true
  })

  const priorityConfig = {
    High:   { tag: 'bg-red-900/30 text-red-400', bar: '#f87171', label: 'عالية' },
    Medium: { tag: 'bg-yellow-900/30 text-yellow-400', bar: '#fbbf24', label: 'متوسطة' },
    Low:    { tag: 'bg-green-900/30 text-green-400', bar: '#4ade80', label: 'منخفضة' },
  }

  if (!token) {
    if (page === 'register') {
      return <Register onRegister={() => setPage('login')} goToLogin={() => setPage('login')} />
    }
    return <Login onLogin={handleLogin} goToRegister={() => setPage('register')} />
  }

  if (userRole === 'Admin') {
    return <AdminDashboard onLogout={handleLogout} />
  }

  return (
    <div className="flex flex-col min-h-screen"
  style={{ background: '#0d1117', direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Topbar */}
      <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-50"
  style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2d40' }}>
  <span className="font-bold text-white text-sm">✦ TaskFlow</span>
  <span className="flex-1 text-center text-sm font-medium text-white">{t('my_tasks')}</span>
  <LanguageSwitcher />
  <button onClick={() => setShowForm(!showForm)}
    className="text-xs px-3 py-1.5 rounded-lg font-medium"
    style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
    {t('add_task')}
  </button>
  <button onClick={handleLogout} style={{ color: '#f87171', fontSize: '11px' }}>{t('logout')}</button>
</div>

      {/* Form */}
      {showForm && (
        <div className="p-4" style={{ borderBottom: '1px solid #1e2d40' }}>
          <TaskForm onTaskAdded={handleAddTask} />
        </div>
      )}

      {/* Progress */}
      {tasks.length > 0 && (
        <div className="mx-4 mt-4 rounded-2xl p-4 flex items-center gap-3" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
          <span className="text-xs whitespace-nowrap" style={{ color: '#3a5070' }}>الإنجاز</span>
          <div className="flex-1 rounded-full h-2" style={{ background: '#1e2d40' }}>
            <div className="h-2 rounded-full transition-all" style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%`, background: '#60a5fa' }} />
          </div>
          <span className="text-xs font-bold whitespace-nowrap" style={{ color: '#60a5fa' }}>
            {Math.round(tasks.length ? (completedCount / tasks.length) * 100 : 0)}%
          </span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 px-4 mt-4">
      {[
  { key: 'all', label: `${t('filter_all')} (${tasks.length})` },
  { key: 'active', label: `${t('filter_active')} (${activeCount})` },
  { key: 'completed', label: `${t('filter_completed')} (${completedCount})` },
].map(btn => (
  <button key={btn.key} onClick={() => setActiveFilter(btn.key)}
    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
    style={{
      background: activeFilter === btn.key ? 'linear-gradient(135deg,#1565C0,#1E88E5)' : '#0a0f1a',
      color: activeFilter === btn.key ? '#fff' : '#4a6080',
      border: `0.5px solid ${activeFilter === btn.key ? 'transparent' : '#1e2d40'}`
    }}>
    {btn.label}
  </button>
))}
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-3 rounded-xl p-3 text-xs text-center" style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
          ⚠️ {error}
        </div>
      )}

{/* Tabs */}
<div className="flex gap-2 px-4 mt-3">
  <button onClick={() => setActiveTab('tasks')}
    className="flex-1 py-2 rounded-xl text-xs font-medium"
    style={{
      background: activeTab === 'tasks' ? 'linear-gradient(135deg,#1565C0,#1E88E5)' : '#0a0f1a',
      color: activeTab === 'tasks' ? '#fff' : '#4a6080',
      border: `0.5px solid ${activeTab === 'tasks' ? 'transparent' : '#1e2d40'}`
    }}>
    {t('my_tasks')}
  </button>
  <button onClick={() => setActiveTab('events')}
    className="flex-1 py-2 rounded-xl text-xs font-medium"
    style={{
      background: activeTab === 'events' ? 'linear-gradient(135deg,#1565C0,#1E88E5)' : '#0a0f1a',
      color: activeTab === 'events' ? '#fff' : '#4a6080',
      border: `0.5px solid ${activeTab === 'events' ? 'transparent' : '#1e2d40'}`
    }}>
    📅 {t('events')}
  </button>
</div>
      {/* Tasks */}
      <div className="flex-1 overflow-auto p-4 pb-6">
  {activeTab === 'tasks' ? (
    loading ? (
      <div className="text-center py-16 text-xs" style={{ color: '#3a5070' }}>جاري التحميل...</div>
    ) : isMobile ? (
      <div className="flex flex-col gap-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-xs" style={{ color: '#3a5070' }}>لا توجد مهام</p>
          </div>
        ) : filteredTasks.map(task => {
          const config = priorityConfig[task.priority] || priorityConfig.Medium
          return (
            <div key={task.id} className="rounded-2xl p-4 flex items-start gap-3 relative overflow-hidden"
              style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
              <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-2xl" style={{ background: config.bar }}></div>
              <div className="flex-1 pr-2">
                <div className={`text-sm font-medium mb-2 ${task.isCompleted ? 'line-through' : ''}`}
                  style={{ color: task.isCompleted ? '#3a5070' : '#c0d8f0' }}>
                  {task.title}
                </div>
                {task.description && (
                  <div className="text-xs mb-2" style={{ color: '#3a5070' }}>{task.description}</div>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.tag}`}>{config.label}</span>
                  {task.dueDate && (
                    <span className="text-xs" style={{ color: '#3a5070' }}>
                      📅 {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                    </span>
                  )}
                  <button onClick={() => handleToggle(task)}
                    className="text-xs px-2 py-0.5 rounded-full mr-auto"
                    style={{
                      background: task.isCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(21,101,192,0.1)',
                      color: task.isCompleted ? '#4ade80' : '#60a5fa'
                    }}>
                    {task.isCompleted ? '✓ منجزة' : 'نشطة'}
                  </button>
                  <button onClick={() => handleDelete(task.id)} style={{ color: '#3a5070' }}>🗑</button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    ) : (
      <KanbanBoard tasks={filteredTasks} onDelete={handleDelete} onToggle={handleToggle} />
    )
  ) : (
    <div className="p-4">
      <Events userRole="Employee" />
    </div>
  )}
</div>

    </div>
  )
}

export default App