import { FileUp, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import Alert from "../components/Alert";
import DocumentTable from "../components/DocumentTable";
import LoadingButton from "../components/LoadingButton";
import PageHeader from "../components/PageHeader";
import {
  getDocuments,
  getErrorMessage,
  indexDocument,
  uploadDocument,
} from "../services/api";

export default function UploadDocument() {
  const [form, setForm] = useState({
    title: "",
    company_name: "",
    document_type: "Annual Report",
    file: null,
  });
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [indexingId, setIndexingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadDocuments() {
    setListLoading(true);
    try {
      setDocuments(await getDocuments());
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setListLoading(false);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    if (!form.file) {
      setError("Please select a PDF file.");
      setLoading(false);
      return;
    }

    try {
      const document = await uploadDocument(form);
      setMessage(`Uploaded ${document.title} successfully.`);
      setForm({ title: "", company_name: "", document_type: "Annual Report", file: null });
      event.target.reset();
      await loadDocuments();
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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Documents"
        title="Upload financial PDFs"
        description="Add source documents to SQLite, then index them for semantic retrieval."
      />

      <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
        <form className="panel space-y-4 p-5" onSubmit={handleUpload}>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-teal-400/15 text-teal-200">
              <FileUp className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-white">Document metadata</h2>
              <p className="text-xs text-slate-400">Only PDF uploads are accepted.</p>
            </div>
          </div>

          <Alert type="success" message={message} />
          <Alert message={error} />

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Title</span>
            <input
              className="input"
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Company name</span>
            <input
              className="input"
              value={form.company_name}
              onChange={(event) => setForm({ ...form, company_name: event.target.value })}
              required
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">Document type</span>
            <select
              className="input"
              value={form.document_type}
              onChange={(event) => setForm({ ...form, document_type: event.target.value })}
            >
              <option>Annual Report</option>
              <option>Balance Sheet</option>
              <option>Audit Report</option>
              <option>Cash Flow Statement</option>
              <option>Financial Statement</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">PDF file</span>
            <input
              className="input file:mr-3 file:rounded-md file:border-0 file:bg-teal-400 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950"
              type="file"
              accept="application/pdf,.pdf"
              onChange={(event) => setForm({ ...form, file: event.target.files[0] })}
              required
            />
          </label>
          <LoadingButton loading={loading} className="btn-primary w-full">
            Upload Document
          </LoadingButton>
        </form>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Uploaded documents</h2>
            <button className="btn-secondary" onClick={loadDocuments}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
          {listLoading ? (
            <div className="panel p-8 text-center text-slate-400">Loading documents...</div>
          ) : (
            <DocumentTable documents={documents} indexingId={indexingId} onIndex={handleIndex} />
          )}
        </section>
      </div>
    </div>
  );
}
