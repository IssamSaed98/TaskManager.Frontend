import { FaTrash, FaCheck } from 'react-icons/fa'

function TaskCard({ task, onDelete, onToggle }) {
  const priorityConfig = {
    High:   { bar: 'bg-red-400',    tag: 'bg-red-50 text-red-500',      label: 'عالية' },
    Medium: { bar: 'bg-yellow-400', tag: 'bg-yellow-50 text-yellow-600', label: 'متوسطة' },
    Low:    { bar: 'bg-green-400',  tag: 'bg-green-50 text-green-600',   label: 'منخفضة' },
  }

  const config = priorityConfig[task.priority] || priorityConfig.Medium

  return (
    <div className={`bg-white rounded-xl border border-gray-100 p-3 relative overflow-hidden shadow ${task.isCompleted ? 'opacity-50' : ''}`}>
      
      {/* شريط الأولوية */}
      <div className={`absolute right-0 top-0 bottom-0 w-1 ${config.bar}`}></div>

      <div className="pr-3">
        {/* العنوان */}
        <p className={`text-sm font-medium text-gray-800 mb-2 leading-snug ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
          {task.title}
        </p>

        {/* التفاصيل */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.tag}`}>
            {config.label}
          </span>
          {task.dueDate && (
            <span className="text-xs text-gray-300">
              📅 {new Date(task.dueDate).toLocaleDateString('ar-SA')}
            </span>
          )}

          {/* أزرار */}
          <div className="mr-auto flex items-center gap-2">
            <button
              onClick={() => onToggle(task)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                task.isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-200 hover:border-green-400'
              }`}
            >
              {task.isCompleted && <FaCheck size={8} />}
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-200 hover:text-red-400 transition"
            >
              <FaTrash size={11} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskCard