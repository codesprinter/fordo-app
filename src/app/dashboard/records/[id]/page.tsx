"use client"
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Plus, CheckCircle2, Circle, Trash2, Loader2, Save } from 'lucide-react';
import Link from 'next/link';

export default function RecordDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQuantity, setNewItemQuantity] = useState('1');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (id) fetchRecord();
  }, [id]);

  const fetchRecord = async () => {
    try {
      const res = await fetch(`/api/records/${id}`);
      if (res.ok) {
        setRecord(await res.json());
      } else {
        router.push('/dashboard');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemStatus = async (itemIndex: number) => {
    if (!record) return;

    // Optimistic UI update
    const updatedItems = [...record.items];
    const item = updatedItems[itemIndex];
    item.status = item.status === 'pending' ? 'completed' : 'pending';
    
    setRecord({ ...record, items: updatedItems });

    // Background sync
    try {
      await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (e) {
      console.error("Failed to sync item status", e);
      // Optional: revert on failure
    }
  };

  const deleteItem = async (itemIndex: number) => {
    if (!record) return;
    const updatedItems = record.items.filter((_: any, idx: number) => idx !== itemIndex);
    
    setRecord({ ...record, items: updatedItems });
    
    try {
      await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
    } catch (e) {
      console.error(e);
    }
  };

  const deleteList = async () => {
    if (!confirm('Are you sure you want to delete this entire list?')) return;
    try {
      await fetch(`/api/records/${id}`, { method: 'DELETE' });
      router.push('/dashboard');
    } catch (e) {
      console.error(e);
    }
  };

  const addItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !record) return;
    setIsAdding(true);

    const newItem = {
      serial_number: record.items.length + 1,
      item_name: newItemName,
      quantity: Number(newItemQuantity) || 1,
      status: 'pending'
    };

    const updatedItems = [...record.items, newItem];
    
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: updatedItems })
      });
      if (res.ok) {
        setRecord({ ...record, items: updatedItems });
        setNewItemName('');
        setNewItemQuantity('1');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-emerald-500">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!record) return null;

  const pendingItems = record.items.filter((i: any) => i.status === 'pending');
  const completedItems = record.items.filter((i: any) => i.status === 'completed');
  const progress = record.items.length === 0 ? 0 : Math.round((completedItems.length / record.items.length) * 100);

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ChevronLeft size={20} />
          Back to Lists
        </Link>
        <button onClick={deleteList} className="text-red-500 hover:text-red-400 text-sm font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
          <Trash2 size={16} /> <span className="hidden sm:inline">Delete List</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-black/20">
        <h1 className="text-3xl font-extrabold text-white mb-2">{record.title}</h1>
        {record.description && <p className="text-slate-400 text-lg mb-6">{record.description}</p>}
        
        <div className="flex items-center gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <div className="flex-1 w-full bg-slate-800 h-3 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${progress === 100 ? 'bg-emerald-500' : 'bg-emerald-500/70'}`} 
              style={{ width: `${progress}%` }} 
            />
          </div>
          <span className="text-sm font-bold w-12 text-right text-emerald-400">{progress}%</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <div>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">To Get ({pendingItems.length})</h3>
            <div className="space-y-2">
              {record.items.map((item: any, idx: number) => {
                if (item.status === 'completed') return null;
                return (
                  <div key={idx} className="group flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-2xl transition-all cursor-pointer shadow-sm active:scale-[0.98]" onClick={() => toggleItemStatus(idx)}>
                    <div className="flex items-center gap-4 cursor-pointer flex-1">
                      <div className="text-slate-500 hover:text-emerald-500 transition-colors">
                        <Circle size={24} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-lg font-medium text-slate-100">{item.item_name}</span>
                        <div className="text-sm text-slate-500">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                      className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all sm:flex hidden"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add New Item */}
        <form onSubmit={addItem} className="flex gap-3 items-end p-4 bg-slate-900 border border-slate-800 border-dashed rounded-2xl">
          <div className="flex-1">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Item Name</label>
            <input 
              required value={newItemName} onChange={e => setNewItemName(e.target.value)}
              placeholder="Apples"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="w-24">
            <label className="text-xs font-semibold text-slate-500 mb-1.5 block uppercase tracking-wider">Qty</label>
            <input 
              type="number" required min="1" value={newItemQuantity} onChange={e => setNewItemQuantity(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-600 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
          <button type="submit" disabled={isAdding} className="bg-emerald-600 hover:bg-emerald-500 text-white p-3 rounded-xl transition-colors disabled:opacity-50">
            {isAdding ? <Loader2 size={24} className="animate-spin" /> : <Plus size={24} />}
          </button>
        </form>

        {/* Completed Items */}
        {completedItems.length > 0 && (
          <div className="mt-12 opacity-75">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-2">Completed ({completedItems.length})</h3>
            <div className="space-y-2">
              {record.items.map((item: any, idx: number) => {
                if (item.status === 'pending') return null;
                return (
                  <div key={idx} className="group flex items-center justify-between p-4 bg-transparent border border-slate-800 rounded-2xl transition-all cursor-pointer" onClick={() => toggleItemStatus(idx)}>
                    <div className="flex items-center gap-4 opacity-50 flex-1">
                      <div className="text-emerald-500">
                        <CheckCircle2 size={24} className="stroke-[2.5]" />
                      </div>
                      <div>
                        <span className="text-lg font-medium text-slate-400 line-through decoration-slate-500">{item.item_name}</span>
                        <div className="text-sm text-slate-600">Qty: {item.quantity}</div>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteItem(idx); }}
                      className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-all sm:flex hidden"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
