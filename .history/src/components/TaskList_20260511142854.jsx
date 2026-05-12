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
      <div className="max-w-2xl mx-auto py-10