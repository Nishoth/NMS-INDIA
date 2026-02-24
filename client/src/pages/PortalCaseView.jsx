import React, { useState } from "react";
import { FiClock, FiFileText, FiVideo, FiUploadCloud, FiAlertCircle, FiCheckCircle } from "react-icons/fi";
import assets from "../assets/assets";

const PortalCaseView = () => {
    const [activeTab, setActiveTab] = useState("updates");

    const caseData = {
        code: "CASE-00123",
        agreement: "AGR-99281",
        status: "HEARING_SCHEDULED",
        claimAmount: "1,50,000",
        nextHearing: "2024-01-20T10:30:00Z"
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'HEARING_SCHEDULED':
                return <span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1"><FiClock className="w-3 h-3" /> {status.replace("_", " ")}</span>;
            case 'CLOSED':
                return <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-xs font-semibold flex items-center gap-1"><FiCheckCircle className="w-3 h-3" /> RESOLVED</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 dark:bg-white/10 dark:text-gray-300 rounded-full text-xs font-semibold">PENDING</span>;
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F6F6] dark:bg-[#0f141a]">
            {/* Portal Header */}
            <header className="bg-white dark:bg-[#1f2937] border-b border-gray-200 dark:border-white/5 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={assets.logo} alt="JLS Portal" className="h-8 dark:brightness-0 dark:invert" />
                        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 hidden sm:block"></div>
                        <h1 className="text-lg font-bold text-gray-900 dark:text-white hidden sm:block">Client Portal</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-none">Rahul Sharma</p>
                            <p className="text-xs text-gray-500 mt-1">Applicant</p>
                        </div>
                        <button className="text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-1.5 rounded-lg transition-colors">
                            Sign Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">

                {/* Case Banner */}
                <div className="bg-white dark:bg-[#1f2937] rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-white/5 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">{caseData.code}</h2>
                                {getStatusBadge(caseData.status)}
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">Agreement No: <span className="font-medium text-gray-700 dark:text-gray-300">{caseData.agreement}</span></p>
                        </div>

                        <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 min-w-[200px] border border-gray-100 dark:border-white/5">
                            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Claim Amount</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{caseData.claimAmount}</p>
                        </div>
                    </div>

                    {/* Action Alert */}
                    <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl p-4 flex items-start sm:items-center gap-4">
                        <div className="bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300 p-2 rounded-xl mt-1 sm:mt-0">
                            <FiVideo className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-semibold text-blue-900 dark:text-blue-100">Upcoming Virtual Hearing</h4>
                            <p className="text-sm text-blue-800/80 dark:text-blue-200/80 mt-0.5">Scheduled for {new Date(caseData.nextHearing).toLocaleString()}</p>
                        </div>
                        <button className="whitespace-nowrap px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm text-sm">
                            Join Call
                        </button>
                    </div>
                </div>

                {/* Portal Tabs */}
                <div className="flex gap-4 border-b border-gray-200 dark:border-white/10 mb-8 overflow-x-auto hide-scrollbar">
                    <button
                        onClick={() => setActiveTab('updates')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'updates' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        Case Updates
                    </button>
                    <button
                        onClick={() => setActiveTab('documents')}
                        className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${activeTab === 'documents' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        My Documents
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'updates' && (
                    <div className="space-y-6 animate-fade-in relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-white/10 before:to-transparent">

                        {/* Timeline Item */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-[#0f141a] bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-col">
                                <FiVideo className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white">Hearing Scheduled</h3>
                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Upcoming</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">A virtual meeting link has been generated for your arbitration hearing.</p>
                                <div className="mt-3 text-xs text-gray-400">Jan 16, 2024 • 10:30 AM</div>
                            </div>
                        </div>

                        {/* Timeline Item */}
                        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                            <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white dark:border-[#0f141a] bg-gray-100 text-gray-500 dark:bg-white/10 dark:text-gray-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-col">
                                <FiFileText className="w-4 h-4" />
                            </div>
                            <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 opacity-80">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-1">Notice 1 Issued</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">First legal notice regarding arbitration commencement was dispatched.</p>
                                <button className="mt-3 text-sm text-primary font-medium hover:underline">View Notice Document</button>
                                <div className="mt-2 text-xs text-gray-400">Jan 12, 2024 • 04:15 PM</div>
                            </div>
                        </div>

                    </div>
                )}

                {activeTab === 'documents' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
                        <div className="md:col-span-2 bg-white dark:bg-[#1f2937] rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Uploaded Files</h3>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-white dark:bg-[#1f2937] rounded-lg shadow-sm">
                                            <FiFileText className="w-5 h-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white text-sm">Aadhar_Card.pdf</p>
                                            <p className="text-xs text-gray-500">ID Proof • 1.2 MB</p>
                                        </div>
                                    </div>
                                    <button className="text-sm text-primary font-medium hover:underline">Download</button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-6 border border-primary/20 flex flex-col items-center justify-center text-center h-64">
                            <div className="w-16 h-16 bg-white dark:bg-[#1f2937] rounded-full flex items-center justify-center text-primary shadow-sm mb-4">
                                <FiUploadCloud className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-gray-900 dark:text-white mb-2">Submit Document</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Upload requested proofs or replies securely.</p>
                            <button className="w-full py-2.5 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-sm">
                                Browse Files
                            </button>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
};

export default PortalCaseView;
