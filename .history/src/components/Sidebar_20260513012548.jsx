import { FaTasks, FaHome, FaUsers, FaCog } from 'react-icons/fa'

function Sidebar({ activeFilter, setActiveFilter }) {
  const navItems = [
    { key: 'all', icon: <FaHome />, label: 'الرئيسية' },
    { key: 'active', icon: <FaTasks />, label: 'مهامي' },
    { key: 'team', icon: <FaUsers />, label: 'الفريق' },
    { key: 'settings', icon: <FaCog />, label: 'الإعدادات' },
  ]

  return (
    <div className="w-56 bg-gray-900 min-h-screen p-4 flex flex-col gap-1">
      
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-gray-700">
        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
        <span className="font-semibold text-white text-sm">TaskFlow</span>
      </div>

      {/* Nav Items */}
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => setActiveFilter(item.key)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full text-right ${
            activeFilter === item.key
              ? 'bg-gray-700 text-white font-medium'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          <span className="text-xs">{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* User */}
      <div className="mt-auto flex items-center gap-2 px-2 pt-4 border-t border-gray-700">
        <div className="w-7 h-7 rounded-full bg-purple-500 flex items-center justify-center text-xs font-medium text-white">
          IS
        </div>
        <span className="text-xs text-gray-400">Issam</span>
      </div>

    </div>
  )
}

export default Sidebar