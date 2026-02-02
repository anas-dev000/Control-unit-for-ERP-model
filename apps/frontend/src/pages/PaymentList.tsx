import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, CreditCard, Calendar, Hash, User, ArrowDownCircle } from 'lucide-react';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

const paymentSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  invoiceId: z.string().optional().or(z.literal('')),
  amount: z.number().positive(),
  method: z.enum(['CASH', 'BANK_TRANSFER', 'CREDIT_CARD', 'CHECK', 'OTHER']),
  reference: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function PaymentList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      const resp = await api.get('/payments');
      return resp.data.data;
    },
  });

  const { data: customers } = useQuery({
    queryKey: ['customers-list'],
    queryFn: async () => {
      const resp = await api.get('/customers');
      return resp.data.data;
    },
  });

  const { data: invoices } = useQuery({
    queryKey: ['invoices-list'],
    queryFn: async () => {
      const resp = await api.get('/invoices');
      return resp.data.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      method: 'CASH',
    }
  });

  const mutation = useMutation({
    mutationFn: (data: PaymentFormValues) => {
      // Clean up empty strings to undefined for optional fields
      const payload = {
        ...data,
        invoiceId: data.invoiceId || undefined,
        reference: data.reference || undefined,
        notes: data.notes || undefined,
      };
      return api.post('/payments', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      setIsModalOpen(false);
      reset();
    },
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payment Ledger</h1>
          <p className="text-slate-500 font-medium">Recorded income and transaction history.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="rounded-2xl shadow-primary-200">
          <ArrowDownCircle className="w-5 h-5 mr-2" /> Record Payment
        </Button>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Date</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Method</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Invoice #</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [1,2,3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/20" />
                </tr>
              ))
            ) : payments?.map((p: any) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {format(new Date(p.paymentDate), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-bold text-slate-700">{p.customer?.name}</span>
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100 text-slate-600 border border-slate-200">
                    {p.method.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="font-mono text-sm text-slate-500">
                    {p.invoice?.invoiceNumber ? `#${p.invoice.invoiceNumber}` : 'General Payment'}
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <span className="text-lg font-black text-emerald-600">${p.amount.toLocaleString()}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Payment">
        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Customer</label>
            <select 
              {...register('customerId')}
              className="w-full rounded-xl border-2 border-slate-100 bg-white py-3 px-4 focus:border-primary-500 outline-none"
            >
              <option value="">Select Customer</option>
              {customers?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.customerId && <p className="text-xs text-red-500">{errors.customerId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700 ml-1">Allocated Invoice (Optional)</label>
            <select 
              {...register('invoiceId')}
              className="w-full rounded-xl border-2 border-slate-100 bg-white py-3 px-4 focus:border-primary-500 outline-none"
            >
              <option value="">No specific invoice</option>
              {invoices?.map((i: any) => (
                <option key={i.id} value={i.id}>#{i.invoiceNumber} - total ${i.total}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Amount Paid"
              type="number"
              step="0.01"
              icon={<DollarSign className="w-4 h-4" />}
              error={errors.amount?.message}
              {...register('amount', { valueAsNumber: true })}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700 ml-1">Method</label>
              <select 
                {...register('method')}
                className="w-full rounded-xl border-2 border-slate-100 bg-white py-3 px-4 focus:border-primary-500 outline-none"
              >
                <option value="CASH">Cash</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="CHECK">Check</option>
              </select>
            </div>
          </div>

          <Input label="Reference / Check #" placeholder="e.g. TR-9821" {...register('reference')} />
          
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={mutation.isPending}>Record Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const DollarSign = (props: any) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
);
