export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-stone-300 border-t-rust" />
        <p className="mt-4 text-sm text-stone-500">Loading...</p>
      </div>
    </div>
  );
}