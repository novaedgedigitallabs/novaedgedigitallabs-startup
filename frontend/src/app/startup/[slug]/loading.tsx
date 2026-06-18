export default function Loading() {
  return (
    <div className="flex flex-col gap-8 py-10 w-full max-w-4xl mx-auto animate-pulse">
      <div className="w-32 h-6 bg-white/10 rounded-full"></div>
      
      <div className="glass-panel p-8 sm:p-12 rounded-[2.5rem] border border-white/5 flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row gap-8 items-start sm:items-center">
          <div className="h-24 w-24 sm:h-32 sm:w-32 shrink-0 rounded-2xl bg-white/10"></div>
          <div className="flex flex-col gap-4 w-full">
            <div className="w-24 h-6 bg-white/10 rounded-full"></div>
            <div className="w-2/3 h-10 bg-white/10 rounded-xl"></div>
            <div className="w-1/2 h-6 bg-white/10 rounded-xl"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-4">
          <div className="md:col-span-2 flex flex-col gap-6">
            <div className="w-full h-32 bg-white/10 rounded-xl"></div>
            <div className="w-full h-20 bg-white/10 rounded-xl"></div>
          </div>
          <div className="flex flex-col gap-6 bg-black/40 p-6 rounded-2xl border border-white/5 h-fit">
            <div className="w-full h-16 bg-white/10 rounded-xl"></div>
            <div className="w-full h-24 bg-white/10 rounded-xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
