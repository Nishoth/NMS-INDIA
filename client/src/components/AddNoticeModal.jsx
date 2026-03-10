import React, { useState, useRef } from 'react';
import {
    FiFileText, FiCamera, FiUploadCloud, FiX, FiCheck,
    FiMessageSquare, FiVideo, FiExternalLink, FiMail
} from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { createDynamicNotice } from '../store/slices/caseSlice';
import { useApi } from '../hooks/useApi';
import toast from 'react-hot-toast';

const AddNoticeModal = ({ isOpen, onClose, caseId, nextNoticeNo }) => {
    const dispatch = useDispatch();
    const { uploadDocument } = useApi();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [files, setFiles] = useState([]);
    const [formData, setFormData] = useState({
        notice_type: `Notice #${nextNoticeNo}`,
        channels: ['sms'], // Default
        include_portal: true,
        include_meeting: false,
        custom_message: '',
    });

    const fileInputRef = useRef(null);
    const videoRef = useRef(null);
    const [isCameraActive, setIsCameraActive] = useState(false);

    // Reset state on open
    React.useEffect(() => {
        if (isOpen) {
            setStep(1);
            setFiles([]);
            setFormData({
                notice_type: `Notice #${nextNoticeNo}`,
                channels: ['sms'],
                include_portal: true,
                include_meeting: false,
                custom_message: '',
            });
            setIsCameraActive(false);
        }
    }, [isOpen, nextNoticeNo]);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const newFiles = Array.from(e.target.files);
        setFiles([...files, ...newFiles]);
    };

    const handleRemoveFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (err) {
            toast.error("Could not access camera");
        }
    };

    const takePhoto = () => {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
            const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
            setFiles([...files, file]);
            stopCamera();
        }, 'image/jpeg');
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
            setIsCameraActive(false);
        }
    };

    const toggleChannel = (channel) => {
        setFormData(prev => ({
            ...prev,
            channels: prev.channels.includes(channel)
                ? prev.channels.filter(c => c !== channel)
                : [...prev.channels, channel]
        }));
    };

    const handleSubmit = async () => {
        if (formData.channels.length === 0) {
            return toast.error("Select at least one delivery channel");
        }

        setLoading(true);
        try {
            // 1. Upload all files first
            const attachmentIds = [];
            for (const file of files) {
                const uploadForm = new FormData();
                uploadForm.append('file', file);
                uploadForm.append('category', 'NOTICE');
                const { data, error } = await uploadDocument(caseId, uploadForm);
                if (error) throw new Error(error);
                attachmentIds.push(data.id);
            }

            // 2. Create Notice
            const noticeData = {
                case_id: caseId,
                notice_no: nextNoticeNo,
                notice_type: formData.notice_type,
                delivery_channels: formData.channels,
                include_portal_link: formData.include_portal,
                include_meeting_link: formData.include_meeting,
                content: {
                    custom_message: formData.custom_message
                },
                attachment_ids: attachmentIds
            };

            await dispatch(createDynamicNotice(noticeData)).unwrap();
            toast.success("Notice created and dispatched successfully!");
            onClose();
        } catch (error) {
            toast.error(error.message || "Failed to create notice");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white dark:bg-[#1f2937] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-white/10">
                {/* Modal Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/10 flex items-center justify-between bg-gray-50/50 dark:bg-white/5">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <FiFileText className="text-primary" /> Create Dynamic Notice
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Generating Notice #{nextNoticeNo} for this case.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                        <FiX className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-8">
                        {/* Attachments Section */}
                        <section className="space-y-4">
                            <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                File Attachments (PPT, PDF, Pics)
                            </label>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                >
                                    <FiUploadCloud className="w-8 h-8 text-gray-400 group-hover:text-primary mb-2" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Upload Files</span>
                                </button>

                                <button
                                    onClick={startCamera}
                                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all group"
                                >
                                    <FiCamera className="w-8 h-8 text-gray-400 group-hover:text-primary mb-2" />
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Take Picture</span>
                                </button>
                            </div>

                            <input
                                type="file"
                                multiple
                                hidden
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                            />

                            {/* Camera Interface */}
                            {isCameraActive && (
                                <div className="relative rounded-2xl overflow-hidden mt-4">
                                    <video ref={videoRef} autoPlay className="w-full bg-black aspect-video object-cover" />
                                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
                                        <button onClick={takePhoto} className="px-6 py-2 bg-primary text-white rounded-full font-bold shadow-lg shadow-primary/30">Capture</button>
                                        <button onClick={stopCamera} className="px-6 py-2 bg-red-600 text-white rounded-full font-bold shadow-lg shadow-red-600/30">Cancel</button>
                                    </div>
                                </div>
                            )}

                            {/* File List */}
                            {files.length > 0 && (
                                <div className="space-y-2 mt-4">
                                    {files.map((file, i) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 animate-slide-up">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <FiFileText className="text-primary shrink-0" />
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{file.name}</span>
                                            </div>
                                            <button onClick={() => handleRemoveFile(i)} className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition-colors">
                                                <FiX />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </section>

                        <div className="h-px bg-gray-100 dark:bg-white/10" />

                        {/* Delivery Configuration */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <section className="space-y-4">
                                <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                    Delivery Channels
                                </label>
                                <div className="space-y-3">
                                    <ChannelToggle
                                        icon={<FiMessageSquare />}
                                        label="SMS"
                                        active={formData.channels.includes('sms')}
                                        onClick={() => toggleChannel('sms')}
                                    />
                                    <ChannelToggle
                                        icon={<FiMessageSquare className="text-green-500" />}
                                        label="WhatsApp"
                                        active={formData.channels.includes('whatsapp')}
                                        onClick={() => toggleChannel('whatsapp')}
                                    />
                                    <ChannelToggle
                                        icon={<FiMail className="text-blue-500" />}
                                        label="Email"
                                        active={formData.channels.includes('email')}
                                        onClick={() => toggleChannel('email')}
                                    />
                                </div>
                            </section>

                            <section className="space-y-4">
                                <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                    Notice Content Inclusion
                                </label>
                                <div className="space-y-3">
                                    <ContentToggle
                                        icon={<FiExternalLink />}
                                        label="Temp Victim Portal"
                                        active={formData.include_portal}
                                        onClick={() => setFormData(prev => ({ ...prev, include_portal: !prev.include_portal }))}
                                    />
                                    <ContentToggle
                                        icon={<FiVideo />}
                                        label="Meeting Link"
                                        active={formData.include_meeting}
                                        onClick={() => setFormData(prev => ({ ...prev, include_meeting: !prev.include_meeting }))}
                                    />
                                </div>
                            </section>
                        </div>

                        {/* Custom Message */}
                        <section className="space-y-4">
                            <label className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                                Custom Message
                            </label>
                            <textarea
                                value={formData.custom_message}
                                onChange={(e) => setFormData(prev => ({ ...prev, custom_message: e.target.value }))}
                                placeholder="Add any additional notes for the recipient..."
                                className="w-full h-32 p-4 text-sm bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none dark:text-white"
                            />
                        </section>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="px-8 py-6 bg-gray-50/50 dark:bg-white/5 border-t border-gray-100 dark:border-white/10 flex items-center justify-end gap-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        Discard
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-8 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/25 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center gap-2"
                    >
                        {loading ? "Dispatched..." : "Create & Dispatch Notice"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ChannelToggle = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${active
            ? 'border-primary bg-primary/5 text-primary shadow-sm shadow-primary/10'
            : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400'
            }`}
    >
        <div className="flex items-center gap-3 font-semibold">
            <span className="text-xl">{icon}</span>
            {label}
        </div>
        {active ? <FiCheck className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-white/10" />}
    </button>
);

const ContentToggle = ({ icon, label, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 transition-all font-semibold ${active
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-gray-100 dark:border-white/5 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-400'
            }`}
    >
        <span className="text-xl">{icon}</span>
        {label}
        <div className={`ml-auto w-12 h-6 rounded-full relative transition-colors ${active ? 'bg-primary' : 'bg-gray-200 dark:bg-white/10'}`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
        </div>
    </button>
);

export default AddNoticeModal;
