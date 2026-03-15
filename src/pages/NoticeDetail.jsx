import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiSend,
  FiFileText,
  FiLink,
  FiVideo,
  FiLoader,
} from "react-icons/fi";
import { useApi } from "../hooks/useApi";
import toast from "react-hot-toast";

const NoticeDetail = () => {
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resending, setResending] = useState(false);
  const { handleRequest, getNotice, resendNotice } = useApi();

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true);
      const { data, error } = await handleRequest(() => getNotice(id));
      if (error) {
        toast.error("Failed to load notice details");
      } else if (data) {
        setNotice(data);
      }
      setLoading(false);
    };
    fetchNotice();
  }, [id]);

  const previewFile = async (documentId) => {
    const token = localStorage.getItem("token");

    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}documents/${documentId}/download`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Preview failed");
      return;
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    console.log("Preview URL:", url);
    window.open(url, "_blank");
  };

  const handleResend = async (channel) => {
    setResending(true);
    const { error } = await handleRequest(() => resendNotice(id, channel));
    setResending(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success("Notice resent successfully!");
      // Optionally reload notice to see new deliveries
      const { data } = await handleRequest(() => getNotice(id));
      if (data) setNotice(data);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent":
        return <FiSend className="w-5 h-5 text-blue-500" />;
      case "draft":
        return <FiClock className="w-5 h-5 text-yellow-500" />;
      case "delivered":
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "sent":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      case "draft":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "delivered":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "failed":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatNoticeDisplay = (noticeNo) => {
    return `N-${noticeNo || "X"}`;
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <FiLoader className="w-8 h-8 animate-spin text-primary" />
        <p className="text-gray-500 dark:text-gray-400 font-medium">
          Loading notice details...
        </p>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <FiAlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
          Notice Not Found
        </h2>
        <Link
          to="/notices"
          className="text-primary hover:underline font-medium"
        >
          &larr; Back to Notices
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12">
      {/* Header / Navigation */}
      <div className="flex items-center gap-4">
        <Link
          to="/notices"
          className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors text-gray-500"
        >
          <FiArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            {formatNoticeDisplay(notice.notice_no)}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-semibold rounded-full ${getStatusClass(
                notice.status
              )}`}
            >
              {getStatusIcon(notice.status)}
              <span className="capitalize">{notice.status}</span>
            </span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            System ID: {notice.id}
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={() => handleResend()}
            disabled={resending}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 disabled:opacity-50 transition-all font-inter"
          >
            <FiSend className={resending ? "animate-pulse" : ""} />
            {resending ? "Resending..." : "Resend All"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Notice Context Alert */}
          <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiFileText className="text-primary" /> Notice Details
            </h2>

            <div className="grid grid-cols-2 gap-y-4 gap-x-8">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Generated On
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(notice.created_at).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Notice Number
                </p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formatNoticeDisplay(notice.notice_no)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Case Link
                </p>
                {notice.case_code ? (
                  <Link
                    to={`/cases/${notice.case_id}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {notice.case_code} <FiLink className="w-3 h-3" />
                  </Link>
                ) : (
                  <Link
                    to={`/cases/${notice.case_id}`}
                    className="font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    View Case <FiLink className="w-3 h-3" />
                  </Link>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  Created By
                </p>
                <p className="font-medium text-gray-900 dark:text-white opacity-50">
                  System Admin
                </p>
              </div>
            </div>
          </div>

          {/* Content Preview */}
          <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FiFileText className="text-primary" /> Generated Content Payload
            </h2>

            <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-xl border border-gray-100 dark:border-white/5 font-mono text-xs overflow-x-auto">
              <pre className="text-gray-700 dark:text-gray-300">
                {JSON.stringify(notice.content, null, 2)}
              </pre>
            </div>
          </div>

          {/* Attachments Section */}
          {notice.attachments && notice.attachments.length > 0 && (
            <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <FiFileText className="text-primary" /> Attachments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {notice.attachments.map((atch) => (
                  <div
                    key={atch.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-100 dark:border-white/10 group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <FiFileText />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                          {atch.document.file_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(atch.document.size_bytes / 1024).toFixed(1)} KB •{" "}
                          {atch.document.category}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => previewFile(atch.document_id)}
                      className="p-2 hover:bg-primary/10 text-primary rounded-lg transition-colors"
                    >
                      <FiLink />
                      this
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Active Links Card */}
          {notice.content &&
            (notice.content.portal_link || notice.content.meeting_url) && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiLink className="text-primary" /> Generated Links
                </h2>

                <div className="space-y-4">
                  {notice.content.portal_link && (
                    <div className="bg-white dark:bg-[#1f2937] p-3 rounded-xl border border-primary/10 group relative">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Victim Portal URL
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                          {notice.content.portal_link}
                        </div>
                        <a
                          href={notice.content.portal_link}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 w-8 h-8 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <FiLink className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}

                  {notice.content.meeting_url && (
                    <div className="bg-white dark:bg-[#1f2937] p-3 rounded-xl border border-primary/10 group relative">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
                        Scheduled Hearing URL
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="truncate text-sm font-medium text-gray-700 dark:text-gray-300 flex-1">
                          {notice.content.meeting_url}
                        </div>
                        <a
                          href={notice.content.meeting_url}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 w-8 h-8 bg-blue-100 text-blue-600 hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-center transition-colors"
                        >
                          <FiVideo className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

          {/* Delivery Status Card */}
          <div className="bg-white dark:bg-[#1f2937] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiSend className="text-primary" /> Delivery Status
              </h2>
            </div>

            <div className="space-y-4">
              {notice.deliveries && notice.deliveries.length > 0 ? (
                notice.deliveries.map((delivery) => (
                  <div
                    key={delivery.id}
                    className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                        {delivery.channel}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${getStatusClass(
                          delivery.status
                        )}`}
                      >
                        {delivery.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 truncate">
                      {delivery.to_address}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
                      <span className="text-[10px] text-gray-400">
                        {delivery.sent_at
                          ? new Date(delivery.sent_at).toLocaleString()
                          : "Pending"}
                      </span>
                      <button
                        onClick={() => handleResend(delivery.channel)}
                        disabled={resending}
                        className="text-[10px] font-bold text-primary hover:underline uppercase disabled:opacity-50"
                      >
                        Retry Channel
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4 italic">
                  No delivery attempts recorded.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetail;