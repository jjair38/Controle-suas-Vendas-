export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-6">
      <div className="text-center space-y-6 max-w-md w-full bg-white p-12 rounded-[32px] shadow-xl border border-slate-100">
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
          <span className="text-3xl font-black">404</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Página não encontrada</h1>
          <p className="text-slate-500 font-medium">O recurso que você está procurando não existe ou foi movido.</p>
        </div>
        <a 
          href="/" 
          className="inline-flex items-center justify-center w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95"
        >
          Voltar ao Início
        </a>
      </div>
    </div>
  );
}
