import React, { useState } from 'react';
import { 
  MessageSquare, Send, Plus, MessageCircle, X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MarketingCampaign } from '../types';

export const MarketingPage: React.FC = () => {
  const { campaigns, addCampaign, customers } = useApp();

  const [showNewCampaign, setShowNewCampaign] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('balance');
  const [targetAudience, setTargetAudience] = useState('All Mechanics & Workshop Owners');
  const [campaignTitle, setCampaignTitle] = useState('');
  const [messageBody, setMessageBody] = useState('');
  const [testPhone, setTestPhone] = useState('+923001234567');
  const [copied, setCopied] = useState(false);

  // Shared dark theme class string
  const inputCls = 'w-full p-2 border rounded-xl bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-hidden focus:ring-1 focus:ring-brand-500';

  // Pre-built Urdu/English Marketing Templates
  const templates = [
    {
      id: 'balance',
      name: 'Ledger Payment Reminder (اردو)',
      content: 'محترم {customer_name} صاحب!\nسائبر اورین موٹرسائیکل آٹو پارٹس کی طرف سے آپ کے کھاتے کا بقایا بیلنس Rs. {due_amount} ہے۔ برائے مہربانی اس ہفتے اپنا کھاتہ کلیئر کروائیں۔ شکریہ!\nرابطہ: 0300-1234567'
    },
    {
      id: 'tuning_oil',
      name: 'Winter Oil & Tuning Special Offer',
      content: 'Special Discount Offer for {customer_name}!\nGet 15% OFF on Caltex Havoline & Shell Engine Oils + Free Brake Shoe inspection at Cyberorion Motors this week! Visit us today.'
    },
    {
      id: 'spares_arrival',
      name: 'New Genuine Spare Parts Stock Arrival',
      content: 'معزز گاہک! سائبر اورین پر اٹلس ہونڈا اور یاماہا کے نئے اوریجنل اسپیئر پارٹس (کلچ پلیٹ، سلنڈر کٹ، چین گراری) کی تازہ کھیپ پہنچ چکی ہے۔ مناسب ہول سیل ریٹس پر دستیاب ہے۔'
    }
  ];

  const handleApplyTemplate = (tempId: string) => {
    const t = templates.find(x => x.id === tempId);
    if (t) {
      setSelectedTemplate(tempId);
      setMessageBody(t.content);
      setCampaignTitle(t.name);
    }
  };

  const handleLaunchCampaign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle.trim() || !messageBody.trim()) {
      alert('Please provide campaign title and message content.');
      return;
    }

    addCampaign({
      title: campaignTitle,
      type: 'whatsapp',
      targetGroup: targetAudience,
      messageContent: messageBody,
      scheduledDate: new Date().toISOString().split('T')[0],
      status: 'active',
      recipientCount: customers.length
    });

    setShowNewCampaign(false);
    alert(`Campaign "${campaignTitle}" broadcast simulated! ${customers.length} messages scheduled via WhatsApp API gateway.`);
  };

  const openWhatsAppTest = () => {
    const sampleMsg = messageBody
      .replace('{customer_name}', 'استاد اکرم')
      .replace('{due_amount}', '14,200');
    window.open(`https://wa.me/${testPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(sampleMsg)}`, '_blank');
  };

  return (
    <div
      className="min-h-full bg-slate-950 text-slate-100 p-4 md:p-6 space-y-6 overflow-y-auto"
      style={{ colorScheme: 'dark' }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              WhatsApp & SMS Marketing Engine
            </h1>
            <p className="text-xs text-slate-400">
              Automated balance collection notices, seasonal promotions, and personalized customer broadcast campaigns.
            </p>
          </div>

          <button
            onClick={() => {
              handleApplyTemplate('balance');
              setShowNewCampaign(true);
            }}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-brand-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Broadcast Campaign</span>
          </button>
        </div>

        {/* Templates Quick Selector */}
        <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xs space-y-3">
          <h3 className="font-bold text-white text-sm">
            Pre-Built Motorcycle Shop Communication Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {templates.map(temp => (
              <div
                key={temp.id}
                onClick={() => {
                  handleApplyTemplate(temp.id);
                  setShowNewCampaign(true);
                }}
                className="p-3.5 rounded-xl border border-slate-800 hover:border-brand-500 bg-slate-800/40 hover:bg-slate-800/70 cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <span className="font-bold text-xs text-white flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    {temp.name}
                  </span>
                  <p className="text-[11px] text-slate-400 line-clamp-3 mt-1.5 leading-relaxed font-sans">
                    {temp.content}
                  </p>
                </div>
                <span className="text-[10px] text-brand-500 font-semibold mt-2 block">
                  Use Template →
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Broadcast Campaigns */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-800 font-bold text-xs uppercase text-slate-400">
            Campaign History & Delivery Logs
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3">Campaign Title</th>
                  <th className="p-3">Channel</th>
                  <th className="p-3">Target Audience</th>
                  <th className="p-3">Recipients</th>
                  <th className="p-3">Scheduled Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {campaigns.map(camp => (
                  <tr key={camp.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3">
                      <div className="font-bold text-white">{camp.title}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-sm">{camp.messageContent}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded font-bold uppercase text-[10px] bg-green-950 text-green-300">
                        WhatsApp
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{camp.targetGroup}</td>
                    <td className="p-3 font-mono font-bold text-slate-100">{camp.recipientCount} Customers</td>
                    <td className="p-3 text-slate-400 font-mono">{camp.scheduledDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-950 text-emerald-400">
                        Sent
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* CREATE CAMPAIGN MODAL */}
      {showNewCampaign && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4" style={{ colorScheme: 'dark' }}>
          <div className="bg-slate-900 text-slate-100 rounded-2xl shadow-2xl max-w-lg w-full border border-slate-800 p-5 space-y-4 text-xs max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-sm">Create WhatsApp Broadcast Campaign</h3>
              <button onClick={() => setShowNewCampaign(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLaunchCampaign} className="space-y-3">
              <div>
                <label className="font-semibold block mb-1 text-slate-300">Campaign Title:</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={e => setCampaignTitle(e.target.value)}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Target Customer Segment:</label>
                <select
                  value={targetAudience}
                  onChange={e => setTargetAudience(e.target.value)}
                  className={inputCls}
                >
                  <option value="All Mechanics & Workshop Owners">Workshop Mechanics with Balance &gt; 0</option>
                  <option value="All Regular Walk-in Customers">All Regular Customers (Oil change offer)</option>
                  <option value="Wholesale Dealers">Wholesale Spare Part Buyers</option>
                  <option value="VIP Customers">VIP Gold Tier Customers</option>
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-slate-300">Message Body (Supports Urdu & Placeholders):</label>
                <textarea
                  rows={4}
                  required
                  value={messageBody}
                  onChange={e => setMessageBody(e.target.value)}
                  className={`${inputCls} p-2.5 font-sans leading-relaxed`}
                />
                <span className="text-[10px] text-slate-400 block mt-1">
                  Placeholders: <code className="px-1 py-0.5 rounded bg-slate-800 text-brand-500">{'{customer_name}'}</code>, <code className="px-1 py-0.5 rounded bg-slate-800 text-brand-500">{'{due_amount}'}</code>
                </span>
              </div>

              {/* Direct WhatsApp Test Phone */}
              <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700 space-y-1.5">
                <span className="font-bold text-[10px] text-slate-400 uppercase block">Instant WhatsApp Preview:</span>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={testPhone}
                    onChange={e => setTestPhone(e.target.value)}
                    placeholder="+923001234567"
                    className="flex-1 p-1.5 border border-slate-700 rounded-lg bg-slate-900 text-slate-100 placeholder-slate-500 font-mono text-xs focus:outline-hidden focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={openWhatsAppTest}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg font-bold flex items-center gap-1 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCampaign(false)}
                  className="px-4 py-2 rounded-xl text-slate-300 hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold transition shadow-md shadow-brand-500/25"
                >
                  Dispatch Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};