import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import TaskForm from './components/TaskForm'
import KanbanBoard from './components/KanbanBoard'
import { getTasks, createTask, updateTask, deleteTask } from './api'

function App() {
  const [tasks, setTasks] = useState([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)

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
    setShowForm(false)
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

  const completedCount = tasks.filter((t) => t.isCompleted).length
  const activeCount = tasks.filter((t) => !t.isCompleted).length

  return (
    <div className="flex min-h-screen bg-gray-100" dir="rtl">

      {/* Sidebar */}
      <Sidebar activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* الهيدر */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4">
          <span className="font-medium text-gray-800 text-sm flex-1">مهامي</span>
          <span className="text-xs text-gray-400">
            <span className="text-blue-500 font-medium">{activeCount}</span> نشطة
            &nbsp;·&nbsp;
            <span className="text-green-500 font-medium">{completedCount}</span> منجزة
          </span>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium px-4 py-2 rounded-lg transition"
          >
            + مهمة جديدة
          </button>
        </div>

        {/* الفورم */}
        {showForm && (
          <div className="px-6 pt-4">
            <TaskForm onTaskAdded={handleAddTask} />
          </div>
        )}

        {/* المحتوى */}
        <div className="flex-1 overflow-auto p-6">

          {/* رسالة الخطأ */}
          {error && (
            <div className="bg-red-100 text-red-600 rounded-xl p-4 mb-4 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Progress Bar */}
          {tasks.length > 0 && (
            <div className="bg-white rounded-xl p-4 mb-4 flex items-center gap-4 shadow-sm">
              <span className="text-xs text-gray-500 whitespace-nowrap">نسبة الإنجاز</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {Math.round(tasks.length ? (completedCount / tasks.length) * 100 : 0)}%
              </span>
            </div>
          )}

          {/* الكانبان */}
          {loading ? (
            <div className="text-center text-gray-400 py-16">جاري التحميل...</div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          )}

        </div>
      </div>
    </div>
  )
}

export default App