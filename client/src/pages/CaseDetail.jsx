import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FiArrowLeft, FiClock, FiFileText, FiUsers, FiVideo, FiActivity } from "react-icons/fi";

const CaseDetail = () => {
    const { caseId } = useParams();
    const [activeTab, setActiveTab] = useState("overview");

    const tabs = [
        { id: "overview", label: "Overview", icon: FiActivity },
        { id: "timeline", label: "Timeline", icon: FiClock },
        { id: "notices", label: "Notices", icon: FiFileText },
        { id: "meetings", label: "Meetings", icon: FiUsers },
        { id: "documents", label: "Documents", icon: FiFileText },
        { id: "recordings", label: "Recordings", icon: FiVideo },
    ];

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    to="/cases"
                    className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors text-gray-500"
                >
                    <FiArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CASE-00123</h1>
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                            NEW
                        </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Agreement: AGR-99281 • Added Jan 12, 2024</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="flex overflow-x-auto hide-scrollbar border-b border-gray-100 dark:border-white/5">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2
                  ${isActive
                                        ? "border-primary text-primary"
                                        : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        )
                    })}
                </div>

                {/* Content Area */}
                <div className="p-6">
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-100 dark:border-white/5">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Financial Details</h3>
                                    <div className="space-y-3 text-sm">
                                        <div className="flex justify-between"><span className="text-gray-500">Claim Amount:</span><span className="font-medium text-gray-900 dark:text-white">₹1,50,000</span></div>
                                        <div className="flex justify-between"><span className="text-gray-500">Amount Financed:</span><span className="font-medium text-gray-900 dark:text-white">₹1,20,000</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-gray-50 dark:bg-white/5 p-5 rounded-xl border border-gray-100 dark:border-white/5">
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Parties</h3>
                                    <div className="space-y-4 text-sm">
                                        <div>
                                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Applicant</span>
                                            <p className="font-medium text-gray-900 dark:text-white">Rahul Sharma</p>
                                            <p className="text-gray-500">9876543210</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === "notices" && (
                        <div className="text-center py-12 text-gray-500">
                            <FiFileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <p>No notices generated yet.</p>
                            <button className="mt-4 px-4 py-2 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-dark transition-colors">
                                Generate Notice #1
                            </button>
                        </div>
                    )}

                    {/* Add placeholders for other tabs */}
                    {["timeline", "meetings", "documents", "recordings"].includes(activeTab) && (
                        <div className="text-center py-12 text-gray-500">
                            <p>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} view coming soon.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default CaseDetail;
