import { Dashboard } from "@/components/dashboard/dashboard";
import { Header } from "@/components/layout/header";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1">
        <Dashboard />
      </main>
    </div>
  );
}
