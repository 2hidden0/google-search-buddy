import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const InputSchema = z.object({
  query: z.string().min(1).max(400),
});

export type SearchResult = {
  title: string;
  url: string;
  content: string;
  score?: number;
};

export type SearchResponse = {
  query: string;
  answer: string | null;
  results: SearchResult[];
  error: string | null;
};

export const searchWeb = createServerFn({ method: "POST" })
  .inputValidator((input) => InputSchema.parse(input))
  .handler(async ({ data }): Promise<SearchResponse> => {
    const apiKey = process.env.TAVILY_API_KEY;
    if (!apiKey) {
      return {
        query: data.query,
        answer: null,
        results: [],
        error: "TAVILY_API_KEY is not configured",
      };
    }

    try {
      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query: data.query,
          search_depth: "basic",
          include_answer: true,
          max_results: 10,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        return {
          query: data.query,
          answer: null,
          results: [],
          error: `Search failed (${res.status}): ${text.slice(0, 200)}`,
        };
      }

      const json = (await res.json()) as {
        answer?: string;
        results?: Array<{ title: string; url: string; content: string; score?: number }>;
      };

      return {
        query: data.query,
        answer: json.answer ?? null,
        results: (json.results ?? []).map((r) => ({
          title: r.title,
          url: r.url,
          content: r.content,
          score: r.score,
        })),
        error: null,
      };
    } catch (err) {
      console.error("Tavily search error:", err);
      return {
        query: data.query,
        answer: null,
        results: [],
        error: "Search service is unavailable",
      };
    }
  });
