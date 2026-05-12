import { useState } from 'react'

function TaskForm({ onTaskAdded }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    const newTask = {
      title,
      description,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      isCompleted: false,
    }

    try {
      setLoading(true)
      await onTaskAdded(newTask)
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-base font-semibold text-gray-700 mb-4 flex items-center gap-2">
        ✏️ إضافة مهمة جديدة
      </h2>

      <div className="flex flex-col gap-3">

        {/* العنوان */}
        <input
          type="text"
          placeholder="عنوان المهمة *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition"
        />

        {/* الوصف */}
        <textarea
          placeholder="الوصف (اختياري)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition resize-none"
        />

        {/* الأولوية والتاريخ في نفس السطر */}
        <div className="flex gap-3">
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 transition"
          >
            <option value="Low">🟢 منخفضة</option>
            <option value="Medium">🟡 متوسطة</option>
            <option value="High">🔴 عالية</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="flex-1 border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:border-blue-400 transition"
          />
        </div>

        {/* زر الإضافة */}
        <button
          onClick={handleSubmit}
          disabled={loading || !title.trim()}
          className={`rounded-lg p-3 text-sm font-medium transition ${
            loading || !title.trim()
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {loading ? 'جاري الإضافة...' : '+ إضافة المهمة'}
        </button>

      </div>
    </div>
  )
}

export default TaskForm