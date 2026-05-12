import { FaTrash, FaCheck } from 'react-icons/fa'

function TaskList({ tasks, onDelete, onToggle }) {
  const priorityConfig = {
    High:   { color: 'bg-red-100 text-red-600',    bar: 'bg-red-400',    label: 'عالية' },
    Medium: { color: 'bg-yellow-100 text-yellow-600', bar: 'bg-yellow-400', label: 'متوسطة' },
    Low:    { color: 'bg-green-100 text-green-600',  bar: 'bg-green-400',  label: 'منخفضة' },
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-16">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-sm">لا توجد مهام هنا</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => {
        const config = priorityConfig[task.priority] || priorityConfig.Medium
        return (
          <div
            key={task.id}
            className={`bg-white rounded-xl shadow-sm p-4 flex items-start gap-4 border-r-4 transition ${
              task.isCompleted ? 'opacity-60' : ''
            } ${config.bar.replace('bg-', 'border-')}`}
          >
            {/* زر الإنجاز */}
            <button
              onClick={() => onToggle(task)}
              className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition ${
                task.isCompleted
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-green-400'
              }`}
            >
              {task.isCompleted && <FaCheck size={10} />}
            </button>

            {/* تفاصيل المهمة */}
            <div className="flex-1">
              <h3 className={`font-medium text-gray-800 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                {task.title}
              </h3>
              {task.description && (
                <p className="text-sm text-gray-400 mt-1">{task.description}</p>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${config.color}`}>
                  {config.label}
                </span>
                {task.dueDate && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    📅 {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                  </span>
                )}
              </div>
            </div>

            {/* زر الحذف */}
            <button
              onClick={() => onDelete(task.id)}
              className="text-gray-300 hover:text-red-400 transition mt-1 p-1"
            >
              <FaTrash size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default TaskList