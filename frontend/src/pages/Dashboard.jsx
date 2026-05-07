import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  FileText,
  Download,
  MessageSquare,
  Trash2,
  Search,
  Menu,
  X,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader as LoaderIcon,
} from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Skeleton from '../components/common/Skeleton';
import Modal from '../components/common/Modal';

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [targetLanguage, setTargetLanguage] = useState('Hindi');
  const [docType, setDocType] = useState('legal');
  const [loading, setLoading] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [history, setHistory] = useState([]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rateLimitCountdown, setRateLimitCountdown] = useState(null);
  const [copiedText, setCopiedText] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);

  const navigate = useNavigate();
  const { user, quota, fetchQuota } = useAuth();
  const { addToast } = useToast();
  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, [currentPage, searchTerm]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/documents/history', {
        params: { page: currentPage, limit: 10, search: searchTerm }
      });
      setHistory(res.data.documents);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      if (error.status === 401) navigate('/login');
      addToast('Failed to load history', 'error');
    }
  };

  const loadDocumentFromHistory = async (doc) => {
    setActiveDoc(doc);
    setChatHistory([]);
    setMobileMenuOpen(false);
    try {
      const res = await api.get(`/documents/${doc._id}/chat`);
      setChatHistory(res.data.messages || []);
    } catch (error) {
      console.error('Could not load chat history');
    }
  };

  const deleteDocument = async () => {
    if (!documentToDelete) return;
    try {
      await api.delete(`/documents/${documentToDelete._id}`);
      addToast('Document deleted successfully', 'success');
      fetchHistory();
      if (activeDoc?._id === documentToDelete._id) {
        setActiveDoc(null);
        setChatHistory([]);
      }
    } catch (error) {
      addToast('Failed to delete document', 'error');
    } finally {
      setDeleteModalOpen(false);
      setDocumentToDelete(null);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      addToast('Please select a file', 'warning');
      return;
    }

    if (quota.remaining <= 0) {
      addToast('Document limit reached. Cannot process new documents.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetLanguage', targetLanguage);
    formData.append('docType', docType);

    setLoading(true);
    try {
      const res = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Upload progress: ${percentCompleted}%`);
        },
      });
      setActiveDoc(res.data);
      setChatHistory([]);
      await fetchHistory();
      await fetchQuota();
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      addToast('Document processed successfully!', 'success');
    } catch (error) {
      if (error.status === 429 && error.retryAfter) {
        setRateLimitCountdown(error.retryAfter);
        const interval = setInterval(() => {
          setRateLimitCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
        addToast(error.message, 'error');
      } else if (error.status === 403) {
        addToast('Insufficient quota. Please upgrade your plan.', 'error');
      } else {
        addToast('Upload failed. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim() || !activeDoc) return;

    const userMsg = chatMessage;
    setChatMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatLoading(true);

    try {
      const res = await api.post(`/documents/${activeDoc._id}/chat`, { message: userMsg });
      setChatHistory(res.data.messages);
    } catch (error) {
      addToast('Chat failed. Please try again.', 'error');
      setChatHistory(prev => prev.filter(msg => msg.content !== userMsg));
    } finally {
      setChatLoading(false);
    }
  };

  const downloadText = () => {
    if (!activeDoc) return;
    const element = document.createElement('a');
    const fileBlob = new Blob([activeDoc.simplifiedText], { type: 'text/plain' });
    element.href = URL.createObjectURL(fileBlob);
    element.download = `MDS_${activeDoc.docType}_${activeDoc.outputLanguage}.txt`;
    element.click();
    URL.revokeObjectURL(element.href);
    addToast('Document downloaded', 'success');
  };

  const copyToClipboard = async () => {
    if (!activeDoc) return;
    await navigator.clipboard.writeText(activeDoc.simplifiedText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
    addToast('Copied to clipboard!', 'success');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* The header has been removed because Layout.jsx already provides it */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className={`${
            mobileMenuOpen ? 'fixed inset-0 z-30 bg-white w-72' : 'hidden lg:block w-72'
          } lg:relative lg:bg-transparent transition-all duration-300`}>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 h-full">
              <div className="space-y-4">
                <button
                  onClick={() => {
                    setActiveDoc(null);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-lg font-medium transition shadow-sm"
                >
                  <Plus size={18} /> New Document
                </button>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2 max-h-[calc(100vh-280px)] overflow-y-auto">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Your Documents</p>
                  {history.length === 0 ? (
                    <p className="text-sm text-gray-400 italic text-center py-8">No documents yet</p>
                  ) : (
                    history.map((doc) => (
                      <div key={doc._id} className="group relative">
                        <button
                          onClick={() => loadDocumentFromHistory(doc)}
                          className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                            activeDoc?._id === doc._id
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          <FileText size={16} className="flex-shrink-0" />
                          <span className="flex-1 truncate">
                            {doc.docType} ({doc.outputLanguage})
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(doc.createdAt).toLocaleDateString()}
                          </span>
                        </button>
                        <button
                          onClick={() => {
                            setDocumentToDelete(doc);
                            setDeleteModalOpen(true);
                          }}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 rounded transition-all"
                        >
                          <Trash2 size={14} className="text-red-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="flex justify-between items-center pt-4 border-t">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-1 disabled:opacity-50"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <span className="text-sm text-gray-600">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-1 disabled:opacity-50"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {!activeDoc ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Upload Document</h2>
                <p className="text-gray-500 mb-6">Convert complex documents into simple, easy-to-understand text</p>

                <form onSubmit={handleUpload} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Upload PDF</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition cursor-pointer"
                         onClick={() => fileInputRef.current?.click()}>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={e => setFile(e.target.files[0])}
                        className="hidden"
                      />
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        {file ? file.name : 'Click or drag PDF file to upload'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">PDF only, max 10MB</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Document Type</label>
                      <select
                        value={docType}
                        onChange={e => setDocType(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="legal">Legal Contract</option>
                        <option value="medical">Medical Report</option>
                        <option value="government">Government Notice</option>
                        <option value="general">General Document</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Target Language</label>
                      <select
                        value={targetLanguage}
                        onChange={e => setTargetLanguage(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Hindi">Hindi</option>
                        <option value="Spanish">Spanish</option>
                        <option value="French">French</option>
                        <option value="Bengali">Bengali</option>
                        <option value="English">Simple English</option>
                      </select>
                    </div>
                  </div>

                  {rateLimitCountdown && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-center gap-2">
                      <AlertCircle size={18} className="text-yellow-600" />
                      <span className="text-sm text-yellow-700">
                        Rate limit active. Try again in {rateLimitCountdown}s
                      </span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || rateLimitCountdown !== null || quota.remaining <= 0}
                    className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                  >
                    {loading && <LoaderIcon size={18} className="animate-spin" />}
                    {loading ? 'Processing Document...' : 
                     quota.remaining <= 0 ? 'No Credits Remaining' : 
                     rateLimitCountdown ? 'Rate Limited' : 'Simplify & Translate'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Document View */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-120px)]">
                  <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900">Simplified Document</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={copyToClipboard}
                        className="p-1.5 hover:bg-gray-200 rounded transition"
                        title="Copy to clipboard"
                      >
                        {copiedText ? <Check size={18} className="text-green-600" /> : <Copy size={18} />}
                      </button>
                      <button
                        onClick={downloadText}
                        className="p-1.5 hover:bg-gray-200 rounded transition"
                        title="Download"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4">
                    <div className="bg-gray-50 p-4 rounded-lg whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">
                      {activeDoc.simplifiedText}
                    </div>
                  </div>
                  {activeDoc.flaggedClauses?.length > 0 && (
                    <div className="border-t p-4 bg-red-50">
                      <h4 className="font-semibold text-red-800 flex items-center gap-2 mb-3">
                        <AlertCircle size={16} /> Risk Analysis ({activeDoc.flaggedClauses.length} flags)
                      </h4>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {activeDoc.flaggedClauses.map((clause, idx) => (
                          <div key={idx} className="text-sm border-l-2 border-red-400 pl-3">
                            <p className="text-gray-600 line-through text-xs">{clause.originalClause}</p>
                            <p className="text-red-700 mt-1">{clause.simplifiedExplanation}</p>
                            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                              clause.riskLevel === 'high' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
                            }`}>
                              {clause.riskLevel} risk
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Interface */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-120px)]">
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare size={18} /> Document Assistant
                    </h3>
                    <p className="text-xs text-gray-500">Ask questions about this document</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatHistory.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <MessageSquare size={40} className="mb-3 opacity-50" />
                        <p className="text-sm text-center">Ask me anything about this document</p>
                        <p className="text-xs text-center mt-1">E.g., "Summarize the main points"</p>
                      </div>
                    ) : (
                      chatHistory.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white rounded-br-sm'
                              : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                          }`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-2">
                          <div className="flex gap-1">
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleChatSubmit} className="p-4 border-t">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Ask a question..."
                        value={chatMessage}
                        onChange={e => setChatMessage(e.target.value)}
                        className="flex-1 border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={chatLoading}
                      />
                      <button
                        type="submit"
                        disabled={chatLoading || !chatMessage.trim()}
                        className="bg-blue-600 text-white px-5 rounded-full hover:bg-blue-700 disabled:opacity-50 transition"
                      >
                        Send
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={deleteDocument}
        title="Delete Document"
        message="Are you sure you want to delete this document? This action cannot be undone."
      />
    </div>
  );
}