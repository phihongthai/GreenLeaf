'use client';

import { useEffect, useState } from 'react';
import { Folder, FileText, Upload, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import TeacherNav from '@/components/teacher/TeacherNav';
import ErrorText from '@/components/ErrorText';

const SUB_COURSES = ['Ready Steady Grow', 'Think', 'Prepare', 'IELTS'];
const FILE_TYPES = [
  { value: 'lesson_plan', label: 'Lesson Plan' },
  { value: 'worksheet', label: 'Worksheet' },
  { value: 'flashcard', label: 'Flashcard' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Video' },
  { value: 'test', label: 'Test' },
  { value: 'keys', label: 'Keys' },
];

interface ResourceFile {
  id: string;
  course: string;
  unit: string;
  file_type: string;
  file_name: string;
  storage_path: string;
}

export default function ResourceLibraryPage() {
  const [subCourse, setSubCourse] = useState<string | null>(null);
  const [unit, setUnit] = useState<string | null>(null);
  const [files, setFiles] = useState<ResourceFile[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [uploadType, setUploadType] = useState(FILE_TYPES[0].value);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const course = subCourse ? `Cambridge/${subCourse}` : null;

  const load = async () => {
    if (!course) return;
    const supabase = createClient();
    const { data } = await supabase.from('greenleaf_resource_files').select('*').eq('course', course);
    setFiles((data as ResourceFile[]) ?? []);
  };

  useEffect(() => { load(); }, [course]);

  const units = Array.from(new Set(files.map((f) => f.unit))).sort();
  const filesInUnit = files.filter((f) => f.unit === unit);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const targetUnit = unit ?? newUnitName.trim();
    if (!file || !course || !targetUnit) return;

    setUploading(true);
    setUploadError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const storagePath = `${course}/${targetUnit}/${uploadType}/${Date.now()}-${file.name}`;

    const { error: storageError } = await supabase.storage.from('greenleaf-resources').upload(storagePath, file);
    if (!storageError) {
      await supabase.from('greenleaf_resource_files').insert({
        course,
        unit: targetUnit,
        file_type: uploadType,
        file_name: file.name,
        storage_path: storagePath,
        uploaded_by: user?.id,
      });
      setUnit(targetUnit);
      setNewUnitName('');
      await load();
    } else {
      setUploadError('Upload thất bại: ' + storageError.message);
    }
    setUploading(false);
    e.target.value = '';
  };

  const downloadUrl = (path: string) => {
    const supabase = createClient();
    return supabase.storage.from('greenleaf-resources').getPublicUrl(path).data.publicUrl;
  };

  return (
    <div className="min-h-screen gl-playful-bg px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <TeacherNav active="resources" />

        <div className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
          <button onClick={() => { setSubCourse(null); setUnit(null); }} className="font-bold text-[#3A7D44] hover:underline">
            Cambridge
          </button>
          {subCourse && (
            <>
              <ChevronRight className="w-4 h-4" />
              <button onClick={() => setUnit(null)} className="font-bold text-[#3A7D44] hover:underline">{subCourse}</button>
            </>
          )}
          {unit && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="font-bold text-gray-700">{unit}</span>
            </>
          )}
        </div>

        {!subCourse && (
          <div className="grid grid-cols-2 gap-3">
            {SUB_COURSES.map((sc) => (
              <button
                key={sc}
                onClick={() => setSubCourse(sc)}
                className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
              >
                <Folder className="w-6 h-6 text-[#C9A876]" />
                <span className="font-bold text-gray-700">{sc}</span>
              </button>
            ))}
          </div>
        )}

        {subCourse && !unit && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {units.map((u) => (
                <button
                  key={u}
                  onClick={() => setUnit(u)}
                  className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-3"
                >
                  <Folder className="w-6 h-6 text-[#C9A876]" />
                  <span className="font-bold text-gray-700">{u}</span>
                </button>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <p className="text-sm font-bold text-gray-600">Tạo Unit mới + upload file đầu tiên</p>
              <input
                value={newUnitName}
                onChange={(e) => setNewUnitName(e.target.value)}
                placeholder="VD: Unit 1"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
              />
              <UploadControl
                uploadType={uploadType}
                setUploadType={setUploadType}
                onUpload={handleUpload}
                uploading={uploading}
                disabled={!newUnitName.trim()}
              />
              {uploadError && <ErrorText message={uploadError} />}
            </div>
          </div>
        )}

        {unit && (
          <div className="space-y-4">
            {FILE_TYPES.map(({ value, label }) => {
              const items = filesInUnit.filter((f) => f.file_type === value);
              if (items.length === 0) return null;
              return (
                <div key={value} className="bg-white rounded-2xl shadow-sm p-5 space-y-2">
                  <p className="text-xs font-bold text-gray-400 uppercase">{label}</p>
                  {items.map((f) => (
                    <a
                      key={f.id}
                      href={downloadUrl(f.storage_path)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#3A7D44]"
                    >
                      <FileText className="w-4 h-4" /> {f.file_name}
                    </a>
                  ))}
                </div>
              );
            })}

            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
              <p className="text-sm font-bold text-gray-600">Upload file mới vào {unit}</p>
              <UploadControl uploadType={uploadType} setUploadType={setUploadType} onUpload={handleUpload} uploading={uploading} />
              {uploadError && <ErrorText message={uploadError} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function UploadControl({
  uploadType,
  setUploadType,
  onUpload,
  uploading,
  disabled,
}: {
  uploadType: string;
  setUploadType: (v: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploading: boolean;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <select
        value={uploadType}
        onChange={(e) => setUploadType(e.target.value)}
        className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#3A7D44]"
      >
        {FILE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <label className={`flex-1 flex items-center justify-center gap-2 border-2 border-dashed rounded-xl py-2 text-sm font-semibold cursor-pointer ${
        disabled ? 'opacity-50 cursor-not-allowed border-gray-200 text-gray-400' : 'border-[#3A7D44] text-[#3A7D44] hover:bg-emerald-50'
      }`}>
        <Upload className="w-4 h-4" />
        {uploading ? 'Đang tải lên...' : 'Chọn file'}
        <input type="file" className="hidden" onChange={onUpload} disabled={disabled || uploading} />
      </label>
    </div>
  );
}
