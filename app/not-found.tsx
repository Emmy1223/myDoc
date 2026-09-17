import Link from "next/link";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1c1c1e] px-6">
      {/* siren spillover */}
      <div className="pointer-events-none absolute inset-0 z-0 animate-[sirenWash_1s_ease-in-out_infinite]" />

      {/* police siren */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center gap-3 pt-6">
        <div className="h-2.5 w-32 rounded-full bg-red-600 animate-[sirenRed_1s_ease-in-out_infinite] shadow-[0_0_24px_rgba(220,38,38,0.9)]" />
        <div className="h-2.5 w-32 rounded-full bg-blue-600 animate-[sirenBlue_1s_ease-in-out_infinite] shadow-[0_0_24px_rgba(37,99,235,0.9)]" />
      </div>

      {/* starfield */}
      <div className="pointer-events-none absolute inset-0">
        {STARS.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white animate-[twinkle_3s_ease-in-out_infinite]"
            style={{
              top: s.top,
              left: s.left,
              width: s.size,
              height: s.size,
              animationDelay: s.delay,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* grid backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          maskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />

      {/* radar rings */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <span className="absolute h-[420px] w-[420px] rounded-full border border-[#e85d26]/20 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <span className="absolute h-[300px] w-[300px] rounded-full border border-[#e85d26]/15 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_0.8s]" />
        <span className="absolute h-[180px] w-[180px] rounded-full border border-[#e85d26]/10 animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1.6s]" />
      </div>

      {/* UFO + beam */}
      <div className="pointer-events-none absolute top-[14%] left-0 w-full">
        <div className="animate-[ufo_9s_ease-in-out_infinite] relative mx-auto w-fit">
          {/* beam */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 animate-[beam_2.4s_ease-in-out_infinite]">
            <div
              className="h-32 w-24 origin-top"
              style={{
                background:
                  "linear-gradient(to bottom, rgba(232,93,38,0.55), rgba(232,93,38,0))",
                clipPath: "polygon(35% 0, 65% 0, 100% 100%, 0 100%)",
                filter: "blur(1px)",
              }}
            />
          </div>

          {/* ufo svg */}
          <svg
            width="86"
            height="52"
            viewBox="0 0 86 52"
            fill="none"
            className="animate-[bob_2.4s_ease-in-out_infinite]"
          >
            {/* dome */}
            <path
              d="M28 22 C28 10, 58 10, 58 22 Z"
              fill="#2a2a2e"
              stroke="#e85d26"
              strokeWidth="1.5"
            />
            <path d="M31 21 C33 13, 53 13, 55 21 Z" fill="#e85d26" opacity="0.35" />
            {/* body */}
            <ellipse
              cx="43"
              cy="28"
              rx="34"
              ry="10"
              fill="#141416"
              stroke="#e85d26"
              strokeWidth="1.5"
            />
            {/* lights */}
            <circle cx="20" cy="29" r="2.2" fill="#e85d26" className="animate-[blink_1.4s_ease-in-out_infinite]" />
            <circle cx="32" cy="32" r="2.2" fill="#e85d26" className="animate-[blink_1.4s_ease-in-out_infinite_0.3s]" />
            <circle cx="43" cy="33" r="2.2" fill="#e85d26" className="animate-[blink_1.4s_ease-in-out_infinite_0.6s]" />
            <circle cx="54" cy="32" r="2.2" fill="#e85d26" className="animate-[blink_1.4s_ease-in-out_infinite_0.9s]" />
            <circle cx="66" cy="29" r="2.2" fill="#e85d26" className="animate-[blink_1.4s_ease-in-out_infinite_1.2s]" />
          </svg>
        </div>
      </div>

      {/* content */}
      <div className="relative z-10 max-w-md text-center">
        <p className="animate-[fadeUp_0.6s_ease-out_both] text-[11px] font-semibold uppercase tracking-[0.25em] text-[#e85d26]">
          404 — Not Found
        </p>

        <h1 className="mt-4 animate-[fadeUp_0.6s_ease-out_0.1s_both] text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Oops, you&apos;ve travelled too far
        </h1>

        <p className="mt-4 animate-[fadeUp_0.6s_ease-out_0.2s_both] text-base leading-relaxed text-stone-400">
          You crossed Area 51. Don&apos;t worry, we&apos;ll find you a way back home.
        </p>

        <Link
          href="/"
          className="group mt-8 inline-flex animate-[fadeUp_0.6s_ease-out_0.3s_both] items-center justify-center gap-2 rounded-lg bg-[#e85d26] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#d14e1c] hover:scale-[1.03] active:scale-[0.98]"
        >
          <span className="transition-transform group-hover:-translate-x-1">←</span>
          Take me home
        </Link>
      </div>

      {/* keyframes */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes ufo {
          0%   { transform: translateX(-12%) translateY(0)     rotate(-4deg); }
          25%  { transform: translateX(30%)  translateY(-18px)  rotate(3deg);  }
          50%  { transform: translateX(60%)  translateY(0)      rotate(-3deg); }
          75%  { transform: translateX(85%)  translateY(-14px)  rotate(4deg);  }
          100% { transform: translateX(112%) translateY(0)      rotate(-4deg); }
        }
        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-6px); }
        }
        @keyframes beam {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 0.85; }
        }
        @keyframes blink {
          0%, 100% { opacity: 0.35; }
          50%      { opacity: 1; }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50%      { opacity: 0.9; }
        }
        @keyframes sirenRed {
          0%, 45%   { opacity: 1; box-shadow: 0 0 28px rgba(220, 38, 38, 1); }
          50%, 100% { opacity: 0.15; box-shadow: 0 0 4px rgba(220, 38, 38, 0.3); }
        }
        @keyframes sirenBlue {
          0%, 45%   { opacity: 0.15; box-shadow: 0 0 4px rgba(37, 99, 235, 0.3); }
          50%, 100% { opacity: 1; box-shadow: 0 0 28px rgba(37, 99, 235, 1); }
        }
        @keyframes sirenWash {
          0%, 45% {
            background: radial-gradient(circle at 50% 0%, rgba(220,38,38,0.12), transparent 60%);
          }
          50%, 100% {
            background: radial-gradient(circle at 50% 0%, rgba(37,99,235,0.12), transparent 60%);
          }
        }
      `}</style>
    </main>
  );
}

// deterministic star positions so server + client match
const STARS = [
  { top: "8%",  left: "12%", size: 2, delay: "0s" },
  { top: "18%", left: "78%", size: 3, delay: "0.6s" },
  { top: "28%", left: "40%", size: 2, delay: "1.2s" },
  { top: "14%", left: "55%", size: 2, delay: "0.3s" },
  { top: "38%", left: "88%", size: 3, delay: "1.8s" },
  { top: "52%", left: "18%", size: 2, delay: "0.9s" },
  { top: "66%", left: "72%", size: 2, delay: "1.5s" },
  { top: "74%", left: "32%", size: 3, delay: "0.4s" },
  { top: "82%", left: "58%", size: 2, delay: "2.1s" },
  { top: "60%", left: "92%", size: 2, delay: "1.1s" },
  { top: "44%", left: "6%",  size: 3, delay: "0.7s" },
  { top: "88%", left: "84%", size: 2, delay: "1.7s" },
];