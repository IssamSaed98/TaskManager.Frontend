import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import Sidebar from './components/Sidebar'
import TaskForm from './components/TaskForm'
import KanbanBoard from './components/KanbanBoard'
import { getTasks, createTask, updateTask, deleteTask } from './api'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [page, setPage] = useState('login')
  const [tasks, setTasks] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

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

  // مسجل دخول
  return (
    <div className="flex min-h-screen bg-gray-50" dir="rtl">

      <Sidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="bg-gray-800 border-b border-gray-700 px-6 py-3 flex items-center gap-4">
          <span className="font-medium text-white text-sm flex-1">مهامي</span>
          <span className="text-xs text-gray-300">
            <span className="text-blue-400 font-medium">{activeCount}</span> نشطة
            &nbsp;·&nbsp;
            <span className="text-green-400 font-medium">{completedCount}</span> منجزة
          </span>
          <button onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition">
            + مهمة جديدة
          </button>
          <button onClick={handleLogout}
            className="text-gray-400 hover:text-red-400 text-xs transition">
            تسجيل الخروج
          </button>
        </div>

        {showForm && (
          <div className="px-6 pt-4">
            <TaskForm onTaskAdded={handleAddTask} />
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {error && (
            <div className="bg-red-100 text-red-600 rounded-xl p-4 mb-4 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          {tasks.length > 0 && (
            <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-4 shadow-sm">
              <span className="text-xs text-gray-500 whitespace-nowrap">نسبة الإنجاز</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }} />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {Math.round(tasks.length ? (completedCount / tasks.length) * 100 : 0)}%
              </span>
            </div>
          )}

          {loading ? (
            <div className="text-center text-gray-400 py-16">جاري التحميل...</div>
          ) : (
            <KanbanBoard tasks={tasks} onDelete={handleDelete} onToggle={handleToggle} />
          )}
        </div>

      </div>
    </div>
  )
}

export default App