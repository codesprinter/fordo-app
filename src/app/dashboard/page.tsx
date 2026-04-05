"use client"
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/records');
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const createRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;
    setSaving(true);
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, description: newDescription, items: [] })
      });
      if (res.ok) {
        const data = await res.json();
        setShowNewModal(false);
        setNewTitle('');
        setNewDescription('');
        router.push(`/dashboard/records/${data._id}`);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Lists</h1>
          <p className="text-slate-400 mt-1">Manage your grocery purchase orders.</p>
        </div>
        <button 
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-900/20 w-full sm:w-auto justify-center"
        >
          <Plus size={20} />
          Create New List
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20 text-emerald-500">
          <Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <p className="text-slate-400 mb-4 block">You haven't created any lists yet.</p>
          <button onClick={() => setShowNewModal(true)} className="text-emerald-500 font-medium hover:text-emerald-400">
            + Start your first list
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {records.map(r => {
            const completedCount = r.items?.filter((i: any) => i.status === 'completed').length || 0;
            const totalCount = r.items?.length || 0;
            const progress = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);

            return (
              <Link href={`/dashboard/records/${r._id}`} key={r._id} className="group relative bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-900/10 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-slate-100 group-hover:text-emerald-400 transition-colors line-clamp-1">{r.title}</h2>
                  <ArrowRight size={20} className="text-slate-600 group-hover:text-emerald-500 transition-colors transform group-hover:translate-x-1" />
                </div>
                {r.description && <p className="text-slate-400 text-sm mb-4 line-clamp-2">{r.description}</p>}
                
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-4">
                  <Calendar size={14} />
                  {new Date(r.date).toLocaleDateString()}
                </div>

                <div className="mt-auto pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-400">Progress</span>
                    <span className={progress === 100 && totalCount > 0 ? "text-emerald-400" : "text-slate-300"}>
                      {completedCount} / {totalCount}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-emerald-500/70'}`} 
                      style={{ width: `${progress}%` }} 
                    />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* New List Modal */}
      {showNewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md p-6 rounded-2xl shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">New Purchase Order</h2>
            <form onSubmit={createRecord} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Title</label>
                <input 
                  required autoFocus
                  value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g., April Groceries"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Description (Optional)</label>
                <textarea 
                  value={newDescription} onChange={e => setNewDescription(e.target.value)}
                  placeholder="Monthly family supplies..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowNewModal(false)} className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="flex-1 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium transition-colors disabled:opacity-50">
                  {saving ? 'Creating...' : 'Create List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
