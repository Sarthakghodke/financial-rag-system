import { Database, FileText, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Alert from "../components/Alert";
import DocumentTable from "../components/DocumentTable";
import PageHeader from "../components/PageHeader";
import { getDocuments, getErrorMessage, indexDocument } from "../services/api";

export default function Dashboard() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [indexingId, setIndexingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDocuments() {
    setLoading(true);
    setError("");
    try {
      setDocuments(await getDocuments());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleIndex(documentId) {
    setIndexingId(documentId);
    setMessage("");
    setError("");
    try {
      const data = await indexDocument(documentId);
      setMessage(`${data.message}. Chunks indexed: ${data.chunks_indexed}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIndexingId(null);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  const stats = [
    { label: "Documents", value: documents.length, icon: FileText },
    { label: "Vector Store", value: "ChromaDB", icon: Database },
    { label: "Search Mode", value: "Semantic", icon: Search },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Overview"
        title="Financial document dashboard"
        description="Track uploaded PDFs, index them into ChromaDB, and search across financial context with embeddings."
        actions={
          <>
            <button className="btn-secondary" onClick={loadDocuments}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <Link className="btn-primary" to="/upload">
              Upload PDF
            </Link>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div className="panel p-5" key={stat.label}>
              <div className="flex items-center justify-between">
                <p className="text-sm text-slate-400">{stat.label}</p>
                <Icon className="h-5 w-5 text-teal-300" />
              </div>
              <p className="mt-4 text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <Alert type="success" message={message} />
      <Alert message={error} />

      {loading ? (
        <div className="panel p-8 text-center text-slate-400">Loading documents...</div>
      ) : (
        <DocumentTable documents={documents} indexingId={indexingId} onIndex={handleIndex} />
      )}
    </div>
  );
}
