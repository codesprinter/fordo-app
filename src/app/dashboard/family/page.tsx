"use client"
import { useState, useEffect } from 'react';
import { Users, Mail, Loader2, CheckCircle, Clock } from 'lucide-react';

export default function FamilyPage() {
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [invitations, setInvitations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const fetchFamilyData = async () => {
    try {
      const res = await fetch('/api/family');
      if (res.ok) {
        const data = await res.json();
        setFamily(data.family);
        setMembers(data.members);
        setInvitations(data.invitations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    setMessage({ text: '', type: '' });
    try {
      const res = await fetch('/api/family', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ text: data.message, type: 'success' });
        setInviteEmail('');
        fetchFamilyData(); // Refresh list
      } else {
        setMessage({ text: data.message || 'Error occurred', type: 'error' });
      }
    } catch(e) {
      setMessage({ text: 'Something went wrong', type: 'error' });
    } finally {
      setInviting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-500">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Users className="text-emerald-500" />
          {family?.name || 'Your Family'}
        </h1>
        <p className="text-slate-400 mt-1">Manage your family members and invitations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Members List */}
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
          <h2 className="text-xl font-bold text-white mb-6">Members</h2>
          {members.length === 0 ? (
            <p className="text-slate-400">No members found.</p>
          ) : (
            <div className="space-y-4">
              {members.map(member => (
                <div key={member._id} className="flex items-center gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold text-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-semibold text-white">{member.name}</div>
                    <div className="text-sm text-slate-400">{member.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Invitations & Add Member */}
        <div className="space-y-8">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Add or Invite Member</h2>
            <p className="text-sm text-slate-400 mb-6">Enter an email to add a registered user instantly, or invite a new user.</p>
            
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input 
                    type="email" required
                    value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>
              {message.text && (
                <div className={`p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                  {message.text}
                </div>
              )}
              <button 
                type="submit" disabled={inviting}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {inviting ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send Invite'}
              </button>
            </form>
          </div>

          {invitations.length > 0 && (
            <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6">
              <h2 className="text-xl font-bold text-white mb-4">Pending Invitations</h2>
              <div className="space-y-3">
                {invitations.map(inv => (
                  <div key={inv._id} className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                    <span className="text-slate-300 text-sm truncate">{inv.email}</span>
                    <span className="text-amber-500 text-xs font-medium flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-full">
                      <Clock size={12} /> Pending
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
