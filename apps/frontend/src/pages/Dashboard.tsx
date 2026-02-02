import { useQuery } from '@tanstack/react-query';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  FileText, 
  ArrowUpRight,
  ArrowDownRight,
  Plus
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100/50 hover:shadow-xl hover:shadow-slate-200/40 transition-all duration-500 group">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-2xl transition-transform group-hover:rotate-12 duration-500 shadow-lg shadow-opacity-10", color)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold",
          trend === 'up' ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
        )}>
          {trend === 'up' ? <ArrowUpRight className="w-3" /> : <ArrowDownRight className="w-3" />}
          {trendValue}%
        </div>
      )}
    </div>
    <h3 className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">{title}</h3>
    <p className="text-2xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

const cn = (...classes: any) => classes.filter(Boolean).join(' ');

export default function Dashboard() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: async () => {
      const resp = await api.get('/dashboard/summary');
      return resp.data.data;
    },
  });

  if (isLoading) return <div className="animate-pulse space-y-8">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-[2rem]" />)}
    </div>
    <div className="h-96 bg-slate-100 rounded-[2rem]" />
  </div>;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Overview</h1>
          <p className="text-slate-500 font-medium">Here's how your business is performing today.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/invoices/new">
            <Button className="rounded-2xl shadow-primary-200">
              <Plus className="w-4 h-4 mr-2" /> Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Revenue" 
          value={`$${summary?.totalRevenue?.toLocaleString() || '0'}`}
          icon={TrendingUp}
          trend="up"
          trendValue="12"
          color="bg-emerald-500 shadow-emerald-200"
        />
        <StatCard 
          title="Outstanding" 
          value={`$${summary?.totalOutstanding?.toLocaleString() || '0'}`}
          icon={TrendingDown}
          trend="down"
          trendValue="5"
          color="bg-amber-500 shadow-amber-200"
        />
        <StatCard 
          title="Total Customers" 
          value="124"
          icon={Users}
          trend="up"
          trendValue="8"
          color="bg-indigo-500 shadow-indigo-200"
        />
        <StatCard 
          title="Active Invoices" 
          value="42"
          icon={FileText}
          color="bg-rose-500 shadow-rose-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Revenue Stream</h3>
            <select className="bg-slate-50 border-none rounded-xl px-4 py-2 text-sm font-bold text-slate-600 outline-none cursor-pointer">
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { name: 'Mon', rev: 4000 },
                { name: 'Tue', rev: 3000 },
                { name: 'Wed', rev: 2000 },
                { name: 'Thu', rev: 2780 },
                { name: 'Fri', rev: 1890 },
                { name: 'Sat', rev: 2390 },
                { name: 'Sun', rev: 3490 },
              ]}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey="rev" stroke="#0ea5e9" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100/50">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Top Customers</h3>
          <div className="space-y-6">
            {summary?.topCustomers?.map((customer: any, idx: number) => (
              <div key={customer.id} className="flex items-center gap-4">
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg",
                  idx === 0 ? "bg-primary-500 shadow-primary-100" :
                  idx === 1 ? "bg-amber-400 shadow-amber-100" :
                  "bg-slate-200 text-slate-600 shadow-slate-50"
                )}>
                  {customer.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 truncate">{customer.name}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{customer.revenue?.toLocaleString()} USD</p>
                </div>
                <div className="w-16 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-primary-500 h-full rounded-full" 
                    style={{ width: `${(customer.revenue / (summary.topCustomers[0].revenue || 1)) * 100}%` }}
                  />
                </div>
              </div>
            ))}
            {!summary?.topCustomers?.length && (
              <p className="text-center text-slate-400 text-sm py-10">No data available yet</p>
            )}
          </div>
          <Button variant="ghost" className="w-full mt-8 rounded-xl font-bold">View All Customers</Button>
        </div>
      </div>
    </div>
  );
}
