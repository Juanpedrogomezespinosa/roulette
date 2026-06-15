import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import Header from "./Header";
import SettingsModal from "./SettingsModal";
import PrizeModal from "./PrizeModal";

const DEFAULT_PRIZES = [
  "Regalo sorpresa",
  "Caramelo",
  "25% de descuento",
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
  const [confettiTrigger, setConfettiTrigger] = useState<string>("25%");
  const [confettiInput, setConfettiInput] = useState<string>("25%");

  const [audioStarted, setAudioStarted] = useState<boolean>(false);
  const [isMusicMuted, setIsMusicMuted] = useState<boolean>(false);

  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const spinSoundRef = useRef<HTMLAudioElement | null>(null);
  const winSoundRef = useRef<HTMLAudioElement | null>(null);
  const successSoundRef = useRef<HTMLAudioElement | null>(null);
  const againSoundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const externalAudioUrl =
      "https://res.cloudinary.com/dfddbqydp/video/upload/v1781524987/bg-music_nrigxr.mp3";
    bgMusicRef.current = new Audio(externalAudioUrl);
    bgMusicRef.current.crossOrigin = "anonymous";
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.5;

    spinSoundRef.current = new Audio("/spin.mp3");
    spinSoundRef.current.loop = true;
    spinSoundRef.current.volume = 0.8;

    winSoundRef.current = new Audio("/win.mp3");
    winSoundRef.current.volume = 1.0;

    successSoundRef.current = new Audio("/success.mp3");
    successSoundRef.current.volume = 1.0;

    againSoundRef.current = new Audio("/again.mp3");
    againSoundRef.current.volume = 1.0;
  }, []);

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
      bgMusicRef.current.play().catch((e) => console.log("Autoplay block", e));
    }
    setAudioStarted(true);
  };

  const toggleMusicMute = () => {
    const newMutedState = !isMusicMuted;
    setIsMusicMuted(newMutedState);
    if (bgMusicRef.current) bgMusicRef.current.muted = newMutedState;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        const target = e.target as HTMLElement;
        if (
          target &&
          (target.tagName === "TEXTAREA" ||
            target.tagName === "INPUT" ||
            target.tagName === "BUTTON")
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

    if (
      bgMusicRef.current &&
      bgMusicRef.current.paused &&
      audioStarted &&
      !isMusicMuted
    ) {
      bgMusicRef.current.play();
    }
    fadeAudio(bgMusicRef.current, 0.4, 500);

    if (spinSoundRef.current) {
      spinSoundRef.current.currentTime = 0;
      spinSoundRef.current.play();
    }

    [winSoundRef, successSoundRef, againSoundRef].forEach((ref) => {
      if (ref.current) {
        ref.current.pause();
        ref.current.currentTime = 0;
      }
    });

    const winnerIndex = Math.floor(Math.random() * prizes.length);
    const spins = 8;
    const segmentDegree = 360 / prizes.length;
    const angleVariation = (Math.random() - 0.5) * (segmentDegree * 0.6);
    const winnerCenterAngle =
      winnerIndex * segmentDegree + segmentDegree / 2 + angleVariation;
    const targetModulo = (360 - winnerCenterAngle) % 360;
    const currentBase = Math.floor(rotation / 360) * 360;
    const targetDegree = currentBase + targetModulo + spins * 360;

    setRotation(targetDegree);

    setTimeout(() => {
      const wonPrize = prizes[winnerIndex];
      setWinner(wonPrize);
      setIsSpinning(false);

      if (spinSoundRef.current) spinSoundRef.current.pause();

      const isConfettiWin =
        confettiTrigger.trim() !== "" &&
        wonPrize.toLowerCase().includes(confettiTrigger.toLowerCase());
      const isAgainWin = wonPrize.toLowerCase().includes("tira");

      if (isConfettiWin) {
        triggerConfetti();
        if (bgMusicRef.current) {
          fadeAudio(bgMusicRef.current, 0, 300);
          setTimeout(() => {
            if (bgMusicRef.current) bgMusicRef.current.pause();
          }, 300);
        }
        if (winSoundRef.current) {
          winSoundRef.current.currentTime = 0;
          winSoundRef.current.play();
          winSoundRef.current.onended = () => {
            if (bgMusicRef.current && !isMusicMuted) {
              bgMusicRef.current.play();
              fadeAudio(bgMusicRef.current, 0.5, 1000);
            }
            if (winSoundRef.current) winSoundRef.current.onended = null;
          };
        }
      } else if (isAgainWin) {
        fadeAudio(bgMusicRef.current, 0.1, 300);
        if (againSoundRef.current) {
          againSoundRef.current.currentTime = 0;
          againSoundRef.current.play();
        }
        setTimeout(() => fadeAudio(bgMusicRef.current, 0.5, 1500), 2000);
      } else {
        fadeAudio(bgMusicRef.current, 0.1, 300);
        if (successSoundRef.current) {
          successSoundRef.current.currentTime = 0;
          successSoundRef.current.play();
        }
        setTimeout(() => fadeAudio(bgMusicRef.current, 0.5, 1500), 2000);
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

  const segmentDegree = 360 / prizes.length;
  const conicGradient = prizes
    .map((_, i) => {
      let color = i % 2 === 0 ? "#6296CE" : "#1B2341";
      if (prizes.length % 2 !== 0 && i === prizes.length - 1) color = "#3A5A80";
      return `${color} ${i * segmentDegree}deg ${(i + 1) * segmentDegree}deg`;
    })
    .join(", ");

  return (
    <div className="relative flex flex-col items-center justify-between h-screen w-screen bg-[#0A0F1C] overflow-hidden font-sans">
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

      {/* Fondos Decorativos */}
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

      {/* HEADER COMPONENT */}
      <Header
        isMusicMuted={isMusicMuted}
        toggleMusicMute={toggleMusicMute}
        showSettings={showSettings}
        setShowSettings={setShowSettings}
      />

      {/* SETTINGS MODAL COMPONENT */}
      {showSettings && (
        <SettingsModal
          prizesInput={prizesInput}
          setPrizesInput={setPrizesInput}
          confettiInput={confettiInput}
          setConfettiInput={setConfettiInput}
          handleSavePrizes={handleSavePrizes}
        />
      )}

      {/* SECCIÓN CENTRAL: RULETA PROTAGONISTA */}
      <div className="z-10 flex-1 w-full flex items-center justify-center relative px-4 overflow-hidden">
        {/* flex-shrink-0 y aspect-square EVITAN QUE LA RULETA SEA UN HUEVO EN MÓVIL */}
        <div
          className="relative flex items-center justify-center flex-shrink-0 aspect-square rounded-full"
          style={{ width: "min(90vw, 65vh)", height: "min(90vw, 65vh)" }}
        >
          {/* Puntero Superior */}
          <div className="absolute -top-4 md:-top-6 left-1/2 transform -translate-x-1/2 z-30 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
            <div
              className="w-8 h-10 md:w-12 md:h-14 bg-gradient-to-b from-white to-[#6296CE]"
              style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
            ></div>
          </div>

          {/* Círculo Giratorio: Sin halo de fondo, sin borde grueso feo, solo sombra elegante */}
          <div
            className="w-full h-full rounded-full border border-white/10 shadow-[0_15px_50px_rgba(0,0,0,0.6)] relative overflow-hidden transition-transform duration-[6000ms] ease-[cubic-bezier(0.2,0.1,0.1,1)] z-10"
            style={{
              background: `conic-gradient(${conicGradient})`,
              transform: `rotate(${rotation}deg)`,
            }}
          >
            {prizes.map((prize, i) => {
              const angle = i * segmentDegree + segmentDegree / 2;
              return (
                <div
                  key={i}
                  className="absolute top-1/2 left-1/2 origin-left flex items-center justify-end"
                  style={{
                    transform: `translateY(-50%) rotate(${angle - 90}deg)`,
                    width: "48%",
                    paddingRight: "4%",
                    paddingLeft: "18%",
                  }}
                >
                  <span
                    className="block text-right text-white font-medium tracking-wide text-xs sm:text-sm md:text-base lg:text-lg w-full leading-tight"
                    style={{ textShadow: "0px 2px 4px rgba(0,0,0,0.4)" }}
                  >
                    {prize}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Eje Central Logo */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-[16%] h-[16%] bg-white rounded-full border-2 md:border-4 border-[#6296CE] shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
            <img
              src="/logo.png"
              alt="Qualisophy Logo"
              className="w-[100%] h-[100%] object-contain object-center"
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: BOTÓN DE GIRAR */}
      <div className="z-10 w-full max-w-[300px] md:max-w-md h-24 flex items-center justify-center pb-8 px-4">
        {!winner && (
          <button
            id="btn-spin"
            onClick={spinWheel}
            disabled={isSpinning || !audioStarted}
            className={`w-full py-4 rounded-2xl font-bold text-xl md:text-2xl transition-all border border-white/20 shadow-xl
              ${isSpinning || !audioStarted ? "bg-white/5 text-white/50 backdrop-blur-md cursor-not-allowed" : "bg-white/10 text-white backdrop-blur-xl hover:bg-white/20 shadow-[0_0_20px_rgba(98,150,206,0.3)] hover:shadow-[0_0_30px_rgba(98,150,206,0.5)] active:scale-95"}`}
          >
            {isSpinning ? "GIRANDO..." : "¡TIRAR!"}
          </button>
        )}
      </div>

      {/* MODAL DE PREMIO */}
      <PrizeModal winner={winner} resetWheel={resetWheel} />
    </div>
  );
}
