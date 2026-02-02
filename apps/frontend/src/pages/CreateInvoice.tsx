import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Trash2, 
  ChevronLeft, 
  Save, 
  User, 
  Calendar, 
  Hash, 
  FileText,
  DollarSign
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const invoiceSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer'),
  invoiceNumber: z.string().min(1, 'Invoice number is required'),
  date: z.string(),
  dueDate: z.string(),
  items: z.array(z.object({
    description: z.string().min(1, 'Description required'),
    quantity: z.number().positive(),
    unitPrice: z.number().nonnegative(),
  })).min(1, 'At least one item is required'),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: customers } = useQuery({
    queryKey: ['customers-simplified'],
    queryFn: async () => {
      const resp = await api.get('/customers');
      return resp.data.data;
    },
  });

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const mutation = useMutation({
    mutationFn: (data: InvoiceFormValues) => {
      // Transform dates to ISO string for backend Zod validation
      const payload = {
        ...data,
        date: new Date(data.date).toISOString(),
        dueDate: new Date(data.dueDate).toISOString(),
      };
      return api.post('/invoices', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      navigate('/invoices');
    },
    onError: (err: any) => setError(err.response?.data?.message || 'Failed to create invoice'),
  });

  const items = watch('items');
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice || 0), 0);
  const tax = subtotal * 0.15;
  const total = subtotal + tax;

  const onSubmit = (data: InvoiceFormValues) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="rounded-2xl" onClick={() => navigate('/invoices')}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create Invoice</h1>
            <p className="text-slate-500 font-medium">Design and issue a new bill to your client.</p>
          </div>
        </div>
        <Button onClick={handleSubmit(onSubmit)} isLoading={mutation.isPending} className="rounded-2xl shadow-xl shadow-primary-200">
          <Save className="w-5 h-5 mr-3" /> Save & Issue Invoice
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm font-bold border border-red-100 italic">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <FileText className="w-6 h-6 text-primary-500" /> General Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 ml-1">Customer</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <select 
                    {...register('customerId')}
                    className="w-full rounded-xl border-2 border-slate-100 bg-white py-3 pl-11 pr-4 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-50/50 appearance-none"
                  >
                    <option value="">Select a Customer</option>
                    {customers?.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                {errors.customerId && <p className="text-xs text-red-500 mt-1">{errors.customerId.message}</p>}
              </div>

              <Input 
                label="Invoice Number"
                placeholder="INV-001"
                icon={<Hash className="w-5 h-5" />}
                error={errors.invoiceNumber?.message}
                {...register('invoiceNumber')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input 
                label="Issue Date"
                type="date"
                icon={<Calendar className="w-5 h-5" />}
                error={errors.date?.message}
                {...register('date')}
              />
              <Input 
                label="Due Date"
                type="date"
                icon={<Calendar className="w-5 h-5" />}
                error={errors.dueDate?.message}
                {...register('dueDate')}
              />
            </div>
          </div>

          {/* Line Items Card */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Invoice Items</h3>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => append({ description: '', quantity: 1, unitPrice: 0 })}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="flex flex-col md:flex-row gap-4 items-start p-6 bg-slate-50/50 rounded-3xl group border border-transparent hover:border-slate-100 transition-all">
                  <div className="flex-1 w-full">
                    <Input 
                      placeholder="Item description"
                      error={errors.items?.[index]?.description?.message}
                      {...register(`items.${index}.description` as const)}
                      className="bg-white border-none"
                    />
                  </div>
                  <div className="w-full md:w-32">
                    <Input 
                      type="number"
                      placeholder="Qty"
                      min="1"
                      error={errors.items?.[index]?.quantity?.message}
                      {...register(`items.${index}.quantity` as const, { valueAsNumber: true })}
                      className="bg-white border-none text-center"
                    />
                  </div>
                  <div className="w-full md:w-40">
                    <Input 
                      type="number"
                      step="0.01"
                      placeholder="Price"
                      min="0"
                      icon={<DollarSign className="w-4 h-4" />}
                      error={errors.items?.[index]?.unitPrice?.message}
                      {...register(`items.${index}.unitPrice` as const, { valueAsNumber: true })}
                      className="bg-white border-none"
                    />
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl mt-1 self-center"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals & Summary */}
        <div className="space-y-8">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200">
            <h3 className="text-lg font-bold mb-8 uppercase tracking-widest text-slate-400">Invoice Summary</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-medium">Subtotal</span>
                <span className="font-bold text-white">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span className="font-medium">Tax (15%)</span>
                <span className="font-bold text-white">${tax.toLocaleString()}</span>
              </div>
              <div className="h-[1px] bg-slate-800" />
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">Total Amount</span>
                <span className="text-3xl font-black text-primary-400">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Notes / Terms</label>
            <textarea 
              {...register('notes')}
              className="w-full h-32 rounded-2xl border-2 border-slate-100 bg-slate-50 p-4 focus:border-primary-500 focus:outline-none focus:ring-0 text-slate-600 font-medium"
              placeholder="Thank you for your business..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
