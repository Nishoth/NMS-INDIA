import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiClock, FiCheckCircle, FiAlertCircle, FiVideo, FiFileText, FiLink, FiLoader, FiCalendar } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const MeetingDetail = () => {
    const { id } = useParams();
    const [meeting, setMeeting] = useState(null);
    const [loading, setLoading] = useState(true);
    const { handleRequest, getMeeting } = useApi();

    useEffect(() => {
        const fetchMeeting = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getMeeting(id));
            if (error) {
                toast.error("Failed to load meeting details");
            } else if (data) {
                setMeeting(data);
            }
            setLoading(false);
        };
        fetchMeeting();
    }, [id]);

    const getStatusIcon = (status) => {
        switch (status) {
            case 'scheduled': return <FiClock className="w-5 h-5 text-blue-500" />;
            case 'completed': return <FiCheckCircle className="w-5 h-5 text-green-500" />;
            case 'cancelled': return <FiAlertCircle className="w-5 h-5 text-red-500" />;
            default: return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'scheduled': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case 'completed': return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case 'cancelled': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <FiLoader className="w-8 h-8 animate-spin text-primary" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading hearing details...</p>
            </div>
        );
    }

    if (!meeting) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <FiAlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Meeting Not Found</h2>
                <Link to="/meetings" className="text-primary hover:underline font-medium">
                    &larr; Back to Meetings
                </Link>
            </div>
        );
    }

    const meetingDate = new Date(meeting.scheduled_at);

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Link
                    to="/meetings"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            Hearing: {meeting.case_code || "Unknown Case"}
                        </h1>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full w-fit ${getStatusClass(meeting.status)}`}>
                            {getStatusIcon(meeting.status)}
                            <span className="capitalize">{meeting.status}</span>
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        System ID: {meeting.id}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Hearing Context Block */}
                    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiCalendar className="text-primary" /> Schedule Information
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Scheduled Date & Time</p>
                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiClock className="text-primary w-4 h-4" />
                                    {meetingDate.toLocaleDateString()} at {meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Case Link</p>
                                {meeting.case_code ? (
                                    <Link to={`/cases/${meeting.case_id}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                                        {meeting.case_code} <FiLink className="w-3 h-3" />
                                    </Link>
                                ) : (
                                    <Link to={`/cases/${meeting.case_id}`} className="font-medium text-primary hover:underline flex items-center gap-1">
                                        View Case <FiLink className="w-3 h-3" />
                                    </Link>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Provider Platform</p>
                                <p className="font-medium text-gray-900 dark:text-white uppercase">
                                    {meeting.meet_provider ? meeting.meet_provider.replace("_", " ") : "N/A"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Created At</p>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">
                                    {new Date(meeting.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Internal Notes */}
                    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiFileText className="text-primary" /> Internal Notes
                        </h2>

                        {meeting.notes ? (
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-100 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                                {meeting.notes}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-500 italic text-center py-6">
                                No internal notes provided for this hearing schedule.
                            </p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Join Links Card */}
                    {(meeting.meet_url || meeting.portal_url) ? (
                        <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-2xl shadow-sm">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FiLink className="text-primary" /> External Access
                            </h2>

                            <div className="space-y-4">
                                {meeting.meet_url && (
                                    <div className="bg-white dark:bg-[#1f2937] p-3 rounded-xl border border-primary/10 group relative">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Conference Meet Link</p>
                                        <div className="flex items-center gap-2">
                                            <div className="truncate text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">
                                                {meeting.meet_url}
                                            </div>
                                            <a
                                                href={meeting.meet_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="shrink-0 w-8 h-8 bg-green-100 text-green-700 hover:bg-green-600 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                                title="Open Conference"
                                            >
                                                <FiVideo className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}

                                {meeting.portal_url && (
                                    <div className="bg-white dark:bg-[#1f2937] p-3 rounded-xl border border-primary/10 group relative">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Victim Portal Entry</p>
                                        <div className="flex items-center gap-2">
                                            <div className="truncate text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">
                                                {meeting.portal_url}
                                            </div>
                                            <a
                                                href={meeting.portal_url}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="shrink-0 w-8 h-8 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-colors"
                                                title="Open Portal"
                                            >
                                                <FiLink className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 dark:bg-[#1f2937] border border-gray-100 dark:border-white/5 p-6 rounded-2xl shadow-sm text-center">
                            <FiVideo className="w-8 h-8 mx-auto text-gray-400 mb-3" />
                            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">No Access Links</h3>
                            <p className="text-xs text-gray-500 mt-1">This meeting does not have associated virtual rooms.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default MeetingDetail;
