import { useState } from 'react';
import { RiDownloadCloud2Line, RiUploadCloud2Line } from 'react-icons/ri';

export default function BackupRestore() {
  const [backups] = useState([
    {
      id: 1,
      date: '2026-05-26',
      time: '02:00 AM',
      size: '245 MB',
      status: 'completed',
      type: 'Automatic',
    },
    {
      id: 2,
      date: '2026-05-25',
      time: '02:00 AM',
      size: '243 MB',
      status: 'completed',
      type: 'Automatic',
    },
    {
      id: 3,
      date: '2026-05-24',
      time: '10:30 AM',
      size: '241 MB',
      status: 'completed',
      type: 'Manual',
    },
  ]);

  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackupNow = () => {
    setIsBackingUp(true);
    setTimeout(() => setIsBackingUp(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Backup & Restore</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Create Backup</h4>
                <p className="text-sm text-slate-600">Create a manual backup of all system data</p>
              </div>
              <RiDownloadCloud2Line className="h-6 w-6 text-teal-700 shrink-0" />
            </div>
            <button
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="mt-4 w-full px-4 py-2 bg-teal-700 text-white rounded-lg font-medium hover:bg-teal-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isBackingUp ? 'Backing up...' : 'Backup Now'}
            </button>
          </div>

          <div className="border border-slate-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-slate-900 mb-1">Restore from Backup</h4>
                <p className="text-sm text-slate-600">Restore system data from a previous backup</p>
              </div>
              <RiUploadCloud2Line className="h-6 w-6 text-orange-600 shrink-0" />
            </div>
            <button className="mt-4 w-full px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
              Select Backup
            </button>
          </div>
        </div>
      </div>

      <div>
        <h4 className="font-semibold text-slate-900 mb-3">Recent Backups</h4>
        
        <div className="space-y-2">
          {backups.map((backup) => (
            <div
              key={backup.id}
              className="flex items-center justify-between border border-slate-200 rounded-lg p-3 hover:bg-slate-50 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {backup.date} at {backup.time}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {backup.type} • Size: {backup.size}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-1 rounded text-xs font-semibold bg-emerald-100 text-emerald-700">
                  {backup.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
                <button className="px-3 py-1 text-xs font-medium text-teal-700 hover:bg-teal-50 rounded transition-colors">
                  Restore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <p className="text-sm text-orange-800">
          <strong>Warning:</strong> Restoring a backup will overwrite all current data. This action cannot be undone. Please ensure you have verified the backup before proceeding.
        </p>
      </div>
    </div>
  );
}
