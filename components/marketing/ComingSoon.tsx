const ROADMAP = [
  {
    status: "Shipped",
    statusClasses: "text-emerald-800 border-emerald-200 bg-emerald-50",
    items: [
      {
        title: "Public sharing links",
        body: "Turn any CV or document into a link. Send it to a recruiter or client. No login required on their end. Revoke any time.",
      },
      {
        title: "Sign in with LinkedIn",
        body: "Create an account in one click with your LinkedIn profile. No password to remember.",
      },
      {
        title: "Search across documents",
        body: "Find any CV or document by title in two keystrokes. Live filtering as you type.",
      },
      {
        title: "Invoice template",
        body: "A client-ready layout with line items, totals, and payment details. Available in the document editor.",
      },
      {
        title: "Install as an app",
        body: "Add myDoc to your home screen on iOS, Android, or desktop. Push notifications built in.",
      },
      {
        title: "PDF to Word (beta)",
        body: "Upload a PDF and download an editable Word document. Runs entirely in your browser.",
      },
    ],
  },
  {
    status: "In development",
    statusClasses: "text-green-800 border-green-200 bg-green-50",
    items: [
      {
        title: "Job search built into myDoc",
        body: "Search remote and global jobs without leaving the app. Paste any listing straight into the tailoring flow.",
      },
      {
        title: "Application tracker",
        body: "Track every CV you have tailored. Mark status as Applied, Interviewing, Offer, or Rejected. Set reminders for follow-ups.",
      },
    ],
  },
  {
    status: "Planned",
    statusClasses: "text-rust border-orange-200 bg-orange-50",
    items: [
      {
        title: "LinkedIn profile import",
        body: "Pull your full experience and skills from a LinkedIn data export. No manual entry.",
      },
      {
        title: "More templates",
        body: "Creative, academic, and technical layouts. Cover letters and proposals.",
      },
      {
        title: "DOCX export",
        body: "Download any myDoc document as an editable Word file.",
      },
    ],
  },
  {
    status: "Exploring",
    statusClasses: "text-stone-700 border-stone-300 bg-stone-100",
    items: [
      {
        title: "Cover letter generator",
        body: "Tailored cover letters using the same ethics as our CV tailoring. No fabrication.",
      },
      {
        title: "Interview prep",
        body: "Practice questions generated from your CV and the job description.",
      },
      {
        title: "Team accounts",
        body: "For career coaches and university career centers managing multiple CVs.",
      },
    ],
  },
];

export default function ComingSoon() {
  return (
    <section id="roadmap" className="border-b border-stone-200 bg-white">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Roadmap
          </p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
            What we have shipped, and what is next
          </h2>
          <p className="mt-6 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
            An honest look at what is live today, what we are actively
            building, and what we are still exploring. No fake promises, no
            vaporware.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {ROADMAP.map((group) => (
            <div key={group.status}>
              <div className="flex items-center gap-3">
                <span
                  className={`border px-2.5 py-1 text-xs font-bold uppercase tracking-wider ${group.statusClasses}`}
                >
                  {group.status}
                </span>
                <span className="text-xs text-stone-400">
                  {group.items.length}{" "}
                  {group.items.length === 1 ? "feature" : "features"}
                </span>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((item) => (
                  <div
                    key={item.title}
                    className="border border-stone-200 bg-paper p-5"
                  >
                    <h3 className="font-display text-base font-bold tracking-tightish text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-7 text-stone-600">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}