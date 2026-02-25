import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiUpload, FiSearch, FiFilter, FiMoreVertical } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const Cases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const { getCases, handleRequest } = useApi();

    const fetchCases = async () => {
        setLoading(true);
        const { data, error } = await handleRequest(() => getCases());
        if (error) {
            toast.error(error);
        } else {
            setCases(data || []);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchCases();
    }, []);

    const filteredCases = cases.filter((c) =>
        (c.case_code || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.agreement_no || "").toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cases</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage all arbitration cases</p>
                </div>
                <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                    <Link
                        to="/cases/import"
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        <FiUpload className="w-4 h-4" />
                        Import Excel
                    </Link>
                    <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                        <FiPlus className="w-4 h-4" />
                        New Case
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                    <div className="relative w-full sm:max-w-xs">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search code or agreement..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all dark:text-white"
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300">
                        <FiFilter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                            <tr>
                                <th className="px-6 py-4">Case Info</th>
                                <th className="px-6 py-4">Agreement</th>
                                <th className="px-6 py-4">Asset Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Claim Amount</th>
                                <th className="px-6 py-4">Date Allocated</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        Loading cases...
                                    </td>
                                </tr>
                            ) : filteredCases.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                                        No cases found.
                                    </td>
                                </tr>
                            ) : (
                                filteredCases.map((c) => (
                                    <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/cases/${c.id}`} className="font-semibold text-primary hover:underline">
                                                {c.case_code}
                                            </Link>
                                            <div className="text-xs text-gray-500 mt-0.5">{c.ref_no || "No Ref"}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            <div className="font-medium">{c.agreement_no || "-"}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{c.agreement_date ? new Date(c.agreement_date).toLocaleDateString() : ""}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            <div className="font-medium">{c.make || "-"} {c.model || ""}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{c.reg_no || ""}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${c.status === "NEW" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                c.status === "CLOSED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                                    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                }`}>
                                                {c.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                                            {c.claim_amount ? `₹${parseFloat(c.claim_amount).toLocaleString()}` : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {c.allocated_at ? new Date(c.allocated_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}
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

export default Cases;
