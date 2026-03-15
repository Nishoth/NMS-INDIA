import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    FiArrowLeft, FiClock, FiFileText, FiUsers, FiVideo, FiActivity,
    FiMapPin, FiPhone, FiMail, FiDollarSign, FiCalendar, FiBriefcase, FiAlertCircle, FiUploadCloud, FiDownload,
    FiExternalLink, FiCheckCircle, FiShield, FiSend, FiX, FiRefreshCw
} from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { fetchCaseDetail, updateNoticeStatusLocal } from "../store/slices/caseSlice";
import AddNoticeModal from "../components/AddNoticeModal";
import { useApi } from "../hooks/useApi";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";

const CaseDetail = () => {
    const dispatch = useDispatch();
    const { caseId } = useParams();
    const { currentCase: caseData, loading, error: caseError } = useSelector((state) => state.cases);
    const { userData, hasRole } = useAppContext();
    
    // Check if user is admin or superadmin
    const isAdminOrSuperAdmin = hasRole('admin', 'superadmin');

    // Load active tab from localStorage or default to "overview"
    const [activeTab, setActiveTab] = useState(() => {
        if (caseId) {
            const savedTab = localStorage.getItem(`case_${caseId}_activeTab`);
            return savedTab || "overview";
        }
        return "overview";
    });
    const [advocates, setAdvocates] = useState([]);
    const [selectedAdvocate, setSelectedAdvocate] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);
    const [isUploadingRecording, setIsUploadingRecording] = useState(false);
    const [isUploadingDocument, setIsUploadingDocument] = useState(false);
    const [isSchedulingMeeting, setIsSchedulingMeeting] = useState(false);
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingNotes, setMeetingNotes] = useState("");
    const [isClosingCase, setIsClosingCase] = useState(false);
    const [storedAdvocate, setStoredAdvocate] = useState(null);
    
    // Notice sorting state
    const [noticeSortBy, setNoticeSortBy] = useState('updated'); // 'updated', 'created', 'scheduled', 'noticeNo'
    
    // Send confirmation modal state
    const [sendModalOpen, setSendModalOpen] = useState(false);
    const [sendModalType, setSendModalType] = useState(null); // 'notice' or 'meeting'
    const [sendModalItem, setSendModalItem] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [sendError, setSendError] = useState(null); // Track send errors

    const { handleRequest, getUsers, assignAdvocate, uploadRecording, downloadRecording, uploadDocument, downloadDocument, createMeeting, closeCase } = useApi();
    
    // Load stored advocate from localStorage when caseId changes
    useEffect(() => {
        if (caseId) {
            try {
                const stored = localStorage.getItem(`case_${caseId}_advocate`);
                console.log('Loading stored advocate for case:', caseId, 'Stored:', stored);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    console.log('Parsed advocate from localStorage:', parsed);
                    setStoredAdvocate(parsed);
                    // Also set the selected advocate so dropdown shows the assigned value
                    setSelectedAdvocate(parsed.id);
                } else {
                    console.log('No stored advocate found for case:', caseId);
                    setStoredAdvocate(null);
                    setSelectedAdvocate("");
                }
            } catch (error) {
                console.error('Error loading stored advocate:', error);
                setStoredAdvocate(null);
                setSelectedAdvocate("");
            }
        }
    }, [caseId]);

    // Save active tab to localStorage whenever it changes
    useEffect(() => {
        if (caseId && activeTab) {
            localStorage.setItem(`case_${caseId}_activeTab`, activeTab);
            console.log('Saved active tab:', activeTab, 'for case:', caseId);
        }
    }, [activeTab, caseId]);

    // Dummy advocate mapping for demo
    const getDummyAdvocateName = (id) => {
        const dummyAdvocates = {
            'adv-1': 'John Smith - Senior Advocate',
            'adv-2': 'Sarah Johnson - Junior Advocate',
            'adv-3': 'Michael Brown - Partner',
            'adv-4': 'Emily Davis - Associate',
            'adv-5': 'Robert Wilson - Senior Partner',
            'adv-6': 'Lisa Anderson - Managing Partner'
        };
        return dummyAdvocates[id] || null;
    };

    // Helper function to get user display name from ID or username
    const getUserDisplayName = (userId, username, role) => {
        // If we have username, use it
        if (username && typeof username === 'string' && !username.includes('-')) {
            return { name: username, role: role || 'User' };
        }
        // If current user matches the ID, show current user info
        if (userData && (userData.id === userId || userData.username === username)) {
            return { name: userData.username || userData.name || 'You', role: userData.role || 'User' };
        }
        // For demo purposes, map some known IDs to names
        const knownUsers = {
            'rukshan': { name: 'Rukshan', role: 'Admin' },
            'admin': { name: 'Admin', role: 'Administrator' },
        };
        if (username && knownUsers[username.toLowerCase()]) {
            return knownUsers[username.toLowerCase()];
        }
        // Return formatted ID or username
        return { 
            name: username || (userId ? `User ${userId.slice(0, 8)}...` : 'Unknown'), 
            role: role || 'User' 
        };
    };

    useEffect(() => {
        if (caseId) {
            dispatch(fetchCaseDetail(caseId));

            // Fetch advocates
            const fetchAdvocates = async () => {
                const { data, error } = await handleRequest(() => getUsers("advocate"));
                if (!error && data) setAdvocates(data);
            };
            fetchAdvocates();
        }
    }, [caseId, dispatch]);

    const handleAssignAdvocate = async () => {
        if (!selectedAdvocate) return;
        setIsAssigning(true);
        const { error } = await handleRequest(() => assignAdvocate(caseId, selectedAdvocate));
        setIsAssigning(false);
        if (error) {
            toast.error(error);
        } else {
            toast.success("Advocate assigned successfully");
            // Store the assigned advocate in localStorage for persistence across refreshes
            const assignedName = getDummyAdvocateName(selectedAdvocate) || 
                                 advocates.find(a => a.id === selectedAdvocate)?.username ||
                                 selectedAdvocate;
            const advocateData = {
                id: selectedAdvocate,
                name: assignedName
            };
            console.log('Saving advocate to localStorage:', advocateData);
            localStorage.setItem(`case_${caseId}_advocate`, JSON.stringify(advocateData));
            // Update state immediately so UI reflects the change
            setStoredAdvocate(advocateData);
            setSelectedAdvocate("");
            dispatch(fetchCaseDetail(caseId));
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
            dispatch(fetchCaseDetail(caseId));
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
            dispatch(fetchCaseDetail(caseId));
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
            dispatch(fetchCaseDetail(caseId));
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
            dispatch(fetchCaseDetail(caseId));
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
                                        
                                        {/* Display Assigned Advocate Name - persists after refresh */}
                                        {(() => {
                                            // Read directly from localStorage every render to ensure persistence
                                            const stored = typeof window !== 'undefined' ? localStorage.getItem(`case_${caseId}_advocate`) : null;
                                            const parsedStored = stored ? JSON.parse(stored) : null;
                                            
                                            // Priority: backend data > localStorage > state
                                            const advocateId = caseData?.assigned_advocate_id || parsedStored?.id || storedAdvocate?.id;
                                            
                                            let advocateName = caseData?.assigned_advocate_name || 
                                                               parsedStored?.name ||
                                                               storedAdvocate?.name;
                                            
                                            // If no name found but ID exists, look it up
                                            if (!advocateName && advocateId) {
                                                // Check in advocates list
                                                const foundAdvocate = advocates.find(a => a.id === advocateId);
                                                if (foundAdvocate) {
                                                    advocateName = foundAdvocate.username;
                                                } else {
                                                    // Check dummy advocates
                                                    const dummyNames = {
                                                        'adv-1': 'John Smith - Senior Advocate',
                                                        'adv-2': 'Sarah Johnson - Junior Advocate',
                                                        'adv-3': 'Michael Brown - Partner',
                                                        'adv-4': 'Emily Davis - Associate',
                                                        'adv-5': 'Robert Wilson - Senior Partner',
                                                        'adv-6': 'Lisa Anderson - Managing Partner'
                                                    };
                                                    advocateName = dummyNames[advocateId];
                                                }
                                            }
                                            
                                            console.log('Display advocate:', { advocateId, advocateName, stored, parsedStored });
                                            
                                            if (advocateName) {
                                                return (
                                                    <div className="mt-2 mb-3 p-3 bg-primary/10 border border-primary/20 rounded-xl flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
                                                            {advocateName.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{advocateName}</p>
                                                            <p className="text-xs text-gray-500">Assigned Advocate</p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}
                                        
                                        {/* Always show dropdown with assigned value selected */}
                                        <div className="mt-1">
                                            <select
                                                value={(() => {
                                                    // Get assigned advocate from localStorage or state
                                                    const stored = localStorage.getItem(`case_${caseId}_advocate`);
                                                    const parsedStored = stored ? JSON.parse(stored) : null;
                                                    return selectedAdvocate || 
                                                           caseData?.assigned_advocate_id || 
                                                           parsedStored?.id || 
                                                           storedAdvocate?.id || 
                                                           "";
                                                })()}
                                                onChange={(e) => setSelectedAdvocate(e.target.value)}
                                                disabled={(() => {
                                                    const stored = localStorage.getItem(`case_${caseId}_advocate`);
                                                    return !!(caseData?.assigned_advocate_id || caseData?.assigned_advocate_name || stored || storedAdvocate?.id);
                                                })()}
                                                className="w-full p-2.5 text-sm bg-white dark:bg-[#1f2937] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                style={{
                                                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E")`,
                                                    backgroundPosition: 'right 0.5rem center',
                                                    backgroundRepeat: 'no-repeat',
                                                    backgroundSize: '1.5em 1.5em',
                                                    paddingRight: '2.5rem'
                                                }}
                                            >
                                                <option value="" className="text-gray-500 dark:text-gray-400">Select Advocate...</option>
                                                {/* Real advocates from backend */}
                                                {advocates.map(adv => (
                                                    <option key={adv.id} value={adv.id} className="text-gray-900 dark:text-white bg-white dark:bg-[#1f2937]">{adv.username}</option>
                                                ))}
                                                {/* Dummy advocates for demo */}
                                                {advocates.length === 0 && (
                                                    <>
                                                        <option value="adv-1" className="text-gray-900 dark:text-white bg-white dark:bg-[#1f2937]">John Smith - Senior Advocate</option>
                                                        <option value="adv-2" className="text-gray-900 dark:text-white bg-white dark:bg-[#1f2937]">Sarah Johnson - Junior Advocate</option>
                                                        <option value="adv-3" className="text-gray-900 dark:text-white bg-white dark:bg-[#1f2937]">Michael Brown - Partner</option>
                                                        <option value="adv-4" className="text-gray-900 dark:text-white bg-white dark:bg-[#1f2937]">Emily Davis - Associate</option>
                                                        <option value="adv-5" className="text-gray-900 dark:text-white bg-white dark:bg-[#1f2937]">Robert Wilson - Senior Partner</option>
                                                        <option value="adv-6" className="text-gray-900 dark:text-white bg-white dark:bg-[#1f2937]">Lisa Anderson - Managing Partner</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleAssignAdvocate}
                                        disabled={(() => {
                                            const stored = localStorage.getItem(`case_${caseId}_advocate`);
                                            const parsedStored = stored ? JSON.parse(stored) : null;
                                            const hasAssigned = !!(caseData?.assigned_advocate_id || caseData?.assigned_advocate_name || stored || storedAdvocate?.id || parsedStored?.id);
                                            return !selectedAdvocate || isAssigning || hasAssigned;
                                        })()}
                                        className="mt-5 px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isAssigning ? "Assigning..." : "Assign"}
                                    </button>
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Notices</h3>
                                <div className="flex items-center gap-3">
                                    {/* Sort Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-xs text-gray-500 font-medium">Sort by:</label>
                                        <select
                                            value={noticeSortBy}
                                            onChange={(e) => setNoticeSortBy(e.target.value)}
                                            className="text-sm p-2 bg-white dark:bg-[#1f2937] border border-gray-200 dark:border-white/10 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none text-gray-900 dark:text-white"
                                        >
                                            <option value="updated">Last Updated</option>
                                            <option value="created">Created Date</option>
                                            <option value="scheduled">Scheduled Date</option>
                                            <option value="noticeNo">Notice Number</option>
                                        </select>
                                    </div>
                                    {caseData.status !== "CLOSED" && (
                                        <button
                                            onClick={() => setIsNoticeModalOpen(true)}
                                            className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90"
                                        >
                                            Add Notice
                                        </button>
                                    )}
                                </div>
                            </div>
                            {caseData.notices && caseData.notices.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {[...caseData.notices]
                                        .sort((a, b) => {
                                            switch (noticeSortBy) {
                                                case 'updated':
                                                    // Sort by last updated (newest first)
                                                    return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
                                                case 'created':
                                                    // Sort by created date (newest first)
                                                    return new Date(b.created_at) - new Date(a.created_at);
                                                case 'scheduled':
                                                    // Sort by scheduled date (soonest first)
                                                    const schedA = a.scheduled_at || a.content?.scheduled_date;
                                                    const schedB = b.scheduled_at || b.content?.scheduled_date;
                                                    if (!schedA && !schedB) return 0;
                                                    if (!schedA) return 1;
                                                    if (!schedB) return -1;
                                                    return new Date(schedA) - new Date(schedB);
                                                case 'noticeNo':
                                                    // Sort by notice number (ascending)
                                                    return (a.notice_no || 0) - (b.notice_no || 0);
                                                default:
                                                    return new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at);
                                            }
                                        })
                                        .map((notice) => (
                                        <div key={notice.id} className="bg-white dark:bg-white/5 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 hover:border-primary/30 transition-all">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                    <FiFileText className="text-primary" /> Notice N-{notice.notice_no}
                                                </div>
                                                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                                    notice.status === 'draft' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400' :
                                                    notice.status === 'sent' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400' :
                                                    notice.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400' :
                                                    notice.status === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' :
                                                    'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-400'
                                                }`}>
                                                    {notice.status?.toUpperCase() || 'DRAFT'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                <strong>Type:</strong> {notice.notice_type}
                                            </p>
                                            
                                            {/* Created Date & Time */}
                                            <div className="mt-2 p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                                <p className="text-xs text-gray-500">
                                                    <strong>Created:</strong> <span className="text-sky-400">{new Date(notice.created_at).toLocaleDateString()} at {new Date(notice.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                </p>
                                            </div>
                                            
                                            {/* Scheduled Date & Time - Only show when meeting is created */}
                                            {(notice.content?.meeting_url || notice.meeting_url) && (notice.scheduled_at || notice.content?.scheduled_date) && (
                                                <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                                                    <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-1">
                                                        <FiCalendar className="w-3 h-3" />
                                                        <strong>Scheduled for:</strong> {new Date(notice.scheduled_at || notice.content?.scheduled_date).toLocaleDateString()} at {new Date(notice.scheduled_at || notice.content?.scheduled_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Links */}
                                            {notice.content?.portal_link && (
                                                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 space-y-2">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase">Generated Links</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <a href={notice.content.portal_link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 px-2 py-1 rounded-lg hover:bg-blue-100 transition-colors">
                                                            <FiExternalLink className="w-3 h-3" /> Portal Link
                                                        </a>
                                                        {/* Only show Meeting link if meeting_url exists and is not empty */}
                                                        {(notice.content?.meeting_url || notice.meeting_url) && (
                                                            <a 
                                                                href={notice.content?.meeting_url || notice.meeting_url} 
                                                                target="_blank" 
                                                                rel="noreferrer" 
                                                                className="flex items-center gap-1 text-xs bg-purple-50 dark:bg-purple-900/20 text-purple-600 px-2 py-1 rounded-lg hover:bg-purple-100 transition-colors"
                                                            >
                                                                <FiVideo className="w-3 h-3" /> Meeting
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Attachments for this specific notice */}
                                            {notice.attachments && notice.attachments.length > 0 && (
                                                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Attachments</p>
                                                    <div className="space-y-1">
                                                        {notice.attachments.map(att => (
                                                            <div key={att.id} className="flex items-center justify-between text-xs bg-gray-50 dark:bg-black/20 p-2 rounded-lg">
                                                                <span className="truncate flex-1 pr-2">{att.document?.file_name}</span>
                                                                <button onClick={() => handleDocumentDownload(att.document_id, att.document?.file_name)} className="text-primary hover:text-primary/70">
                                                                    <FiDownload className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Actions */}
                                            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-end gap-2">
                                                {notice.status === 'draft' && (
                                                    <button
                                                        onClick={() => {
                                                            setSendModalType('notice');
                                                            setSendModalItem(notice);
                                                            setSendError(null);
                                                            setSendModalOpen(true);
                                                        }}
                                                        className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium"
                                                    >
                                                        Send Now
                                                    </button>
                                                )}
                                                {notice.status === 'error' && (
                                                    <button
                                                        onClick={() => {
                                                            setSendModalType('notice');
                                                            setSendModalItem(notice);
                                                            setSendError(notice.error_message || 'Failed to send');
                                                            setSendModalOpen(true);
                                                        }}
                                                        className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium flex items-center gap-1"
                                                    >
                                                        <FiRefreshCw className="w-3 h-3" /> Resend
                                                    </button>
                                                )}
                                                <Link to={`/notices/${notice.id}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                                                    View <FiArrowLeft className="rotate-180" />
                                                </Link>
                                            </div>
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Case Timeline</h3>
                            {((caseData.milestones?.length > 0) || (caseData.notices?.length > 0) || (caseData.meetings?.length > 0) || (caseData.documents?.length > 0) || (caseData.recordings?.length > 0)) ? (
                                <div className="p-2">
                                    <div className="relative border-l-2 border-primary/20 ml-4 space-y-8 pb-4">
                                        {[
                                            // Combine all activities into timeline items
                                            ...(caseData.milestones || []).map(m => ({ ...m, itemType: 'milestone', icon: '📍', color: 'primary' })),
                                            ...(caseData.notices || []).map(n => ({ ...n, itemType: 'notice', milestone_type: `Notice #${n.notice_no}`, actual_date: n.created_at, updated_at: n.created_at, created_by_username: n.created_by, icon: '📄', color: 'blue' })),
                                            ...(caseData.meetings || []).map(m => ({ ...m, itemType: 'meeting', milestone_type: `Meeting Scheduled`, actual_date: m.scheduled_at, updated_at: m.created_at || m.scheduled_at, created_by_username: m.created_by, icon: '📹', color: 'purple' })),
                                            ...(caseData.documents || []).map(d => ({ ...d, itemType: 'document', milestone_type: `Document: ${d.file_name || d.category || 'Uploaded'}`, actual_date: d.uploaded_at || d.created_at, updated_at: d.uploaded_at || d.created_at, created_by_username: d.uploaded_by || d.created_by, icon: '📎', color: 'green' })),
                                            ...(caseData.recordings || []).map(r => ({ ...r, itemType: 'recording', milestone_type: `Recording: ${r.title || 'Audio Recording'}`, actual_date: r.recorded_at || r.created_at, updated_at: r.recorded_at || r.created_at, created_by_username: r.recorded_by || r.created_by, icon: '🎙️', color: 'orange' }))
                                        ]
                                            .sort((a, b) => {
                                                const dateA = a.updated_at ? new Date(a.updated_at) :
                                                    (a.actual_date ? new Date(a.actual_date) : new Date(8640000000000000));
                                                const dateB = b.updated_at ? new Date(b.updated_at) :
                                                    (b.actual_date ? new Date(b.actual_date) : new Date(8640000000000000));
                                                return dateB - dateA; // Newest first
                                            })
                                            .map((item, idx) => {
                                                const itemType = item.itemType;
                                                const isNotice = itemType === 'notice';
                                                const isMeeting = itemType === 'meeting';
                                                const isDocument = itemType === 'document';
                                                const isRecording = itemType === 'recording';
                                                const isMilestone = itemType === 'milestone';
                                                return (
                                                <div key={item.id} className="relative pl-8">
                                                    <div className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-[#1f2937] border-2 shadow-sm ${
                                                        isNotice ? 'border-blue-500' : 
                                                        isMeeting ? 'border-purple-500' : 
                                                        isDocument ? 'border-green-500' : 
                                                        isRecording ? 'border-orange-500' : 'border-primary'
                                                    }`} />
                                                    <div className={`bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border hover:shadow-md transition-shadow ${
                                                        isNotice ? 'border-blue-200 dark:border-blue-800' : 
                                                        isMeeting ? 'border-purple-200 dark:border-purple-800' : 
                                                        isDocument ? 'border-green-200 dark:border-green-800' : 
                                                        isRecording ? 'border-orange-200 dark:border-orange-800' : 'border-gray-100 dark:border-white/5'
                                                    }`}>
                                                        <div className="flex justify-between items-start gap-4">
                                                            {/* Left Side - Item Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h4 className="font-bold text-gray-900 dark:text-white text-sm">
                                                                        {item.icon} {item.milestone_type.replace(/_/g, ' ')}
                                                                    </h4>
                                                                    {isNotice ? (
                                                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">NOTICE</span>
                                                                    ) : isMeeting ? (
                                                                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">MEETING</span>
                                                                    ) : isDocument ? (
                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">DOCUMENT</span>
                                                                    ) : isRecording ? (
                                                                        <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-[10px] font-bold rounded-full">RECORDING</span>
                                                                    ) : item.actual_date ? (
                                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">COMPLETED</span>
                                                                    ) : (
                                                                        <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full">PENDING</span>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Date Info */}
                                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                                    {item.updated_at && (
                                                                        <div className="flex items-center gap-1.5">
                                                                            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                                                                <FiCalendar className="w-3 h-3" />
                                                                            </div>
                                                                            <span>{new Date(item.updated_at).toLocaleDateString()}</span>
                                                                            <span className="text-gray-400">|</span>
                                                                            <span>{new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                
                                                                {/* Created by & Updated by Badges */}
                                                                {(() => {
                                                                    const creator = getUserDisplayName(item.created_by, item.created_by_username, item.created_by_role);
                                                                    const updater = getUserDisplayName(item.updated_by, item.updated_by_username, item.updated_by_role);
                                                                    
                                                                    return (
                                                                    <div className="mt-2 flex flex-wrap items-center gap-2">
                                                                        {/* Created by */}
                                                                        {(item.created_by || item.created_by_username) && (
                                                                            <div className="flex items-center gap-1.5 text-[10px] bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg">
                                                                                <span className="font-medium">Created by:</span>
                                                                                <span className="font-semibold">{creator.name}</span>
                                                                                <span className="text-blue-500 dark:text-blue-400">({creator.role})</span>
                                                                            </div>
                                                                        )}
                                                                        
                                                                        {/* Updated by - only show if different from creator */}
                                                                        {(item.updated_by || item.updated_by_username) && updater.name !== creator.name && (
                                                                            <div className="flex items-center gap-1.5 text-[10px] bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-1 rounded-lg">
                                                                                <span className="font-medium">Updated by:</span>
                                                                                <span className="font-semibold">{updater.name}</span>
                                                                                <span className="text-orange-500 dark:text-orange-400">({updater.role})</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                            
                                                            {/* Right Side - User Badge */}
                                                            {(item.actual_date || isNotice || isMeeting || isDocument || isRecording) && (
                                                                <div className="flex flex-col items-end gap-1.5 shrink-0">
                                                                    {(() => {
                                                                        const displayUser = getUserDisplayName(
                                                                            item.updated_by || item.created_by,
                                                                            item.updated_by_username || item.created_by_username,
                                                                            item.updated_by_role || item.created_by_role
                                                                        );
                                                                        return (
                                                                        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                                                                            isNotice ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' : 
                                                                            isMeeting ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800' : 
                                                                            isDocument ? 'bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800' : 
                                                                            isRecording ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800' : 
                                                                            'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5'
                                                                        }`}>
                                                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                                                                isNotice ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white' : 
                                                                                isMeeting ? 'bg-gradient-to-br from-purple-400 to-purple-600 text-white' : 
                                                                                isDocument ? 'bg-gradient-to-br from-green-400 to-green-600 text-white' : 
                                                                                isRecording ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' : 
                                                                                'bg-gradient-to-br from-primary/20 to-primary/40 text-primary'
                                                                            }`}>
                                                                                {displayUser.name.charAt(0).toUpperCase()}
                                                                            </div>
                                                                            <div className="text-right">
                                                                                <div className="font-semibold text-gray-900 dark:text-white text-xs">
                                                                                    {displayUser.name}
                                                                                </div>
                                                                                <div className="text-[10px] text-gray-500 capitalize">
                                                                                    {displayUser.role}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}
                                                        </div>
                                                        
                                                        {item.notes && (
                                                            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-white/5">
                                                                <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                                                    "{item.notes}"
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                            })}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 dark:bg-white/5 rounded-2xl border border-dashed border-gray-200 dark:border-white/10">
                                    <FiClock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                    <p className="text-gray-500 font-medium">No timeline items recorded for this case yet.</p>
                                    <p className="text-xs text-gray-400 mt-1">Milestones and notices will appear here as the case progresses.</p>
                                </div>
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
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule a Meeting</h3>
                                    {isAdminOrSuperAdmin && (
                                        <span className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-lg">
                                            <FiShield className="w-3 h-3" /> Admin View - All Meetings
                                        </span>
                                    )}
                                </div>
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

                            {/* Filter meetings based on user role - Admin/Superadmin see all, others see only their meetings */}
                            {(() => {
                                const filteredMeetings = isAdminOrSuperAdmin 
                                    ? caseData.meetings 
                                    : caseData.meetings?.filter(m => 
                                        m.created_by === userData?.id || 
                                        m.participants?.includes(userData?.id) ||
                                        m.invited_users?.includes(userData?.id)
                                    );
                                
                                return filteredMeetings && filteredMeetings.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {filteredMeetings.map(meeting => (
                                        <div key={meeting.id} className="bg-white dark:bg-[#1f2937] p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 flex flex-col justify-between hover:border-primary/20 transition-colors">
                                            <div>
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                        <FiUsers className="text-primary" /> Meeting
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                                                        meeting.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                        meeting.status === 'sent' ? 'bg-blue-100 text-blue-700' :
                                                        meeting.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                        {meeting.status || 'DRAFT'}
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
                                                {meeting.status === 'draft' && (
                                                    <button
                                                        onClick={() => {
                                                            setSendModalType('meeting');
                                                            setSendModalItem(meeting);
                                                            setSendModalOpen(true);
                                                        }}
                                                        className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 font-medium w-full"
                                                    >
                                                        Send Now
                                                    </button>
                                                )}
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
                                        <p>{isAdminOrSuperAdmin ? 'No meetings scheduled yet.' : 'No meetings available for you.'}</p>
                                        {!isAdminOrSuperAdmin && (
                                            <p className="text-xs text-gray-400 mt-2">Only meetings you created or were invited to will appear here.</p>
                                        )}
                                    </div>
                                );
                            })()}
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

                            {caseData.documents && caseData.documents.filter(d => d.category !== 'NOTICE').length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {caseData.documents.filter(d => d.category !== 'NOTICE').map(doc => (
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
            {/* Notice Creation Modal */}
            <AddNoticeModal
                isOpen={isNoticeModalOpen}
                onClose={() => {
                    setIsNoticeModalOpen(false);
                    // Refresh case data when modal closes to show new notice and meeting
                    dispatch(fetchCaseDetail(caseId));
                }}
                caseId={caseId}
                nextNoticeNo={(caseData.notices?.length || 0) + 1}
            />

            {/* Send Confirmation Modal */}
            {sendModalOpen && sendModalItem && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-[#1f2937] rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Confirm {sendModalType === 'notice' ? 'Notice' : 'Meeting'} Sending
                            </h3>
                            <button
                                onClick={() => {
                                    setSendModalOpen(false);
                                    setSendModalItem(null);
                                    setSendModalType(null);
                                }}
                                className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <FiX className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-6">
                            {sendError && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                    <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                                        <FiAlertCircle className="w-4 h-4" />
                                        <strong>Error:</strong> {sendError}
                                    </p>
                                </div>
                            )}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                    <FiSend className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                        {sendModalType === 'notice' 
                                            ? `Send Notice #${sendModalItem.notice_no || sendModalItem.id?.slice(0, 8)}?`
                                            : `Send Meeting "${sendModalItem.title || 'Meeting'}"?`
                                        }
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-2">
                                        This will change the status from <strong>DRAFT</strong> to <strong>SENT</strong> and trigger delivery via the selected channels.
                                    </p>
                                    
                                    {/* Details */}
                                    <div className="mt-4 p-3 bg-gray-50 dark:bg-white/5 rounded-lg text-sm">
                                        {sendModalType === 'notice' ? (
                                            <>
                                                <p><strong>Type:</strong> {sendModalItem.notice_type || 'Notice'}</p>
                                                <p><strong>Case:</strong> {caseData.case_code}</p>
                                                {sendModalItem.content?.scheduled_date && (
                                                    <p><strong>Scheduled:</strong> {new Date(sendModalItem.content.scheduled_date).toLocaleString()}</p>
                                                )}
                                            </>
                                        ) : (
                                            <>
                                                <p><strong>Date:</strong> {new Date(sendModalItem.scheduled_at).toLocaleString()}</p>
                                                <p><strong>Case:</strong> {caseData.case_code}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setSendModalOpen(false);
                                    setSendModalItem(null);
                                    setSendModalType(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    setIsSending(true);
                                    setSendError(null);
                                    try {
                                        const endpoint = sendModalType === 'notice' 
                                            ? `/notices/${sendModalItem.id}/send`
                                            : `/meetings/${sendModalItem.id}/send`;
                                        
                                        const { error } = await handleRequest(() => 
                                            api.post(endpoint)
                                        );
                                        
                                        if (error) {
                                            // Update notice status to error in Redux
                                            if (sendModalType === 'notice') {
                                                dispatch(updateNoticeStatusLocal({ 
                                                    noticeId: sendModalItem.id, 
                                                    status: 'error',
                                                    error_message: error
                                                }));
                                            }
                                            setSendError(error);
                                            toast.error(error);
                                        } else {
                                            toast.success(`${sendModalType === 'notice' ? 'Notice' : 'Meeting'} sent successfully!`);
                                            dispatch(fetchCaseDetail(caseId));
                                            setSendModalOpen(false);
                                            setSendModalItem(null);
                                            setSendModalType(null);
                                            setSendError(null);
                                        }
                                    } catch (err) {
                                        const errorMsg = `Failed to send ${sendModalType}`;
                                        if (sendModalType === 'notice') {
                                            dispatch(updateNoticeStatusLocal({ 
                                                noticeId: sendModalItem.id, 
                                                status: 'error',
                                                error_message: errorMsg
                                            }));
                                        }
                                        setSendError(errorMsg);
                                        toast.error(errorMsg);
                                    } finally {
                                        setIsSending(false);
                                    }
                                }}
                                disabled={isSending}
                                className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <FiSend className="w-4 h-4" />
                                        Confirm & Send
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
