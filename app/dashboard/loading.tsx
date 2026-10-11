export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-paper md:flex-row">
      {/* Sidebar skeleton */}
      <aside className="hidden w-60 shrink-0 border-r border-stone-800 bg-stone-900 md:block" />

      {/* Content skeleton */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 px-6 py-10 md:px-10 md:py-12">
          <div className="mx-auto max-w-4xl">
            <div className="h-3 w-20 animate-pulse bg-stone-200" />
            <div className="mt-3 h-9 w-64 animate-pulse bg-stone-200" />
            <div className="mt-4 h-4 w-80 animate-pulse bg-stone-100" />
            <div className="mt-10 space-y-4">
              <div className="h-16 animate-pulse border border-stone-200 bg-white" />
              <div className="h-16 animate-pulse border border-stone-200 bg-white" />
              <div className="h-16 animate-pulse border border-stone-200 bg-white" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}