import React, { useState } from "react";
import { FiSearch, FiFilter, FiActivity } from "react-icons/fi";

const Audit = () => {
    const [search, setSearch] = useState("");

    // Dummy data
    const logs = [
        { id: 1, action: "CASE_CREATED", entity_type: "case", entity_id: "CASE-00123", actor: "Case Manager", actor_type: "internal", created_at: "2024-01-12T10:00:00Z" },
        { id: 2, action: "NOTICE_SENT", entity_type: "notice", entity_id: "Notice #1", actor: "Case Manager", actor_type: "internal", created_at: "2024-01-15T10:30:00Z" },
        { id: 3, action: "DOC_UPLOADED", entity_type: "document", entity_id: "Aadhar_Card.pdf", actor: "Rahul Sharma", actor_type: "victim", created_at: "2024-01-16T11:45:00Z" },
        { id: 4, action: "CASE_CLOSED", entity_type: "case", entity_id: "CASE-00100", actor: "System", actor_type: "system", created_at: "2024-01-18T23:59:00Z" },
    ];

    const filteredLogs = logs.filter(l =>
        l.action.toLowerCase().includes(search.toLowerCase()) ||
        l.entity_id.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">System-wide mandatory compliance and activity tracking</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search action or entity..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all dark:text-white"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FiFilter className="w-4 h-4" />
                        Type: All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Entity</th>
                                <th className="px-6 py-4">Actor</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Timestamp</th>
                                <th className="px-6 py-4 text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredLogs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No logs found.
                                    </td>
                                </tr>
                            ) : (
                                filteredLogs.map((l) => (
                                    <tr key={l.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <FiActivity className="w-4 h-4 text-primary" />
                                                <span className="font-semibold text-gray-900 dark:text-white">{l.action}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-500 capitalize">{l.entity_type}: </span>
                                            <span className="font-medium text-gray-900 dark:text-white">{l.entity_id}</span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            {l.actor}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${l.actor_type === 'internal' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    l.actor_type === 'victim' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                                                        'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                {l.actor_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(l.created_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-primary font-medium hover:underline text-xs">View Payload</button>
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

export default Audit;
