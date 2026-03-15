import React from "react";
import { FiPieChart, FiTrendingUp, FiDownload } from "react-icons/fi";

const Reports = () => {
    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of arbitration metrics and performance</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                    <FiDownload className="w-4 h-4" />
                    Export Data
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center h-48">
                    <FiPieChart className="w-12 h-12 text-primary mb-4 opacity-80" />
                    <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-2">Case Resolution Rate</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">68%</p>
                </div>
                <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center h-48">
                    <FiTrendingUp className="w-12 h-12 text-green-500 mb-4 opacity-80" />
                    <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-2">Total Recovered</h3>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">₹4.2 Cr</p>
                </div>
                <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col items-center justify-center text-center h-48 md:col-span-2 lg:col-span-1">
                    <h3 className="font-medium text-gray-500 dark:text-gray-400 mb-4">Pending Cases by Stage</h3>
                    <div className="w-full space-y-3">
                        <div className="flex justify-between text-sm"><span>Notices Sent</span><span className="font-bold text-gray-900 dark:text-white">124</span></div>
                        <div className="flex justify-between text-sm"><span>Hearings Scheduled</span><span className="font-bold text-gray-900 dark:text-white">45</span></div>
                        <div className="flex justify-between text-sm"><span>Awaiting Award</span><span className="font-bold text-gray-900 dark:text-white">12</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reports;
