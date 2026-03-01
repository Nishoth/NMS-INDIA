import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiFileText, FiDownload, FiClock, FiUser, FiInfo, FiLoader, FiAlertCircle, FiLink } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const DocumentDetail = () => {
    const { id } = useParams();
    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const { handleRequest, getDocument, downloadDocument } = useApi();

    useEffect(() => {
        const fetchDoc = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getDocument(id));
            if (error) {
                toast.error("Failed to load document details");
            } else if (data) {
                setDocument(data);
            }
            setLoading(false);
        };
        fetchDoc();
    }, [id]);

    const handleDocDownload = async () => {
        if (!document) return;
        const { data, error } = await handleRequest(() => downloadDocument(document.id));
        if (error) {
            toast.error("Failed to download document");
        } else if (data) {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = window.document.createElement('a');
            link.href = url;
            link.setAttribute('download', document.file_name || 'document.pdf');
            window.document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <FiLoader className="w-8 h-8 animate-spin text-primary" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">Loading document metadata...</p>
            </div>
        );
    }

    if (!document) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <FiAlertCircle className="w-12 h-12 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Document Not Found</h2>
                <Link to="/documents" className="text-primary hover:underline font-medium">
                    &larr; Back to Assets Gallery
                </Link>
            </div>
        );
    }

    const docDate = new Date(document.created_at);
    // Rough size conversion for UI cleanliness
    const docSizeMB = (document.size_bytes / (1024 * 1024)).toFixed(2);

    return (
        <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
            {/* Header / Navigation */}
            <div className="flex items-center gap-4">
                <Link
                    to="/documents"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3 truncate" title={document.file_name}>
                            <FiFileText className="text-primary shrink-0" />
                            {document.file_name}
                        </h1>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase rounded-full w-fit ${document.source === 'victim' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'}`}>
                            {document.source}
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        System ID: {document.id}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Metadata Block */}
                    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiInfo className="text-primary" /> File Properties
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">MIME Descriptor</p>
                                <p className="font-medium text-gray-900 dark:text-white truncate" title={document.mime_type}>
                                    {document.mime_type}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">File Size</p>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {docSizeMB} MB <span className="text-xs text-gray-400 ml-1">({document.size_bytes} bytes)</span>
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Internal Target Category</p>
                                <p className="font-medium text-gray-900 dark:text-white uppercase tracking-wide">
                                    {document.category ? document.category.replace("_", " ") : "OTHER"}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Upload Date</p>
                                <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                                    <FiClock className="text-primary w-4 h-4" />
                                    {docDate.toLocaleDateString()} at {docDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* File Path Structure */}
                    <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <FiLink className="text-primary" /> Internal Linkage
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">AWS / S3 Block Pathing</p>
                                <div className="bg-gray-50 dark:bg-white/5 p-3 flex items-center gap-4 rounded-xl border border-gray-100 dark:border-white/10 text-xs font-mono text-gray-600 dark:text-gray-300 overflow-x-auto truncate whitespace-nowrap">
                                    {document.file_path}
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Linked Case Mapping</p>
                                {document.case_code ? (
                                    <Link to={`/cases/${document.case_id}`} className="font-medium text-primary hover:underline flex items-center gap-1 text-sm bg-primary/5 px-3 py-2 rounded-lg w-fit border border-primary/10">
                                        <FiLink className="w-3 h-3" /> Go to {document.case_code}
                                    </Link>
                                ) : (
                                    <p className="text-sm text-gray-500 italic flex items-center gap-1">
                                        <FiAlertCircle className="w-4 h-4" /> This document is orphaned/unlinked
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                </div>

                {/* Sidebar Action Center */}
                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                        <div className="w-16 h-16 bg-white dark:bg-[#1f2937] rounded-full flex items-center justify-center shadow-sm">
                            <FiDownload className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Secure Access</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-[200px] leading-relaxed">
                                Decrypt and download this file directly to your local machine storage buffer.
                            </p>
                        </div>
                        <button
                            onClick={handleDocDownload}
                            className="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors shadow-sm flex items-center justify-center gap-2 mt-4"
                        >
                            <FiDownload className="w-5 h-5" /> Request Download
                        </button>
                    </div>

                    <div className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-3 flex flex-col items-center">
                        <FiUser className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                        <div className="text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Uploader Context Node</p>
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-1">
                                {document.source === 'victim' ? document.uploaded_by_victim_id : document.uploaded_by_user_id}
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default DocumentDetail;
