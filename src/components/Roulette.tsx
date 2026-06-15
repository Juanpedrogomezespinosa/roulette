import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const DEFAULT_PRIZES = [
  "Regalo sorpresa",
  "Caramelo",
  "10% Descuento",
  "Tira otra vez",
  "Pegatina",
  "Regalo sorpresa",
  "Caramelo",
  "Tira otra vez",
  "Pegatina",
];

export default function Roulette() {
  const [prizes, setPrizes] = useState<string[]>(DEFAULT_PRIZES);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [rotation, setRotation] = useState<number>(0);
  const [winner, setWinner] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [prizesInput, setPrizesInput] = useState<string>(
    DEFAULT_PRIZES.join("\n"),
  );
  const [confettiTrigger, setConfettiTrigger] = useState<string>("10%");
  const [confettiInput, setConfettiInput] = useState<string>("10%");

  // Estados y Refs de Audio
  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);

  // Inicializar objetos de audio una sola vez
  useEffect(() => {
    // Audio de fondo desde Cloudinary
    const externalAudioUrl =
      "https://res.cloudinary.com/dfddbqydp/video/upload/v1781524987/bg-music_nrigxr.mp3";
    bgMusicRef.current = new Audio(externalAudioUrl);
    bgMusicRef.current.crossOrigin = "anonymous"; // Necesario para audios externos
    bgMusicRef.current.loop = true; // Bucle infinito al terminar la canción
    bgMusicRef.current.volume = 0.5;

    spinSoundRef.current = new Audio("/spin.mp3");
    spinSoundRef.current.loop = true;
    spinSoundRef.current.volume = 0.8;

    winSoundRef.current = new Audio("/win.mp3");
    winSoundRef.current.volume = 1.0;

    successSoundRef.current = new Audio("/success.mp3");
    successSoundRef.current.volume = 1.0;
  }, []);

  // Función para atenuar o subir el volumen suavemente (Audio Ducking)
  const fadeAudio = (
    audio: HTMLAudioElement | null,
    targetVolume: number,
    duration: number = 800,
  ) => {
    if (!audio) return;
    const steps = 20;
    const stepTime = duration / steps;
    const volumeStep = (targetVolume - audio.volume) / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      let newVolume = audio.volume + volumeStep;
      if (newVolume > 1) newVolume = 1;
      if (newVolume < 0) newVolume = 0;

      audio.volume = newVolume;

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
        audio.volume = Math.max(0, Math.min(1, targetVolume));
      }
    }, stepTime);
  };

  const startExperience = () => {
    if (bgMusicRef.current) {
      bgMusicRef.current
        .play()
        .catch((e) => console.log("Bloqueo de autoplay detectado", e));
    }
    setAudioStarted(true);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === "TEXTAREA" || target.tagName === "INPUT")
        )
          return;
        e.preventDefault();

        if (!audioStarted) {
          startExperience();
          return;
        }

        const spinBtn = document.getElementById(
          "btn-spin",
        ) as HTMLButtonElement;
        const resetBtn = document.getElementById(
          "btn-reset",
        ) as HTMLButtonElement;

        if (spinBtn && !spinBtn.disabled) spinBtn.click();
        else if (resetBtn) resetBtn.click();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [audioStarted]);

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#6296CE", "#ffffff", "#1B2341"],
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#6296CE", "#ffffff", "#1B2341"],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  };

  const spinWheel = (): void => {
    if (isSpinning || prizes.length === 0) return;

    setIsSpinning(true);
    setWinner(null);

    // Asegurarse de que si la música estaba pausada (por un confeti anterior), se reanude
    if (bgMusicRef.current && bgMusicRef.current.paused && audioStarted) {
      bgMusicRef.current.play();
    }

    // Atenuación leve durante el giro
    fadeAudio(bgMusicRef.current, 0.4, 500);

    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play();
    }

    // Cortar sonidos de victoria si el usuario gira de nuevo rápido
    if (winSoundRef.current) {
      winSoundRef.current.pause();
      winSoundRef.current.currentTime = 0;
    }
    if (successSoundRef.current) {
      successSoundRef.current.pause();
      successSoundRef.current.currentTime = 0;
    }

    const winnerIndex: number = Math.floor(Math.random() * prizes.length);
    const spins: number = 8;
    const segmentDegree: number = 360 / prizes.length;
    const angleVariation = (Math.random() - 0.5) * (segmentDegree * 0.6);
    const winnerCenterAngle: number =
      winnerIndex * segmentDegree + segmentDegree / 2 + angleVariation;
    const targetModulo = (360 - winnerCenterAngle) % 360;
    const currentBase = Math.floor(rotation / 360) * 360;
    const targetDegree = currentBase + targetModulo + spins * 360;

    setRotation(targetDegree);

    setTimeout(() => {
      const wonPrize = prizes[winnerIndex];
      setWinner(wonPrize);
      setIsSpinning(false);

      if (spinSoundRef.current) {
        spinSoundRef.current.pause();
      }

      // LÓGICA DE SONIDO CONDICIONAL
      const isConfettiWin =
        confettiTrigger.trim() !== "" &&
        wonPrize.toLowerCase().includes(confettiTrigger.toLowerCase());

      if (isConfettiWin) {
        triggerConfetti();

        // Pausar música de fondo (para que continúe por donde iba)
        if (bgMusicRef.current) {
          fadeAudio(bgMusicRef.current, 0, 300); // Fade out rápido
          setTimeout(() => {
            if (bgMusicRef.current) bgMusicRef.current.pause();
          }, 300);
        }

        if (winSoundRef.current) {
          winSoundRef.current.currentTime = 0;
          winSoundRef.current.play();

          // Escuchador dinámico: cuando el win.mp3 termine, arranca la música de fondo
          winSoundRef.current.onended = () => {
            if (bgMusicRef.current) {
              bgMusicRef.current.play();
              fadeAudio(bgMusicRef.current, 0.5, 1000); // Fade in suave
            }
            // Limpiar evento
            if (winSoundRef.current) winSoundRef.current.onended = null;
          };
        }
      } else {
        // Premio normal: atenuamos más (0.1) para que destaque el success.mp3
        fadeAudio(bgMusicRef.current, 0.1, 300);

        if (successSoundRef.current) {
          successSoundRef.current.currentTime = 0;
          successSoundRef.current.play();
        }

        // Restablecer música de fondo a los 2 segundos
        setTimeout(() => {
          fadeAudio(bgMusicRef.current, 0.5, 1500);
        }, 2000);
      }
    }, 6000);
  };

  const resetWheel = (): void => setWinner(null);

  const handleSavePrizes = () => {
    const newPrizes = prizesInput.split("\n").filter((p) => p.trim() !== "");
    if (newPrizes.length >= 2) {
      setPrizes(newPrizes);
      setConfettiTrigger(confettiInput);
      setShowSettings(false);
      resetWheel();
    } else {
      alert("Por favor, introduce al menos 2 premios.");
    }
  };

  const segmentDegree: number = 360 / prizes.length;
  const conicGradient: string = prizes
    .map((_, i) => {
      let color = i % 2 === 0 ? "#6296CE" : "#1B2341";
      if (prizes.length % 2 !== 0 && i === prizes.length - 1) color = "#3A5A80";
      return `${color} ${i * segmentDegree}deg ${(i + 1) * segmentDegree}deg`;
    })
    .join(", ");

  return (
    <div className="relative flex flex-col items-center h-screen w-screen bg-[#0A0F1C] overflow-hidden font-sans">
      {!audioStarted && (
        <div className="absolute inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0F1C]/80 backdrop-blur-md">
          <img
            src="/logo.png"
            alt="Qualisophy Logo"
            className="w-48 h-48 mb-8 object-contain animate-pulse"
          />
          <button
            onClick={startExperience}
            className="px-10 py-5 bg-gradient-to-r from-[#6296CE] to-[#1B2341] rounded-full text-white font-extrabold text-2xl shadow-[0_0_40px_rgba(98,150,206,0.6)] hover:scale-105 transition-transform"
          >
            Iniciar Experiencia
          </button>
          <p className="text-gray-400 mt-4 text-sm font-medium">
            Pulsa el botón o la barra espaciadora
          </p>
        </div>
      )}

      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-[#6296CE]/20 rounded-full blur-[120px] animate-pulse"
          style={{ animationDuration: "8s" }}
        ></div>
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-[#1B2341]/60 rounded-full blur-[100px] animate-pulse"
          style={{ animationDuration: "10s" }}
        ></div>
      </div>

      <button
        onClick={() => setShowSettings(!showSettings)}
        className="absolute top-4 right-4 z-50 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg shadow-lg hover:bg-white/20 transition-all text-sm"
      >
        {showSettings ? "✕ Cerrar" : "⚙️ Editar"}
      </button>

      {showSettings && (
        <div className="absolute top-16 right-4 z-50 w-72 md:w-80 bg-[#1B2341]/95 backdrop-blur-xl border border-[#6296CE]/50 p-6 rounded-2xl shadow-2xl text-white animate-fade-in-up">
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
      )}

      {/* 1. SECCIÓN SUPERIOR (LOGOTIPO PEGADO AL TECHO) */}
      <div className="z-10 flex flex-col items-center justify-start w-full pt- shrink-0 px-">
        <img
          src="/horizontal.png"
          alt="Qualisophy"
          className="w-[70vw] max-w-[320px] h-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] brightness-0 invert"
        />
      </div>

      <div className="z-10 flex-1 min-h-0 w-full flex items-center justify-center p-4 md:p-8">
        <div
          className="relative flex items-center justify-center"
          style={{ width: "min(90vw, 60vh)", height: "min(90vw, 60vh)" }}
        >
          <div className="absolute -top-6 md:-top-8 left-1/2 transform -translate-x-1/2 z-30 drop-shadow-[0_0_15px_rgba(98,150,206,0.8)]">
            <div
              className="w-10 h-12 md:w-14 md:h-16 bg-gradient-to-b from-white to-[#6296CE]"
              style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
            ></div>
          </div>
          <div className="absolute inset-[-10px] rounded-full border border-white/20 bg-white/5 backdrop-blur-sm shadow-[0_0_50px_rgba(98,150,206,0.1)] z-0 pointer-events-none"></div>

          <div
            className="w-full h-full rounded-full border-4 md:border-[6px] border-white/80 shadow-[inset_0_0_30px_rgba(0,0,0,0.5),0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden transition-transform duration-[6000ms] ease-[cubic-bezier(0.2,0.1,0.1,1)] z-10"
            style={{
              background: `conic-gradient(${conicGradient})`,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {prizes.map((prize, i) => {
              const angle: number = i * segmentDegree + segmentDegree / 2;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 origin-left flex items-center justify-end"
                  style={{
                    transform: `translateY(-50%) rotate(${angle - 90}deg)`,
                    width: "48%",
                    paddingRight: "4%", // Margen reducido para ganar espacio
                    paddingLeft: "18%",
                  }}
                >
                  <span
                    /* He quitado el 'truncate'. 
                       'leading-tight' y text-sm hacen que si hay dos líneas no se solapen
                    */
                    className="block text-right text-white font-medium tracking-wide text-xs sm:text-sm md:text-base lg:text-lg w-full leading-tight"
                    style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.4)" }}
                  >
                    {prize}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-[16%] h-[16%] bg-white rounded-full border-2 md:border-4 border-[#6296CE] shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Qualisophy Logo"
              className="w-[100%] h-[100%] object-contain object-center"
            />
          </div>
        </div>
      </div>

      <div className="z-10 w-full max-w-lg shrink-0 flex flex-col items-center justify-center pb-8 px-4 h-32 md:h-40">
        {!winner ? (
          <button
            id="btn-spin"
            onClick={spinWheel}
            disabled={isSpinning || !audioStarted}
            className={`w-full py-4 md:py-5 rounded-2xl font-bold text-xl md:text-2xl transition-all border border-white/20
              ${
                isSpinning || !audioStarted
                  ? "bg-white/5 text-white/50 backdrop-blur-md cursor-not-allowed"
                  : "bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 shadow-[0_0_20px_rgba(98,150,206,0.3)] hover:shadow-[0_0_30px_rgba(98,150,206,0.5)] active:scale-95"
              }`}
          >
            {isSpinning ? "GIRANDO..." : "¡PULSAR ESPACIO!"}
          </button>
        ) : (
          <div className="flex flex-col items-center animate-fade-in-up w-full">
            <div className="bg-[#1B2341]/90 backdrop-blur-xl border border-[#6296CE]/50 px-6 py-4 md:py-5 rounded-2xl shadow-[0_0_30px_rgba(98,150,206,0.5)] text-center w-full">
              <span className="block text-xs md:text-sm text-[#6296CE] font-bold uppercase tracking-widest mb-1 drop-shadow-md">
                ¡Premio Seleccionado!
              </span>
              <span className="text-2xl md:text-4xl font-extrabold text-white drop-shadow-lg">
                {winner}
              </span>
            </div>
            <button
              id="btn-reset"
              onClick={resetWheel}
              className="mt-3 text-gray-400 hover:text-white font-semibold transition-colors underline decoration-white/30 hover:decoration-white underline-offset-4 text-sm"
            >
              Pulsa Espacio para resetear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
