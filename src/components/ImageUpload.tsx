'use client';

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { uploadImageToCloudinary, optimizeCloudinaryUrl } from '@/lib/cloudinary';
import toast from 'react-hot-toast';

interface ImageUploadProps {
    value: string;
    onChange: (url: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export default function ImageUpload({
    value,
    onChange,
    placeholder = "Görsel seçin veya sürükleyin",
    label = "Görsel",
    required = false
}: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = async (file: File) => {
        setUploading(true);
        try {
            const result = await uploadImageToCloudinary(file);

            if (result.success && result.url) {
                onChange(result.url);
                toast.success('Görsel başarıyla yüklendi');
            } else {
                toast.error(result.error || 'Görsel yükleme başarısız');
            }
        } catch (error) {
            toast.error('Görsel yükleme sırasında hata oluştu');
        } finally {
            setUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFileSelect(file);
        }
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(true);
    };

    const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));

        if (imageFile) {
            handleFileSelect(imageFile);
        }
    };

    const removeImage = () => {
        onChange('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            {value && !uploading && (
                <div className="relative inline-block">
                    <img
                        src={optimizeCloudinaryUrl(value, 128, 128)}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                        type="button"
                        onClick={removeImage}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            <div
                className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400 cursor-pointer'}
        `}
                onDragEnter={handleDragIn}
                onDragLeave={handleDragOut}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={uploading}
                />

                <div className="space-y-3">
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                            <p className="text-sm text-gray-600">Görsel yükleniyor...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center">
                            {value ? (
                                <ImageIcon className="w-8 h-8 text-green-500" />
                            ) : (
                                <Upload className="w-8 h-8 text-gray-400" />
                            )}
                            <p className="text-sm text-gray-600">
                                {value ? 'Farklı görsel seçmek için tıklayın' : placeholder}
                            </p>
                            <p className="text-xs text-gray-400">
                                PNG, JPG, GIF - Max 5MB
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}