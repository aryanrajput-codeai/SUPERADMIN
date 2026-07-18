import React, { useState } from 'react';
import { 
  LifeBuoy, 
  MessageSquare, 
  UserCheck, 
  CheckCircle2, 
  XSquare, 
  Send,
  AlertCircle,
  Clock,
  Sparkles,
  Search,
  CheckCircle
} from 'lucide-react';
import { SupportTicket, TicketStatus, TicketPriority } from '../types';

interface SupportViewProps {
  tickets: SupportTicket[];
  onReplyTicket: (id: string, text: string) => void;
  onUpdateTicketStatus: (id: string, status: TicketStatus, assignee?: string) => void;
}

export default function SupportView({
  tickets,
  onReplyTicket,
  onUpdateTicketStatus
}: SupportViewProps) {
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(tickets[0]?.id || null);
  const [replyText, setReplyText] = useState<string>('');
  const [assigneeInput, setAssigneeInput] = useState<string>('');
  
  // Filters
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Filtered Tickets
  const filteredTickets = tickets.filter(t => {
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchesPriority && matchesStatus;
  });

  const getPriorityBadge = (prio: TicketPriority) => {
    switch(prio) {
      case 'urgent': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'high': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'medium': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadge = (status: TicketStatus) => {
    switch(status) {
      case 'resolved': return 'bg-emerald-100 text-emerald-800';
      case 'closed': return 'bg-slate-100 text-slate-500';
      case 'assigned': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-amber-100 text-amber-800 animate-pulse';
    }
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicketId) return;
    onReplyTicket(selectedTicketId, replyText);
    setReplyText('');
  };

  const handleAssignTicket = () => {
    if (!assigneeInput.trim() || !selectedTicketId) return;
    onUpdateTicketStatus(selectedTicketId, 'assigned', assigneeInput);
    setAssigneeInput('');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[calc(100vh-10rem)] font-sans">
      
      {/* Filters Bar */}
      <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50">
        <div className="flex items-center space-x-2">
          <LifeBuoy className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider leading-none">Support Queue Desks</h4>
            <span className="text-[10px] text-slate-400 mt-0.5 block">{tickets.length} total active tickets from POS tenants</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs">
          {/* Priority filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Priority:</span>
            <select
              id="ticket-priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              id="ticket-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg p-1.5 bg-white text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="assigned">Assigned</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Split Inbox Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left pane: Tickets List */}
        <div className="w-1/3 border-r border-slate-200 overflow-y-auto divide-y divide-slate-100 shrink-0">
          {filteredTickets.map((t) => (
            <div
              id={`ticket-item-${t.id}`}
              key={t.id}
              onClick={() => setSelectedTicketId(t.id)}
              className={`p-4 hover:bg-slate-50/50 cursor-pointer transition-all ${
                selectedTicketId === t.id ? 'bg-indigo-50/30 border-l-4 border-indigo-600' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase">{t.id}</span>
                <span className={`px-2 py-0.2 rounded-sm text-[8px] font-extrabold uppercase border ${getPriorityBadge(t.priority)}`}>
                  {t.priority}
                </span>
              </div>
              <h5 className="font-bold text-xs text-slate-800 truncate mt-1">{t.title}</h5>
              <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">{t.restaurant_name}</p>
              
              <div className="flex justify-between items-center mt-3 text-[10px] text-slate-400">
                <span className={`px-1.5 py-0.2 rounded-sm font-semibold uppercase ${getStatusBadge(t.status)}`}>
                  {t.status}
                </span>
                <span className="font-mono text-[9px]">{new Date(t.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}

          {filteredTickets.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              No tickets found matching your filters.
            </div>
          )}
        </div>

        {/* Right pane: Ticket details and conversation */}
        <div className="flex-1 flex flex-col justify-between overflow-hidden bg-slate-50/20">
          {selectedTicket ? (
            <>
              {/* Active Ticket Header with Assignee tools */}
              <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-extrabold text-xs text-slate-800">{selectedTicket.title}</h4>
                    <span className={`px-2 py-0.2 rounded-full text-[8px] font-bold uppercase ${getStatusBadge(selectedTicket.status)}`}>
                      {selectedTicket.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    Raised by <strong>{selectedTicket.restaurant_name}</strong> • Assigned to: <strong className="text-slate-700">{selectedTicket.assigned_to}</strong>
                  </p>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  {/* Quick Status actions */}
                  {selectedTicket.status !== 'resolved' && (
                    <button
                      id="btn-resolve-ticket"
                      onClick={() => onUpdateTicketStatus(selectedTicket.id, 'resolved')}
                      className="flex items-center space-x-1 border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Resolve</span>
                    </button>
                  )}
                  {selectedTicket.status !== 'closed' && (
                    <button
                      id="btn-close-ticket"
                      onClick={() => onUpdateTicketStatus(selectedTicket.id, 'closed')}
                      className="flex items-center space-x-1 border border-slate-200 text-slate-600 hover:bg-slate-100 px-2.5 py-1.5 rounded-lg font-bold cursor-pointer"
                    >
                      <XSquare className="w-3.5 h-3.5" />
                      <span>Close Desk</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment bar */}
              <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center space-x-2">
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  <span>Assign to engineer:</span>
                  <input
                    id="input-assignee-name"
                    type="text"
                    placeholder=" Vikram Mehta"
                    value={assigneeInput}
                    onChange={(e) => setAssigneeInput(e.target.value)}
                    className="border border-slate-200 bg-white rounded-md px-2 py-1 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    id="btn-assign-ticket"
                    onClick={handleAssignTicket}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-2 py-1 rounded-md text-[10px] cursor-pointer"
                  >
                    Set
                  </button>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">ID: {selectedTicket.id}</span>
              </div>

              {/* Active Conversation log */}
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                
                {/* Original Description Ticket Card */}
                <div className="bg-white p-4 border border-slate-200 rounded-xl space-y-2 shadow-xs">
                  <span className="text-[9px] uppercase tracking-wider font-extrabold text-indigo-600">Ticket Original Description</span>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">{selectedTicket.description}</p>
                </div>

                {/* Message logs */}
                {selectedTicket.messages.map((msg, index) => (
                  <div 
                    key={index} 
                    className={`flex flex-col max-w-[70%] space-y-1 ${
                      msg.sender === 'admin' ? 'ml-auto items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[9px] text-slate-400 font-bold font-mono">
                      {msg.sender === 'admin' ? 'Super Admin Desk' : 'Tenant Owner'} • {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'admin' 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-xs'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Composer Form */}
              <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-200 flex items-center space-x-3">
                <input
                  id="input-reply-message"
                  type="text"
                  placeholder="Draft message to restaurant owner..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
                <button
                  id="btn-send-reply"
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all cursor-pointer shadow-xs shadow-indigo-500/15"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="m-auto text-center p-8 space-y-3">
              <LifeBuoy className="w-12 h-12 text-slate-300 mx-auto animate-spin" />
              <p className="text-xs text-slate-400">Select a support ticket from the queue list to view conversation ledger.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
