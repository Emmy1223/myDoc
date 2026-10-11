export default function BuilderLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-paper md:h-screen md:flex-row">
      {/* Left: input panel skeleton */}
      <div className="flex max-h-[70vh] shrink-0 flex-col border-b border-stone-200 bg-paper md:max-h-none md:h-screen md:w-[35%] md:border-b-0 md:border-r">
        <div className="border-b border-stone-200 px-4 py-3">
          <div className="h-4 w-24 animate-pulse bg-stone-200" />
        </div>
        <div className="border-b border-stone-200 p-4">
          <div className="h-24 animate-pulse border border-dashed border-stone-300 bg-white" />
        </div>
        <div className="border-b border-stone-200 px-4 py-3">
          <div className="h-5 w-40 animate-pulse bg-stone-200" />
        </div>
        <div className="flex gap-3 border-b border-stone-200 px-4 py-3">
          <div className="h-4 w-16 animate-pulse bg-stone-200" />
          <div className="h-4 w-16 animate-pulse bg-stone-200" />
          <div className="h-4 w-16 animate-pulse bg-stone-200" />
        </div>
      </div>

      {/* Right: preview skeleton */}
      <div className="relative min-h-[80vh] flex-1 overflow-auto bg-stone-200 md:h-screen md:min-h-0">
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-rust" />
            <p className="text-sm text-stone-500">Loading builder...</p>
          </div>
        </div>
      </div>
    </div>
  );
}