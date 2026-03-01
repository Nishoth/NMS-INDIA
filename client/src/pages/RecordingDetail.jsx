import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiVideo, FiDownload, FiClock, FiLock, FiAlertCircle, FiLoader } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const RecordingDetail = () => {
    const { id } = useParams();
    const [recording, setRecording] = useState(null);
    const [loading, setLoading] = useState(true);
    const [videoUrl, setVideoUrl] = useState(null);
    const { handleRequest, getRecording, downloadRecording } = useApi();

    useEffect(() => {
        const fetchRecording = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getRecording(id));
            if (error) {
                toast.error("Failed to load recording metadata");
            } else if (data) {
                setRecording(data);
                fetchVideoBlob(data.id);
            }
            setLoading(false);
        };
        fetchRecording();
    }, [id]);

    const fetchVideoBlob = async (recId) => {
        const { data, error } = await handleRequest(() => downloadRecording(recId));
        if (!error && data) {
            const url = window.URL.createObjectURL(new Blob([data], { type: 'video/webm' }));
            setVideoUrl(url);
        }
    };

    const handleDownload = () => {
        if (!videoUrl || !recording) return;
        const link = window.document.createElement('a');
        link.href = videoUrl;
        link.setAttribute('download', recording.file_name || 'playback.webm');
        window.document.body.appendChild(link);
        link.click();
        link.remove();
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <FiLoader className="w-8 h-8 animate-spin text-primary" />
                <p className="text-gray-500 font-medium">Decrypting video channel...</p>
            </div>
        );
    }

    if (!recording) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <FiAlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recording Not Found</h2>
                <Link to="/recordings" className="text-primary hover:underline">Return to Library</Link>
            </div>
        );
    }

    const recDate = new Date(recording.created_at);

    // Anti-screenshot logic
    const handleContextMenu = (e) => e.preventDefault();
    const watermarkText = "admin@jls.in - SECURE ARBITRATION VIEW";

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in select-none" onContextMenu={handleContextMenu}>
            {/* Header */}
            <div className="flex items-center justify-between gap-4 bg-white dark:bg-[#1f2937] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-4">
                    <Link to="/recordings" className="p-2 bg-gray-50 text-gray-500 hover:text-gray-900 rounded-xl transition-colors">
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <FiVideo className="text-primary" />
                            {recording.file_name}
                        </h1>
                        <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-mono">HASH ID: {recording.id}</p>
                    </div>
                </div>
                <button
                    onClick={handleDownload}
                    className="h-10 px-4 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2"
                >
                    <FiDownload /> Download Segment
                </button>
            </div>

            {/* Main Video Stage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Embedded Player */}
                <div className="lg:col-span-2 relative bg-black rounded-2xl overflow-hidden shadow-2xl aspect-video border border-white/10 group">
                    {/* Security Overlay */}
                    <div className="absolute inset-0 pointer-events-none z-10 opacity-30 flex flex-wrap content-center justify-center gap-8 overflow-hidden">
                        {Array(10).fill(watermarkText).map((text, i) => (
                            <div key={i} className="text-white text-xl font-bold uppercase transform -rotate-45 whitespace-nowrap opacity-20">
                                {text}
                            </div>
                        ))}
                    </div>

                    {videoUrl ? (
                        <video
                            src={videoUrl}
                            controls
                            controlsList="nodownload noplaybackrate"
                            disablePictureInPicture
                            className="w-full h-full object-contain relative z-0"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <FiLoader className="w-10 h-10 animate-spin text-gray-600" />
                        </div>
                    )}
                </div>

                {/* Metadata Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                        <h3 className="font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/10 pb-2">Properties</h3>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Context Mapping</p>
                            {recording.case_code ? (
                                <Link to={`/cases/${recording.case_id}`} className="font-semibold text-primary hover:underline text-sm truncate block">
                                    {recording.case_code}
                                </Link>
                            ) : (
                                <span className="text-sm text-gray-400">Unlinked</span>
                            )}
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Meeting Source ID</p>
                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                {recording.meeting_id ? `#${recording.meeting_id}` : "Orphaned Blob"}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Ingestion Timestamp</p>
                            <div className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                <FiClock className="text-primary w-4 h-4" />
                                {recDate.toLocaleString()}
                            </div>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">MIME Stream Type</p>
                            <span className="text-sm font-mono text-gray-700 dark:text-gray-300 uppercase">
                                {recording.mime_type || "video/webm"}
                            </span>
                        </div>

                        <div>
                            <p className="text-xs text-gray-500 mb-1">Payload Size</p>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {(recording.size_bytes / (1024 * 1024)).toFixed(2)} MB
                            </span>
                        </div>
                    </div>

                    <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 p-5 rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                            <FiLock className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-red-900 dark:text-red-400 text-sm">Internal Access Only</h4>
                            <p className="text-xs text-red-700 dark:text-red-300 mt-1 leading-relaxed">
                                This video is highly classified and cannot be directly distributed to external victim portals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecordingDetail;
