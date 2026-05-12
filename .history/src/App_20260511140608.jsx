import { useState, useEffect } from 'react'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import { getTasks, createTask, updateTask, deleteTask } from './api'

function App() {
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    const response = await getTasks()
    setTasks(response.data)
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

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="max-w-2xl mx-auto py-10 px-4">

        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          مدير المهام 📋
        </h1>

        <TaskForm onTaskAdded={handleAddTask} />

        <TaskList
          tasks={tasks}
          onDelete={handleDelete}
          onToggle={handleToggle}
        />

      </div>
    </div>
  )
}

export default App