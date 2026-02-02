import { useQuery } from '@tanstack/react-query';
import api from '../../lib/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, Calendar, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

const COLORS = ['#22c55e', '#facc15', '#fb923c', '#f87171', '#ef4444'];

export default function AgingReport() {
  const { data: agingData, isLoading } = useQuery({
    queryKey: ['aging-report'],
    queryFn: async () => {
      const res = await api.get('/dashboard/aging');
      return res.data.data;
    }
  });

  const chartData = agingData ? Object.entries(agingData).map(([key, value]) => ({
    name: key.toUpperCase(),
    amount: value
  })) : [];

  if (isLoading) return <div className="animate-pulse h-96 bg-slate-100 rounded-[2.5rem]" />;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Aging Report</h1>
          <p className="text-slate-500 font-medium">Breakdown of outstanding receivables by due date.</p>
        </div>
        <Button variant="ghost" className="rounded-xl border border-slate-200">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-8">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            <h3 className="text-xl font-bold text-slate-800">Outstanding Distribution</h3>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontWeight: 'bold'}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '1rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          {chartData.map((item, index) => (
            <div key={item.name} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-12 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{item.name}</p>
                  <p className="text-2xl font-black text-slate-900">${Number(item.amount).toLocaleString()}</p>
                </div>
              </div>
              <Calendar className="w-8 h-8 text-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
