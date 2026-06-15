import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from 'next/link';
import { LogOut, ShoppingBasket, Users } from 'lucide-react';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10 shadow-sm shadow-emerald-900/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center gap-2 text-emerald-500 font-bold text-xl hover:text-emerald-400 transition-colors">
                <ShoppingBasket />
                Fordo
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/family" className="text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-2 text-sm font-medium">
                <Users size={18} />
                <span className="hidden sm:block">Family</span>
              </Link>
              <span className="text-sm font-medium text-slate-300 hidden sm:block">
                {session?.user?.name}
              </span>
              <form action={async () => {
                "use server";
                await signOut({ redirectTo: '/login' });
              }}>
                <button type="submit" className="text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2 text-sm font-medium bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg">
                  <LogOut size={16} />
                  <span className="hidden sm:block">Logout</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
