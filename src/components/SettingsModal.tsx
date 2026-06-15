export default function SettingsModal({
  prizesInput,
  setPrizesInput,
  confettiInput,
  setConfettiInput,
  handleSavePrizes,
}: {
  prizesInput: string;
  setPrizesInput: (val: string) => void;
  confettiInput: string;
  setConfettiInput: (val: string) => void;
  handleSavePrizes: () => void;
}) {
  return (
    <div className="absolute top-24 right-4 md:right-8 z-50 w-72 md:w-80 bg-[#1B2341]/95 backdrop-blur-xl border border-[#6296CE]/50 p-6 rounded-2xl shadow-2xl text-white animate-fade-in-up">
      <h3 className="text-xl font-bold mb-4 text-[#6296CE]">
        Ajustes de Ruleta
      </h3>

      <label className="block text-xs text-gray-400 mb-1">
        Premios (uno por línea):
      </label>
      <textarea
        className="w-full h-32 bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-[#6296CE] resize-none mb-4 shadow-inner text-sm"
        value={prizesInput}
        onChange={(e) => setPrizesInput(e.target.value)}
      />

      <label className="block text-xs text-gray-400 mb-1">
        Palabra que activa confeti:
      </label>
      <input
        type="text"
        className="w-full bg-black/40 border border-white/20 rounded-lg p-3 text-white focus:outline-none focus:border-[#6296CE] mb-6 shadow-inner text-sm"
        value={confettiInput}
        onChange={(e) => setConfettiInput(e.target.value)}
      />

      <button
        onClick={handleSavePrizes}
        className="w-full py-3 bg-[#6296CE] hover:bg-[#4d7cb0] rounded-lg font-bold transition-colors shadow-lg"
      >
        Actualizar Ruleta
      </button>
    </div>
  );
}
