import React, { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Server,
  Headphones,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';
import { SupportTicket } from '../utils/telephonyEngine';

interface TelephonyAdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLaunchSimulator: () => void;
}

export const TelephonyAdminDrawer: React.FC<TelephonyAdminDrawerProps> = ({
  isOpen,
  onClose,
  onLaunchSimulator,
}) => {
  const [config, setConfig] = useState<any>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [assigningTicketId, setAssigningTicketId] = useState<string | null>(null);
  const [expertName, setExpertName] = useState('Dr. S. Patil (Senior Agronomist, KVK)');

  const fetchConfigAndTickets = async () => {
    try {
      const [confRes, tickRes] = await Promise.all([
        fetch('/api/telephony/config'),
        fetch('/api/telephony/expert-tickets'),
      ]);

      if (confRes.ok) {
        const c = await confRes.json();
        setConfig(c);
      }
      if (tickRes.ok) {
        const t = await tickRes.json();
        if (t.tickets) setTickets(t.tickets);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfigAndTickets();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleUpdateTicket = async (ticketId: string, status: 'assigned' | 'completed') => {
    try {
      const res = await fetch(`/api/telephony/expert-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedExpert: status === 'assigned' ? expertName : undefined,
        }),
      });
      if (res.ok) {
        setAssigningTicketId(null);
        fetchConfigAndTickets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/70 flex justify-end">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl border-l border-stone-200 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-900 to-green-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700/80 flex items-center justify-center text-amber-300">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base">Kisan Telephone Helpline Operations</h2>
              <p className="text-xs text-emerald-200">IVR &amp; Non-Smartphone Services</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active Helpline Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
                Toll-Free Agricultural Inbound Helpline
              </span>
              <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                Active 24x7
              </span>
            </div>
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-stone-900">
                {config?.helplineNumber || '+91 1800 180 1551'}
              </h3>
              <button
                onClick={() => {
                  onClose();
                  onLaunchSimulator();
                }}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-amber-300" />
                <span>Open Phone Simulator</span>
              </button>
            </div>
            <p className="text-xs text-stone-600">
              Allows any farmer with a basic keypad phone to consult Gemini AI in Marathi, check Mandi rates, and register harvests without internet.
            </p>
          </div>

          {/* Webhook Configuration for Real Providers */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                <Server className="w-4 h-4 text-emerald-700" /> Telephony Provider Integration
              </h4>
              <span className="text-[11px] text-amber-800 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                Mode: {config?.provider === 'simulated' ? 'Interactive Demo Simulator' : 'Live Cloud Telephony'}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-500 font-medium block mb-1">
                  Twilio Voice / Exotel Inbound Webhook URL (HTTP POST):
                </span>
                <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <code className="flex-1 text-[11px] text-stone-800 truncate font-mono">
                    {config?.webhookUrls?.inbound || '/api/telephony/inbound'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(config?.webhookUrls?.inbound, 'inbound')}
                    className="p-1 text-stone-500 hover:text-stone-800"
                    title="Copy URL"
                  >
                    {copiedKey === 'inbound' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <span className="text-stone-500 font-medium block mb-1">
                  IVR Keypad Gather / Speech Callback:
                </span>
                <div className="flex items-center gap-2 bg-stone-50 p-2 rounded-xl border border-stone-200">
                  <code className="flex-1 text-[11px] text-stone-800 truncate font-mono">
                    {config?.webhookUrls?.ivrGather || '/api/telephony/ivr'}
                  </code>
                  <button
                    onClick={() => copyToClipboard(config?.webhookUrls?.ivrGather, 'ivr')}
                    className="p-1 text-stone-500 hover:text-stone-800"
                    title="Copy URL"
                  >
                    {copiedKey === 'ivr' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-[11px] text-stone-600 space-y-1">
              <p className="font-bold text-stone-800">Production Setup Guide:</p>
              <p>• Set <code>TWILIO_ACCOUNT_SID</code> and <code>TWILIO_AUTH_TOKEN</code> in your environment.</p>
              <p>• Point your Twilio Phone Number's "A Call Comes In" webhook to the Inbound URL above.</p>
              <p>• When credentials are unset, the applet automatically provides the full keypad phone simulator.</p>
            </div>
          </div>

          {/* KVK Human Expert Support Requests */}
          <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-stone-500 flex items-center gap-1.5">
                  <Headphones className="w-4 h-4 text-emerald-700" /> KVK Expert Callback Requests
                </h4>
                <p className="text-xs text-stone-500">
                  Tickets logged by callers pressing Option 5 during phone call
                </p>
              </div>
              <span className="bg-amber-100 text-amber-800 font-bold text-xs px-2 py-0.5 rounded-full">
                {tickets.filter((t) => t.status === 'pending').length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {tickets.length === 0 ? (
                <p className="text-xs text-stone-400 text-center py-4">No support tickets recorded yet.</p>
              ) : (
                tickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-stone-200 bg-white hover:border-emerald-300 transition-colors text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-stone-900 flex items-center gap-1">
                        <span className="font-mono text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                          {t.id}
                        </span>
                        <span>{t.farmerName}</span>
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${
                          t.status === 'assigned'
                            ? 'bg-teal-100 text-teal-800'
                            : t.status === 'completed'
                            ? 'bg-stone-200 text-stone-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-stone-600">
                      <p>
                        Phone: <a href={`tel:${t.farmerPhone}`} className="text-emerald-700 font-bold underline">{t.farmerPhone}</a> • {t.location}
                      </p>
                      <p className="mt-0.5 italic text-stone-700">"{t.issueSummary}"</p>
                    </div>

                    {t.assignedExpert && (
                      <p className="text-[10px] text-teal-800 bg-teal-50 px-2 py-0.5 rounded font-medium">
                        Assigned: {t.assignedExpert}
                      </p>
                    )}

                    <div className="pt-1.5 border-t border-stone-100 flex items-center justify-between">
                      <span className="text-[10px] text-stone-400">
                        Logged: {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>

                      <div className="flex items-center gap-1.5">
                        {t.status === 'pending' && (
                          <button
                            onClick={() => handleUpdateTicket(t.id, 'assigned')}
                            className="px-2.5 py-1 bg-emerald-700 text-white rounded-lg text-[11px] font-bold"
                          >
                            Assign KVK Officer
                          </button>
                        )}
                        {t.status === 'assigned' && (
                          <button
                            onClick={() => handleUpdateTicket(t.id, 'completed')}
                            className="px-2.5 py-1 bg-stone-700 text-white rounded-lg text-[11px] font-bold"
                          >
                            Mark Resolved
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
