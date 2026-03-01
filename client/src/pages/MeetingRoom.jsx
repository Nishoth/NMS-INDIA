import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiPhoneOff, FiVideo, FiShield, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const MeetingRoom = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const { handleRequest, uploadRecording } = useApi();
    const jitsiContainerRef = useRef(null);

    const [isRecording, setIsRecording] = useState(false);
    const [uploading, setUploading] = useState(false);

    // Media recorder refs
    const mediaRecorderRef = useRef(null);
    const recordedChunksRef = useRef([]);

    // We'll mock a caseId for the upload hook. In production, meetingId would map to caseId.
    const mockCaseId = "case-12345";
    const watermarkText = "admin@jls.in - SECURE ARBITRATION VIEW";

    useEffect(() => {
        // Anti-Screenshot / PrintScreen Block
        const handleKeyDown = (e) => {
            if (e.key === "PrintScreen" || e.keyCode === 44) {
                toast.error("Screen capturing is strictly prohibited in this application.");
                navigator.clipboard.writeText(""); // Clear clipboard
            }
        };

        const handleContextMenu = (e) => {
            e.preventDefault();
        };

        window.addEventListener("keyup", handleKeyDown);
        window.addEventListener("contextmenu", handleContextMenu);

        return () => {
            window.removeEventListener("keyup", handleKeyDown);
            window.removeEventListener("contextmenu", handleContextMenu);
        };
    }, []);

    useEffect(() => {
        const loadJitsiScript = () => {
            return new Promise((resolve) => {
                if (window.JitsiMeetExternalAPI) {
                    resolve(window.JitsiMeetExternalAPI);
                    return;
                }
                const script = document.createElement("script");
                script.src = "https://meet.jit.si/external_api.js";
                script.async = true;
                script.onload = () => resolve(window.JitsiMeetExternalAPI);
                document.body.appendChild(script);
            });
        };

        let api = null;

        const initMeeting = async () => {
            const JitsiMeetExternalAPI = await loadJitsiScript();
            if (!JitsiMeetExternalAPI) {
                toast.error("WebRTC Engine failed to load. Check network constraints.");
                return;
            }

            const domain = "meet.jit.si";
            const options = {
                roomName: `JLS_Arbitration_${meetingId}`,
                parentNode: jitsiContainerRef.current,
                configOverwrite: { startWithAudioMuted: false, startWithVideoMuted: false },
                interfaceConfigOverwrite: {
                    TOOLBAR_BUTTONS: [
                        'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                        'fodeviceselection', 'hangup', 'profile', 'chat', 'settings', 'videoquality'
                    ],
                },
                userInfo: {
                    displayName: "JLS Officer"
                }
            };

            api = new JitsiMeetExternalAPI(domain, options);
        };

        initMeeting();

        return () => {
            if (api) api.dispose();
        };
    }, [meetingId]);

    const handleEndCall = () => {
        if (window.confirm("End the meeting for all participants?")) {
            if (isRecording) stopRecording();
            navigate("/dashboard");
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: { mediaSource: "screen" },
                audio: true
            });

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = async () => {
                const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                recordedChunksRef.current = []; // Reset chunks

                // Stop all tracks to remove the "sharing screen" banner
                stream.getTracks().forEach(track => track.stop());

                await handleUploadBlob(blob);
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            toast.success("Secure application recording started.");

            // If user stops sharing from the browser's native banner
            stream.getVideoTracks()[0].onended = () => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                    mediaRecorderRef.current.stop();
                    setIsRecording(false);
                }
            };

        } catch (err) {
            console.error("Recording init error:", err);
            toast.error("Failed to start recording. Permission denied.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            toast("Finalizing and uploading recording...");
        }
    };

    const handleUploadBlob = async (blob) => {
        setUploading(true);
        const file = new File([blob], `Meeting_${meetingId}_${Date.now()}.webm`, { type: 'video/webm' });

        const formData = new FormData();
        formData.append("file", file);
        formData.append("meeting_id", meetingId);

        const targetCaseId = window.prompt("Recording Saved! Enter tracking Case ID to bind this recording to:", mockCaseId);

        if (targetCaseId) {
            const { error } = await handleRequest(() => uploadRecording(targetCaseId, formData));
            if (error) {
                toast.error("Failed to upload recording: " + error);
            } else {
                toast.success("Recording securely uploaded to JLS Servers.");
            }
        }
        setUploading(false);
    };

    return (
        <div className="h-screen bg-[#1a1a1a] flex flex-col font-sans overflow-hidden relative select-none">

            {/* SECURITY WATERMARK OVERLAY */}
            <div className="fixed inset-0 pointer-events-none z-[9999] opacity-10 overflow-hidden flex flex-wrap content-center justify-center gap-20">
                {Array(20).fill(watermarkText).map((text, i) => (
                    <div key={i} className="text-white text-3xl font-bold uppercase transform -rotate-45 whitespace-nowrap">
                        {text}
                    </div>
                ))}
            </div>

            {/* Header */}
            <header className="h-16 px-6 flex items-center justify-between bg-[#242424] border-b border-white/10 z-10 relative">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                        <FiShield className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-white font-medium flex items-center gap-2">
                            Secure JLS Room
                            <span className="bg-green-500/20 text-green-500 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider border border-green-500/20 flex items-center gap-1">
                                <FiCheckCircle /> Encrypted
                            </span>
                        </h1>
                        <p className="text-xs text-gray-400 font-mono">ID: {meetingId}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 text-white">
                    {/* Recording Action */}
                    <div className="relative border-l border-white/10 pl-4">
                        {uploading ? (
                            <span className="h-9 px-4 bg-gray-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium opacity-50 cursor-not-allowed">
                                Uploading Stream...
                            </span>
                        ) : isRecording ? (
                            <button
                                onClick={stopRecording}
                                className="h-9 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-red-600/20 animate-pulse"
                            >
                                <span className="w-2 h-2 rounded-full bg-white"></span> Stop Recording
                            </button>
                        ) : (
                            <button
                                onClick={startRecording}
                                className="h-9 px-4 bg-[#3a3a3a] hover:bg-[#4a4a4a] text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                            >
                                <FiVideo /> Start Application Record
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Warning Banner */}
            <div className="bg-orange-500/10 border-b border-orange-500/20 px-6 py-2 flex items-center justify-center gap-2 text-xs text-orange-400 z-10 relative font-medium uppercase tracking-wider">
                <FiAlertTriangle />
                Do not attempt external screen capture. All streams are encrypted and tagged with digital watermarks.
            </div>

            {/* JITSI WEBRTC CONTAINER */}
            <main className="flex-1 relative z-10 bg-[#111]">
                <div ref={jitsiContainerRef} className="absolute inset-0 w-full h-full" />
            </main>

            {/* Controls Bar */}
            <div className="h-20 bg-[#242424] border-t border-white/10 flex items-center justify-center gap-4 px-6 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] relative">
                <button
                    onClick={handleEndCall}
                    className="h-12 px-6 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium flex items-center gap-2 transition-all shadow-lg shadow-red-600/20"
                >
                    <FiPhoneOff className="w-5 h-5" />
                    Exit Secure Room
                </button>
            </div>
        </div>
    );
};

export default MeetingRoom;
