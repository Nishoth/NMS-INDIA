import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FiArrowLeft, FiClock, FiFileText, FiUsers, FiVideo, FiActivity,
    FiMapPin, FiPhone, FiMail, FiDollarSign, FiCalendar, FiBriefcase, FiAlertCircle
} from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const CaseDetail = () => {
    const { caseId } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { getCase, handleRequest } = useApi();

    useEffect(() => {
        const fetchCaseData = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getCase(caseId));
            if (error) {
                toast.error("Failed to load case details.");
            } else {
                setCaseData(data);
            }
            setLoading(false);
        };
        if (caseId) fetchCaseData();
    }, [caseId]);

    const tabs = [
        { id: "overview", label: "Overview", icon: FiActivity },
        { id: "timeline", label: "Timeline", icon: FiClock },
        { id: "parties", label: "Parties", icon: FiUsers },
        { id: "notices", label: "Notices", icon: FiFileText },
        { id: "meetings", label: "Meetings", icon: FiUsers },
        { id: "documents", label: "Documents", icon: FiFileText },
        { id: "recordings", label: "Recordings", icon: FiVideo },
    ];

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!caseData) {
        return (
            <div className="text-center py-20 text-gray-500">
                <FiAlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">Case not found</h3>
                <Link to="/cases" className="text-primary hover:underline mt-2 inline-block">Return to Cases</Link>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-10">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        to="/cases"
                        className="p-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm rounded-xl transition-colors text-gray-600 dark:text-gray-300"
                    >
                        <FiArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{caseData.case_code}</h1>
                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${caseData.status === "NEW" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                caseData.status === "CLOSED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                                    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                }`}>
                                {caseData.status}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Ref: {caseData.ref_no || "N/A"} • Agreement: {caseData.agreement_no || "N/A"} • Allocated: {caseData.allocated_at ? new Date(caseData.allocated_at).toLocaleDateString() : new Date(caseData.created_at).toLocaleDateString()}
                        </p>
                    </div>
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
                <div className="p-4 sm:p-6 bg-gray-50/30 dark:bg-transparent">
                    {/* OVERVIEW TAB */}
                    {activeTab === "overview" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                            {/* General Details */}
                            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold border-b border-gray-100 dark:border-white/5 pb-3">
                                    <FiBriefcase className="text-primary" /> Case Setup
                                </div>
                                <div className="space-y-3 text-sm">
                                    <DetailRow label="Zone" value={caseData.zone} />
                                    <DetailRow label="Region" value={caseData.region} />
                                    <DetailRow label="Branch Name" value={`${caseData.branch_name || "-"} ${caseData.branch_code ? `(${caseData.branch_code})` : ""}`} />
                                    <DetailRow label="Product" value={caseData.product} />
                                    <DetailRow label="Mode" value={caseData.mode} />
                                    <DetailRow label="Allocation Pos" value={caseData.allocation_pos} />
                                    <DetailRow label="Agreement Date" value={caseData.agreement_date ? new Date(caseData.agreement_date).toLocaleDateString() : "-"} />
                                </div>
                            </div>

                            {/* Financial Details */}
                            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold border-b border-gray-100 dark:border-white/5 pb-3">
                                    <FiDollarSign className="text-green-500" /> Financials
                                </div>
                                <div className="space-y-3 text-sm">
                                    <DetailRow label="Amount Financed" value={caseData.amount_financed ? `₹${caseData.amount_financed.toLocaleString()}` : "-"} />
                                    <DetailRow label="Claim Amount" value={caseData.claim_amount ? `₹${caseData.claim_amount.toLocaleString()}` : "-"} />
                                    <DetailRow label="Claim Date" value={caseData.claim_date ? new Date(caseData.claim_date).toLocaleDateString() : "-"} />
                                    <DetailRow label="Finance Charge" value={caseData.finance_charge ? `₹${caseData.finance_charge.toLocaleString()}` : "-"} />
                                    <DetailRow label="Agreement Value" value={caseData.agreement_value ? `₹${caseData.agreement_value.toLocaleString()}` : "-"} />
                                    <DetailRow label="Award Amount" value={caseData.award_amount ? `₹${caseData.award_amount.toLocaleString()} (${caseData.award_amount_words || '-'})` : "-"} />
                                    <DetailRow label="First EMI Date" value={caseData.first_emi_date ? new Date(caseData.first_emi_date).toLocaleDateString() : "-"} />
                                    <DetailRow label="Last EMI Date" value={caseData.last_emi_date ? new Date(caseData.last_emi_date).toLocaleDateString() : "-"} />
                                    <DetailRow label="DPD" value={caseData.dpd} />
                                    <DetailRow label="Tenure" value={caseData.tenure} />
                                </div>
                            </div>

                            {/* Asset & Other Details */}
                            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold border-b border-gray-100 dark:border-white/5 pb-3">
                                    <FiActivity className="text-orange-500" /> Asset Information
                                </div>
                                <div className="space-y-3 text-sm">
                                    <DetailRow label="Make / Model" value={`${caseData.make || "-"} / ${caseData.model || "-"}`} />
                                    <DetailRow label="Reg No" value={caseData.reg_no} />
                                    <DetailRow label="Engine No" value={caseData.engine_no} />
                                    <DetailRow label="Chassis No" value={caseData.chassis_no} />
                                    <DetailRow label="Repossession Status" value={caseData.repossession_status} />
                                </div>

                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold border-b border-gray-100 dark:border-white/5 pb-3 pt-2">
                                    <FiCalendar className="text-blue-500" /> Sec 17 Status
                                </div>
                                <div className="space-y-3 text-sm">
                                    <DetailRow label="Applied" value={caseData.sec_17_applied} />
                                    <DetailRow label="Applied Date" value={caseData.sec_17_applied_date ? new Date(caseData.sec_17_applied_date).toLocaleDateString() : "-"} />
                                    <DetailRow label="Received Date" value={caseData.sec_17_received_date ? new Date(caseData.sec_17_received_date).toLocaleDateString() : "-"} />
                                </div>
                            </div>

                            {/* Arbitration Details */}
                            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                                <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold border-b border-gray-100 dark:border-white/5 pb-3">
                                    <FiBriefcase className="text-purple-500" /> Arbitration Details
                                </div>
                                <div className="space-y-3 text-sm">
                                    <DetailRow label="Institution" value={caseData.arbitration?.institution_name} />
                                    <DetailRow label="Arbitrator" value={caseData.arbitration?.arbitrator_name} />
                                    <DetailRow label="Contact No." value={caseData.arbitration?.arbitrator_phone} />
                                    <DetailRow label="Email" value={caseData.arbitration?.arbitrator_email} />
                                    <DetailRow label="Address" value={caseData.arbitration?.arbitrator_address} />
                                    <DetailRow label="Arb Case No." value={caseData.arbitration?.arb_case_no} />
                                    <DetailRow label="Acceptance Date" value={caseData.arbitration?.acceptance_date ? new Date(caseData.arbitration.acceptance_date).toLocaleDateString() : "-"} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* PARTIES TAB */}
                    {activeTab === "parties" && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            {caseData.parties && caseData.parties.length > 0 ? (
                                caseData.parties.map((party) => (
                                    <div key={party.id} className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 space-y-4">
                                        <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold border-b border-gray-100 dark:border-white/5 pb-3 uppercase tracking-wide text-sm">
                                            <FiUsers className="text-primary" /> {party.party_type.replace('_', ' ')}
                                        </div>
                                        <div className="space-y-3 text-sm">
                                            <DetailRow label="Name" value={party.name} />
                                            <DetailRow label="Father Name" value={party.father_name} />
                                            <DetailRow label="Age" value={party.age ? `${party.age} years` : "-"} />
                                            <DetailRow label="Primary Phone" value={party.phone} />
                                            <DetailRow label="Secondary Phone / Email" value={party.phone_2 || party.email} />

                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Residence Addresses</p>
                                                <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                                                    {party.address && <p>• {party.address}</p>}
                                                    {party.residence_address_2 && <p>• {party.residence_address_2}</p>}
                                                    {party.residence_address_3 && <p>• {party.residence_address_3}</p>}
                                                    {!party.address && !party.residence_address_2 && !party.residence_address_3 && <p className="text-gray-400 italic">No residence recorded</p>}
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Office Addresses</p>
                                                <div className="space-y-1 bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-gray-700 dark:text-gray-300">
                                                    {party.office_address_1 && <p>• {party.office_address_1}</p>}
                                                    {party.office_address_2 && <p>• {party.office_address_2}</p>}
                                                    {party.office_address_3 && <p>• {party.office_address_3}</p>}
                                                    {!party.office_address_1 && !party.office_address_2 && !party.office_address_3 && <p className="text-gray-400 italic">No office recorded</p>}
                                                </div>
                                            </div>

                                            <div className="flex gap-4 pt-2">
                                                <DetailRow label="City" value={party.city} />
                                                <DetailRow label="State" value={party.state} />
                                                <DetailRow label="PIN" value={party.postal_code} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full text-center py-10 text-gray-500">No parties found for this case.</div>
                            )}
                        </div>
                    )}

                    {/* NOTICES TAB */}
                    {activeTab === "notices" && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Notices</h3>
                            </div>
                            {caseData.notices && caseData.notices.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {caseData.notices.map((notice) => (
                                        <div key={notice.id} className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <FiFileText className="text-primary" /> Notice {notice.notice_type || notice.notice_no}
                                                </div>
                                                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400">
                                                    {notice.status}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                <strong>Notice No:</strong> {notice.notice_no}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                <strong>Date Created:</strong> {new Date(notice.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    <FiFileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p>No notices generated yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* TIMELINE TAB */}
                    {activeTab === "timeline" && (
                        <div className="bg-white dark:bg-white/5 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Case Milestones</h3>
                            {caseData.milestones && caseData.milestones.length > 0 ? (
                                <div className="relative border-l-2 border-gray-100 dark:border-white/10 ml-4 space-y-8">
                                    {caseData.milestones.sort((a, b) => new Date(a.planned_date) - new Date(b.planned_date)).map((milestone, idx) => (
                                        <div key={milestone.id} className="relative pl-6">
                                            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-[#1f2937] border-2 border-primary shadow-sm" />
                                            <div>
                                                <h4 className="font-semibold text-gray-900 dark:text-white uppercase text-sm">{milestone.milestone_type.replace(/_/g, ' ')}</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    <FiCalendar className="inline mr-1 text-gray-400" />
                                                    {milestone.planned_date ? new Date(milestone.planned_date).toLocaleDateString() : "Pending"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No timeline data available for this case.</p>
                            )}
                        </div>
                    )}

                    {/* Pending Sub-tabs */}
                    {["meetings", "documents", "recordings"].includes(activeTab) && (
                        <div className="text-center py-16 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                            <FiFileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
                            <p className="mt-2">This dedicated section is currently being dynamically hooked to relational case data.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex justify-between items-start gap-4">
        <span className="text-gray-500 min-w-max">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white text-right break-words">{value || "-"}</span>
    </div>
);

export default CaseDetail;
