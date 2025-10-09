export function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-soft flex flex-col h-full animate-pulse">
      <div className="relative aspect-square overflow-hidden bg-neutral-200" />

      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="h-4 bg-neutral-200 rounded-md w-3/4" />
        <div className="h-4 bg-neutral-200 rounded-md w-1/2" />

        <div className="flex items-center space-x-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="w-4 h-4 bg-neutral-200 rounded-full" />
          ))}
        </div>

        <div className="flex items-center space-x-2 mt-auto">
          <div className="h-6 bg-neutral-200 rounded-md w-20" />
          <div className="h-5 bg-neutral-200 rounded-md w-16" />
        </div>
      </div>
    </div>
  );
}
