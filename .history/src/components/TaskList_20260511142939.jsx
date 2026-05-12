import { FaTrash, FaCheck } from 'react-icons/fa'

function TaskList({ tasks, onDelete, onToggle }) {
  const priorityColor = {
    High: 'bg-red-100 text-red-600',
    Medium: 'bg-yellow-100 text-yellow-600',
    Low: 'bg-green-100 text-green-600',
  }

  const priorityLabel = {
    High: 'عالية',
    Medium: 'متوسطة',
    Low: 'منخفضة',
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center text-gray-400 py-10">
        لا توجد مهام — أضف مهمة جديدة!
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`bg-white rounded-xl shadow p-4 flex items-start gap-4 ${
            task.isCompleted ? 'opacity-60' : ''
          }`}
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
            <h3 className={`font-medium text-gray-800 ${task.isCompleted ? 'line-through' : ''}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${priorityColor[task.priority]}`}>
                {priorityLabel[task.priority]}
              </span>
              {task.dueDate && (
                <span className="text-xs text-gray-400">
                  {new Date(task.dueDate).toLocaleDateString('ar-SA')}
                </span>
              )}
            </div>
          </div>

          {/* زر الحذف */}
          <button
            onClick={() => onDelete(task.id)}
            className="text-gray-300 hover:text-red-400 transition mt-1"
          >
            <FaTrash size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

export default TaskList