import React, { useState } from "react";
import { FiUploadCloud, FiFile, FiCheckCircle, FiXCircle } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";

const CaseImport = () => {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState(null); // 'success', 'error'
    const [statusMsg, setStatusMsg] = useState("");
    const { importCases, handleRequest } = useApi();
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        setStatus(null);
        setStatusMsg("");

        const formData = new FormData();
        formData.append("file", file);

        const { data, error } = await handleRequest(() => importCases(formData));

        if (error) {
            setStatus("error");
            setStatusMsg(error);
        } else {
            setStatus("success");
            setStatusMsg(`Import completed successfully. ${data.success_rows} cases processed. ${data.failed_rows} skipped.`);
            setTimeout(() => {
                navigate("/cases");
            }, 2000);
        }
        setUploading(false);
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Cases</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Upload an Excel sheet to bulk create cases</p>
            </div>

            <div className="bg-white dark:bg-[#1f2937] p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 text-center">

                {!file ? (
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl p-12 hover:border-primary transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                                <FiUploadCloud className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-gray-900 dark:text-white">Click or drag file to upload</p>
                                <p className="text-sm text-gray-500 mt-1">Supports EXCEL (.xlsx, .xls) files</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center gap-6">
                        <div className={`w-20 h-20 rounded-full flex items-center justify-center ${status === 'success' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
                            {status === 'success' ? <FiCheckCircle className="w-10 h-10" /> : <FiFile className="w-10 h-10" />}
                        </div>

                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{file.name}</h3>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>

                        {status === 'success' ? (
                            <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-6 py-4 rounded-xl text-sm font-medium flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2"><FiCheckCircle className="w-5 h-5" /> Success</div>
                                <span className="text-xs font-normal opacity-90">{statusMsg}</span>
                            </div>
                        ) : status === 'error' ? (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-6 py-4 rounded-xl text-sm font-medium flex flex-col items-center gap-2">
                                <div className="flex items-center gap-2"><FiXCircle className="w-5 h-5" /> Import Failed</div>
                                <span className="text-xs font-normal opacity-90">{statusMsg}</span>
                            </div>
                        ) : (
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFile(null)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-200 dark:border-white/10 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors text-gray-700 dark:text-gray-300"
                                    disabled={uploading}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-6 py-2.5 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Processing...
                                        </>
                                    ) : "Confirm Import"}
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-6">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                    Required Excel Format
                </h4>
                <div className="mt-3 text-sm text-blue-800 dark:text-blue-200/80 space-y-2">
                    <p>Your excel file must contain specific columns corresponding to the database keys (e.g., REF No, AGREEMENT NO/DATE, CLAIM AMOUNT, MAKE, etc.).</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                        <li><b>REF No:</b> Must be unique.</li>
                        <li><b>AGREEMENT NO:</b> Required for tracking cases.</li>
                        <li><b>Parties:</b> Include applicant, co-applicant and guarantor details.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CaseImport;
