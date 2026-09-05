import Link from "next/link";
import { Upload, FileUp } from "lucide-react";

/** A purely CSS/HTML wireframe of the split-screen builder — no images. */
function BuilderMock() {
  return (
    <div className="border border-stone-300 bg-white">
      {/* top bar */}
      <div className="flex items-center justify-between border-b border-stone-300 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-display text-xs font-extrabold tracking-tightish">
            my<span className="text-rust">Doc</span>
          </span>
        </div>
        <div className="flex gap-1.5">
          <span className="h-2 w-2 border border-stone-300 bg-stone-100" />
          <span className="h-2 w-2 border border-stone-300 bg-stone-100" />
          <span className="h-2 w-2 border border-rust bg-rust" />
        </div>
      </div>

      <div className="flex">
        {/* left input panel */}
        <div className="w-2/5 border-r border-stone-300 bg-stone-50 p-3">
          {/* dropzone */}
          <div className="border border-dashed border-stone-300 bg-white p-3 text-center">
            <FileUp className="mx-auto mb-1.5 h-4 w-4 text-rust" strokeWidth={1.5} />
            <p className="text-[8px] font-semibold leading-tight text-stone-700">
              Drag your old CV here
            </p>
            <p className="mt-0.5 text-[7px] leading-tight text-stone-400">
              PDF or DOCX, up to 10 MB
            </p>
          </div>
          {/* form lines */}
          <div className="mt-3 space-y-2">
            <div className="flex gap-1">
              <span className="flex-1 border-b border-rust pb-0.5 text-[7px] font-bold text-rust">
                Content
              </span>
              <span className="flex-1 border-b border-stone-300 pb-0.5 text-[7px] text-stone-400">
                Templates
              </span>
              <span className="flex-1 border-b border-stone-300 pb-0.5 text-[7px] text-stone-400">
                Settings
              </span>
            </div>
            {[
              { h: "h-2", w: "w-full" },
              { h: "h-2", w: "w-3/4" },
              { h: "h-2", w: "w-full" },
              { h: "h-2", w: "w-5/6" },
            ].map((l, i) => (
              <div
                key={i}
                className={`${l.h} ${l.w} border border-stone-200 bg-stone-100`}
              />
            ))}
            <div className="h-2 w-1/2 bg-rust" />
          </div>
        </div>

        {/* right preview panel */}
        <div className="flex w-3/5 items-center justify-center bg-stone-200 p-4">
          <div className="aspect-[1/1.414] w-3/4 border border-stone-300 bg-white p-2.5">
            <div className="h-2 w-2/3 bg-stone-800" />
            <div className="mt-1 h-1 w-1/3 bg-rust" />
            <div className="mt-2 space-y-1">
              {[10, 12, 11, 8].map((w, i) => (
                <div
                  key={i}
                  className="h-0.5"
                  style={{
                    width: `${w * 6}%`,
                    backgroundColor: i === 2 ? "#D6D3D1" : "#A8A29E",
                  }}
                />
              ))}
            </div>
            <div className="mt-2 h-1 w-1/4 bg-rust" />
            <div className="mt-1 space-y-1">
              {[12, 11, 9].map((w, i) => (
                <div
                  key={i}
                  className="h-0.5"
                  style={{ width: `${w * 6}%`, backgroundColor: "#A8A29E" }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            CV Builder
          </p>
          <h1 className="font-display text-5xl font-extrabold leading-[1.1] tracking-tightish text-ink md:text-6xl">
            Format your CV without the frustration.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-7 text-stone-600">
            Upload your old resume and let our system map your history into a
            clean, professional layout instantly.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/builder?upload=1"
              className="inline-flex items-center gap-2 bg-rust px-6 py-3 text-sm font-semibold text-white hover:bg-rust-dark"
            >
              <Upload className="h-4 w-4" strokeWidth={2} />
              Upload existing CV
            </Link>
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 border border-stone-300 bg-white px-6 py-3 text-sm font-semibold text-ink hover:border-ink"
            >
              Start from scratch
            </Link>
          </div>
        </div>

        <div className="mx-auto mt-16 max-w-4xl">
          <BuilderMock />
          <p className="mt-4 text-center text-xs uppercase tracking-[0.18em] text-stone-500">
            The editor — content on the left, live preview on the right
          </p>
        </div>
      </div>
    </section>
  );
}
