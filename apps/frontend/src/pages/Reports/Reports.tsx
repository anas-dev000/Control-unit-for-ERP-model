import { useNavigate } from 'react-router-dom';
import { TrendingUp, FileText, PieChart, ChevronRight } from 'lucide-react';

export default function Reports() {
  const navigate = useNavigate();

  const reports = [
    {
      title: 'Aging Report',
      description: 'Account receivables breakdown by age (30, 60, 90+ days).',
      icon: TrendingUp,
      path: '/reports/aging',
      color: 'bg-orange-100 text-orange-600'
    },
    {
      title: 'Tax Summary',
      description: 'Monthly and quarterly tax liability calculations.',
      icon: PieChart,
      path: '#',
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Customer Statements',
      description: 'Complete ledgers for individual customers.',
      icon: FileText,
      path: '/customers',
      color: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Reporting Center</h1>
        <p className="text-slate-500 font-medium">Insights and audits for your accounting data.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <button
            key={report.title}
            onClick={() => navigate(report.path)}
            className="flex flex-col text-left p-8 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
          >
            <div className={`w-14 h-14 rounded-2xl ${report.color} flex items-center justify-center mb-6`}>
              <report.icon size={28} />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold text-slate-800 mb-2">{report.title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed">{report.description}</p>
            </div>
            <div className="mt-8 flex items-center text-primary-600 font-bold text-sm">
              View Report <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
