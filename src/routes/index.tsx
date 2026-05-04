import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { Search, Sparkles, ArrowUpRight, Loader2 } from "lucide-react";
import { searchWeb, type SearchResponse } from "@/server/search.functions";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Lumen — Search the web, beautifully" },
      {
        name: "description",
        content:
          "A fast, modern search experience powered by Tavily. AI-summarized answers with sources.",
      },
    ],
  }),
});

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

function Index() {
  const search = useServerFn(searchWeb);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SearchResponse | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (!q || loading) return;
    setLoading(true);
    try {
      const res = await search({ data: { query: q } });
      setData(res);
    } finally {
      setLoading(false);
    }
  }

  const hasResults = data && (data.results.length > 0 || data.answer);

  return (
    <main className="relative min-h-screen px-6">
      <header className="mx-auto flex max-w-5xl items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_20px_oklch(0.88_0.22_130/0.45)]">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Lumen
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          powered by Tavily
        </span>
      </header>

      <section
        className={`mx-auto max-w-3xl transition-all duration-500 ${
          hasResults ? "pt-4" : "pt-24 sm:pt-32"
        }`}
      >
        {!hasResults && (
          <div className="mb-10 text-center">
            <h1 className="font-display text-5xl font-semibold tracking-tight sm:text-6xl">
              Search the web,
              <span className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                gracefully.
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
              Ask anything. Get a clean answer with real sources — no clutter, no chaos.
            </p>
          </div>
        )}

        <form onSubmit={onSubmit} className="group relative">
          <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-primary/30 via-accent/30 to-primary/30 opacity-0 blur-xl transition group-focus-within:opacity-100" />
          <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-5 py-4 shadow-[0_10px_40px_-15px_oklch(0_0_0/0.6)] backdrop-blur-md transition focus-within:border-primary/60">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to know?"
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {!hasResults && !loading && (
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "Latest in AI research",
              "Best espresso machines 2026",
              "How does nuclear fusion work?",
              "Top hikes near Lisbon",
            ].map((s) => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-10 max-w-3xl pb-24">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Searching the web…
          </div>
        )}

        {data?.error && !loading && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive-foreground">
            {data.error}
          </div>
        )}

        {data?.answer && !loading && (
          <article className="relative overflow-hidden rounded-2xl border border-border bg-card/70 p-6 backdrop-blur-md">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />
            <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              AI Summary
            </div>
            <p className="text-base leading-relaxed text-foreground/90">
              {data.answer}
            </p>
          </article>
        )}

        {data && data.results.length > 0 && !loading && (
          <ul className="mt-6 space-y-3">
            {data.results.map((r, i) => (
              <li key={r.url + i}>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block rounded-xl border border-border bg-card/50 p-4 transition hover:border-primary/40 hover:bg-card"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate text-xs text-muted-foreground">
                      {hostOf(r.url)}
                    </span>
                    <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                  <h3 className="mt-1 font-display text-lg font-medium leading-snug tracking-tight group-hover:text-primary">
                    {r.title}
                  </h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {r.content}
                  </p>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
