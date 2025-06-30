import { useState, useEffect } from "react";
import {
  Shield,
  Users,
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

const SuperAdminHeader = ({
  imamRequests = [],
  imamMosqueRequests = [],
  loading = false,
}) => {
  const [stats, setStats] = useState({
    totalImamRequests: 0,
    pendingImamRequests: 0,
    approvedImamRequests: 0,
    deniedImamRequests: 0,
    totalMosqueRequests: 0,
    pendingMosqueRequests: 0,
    approvedMosqueRequests: 0,
    deniedMosqueRequests: 0,
  });

  useEffect(() => {
    if (!loading) {
      // Calculate imam request stats
      const imamStats = {
        total: imamRequests.length,
        pending: imamRequests.filter((req) => req.status === "pending").length,
        approved: imamRequests.filter((req) => req.status === "approved")
          .length,
        denied: imamRequests.filter((req) => req.status === "denied").length,
      };

      // Calculate mosque request stats
      const mosqueStats = {
        total: imamMosqueRequests.length,
        pending: imamMosqueRequests.filter((req) => req.status === "pending")
          .length,
        approved: imamMosqueRequests.filter((req) => req.status === "approved")
          .length,
        denied: imamMosqueRequests.filter((req) => req.status === "denied")
          .length,
      };

      setStats({
        totalImamRequests: imamStats.total,
        pendingImamRequests: imamStats.pending,
        approvedImamRequests: imamStats.approved,
        deniedImamRequests: imamStats.denied,
        totalMosqueRequests: mosqueStats.total,
        pendingMosqueRequests: mosqueStats.pending,
        approvedMosqueRequests: mosqueStats.approved,
        deniedMosqueRequests: mosqueStats.denied,
      });
    }
  }, [imamRequests, imamMosqueRequests, loading]);

  const statCards = [
    {
      title: "Total Imam Requests",
      value: stats.totalImamRequests,
      icon: Users,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Pending Imam Requests",
      value: stats.pendingImamRequests,
      icon: Clock,
      color: "bg-yellow-500",
      textColor: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Approved Imam Requests",
      value: stats.approvedImamRequests,
      icon: CheckCircle,
      color: "bg-green-500",
      textColor: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Denied Imam Requests",
      value: stats.deniedImamRequests,
      icon: XCircle,
      color: "bg-red-500",
      textColor: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Total Mosque Requests",
      value: stats.totalMosqueRequests,
      icon: Building,
      color: "bg-purple-500",
      textColor: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Pending Mosque Requests",
      value: stats.pendingMosqueRequests,
      icon: AlertCircle,
      color: "bg-orange-500",
      textColor: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  if (loading) {
    return (
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gray-100 rounded-lg animate-pulse">
                <div className="h-6 w-6 bg-gray-300 rounded"></div>
              </div>
              <div>
                <div className="h-8 w-48 bg-gray-300 rounded animate-pulse"></div>
                <div className="h-4 w-64 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Shield className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Super Admin Dashboard
              </h1>
              <p className="text-sm text-gray-600">
                Manage imam requests, mosque assignments, and system
                administration
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 pb-6">
          {statCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className={`${card.bgColor} rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow duration-200`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className={`text-2xl font-bold ${card.textColor}`}>
                      {card.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${card.color} bg-opacity-10`}>
                    <Icon className={`h-5 w-5 ${card.textColor}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminHeader;
