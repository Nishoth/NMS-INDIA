import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiFilter, FiVideo, FiCalendar, FiClock, FiLoader, FiExternalLink } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const Meetings = () => {
    const [search, setSearch] = useState("");
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { handleRequest, getMeetings } = useApi();

    useEffect(() => {
        const fetchMeetings = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getMeetings());
            if (error) {
                toast.error("Failed to load meetings");
            } else if (data) {
                setMeetings(data);
            }
            setLoading(false);
        };
        fetchMeetings();
    }, []);

    const filteredMeetings = meetings.filter(m => (m.case_code || "").toLowerCase().includes(search.toLowerCase()));

    const getStatusClass = (status) => {
        switch (status) {
            case 'scheduled': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case 'completed': return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case 'cancelled': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meetings & Hearings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Schedule and manage virtual hearings</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                    <FiCalendar className="w-4 h-4" />
                    Schedule Meeting
                </button>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by case code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all dark:text-white"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FiFilter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto min-h-[300px]">
                    {loading ? (
                        <div className="flex justify-center items-center py-20 text-gray-500">
                            <FiLoader className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : (
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Case Code</th>
                                    <th className="px-6 py-4">Date & Time</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Provider</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {filteredMeetings.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            No meetings found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMeetings.map((m) => {
                                        const d = new Date(m.scheduled_at);
                                        return (
                                            <tr key={m.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    <Link to={`/cases/${m.case_id}`} className="font-semibold text-primary hover:underline">
                                                        {m.case_code || "Unknown Case"}
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                    <div className="flex items-center gap-2">
                                                        <FiClock className="w-4 h-4 text-gray-400" />
                                                        <span>{d.toLocaleDateString()} {d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${getStatusClass(m.status)}`}>
                                                        {m.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-500 uppercase text-xs tracking-wider">
                                                    {m.meet_provider ? m.meet_provider.replace("_", " ") : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-right flex gap-3 justify-end">
                                                    {m.meet_url && m.status === 'scheduled' ? (
                                                        <a
                                                            href={m.meet_url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors font-medium border border-transparent"
                                                        >
                                                            <FiVideo className="w-4 h-4" />
                                                            Join Call
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400 flex items-center justify-center h-[34px] px-3">-</span>
                                                    )}
                                                    <Link
                                                        to={`/meetings/${m.id}`}
                                                        className="inline-flex items-center gap-2 px-3 py-1.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 transition-colors font-medium"
                                                    >
                                                        Details
                                                        <FiExternalLink className="w-4 h-4" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Meetings;
