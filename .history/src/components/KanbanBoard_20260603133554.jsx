import TaskCard from './TaskCard'
import { useLanguage } from '../hooks/useLanguage'

function KanbanBoard({ tasks, onDelete, onToggle }) {
  const { t } = useLanguage()

  const columns = [
    {
      key: 'todo',
      label: t('status_todo'),
      color: '#888780',
      filter: (task) => !task.isCompleted && task.priority === 'Low',
    },
    {
      key: 'inprogress',
      label: t('status_inprogress'),
      color: '#3B8BD4',
      filter: (task) => !task.isCompleted && task.priority === 'Medium',
    },
    {
      key: 'urgent',
      label: t('status_urgent'),
      color: '#f87171',
      filter: (task) => !task.isCompleted && task.priority === 'High',
    },
    {
      key: 'done',
      label: t('status_done_label'),
      color: '#4ade80',
      filter: (task) => task.isCompleted,
    },
  ]

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map(col => {
        const colTasks = tasks.filter(col.filter)
        return (
          <div key={col.key} className="flex-shrink-0 w-56">
            <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '0.5px solid #1e2d40' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: col.color }}></div>
              <span className="text-xs font-medium" style={{ color: '#4a6080' }}>{col.label}</span>
              <span className="mr-auto text-xs" style={{ color: '#3a5070' }}>{colTasks.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              {colTasks.length === 0 ? (
                <div className="text-center text-xs py-6 border-2 border-dashed rounded-xl"
                  style={{ color: '#1e2d40', borderColor: '#1e2d40' }}>
                  —
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard key={task.id} task={task} onDelete={onDelete} onToggle={onToggle} />
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