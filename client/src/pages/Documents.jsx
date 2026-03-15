import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiUploadCloud, FiSearch, FiFilter, FiFile, FiDownload, FiTrash2, FiLoader, FiX, FiCamera, FiMail, FiMessageSquare, FiPaperclip } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const Documents = () => {
    const [search, setSearch] = useState("");
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState(null);
    const [isUploadingDocument, setIsUploadingDocument] = useState(false);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const { handleRequest, getDocuments, downloadDocument, uploadDocument } = useApi();

    useEffect(() => {
        const fetchDocs = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getDocuments());
            if (error) {
                toast.error("Failed to fetch documents");
            } else if (data) {
                setDocs(data);
            }
            setLoading(false);
        };
        fetchDocs();
    }, []);

    const handleDocumentDownload = async (documentId, fileName) => {
        const { data, error } = await handleRequest(() => downloadDocument(documentId));
        if (error) {
            toast.error("Failed to download document");
        } else if (data) {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    const handleDocumentUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setUploadFile(file);
        setUploadModalOpen(true);
        event.target.value = '';
    };

    const handleUploadConfirm = async () => {
        if (!uploadFile) {
            toast.error('Please pick a file to upload.');
            return;
        }
        setIsUploadingDocument(true);
        try {
            // Replace this with real API upload when caseId or context is known.
            // const formData = new FormData();
            // formData.append('file', uploadFile);
            // await handleRequest(() => uploadDocument(caseId, formData));

            const newItem = {
                id: `${Date.now()}`,
                file_name: uploadFile.name,
                uploaded_at: new Date().toISOString(),
                source: 'internal'
            };
            setUploadedDocuments((prev) => [newItem, ...prev].slice(0, 3));
            toast.success('Document uploaded successfully');
            setUploadModalOpen(false);
            setUploadFile(null);
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload document');
        } finally {
            setIsUploadingDocument(false);
        }
    };

    const filteredDocs = docs.filter(d =>
        d.file_name.toLowerCase().includes(search.toLowerCase()) ||
        (d.case_code && d.case_code.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-4 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all internal and victim-uploaded documents</p>
                </div>
                <label className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-primary text-white text-xs font-semibold cursor-pointer hover:bg-primary-dark transition-colors">
                    <FiUploadCloud className="w-4 h-4" />
                    {isUploadingDocument ? 'Uploading...' : 'Upload Document'}
                    <input
                        type="file"
                        accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/jpg"
                        className="hidden"
                        onChange={handleDocumentUpload}
                        disabled={isUploadingDocument}
                    />
                </label>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search file name or case..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all dark:text-white"
                        />
                    </div>
                </div>

                {uploadedDocuments.length > 0 && (
                    <div className="px-4 pb-3 border-b border-gray-100 dark:border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="text-xs uppercase tracking-wide font-semibold text-gray-500 dark:text-gray-400">Recent uploads</div>
                            <div className="text-[10px] text-gray-400">{uploadedDocuments.length} item{uploadedDocuments.length > 1 ? 's' : ''}</div>
                        </div>
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {uploadedDocuments.map((row) => (
                                <div key={row.id} className="rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-2 text-xs text-gray-700 dark:text-gray-200">
                                    <div className="font-semibold truncate">{row.file_name}</div>
                                    <div className="text-[10px] text-gray-400">{new Date(row.uploaded_at).toLocaleTimeString()}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">File Name</th>
                                <th className="px-6 py-4">Case Code</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Source</th>
                                <th className="px-6 py-4">Uploaded</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <FiLoader className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
                                        Loading documents...
                                    </td>
                                </tr>
                            ) : filteredDocs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        No documents found.
                                    </td>
                                </tr>
                            ) : (
                                filteredDocs.map((d) => (
                                    <tr key={d.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <FiFile className="w-5 h-5 text-gray-400" />
                                            <div>
                                                <Link to={`/documents/${d.id}`} className="font-medium text-gray-900 dark:text-white hover:text-primary transition-colors">
                                                    {d.file_name}
                                                </Link>
                                                <p className="text-xs text-gray-500 mt-1">{(d.size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {d.case_code ? (
                                                <Link to={`/cases/${d.case_id}`} className="font-semibold text-primary hover:underline">
                                                    {d.case_code}
                                                </Link>
                                            ) : (
                                                <span className="text-gray-400">Unlinked</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 rounded text-xs">
                                                {d.category ? d.category.replace("_", " ") : "OTHER"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${d.source === 'victim'
                                                ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                }`}>
                                                {d.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(d.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleDocumentDownload(d.id, d.file_name)}
                                                    className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors"
                                                    title="Download"
                                                >
                                                    <FiDownload className="w-4 h-4" />
                                                </button>
                                                <Link
                                                    to={`/documents/${d.id}`}
                                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
                                                >
                                                    View Details
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

            {uploadModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-white/10">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Upload Document</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Upload files quickly in a notice-style popup.</p>
                            </div>
                            <button onClick={() => setUploadModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500">
                                <FiX className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div className="border border-dashed border-gray-300 dark:border-white/20 rounded-xl p-4 text-center">
                                <FiPaperclip className="w-8 h-8 mx-auto text-primary" />
                                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Choose file</p>
                                <input
                                    type="file"
                                    className="mt-3"
                                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/jpg"
                                />
                                {uploadFile && <p className="mt-2 text-xs text-green-600 dark:text-green-400">Selected: {uploadFile.name}</p>}
                            </div>

                            <div className="flex justify-end gap-2">
                                <button onClick={() => { setUploadModalOpen(false); setUploadFile(null); }} className="px-3 py-2 bg-gray-200 dark:bg-white/10 text-gray-700 dark:text-gray-200 rounded-lg">Cancel</button>
                                <button onClick={handleUploadConfirm} disabled={isUploadingDocument} className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-60">
                                    {isUploadingDocument ? 'Uploading...' : 'Create & Upload'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Documents;
