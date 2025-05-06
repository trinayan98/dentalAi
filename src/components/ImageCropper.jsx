import React, { useState, useRef } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Button } from "./ui/Button";

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

    // Apply scaling
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-2xl w-full mx-4">
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Crop Image
        </h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Zoom: {Math.round(scale * 100)}%
          </label>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.1"
            value={scale}
            onChange={(e) => setScale(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-primary-500"
          />
        </div>

        <div className="relative overflow-hidden rounded-lg mb-4">
          <ReactCrop
            crop={crop}
            onChange={(c) => setCrop(c)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspectRatio}
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop me"
              onLoad={(e) => onLoad(e.target)}
              className="max-h-[60vh] w-auto"
            />
          </ReactCrop>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleComplete}
            disabled={!completedCrop?.width || !completedCrop?.height}
          >
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}
