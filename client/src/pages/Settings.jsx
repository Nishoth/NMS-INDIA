import React from "react";
import { FiSave, FiSettings, FiBell, FiLock, FiGlobe } from "react-icons/fi";

const Settings = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Configure global application preferences and integrations</p>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="flex flex-col md:flex-row">

                    {/* Settings Nav */}
                    <div className="w-full md:w-64 border-r border-gray-100 dark:border-white/5 p-4 space-y-1">
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-primary/10 text-primary font-medium transition-colors text-sm">
                            <FiSettings className="w-4 h-4" />
                            General
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors text-sm">
                            <FiLock className="w-4 h-4" />
                            Security
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors text-sm">
                            <FiBell className="w-4 h-4" />
                            Notifications
                        </button>
                        <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors text-sm">
                            <FiGlobe className="w-4 h-4" />
                            API Integrations
                        </button>
                    </div>

                    {/* Settings Content */}
                    <div className="flex-1 p-6 lg:p-8">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">General Settings</h3>

                        <form className="space-y-6" onSubmit={e => e.preventDefault()}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bank Name / Organization</label>
                                    <input type="text" defaultValue="Jana Small Finance Bank" className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all dark:text-white" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Support Email</label>
                                        <input type="email" defaultValue="support@jls.in" className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Support Phone</label>
                                        <input type="text" defaultValue="1800-XXX-XXXX" className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all dark:text-white" />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Default Timezone</label>
                                    <select className="w-full px-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-xl outline-none transition-all dark:text-white">
                                        <option>Asia/Kolkata (IST)</option>
                                        <option>UTC</option>
                                    </select>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-end">
                                <button type="button" className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium">
                                    <FiSave className="w-4 h-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
