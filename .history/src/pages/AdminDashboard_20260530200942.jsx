import { useState, useEffect } from 'react'

import { getUsers, getUserTasks, createTaskForUser, updateTask, deleteTask, getOrganization } from '../api'

function AdminDashboard({ onLogout }) {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [userTasks, setUserTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [orgInfo, setOrgInfo] = useState(null)

  // فورم المهمة الجديدة
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('Medium')
  const [dueDate, setDueDate] = useState('')

  useEffect(() => {
    loadUsers()
    loadOrgInfo()
  }, [])
  
  const loadOrgInfo = async () => {
    try {
      const response = await getOrganization()
      setOrgInfo(response.data)
    } catch {
      console.error('خطأ في تحميل المنظمة')
    }
  }

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers()
      setUsers(response.data)
    } catch {
      console.error('خطأ في تحميل الموظفين')
    } finally {
      setLoading(false)
    }
  }

  const selectUser = async (user) => {
    setSelectedUser(user)
    setShowForm(false)
    try {
      const response = await getUserTasks(user.id)
      setUserTasks(response.data)
    } catch {
      console.error('خطأ في تحميل المهام')
    }
  }

  const handleAddTask = async () => {
    if (!title || !selectedUser) return
    try {
      await createTaskForUser({
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        userId: selectedUser.id,
      })
      setTitle('')
      setDescription('')
      setPriority('Medium')
      setDueDate('')
      setShowForm(false)
      const response = await getUserTasks(selectedUser.id)
      setUserTasks(response.data)
      loadUsers()
    } catch {
      console.error('خطأ في إضافة المهمة')
    }
  }

  const handleToggle = async (task) => {
    await updateTask(task.id, { ...task, isCompleted: !task.isCompleted })
    const response = await getUserTasks(selectedUser.id)
    setUserTasks(response.data)
    loadUsers()
  }

  const handleDelete = async (id) => {
    await deleteTask(id)
    const response = await getUserTasks(selectedUser.id)
    setUserTasks(response.data)
    loadUsers()
  }

  const totalTasks = users.reduce((sum, u) => sum + u.totalTasks, 0)
  const completedTasks = users.reduce((sum, u) => sum + u.completedTasks, 0)
  const activeTasks = users.reduce((sum, u) => sum + u.activeTasks, 0)

  const priorityConfig = {
    High:   { tag: 'bg-red-900/30 text-red-400',    label: 'عالية' },
    Medium: { tag: 'bg-yellow-900/30 text-yellow-400', label: 'متوسطة' },
    Low:    { tag: 'bg-green-900/30 text-green-400',  label: 'منخفضة' },
  }

  const avatarColors = [
    'from-blue-600 to-blue-400',
    'from-green-600 to-green-400',
    'from-purple-600 to-purple-400',
    'from-yellow-600 to-yellow-400',
    'from-red-600 to-red-400',
  ]

  return (
    <div className="flex min-h-screen" style={{ background: '#0d1117', direction: 'rtl' }}>

      {/* Sidebar */}
      <div className="w-52 flex flex-col py-5 px-3 gap-1 flex-shrink-0" style={{ background: '#0a0f1a', borderLeft: '1px solid #1e2d40' }}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-2 pb-4 mb-2" style={{ borderBottom: '1px solid #1e2d40' }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', boxShadow: '0 0 12px rgba(21,101,192,0.4)' }}>✦</div>
          <span className="font-bold text-white text-sm">TaskFlow</span>
        </div>

        {/* Nav */}
        {[
          { label: 'لوحة التحكم', color: '#60a5fa', active: true },
          { label: 'الموظفون', color: '#4ade80' },
          { label: 'كل المهام', color: '#fbbf24' },
          { label: 'التقارير', color: '#a78bfa' },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs cursor-pointer transition-all"
            style={{
              background: item.active ? 'rgba(21,101,192,0.15)' : 'transparent',
              color: item.active ? '#60a5fa' : '#4a6080',
              border: item.active ? '0.5px solid rgba(21,101,192,0.25)' : '0.5px solid transparent'
            }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: item.color }}></div>
            {item.label}
          </div>
        ))}

        {/* User */}
        <div className="mt-auto pt-4 flex items-center gap-2 px-2" style={{ borderTop: '1px solid #1e2d40' }}>
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white">IS</div>
          <div>
            <div className="text-xs text-gray-400">Issam</div>
            <div className="text-xs" style={{ color: '#fbbf24' }}>👑 مدير</div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Topbar */}
        <div className="flex items-center gap-3 px-6 py-3" style={{ background: '#0a0f1a', borderBottom: '1px solid #1e2d40' }}>
          <span className="text-white font-semibold text-sm flex-1">لوحة تحكم المدير</span>
          {orgInfo && (
  <div className="flex items-center gap-2 px-3 py-1 rounded-lg" style={{ background: 'rgba(14,165,233,0.08)', border: '0.5px solid rgba(14,165,233,0.2)' }}>
    <span className="text-xs" style={{ color: 'rgba(14,165,233,0.6)' }}>🏢 {orgInfo.name}</span>
    <span className="text-xs font-bold" style={{ color: '#60a5fa' }}>ID: {orgInfo.id}</span>
  </div>
)}
          <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24', border: '0.5px solid rgba(251,191,36,0.2)' }}>👑 Admin</span>
          <button onClick={onLogout} className="text-xs px-3 py-1 rounded-lg transition-all" style={{ color: '#4a6080', border: '0.5px solid #1e2d40', background: 'transparent' }}>
            تسجيل الخروج
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'إجمالي المهام', value: totalTasks, color: '#60a5fa', bg: 'rgba(21,101,192,0.08)', border: 'rgba(21,101,192,0.2)', icon: '📋' },
              { label: 'الموظفون', value: users.length, color: '#a78bfa', bg: 'rgba(124,58,237,0.08)', border: 'rgba(124,58,237,0.2)', icon: '👥' },
              { label: 'منجزة', value: completedTasks, color: '#4ade80', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', icon: '✅' },
              { label: 'نشطة', value: activeTasks, color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.2)', icon: '⚡' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-4 flex items-center gap-4" style={{ background: s.bg, border: `0.5px solid ${s.border}` }}>
                <div className="text-2xl">{s.icon}</div>
                <div>
                  <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#3a5070' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Two col */}
          <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '220px 1fr' }}>

            {/* Employees */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
              <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '0.5px solid #1e2d40' }}>
                <span className="text-sm font-semibold text-white">الموظفون</span>
                <span className="text-xs" style={{ color: '#3a5070' }}>{users.length} موظف</span>
              </div>
              <div className="p-2">
                {loading ? (
                  <div className="text-center py-8 text-xs" style={{ color: '#3a5070' }}>جاري التحميل...</div>
                ) : users.length === 0 ? (
                  <div className="text-center py-8 text-xs" style={{ color: '#3a5070' }}>لا يوجد موظفون</div>
                ) : users.map((user, i) => {
                  const pct = user.totalTasks > 0 ? Math.round((user.completedTasks / user.totalTasks) * 100) : 0
                  const isSelected = selectedUser?.id === user.id
                  const initials = user.username.slice(0, 2).toUpperCase()
                  return (
                    <div key={user.id} onClick={() => selectUser(user)}
                      className="flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all mb-1"
                      style={{
                        background: isSelected ? 'rgba(21,101,192,0.12)' : 'transparent',
                        border: isSelected ? '0.5px solid rgba(21,101,192,0.25)' : '0.5px solid transparent'
                      }}>
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate" style={{ color: '#c0d8f0' }}>{user.username}</div>
                        <div className="text-xs mt-0.5" style={{ color: '#3a5070' }}>{user.completedTasks}/{user.totalTasks} منجزة</div>
                        <div className="mt-1 h-1 rounded-full overflow-hidden" style={{ background: '#1e2d40' }}>
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: '#60a5fa' }} />
                        </div>
                      </div>
                      <div className="text-xs font-bold" style={{ color: '#60a5fa' }}>{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tasks */}
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: '0.5px solid #1e2d40' }}>
                <span className="text-sm font-semibold text-white">
                  {selectedUser ? `مهام ${selectedUser.username}` : 'اختر موظفاً لعرض مهامه'}
                </span>
                {selectedUser && (
                  <button onClick={() => setShowForm(!showForm)}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all"
                    style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
                    + إضافة مهمة
                  </button>
                )}
              </div>

              {/* Form */}
              {showForm && (
                <div className="p-4 grid grid-cols-2 gap-3" style={{ borderBottom: '0.5px solid #1e2d40', background: '#0d1520' }}>
                  <input value={title} onChange={e => setTitle(e.target.value)} placeholder="عنوان المهمة *"
                    className="col-span-2 rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
                  <input value={description} onChange={e => setDescription(e.target.value)} placeholder="الوصف"
                    className="rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
                  <select value={priority} onChange={e => setPriority(e.target.value)}
                    className="rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }}>
                    <option value="Low">منخفضة</option>
                    <option value="Medium">متوسطة</option>
                    <option value="High">عالية</option>
                  </select>
                  <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)}
                    className="rounded-lg px-3 py-2 text-xs outline-none"
                    style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
                  <button onClick={handleAddTask}
                    className="rounded-lg py-2 text-xs font-medium"
                    style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
                    حفظ المهمة
                  </button>
                </div>
              )}

              {/* Tasks list */}
              {!selectedUser ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: '#3a5070' }}>
                  <div className="text-4xl mb-3">👈</div>
                  <p className="text-xs">اختر موظفاً من القائمة</p>
                </div>
              ) : userTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16" style={{ color: '#3a5070' }}>
                  <div className="text-4xl mb-3">📭</div>
                  <p className="text-xs">لا توجد مهام لهذا الموظف</p>
                </div>
              ) : (
                <div>
                  {userTasks.map(task => {
                    const config = priorityConfig[task.priority] || priorityConfig.Medium
                    return (
                      <div key={task.id} className="flex items-center gap-3 px-5 py-3 transition-all"
                        style={{ borderBottom: '0.5px solid #0f1a27' }}>
                        <div className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ background: task.isCompleted ? '#4ade80' : task.priority === 'High' ? '#f87171' : '#fbbf24' }} />
                        <div className="flex-1">
                          <div className={`text-xs font-medium ${task.isCompleted ? 'line-through' : ''}`}
                            style={{ color: task.isCompleted ? '#3a5070' : '#c0d8f0' }}>
                            {task.title}
                          </div>
                          {task.description && (
                            <div className="text-xs mt-0.5" style={{ color: '#3a5070' }}>{task.description}</div>
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${config.tag}`}>{config.label}</span>
                        <button onClick={() => handleToggle(task)}
                          className="text-xs px-2 py-0.5 rounded-full transition-all"
                          style={{
                            background: task.isCompleted ? 'rgba(34,197,94,0.1)' : 'rgba(21,101,192,0.1)',
                            color: task.isCompleted ? '#4ade80' : '#60a5fa'
                          }}>
                          {task.isCompleted ? '✓ منجزة' : 'نشطة'}
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="text-xs transition-all" style={{ color: '#3a5070' }}>
                          🗑
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard