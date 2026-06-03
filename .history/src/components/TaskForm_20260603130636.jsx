import { useState } from 'react'
import { useLanguage } from '../hooks/useLanguage'

function TaskForm({ onTaskAdded }) {
  const { t, isRTL } = useLanguage()
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

  const handleCancel = () => {
    setTitle('')
    setDescription('')
    setPriority('Medium')
    setDueDate('')
  }

  return (
    <div className="rounded-xl shadow p-5 mb-4"
      style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40', direction: isRTL ? 'rtl' : 'ltr' }}>

      <div className="flex flex-col gap-3">

        {/* العنوان */}
        <input
          type="text"
          placeholder={t('task_title')}
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="rounded-xl px-4 py-2.5 text-sm outline-none w-full"
          style={{
            background: '#111827',
            border: '0.5px solid #1e2d40',
            color: '#c0d8f0',
            fontFamily: 'inherit',
          }}
        />

        {/* الوصف */}
        <textarea
          placeholder={t('description')}
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          className="rounded-xl px-4 py-2.5 text-sm outline-none w-full resize-none"
          style={{
            background: '#111827',
            border: '0.5px solid #1e2d40',
            color: '#c0d8f0',
            fontFamily: 'inherit',
          }}
        />

        {/* الأولوية والتاريخ */}
        <div className="flex gap-3">
          <select
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              background: '#111827',
              border: '0.5px solid #1e2d40',
              color: '#c0d8f0',
              fontFamily: 'inherit',
            }}>
            <option value="Low">{t('low')}</option>
            <option value="Medium">{t('medium')}</option>
            <option value="High">{t('high')}</option>
          </select>

          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
            style={{
              background: '#111827',
              border: '0.5px solid #1e2d40',
              color: '#c0d8f0',
              fontFamily: 'inherit',
            }}
          />
        </div>

        {/* الأزرار */}
        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition"
            style={{
              background: loading || !title.trim()
                ? 'rgba(14,165,233,0.08)'
                : 'linear-gradient(135deg,#1565C0,#1E88E5)',
              color: loading || !title.trim() ? '#3a5070' : '#fff',
              border: loading || !title.trim() ? '0.5px solid #1e2d40' : 'none',
            }}>
            {loading ? t('loading') : t('add_task')}
          </button>

          <button
            onClick={handleCancel}
            className="px-4 rounded-xl text-sm transition"
            style={{
              background: 'rgba(239,68,68,0.06)',
              color: '#f87171',
              border: '0.5px solid rgba(239,68,68,0.15)',
            }}>
            ✕
          </button>
        </div>

      </div>
    </div>
  )


export default TaskForm