import Sidebar from "@/components/Sidebar";
import ProfileCheck from "@/components/ProfileCheck";
import GlobalScanner from "@/components/GlobalScanner";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen bg-slate-50 relative w-full overflow-x-hidden">
      <ProfileCheck />
      <Sidebar />
      <main className="flex-1 w-full md:ml-64 p-4 md:p-8 pt-20 md:pt-8 min-w-0">
        <div className="max-w-7xl mx-auto pb-24">
          {children}
        </div>
      </main>
      <GlobalScanner />
    </div>
  );
}
