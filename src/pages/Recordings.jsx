import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUploadCloud, FiSearch, FiVideo, FiDownload, FiPlayCircle, FiLock, FiLoader } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const Recordings = () => {
    const [search, setSearch] = useState("");
    const [recordings, setRecordings] = useState([]);
    const [loading, setLoading] = useState(true);
    const { handleRequest, getRecordings, downloadRecording } = useApi();

    useEffect(() => {
        const fetchRecordings = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getRecordings());
            if (error) {
                toast.error("Failed to fetch recordings");
            } else if (data) {
                setRecordings(data);
            }
            setLoading(false);
        };
        fetchRecordings();
    }, []);

    const handleRecordingDownload = async (recordingId, fileName) => {
        const { data, error } = await handleRequest(() => downloadRecording(recordingId));
        if (error) {
            toast.error("Failed to download recording");
        } else if (data) {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'recording.webm');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    const filteredRecs = recordings.filter(r =>
        (r.file_name && r.file_name.toLowerCase().includes(search.toLowerCase())) ||
        (r.case_code && r.case_code.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recordings</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage arbitration dispute secure video recordings</p>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search case code or name..."
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
                                <th className="px-6 py-4">Recording Details</th>
                                <th className="px-6 py-4">Case Code</th>
                                <th className="px-6 py-4">Meeting ID</th>
                                <th className="px-6 py-4">Access Level</th>
                                <th className="px-6 py-4">Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <FiLoader className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                                        Loading recordings...
                                    </td>
                                </tr>
                            ) : filteredRecs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No recordings found.
                                    </td>
                                </tr>
                            ) : (
                                filteredRecs.map((r) => (
                                    <tr key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-500">
                                                <FiVideo className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]" title={r.file_name}>
                                                    {r.file_name}
                                                </p>
                                                <p className="text-xs text-gray-500">{(r.size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {r.case_code ? (
                                                <Link to={`/cases/${r.case_id}`} className="font-semibold text-primary hover:underline">
                                                    {r.case_code}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">Unlinked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {r.meeting_id ? `#${r.meeting_id}` : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 rounded-md text-xs font-semibold uppercase">
                                                <FiLock className="w-3 h-3" />
                                                Internal Only
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleRecordingDownload(r.id, r.file_name)}
                                                    className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                                                    title="Download"
                                                >
                                                    <FiDownload className="w-5 h-5" />
                                                </button>
                                                <Link
                                                    to={`/recordings/${r.id}`}
                                                    className="p-2 text-primary hover:text-primary-dark rounded-lg hover:bg-primary/10 transition-colors flex items-center gap-1"
                                                >
                                                    <FiPlayCircle className="w-5 h-5" />
                                                    <span className="text-xs font-bold uppercase">Playback</span>
                                                </Link>
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
