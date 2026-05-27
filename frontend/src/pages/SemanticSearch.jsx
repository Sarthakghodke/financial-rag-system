import { BrainCircuit, Search } from "lucide-react";
import { useState } from "react";

import Alert from "../components/Alert";
import LoadingButton from "../components/LoadingButton";
import PageHeader from "../components/PageHeader";
import { getErrorMessage, searchDocuments } from "../services/api";

export default function SemanticSearch() {
  const [query, setQuery] = useState("financial risk related to high debt ratio");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSearch(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResults([]);

    try {
      const data = await searchDocuments(query);
      setResults(data.results || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="RAG Search"
        title="Semantic search"
        description="Ask financial questions and retrieve the most relevant chunks from indexed PDFs."
      />

      <form className="panel p-5" onSubmit={handleSearch}>
        <Alert message={error} />
        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-3 h-5 w-5 text-slate-500" />
            <input
              className="input pl-10"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Ask about liquidity, debt, revenue, risk, or audit findings..."
              required
            />
          </div>
          <LoadingButton loading={loading}>
            <BrainCircuit className="h-4 w-4" />
            Search
          </LoadingButton>
        </div>
      </form>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Relevant chunks</h2>
          <p className="text-sm text-slate-400">{results.length} results</p>
        </div>

        {loading && <div className="panel p-8 text-center text-slate-400">Searching vectors...</div>}

        {!loading && !results.length && (
          <div className="panel grid place-items-center px-6 py-14 text-center">
            <BrainCircuit className="h-10 w-10 text-slate-500" />
            <h3 className="mt-4 text-lg font-semibold text-white">No search results yet</h3>
            <p className="mt-2 max-w-lg text-sm text-slate-400">
              Index at least one uploaded document, then search for financial risks,
              performance trends, ratios, or audit observations.
            </p>
          </div>
        )}

        {!loading &&
          results.map((result, index) => (
            <article className="panel p-5" key={`${result.metadata?.document_id}-${index}`}>
              <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">
                    {result.metadata?.title || "Indexed document"}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {result.metadata?.company_name || "Unknown company"} ·{" "}
                    {result.metadata?.document_type || "Document"} · Chunk{" "}
                    {result.metadata?.chunk_index ?? index}
                  </p>
                </div>
                <span className="rounded-md border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-xs font-medium text-teal-200">
                  Distance {Number(result.score || 0).toFixed(4)}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-300">
                {result.chunk}
              </p>
            </article>
          ))}
      </section>
    </div>
  );
}
