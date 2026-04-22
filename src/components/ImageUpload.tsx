import { useCallback, useState } from 'react';
import { Upload, X, Search, Scissors, AlertCircle, Move } from 'lucide-react';
import { Button } from './ui/Button';
import { ImageCropper } from './ImageCropper';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToParentElement } from '@dnd-kit/modifiers';

const MAX_IMAGES = 16;

interface ImageUploadProps {
  images: File[];
  onImagesChange: (files: File[]) => void;
  onNext: () => void;
}

const SortableImage = ({ 
  file, 
  index, 
  onPreview, 
  onCrop, 
  onRemove 
}: { 
  file: File; 
  index: number; 
  onPreview: (f: File) => void;
  onCrop: (i: number, f: File) => void;
  onRemove: (i: number) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `${file.name}-${file.lastModified}-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.5 : 1,
  };

  const url = URL.createObjectURL(file);

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="relative group aspect-square rounded overflow-hidden border-2 border-slate-100 bg-white shadow-sm ring-primary hover:ring-2 transition-all cursor-default"
    >
      <img
        src={url}
        alt={`Upload ${index + 1}`}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      
      {/* Drag Handle Overlay */}
      <div 
        {...attributes} 
        {...listeners} 
        className="absolute top-2 right-2 p-1.5 bg-brand-dark/50 text-white rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Przeciągnij, aby zmienić kolejność"
      >
        <Move className="w-3.5 h-3.5" />
      </div>

      <div className="absolute inset-x-0 bottom-0 bg-brand-dark/80 backdrop-blur-sm p-2 flex items-center justify-around opacity-0 group-hover:opacity-100 transition-all transform translate-y-full group-hover:translate-y-0">
        <button
          onClick={(e) => { e.stopPropagation(); onPreview(file); }}
          className="p-1.5 bg-white text-brand-dark rounded hover:bg-primary hover:text-white transition-colors"
          title="Powiększ"
        >
          <Search className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onCrop(index, file); }}
          className="p-1.5 bg-white text-blue-600 rounded hover:bg-blue-600 hover:text-white transition-colors"
          title="Kadruj / Obróć"
        >
          <Scissors className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(index); }}
          className="p-1.5 bg-white text-red-600 rounded hover:bg-red-600 hover:text-white transition-colors"
          title="Usuń"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export const ImageUpload = ({ images, onImagesChange, onNext }: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<{ index: number; url: string } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = images.findIndex((img, i) => `${img.name}-${img.lastModified}-${i}` === active.id);
      const newIndex = images.findIndex((img, i) => `${img.name}-${img.lastModified}-${i}` === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onImagesChange(arrayMove(images, oldIndex, newIndex));
      }
    }
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );
      onImagesChange([...images, ...files]);
    },
    [images, onImagesChange]
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const remainingSlots = MAX_IMAGES - images.length;
      if (remainingSlots <= 0) {
        // Option to show toast or alert
        return;
      }
      onImagesChange([...images, ...files.slice(0, remainingSlots)]);
    }
  };

  const handleCropComplete = (croppedBlob: Blob) => {
    if (croppingImage === null) return;
    
    // Create new file from blob
    const originalFile = images[croppingImage.index];
    const newFile = new File([croppedBlob], originalFile.name, { type: 'image/jpeg' });
    
    const newImages = [...images];
    newImages[croppingImage.index] = newFile;
    onImagesChange(newImages);
    setCroppingImage(null);
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  const openPreview = (file: File) => {
    setPreviewImage(URL.createObjectURL(file));
  };

  const openCropper = (index: number, file: File) => {
    setCroppingImage({ index, url: URL.createObjectURL(file) });
  };

  return (
    <div className="space-y-8">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        className={`border-4 border-dashed rounded transition-all duration-300 p-12 text-center cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5 shadow-inner'
            : 'border-slate-200 bg-slate-50 hover:border-slate-400 hover:bg-slate-100'
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer group">
          <Upload className={`w-16 h-16 mx-auto mb-6 transition-transform duration-300 group-hover:-translate-y-2 ${isDragging ? 'text-primary' : 'text-slate-300'}`} />
          <p className="text-xl font-black text-brand-dark mb-2 uppercase tracking-tight">
            Terminal Przesyłania Danych
          </p>
          <div className="flex items-center justify-center gap-2 mb-4">
             <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${images.length >= MAX_IMAGES ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {images.length} / {MAX_IMAGES} Platform Slotów
             </span>
             {images.length >= MAX_IMAGES && (
                 <div className="flex items-center gap-1 text-red-500 animate-pulse">
                    <AlertCircle className="w-3 h-3" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Limit osiągnięty</span>
                 </div>
             )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {images.length >= MAX_IMAGES ? 'Usuń obrazy, aby dodać nowe' : 'Upuść komponenty wizualne lub kliknij, aby zainicjować'}
          </p>
        </label>
      </div>

      {images.length > 0 && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4 border-b border-slate-100 pb-2">
            Kolejka przetwarzania: <span className="text-primary">{images.length} plików</span>
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToParentElement]}
          >
            <SortableContext
              items={images.map((img, i) => `${img.name}-${img.lastModified}-${i}`)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                {images.map((file, index) => (
                  <SortableImage
                    key={`${file.name}-${file.lastModified}-${index}`}
                    file={file}
                    index={index}
                    onPreview={openPreview}
                    onCrop={openCropper}
                    onRemove={removeImage}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {croppingImage && (
        <ImageCropper
          image={croppingImage.url}
          onCropComplete={handleCropComplete}
          onCancel={() => setCroppingImage(null)}
        />
      )}

      {previewImage && (
        <div 
          className="fixed inset-0 z-[200] flex items-center justify-center p-8 bg-brand-dark/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setPreviewImage(null)}
        >
          <button 
            className="absolute top-8 right-8 p-3 text-white hover:bg-white/10 rounded-full transition-colors border border-white/20"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-8 h-8" />
          </button>
          <img src={previewImage} className="max-w-full max-h-full rounded shadow-2xl animate-in zoom-in-95 duration-500 border-4 border-white/10" alt="Podgląd zdjęcia" />
        </div>
      )}

      <div className="flex justify-end pt-8 border-t border-slate-100 flex-col md:flex-row items-center gap-4">
        {images.length > MAX_IMAGES && (
          <p className="text-red-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Przekroczono limit {MAX_IMAGES} zdjęć
          </p>
        )}
        <Button 
          onClick={onNext} 
          disabled={images.length > MAX_IMAGES} 
          size="lg" 
          className="w-full md:w-auto shadow-xl shadow-emerald-500/20"
        >
          {images.length === 0 ? 'Kontynuuj bez zdjęć' : 'Inicjalizacja Procedury'}
        </Button>
      </div>
    </div>
  );
};
