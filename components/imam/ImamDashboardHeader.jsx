import Link from "next/link";
import {
  LayoutDashboard as DashboardIcon,
  Plus as AddIcon,
  Bell,
  TrendingUp,
  Users,
  Building2,
} from "lucide-react";
import styles from "./ImamDashboard.module.css";

const ImamDashboardHeader = ({ stats = {} }) => {
  // Provide default values for stats
  const { total = 0, pending = 0, approved = 0, denied = 0 } = stats;

  return (
    <div className={styles.imamDashboardHeader}>
      <div className={styles.imamDashboardContent}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6">
          {/* Header Title and Navigation */}
          <div className="flex items-center space-x-4 mb-4 sm:mb-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DashboardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Imam Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Manage verification requests and mosque assignments
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <Link
              href="/imam/request-mosques"
              className={styles.imamDashboardButton}
            >
              <AddIcon className="h-4 w-4 mr-2" />
              Request More Mosques
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCard}`}>
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <h3>Total Requests</h3>
                <div className={styles.statNumber}>{total}</div>
              </div>
              <Bell className={styles.statIcon} />
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCard} ${styles.statCard.pending}`}
          >
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <h3>Pending</h3>
                <div className={styles.statNumber}>{pending}</div>
              </div>
              <TrendingUp className={styles.statIcon} />
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCard} ${styles.statCard.approved}`}
          >
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <h3>Approved</h3>
                <div className={styles.statNumber}>{approved}</div>
              </div>
              <Users className={styles.statIcon} />
            </div>
          </div>

          <div
            className={`${styles.statCard} ${styles.statCard} ${styles.statCard.denied}`}
          >
            <div className={styles.statContent}>
              <div className={styles.statInfo}>
                <h3>Denied</h3>
                <div className={styles.statNumber}>{denied}</div>
              </div>
              <Building2 className={styles.statIcon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImamDashboardHeader;
