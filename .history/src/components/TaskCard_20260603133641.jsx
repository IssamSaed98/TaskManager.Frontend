import { FaTrash, FaCheck } from 'react-icons/fa'
import { useLanguage } from '../hooks/useLanguage'

function TaskCard({ task, onDelete, onToggle }) {
  const { t } = useLanguage()

  const priorityConfig = {
    High:   { color: 'bg-red-900/30 text-red-400',    bar: '#f87171', label: t('priority_high') },
    Medium: { color: 'bg-yellow-900/30 text-yellow-400', bar: '#fbbf24', label: t('priority_medium') },
    Low:    { color: 'bg-green-900/30 text-green-400',  bar: '#4ade80', label: t('priority_low') },
  }

  const config = priorityConfig[task.priority] || priorityConfig.Medium

  return (
    <div className={`rounded-xl border p-3 relative overflow-hidden ${task.isCompleted ? 'opacity-60' : ''}`}
      style={{ background: '#0a0f1a', borderColor: '#1e2d40' }}>

      <div className="absolute right-0 top-0 bottom-0 w-1 rounded-r-xl" style={{ background: config.bar }}></div>

      <div className="pr-3">
        <p className={`text-xs font-medium mb-2 ${task.isCompleted ? 'line-through' : ''}`}
          style={{ color: task.isCompleted ? '#3a5070' : '#c0d8f0' }}>
          {task.title}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.color}`}>
            {config.label}
          </span>
          {task.dueDate && (
            <span className="text-xs" style={{ color: '#3a5070' }}>
              📅 {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          <div className="mr-auto flex items-center gap-2">
            <button
              onClick={() => onToggle(task)}
              className="w-5 h-5 rounded-full border-2 flex items-center justify-center transition"
              style={{
                background: task.isCompleted ? '#4ade80' : 'transparent',
                borderColor: task.isCompleted ? '#4ade80' : '#1e2d40',
              }}>
              {task.isCompleted && <FaCheck size={8} color="white" />}
            </button>
            <button onClick={() => onDelete(task.id)} style={{ color: '#3a5070' }}>
              <FaTrash size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard