import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Mail, Phone } from 'lucide-react';
import api from '../lib/axios';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const customerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  taxNumber: z.string().optional().or(z.literal('')),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

export default function CustomerList() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['customers', search],
    queryFn: async () => {
      const resp = await api.get('/customers', { params: { search } });
      return resp.data.data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
  });

  const createMutation = useMutation({
    mutationFn: (data: CustomerFormValues) => api.post('/customers', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      reset();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CustomerFormValues) => api.patch(`/customers/${editingCustomer.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setIsModalOpen(false);
      setEditingCustomer(null);
      reset();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customers'] }),
  });

  const onSubmit = (values: CustomerFormValues) => {
    if (editingCustomer) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  };

  const handleEdit = (customer: any) => {
    setEditingCustomer(customer);
    reset(customer);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Customer Database</h1>
          <p className="text-slate-500 font-medium">Manage your clients and their information.</p>
        </div>
        <Button 
          onClick={() => { setEditingCustomer(null); reset({}); setIsModalOpen(true); }}
          className="rounded-2xl shadow-primary-200"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Customer
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 flex gap-4">
        <div className="flex-1">
          <Input 
            placeholder="Search by name or email..." 
            icon={<Search className="w-5 h-5" />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-none bg-slate-50 focus:ring-0"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Customer</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Contact</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Tax ID</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-8 py-5 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [1,2,3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-8 py-6 h-16 bg-slate-50/20" />
                </tr>
              ))
            ) : data?.map((customer: any) => (
              <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-8 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-700 font-bold shrink-0">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{customer.name}</p>
                      <p className="text-xs text-slate-400">{customer.address || 'No address'}</p>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="space-y-1">
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {customer.email}
                      </div>
                    )}
                    {customer.phone && (
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {customer.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-8 py-6">
                  <span className="font-mono text-sm text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    {customer.taxNumber || 'N/A'}
                  </span>
                </td>
                <td className="px-8 py-6">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                    Active
                  </span>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEdit(customer)}
                      className="rounded-xl"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => { if(confirm('Delete customer?')) deleteMutation.mutate(customer.id); }}
                      className="rounded-xl text-red-500 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {!data?.length && !isLoading && (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="max-w-xs mx-auto text-slate-400">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="font-bold">No customers found</p>
                    <p className="text-sm">Start by adding your first client to the system.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Customer Form Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer' : 'New Customer'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input 
            label="Full Name / Company Name"
            placeholder="e.g. Acme Corporation"
            error={errors.name?.message}
            {...register('name')}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Email Address"
              placeholder="billing@acme.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input 
              label="Phone Number"
              placeholder="+1 234 567 890"
              error={errors.phone?.message}
              {...register('phone')}
            />
          </div>
          <Input 
            label="Tax Registration Number"
            placeholder="VAT / Tax ID"
            error={errors.taxNumber?.message}
            {...register('taxNumber')}
          />
          <Input 
            label="Mailing Address"
            placeholder="123 Street, City, Country"
            error={errors.address?.message}
            {...register('address')}
          />
          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
              {editingCustomer ? 'Update Customer' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
