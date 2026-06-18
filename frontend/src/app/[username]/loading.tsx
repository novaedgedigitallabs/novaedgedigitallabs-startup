export default function Loading() {
  return (
    <div className="flex flex-col gap-10 py-10 w-full max-w-4xl mx-auto animate-pulse">
      <div className="w-32 h-6 bg-white/10 rounded-full"></div>
      
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-white/10"></div>
          <div className="flex flex-col gap-3">
            <div className="w-48 h-8 bg-white/10 rounded-xl"></div>
            <div className="w-32 h-5 bg-white/10 rounded-xl"></div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8">
          <div className="w-32 h-8 bg-white/10 rounded-xl mb-6"></div>
          
          <div className="glass-panel p-6 rounded-2xl border border-white/5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-xl bg-white/10"></div>
                <div className="flex flex-col gap-2 w-1/3">
                  <div className="w-full h-6 bg-white/10 rounded-xl"></div>
                  <div className="w-2/3 h-4 bg-white/10 rounded-xl"></div>
                </div>
              </div>
              <div className="w-20 h-6 bg-white/10 rounded-full shrink-0"></div>
            </div>
            <div className="w-full h-4 bg-white/10 rounded-xl mt-4"></div>
            <div className="w-5/6 h-4 bg-white/10 rounded-xl mt-2"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
