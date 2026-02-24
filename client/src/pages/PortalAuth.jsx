import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiShield, FiLock, FiChevronRight } from "react-icons/fi";
import assets from "../assets/assets";

const PortalAuth = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [phoneNumber, setPhoneNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1); // 1 = phone, 2 = otp

    const handleSendOtp = (e) => {
        e.preventDefault();
        if (phoneNumber.length >= 10) {
            setStep(2);
        }
    };

    const handleVerifyOtp = (e) => {
        e.preventDefault();
        if (otp.length === 6) {
            // Dummy success -> redirect to portal case view
            // Store token/session for victim
            localStorage.setItem("victim_token", token);
            navigate("/portal/case");
        }
    };

    return (
        <div className="min-h-screen bg-[#F6F6F6] dark:bg-[#0f141a] flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white dark:bg-[#1f2937] rounded-3xl shadow-xl border border-gray-100 dark:border-white/5 overflow-hidden animate-fade-in">

                <div className="bg-primary/5 p-8 text-center border-b border-primary/10">
                    <img src={assets.logo} alt="JLS Portal" className="h-10 mx-auto mb-4 dark:brightness-0 dark:invert" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Secure Access Portal</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Verify your identity to access your case details and respond to notices.</p>
                </div>

                <div className="p-8">
                    {step === 1 ? (
                        <form onSubmit={handleSendOtp} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Registered Mobile Number</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-gray-200 dark:border-white/10 pr-3">
                                        <span className="text-gray-500 text-sm font-medium">+91</span>
                                    </div>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={phoneNumber}
                                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="9876543210"
                                        className="w-full pl-16 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                                        required
                                    />
                                </div>
                                <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                                    <FiShield className="w-3 h-3" /> Mobile number registered with your financing agreement.
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={phoneNumber.length < 10}
                                className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-primary/30"
                            >
                                Send OTP
                                <FiChevronRight className="w-4 h-4" />
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fade-in">
                            <div className="text-center mb-6">
                                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <FiLock className="w-5 h-5" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-300">Enter the 6-digit OTP sent to <br /><span className="font-bold">+91 {phoneNumber}</span></p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Secure OTP</label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="------"
                                    className="w-full text-center tracking-[1em] font-mono text-xl py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <button
                                    type="submit"
                                    disabled={otp.length !== 6}
                                    className="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/30"
                                >
                                    Verify & Secure Login
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-gray-500 hover:text-primary transition-colors text-center"
                                >
                                    Change mobile number
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-xs text-gray-400">Secured by JLS Arbitration Portal</p>
            </div>
        </div>
    );
};

export default PortalAuth;
