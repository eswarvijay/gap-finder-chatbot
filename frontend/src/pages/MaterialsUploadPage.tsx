import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Cpu,
  BookOpen,
  ArrowRight,
  HelpCircle,
  RotateCcw
} from 'lucide-react';
import { apiClient } from '../api/client';
import { Student, StudyMaterial } from '../types';

interface MaterialsUploadPageProps {
  student: Student;
  materials: StudyMaterial[];
  targetSubject: string;
  onMaterialsUpdated: (materials: StudyMaterial[]) => void;
  onStartQuiz: (subject: string) => void;
}

export const MaterialsUploadPage: React.FC<MaterialsUploadPageProps> = ({
  student,
  materials,
  targetSubject,
  onMaterialsUpdated,
  onStartQuiz,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [materialType, setMaterialType] = useState<'notes' | 'syllabus' | 'past_paper'>('notes');
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const steps = [
    '1. Uploading document',
    '2. Extracting page text',
    '3. Identifying curriculum topics',
    '4. Creating 384-dim vector embeddings',
    '5. Ready for assessment',
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const dropped = e.dataTransfer.files[0];
      setFile(dropped);
      if (!title) {
        setTitle(dropped.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      if (!title) {
        setTitle(selected.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or drop a file to upload.');
      return;
    }

    const docTitle = title.trim() || file.name.replace(/\.[^/.]+$/, '');
    setError(null);
    setSuccess(null);
    setUploading(true);
    setCurrentStep(1);

    // Simulate progress steps through backend processing pipeline
    const stepTimer1 = setTimeout(() => setCurrentStep(2), 500);
    const stepTimer2 = setTimeout(() => setCurrentStep(3), 1200);
    const stepTimer3 = setTimeout(() => setCurrentStep(4), 1800);

    try {
      const res = await apiClient.uploadMaterialFile(
        student.id,
        docTitle,
        materialType,
        file
      );

      setCurrentStep(5);
      setSuccess(`"${res.material.title}" processed and indexed into ${res.material.chunk_count} RAG chunks!`);
      setFile(null);
      setTitle('');

      const updated = await apiClient.getMaterials(student.id);
      onMaterialsUpdated(updated);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'File extraction failed. Ensure your PDF has readable text.';
      setError(msg);
      setCurrentStep(0);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      clearTimeout(stepTimer3);
      setUploading(false);
    }
  };

  const handleDelete = async (matId: string) => {
    setDeletingId(matId);
    try {
      await apiClient.deleteMaterial(matId, student.id);
      const updated = await apiClient.getMaterials(student.id);
      onMaterialsUpdated(updated);
    } catch (err: any) {
      alert('Failed to delete material.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Study Materials & Documents</h1>
          <p className="text-xs text-slate-500">
            Upload textbooks, syllabus guides, or past papers. The AI doctor generates questions grounded strictly in these sources.
          </p>
        </div>

        {materials.length > 0 && (
          <button
            onClick={() => onStartQuiz(targetSubject)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-1.5"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Start Assessment on Materials</span>
          </button>
        )}
      </div>

      {/* Upload Zone Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        
        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold block">Upload / Extraction Notice:</span>
              <p>{error}</p>
            </div>
          </div>
        )}

        {success && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{success}</span>
            </div>
            <button
              onClick={() => onStartQuiz(targetSubject)}
              className="text-xs font-bold text-emerald-700 hover:underline"
            >
              Test these notes now →
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
              dragActive
                ? 'border-indigo-500 bg-indigo-50/50'
                : file
                ? 'border-emerald-400 bg-emerald-50/30'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <input
              type="file"
              id="file-upload"
              accept=".pdf,.txt,.md"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <label htmlFor="file-upload" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200/60 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
                <UploadCloud className="w-6 h-6" />
              </div>
              
              <div>
                <span className="text-sm font-bold text-slate-800 block">
                  {file ? file.name : 'Click to browse or drag and drop your file here'}
                </span>
                <span className="text-xs text-slate-400">
                  Supported formats: Standard PDF, Plain Text (TXT), Markdown (MD). Scanned image PDFs require selectable text layer.
                </span>
              </div>

              {file && (
                <div className="pt-2">
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                    ✓ File Selected ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </label>
          </div>

          {/* Title and Classification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1">Document Title (e.g. Unit 1: Thermodynamics)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. College Physics Chapter 2"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1">Document Type</label>
              <select
                value={materialType}
                onChange={(e) => setMaterialType(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-indigo-500 focus:bg-white cursor-pointer"
              >
                <option value="notes">Textbook Chapter / Notes</option>
                <option value="syllabus">Official Syllabus / Course Outline</option>
                <option value="past_paper">Past Examination Paper</option>
              </select>
            </div>
          </div>

          {/* Stepper Progress Indicator */}
          {uploading && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-800 flex items-center space-x-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>Processing Pipeline in Progress...</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5 text-[10px] font-mono pt-1">
                {steps.map((st, sIdx) => {
                  const isDone = currentStep > sIdx + 1;
                  const isCurrent = currentStep === sIdx + 1;
                  return (
                    <div
                      key={sIdx}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        isDone
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                          : isCurrent
                          ? 'bg-indigo-50 border-indigo-300 text-indigo-700 font-bold animate-pulse'
                          : 'bg-white border-slate-200 text-slate-400'
                      }`}
                    >
                      {st}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={uploading || !file}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition-all flex items-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              <span>{uploading ? 'Processing File...' : 'Upload & Generate Embeddings'}</span>
            </button>
          </div>

        </form>
      </div>

      {/* Uploaded Documents List */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <span>Indexed Documents in Your Account ({materials.length})</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">Isolated to your user ID</span>
        </div>

        {materials.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <FileText className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-xs font-bold text-slate-700">No Study Materials Ingested Yet</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Upload your syllabus or textbook chapters above to ground the AI diagnostic tests in your own materials.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {materials.map((m) => (
              <div key={m.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center space-x-3 truncate">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-xs text-slate-900 block truncate">{m.title}</span>
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                      <span className="uppercase">{m.material_type}</span>
                      <span>•</span>
                      <span>{m.chunk_count} Vector Chunks (pgvector)</span>
                      <span>•</span>
                      <span>{new Date(m.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3 flex-shrink-0">
                  <span className="text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Ready for Assessment
                  </span>

                  <button
                    onClick={() => handleDelete(m.id)}
                    disabled={deletingId === m.id}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete document and its vector chunks"
                  >
                    {deletingId === m.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-rose-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

