import { Database, FileText } from "lucide-react";

import LoadingButton from "./LoadingButton";

export default function DocumentTable({ documents, indexingId, onIndex }) {
  if (!documents.length) {
    return (
      <div className="panel grid place-items-center px-6 py-14 text-center">
        <FileText className="h-10 w-10 text-slate-500" />
        <h3 className="mt-4 text-lg font-semibold text-white">No documents yet</h3>
        <p className="mt-2 max-w-md text-sm text-slate-400">
          Upload a PDF to start building your searchable financial document library.
        </p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-white/10 bg-white/[0.03] text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">Document</th>
              <th className="px-5 py-3">Company</th>
              <th className="px-5 py-3">Type</th>
              <th className="px-5 py-3">Uploaded</th>
              <th className="px-5 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {documents.map((document) => (
              <tr key={document.id} className="text-slate-300">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-md bg-teal-400/10 text-teal-200">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{document.title}</p>
                      <p className="text-xs text-slate-500">ID #{document.id}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">{document.company_name}</td>
                <td className="px-5 py-4">{document.document_type}</td>
                <td className="px-5 py-4">
                  {new Date(document.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-4 text-right">
                  <LoadingButton
                    loading={indexingId === document.id}
                    className="btn-secondary"
                    onClick={() => onIndex(document.id)}
                  >
                    <Database className="h-4 w-4" />
                    Index
                  </LoadingButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
