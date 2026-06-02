import TaskCard from './TaskCard'

function KanbanBoard({ tasks, onDelete, onToggle }) {
  const columns = [
    {
      key: 'todo',
      label: 'قيد الانتظار',
      color: 'bg-gray-400',
      filter: (t) => !t.isCompleted && t.priority === 'Low',
    },
    {
      key: 'inprogress',
      label: 'قيد التنفيذ',
      color: 'bg-blue-400',
      filter: (t) => !t.isCompleted && t.priority === 'Medium',
    },
    {
      key: 'high',
      label: 'عاجل',
      color: 'bg-red-400',
      filter: (t) => !t.isCompleted && t.priority === 'High',
    },
    {
      key: 'done',
      label: 'منجز',
      color: 'bg-green-400',
      filter: (t) => t.isCompleted,
    },
  ]

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((col) => {
        const colTasks = tasks.filter(col.filter)
        return (
          <div key={col.key} className="flex-shrink-0 w-56">
            
            {/* عنوان العمود */}
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
              <div className={`w-2 h-2 rounded-full ${col.color}`}></div>
              <span className="text-xs font-medium text-gray-500">{col.label}</span>
              <span className="mr-auto text-xs text-gray-400">{colTasks.length}</span>
            </div>

            {/* الكاردات */}
            <div className="flex flex-col gap-2">
              {colTasks.length === 0 ? (
                <div className="text-center text-gray-300 text-xs py-6 border-2 border-dashed border-gray-200 rounded-xl">
                  لا توجد مهام
                </div>
              ) : (
                colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onDelete={onDelete}
                    onToggle={onToggle}
                  />
                ))
              )}
            </div>

          </div>
        )
      })}
    </div>
  )
}

export default KanbanBoard