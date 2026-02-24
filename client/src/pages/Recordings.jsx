import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiUploadCloud, FiSearch, FiVideo, FiDownload, FiPlayCircle, FiLock } from "react-icons/fi";

const Recordings = () => {
    const [search, setSearch] = useState("");

    // Dummy data
    const recordings = [
        { id: 1, case_code: "CASE-00123", meeting_id: 101, file_name: "Hearing_2024_01_20.mp4", size: "450 MB", uploaded_at: "2024-01-20T11:45:00Z", internal_only: true },
        { id: 2, case_code: "CASE-00124", meeting_id: 102, file_name: "Initial_Meeting.mp4", size: "210 MB", uploaded_at: "2024-01-18T15:30:00Z", internal_only: true },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recordings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage arbitration dispute video recordings</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                    <FiUploadCloud className="w-4 h-4" />
                    Upload Recording
                </button>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search case code..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all dark:text-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Recording details</th>
                                <th className="px-6 py-4">Case Code</th>
                                <th className="px-6 py-4">Meeting ID</th>
                                <th className="px-6 py-4">Access</th>
                                <th className="px-6 py-4">Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {recordings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No recordings found.
                                    </td>
                                </tr>
                            ) : (
                                recordings.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                                                <FiVideo className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{r.file_name}</p>
                                                <p className="text-xs text-gray-500">{r.size}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/cases/${r.case_code}`} className="font-semibold text-primary hover:underline">
                                                {r.case_code}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            #{r.meeting_id}
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.internal_only && (
                                                <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md text-xs font-semibold">
                                                    <FiLock className="w-3 h-3" />
                                                    Internal Only
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(r.uploaded_at).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors" title="Play">
                                                    <FiPlayCircle className="w-5 h-5" />
                                                </button>
                                                <button className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors" title="Download">
                                                    <FiDownload className="w-5 h-5" />
                                                </button>
                                            </div>
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

export default Recordings;
