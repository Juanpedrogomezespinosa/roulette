export default function Header({
  isMusicMuted,
  toggleMusicMute,
  showSettings,
  setShowSettings,
}: {
  isMusicMuted: boolean;
  toggleMusicMute: () => void;
  showSettings: boolean;
  setShowSettings: (val: boolean) => void;
}) {
  return (
    <header className="z-40 w-full flex items-center justify-between px-4 md:px-8 pt-6 pb-2">
      {/* Botón Mute */}
      <button
        onClick={toggleMusicMute}
        className="w-[105px] md:w-[140px] px-2 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-lg hover:bg-white/20 transition-all text-xs md:text-sm flex justify-center items-center z-50"
      >
        {isMusicMuted ? "🔇 Música Off" : "🎶 Música On"}
      </button>

      {/* Logo Central (AHORA SÍ, GRANDE Y PROTAGONISTA) */}
      <div className="flex-1 flex justify-center px-2 md:px-6">
        <img
          src="/horizontal.png"
          alt="Qualisophy"
          /* - Cambiamos el control de 'height' a 'width' 
             - En móviles ocupa el 50% del ancho, en PC puede llegar hasta 450px
          */
          className="w-[50vw] max-w-[300px] md:max-w-[450px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] brightness-0 invert"
        />
      </div>

      {/* Botón Ajustes */}
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="w-[105px] md:w-[140px] px-2 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-lg hover:bg-white/20 transition-all text-xs md:text-sm flex justify-center items-center z-50"
      >
        {showSettings ? "✕ Cerrar" : "⚙️ Editar"}
      </button>
    </header>
  );
}
