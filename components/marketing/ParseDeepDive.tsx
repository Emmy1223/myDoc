import { Check } from "lucide-react";

const FIELDS = [
  "Name, title, email, phone, location, website",
  "Summary or profile",
  "Experience: role, company, dates, bullets",
  "Education: degree, school, dates, details",
  "Skills",
];

export default function ParseDeepDive() {
  return (
    <section className="border-b border-stone-200">
      <div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-start">
          <div className="lg:order-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
              Upload and Parse
            </p>
            <h2 className="mt-4 font-display text-3xl font-extrabold leading-[1.15] tracking-[-0.02em] text-ink md:text-4xl">
              From any CV to structured data in seconds
            </h2>
            <p className="mt-6 text-base leading-8 text-stone-700 md:text-lg md:leading-9">
              We accept PDF and Word documents. Under the hood, we extract the
              text, parse it, and produce structured JSON with the
              fields below.
            </p>

            <ul className="mt-8 space-y-3">
              {FIELDS.map((field) => (
                <li key={field} className="flex gap-3">
                  <Check
                    className="mt-0.5 h-4 w-4 shrink-0 text-rust"
                    strokeWidth={2.5}
                  />
                  <span className="text-sm leading-7 text-stone-700">
                    {field}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-sm leading-7 text-stone-600">
              If the AI call fails, a local fallback parser takes over. You
              always get results.
            </p>
          </div>

          <div className="lg:order-1">
            <div className="border border-stone-200 bg-white p-6">
              <div className="overflow-hidden border border-stone-800 bg-stone-900 p-4 font-mono text-[10px] leading-5 text-stone-100">
                <p className="text-stone-500">{"// Extracted and structured"}</p>
                <p className="mt-2">{"{"}</p>
                <p className="ml-4 text-orange-300">
                  {'"fullName"'}
                  <span className="text-stone-400">: </span>
                  <span className="text-green-300">{'"Jane Doe"'}</span>,
                </p>
                <p className="ml-4 text-orange-300">
                  {'"title"'}
                  <span className="text-stone-400">: </span>
                  <span className="text-green-300">
                    {'"Senior Engineer"'}
                  </span>
                  ,
                </p>
                <p className="ml-4 text-orange-300">
                  {'"email"'}
                  <span className="text-stone-400">: </span>
                  <span className="text-green-300">{'"jane@email.com"'}</span>,
                </p>
                <p className="ml-4 text-orange-300">
                  {'"experience"'}
                  <span className="text-stone-400">: [</span>
                </p>
                <p className="ml-8 text-orange-300">{"{"}</p>
                <p className="ml-12 text-orange-300">
                  {'"role"'}
                  <span className="text-stone-400">: </span>
                  <span className="text-green-300">
                    {'"Senior Engineer"'}
                  </span>
                  ,
                </p>
                <p className="ml-12 text-orange-300">
                  {'"company"'}
                  <span className="text-stone-400">: </span>
                  <span className="text-green-300">{'"Acme Corp"'}</span>,
                </p>
                <p className="ml-12 text-orange-300">
                  {'"bullets"'}
                  <span className="text-stone-400">{": ["}</span>
                  <span className="text-green-300">{'"..."'}</span>
                  <span className="text-stone-400">{"]"}</span>
                </p>
                <p className="ml-8 text-orange-300">{"}"}</p>
                <p className="ml-4 text-orange-300">{"],"}</p>
                <p className="ml-4 text-orange-300">
                  {'"skills"'}
                  <span className="text-stone-400">{": ["}</span>
                  <span className="text-green-300">
                    {'"React", "TypeScript"'}
                  </span>
                  <span className="text-stone-400">{"]"}</span>
                </p>
                <p>{"}"}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}