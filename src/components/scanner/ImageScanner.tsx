"use client";

import { useState, useRef, useEffect } from 'react';
import { UploadCloud, Camera, Loader2, FileText, CheckCircle2, ClipboardCopy, Wand2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useTaskStore } from '@/store/task-store';
import { useAuth } from '@/lib/auth-context';

interface ParsedTask {
  title: string;
  subject: string;
  startTime: string;
  endTime: string;
  priority: 'High' | 'Medium' | 'Low';
}

export function ImageScanner() {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string>('');
  const [parsedTasks, setParsedTasks] = useState<ParsedTask[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { addTask } = useTaskStore();
  const { user } = useAuth();

  useEffect(() => {
    return () => {
      if (image && image.startsWith('blob:')) {
        URL.revokeObjectURL(image);
      }
    };
  }, [image]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload a valid image file');
      return;
    }

    const url = URL.createObjectURL(file);
    setImage(url);
    setImageFile(file);
    setResult('');
    setParsedTasks([]);
  };

  const startScan = async () => {
    if (!imageFile) return;
    
    setScanning(true);
    setResult('');
    setParsedTasks([]);

    try {
      const base64 = await fileToBase64(imageFile);
      
      const res = await fetch('/api/scanner/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: imageFile.type,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'OCR failed');
      }

      const data = await res.json();
      setResult(data.text || 'No text detected in this image.');
      
      if (data.tasks && Array.isArray(data.tasks) && data.tasks.length > 0) {
        setParsedTasks(data.tasks);
        toast.success(`Extracted text + ${data.tasks.length} study tasks!`);
      } else if (data.text?.trim()) {
        toast.success('Text extracted! No structured tasks found.');
      } else {
        toast.error('Could not find any readable text.');
      }
    } catch (error) {
      console.error('Scan failed:', error);
      toast.error('Failed to scan image. Please try again.');
    } finally {
      setScanning(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied to clipboard!');
  };

  const convertToTasks = () => {
    if (parsedTasks.length === 0) {
      toast.error('No structured tasks available to import.');
      return;
    }
    
    let count = 0;
    parsedTasks.forEach((task) => {
      const timeLabel = task.startTime && task.endTime 
        ? `[${to12hr(task.startTime)} - ${to12hr(task.endTime)}] ` 
        : '';
      
      addTask({
        title: `${timeLabel}${task.title}`,
        priority: task.priority || 'Medium',
        subject: task.subject || 'Imported',
        tags: ['scanned'],
      }, user?.id);
      count++;
    });
    
    toast.success(`Created ${count} study tasks from your timetable!`);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[600px]">
      
      {/* Upload & Preview Side */}
      <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col items-center justify-center bg-slate-900/50">
        
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-full min-h-[300px] border-2 border-dashed border-slate-700/50 hover:border-indigo-500/50 hover:bg-indigo-500/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all group"
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Camera className="w-8 h-8 text-slate-400 group-hover:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Upload Timetable Photo</h3>
            <p className="text-slate-400 text-sm text-center max-w-[250px]">
              Take a photo of your whiteboard, syllabus, or printed class schedule.
            </p>
            <div className="mt-6 flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full font-medium text-sm">
              <UploadCloud className="w-4 h-4" /> Browse Files
            </div>
            <p className="mt-4 text-xs text-slate-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" /> Powered by Gemini Vision AI
            </p>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col relative group">
            <img 
              src={image} 
              alt="Scan target" 
              className="w-full h-full object-contain rounded-xl bg-slate-950/50"
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center backdrop-blur-sm">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2.5 rounded-full font-medium transition-colors shadow-lg"
              >
                Change Image
              </button>
            </div>
            
            {!scanning && !result && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%]">
                <button 
                  onClick={startScan}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-4 rounded-2xl font-bold tracking-wide shadow-xl shadow-indigo-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                  <Wand2 className="w-5 h-5" /> Scan with Gemini AI
                </button>
              </div>
            )}
            
            {/* Scanning Overlay */}
            {scanning && (
              <div className="absolute inset-x-6 bottom-6 bg-slate-900/95 border border-indigo-500/30 p-6 rounded-2xl shadow-2xl flex flex-col items-center backdrop-blur-md">
                <div className="relative mb-4">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                  <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
                </div>
                <p className="text-sm font-semibold text-white mb-1">Gemini Vision is analyzing...</p>
                <p className="text-xs text-slate-400">Reading handwriting, tables, and text</p>
              </div>
            )}
          </div>
        )}
        
        <input 
          type="file" 
          accept="image/png, image/jpeg, image/webp" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
      </div>
      
      {/* Results Side */}
      <div className="flex-1 bg-slate-950 p-6 md:p-8 flex flex-col">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <FileText className="w-6 h-6 text-indigo-400" />
          Extracted Text
        </h3>
        
        {result ? (
          <div className="flex-1 flex flex-col relative h-full overflow-hidden">
            {/* Raw text area - collapsible if tasks are available */}
            <div className={`bg-slate-900 rounded-2xl border border-slate-800 p-5 overflow-y-auto custom-scrollbar text-slate-300 whitespace-pre-wrap font-mono text-sm leading-relaxed shadow-inner ${parsedTasks.length > 0 ? 'max-h-[180px]' : 'flex-1 mb-6'}`}>
              {result}
            </div>
            
            {/* Parsed Tasks Preview */}
            {parsedTasks.length > 0 && (
              <div className="mt-3 flex-1 overflow-y-auto">
                <p className="text-xs font-semibold text-indigo-400 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {parsedTasks.length} study tasks detected:
                </p>
                <div className="space-y-1.5">
                  {parsedTasks.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-900/80 border border-slate-800/50 rounded-lg px-3 py-2 text-xs">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${task.priority === 'High' ? 'bg-red-400' : task.priority === 'Medium' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                      <span className="text-slate-300 font-medium flex-1 truncate">{task.title}</span>
                      <span className="text-slate-500 font-mono shrink-0">{to12hr(task.startTime)}–{to12hr(task.endTime)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3 shrink-0 mt-4">
              <button 
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                <ClipboardCopy className="w-4 h-4 text-slate-400" />
                Copy Text
              </button>
              <button 
                onClick={convertToTasks}
                disabled={parsedTasks.length === 0}
                className="flex items-center justify-center gap-2 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors border border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Import {parsedTasks.length} Tasks
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-40">
            <div className="w-20 h-20 border-4 border-dashed border-slate-700 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-500 font-medium text-center">
              Scan a photo to see <br />extracted text here.
            </p>
          </div>
        )}
      </div>
      
    </div>
  );
}

/** Convert a File to a raw base64 string (no data: prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/** Convert 24hr "HH:MM" to 12hr "h:MM AM/PM". Passes through if already 12hr. */
function to12hr(time: string): string {
  // If already contains AM/PM, return as-is
  if (/[ap]m/i.test(time)) return time;
  
  const match = time.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return time;
  
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  if (h === 0) h = 12;
  else if (h > 12) h -= 12;
  
  return `${h}:${m} ${ampm}`;
}
