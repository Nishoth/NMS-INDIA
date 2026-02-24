import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiUploadCloud, FiSearch, FiFilter, FiFile, FiDownload, FiTrash2 } from "react-icons/fi";

const Documents = () => {
    const [search, setSearch] = useState("");

    // Dummy data
    const docs = [
        { id: 1, case_code: "CASE-00123", file_name: "Aadhar_Card.pdf", category: "ID_PROOF", source: "victim", size: "1.2 MB", uploaded_at: "2024-01-12T10:00:00Z" },
        { id: 2, case_code: "CASE-00123", file_name: "Internal_Notes.docx", category: "OTHER", source: "internal", size: "245 KB", uploaded_at: "2024-01-13T11:30:00Z" },
        { id: 3, case_code: "CASE-00124", file_name: "Loan_Agreement_Signed.pdf", category: "LOAN_DOC", source: "internal", size: "4.5 MB", uploaded_at: "2024-01-15T09:15:00Z" },
    ];

    const filteredDocs = docs.filter(d =>
        d.file_name.toLowerCase().includes(search.toLowerCase()) ||
        d.case_code.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all internal and victim-uploaded documents</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                    <FiUploadCloud className="w-4 h-4" />
                    Upload Document
                </button>
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
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FiFilter className="w-4 h-4" />
                        Category: All
                    </button>
                </div>

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
                            {filteredDocs.length === 0 ? (
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
                                                <p className="font-medium text-gray-900 dark:text-white">{d.file_name}</p>
                                                <p className="text-xs text-gray-500">{d.size}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link to={`/cases/${d.case_code}`} className="font-semibold text-primary hover:underline">
                                                {d.case_code}
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-gray-100 text-gray-600 dark:bg-white/5 dark:text-gray-300 rounded text-xs">
                                                {d.category.replace("_", " ")}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-xs font-medium uppercase ${d.source === 'victim'
                                                    ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                                                    : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                                                }`}>
                                                {d.source}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {new Date(d.uploaded_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-primary/5 transition-colors" title="Download">
                                                    <FiDownload className="w-4 h-4" />
                                                </button>
                                                {d.source === 'internal' && (
                                                    <button className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors" title="Delete">
                                                        <FiTrash2 className="w-4 h-4" />
                                                    </button>
                                                )}
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

export default Documents;
