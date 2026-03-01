import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FiArrowLeft, FiClock, FiFileText, FiUsers, FiVideo, FiActivity,
    FiMapPin, FiPhone, FiMail, FiDollarSign, FiCalendar, FiBriefcase, FiAlertCircle, FiUploadCloud, FiDownload
} from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const CaseDetail = () => {
    const { caseId } = useParams();
    const [activeTab, setActiveTab] = useState("overview");
    const [caseData, setCaseData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [advocates, setAdvocates] = useState([]);
    const [selectedAdvocate, setSelectedAdvocate] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [isGeneratingNotice, setIsGeneratingNotice] = useState(false);
    const [isUploadingRecording, setIsUploadingRecording] = useState(false);
    const [isUploadingDocument, setIsUploadingDocument] = useState(false);
    const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingNotes, setMeetingNotes] = useState("");
    const [isClosingCase, setIsClosingCase] = useState(false);
    const { getCase, handleRequest, getUsers, assignAdvocate, createNotice, uploadRecording, downloadRecording, uploadDocument, downloadDocument, createMeeting, closeCase } = useApi();

    useEffect(() => {
        const fetchCaseData = async () => {
            setLoading(true);
            const { data, error } = await handleRequest(() => getCase(caseId));
            if (error) {
                toast.error("Failed to load case details.");
            } else {
                setCaseData(data);
                // Also fetch advocates
                const { data: usersData, error: usersErr } = await handleRequest(() => getUsers("advocate"));
                if (!usersErr && usersData) {
                    setAdvocates(usersData);
                }
            }
            setLoading(false);
        };
        if (caseId) fetchCaseData();
    }, [caseId]);

    const handleAssignAdvocate = async () => {
        if (!selectedAdvocate) return;
        setIsAssigning(true);
        const { data, error } = await handleRequest(() => assignAdvocate(caseId, selectedAdvocate));
        setIsAssigning(false);
        if (error) {
            toast.error(error);
        } else {
            toast.success("Advocate assigned successfully");
            setCaseData(data);
        }
    };

    const handleCreateNotice = async () => {
        setIsGeneratingNotice(true);
        const nextNoticeNo = (caseData.notices?.length || 0) + 1;
        const noticeType = nextNoticeNo === 1 ? "A" : nextNoticeNo === 2 ? "B" : "C";

        const { error } = await handleRequest(() => createNotice({
            case_id: caseId,
            notice_no: nextNoticeNo,
            notice_type: noticeType,
            content: {}
        }));

        setIsGeneratingNotice(false);
        if (error) {
            toast.error(error);
        } else {
            toast.success(`Notice #${nextNoticeNo} generated and dispatched`);
            // Refresh case data
            const { data: newCaseData } = await handleRequest(() => getCase(caseId));
            if (newCaseData) setCaseData(newCaseData);
        }
    };

    const handleRecordingUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploadingRecording(true);
        const formData = new FormData();
        formData.append("file", file);

        const { error } = await handleRequest(() => uploadRecording(caseId, formData));
        setIsUploadingRecording(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success("Recording uploaded successfully");
            const { data: newCaseData } = await handleRequest(() => getCase(caseId));
            if (newCaseData) setCaseData(newCaseData);
        }
    };

    const handleRecordingDownload = async (recordingId, fileName) => {
        const { data, error } = await handleRequest(() => downloadRecording(recordingId));
        if (error) {
            toast.error("Failed to download recording");
        } else if (data) {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'recording.mp4');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    const handleDocumentUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Strict type checking block
        const allowedTypes = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // docx
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // xlsx
            "image/png",
            "image/jpeg",
            "image/jpg"
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error("Invalid file type. Please upload PDF, Word, Excel, or Image files.");
            e.target.value = ""; // Reset input
            return;
        }

        setIsUploadingDocument(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", "OTHER");

        const { error } = await handleRequest(() => uploadDocument(caseId, formData));
        setIsUploadingDocument(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success("Document uploaded successfully");
            const { data: newCaseData } = await handleRequest(() => getCase(caseId));
            if (newCaseData) setCaseData(newCaseData);
        }
    };

    const handleDocumentDownload = async (documentId, fileName) => {
        const { data, error } = await handleRequest(() => downloadDocument(documentId));
        if (error) {
            toast.error("Failed to download document");
        } else if (data) {
            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.remove();
        }
    };

    const handleScheduleMeeting = async (e) => {
        e.preventDefault();
        if (!meetingDate) return toast.error("Please enter a meeting date");

        setIsSchedulingMeeting(true);
        const { error } = await handleRequest(() => createMeeting({
            case_id: caseId,
            scheduled_at: new Date(meetingDate).toISOString(),
            notes: meetingNotes,
            meet_provider: "google_meet"
        }));
        setIsSchedulingMeeting(false);

        if (error) {
            toast.error(error);
        } else {
            toast.success("Meeting scheduled successfully");
            setMeetingDate("");
            setMeetingNotes("");
            const { data: newCaseData } = await handleRequest(() => getCase(caseId));
            if (newCaseData) setCaseData(newCaseData);
        }
    };

    const handleCloseCase = async () => {
        if (!window.confirm("Are you sure you want to close this case? This action cannot be undone.")) return;
        setIsClosingCase(true);
        const { error } = await handleRequest(() => closeCase(caseId));
        setIsClosingCase(false);
        if (error) {
            toast.error(error);
        } else {
            toast.success("Case closed successfully");
            const { data: newCaseData } = await handleRequest(() => getCase(caseId));
            if (newCaseData) setCaseData(newCaseData);
        }
    };

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
                            {caseData.status !== "CLOSED" && caseData.rules_state?.closure_enabled && (
                                <button
                                    onClick={handleCloseCase}
                                    disabled={isClosingCase}
                                    className="ml-4 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50 flex items-center gap-1"
                                >
                                    <FiAlertCircle className="w-3 h-3" />
                                    {isClosingCase ? "Closing..." : "Close Case"}
                                </button>
                            )}
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

                                {/* Advocate Assignment */}
                                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <div className="flex-1">
                                        <label className="text-xs text-gray-500 font-medium uppercase">Assigned Advocate</label>
                                        {caseData.assigned_advocate_id ? (
                                            <div className="font-medium text-gray-900 dark:text-white mt-1">
                                                {advocates.find(a => a.id === caseData.assigned_advocate_id)?.username || caseData.assigned_advocate_id}
                                            </div>
                                        ) : (
                                            <select
                                                value={selectedAdvocate}
                                                onChange={(e) => setSelectedAdvocate(e.target.value)}
                                                className="w-full mt-1 p-2 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg focus:ring-primary focus:border-primary outline-none"
                                            >
                                                <option value="">Select Advocate...</option>
                                                {advocates.map(adv => (
                                                    <option key={adv.id} value={adv.id}>{adv.username}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                    {!caseData.assigned_advocate_id && (
                                        <button
                                            onClick={handleAssignAdvocate}
                                            disabled={!selectedAdvocate || isAssigning}
                                            className="mt-5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                        >
                                            {isAssigning ? "Assigning..." : "Assign"}
                                        </button>
                                    )}
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
                                {caseData.status !== "CLOSED" && (
                                    <button
                                        onClick={handleCreateNotice}
                                        disabled={isGeneratingNotice}
                                        className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50"
                                    >
                                        {isGeneratingNotice ? "Generating..." : `Generate Notice #${(caseData.notices?.length || 0) + 1}`}
                                    </button>
                                )}
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
                                            {notice.content?.portal_link && (
                                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Generated Links</p>
                                                    <a href={notice.content.portal_link} target="_blank" rel="noreferrer" className="block text-sm text-blue-500 hover:underline truncate">Victim Portal</a>
                                                    {notice.content.meeting_url && (
                                                        <a href={notice.content.meeting_url} target="_blank" rel="noreferrer" className="block text-sm text-purple-500 hover:underline truncate">Meeting Link</a>
                                                    )}
                                                </div>
                                            )}
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

                    {/* RECORDINGS TAB */}
                    {activeTab === "recordings" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Meeting Recordings</h3>
                                <label className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer flex items-center gap-2 transition-colors">
                                    <FiUploadCloud className="w-4 h-4" />
                                    {isUploadingRecording ? "Uploading..." : "Upload Recording"}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="video/*"
                                        onChange={handleRecordingUpload}
                                        disabled={isUploadingRecording}
                                    />
                                </label>
                            </div>

                            {caseData.recordings && caseData.recordings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {caseData.recordings.map(recording => (
                                        <div key={recording.id} className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-start gap-4 hover:border-primary/20 transition-colors group">
                                            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 transition-colors">
                                                <FiVideo className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-900 dark:text-white truncate">{recording.file_name}</h4>
                                                <p className="text-xs text-gray-500 mt-1">Uploaded: {new Date(recording.uploaded_at).toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">Size: {(recording.size_bytes / (1024 * 1024)).toFixed(2)} MB</p>
                                            </div>
                                            <button
                                                onClick={() => handleRecordingDownload(recording.id, recording.file_name)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Secure Download"
                                            >
                                                <FiDownload className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <FiVideo className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Recordings Yet</h3>
                                    <p className="mt-2 text-sm text-gray-500">Upload internal meeting recordings securely.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* MEETINGS TAB */}
                    {activeTab === "meetings" && (
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Schedule a Meeting</h3>
                                <form onSubmit={handleScheduleMeeting} className="flex flex-col sm:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="text-xs text-gray-500 font-medium uppercase block mb-1">Date & Time</label>
                                        <input
                                            type="datetime-local"
                                            value={meetingDate}
                                            onChange={(e) => setMeetingDate(e.target.value)}
                                            required
                                            className="w-full p-2 text-sm bg-gray-50 dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-primary focus:border-primary outline-none text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <label className="text-xs text-gray-500 font-medium uppercase block mb-1">Notes (Optional)</label>
                                        <input
                                            type="text"
                                            value={meetingNotes}
                                            onChange={(e) => setMeetingNotes(e.target.value)}
                                            placeholder="Purpose of meeting"
                                            className="w-full p-2 text-sm bg-gray-50 dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-primary focus:border-primary outline-none text-gray-900 dark:text-white"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isSchedulingMeeting}
                                        className="w-full sm:w-auto px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 h-[38px] flex items-center justify-center gap-2"
                                    >
                                        <FiCalendar className="w-4 h-4" />
                                        {isSchedulingMeeting ? "Scheduling..." : "Schedule"}
                                    </button>
                                </form>
                            </div>

                            {caseData.meetings && caseData.meetings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {caseData.meetings.map(meeting => (
                                        <div key={meeting.id} className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between hover:border-primary/20 transition-colors">
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <FiUsers className="text-primary" /> Meeting
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${meeting.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {meeting.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    <strong>Date:</strong> {new Date(meeting.scheduled_at).toLocaleString()}
                                                </p>
                                                {meeting.notes && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                                        <strong>Notes:</strong> {meeting.notes}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex flex-col gap-2">
                                                {meeting.meet_url && (
                                                    <a href={meeting.meet_url} target="_blank" rel="noreferrer" className="text-sm text-purple-500 hover:underline flex items-center gap-1">
                                                        <FiVideo className="w-4 h-4" /> Join Virtual Meeting
                                                    </a>
                                                )}
                                                {meeting.portal_url && (
                                                    <a href={meeting.portal_url} target="_blank" rel="noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                                                        <FiAlertCircle className="w-4 h-4" /> Victim Link
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <FiUsers className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <p>No meetings scheduled yet.</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* DOCUMENTS TAB */}
                    {activeTab === "documents" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Case Documents</h3>
                                <label className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 cursor-pointer flex items-center gap-2 transition-colors">
                                    <FiUploadCloud className="w-4 h-4" />
                                    {isUploadingDocument ? "Uploading..." : "Upload Document"}
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.doc,.docx,.xls,.xlsx,image/png,image/jpeg,image/jpg"
                                        onChange={handleDocumentUpload}
                                        disabled={isUploadingDocument}
                                    />
                                </label>
                            </div>

                            {caseData.documents && caseData.documents.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {caseData.documents.map(doc => (
                                        <div key={doc.id} className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex items-start gap-4 hover:border-primary/20 transition-colors group">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${doc.source === 'victim' ? 'bg-orange-50 text-orange-500 group-hover:bg-orange-100' : 'bg-green-50 text-green-500 group-hover:bg-green-100'}`}>
                                                <FiFileText className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={doc.file_name}>{doc.file_name}</h4>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${doc.source === 'victim' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                                                        {doc.source}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Uploaded: {new Date(doc.created_at).toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">Size: {(doc.size_bytes / (1024 * 1024)).toFixed(2)} MB • {doc.category}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDocumentDownload(doc.id, doc.file_name)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                title="Secure Download"
                                            >
                                                <FiDownload className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-16 text-gray-500 bg-white dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <FiFileText className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No Documents Yet</h3>
                                    <p className="mt-2 text-sm text-gray-500">Upload case files or wait for victim uploads.</p>
                                </div>
                            )}
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
