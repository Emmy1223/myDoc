"use client";

import { useEffect, useState } from "react";
import {
  Check,
  RotateCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  templates,
  type Density,
  type TemplateId,
} from "@/lib/cv-data";

type PageSize = "A4" | "Letter";

type WorkspaceSettings = {
  displayName: string;
  defaultTemplate: TemplateId;
  pageSize: PageSize;
  density: Density;
  showGuides: boolean;
  autoSave: boolean;
};

const storageKey = "mydoc-workspace-settings";

const defaultSettings: WorkspaceSettings = {
  displayName: "",
  defaultTemplate: "folio",
  pageSize: "A4",
  density: "normal",
  showGuides: false,
  autoSave: true,
};

export default function SettingsClient() {
  const [settings, setSettings] = useState<WorkspaceSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      setSettings({
        ...defaultSettings,
        ...JSON.parse(stored),
      });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  function update<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K],
  ) {
    setSaved(false);
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
    setSaved(true);
  }

  function resetSettings() {
    setSettings(defaultSettings);
    window.localStorage.removeItem(storageKey);
    setSaved(true);
  }

  function clearLocalData() {
    window.localStorage.clear();
    setSettings(defaultSettings);
    setSaved(true);
  }

  return (
    <form
      className="space-y-8"
      onSubmit={(event) => {
        event.preventDefault();
        saveSettings();
      }}
    >
      <section className="border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Workspace
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tightish text-ink">
            Your details
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-stone-600">
            Add a display name if you want one associated with this browser workspace.
          </p>
        </div>
        <div className="grid gap-6 px-6 py-6 md:grid-cols-[0.4fr_0.6fr]">
          <div>
            <p className="text-sm font-semibold text-ink">Local workspace</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">
              No account is connected. Your preferences stay on this device until you clear them.
            </p>
          </div>
          <div>
            <label
              htmlFor="display-name"
              className="text-sm font-semibold text-ink"
            >
              Display name <span className="font-normal text-stone-400">(optional)</span>
            </label>
            <input
              id="display-name"
              type="text"
              value={settings.displayName}
              onChange={(event) => update("displayName", event.target.value)}
              placeholder="Add your name"
              className="mt-2 w-full border border-stone-300 bg-paper px-3 py-2.5 text-sm text-ink placeholder:text-stone-400 focus:border-rust focus:outline-none"
            />
            <p className="mt-2 text-xs leading-5 text-stone-500">
              This is optional and is not shown in the navigation by default.
            </p>
          </div>
        </div>
      </section>

      <section className="border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            New documents
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tightish text-ink">
            Document defaults
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-stone-600">
            Choose the starting layout for every new document. You can still change these options in the builder.
          </p>
        </div>
        <div className="space-y-7 px-6 py-6">
          <div>
            <p className="text-sm font-semibold text-ink">Default template</p>
            <div className="mt-3 divide-y divide-stone-200 border border-stone-200">
              {templates.map((template) => {
                const selected = settings.defaultTemplate === template.id;
                return (
                  <button
                    key={template.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update("defaultTemplate", template.id)}
                    className={`flex w-full items-start gap-4 px-4 py-4 text-left hover:bg-stone-50 ${
                      selected ? "bg-orange-50" : "bg-white"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border ${
                        selected
                          ? "border-rust bg-rust text-white"
                          : "border-stone-300 bg-white"
                      }`}
                    >
                      {selected && <Check className="h-3 w-3" strokeWidth={2.5} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        {template.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-5 text-stone-500">
                        {template.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <ChoiceGroup<PageSize>
              label="Page size"
              value={settings.pageSize}
              options={[
                ["A4", "A4"],
                ["Letter", "US Letter"],
              ]}
              onChange={(value) => update("pageSize", value)}
            />
            <ChoiceGroup<Density>
              label="Content density"
              value={settings.density}
              options={[
                ["compact", "Compact"],
                ["normal", "Normal"],
                ["roomy", "Roomy"],
              ]}
              onChange={(value) => update("density", value)}
            />
          </div>
        </div>
      </section>

      <section className="border border-stone-200 bg-white">
        <div className="border-b border-stone-200 px-6 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-rust">
            Editor
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tightish text-ink">
            Preferences
          </h2>
          <p className="mt-1 max-w-xl text-sm leading-6 text-stone-600">
            Set how the document builder behaves while you work.
          </p>
        </div>
        <div className="divide-y divide-stone-200 px-6">
          <ToggleRow
            label="Auto-save while editing"
            hint="Keep changes saved to this browser as you type."
            checked={settings.autoSave}
            onChange={(value) => update("autoSave", value)}
          />
          <ToggleRow
            label="Show page guides"
            hint="Display margin guides around the document preview."
            checked={settings.showGuides}
            onChange={(value) => update("showGuides", value)}
          />
        </div>
      </section>

      <section className="border border-stone-200 bg-stone-100 px-6 py-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-rust" strokeWidth={1.75} />
          <div>
            <h2 className="font-display text-base font-bold tracking-tightish text-ink">
              Privacy and local data
            </h2>
            <button
              type="button"
              onClick={clearLocalData}
              className="mt-4 inline-flex items-center gap-2 border border-stone-300 bg-white px-3 py-2 text-xs font-semibold text-ink hover:border-rust hover:text-rust"
            >
              <Trash2 className="h-3.5 w-3.5" strokeWidth={1.9} />
              Clear local data
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-stone-200 pt-5">
        <button
          type="button"
          onClick={resetSettings}
          className="inline-flex items-center gap-2 px-1 py-2 text-sm font-semibold text-stone-600 hover:text-ink"
        >
          <RotateCcw className="h-4 w-4" strokeWidth={1.9} />
          Reset defaults
        </button>
        <div className="flex items-center gap-4">
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-sm text-stone-600" role="status">
              <Check className="h-4 w-4 text-rust" strokeWidth={2.25} />
              Saved to this device
            </span>
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-rust px-5 py-2.5 text-sm font-semibold text-white hover:bg-rust-dark"
          >
            <Save className="h-4 w-4" strokeWidth={2} />
            Save changes
          </button>
        </div>
      </div>
    </form>
  );
}

function ChoiceGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly [T, string][];
  onChange: (value: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map(([option, optionLabel]) => {
          const selected = option === value;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(option)}
              className={`border px-3 py-2 text-sm font-semibold ${
                selected
                  ? "border-rust bg-orange-50 text-rust"
                  : "border-stone-300 bg-white text-stone-700 hover:border-stone-900"
              }`}
            >
              {optionLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-6 py-4">
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        <p className="mt-0.5 text-xs leading-5 text-stone-500">{hint}</p>
      </div>
      <button
        type="button"
        aria-label={`${label}: ${checked ? "on" : "off"}`}
        aria-pressed={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-5 w-9 shrink-0 border ${
          checked ? "border-rust bg-rust" : "border-stone-300 bg-white"
        }`}
      >
        <span
          className={`absolute top-0.5 h-3.5 w-3.5 border border-stone-300 bg-white ${
            checked ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}
