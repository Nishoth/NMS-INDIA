import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiFilter, FiSend, FiClock, FiCheckCircle, FiAlertCircle } from "react-icons/fi";

const Notices = () => {
    const [search, setSearch] = useState("");

    // Dummy data
    const notices = [
        { id: 1, case_code: "CASE-00123", notice_no: 1, status: "sent", sent_at: "2024-01-15T10:30:00Z", target: "Rahul Sharma" },
        { id: 2, case_code: "CASE-00124", notice_no: 2, status: "draft", sent_at: null, target: "Priya Devi" },
        { id: 3, case_code: "CASE-00125", notice_no: 3, status: "delivered", sent_at: "2024-01-14T14:20:00Z", target: "Amit Kumar" },
    ];

    const filteredNotices = notices.filter(n => n.case_code.toLowerCase().includes(search.toLowerCase()) || n.target.toLowerCase().includes(search.toLowerCase()));

    const getStatusIcon = (status) => {
        switch (status) {
            case 'sent': return <FiSend className="w-4 h-4 text-blue-500" />;
            case 'draft': return <FiClock className="w-4 h-4 text-yellow-500" />;
            case 'delivered': return <FiCheckCircle className="w-4 h-4 text-green-500" />;
            case 'failed': return <FiAlertCircle className="w-4 h-4 text-red-500" />;
            default: return null;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'sent': return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
            case 'draft': return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case 'delivered': return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case 'failed': return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Track and manage legal notices</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                    <FiPlus className="w-4 h-4" />
                    Generate Notice
                </button>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search case or recipient..."
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

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Notice ID</th>
                                <th className="px-6 py-4">Case Code</th>
                                <th className="px-6 py-4">Recipient</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Sent At</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredNotices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No notices found.
                                    </td>
                                </tr>
                            ) : (
                                filteredNotices.map((n) => (
                                    <tr key={n.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                            Notice #{n.notice_no}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/cases/${n.case_code}`} className="font-semibold text-primary hover:underline">
                                                {n.case_code}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            {n.target}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${getStatusClass(n.status)}`}>
                                                {getStatusIcon(n.status)}
                                                <span className="capitalize">{n.status}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {n.sent_at ? new Date(n.sent_at).toLocaleString() : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary font-medium hover:underline">View Details</button>
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

export default Notices;
