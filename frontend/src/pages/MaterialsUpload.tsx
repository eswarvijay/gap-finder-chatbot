import React, { useState, useEffect } from 'react';
import {
  UploadCloud,
  FileText,
  BookOpen,
  FileQuestion,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Inbox
} from 'lucide-react';
import { apiClient } from '../api/client';
import { StudyMaterial, Student } from '../types';

interface MaterialsUploadProps {
  student: Student;
  currentSubject: string;
  onMaterialsLoaded: () => void;
  onNavigateNext: () => void;
}

export const MaterialsUpload: React.FC<MaterialsUploadProps> = ({
  student,
  currentSubject,
  onMaterialsLoaded,
  onNavigateNext,
}) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<'syllabus' | 'notes' | 'past_paper'>('notes');
  const [uploadMode, setUploadMode] = useState<'file' | 'text'>('file');
  const [textContent, setTextContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchMaterials();
  }, [student.id]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const data = await apiClient.getMaterials(student.id);
      setMaterials(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setStatusMessage({ text: 'Please enter a title for the material.', type: 'error' });
      return;
    }

    setUploading(true);
    setStatusMessage(null);

    try {
      if (uploadMode === 'file') {
        if (!selectedFile) {
          setStatusMessage({ text: 'Please select a PDF or text file to upload.', type: 'error' });
          setUploading(false);
          return;
        }
        await apiClient.uploadMaterialFile(student.id, title, materialType, selectedFile);
      } else {
        if (!textContent.trim()) {
          setStatusMessage({ text: 'Please paste or type study material text.', type: 'error' });
          setUploading(false);
          return;
        }
        await apiClient.uploadMaterialText(student.id, title, materialType, textContent);
      }

      setStatusMessage({ text: `Successfully indexed '${title}'!`, type: 'success' });
      setTitle('');
      setTextContent('');
      setSelectedFile(null);
      await fetchMaterials();
      onMaterialsLoaded();
    } catch (err: any) {
      setStatusMessage({ text: err.response?.data?.detail || 'Upload failed.', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const getBadgeForType = (type: string) => {
    switch (type) {
      case 'syllabus':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Syllabus</span>;
      case 'notes':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"><FileText className="w-3 h-3" /> Notes / Textbook</span>;
      case 'past_paper':
        return <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1"><FileQuestion className="w-3 h-3" /> Past Exam Paper</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Upload Study Materials & Syllabus
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Upload your official syllabus, textbook chapter PDFs, lecture notes, or past question papers.
          GapFinder AI will index them into searchable RAG chunks to diagnose your blindspots with verifiable citations.
        </p>
      </div>

      {/* Status Alert */}
      {statusMessage && (
        <div className={`p-4 rounded-xl border flex items-center space-x-3 text-sm ${
          statusMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
        }`}>
          {statusMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Grid: Upload Form + Materials Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Upload Form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              Upload New Document
            </h2>
            <div className="flex space-x-1 p-0.5 rounded-lg bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  uploadMode === 'file' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                File (PDF/TXT)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('text')}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  uploadMode === 'text' ? 'bg-emerald-500/20 text-emerald-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          <form onSubmit={handleCustomUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={`e.g. ${currentSubject} Unit 1 Notes`}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Material Classification</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'notes', label: 'Notes/Textbook', icon: FileText },
                  { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
                  { id: 'past_paper', label: 'Past Paper', icon: FileQuestion },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMaterialType(item.id as any)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      materialType === item.id
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mb-1" />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {uploadMode === 'file' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select PDF or Text File</label>
                <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-xl p-4 text-center cursor-pointer bg-slate-950/60 transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={(e) => {
                      const f = e.target.files ? e.target.files[0] : null;
                      setSelectedFile(f);
                      if (f && !title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
                    }}
                    className="block w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-emerald-400 hover:file:bg-slate-700"
                  />
                  {selectedFile && (
                    <p className="mt-2 text-xs text-emerald-400 font-mono">Selected: {selectedFile.name}</p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Paste Raw Content</label>
                <textarea
                  rows={5}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste syllabus topics, notes, formulas, or past questions here..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>{uploading ? 'Parsing & Indexing Chunks...' : 'Ingest & Index Document'}</span>
            </button>
          </form>
        </div>

        {/* Right: Ingested Materials List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-base font-bold text-white">Indexed Course Documents</h2>
                <p className="text-xs text-slate-400">Total documents indexed in knowledge store</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-bold font-mono">
                {materials.length} Documents
              </span>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                <p className="text-xs">Loading indexed documents...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="py-12 text-center space-y-3 bg-slate-950/40 rounded-xl border border-slate-800 p-6">
                <Inbox className="w-10 h-10 text-slate-600 mx-auto" />
                <h3 className="text-sm font-semibold text-slate-300">No Documents Uploaded Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Upload your syllabus or chapter notes using the form on the left to begin your diagnosis.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[420px] overflow-y-auto">
                {materials.map((mat) => (
                  <div
                    key={mat.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-white">{mat.title}</span>
                        {getBadgeForType(mat.material_type)}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                        <span>Source: {mat.source_filename || 'Text Entry'}</span>
                        <span>•</span>
                        <span className="text-emerald-400 font-mono font-medium">{mat.chunk_count} RAG Chunks</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1 text-emerald-400 text-xs font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Indexed</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {materials.length > 0 && (
            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={onNavigateNext}
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                <span>Step 2: Generate Topic Map</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
