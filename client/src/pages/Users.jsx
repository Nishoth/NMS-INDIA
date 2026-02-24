import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiSearch, FiFilter, FiUserPlus, FiMoreVertical } from "react-icons/fi";
import { internalUsers, ROLE_LABELS } from "../assets/assets";

const Users = () => {
    const [search, setSearch] = useState("");
    const users = internalUsers || [];

    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage platform access, roles and permissions</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                    <FiUserPlus className="w-4 h-4" />
                    Add User
                </button>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all dark:text-white"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FiFilter className="w-4 h-4" />
                        Roles: All
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Role & Dept</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Permissions</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                        No users found.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => (
                                    <tr key={u.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                                                {u.avatar ? <img src={u.avatar} alt="Avatar" className="w-full h-full object-cover" /> : u.username.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{u.username}</p>
                                                <p className="text-xs text-gray-500">{u.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-gray-900 dark:text-gray-200 font-medium">{ROLE_LABELS[u.role]}</p>
                                            <p className="text-xs text-gray-500">{u.designation || u.department || "General"}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${u.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                    "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                }`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 text-xs">
                                            {u.permissions?.includes("ALL") ? "Full Access" : `${u.permissions?.length || 0} permissions`}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                                                <FiMoreVertical className="w-4 h-4" />
                                            </button>
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

export default Users;
