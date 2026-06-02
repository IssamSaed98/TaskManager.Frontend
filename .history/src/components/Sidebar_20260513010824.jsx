import { FaTasks, FaHome, FaUsers, FaCog } from 'react-icons/fa'

function Sidebar({ activeFilter, setActiveFilter }) {
  const navItems = [
    { key: 'all', icon: <FaHome />, label: 'الرئيسية' },
    { key: 'active', icon: <FaTasks />, label: 'مهامي' },
    { key: 'team', icon: <FaUsers />, label: 'الفريق' },
    { key: 'settings', icon: <FaCog />, label: 'الإعدادات' },
  ]

  return (
    <div className="w-52 bg-gray-50 border-l border-gray-200 min-h-screen p-4 flex flex-col gap-1">
      
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 pb-4 mb-2 border-b border-gray-200">
        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
        <span className="font-semibold text-gray-800 text-sm">TaskFlow</span>
      </div>

      {/* Nav Items */}
      {navItems.map((item) => (
        <button
          key={item.key}
          onClick={() => setActiveFilter(item.key)}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition w-full text-right ${
            activeFilter === item.key
              ? 'bg-white text-gray-800 font-medium shadow-sm border border-gray-200'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
        >
          <span className="text-xs">{item.icon}</span>
          {item.label}
        </button>
      ))}

      {/* User */}
      <div className="mt-auto flex items-center gap-2 px-2 pt-4 border-t border-gray-200">
        <div className="w-7 h-7 rounded-full bg-purple-200 flex items-center justify-center text-xs font-medium text-purple-700">
          IS
        </div>
        <span className="text-xs text-gray-600">Issam</span>
      </div>

    </div>
  )
}

export default Sidebar