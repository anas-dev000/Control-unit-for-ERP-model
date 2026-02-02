import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Building2, User, Globe, Shield, Save, Users, Plus, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

const Tabs = {
  PROFILE: 'profile',
  ACCOUNT: 'account',
  USERS: 'users',
};

export default function Settings() {
  const { user, tenant, updateTenant } = useAuth();
  const [activeTab, setActiveTab] = useState(Tabs.PROFILE);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      companyName: tenant?.name || '',
      taxNumber: (tenant as any)?.settings?.taxNumber || '',
      currency: (tenant as any)?.settings?.currency || 'USD',
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
    }
  });

  const updateCompanyMutation = useMutation({
    mutationFn: (data: any) => api.patch('/company/me', { 
      name: data.companyName, 
      settings: { 
        taxNumber: data.taxNumber,
        currency: data.currency
      } 
    }),
    onSuccess: (res) => {
      updateTenant(res.data.data);
      alert('Company profile updated successfully!');
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => api.patch('/users/profile', {
      firstName: data.firstName,
      lastName: data.lastName
    }),
    onSuccess: () => {
      alert('Profile updated successfully!');
      // Ideally reload user data here or update context
      window.location.reload(); 
    }
  });

  const { data: usersData } = useQuery({
    queryKey: ['users'],
    queryFn: () => api.get('/users'),
    enabled: activeTab === Tabs.USERS && user?.role === 'ADMIN',
  });

  const onSubmit = (data: any) => {
    if (activeTab === Tabs.PROFILE) {
      updateCompanyMutation.mutate(data);
    } else if (activeTab === Tabs.ACCOUNT) {
      updateProfileMutation.mutate(data);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Settings</h1>
        <p className="text-slate-500 font-medium">Control your company profile and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Navigation Tabs */}
        <div className="space-y-2">
          <TabButton 
            active={activeTab === Tabs.PROFILE} 
            onClick={() => setActiveTab(Tabs.PROFILE)}
            icon={<Building2 className="w-5 h-5" />}
            label="Company Profile"
          />
          <TabButton 
            active={activeTab === Tabs.USERS} 
            onClick={() => setActiveTab(Tabs.USERS)}
            icon={<Users className="w-5 h-5" />}
            label="User Management"
            hidden={user?.role !== 'ADMIN'}
          />
          <TabButton 
            active={activeTab === Tabs.ACCOUNT} 
            onClick={() => setActiveTab(Tabs.ACCOUNT)}
            icon={<User className="w-5 h-5" />}
            label="Account Details"
          />
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">
          {activeTab === Tabs.PROFILE && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Organization Profile</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Input 
                  label="Organization Name"
                  icon={<Building2 className="w-5 h-5" />}
                  {...register('companyName')}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 ml-1">Default Currency</label>
                    <select 
                      {...register('currency')}
                      className="w-full rounded-xl border-2 border-slate-100 bg-white py-3 px-4 outline-none focus:border-primary-500"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="SAR">SAR - Saudi Riyal</option>
                      <option value="EGP">EGP - Egyptian Pound</option>
                    </select>
                  </div>
                  <Input 
                    label="Tax ID / VAT Number"
                    {...register('taxNumber')}
                  />
                </div>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <Button type="submit" isLoading={updateCompanyMutation.isPending} className="rounded-xl px-8">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                  </Button>
                </div>
              </form>
            </div>
          )}

          {activeTab === Tabs.USERS && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-slate-800">Team Members</h3>
              </div>
              
              <div className="space-y-4">
                {usersData?.data?.data?.map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center font-bold">
                        {u.firstName[0]}{u.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.firstName} {u.lastName}</p>
                        <p className="text-xs text-slate-500 font-medium">{u.email} • {u.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50 rounded-xl">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === Tabs.ACCOUNT && (
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
              <h3 className="text-xl font-bold text-slate-800 mb-8">Personal Information</h3>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <Input label="First Name" {...register('firstName')} />
                  <Input label="Last Name" {...register('lastName')} />
                </div>
                <Input label="Email Address" disabled value={user?.email || ''} />
                <p className="text-sm text-slate-400 italic">
                  Your account is managed by your organization's administrator.
                </p>

                <div className="pt-4 border-t border-slate-50 flex justify-end">
                  <Button type="submit" isLoading={updateProfileMutation.isPending} className="rounded-xl px-8">
                    <Save className="w-4 h-4 mr-2" /> Save Profile
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, hidden }: any) {
  if (hidden) return null;
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 font-bold rounded-2xl transition-all ${
        active 
          ? 'bg-white text-primary-600 shadow-sm border border-slate-100' 
          : 'text-slate-500 hover:bg-slate-50'
      }`}
    >
      {icon} {label}
    </button>
  );
}
