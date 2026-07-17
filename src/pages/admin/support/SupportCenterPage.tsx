import { useState } from 'react'
import { Helmet } from 'react-helmet-async'

interface Ticket {
  id: string
  subject: string
  from: string
  email: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  status: 'open' | 'pending' | 'resolved' | 'closed'
  assignedTo: string
  created: string
  lastUpdated: string
  messages: number
}

const TICKETS: Ticket[] = [
  { id: 'TKT-1001', subject: 'Unable to generate QR code for business account', from: 'Sarah Johnson', email: 'sarah@example.com', priority: 'high', status: 'open', assignedTo: 'Alex Turner', created: '2026-07-14', lastUpdated: '2 hours ago', messages: 5 },
  { id: 'TKT-1002', subject: 'Payment not reflecting after subscription upgrade', from: 'Mike Chen', email: 'mike@example.com', priority: 'urgent', status: 'open', assignedTo: 'Emma Wilson', created: '2026-07-14', lastUpdated: '30 min ago', messages: 8 },
  { id: 'TKT-1003', subject: 'How to add custom fields to vCard?', from: 'Lisa Anderson', email: 'lisa@example.com', priority: 'low', status: 'resolved', assignedTo: 'Alex Turner', created: '2026-07-13', lastUpdated: '1 day ago', messages: 3 },
  { id: 'TKT-1004', subject: 'Template preview not loading on mobile', from: 'Robert Taylor', email: 'robert@example.com', priority: 'medium', status: 'pending', assignedTo: 'David Kim', created: '2026-07-13', lastUpdated: '5 hours ago', messages: 4 },
  { id: 'TKT-1005', subject: 'Billing discrepancy on last invoice', from: 'Anna Garcia', email: 'anna@example.com', priority: 'high', status: 'pending', assignedTo: 'Emma Wilson', created: '2026-07-12', lastUpdated: '1 day ago', messages: 6 },
  { id: 'TKT-1006', subject: 'Need help with NFC card setup', from: 'James Brown', email: 'james@example.com', priority: 'medium', status: 'open', assignedTo: 'Alex Turner', created: '2026-07-12', lastUpdated: '3 hours ago', messages: 2 },
  { id: 'TKT-1007', subject: 'Affiliate commission not tracking', from: 'Carlos Rivera', email: 'carlos@example.com', priority: 'high', status: 'open', assignedTo: 'David Kim', created: '2026-07-11', lastUpdated: '6 hours ago', messages: 7 },
  { id: 'TKT-1008', subject: 'Feature request: Bulk QR generation', from: 'Priya Patel', email: 'priya@example.com', priority: 'low', status: 'closed', assignedTo: 'Emma Wilson', created: '2026-07-10', lastUpdated: '3 days ago', messages: 1 },
  { id: 'TKT-1009', subject: 'Login issue after password reset', from: 'Alex Kim', email: 'alex@example.com', priority: 'urgent', status: 'open', assignedTo: 'David Kim', created: '2026-07-14', lastUpdated: '15 min ago', messages: 4 },
  { id: 'TKT-1010', subject: 'Can I transfer my subscription to another account?', from: 'Emily Williams', email: 'emily@example.com', priority: 'medium', status: 'resolved', assignedTo: 'Alex Turner', created: '2026-07-09', lastUpdated: '4 days ago', messages: 3 },
]

const KB_ARTICLES = [
  { title: 'Getting Started with vCards', category: 'Onboarding', views: 1240, updated: '2 days ago' },
  { title: 'How to Set Up NFC Cards', category: 'NFC', views: 890, updated: '1 week ago' },
  { title: 'Understanding Subscription Plans', category: 'Billing', views: 2100, updated: '3 days ago' },
  { title: 'QR Code Best Practices', category: 'QR Codes', views: 560, updated: '2 weeks ago' },
  { title: 'Campaign Setup Guide', category: 'Marketing', views: 720, updated: '5 days ago' },
  { title: 'Troubleshooting Payment Issues', category: 'Billing', views: 1500, updated: '1 day ago' },
]

const CHAT_SESSIONS = [
  { id: 'CHT-501', user: 'John Davis', email: 'john@example.com', status: 'active', agent: 'Support Bot', duration: '12 min', messages: 24, topic: 'QR generation issue' },
  { id: 'CHT-502', user: 'Maya Patel', email: 'maya@example.com', status: 'active', agent: 'Emma Wilson', duration: '8 min', messages: 15, topic: 'Payment inquiry' },
  { id: 'CHT-503', user: 'Omar Hassan', email: 'omar@example.com', status: 'waiting', agent: 'Unassigned', duration: '3 min', messages: 5, topic: 'Account upgrade' },
  { id: 'CHT-504', user: 'Sofia Reyes', email: 'sofia@example.com', status: 'resolved', agent: 'Alex Turner', duration: '22 min', messages: 35, topic: 'Template customization' },
  { id: 'CHT-505', user: 'Liam Chen', email: 'liam@example.com', status: 'active', agent: 'David Kim', duration: '18 min', messages: 28, topic: 'NFC card setup' },
]

const SYSTEM_LOGS = [
  { time: '2026-07-15 02:14:23', level: 'info', source: 'Auth', message: 'User login successful — admin@mobilevcardlink.com', ip: '192.168.1.100' },
  { time: '2026-07-15 02:10:05', level: 'warn', source: 'Payment', message: 'Stripe webhook signature verification failed', ip: '54.187.204.56' },
  { time: '2026-07-15 01:58:44', level: 'error', source: 'Email', message: 'SMTP connection timeout — SendGrid relay', ip: '10.0.0.25' },
  { time: '2026-07-15 01:45:12', level: 'info', source: 'Template', message: 'Template #14 "Urban Professional" published', ip: '192.168.1.100' },
  { time: '2026-07-15 01:30:00', level: 'info', source: 'Cron', message: 'Daily reward distribution completed — 1,240 rewards issued', ip: '127.0.0.1' },
  { time: '2026-07-15 01:15:33', level: 'warn', source: 'Cache', message: 'Redis memory usage at 78% — consider scaling', ip: '10.0.0.5' },
  { time: '2026-07-15 01:00:00', level: 'info', source: 'Backup', message: 'Daily database backup completed — 2.4 GB', ip: '127.0.0.1' },
  { time: '2026-07-14 23:45:19', level: 'error', source: 'API', message: 'Rate limit exceeded for /api/campaigns — client 45.67.89.123', ip: '45.67.89.123' },
  { time: '2026-07-14 22:30:08', level: 'info', source: 'User', message: 'New business registration — "GreenLeaf Cafe"', ip: '192.168.1.50' },
  { time: '2026-07-14 21:15:42', level: 'info', source: 'NFC', message: 'NFC card #NFC-2048 assigned to vCard #vcard-1024', ip: '192.168.1.100' },
  { time: '2026-07-14 20:00:00', level: 'warn', source: 'Storage', message: 'S3 bucket "mcom-assets" at 62% capacity', ip: '10.0.0.5' },
  { time: '2026-07-14 18:45:27', level: 'info', source: 'Campaign', message: 'Campaign "Summer Sale 2026" auto-paused — budget exhausted', ip: '192.168.1.100' },
]

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusColors: Record<string, string> = {
  open: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  resolved: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  closed: 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400',
  active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  waiting: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
}

export default function SupportCenterPage() {
  const [tab, setTab] = useState<'tickets' | 'chat' | 'knowledge' | 'logs'>('tickets')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [logLevel, setLogLevel] = useState<string>('all')

  const filteredTickets = TICKETS.filter((t) => {
    const matchesSearch = t.subject.toLowerCase().includes(search.toLowerCase()) || t.from.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const filteredLogs = SYSTEM_LOGS.filter((l) => logLevel === 'all' || l.level === logLevel)
  const openTickets = TICKETS.filter((t) => t.status === 'open').length
  const urgentTickets = TICKETS.filter((t) => t.priority === 'urgent').length
  const activeChats = CHAT_SESSIONS.filter((c) => c.status === 'active').length

  return (
    <div className="space-y-6">
      <Helmet><title>Support Center - MCOM VCard Social Bio</title></Helmet>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage tickets, live chat, knowledge base, and system logs</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{TICKETS.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Total Tickets</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-green-600">{openTickets + activeChats}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Open / Active</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-red-600">{urgentTickets}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Urgent</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-4">
          <p className="text-2xl font-bold text-blue-600">4.8</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Avg Response (hrs)</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
        {(['tickets', 'chat', 'knowledge', 'logs'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all capitalize ${tab === t ? 'border-orange-500 text-orange-600 dark:text-orange-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{t === 'logs' ? 'System Logs' : t === 'chat' ? 'Live Chat' : t}</button>
        ))}
      </div>

      {tab === 'tickets' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">From</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Assigned To</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Updated</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Replies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.subject}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{ticket.id} · {ticket.created}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{ticket.from}</p>
                      <p className="text-[10px] text-gray-400">{ticket.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${priorityColors[ticket.priority]}`}>{ticket.priority}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[ticket.status]}`}>{ticket.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-gray-600 dark:text-gray-400">{ticket.assignedTo}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-500 dark:text-gray-400">{ticket.lastUpdated}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{ticket.messages}</span>
                    </td>
                  </tr>
                ))}
                {filteredTickets.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">No tickets found</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'chat' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Active Live Chat Sessions</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{activeChats} active · {CHAT_SESSIONS.filter((c) => c.status === 'waiting').length} waiting</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Session</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Topic</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Agent</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Duration</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Messages</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {CHAT_SESSIONS.map((chat) => (
                  <tr key={chat.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{chat.id}</td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{chat.user}</p>
                      <p className="text-[10px] text-gray-400">{chat.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{chat.topic}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-600 dark:text-gray-400">{chat.agent}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{chat.duration}</td>
                    <td className="px-5 py-3.5 text-sm text-gray-500 dark:text-gray-400">{chat.messages}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[chat.status]}`}>{chat.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'knowledge' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {KB_ARTICLES.map((article, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm p-5 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-between mb-3">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium">{article.category}</span>
                <span className="text-[10px] text-gray-400">{article.views.toLocaleString()} views</span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{article.title}</h3>
              <p className="text-[10px] text-gray-400">Updated {article.updated}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'logs' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center gap-3">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-0.5">
              {(['all', 'info', 'warn', 'error'] as const).map((level) => (
                <button key={level} onClick={() => setLogLevel(level)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all capitalize ${logLevel === level ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>{level}</button>
              ))}
            </div>
            <span className="text-xs text-gray-400 ml-auto">{filteredLogs.length} events</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Level</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Source</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Message</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-700/50">
                {filteredLogs.map((log, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-5 py-3 text-xs font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{log.time}</td>
                    <td className="px-5 py-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase ${
                        log.level === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                        log.level === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>{log.level}</span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700 dark:text-gray-300 font-medium">{log.source}</td>
                    <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">{log.message}</td>
                    <td className="px-5 py-3 text-xs font-mono text-gray-400">{log.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
