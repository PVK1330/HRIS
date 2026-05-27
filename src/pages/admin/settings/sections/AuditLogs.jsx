import { useState } from 'react';
import { RiTimeLine, RiUserLine } from 'react-icons/ri';

export default function AuditLogs() {
  const [logs] = useState([
    {
      id: 1,
      action: 'User Created',
      user: 'admin@example.com',
      timestamp: '2026-05-26 10:30 AM',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: 2,
      action: 'Settings Updated',
      user: 'admin@example.com',
      timestamp: '2026-05-25 02:15 PM',
      ip: '192.168.1.100',
      status: 'success',
    },
    {
      id: 3,
      action: 'Failed Login Attempt',
      user: 'user@example.com',
      timestamp: '2026-05-24 08:45 AM',
      ip: '192.168.1.101',
      status: 'error',
    },
    {
      id: 4,
      action: 'Permissions Modified',
      user: 'admin@example.com',
      timestamp: '2026-05-23 11:20 AM',
      ip: '192.168.1.100',
      status: 'success',
    },
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">System Audit Logs</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Action</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">User</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Timestamp</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">IP Address</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-slate-900">{log.action}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
                    <RiUserLine className="h-4 w-4 text-slate-400" />
                    {log.user}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600 flex items-center gap-2">
                    <RiTimeLine className="h-4 w-4 text-slate-400" />
                    {log.timestamp}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{log.ip}</td>
                  <td className="px-4 py-3 text-sm">
                    <span
                      className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${
                        log.status === 'success'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {log.status === 'success' ? 'Success' : 'Failed'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Audit logs are retained for 90 days. For archival or compliance reports, contact your system administrator.
        </p>
      </div>
    </div>
  );
}
