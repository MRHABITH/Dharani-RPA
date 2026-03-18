import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Send, Calendar, Clock } from 'lucide-react';
import { Input, Select, TextArea, Button } from './Common';
import { API_BASE } from '../api';


export default function BotForm({ template = {}, setTasks = () => {}, onCreated = () => {} }) {
  const [form, setForm] = useState({
    name: template.name ? `${template.name} Bot` : '',
    sender: '',
    password: '',
    receiver: '',
    subject: '',
    mode: 'once',
    interval: 30,
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '12:00',
    message: '',
    // 📧 Email Parsing Specifics
    imapServer: template.id === 'email' ? 'imap.gmail.com' : '',
    imapPort: template.id === 'email' ? '993' : '',
    mailbox: template.id === 'email' ? 'INBOX' : '',
    filterQuery: '',
    extractionType: 'all',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const err = {};
    if (!form.name) err.name = 'Bot name is required';
    if (!form.sender) err.sender = 'Sender email is required';
    
    if (template.id === 'email') {
      if (!form.imapServer) err.imapServer = 'IMAP server is required';
      if (!form.imapPort) err.imapPort = 'IMAP port is required';
    } else {
      if (!form.receiver) err.receiver = 'Recipient email is required';
      if (!form.subject) err.subject = 'Subject is required';
      if (!form.message) err.message = 'Message cannot be empty';
    }
    
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/start`, {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          template_id: template.id,
          sender: form.sender,
          password: form.password,
          receiver: form.receiver,
          subject: form.subject,
          message: form.message,
          mode: form.mode,
          interval: parseInt(form.interval) || 120,
          scheduledDate: form.scheduledDate,
          scheduledTime: form.scheduledTime,
          imapServer: form.imapServer,
          imapPort: form.imapPort ? parseInt(form.imapPort) : 993,
          mailbox: form.mailbox,
          extractionType: form.extractionType,
          filterQuery: form.filterQuery
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.detail ? JSON.stringify(err.detail) : `HTTP ${response.status}`);
      }

      // onCreated triggers: parent refetches tasks + navigates to dashboard
      await onCreated();
    } catch (err) {
      console.error('Failed to create bot', err);
      alert(`❌ Failed to create bot:\n${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="max-w-2xl mx-auto pb-8"
    >
      <div className="card-premium p-4 md:p-6 space-y-5 bg-slate-900/40 backdrop-blur-3xl overflow-hidden relative">
        {/* Decorative Background Element */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Bot Name Section */}
        <div className="grid grid-cols-1 gap-4 pt-2">
          <Input 
            label="Bot Identifier Name" 
            placeholder="e.g., Support Ticket Parser" 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            error={errors.name} 
            required
            className="text-base"
          />
        </div>

        {/* Connection & Configuration Section */}
        <div className="border-t border-slate-800/40 pt-6 space-y-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Mail size={16} />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {template.id === 'email' ? 'Connection Settings' : 'Email Configuration'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <Input 
              label={template.id === 'email' ? "Email Address (IMAP)" : "Sender Email"} 
              type="email" 
              placeholder="user@example.com" 
              name="sender" 
              value={form.sender} 
              onChange={handleChange} 
              error={errors.sender} 
              icon={Mail} 
              required 
            />

            <Input 
              label="App Password" 
              type="password" 
              placeholder="••••••••••" 
              name="password" 
              value={form.password} 
              onChange={handleChange} 
              error={errors.password} 
              icon={Lock} 
              required 
            />

            {template.id === 'email' && (
              <>
                <Input 
                  label="IMAP Server" 
                  placeholder="imap.gmail.com" 
                  name="imapServer" 
                  value={form.imapServer} 
                  onChange={handleChange} 
                  error={errors.imapServer} 
                  required 
                />
                <Input 
                  label="IMAP Port" 
                  placeholder="993" 
                  name="imapPort" 
                  value={form.imapPort} 
                  onChange={handleChange} 
                  error={errors.imapPort} 
                  required 
                />
              </>
            )}
          </div>
        </div>

        {/* Logic & Filters Section */}
        <div className="border-t border-slate-800/40 pt-6 space-y-5">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Send size={18} />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {template.id === 'email' ? 'Parsing Filters' : 'Automation Settings'}
            </h3>
          </div>

          {template.id === 'email' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 animate-in fade-in duration-700">
              <Input 
                label="Mailbox to Watch" 
                placeholder="INBOX" 
                name="mailbox" 
                value={form.mailbox} 
                onChange={handleChange} 
              />
              <Select 
                label="Extraction Target" 
                name="extractionType" 
                value={form.extractionType} 
                onChange={handleChange} 
                options={[
                  { label: 'All Content', value: 'all' },
                  { label: 'Order Numbers', value: 'orders' },
                  { label: 'Tracking Links', value: 'tracking' },
                  { label: 'Attachments Only', value: 'attachments' }
                ]} 
              />
              <div className="md:col-span-2">
                <Input 
                  label="Search / Filter Query" 
                  placeholder="from:alerts@system.com subject:urgent" 
                  name="filterQuery" 
                  value={form.filterQuery} 
                  onChange={handleChange} 
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2">
                <Input 
                  label="Recipient Email" 
                  type="email" 
                  placeholder="recipient@example.com" 
                  name="receiver" 
                  value={form.receiver} 
                  onChange={handleChange} 
                  error={errors.receiver} 
                  icon={Send} 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <Input 
                  label="Email Subject" 
                  placeholder="Enter email subject" 
                  name="subject" 
                  value={form.subject} 
                  onChange={handleChange} 
                  error={errors.subject} 
                  required 
                />
              </div>
              <div className="md:col-span-2">
                <Select 
                  label="Execution Mode" 
                  name="mode" 
                  value={form.mode} 
                  onChange={handleChange} 
                  options={[
                    { label: 'Send Once', value: 'once' }, 
                    { label: 'Continue Looping', value: 'loop' }, 
                    { label: 'Scheduling', value: 'schedule' }
                  ]} 
                />
              </div>
            </div>
          )}

          {form.mode === 'loop' && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="pt-2">
              <Input 
                label="Interval (seconds)" 
                type="number" 
                name="interval" 
                value={form.interval} 
                onChange={handleChange} 
              />
            </motion.div>
          )}

          {form.mode === 'schedule' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }} 
              className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2"
            >
              <Input 
                label="Scheduled Date" 
                type="date" 
                name="scheduledDate" 
                value={form.scheduledDate} 
                onChange={handleChange} 
                icon={Calendar}
              />
              <Input 
                label="Scheduled Time" 
                type="time" 
                name="scheduledTime" 
                value={form.scheduledTime} 
                onChange={handleChange} 
                icon={Clock}
              />
            </motion.div>
          )}
        </div>

        {/* Message / Details Section */}
        {template.id !== 'email' && (
          <div className="border-t border-slate-800/40 pt-6">
            <TextArea 
              label="Email Body Description" 
              placeholder="Enter your email message body here..." 
              name="message" 
              value={form.message} 
              onChange={handleChange} 
              error={errors.message} 
              required 
            />
          </div>
        )}

        {/* Submit Section */}
        <div className="pt-6 relative z-10 flex justify-center md:justify-end">
          <Button variant="primary" size="lg" onClick={submit} loading={loading} icon={Send} className="w-full md:w-auto md:min-w-[280px] h-16 text-lg rounded-2xl shadow-indigo-500/20">
            {loading ? 'Processing...' : '  Create Bot'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}