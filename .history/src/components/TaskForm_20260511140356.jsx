import { useState } from 'react'

function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title) return

    const newTask = {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      isCompleted: false,
    }

    await onTaskAdded(newTask)
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setDueDate('')
  }

  return (
    <div className="bg-white rounded-xl shadow p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">إضافة مهمة جديدة</h2>

      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="عنوان المهمة"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
        />

        <input
          type="text"
          placeholder="الوصف (اختياري)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
        >
          <option value="Low">منخفضة</option>
          <option value="Medium">متوسطة</option>
          <option value="High">عالية</option>
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-blue-400"
        />

        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-2 text-sm font-medium transition"
        >
          إضافة المهمة
        </button>
      </div>
    </div>
  )
}

export default TaskForm