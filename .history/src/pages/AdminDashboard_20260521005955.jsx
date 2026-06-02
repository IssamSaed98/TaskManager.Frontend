import { useState, useEffect } from 'react'
import { getTasks, deleteTask, updateTask } from '../api'

function AdminDashboard({ onLogout }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllTasks()
  }, [])

  const loadAllTasks = async () => {
    try {
      setLoading(true)
      const response = await getTasks()
      setTasks(response.data)
    } catch {
      console.error('خطأ في تحميل المهام')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    loadAllTasks()
  }

  const handleToggle = async (task) => {
    await updateTask(task.id, { ...task, isCompleted: !task.isCompleted })
    loadAllTasks()
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.isCompleted).length
  const activeTasks = tasks.filter(t => !t.isCompleted).length
  const highPriority = tasks.filter(t => t.priority === 'High' && !t.isCompleted).length

  const priorityConfig = {
    High:   { tag: 'bg-red-100 text-red-600',    bar: 'bg-red-400',    label: 'عالية' },
    Medium: { tag: 'bg-yellow-100 text-yellow-600', bar: 'bg-yellow-400', label: 'متوسطة' },
    Low:    { tag: 'bg-green-100 text-green-600',  bar: 'bg-green-400',  label: 'منخفضة' },
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">

      {/* Header */}
      <div className="bg-gray-900 px-8 py-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center text-white text-sm font-bold">T</div>
          <span className="text-white font-bold text-base">TaskFlow</span>
        </div>
        <div className="flex-1" />
        <span className="text-xs text-yellow-400 font-medium px-3 py-1 bg-yellow-400/10 rounded-full">👑 لوحة المدير</span>
        <button onClick={onLogout} className="text-gray-400 hover:text-red-400 text-xs transition">
          تسجيل الخروج
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي المهام', value: totalTasks, color: 'text-blue-500', bg: 'bg-blue-50', icon: '📋' },
            { label: 'نشطة', value: activeTasks, color: 'text-orange-500', bg: 'bg-orange-50', icon: '⚡' },
            { label: 'منجزة', value: completedTasks, color: 'text-green-500', bg: 'bg-green-50', icon: '✅' },
            { label: 'عاجلة', value: highPriority, color: 'text-red-500', bg: 'bg-red-50', icon: '🔴' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.bg} rounded-2xl p-5 flex items-center gap-4`}>
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {totalTasks > 0 && (
          <div className="bg-white rounded-2xl p-5 mb-6 shadow-sm flex items-center gap-4">
            <span className="text-sm text-gray-500 whitespace-nowrap">نسبة إنجاز الفريق</span>
            <div className="flex-1 bg-gray-100 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: `${Math.round((completedTasks / totalTasks) * 100)}%` }}
              />
            </div>
            <span className="text-sm font-bold text-blue-500 whitespace-nowrap">
              {Math.round((completedTasks / totalTasks) * 100)}%
            </span>
          </div>
        )}

        {/* Tasks Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">كل مهام الفريق</h2>
            <span className="text-xs text-gray-400">{totalTasks} مهمة</span>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-16">جاري التحميل...</div>
          ) : tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-sm">لا توجد مهام</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500">
                  <th className="text-right px-6 py-3 font-medium">المهمة</th>
                  <th className="text-right px-4 py-3 font-medium">الأولوية</th>
                  <th className="text-right px-4 py-3 font-medium">الحالة</th>
                  <th className="text-right px-4 py-3 font-medium">تاريخ الإنشاء</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => {
                  const config = priorityConfig[task.priority] || priorityConfig.Medium
                  return (
                    <tr key={task.id} className="border-t border-gray-50 hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className={`font-medium text-sm text-gray-800 ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-xs text-gray-400 mt-0.5">{task.description}</div>