import Navbar from "@/components/Navbar";

export default function EmployeeLayout({ children }: LayoutProps<"/employee">) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar role="employee" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
