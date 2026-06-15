export default function PrizeModal({
  winner,
  resetWheel,
}: {
  winner: string | null;
  resetWheel: () => void;
}) {
  if (!winner) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#0A0F1C]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1B2341]/95 border border-[#6296CE]/50 px-8 py-10 md:px-12 md:py-14 rounded-3xl shadow-[0_0_60px_rgba(98,150,206,0.5)] text-center max-w-lg w-[90%] transform transition-all scale-100">
        <span className="block text-sm md:text-base text-[#6296CE] font-bold uppercase tracking-widest mb-3 drop-shadow-md">
          ¡Premio Seleccionado!
        </span>
        <span className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-10 block leading-tight">
          {winner}
        </span>
        <button
          id="btn-reset"
          onClick={resetWheel}
          className="w-full py-4 md:py-5 bg-[#6296CE] hover:bg-[#4d7cb0] rounded-xl font-bold text-white transition-all shadow-lg text-lg md:text-xl active:scale-95"
        >
          Aceptar / Continuar
        </button>
        <p className="mt-4 text-gray-400 text-xs md:text-sm">
          También puedes pulsar ESPACIO
        </p>
      </div>
    </div>
  );
}
