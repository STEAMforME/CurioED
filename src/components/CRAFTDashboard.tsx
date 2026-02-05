import React from 'react';
import { useCRAFT } from '../context/CRAFTContext';
import ModuleSwitcher from './ModuleSwitcher';
import { 
  Award, 
  TrendingUp, 
  Calendar,
  Target,
  BookOpen,
  Users
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: number;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {trend !== undefined && (
          <p className="text-sm mt-2">
            <span className={trend >= 0 ? 'text-green-600' : 'text-red-600'}>
              {trend >= 0 ? '+' : ''}{trend}%
            </span>
            <span className="text-gray-500 ml-1">from last week</span>
          </p>
        )}
      </div>
      <div className={`p-3 rounded-full bg-opacity-10 ${color.replace('text', 'bg')}`}>
        <Icon className={`w-6 h-6 ${color}`} />
      </div>
    </div>
  </div>
);

interface RecentActivityItem {
  id: string;
  type: 'achievement' | 'course' | 'mentor' | 'quest';
  title: string;
  description: string;
  timestamp: Date;
}

const CRAFTDashboard: React.FC = () => {
  const { userProfile, activeModule } = useCRAFT();

  // Mock data - will be replaced with real data from backend
  const stats = {
    totalXP: userProfile?.progress?.totalXP || 0,
    level: userProfile?.progress?.level || 1,
    coursesInProgress: userProfile?.progress?.coursesInProgress || 0,
    completedQuests: userProfile?.progress?.completedQuests || 0,
    mentoringSessions: userProfile?.progress?.mentoringSessions || 0,
  };

  const recentActivities: RecentActivityItem[] = [
    {
      id: '1',
      type: 'achievement',
      title: 'First Steps',
      description: 'Completed your first learning module',
      timestamp: new Date()
    },
    {
      id: '2',
      type: 'course',
      title: 'Introduction to STEAM',
      description: 'Started new course',
      timestamp: new Date()
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {userProfile?.name || 'Learner'}!
              </h1>
              <p className="text-gray-600 mt-1">
                {userProfile?.role && (
                  <span className="capitalize">{userProfile.role}</span>
                )}
                {' · '}
                Level {stats.level} · {stats.totalXP} XP
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Active Module</p>
                <p className="font-semibold capitalize">{activeModule}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Module Switcher */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">CRAFT Modules</h2>
          <ModuleSwitcher variant="grid" />
        </div>

        {/* Stats Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total XP"
              value={stats.totalXP.toLocaleString()}
              icon={Award}
              trend={12}
              color="text-purple-600"
            />
            <StatCard
              title="Current Level"
              value={stats.level}
              icon={TrendingUp}
              color="text-blue-600"
            />
            <StatCard
              title="Courses in Progress"
              value={stats.coursesInProgress}
              icon={BookOpen}
              trend={8}
              color="text-green-600"
            />
            <StatCard
              title="Mentoring Sessions"
              value={stats.mentoringSessions}
              icon={Users}
              color="text-orange-600"
            />
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map(activity => (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-b-0">
                      <div className="flex-shrink-0">
                        {activity.type === 'achievement' && <Award className="w-5 h-5 text-yellow-500" />}
                        {activity.type === 'course' && <BookOpen className="w-5 h-5 text-blue-500" />}
                        {activity.type === 'mentor' && <Users className="w-5 h-5 text-green-500" />}
                        {activity.type === 'quest' && <Target className="w-5 h-5 text-purple-500" />}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions & Upcoming */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Continue Learning</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Find a Mentor</span>
                  </div>
                </button>
                <button className="w-full text-left px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-600" />
                    <span className="font-medium">Start a Quest</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Upcoming
              </h2>
              <p className="text-gray-500 text-sm">No upcoming events</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CRAFTDashboard;
