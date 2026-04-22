import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { X, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  filePath: string;
  title: string;
}

export const LegalModal = ({ isOpen, onClose, filePath, title }: LegalModalProps) => {
  const [content, setContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      fetch(filePath)
        .then((res) => res.text())
        .then((text) => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setContent('Błąd ładowania dokumentu.');
          setLoading(false);
        });
    }
  }, [isOpen, filePath]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black text-brand-dark uppercase tracking-tight leading-tight">{title}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status operacyjny: Dokument urzędowy BETA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full transition-colors group"
          >
            <X className="w-6 h-6 text-slate-400 group-hover:text-brand-dark" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-10 prose prose-slate max-w-none prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-p:font-medium prose-p:text-slate-600">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center py-20">
              <Loader2 className="w-competent h-competent animate-spin text-primary mb-4" />
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[11px]">Synchronizacja danych prawnych...</p>
            </div>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>

        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-end shrink-0">
          <Button onClick={onClose} size="lg" className="px-12 py-6">Zrozumiałem</Button>
        </div>
      </div>
    </div>
  );
};
