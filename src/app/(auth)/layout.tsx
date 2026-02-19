export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-surveillance-deepest flex items-center justify-center overflow-hidden">
      {children}
    </main>
  );
}