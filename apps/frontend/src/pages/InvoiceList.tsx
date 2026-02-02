import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, FileText, Filter, Download, MoreVertical, Calendar, Loader2, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { useState } from 'react';
import { format } from 'date-fns';
import { generateInvoicePDF } from '../lib/print';

const StatusBadge = ({ status }: { status: string }) => {
  const styles: any = {
    DRAFT: 'bg-slate-100 text-slate-600 border-slate-200',
    SENT: 'bg-blue-50 text-blue-600 border-blue-100',
    PAID: 'bg-green-50 text-green-600 border-green-100',
    PARTIAL: 'bg-orange-50 text-orange-600 border-orange-100',
    OVERDUE: 'bg-red-50 text-red-600 border-red-100',
    CANCELLED: 'bg-slate-200 text-slate-400 border-slate-300',
  };

  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
      styles[status] || styles.DRAFT
    )}>
      {status || 'UNKNOWN'}
    </span>
  );
};

const cn = (...classes: any) => classes.filter(Boolean).join(' ');

export default function InvoiceList() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionOpenId, setActionOpenId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', search, status],
    queryFn: async () => {
      const resp = await api.get('/invoices', { params: { search, status } });
      return resp.data.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/invoices/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to cancel invoice');
    }
  });

  const handleDownload = async (invoice: any) => {
    try {
      setDownloadingId(invoice.id);
      const res = await api.get(`/invoices/${invoice.id}`);
      generateInvoicePDF(res.data.data || res.data);
    } catch (e) {
      console.error(e);
      alert('Failed to download invoice');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Billing & Invoices</h1>
          <p className="text-slate-500 font-medium">Tracking all your sales and payment status.</p>
        </div>
        <Link to="/invoices/new">
          <Button className="rounded-2xl shadow-primary-200">
            <Plus className="w-5 h-5 mr-2" /> New Invoice
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <Input 
            placeholder="Invoice # or customer name..." 
            icon={<Search className="w-5 h-5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none bg-slate-50 focus:ring-0"
          />
        </div>
        <select 
          className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-slate-600 outline-none cursor-pointer"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="PAID">Paid</option>
          <option value="PARTIAL">Partial</option>
          <option value="OVERDUE">Overdue</option>
        </select>
      </div>

      {/* Mobile Card View */}
      <div className="block lg:hidden space-y-4">
        {isLoading ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 animate-pulse h-32" />
          ))
        ) : data?.map((invoice: any) => (
          <div key={invoice.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span className="font-bold text-slate-900">#{invoice.invoiceNumber}</span>
                </div>
                <p className="text-sm font-semibold text-slate-700">{invoice.customer?.name}</p>
              </div>
              <StatusBadge status={invoice.status} />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="w-3.5 h-3.5" />
                {format(new Date(invoice.date), 'MMM dd, yyyy')}
              </div>
              <div className="text-right">
                <span className="font-black text-slate-900">${invoice.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-50 flex justify-end gap-2">
               <Button 
                  variant="ghost" 
                  size="sm" 
                  className="rounded-xl w-full sm:w-auto justify-center"
                  onClick={() => handleDownload(invoice)}
                  disabled={downloadingId === invoice.id}
                >
                  {downloadingId === invoice.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Download
                </Button>
                {/* Add other actions if needed */}
            </div>
          </div>
        ))}
         {!data?.length && !isLoading && (
            <div className="text-center py-10 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="font-bold">No invoices found</p>
            </div>
         )}
      </div>

      {/* Invoices Table (Desktop) */}
      <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Date</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [1,2,3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={6} className="px-8 py-6 h-16 bg-slate-50/20" />
                </tr>
              ))
            ) : data?.map((invoice: any) => (
              <tr key={invoice.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                      <FileText className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="font-bold text-slate-900">#{invoice.invoiceNumber}</span>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <p className="font-bold text-slate-700">{invoice.customer?.name}</p>
                </td>
                <td className="px-8 py-6 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    {format(new Date(invoice.date), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div>
                    <p className="font-black text-slate-900">${invoice.total.toLocaleString()}</p>
                    {invoice.paidAmount > 0 && (
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                        ${invoice.paidAmount.toLocaleString()} paid
                      </p>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <StatusBadge status={invoice.status} />
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="rounded-xl"
                      onClick={() => handleDownload(invoice)}
                      disabled={downloadingId === invoice.id}
                    >
                      {downloadingId === invoice.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                    <div className="relative">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="rounded-xl"
                        onClick={() => setActionOpenId(actionOpenId === invoice.id ? null : invoice.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>

                      {actionOpenId === invoice.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setActionOpenId(null)} 
                          />
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 z-20 py-2 animate-in zoom-in-95 duration-200">
                            <div className="px-4 py-2 border-b border-slate-50 mb-1">
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</p>
                            </div>
                            
                            <button
                              className="w-full text-left px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-primary-600 flex items-center gap-2 transition-colors"
                              onClick={() => {
                                handleDownload(invoice);
                                setActionOpenId(null);
                              }}
                            >
                              <FileText className="w-4 h-4" /> Download PDF
                            </button>

                            {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                              <button
                                onClick={() => {
                                  if (window.confirm('Are you sure you want to cancel this invoice? This action cannot be undone.')) {
                                    cancelMutation.mutate(invoice.id);
                                    setActionOpenId(null);
                                  }
                                }}
                                disabled={cancelMutation.isPending}
                                className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" /> Cancel Invoice
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
            {!data?.length && !isLoading && (
              <tr>
                <td colSpan={6} className="px-8 py-20 text-center">
                  <div className="max-w-xs mx-auto text-slate-400">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No invoices found</p>
                    <p className="text-sm">Create your first invoice to get started.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


