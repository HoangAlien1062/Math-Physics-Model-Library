'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileCode,
  FileArchive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sigma,
  Atom,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Category, Subject } from '@/types';
import { useToast } from '@/components/ui/Toast';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: () => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const { showToast } = useToast();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [subject, setSubject] = useState<Subject>('math');
  const [category, setCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Upload Progress & State Machine
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'processing' | 'ready' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories when subject changes
  useEffect(() => {
    fetch(`/api/categories?subject=${subject}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setCategory(data.categories[0].slug);
          }
        }
      })
      .catch((err) => console.error(err));
  }, [subject]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const validateAndSetFile = (file: File) => {
    const isHtml = file.name.endsWith('.html') || file.name.endsWith('.htm');
    const isZip = file.name.endsWith('.zip');

    if (!isHtml && !isZip) {
      showToast('Chỉ hỗ trợ file .html hoặc .zip project', 'error');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      showToast('Kích thước file không được vượt quá 50MB', 'error');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      // Auto fill title from filename
      setTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      showToast('Vui lòng chọn file mô hình', 'error');
      return;
    }

    setUploadStatus('uploading');
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('subject', subject);
      formData.append('category', category);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('tags', tags);

      setUploadStatus('processing');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      let data: any = null;
      const responseText = await res.text();
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(
          res.status === 413
            ? 'Kích thước file vượt quá giới hạn tải lên của máy chủ (Payload Too Large)'
            : `Máy chủ phản hồi không hợp lệ (${res.status}): ${responseText.slice(0, 120) || 'Không có dữ liệu trả về'}`
        );
      }

      if (!res.ok || !data || !data.success) {
        throw new Error(data?.error || 'Lỗi khi tải lên file vào Google Drive');
      }

      setUploadStatus('ready');
      showToast('Mô hình đã được tải lên thành công vào hệ thống lưu trữ!', 'success');

      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
        onClose();
        resetForm();
      }, 1000);
    } catch (err: any) {
      console.error(err);
      setUploadStatus('error');
      setErrorMessage(err.message || 'Không thể tải lên mô hình');
      showToast(err.message || 'Lỗi tải lên', 'error');
    }
  };

  const resetForm = () => {
    setStep(1);
    setTitle('');
    setDescription('');
    setTags('');
    setSelectedFile(null);
    setUploadStatus('idle');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Thêm mô hình mới</h2>
            <p className="text-xs text-slate-500">
              Lưu trữ an toàn trên Google Drive Admin & hiển thị trực tiếp trong thư viện
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between px-6 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold">
          {[
            { num: 1, label: 'Môn học' },
            { num: 2, label: 'Chủ đề' },
            { num: 3, label: 'Thông tin' },
            { num: 4, label: 'File HTML/ZIP' },
          ].map((s) => (
            <div
              key={s.num}
              onClick={() => uploadStatus === 'idle' && setStep(s.num as any)}
              className={`flex items-center gap-1.5 cursor-pointer ${
                step === s.num
                  ? 'text-blue-600'
                  : step > s.num
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                  step === s.num
                    ? 'bg-blue-600 text-white'
                    : step > s.num
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* STEP 1: Select Subject */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Bước 1: Chọn môn học</h3>
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => setSubject('math')}
                  className={`p-5 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-3 text-center transition-all ${
                    subject === 'math'
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Sigma className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Toán học</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Đại số, Giải tích, Hình học, Xác suất...
                    </p>
                  </div>
                </div>

                <div
                  onClick={() => setSubject('physics')}
                  className={`p-5 rounded-xl border-2 cursor-pointer flex flex-col items-center gap-3 text-center transition-all ${
                    subject === 'physics'
                      ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                    <Atom className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Vật lý</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Cơ học, Nhiệt, Điện, Sóng, Quang...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Select Category */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Bước 2: Chọn chủ đề trong môn {subject === 'math' ? 'Toán học' : 'Vật lý'}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.slug)}
                    className={`p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                      category === cat.slug
                        ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Metadata (Title, Description, Tags) */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">Bước 3: Nhập thông tin mô hình</h3>
              
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tên mô hình <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Mô phỏng giao thoa sóng ánh sáng..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Mô tả ngắn</label>
                <textarea
                  rows={3}
                  placeholder="Mô tả chức năng, các tham số tương tác, công thức vật lý/toán..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Thẻ / Tags (ngăn cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  placeholder="dao động, sóng cơ, vật lý 12"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full text-sm px-3.5 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Upload File */}
          {step === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-800">
                Bước 4: Chọn file HTML hoặc ZIP project
              </h3>

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  isDragOver
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-blue-400 bg-slate-50/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".html,.htm,.zip"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <UploadCloud className="w-12 h-12 text-blue-500 mb-3" />
                <p className="text-sm font-semibold text-slate-800">
                  Kéo thả file vào đây hoặc <span className="text-blue-600 underline">Chọn tệp</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Chấp nhận file đơn .html hoặc gói nén project .zip (tối đa 50MB)
                </p>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs font-medium text-blue-900">
                  <div className="flex items-center gap-2 truncate">
                    {selectedFile.name.endsWith('.zip') ? (
                      <FileArchive className="w-5 h-5 text-blue-600 shrink-0" />
                    ) : (
                      <FileCode className="w-5 h-5 text-emerald-600 shrink-0" />
                    )}
                    <span className="truncate">{selectedFile.name}</span>
                  </div>
                  <span className="text-slate-500 shrink-0 ml-2">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}

              {/* Upload Status / State Machine Banner */}
              {uploadStatus !== 'idle' && (
                <div className="p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2.5">
                  {uploadStatus === 'uploading' && (
                    <>
                      <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      <span>Đang tải file lên Google Drive Admin...</span>
                    </>
                  )}
                  {uploadStatus === 'processing' && (
                    <>
                      <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                      <span>Đang xử lý phân tích cấu trúc model & lưu metadata...</span>
                    </>
                  )}
                  {uploadStatus === 'ready' && (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Mô hình đã sẵn sàng hoạt động!</span>
                    </>
                  )}
                  {uploadStatus === 'error' && (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span className="text-rose-700">{errorMessage || 'Lỗi tải lên'}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                disabled={uploadStatus === 'uploading' || uploadStatus === 'processing'}
                onClick={() => setStep((step - 1) as any)}
                className="flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100"
              >
                <ChevronLeft className="w-4 h-4" /> Quay lại
              </button>
            ) : (
              <div></div>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 3 && !title.trim()) {
                    showToast('Vui lòng nhập tên mô hình', 'error');
                    return;
                  }
                  setStep((step + 1) as any);
                }}
                className="flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm"
              >
                Tiếp theo <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!selectedFile || uploadStatus === 'uploading' || uploadStatus === 'processing'}
                className="flex items-center gap-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg shadow-sm transition-all"
              >
                {uploadStatus === 'uploading' || uploadStatus === 'processing' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Đang tải lên...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Xác nhận & Tải lên</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
