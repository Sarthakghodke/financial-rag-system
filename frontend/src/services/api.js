import axios from "axios";

// Vite proxies /api to http://127.0.0.1:8000 during development.
export const API_BASE_URL = "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach the JWT token to every protected API request.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function getErrorMessage(error) {
  return (
    error?.response?.data?.detail ||
    error?.message ||
    "Something went wrong. Please try again."
  );
}

export async function registerUser(payload) {
  const response = await api.post("/auth/register", payload);
  return response.data;
}

export async function loginUser({ username, password }) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await api.post("/auth/login", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
}

export async function uploadDocument(payload) {
  const formData = new FormData();
  formData.append("title", payload.title);
  formData.append("company_name", payload.company_name);
  formData.append("document_type", payload.document_type);
  formData.append("file", payload.file);

  const response = await api.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getDocuments() {
  const response = await api.get("/documents");
  return response.data;
}

export async function indexDocument(documentId) {
  const response = await api.post(`/rag/index-document/${documentId}`);
  return response.data;
}

export async function searchDocuments(query) {
  const response = await api.post("/rag/search", { query });
  return response.data;
}

export default api;
