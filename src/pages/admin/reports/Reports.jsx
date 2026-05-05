import React, { useState } from 'react';
import { HiChartBar, HiArrowDownTray, HiFunnel, HiCalendarDays } from 'react-icons/hi2';
import { Button } from '../../../components/ui/Button.jsx';
import { BarChart, Bar, ResponsiveContainer, LineChart, Line } from 'recharts';

const MOCK_DATA = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
];

const REPORTS = [
  { id: 'headcount', title: 'Headcount Report', description: 'Total employee growth and distribution across departments.', type: 'bar' },
  { id: 'attendance', title: 'Attendance Report', description: 'Daily attendance trends, late arrivals, and absence rates.', type: 'line' },
  { id: 'leave', title: 'Leave Report', description: 'Leave utilization by type and department.', type: 'bar' },
  { id: 'visa', title: 'Visa Expiry Report', description: 'Upcoming visa and work permit expirations.', type: 'table' },
  { id: 'attrition', title: 'Attrition Report', description: 'Employee turnover rates and exit reasons analysis.', type: 'line' },
  { id: 'performance', title: 'Performance Summary', description: 'Overall organization performance ratings distribution.', type: 'bar' },
  { id: 'compliance', title: 'Document Compliance', description: 'Track missing or expired mandatory documents.', type: 'bar' },
];

export default function Reports() {
  const [generating, setGenerating] = useState(null);

  const handleGenerate = (id) => {
    setGenerating(id);
    setTimeout(() => setGenerating(null), 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Reports & Analytics</h1>
          <p className="text-sm text-text-secondary">Generate and export organizational insights</p>
        </div>
        <div className="flex items-center gap-2">
          <Button label="Date Range" icon={HiCalendarDays} variant="outline" />
          <Button label="Department" icon={HiFunnel} variant="outline" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <div key={report.id} className="flex flex-col rounded-xl border border-border-tertiary bg-background-primary p-5 shadow-sm transition-all hover:shadow-md">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <HiChartBar className="h-6 w-6" />
            </div>
            <h3 className="mb-2 text-lg font-bold text-text-primary">{report.title}</h3>
            <p className="mb-6 flex-1 text-sm text-text-secondary leading-relaxed">
              {report.description}
            </p>
            
            {generating === report.id ? (
              <div className="mb-4 h-32 w-full animate-pulse rounded-lg bg-background-tertiary" />
            ) : (
              <div className="mb-4 h-32 w-full overflow-hidden rounded-lg bg-background-tertiary/30 p-2">
                {report.type === 'bar' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_DATA}>
                      <Bar dataKey="value" fill="#0F766E" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : report.type === 'line' ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={MOCK_DATA}>
                      <Line type="monotone" dataKey="value" stroke="#0F766E" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-widest text-text-tertiary font-bold">
                    Table Preview
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button 
                label={generating === report.id ? 'Generating...' : 'Generate'} 
                variant="primary" 
                className="flex-1" 
                onClick={() => handleGenerate(report.id)}
                disabled={generating !== null}
              />
              <Button icon={HiArrowDownTray} variant="outline" title="Export PDF" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
