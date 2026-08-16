"use client";

import React from "react";
import { MessageSquare, Phone, Copy, Send, X } from "lucide-react";

export default function SmsNotificationModal({
  isSmsModalOpen,
  smsJobData,
  generateSmsText,
  setIsSmsModalOpen,
}) {
  if (!isSmsModalOpen || !smsJobData) {
    return null;
  }

  const message = generateSmsText(smsJobData);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-300">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-lg">
              Send Customer Notification
            </h3>
          </div>

          <button
            onClick={() => setIsSmsModalOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Target Phone Number
            </label>

            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-sm font-black text-slate-900">
                {smsJobData.phone}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-700 mb-1">
              Message Preview
            </label>

            <textarea
              rows="8"
              readOnly
              value={message}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-800 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => {
                navigator.clipboard.writeText(message);
                alert("Message copied to clipboard!");
              }}
              className="py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow"
            >
              <Copy className="w-4 h-4" /> Copy Text
            </button>

            <a
              href={`https://wa.me/${smsJobData.phone.replace(
                /[^0-9]/g,
                "",
              )}?text=${encodeURIComponent(message)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-lg flex items-center justify-center gap-1.5 shadow text-center"
            >
              <Send className="w-4 h-4" /> Open WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
