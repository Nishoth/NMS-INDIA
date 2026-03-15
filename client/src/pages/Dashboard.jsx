import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FiCalendar, FiClock, FiVideo, FiCheckCircle, 
    FiAlertCircle, FiLoader, FiArrowRight, FiUsers,
    FiFileText, FiActivity
} from 'react-icons/fi';
import { useApi } from '../hooks/useApi';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

const Dashboard = () => {
    const [meetings, setMeetings] = useState([]);
    const [notices, setNotices] = useState([]);
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const { handleRequest, getMeetings, getNotices, getCases } = useApi();
    const { userData, hasRole } = useAppContext();
    
    const isAdminOrSuperAdmin = hasRole('admin', 'superadmin');

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        
        // Fetch meetings
        const { data: meetingsData, error: meetingsError } = await handleRequest(() => getMeetings());
        if (meetingsError) {
            toast.error("Failed to fetch meetings");
        } else {
            setMeetings(meetingsData || []);
        }

        // Fetch notices
        const { data: noticesData, error: noticesError } = await handleRequest(() => getNotices());
        if (!noticesError) {
            setNotices(noticesData || []);
        }

        // Fetch cases
        const { data: casesData, error: casesError } = await handleRequest(() => getCases());
        if (!casesError) {
            setCases(casesData || []);
        }

        setLoading(false);
    };

    // Filter meetings based on role
    const filteredMeetings = isAdminOrSuperAdmin 
        ? meetings 
        : meetings.filter(m => 
            m.created_by === userData?.id || 
            m.participants?.includes(userData?.id)
        );

    // Get upcoming meetings (scheduled for future)
    const upcomingMeetings = filteredMeetings
        .filter(m => new Date(m.scheduled_at) > new Date())
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
        .slice(0, 5);

    // Get draft notices
    const draftNotices = notices.filter(n => n.status === 'draft').slice(0, 5);

    // Get active cases
    const activeCases = cases.filter(c => c.status !== 'CLOSED').slice(0, 5);

    const getMeetingStatus = (meeting) => {
        const now = new Date();
        const scheduled = new Date(meeting.scheduled_at);
        const isPast = scheduled < now;
        
        if (meeting.status === 'completed') return { label: 'Completed', color: 'green', icon: FiCheckCircle };
        if (meeting.status === 'cancelled') return { label: 'Cancelled', color: 'red', icon: FiAlertCircle };
        if (isPast) return { label: 'In Progress', color: 'blue', icon: FiVideo };
        return { label: 'Scheduled', color: 'yellow', icon: FiClock };
    };

    const getStatusClass = (color) => {
        const colors = {
            green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
            blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            yellow: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
            gray: 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400'
        };
        return colors[color] || colors.gray;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <FiLoader className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Welcome back, {userData?.username || 'User'}! Here's your overview.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                            <FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{upcomingMeetings.length}</p>
                            <p className="text-xs text-gray-500">Upcoming Meetings</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                            <FiFileText className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{draftNotices.length}</p>
                            <p className="text-xs text-gray-500">Draft Notices</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <FiActivity className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCases.length}</p>
                            <p className="text-xs text-gray-500">Active Cases</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <FiUsers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredMeetings.length}</p>
                            <p className="text-xs text-gray-500">Total Meetings</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upcoming Meetings */}
                <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiVideo className="text-primary" /> Upcoming Meetings
                        </h2>
                        <Link to="/meetings" className="text-sm text-primary hover:underline flex items-center gap-1">
                            View All <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {upcomingMeetings.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FiCalendar className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p>No upcoming meetings</p>
                            </div>
                        ) : (
                            upcomingMeetings.map((meeting) => {
                                const status = getMeetingStatus(meeting);
                                const StatusIcon = status.icon;
                                return (
                                    <div key={meeting.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                    {meeting.title || `Meeting for Case ${meeting.case_code}`}
                                                </h3>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {new Date(meeting.scheduled_at).toLocaleDateString()} at {' '}
                                                    {new Date(meeting.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                                {meeting.meeting_url && (
                                                    <a 
                                                        href={meeting.meeting_url} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline"
                                                    >
                                                        <FiVideo className="w-3 h-3" /> Join Meeting
                                                    </a>
                                                )}
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full flex items-center gap-1 ${getStatusClass(status.color)}`}>
                                                <StatusIcon className="w-3 h-3" />
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Draft Notices */}
                <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiFileText className="text-yellow-500" /> Draft Notices
                        </h2>
                        <Link to="/notices" className="text-sm text-primary hover:underline flex items-center gap-1">
                            View All <FiArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-white/5">
                        {draftNotices.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <FiCheckCircle className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                                <p>No draft notices - all caught up!</p>
                            </div>
                        ) : (
                            draftNotices.map((notice) => (
                                <div key={notice.id} className="p-4 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Notice #{notice.notice_no || notice.id?.slice(0, 8)}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Case: {notice.case_code || 'Unknown'}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                Created: {new Date(notice.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Link 
                                            to={`/cases/${notice.case_id}`}
                                            className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium whitespace-nowrap"
                                        >
                                            Send Now
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Active Cases */}
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <FiActivity className="text-green-500" /> Active Cases
                    </h2>
                    <Link to="/cases" className="text-sm text-primary hover:underline flex items-center gap-1">
                        View All <FiArrowRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-3">Case Code</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Notices</th>
                                <th className="px-6 py-3">Meetings</th>
                                <th className="px-6 py-3 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {activeCases.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No active cases
                                    </td>
                                </tr>
                            ) : (
                                activeCases.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            {c.case_code}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                c.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                                                c.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {c.notices?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {c.meetings?.length || 0}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Link to={`/cases/${c.id}`} className="text-primary hover:underline text-sm font-medium">
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;