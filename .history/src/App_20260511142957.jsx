import { useState, useEffect } from 'react'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import { getTasks, createTask, updateTask, deleteTask } from './api'

function App() {
  const [tasks, setTasks] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      setLoading(true)
      const response = await getTasks()
      setTasks(response.data)
      setError(null)
    } catch (err) {
      setError('تعذر الاتصال بالسيرفر — تأكد إن الباك اند شغّال')
    } finally {
      setLoading(false)
    }
  }

  const handleAddTask = async (newTask) => {
    await createTask(newTask)
    loadTasks()
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    loadTasks()
  }

  const handleToggle = async (task) => {
    await updateTask(task.id, {
      ...task,
      isCompleted: !task.isCompleted,
    })
    loadTasks()
  }

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'active') return !task.isCompleted
    if (filter === 'completed') return task.isCompleted
    return true
  })

  const completedCount = tasks.filter((t) => t.isCompleted).length
  const activeCount = tasks.filter((t) => !t.isCompleted).length

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="max-w-2xl mx-auto py-10 px-4">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">مدير المهام 📋</h1>
          <p className="text-gray-500 text-sm mt-2">
            لديك <span className="text-blue-500 font-medium">{activeCount}</span> مهمة نشطة
            و <span className="text-green-500 font-medium">{completedCount}</span> منجزة
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-100 text-red-600 rounded-xl p-4 mb-6 text-sm text-center">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <TaskForm onTaskAdded={handleAddTask} />

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: `الكل (${tasks.length})` },
            { key: 'active', label: `نشطة (${activeCount})` },
            { key: 'completed', label: `منجزة (${completedCount})` },
          ].map((btn) => (
            <button
              key={btn.key}
              onClick={() => setFilter(btn.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === btn.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="text-center text-gray-400 py-10">
            جاري التحميل...
          </div>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        )}

      </div>
    </div>
  )
}

export default App