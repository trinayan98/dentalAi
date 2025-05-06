import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "./ui/Button";
import { X, ZoomIn, ZoomOut, Move } from "lucide-react";

export default function ImageCropper({
  imageSrc,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
}) {
  const [crop, setCrop] = useState({
    unit: "%",
    width: 90,
    aspect: aspectRatio,
  });
  const [scale, setScale] = useState(1);
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);

  const onLoad = (img) => {
    imgRef.current = img;
  };

  const handleZoom = (delta) => {
    setScale((prevScale) => {
      const newScale = prevScale + delta;
      return Math.max(0.1, Math.min(3, newScale));
    });
  };

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = imgRef.current;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Set canvas size to desired output size
    canvas.width = completedCrop.width * scaleX;
    canvas.height = completedCrop.height * scaleY;

    // Clear the canvas and set the scale transformation
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);

    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY
    );

    // Convert canvas to blob
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error("Canvas is empty");
            return;
          }
          blob.name = "cropped.jpg";
          const croppedImage = {
            file: blob,
            url: URL.createObjectURL(blob),
          };
          resolve(croppedImage);
        },
        "image/jpeg",
        0.95
      );
    });
  };

  const handleComplete = async () => {
    const croppedImage = await generateCroppedImage();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Move className="w-5 h-5" />
            Adjust Image
          </h3>
          <button
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Zoom controls */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Zoom
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(scale * 100)}%
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleZoom(-0.1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={scale <= 0.1}
              >
                <ZoomOut className="w-4 h-4 text-gray-500" />
              </button>
              <input
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                style={{
                  backgroundImage: `linear-gradient(to right, #3B82F6 ${
                    ((scale - 0.1) / 2.9) * 100
                  }%, #E5E7EB ${((scale - 0.1) / 2.9) * 100}%)`,
                }}
              />
              <button
                onClick={() => handleZoom(0.1)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={scale >= 3}
              >
                <ZoomIn className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Crop area */}
          <div className="relative overflow-hidden rounded-lg mb-6 bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspectRatio}
              className="flex items-center justify-center"
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop me"
                onLoad={(e) => onLoad(e.target)}
                className="max-h-[60vh] w-auto transform transition-transform"
                style={{ transform: `scale(${scale})` }}
              />
            </ReactCrop>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-6"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleComplete}
              disabled={!completedCrop?.width || !completedCrop?.height}
              className="px-6"
              size="sm"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
