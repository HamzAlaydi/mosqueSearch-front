import { useState } from "react";
import {
  Users,
  Building,
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";

const SuperAdminTabs = ({
  activeTab,
  onTabChange,
  imamRequests = [],
  imamMosqueRequests = [],
}) => {
  const tabs = [
    {
      id: 0,
      label: "Imam Requests",
      icon: Users,
      count: imamRequests.length,
      pendingCount: imamRequests.filter((req) => req.status === "pending")
        .length,
    },
    {
      id: 1,
      label: "Imam Mosque Requests",
      icon: Building,
      count: imamMosqueRequests.length,
      pendingCount: imamMosqueRequests.filter((req) => req.status === "pending")
        .length,
    },
    {
      id: 2,
      label: "Mosque Management",
      icon: Building,
      count: 0,
      pendingCount: 0,
    },
    {
      id: 3,
      label: "User Management",
      icon: UserCheck,
      count: 0,
      pendingCount: 0,
    },
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const hasPending = tab.pendingCount > 0;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(null, tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  isActive
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {hasPending && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {tab.pendingCount}
                  </span>
                )}
                {tab.count > 0 && !hasPending && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminTabs;
