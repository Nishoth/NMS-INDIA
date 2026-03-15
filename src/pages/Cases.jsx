import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    FiPlus, FiUpload, FiSearch, FiFilter, FiMoreVertical,
    FiList, FiGrid, FiChevronLeft, FiChevronRight, FiHome, FiChevronRight as FiBreadcrumbRight,
    FiFileText, FiCalendar, FiDollarSign, FiUser, FiX
} from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const Cases = () => {
    const [cases, setCases] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters & Pagination State
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [viewMode, setViewMode] = useState("table"); // 'table' or 'card'
    const [currentPage, setCurrentPage] = useState(1);

    // Pagination sizes
    const [tablePerPage, setTablePerPage] = useState(10);
    const [cardPerPage, setCardPerPage] = useState(12);
    const [customPerPage, setCustomPerPage] = useState("");

    // Advocate Assignment State
    const [advocates, setAdvocates] = useState([]);
    const [assignModalOpen, setAssignModalOpen] = useState(false);
    const [selectedCaseId, setSelectedCaseId] = useState(null);
    const [selectedAdvocate, setSelectedAdvocate] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);

    const getItemsPerPage = () => {
        if (viewMode === "card") return cardPerPage === "All" ? Math.max(1, cases.length) : cardPerPage;
        if (tablePerPage === "All") return Math.max(1, cases.length);
        if (tablePerPage === "Custom") return parseInt(customPerPage) || 10;
        return tablePerPage;
    };

    const itemsPerPage = getItemsPerPage();

    // Action Dropdown state
    const [openDropdownId, setOpenDropdownId] = useState(null);
    
    // Window width state for responsive rendering
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

    // Close dropdown on outside click and track window resize
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (!e.target.closest('.action-dropdown') && !e.target.closest('.assign-modal')) {
                setOpenDropdownId(null);
            }
        };
        
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleResize);
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const { getCases, handleRequest, getUsers, assignAdvocate } = useApi();

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

    // Fetch advocates for assignment
    const fetchAdvocates = async () => {
        const { data, error } = await handleRequest(() => getUsers("advocate"));
        if (!error && data) {
            setAdvocates(data);
        }
    };

    useEffect(() => {
        fetchCases();
        fetchAdvocates();
    }, []);

    // Handle advocate assignment
    const handleOpenAssignModal = (caseId) => {
        setSelectedCaseId(caseId);
        setSelectedAdvocate("");
        setAssignModalOpen(true);
        setOpenDropdownId(null);
    };

    const handleCloseAssignModal = () => {
        setAssignModalOpen(false);
        setSelectedCaseId(null);
        setSelectedAdvocate("");
    };

    const handleAssignAdvocate = async () => {
        if (!selectedAdvocate || !selectedCaseId) return;
        
        setIsAssigning(true);
        const { error } = await handleRequest(() => assignAdvocate(selectedCaseId, selectedAdvocate));
        setIsAssigning(false);
        
        if (error) {
            toast.error(error);
        } else {
            toast.success("Advocate assigned successfully");
            handleCloseAssignModal();
            fetchCases(); // Refresh cases to show updated assignment
        }
    };

    // 1. Filter Cases
    const filteredCases = cases.filter((c) => {
        const matchesSearch =
            (c.case_code || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.agreement_no || "").toLowerCase().includes(search.toLowerCase()) ||
            (c.ref_no || "").toLowerCase().includes(search.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // 2. Paginate Cases
    const totalPages = Math.ceil(filteredCases.length / itemsPerPage) || 1;
    const paginatedCases = filteredCases.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    // Reset pagination when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const StatusBadge = ({ status }) => {
        const styles = {
            "NEW": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
            "CLOSED": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
            "DEFAULT": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        };
        const style = styles[status] || styles["DEFAULT"];
        return (
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${style}`}>
                {status || "UNKNOWN"}
            </span>
        );
    };

    return (
        <div className="space-y-6 animate-fade-in pb-8">
            {/* Breadcrumbs */}
            <nav className="flex text-sm text-gray-500 dark:text-gray-400" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                    <li className="inline-flex items-center">
                        <Link to="/" className="hover:text-primary flex items-center gap-1 transition-colors">
                            <FiHome className="w-4 h-4" />
                            Dashboard
                        </Link>
                    </li>
                    <li>
                        <div className="flex items-center">
                            <FiBreadcrumbRight className="w-4 h-4 mx-1" />
                            <span className="text-gray-900 dark:text-white font-medium">Cases</span>
                        </div>
                    </li>
                </ol>
            </nav>

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cases Management</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage, filter, and track all arbitration cases.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    {/* View Toggle */}
                    <div className="hidden sm:flex items-center bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10">
                        <button
                            onClick={() => setViewMode("table")}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-[#1f2937] text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            title="Table View"
                        >
                            <FiList className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode("card")}
                            className={`p-2 rounded-lg transition-colors ${viewMode === 'card' ? 'bg-white dark:bg-[#1f2937] text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            title="Card View"
                        >
                            <FiGrid className="w-4 h-4" />
                        </button>
                    </div>

                    <Link
                        to="/cases/import"
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors text-sm font-medium"
                    >
                        <FiUpload className="w-4 h-4" />
                        Import
                    </Link>
                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors text-sm font-medium shadow-sm hover:shadow-md">
                        <FiPlus className="w-4 h-4" />
                        New Case
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:max-w-md">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by case code, agreement, or ref no..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary/50 focus:ring-2 focus:ring-primary/10 rounded-xl outline-none transition-all dark:text-white"
                    />
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto hide-scrollbar">
                    <div className="flex bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-1 whitespace-nowrap">
                        {["ALL", "NEW", "IN_PROGRESS", "CLOSED"].map(status => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-1.5 text-xs font-medium rounded-lg transition-colors ${statusFilter === status ? 'bg-white dark:bg-[#1f2937] text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
                            >
                                {status.replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            {loading ? (
                <div className="flex justify-center items-center py-20">
                    <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                </div>
            ) : filteredCases.length === 0 ? (
                <div className="bg-white dark:bg-[#1f2937] rounded-2xl p-12 text-center border border-gray-100 dark:border-white/5 shadow-sm">
                    <FiSearch className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No cases found</h3>
                    <p className="text-gray-500 mt-1">Try adjusting your search or filters.</p>
                    <button
                        onClick={() => { setSearch(""); setStatusFilter("ALL"); }}
                        className="mt-4 px-4 py-2 text-sm font-medium text-primary hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            ) : (
                <>
                    {/* MOBILE ALWAYS CARD VIEW OR EXPLICIT CARD VIEW */}
                    <div className={`${viewMode === 'card' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'hidden sm:block'}`}>
                        {viewMode === 'card' || window.innerWidth < 640 ? (
                            paginatedCases.map((c) => (
                                <div key={c.id} className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 p-5 hover:border-primary/30 transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <Link to={`/cases/${c.id}`} className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                                {c.case_code}
                                            </Link>
                                            <div className="text-xs text-gray-500 mt-0.5">{c.ref_no || "No Ref No."}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <StatusBadge status={c.status} />
                                            <div className="relative action-dropdown">
                                                <button
                                                    onClick={() => setOpenDropdownId(openDropdownId === c.id ? null : c.id)}
                                                    className="text-gray-400 hover:text-primary transition-colors p-1 rounded-md hover:bg-gray-100 dark:hover:bg-white/5"
                                                >
                                                    <FiMoreVertical className="w-4 h-4" />
                                                </button>
                                                {openDropdownId === c.id && (
                                                    <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#1f2937] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 z-20 py-1">
                                                        <Link to={`/cases/${c.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">View Details</Link>
                                                        <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Edit</button>
                                                        <button 
                                                            onClick={() => handleOpenAssignModal(c.id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/10 flex items-center gap-2"
                                                        >
                                                            <FiUser className="w-4 h-4" />
                                                            Assign Advocate
                                                        </button>
                                                        <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                                                        <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400">Delete</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-500"><FiFileText className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Agreement</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.agreement_no || "-"}</p>
                                                <p className="text-xs text-gray-500">{c.agreement_date ? new Date(c.agreement_date).toLocaleDateString() : "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-500"><FiDollarSign className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Claim Amount</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.claim_amount ? `₹${parseFloat(c.claim_amount).toLocaleString()}` : "-"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-gray-50 dark:bg-white/5 rounded-lg text-gray-500"><FiCalendar className="w-4 h-4" /></div>
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase font-semibold">Allocation</p>
                                                <p className="text-sm font-medium text-gray-900 dark:text-white">{c.allocated_at ? new Date(c.allocated_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex justify-between items-center">
                                        <span className="text-xs text-gray-500 truncate max-w-[150px]" title={`${c.make || ""} ${c.model || ""}`}>
                                            🚗 {c.make || ""} {c.model || ""} {c.reg_no ? `(${c.reg_no})` : ""}
                                        </span>
                                        <Link to={`/cases/${c.id}`} className="text-xs font-semibold text-primary hover:underline">View Details &rarr;</Link>
                                    </div>
                                </div>
                            ))
                        ) : null}
                    </div>

                    {/* TABLE VIEW (Hidden on small screens if card view is not selected, but actually we use CSS to hide table on mobile entirely and show cards instead) */}
                    <div className={`${viewMode === 'table' ? 'block' : 'hidden'} sm:block bg-white dark:bg-[#1f2937] rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 overflow-hidden`}>
                        {viewMode === 'table' && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm whitespace-nowrap">
                                    <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 dark:text-gray-400 font-medium">
                                        <tr>
                                            <th className="px-6 py-4">Case Info</th>
                                            <th className="px-6 py-4">Agreement</th>
                                            <th className="px-6 py-4">Asset Details</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">Claim Amount</th>
                                            <th className="px-6 py-4">Allocation</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                        {paginatedCases.map((c) => (
                                            <tr key={c.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                                                <td className="px-6 py-4">
                                                    <Link to={`/cases/${c.id}`} className="font-semibold text-primary hover:underline block">
                                                        {c.case_code}
                                                    </Link>
                                                    <div className="text-xs text-gray-500 mt-0.5">{c.ref_no || "No Ref"}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                    <div className="font-medium">{c.agreement_no || "-"}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5">{c.agreement_date ? new Date(c.agreement_date).toLocaleDateString() : "-"}</div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                                    <div className="font-medium truncate max-w-[150px]" title={`${c.make || ""} ${c.model || ""}`}>{c.make || "-"} {c.model || ""}</div>
                                                    <div className="text-xs text-gray-500 mt-0.5 truncate max-w-[150px]" title={c.reg_no}>{c.reg_no || "-"}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <StatusBadge status={c.status} />
                                                </td>
                                                <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">
                                                    {c.claim_amount ? `₹${parseFloat(c.claim_amount).toLocaleString()}` : "-"}
                                                </td>
                                                <td className="px-6 py-4 text-gray-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <FiCalendar className="w-3.5 h-3.5" />
                                                        {c.allocated_at ? new Date(c.allocated_at).toLocaleDateString() : new Date(c.created_at).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link to={`/cases/${c.id}`} className="opacity-0 group-hover:opacity-100 px-3 py-1.5 bg-primary/10 text-primary text-xs font-semibold rounded-lg hover:bg-primary hover:text-white transition-all">
                                                            View
                                                        </Link>
                                                        <div className="relative action-dropdown">
                                                            <button
                                                                onClick={() => setOpenDropdownId(openDropdownId === c.id ? null : c.id)}
                                                                className="p-2 text-gray-400 hover:text-primary dark:hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
                                                            >
                                                                <FiMoreVertical className="w-4 h-4" />
                                                            </button>
                                                            {openDropdownId === c.id && (
                                                                <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#1f2937] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 z-20 py-1 text-left">
                                                                    <Link to={`/cases/${c.id}`} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">View Details</Link>
                                                                    <button className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5">Edit</button>
                                                                    <button 
                                                                        onClick={() => handleOpenAssignModal(c.id)}
                                                                        className="w-full text-left px-4 py-2 text-sm text-primary hover:bg-primary/10 dark:text-primary dark:hover:bg-primary/10 flex items-center gap-2"
                                                                    >
                                                                        <FiUser className="w-4 h-4" />
                                                                        Assign Advocate
                                                                    </button>
                                                                    <div className="h-px bg-gray-100 dark:bg-white/5 my-1" />
                                                                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 dark:text-red-400">Delete</button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Show cards on mobile always if in table mode, via a separate block */}
                    {viewMode === 'table' && (
                        <div className="grid grid-cols-1 gap-4 sm:hidden">
                            {paginatedCases.map((c) => (
                                <div key={`mob-${c.id}`} className="bg-white dark:bg-[#1f2937] rounded-xl shadow-sm border border-gray-100 dark:border-white/5 p-4 hover:border-primary/30 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <Link to={`/cases/${c.id}`} className="text-base font-bold text-gray-900 dark:text-white hover:text-primary transition-colors">
                                                {c.case_code}
                                            </Link>
                                            <div className="text-xs text-gray-500">{c.ref_no || "No Ref No."}</div>
                                        </div>
                                        <StatusBadge status={c.status} />
                                    </div>
                                    <div className="flex justify-between items-center text-sm border-t border-gray-50 dark:border-white/5 pt-3 mt-3">
                                        <div className="text-gray-600 dark:text-gray-300">
                                            <span className="text-xs text-gray-400 block">Agreement</span>
                                            {c.agreement_no || "-"}
                                        </div>
                                        <div className="text-right text-gray-600 dark:text-gray-300 font-medium">
                                            <span className="text-xs text-gray-400 block font-normal">Claim amount</span>
                                            {c.claim_amount ? `₹${parseFloat(c.claim_amount).toLocaleString()}` : "-"}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {(totalPages > 1 || filteredCases.length > 0) && (
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-[#1f2937] p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm text-gray-500">
                                <div>
                                    Showing <span className="font-medium text-gray-900 dark:text-white">{((currentPage - 1) * itemsPerPage) + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(currentPage * itemsPerPage, filteredCases.length)}</span> of <span className="font-medium text-gray-900 dark:text-white">{filteredCases.length}</span> cases
                                </div>
                                <div className="flex items-center gap-2 sm:border-l border-gray-200 dark:border-white/10 sm:pl-4">
                                    <span className="hidden sm:inline">Per page:</span>
                                    {viewMode === "table" ? (
                                        <div className="flex items-center gap-2">
                                            <select
                                                value={tablePerPage}
                                                onChange={(e) => {
                                                    setTablePerPage(e.target.value === "All" || e.target.value === "Custom" ? e.target.value : Number(e.target.value));
                                                    setCurrentPage(1);
                                                }}
                                                className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-primary/50 text-gray-700 dark:text-gray-300"
                                            >
                                                {[10, 20, 50, 100, 250, 500, "All", "Custom"].map(sz => (
                                                    <option key={sz} value={sz}>{sz}</option>
                                                ))}
                                            </select>
                                            {tablePerPage === "Custom" && (
                                                <input
                                                    type="number"
                                                    min="1"
                                                    placeholder="Qty"
                                                    value={customPerPage}
                                                    onChange={(e) => {
                                                        setCustomPerPage(e.target.value);
                                                        setCurrentPage(1);
                                                    }}
                                                    className="w-16 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-primary/50 text-gray-700 dark:text-gray-300"
                                                />
                                            )}
                                        </div>
                                    ) : (
                                        <select
                                            value={cardPerPage}
                                            onChange={(e) => {
                                                setCardPerPage(e.target.value === "All" ? e.target.value : Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-primary/50 text-gray-700 dark:text-gray-300"
                                            title="Card view sizes are tailored for gapless grid layouts"
                                        >
                                            {[12, 24, 48, 96, "All"].map(sz => (
                                                <option key={sz} value={sz}>{sz}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <FiChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex gap-1">
                                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                                        // Simple windowing logic
                                        let pageNum = i + 1;
                                        if (totalPages > 5 && currentPage > 3) {
                                            pageNum = currentPage - 2 + i;
                                        }
                                        if (pageNum > totalPages) return null;

                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => setCurrentPage(pageNum)}
                                                className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${currentPage === pageNum
                                                    ? 'bg-primary text-white shadow-sm'
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    })}
                                </div>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    <FiChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Assign Advocate Modal */}
            {assignModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="assign-modal bg-white dark:bg-[#1f2937] rounded-2xl shadow-xl border border-gray-100 dark:border-white/10 w-full max-w-md p-6 animate-fade-in">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <FiUser className="text-primary" />
                                Assign Advocate
                            </h3>
                            <button 
                                onClick={handleCloseAssignModal}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <FiX className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                        
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                            Select an advocate to assign to this case. Admins and Super Admins can assign any advocate.
                        </p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Select Advocate
                                </label>
                                <select
                                    value={selectedAdvocate}
                                    onChange={(e) => setSelectedAdvocate(e.target.value)}
                                    className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none text-gray-900 dark:text-white"
                                >
                                    <option value="">-- Select an Advocate --</option>
                                    {advocates.map((advocate) => (
                                        <option key={advocate.id} value={advocate.id}>
                                            {advocate.username} {advocate.email ? `(${advocate.email})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {/* Dummy Advocates for Demo */}
                            {advocates.length === 0 && (
                                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                                        <strong>Demo Mode:</strong> No advocates fetched from backend. Showing dummy data:
                                    </p>
                                    <select
                                        value={selectedAdvocate}
                                        onChange={(e) => setSelectedAdvocate(e.target.value)}
                                        className="w-full mt-2 p-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white"
                                    >
                                        <option value="">-- Select an Advocate --</option>
                                        <option value="adv-1">John Smith (john@lawfirm.com) - Senior Advocate</option>
                                        <option value="adv-2">Sarah Johnson (sarah@lawfirm.com) - Junior Advocate</option>
                                        <option value="adv-3">Michael Brown (michael@lawfirm.com) - Partner</option>
                                        <option value="adv-4">Emily Davis (emily@lawfirm.com) - Associate</option>
                                        <option value="adv-5">Robert Wilson (robert@lawfirm.com) - Senior Partner</option>
                                        <option value="adv-6">Lisa Anderson (lisa@lawfirm.com) - Managing Partner</option>
                                    </select>
                                </div>
                            )}
                            
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={handleCloseAssignModal}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAssignAdvocate}
                                    disabled={!selectedAdvocate || isAssigning}
                                    className="flex-1 px-4 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isAssigning ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Assigning...
                                        </>
                                    ) : (
                                        <>
                                            <FiUser className="w-4 h-4" />
                                            Assign Advocate
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Cases;
