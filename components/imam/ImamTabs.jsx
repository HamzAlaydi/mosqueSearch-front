import { Bell, Clock, CheckCircle, XCircle } from "lucide-react";

const ImamTabs = ({ tabValue, onTabChange, stats }) => {
  const tabs = [
    {
      id: 0,
      label: "All Requests",
      icon: Bell,
      badge: stats.total,
      badgeColor: "bg-blue-100 text-blue-800",
    },
    {
      id: 1,
      label: "Pending",
      icon: Clock,
      badge: stats.pending,
      badgeColor: "bg-yellow-100 text-yellow-800",
    },
    {
      id: 2,
      label: "Approved",
      icon: CheckCircle,
      badge: stats.approved,
      badgeColor: "bg-green-100 text-green-800",
    },
    {
      id: 3,
      label: "Denied",
      icon: XCircle,
      badge: stats.denied,
      badgeColor: "bg-red-100 text-red-800",
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tabValue === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(null, tab.id)}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden py-4 px-1 text-center text-sm font-medium hover:text-gray-700 focus:z-10 focus:outline-none
                  ${
                    isActive
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700 border-b-2 border-transparent"
                  }
                `}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Icon
                    className={`h-5 w-5 ${
                      isActive ? "text-blue-600" : "text-gray-400"
                    }`}
                  />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span
                      className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${tab.badgeColor}
                    `}
                    >
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span
                  aria-hidden="true"
                  className={`
                    absolute inset-x-0 bottom-0 h-0.5
                    ${isActive ? "bg-blue-600" : "bg-transparent"}
                  `}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ImamTabs;
