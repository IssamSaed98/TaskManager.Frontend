import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminDashboard from './pages/AdminDashboard'
import Sidebar from './components/Sidebar'
import TaskForm from './components/TaskForm'
import KanbanBoard from './components/KanbanBoard'
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
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')
  const [tasks, setTasks] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

  const userRole = token ? getUserRole(token) : null

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

  const handleLogin = (newToken) => {
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
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

  // غير مسجل دخول
  if (!token) {
    if (page === 'register') {
      return <Register onRegister={() => setPage('login')} goToLogin={() => setPage('login')} />
    }
    return <Login onLogin={handleLogin} goToRegister={() => setPage('register')} />
  }

  // لوحة المدير
  if (userRole === 'Admin') {
    return <AdminDashboard onLogout={handleLogout} />
  }

  // بورتال الموظف
  // بورتال الموظف
return (
  <div className="flex flex-col min-h-screen" style={{ background: '#0d1117', direction: 'rtl' }}>

    {/* Topbar */}
    <div className="flex items-center gap-3 px-4 py-3 sticky top-0 z-50" style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2d40' }}>
      <span className="font-bold text-white text-sm">✦ TaskFlow</span>
      <span className="flex-1 text-center text-sm font-medium text-white">مهامي</span>
      <span className="text-xs" style={{ color: '#3a5070' }}>
        <span style={{ color: '#60a5fa' }}>{activeCount}</span> · <span style={{ color: '#4ade80' }}>{completedCount}</span>
      </span>
      <button onClick={() => setShowForm(!showForm)}
        className="text-xs px-3 py-1.5 rounded-lg font-medium"
        style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
        + مهمة
      </button>
      <button onClick={handleLogout} style={{ color: '#f87171', fontSize: '11px' }}>خروج</button>
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
        { key: 'all', label: `الكل (${tasks.length})` },
        { key: 'active', label: `نشطة (${activeCount})` },
        { key: 'completed', label: `منجزة (${completedCount})` },
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

    {/* Tasks */}
    <div className="flex-1 overflow-auto p-4 pb-6">
      {loading ? (
        <div className="text-center py-16 text-xs" style={{ color: '#3a5070' }}>جاري التحميل...</div>
      ) : (
        <KanbanBoard tasks={filteredTasks} onDelete={handleDelete} onToggle={handleToggle} />
      )}
    </div>

  </div>
)
}

export default App