import { useState, useCallback } from 'react';
import Cropper, { Point, Area } from 'react-easy-crop';
import { X, RotateCw, Check, Scissors } from 'lucide-react';
import { Button } from './ui/Button';

interface ImageCropperProps {
  image: string;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export const ImageCropper = ({ image, onCropComplete, onCancel }: ImageCropperProps) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropChange = (crop: Point) => {
    setCrop(crop);
  };

  const onZoomChange = (zoom: number) => {
    setZoom(zoom);
  };

  const onRotationChange = (rotation: number) => {
    setRotation(rotation);
  };

  const onCropCompleteInternal = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<Blob> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const { width: bWidth, height: bHeight } = rotateSize(
      image.width,
      image.height,
      rotation
    );

    canvas.width = bWidth;
    canvas.height = bHeight;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.translate(bWidth / 2, bHeight / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-image.width / 2, -image.height / 2);

    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement('canvas');
    const croppedCtx = croppedCanvas.getContext('2d');

    if (!croppedCtx) {
      throw new Error('No 2d context for cropped canvas');
    }

    croppedCanvas.width = pixelCrop.width;
    croppedCanvas.height = pixelCrop.height;

    croppedCtx.imageSmoothingEnabled = true;
    croppedCtx.imageSmoothingQuality = 'high';

    croppedCtx.drawImage(
      canvas,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      croppedCanvas.toBlob((file) => {
        if (file) resolve(file);
      }, 'image/jpeg', 0.95);
    });
  };

  const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = (rotation * Math.PI) / 180;
    return {
      width:
        Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
    };
  };

  const handleCropSave = async () => {
    try {
      if (croppedAreaPixels) {
        const croppedImageBlob = await getCroppedImg(
          image,
          croppedAreaPixels,
          rotation
        );
        onCropComplete(croppedImageBlob);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[300] flex flex-col bg-brand-dark/95 backdrop-blur-md animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center">
                <Scissors className="w-6 h-6 text-primary" />
            </div>
            <div>
                <h2 className="text-white font-black uppercase tracking-widest text-sm">Edytor Komponentu</h2>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Dostosuj kadr i orientację zdjęcia</p>
            </div>
        </div>
        <button 
          onClick={onCancel}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <X className="w-8 h-8" />
        </button>
      </div>

      <div className="relative flex-1 bg-black/50 overflow-hidden">
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={4 / 3}
          onCropChange={onCropChange}
          onCropComplete={onCropCompleteInternal}
          onZoomChange={onZoomChange}
          onRotationChange={onRotationChange}
        />
      </div>

      <div className="bg-brand-dark border-t border-white/10 p-8 space-y-8">
        <div className="max-w-xl mx-auto space-y-6">
           <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Zoom</span>
                  <span className="text-primary">{Math.round(zoom * 100)}%</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => onZoomChange(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
              />
           </div>

           <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span>Rotacja</span>
                  <span className="text-primary">{rotation}°</span>
              </div>
              <div className="flex items-center gap-4">
                <input
                    type="range"
                    value={rotation}
                    min={0}
                    max={360}
                    step={1}
                    aria-labelledby="Rotation"
                    onChange={(e) => onRotationChange(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <button 
                    onClick={() => setRotation((r) => (r + 90) % 360)}
                    className="p-3 bg-slate-800 text-white rounded hover:bg-primary transition-colors"
                >
                    <RotateCw className="w-5 h-5" />
                </button>
              </div>
           </div>
        </div>

        <div className="flex justify-center gap-4 pt-4">
          <Button variant="secondary" onClick={onCancel} className="bg-white/5 text-white border-white/10 hover:bg-white/10 min-w-[150px]">
             ANULUJ
          </Button>
          <Button onClick={handleCropSave} className="min-w-[200px] shadow-xl shadow-emerald-500/20">
             <Check className="w-4 h-4 mr-2" />
             ZASTOSUJ ZMIANY
          </Button>
        </div>
      </div>
    </div>
  );
};
