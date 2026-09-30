import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Upload, Camera, Check, Image as ImageIcon, Sparkles, RefreshCw, User } from 'lucide-react';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Preset Chinese language student avatars (diverse styles: traditional, modern, anime, cute mascots)
const PRESET_AVATARS = [
  {
    name: 'Nữ sinh Hán phục 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    tag: 'Thanh nhã'
  },
  {
    name: 'Nam sinh hiện đại 1',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    tag: 'Năng động'
  },
  {
    name: 'Nam sinh nghiêm túc',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    tag: 'Học bá'
  },
  {
    name: 'Nữ sinh rạng rỡ',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    tag: 'Dễ thương'
  },
  {
    name: 'Nữ sinh thanh lịch',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
    tag: 'Dịu dàng'
  },
  {
    name: 'Nữ sinh nụ cười tỏa nắng',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    tag: 'Tươi tắn'
  },
  {
    name: 'Nam sinh lãng tử',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    tag: 'Tự tin'
  },
  {
    name: 'Nam sinh thể thao',
    url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80',
    tag: 'Nhiệt huyết'
  },
  {
    name: 'Nữ sinh thời trang',
    url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    tag: 'Hiện đại'
  },
  {
    name: 'Nam sinh thông minh',
    url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    tag: 'Trí tuệ'
  },
  {
    name: 'Gấu Trúc Panda Trung Hoa 🐼',
    url: 'https://images.unsplash.com/photo-1564349683136-77e08dba1ef7?w=200&auto=format&fit=crop&q=80',
    tag: 'Panda'
  },
  {
    name: 'Linh vật mèo may mắn 🐱',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80',
    tag: 'Chiêu tài'
  }
];

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({ isOpen, onClose }) => {
  const { activeStudent, updateStudentAvatar } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedAvatarUrl, setSelectedAvatarUrl] = useState<string>(activeStudent.avatar);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  // Process uploaded image file: auto-crop to square & compress via Canvas
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage('Vui lòng chọn một file ảnh hợp lệ (JPG, PNG, WebP).');
      return;
    }

    setErrorMessage(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Crop square and resize to 256x256 for optimal storage & speed
          const canvas = document.createElement('canvas');
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');

          if (!ctx) {
            setSelectedAvatarUrl(event.target?.result as string);
            setIsProcessing(false);
            return;
          }

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const startX = (img.width - minDim) / 2;
          const startY = (img.height - minDim) / 2;

          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, size, size);

          // Export as compressed JPEG
          const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
          setSelectedAvatarUrl(dataUrl);
          setIsProcessing(false);
        } catch (err) {
          console.warn('Canvas resize fallback:', err);
          setSelectedAvatarUrl(event.target?.result as string);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMessage('Không thể đọc file ảnh này. Vui lòng thử ảnh khác.');
        setIsProcessing(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage('Lỗi khi đọc file ảnh từ thiết bị.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (selectedAvatarUrl) {
      updateStudentAvatar(activeStudent.id, selectedAvatarUrl);
      onClose();
    }
  };

  const handleResetToDefault = () => {
    const defaultAvatar = PRESET_AVATARS[0].url;
    setSelectedAvatarUrl(defaultAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-amber-200/80 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        {/* Modal Header with Chinese Character Seal */}
        <div className="px-6 py-4 bg-gradient-to-r from-red-900 via-red-800 to-amber-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="chinese-seal text-xs bg-red-100/90 text-red-900 border-red-300 font-bold px-1.5 py-0.5">
              头像
            </span>
            <div>
              <h2 className="text-base font-bold text-amber-50">Thay đổi ảnh đại diện</h2>
              <p className="text-[11px] text-amber-200/90">
                Cập nhật ảnh cho học sinh: <strong>{activeStudent.name}</strong> ({activeStudent.chineseName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-amber-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-amber-50/20">
          {/* Section 1: Live Avatar Preview */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200/70 shadow-2xs flex flex-col sm:flex-row items-center gap-5">
            <div className="relative group shrink-0">
              <img
                src={selectedAvatarUrl}
                alt="Avatar xem trước"
                className="w-24 h-24 rounded-full object-cover border-4 border-amber-300 shadow-md ring-4 ring-amber-100"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Bấm để tải ảnh từ máy"
              >
                <Camera className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-bold">Đổi ảnh</span>
              </button>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-base font-bold text-slate-900">{activeStudent.name}</span>
                <span className="text-sm font-bold text-red-700 font-chinese">{activeStudent.chineseName}</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full">
                  Học sinh số {activeStudent.studentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Ảnh đại diện sẽ hiển thị trên bài làm, bảng điểm, danh sách lớp và hộp thư của cô giáo.
              </p>
              {selectedAvatarUrl !== activeStudent.avatar && (
                <span className="inline-block text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md mt-1">
                  ✨ Đã chọn ảnh mới (Chưa lưu)
                </span>
              )}
            </div>
          </div>

          {/* Section 2: Upload Own Photo Button & Drag Zone */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-red-700" />
              <span>1. Tự tải ảnh từ máy tính hoặc điện thoại</span>
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-amber-300 hover:border-red-600 bg-white hover:bg-amber-50/50 rounded-2xl p-5 text-center cursor-pointer transition-all group"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 group-hover:bg-red-100 text-red-700 flex items-center justify-center mx-auto mb-2 transition-colors">
                <Camera className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-900 group-hover:text-red-700 transition-colors">
                {isProcessing ? 'Đang xử lý ảnh...' : 'Bấm vào đây để chọn ảnh từ thiết bị của bạn'}
              </p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Hỗ trợ định dạng JPG, PNG, WebP (Tự động canh vuông và nén ảnh sắc nét)
              </p>
            </div>

            {errorMessage && (
              <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
                {errorMessage}
              </p>
            )}
          </div>

          {/* Section 3: Preset Avatars Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>2. Hoặc chọn nhanh từ bộ sưu tập có sẵn</span>
              </label>
              <span className="text-[11px] text-slate-400">12 mẫu ảnh</span>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {PRESET_AVATARS.map((item, idx) => {
                const isSelected = selectedAvatarUrl === item.url;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedAvatarUrl(item.url);
                      setErrorMessage(null);
                    }}
                    className={`relative rounded-xl p-1 transition-all group text-left ${
                      isSelected
                        ? 'ring-3 ring-red-600 bg-red-50 scale-105 shadow-sm'
                        : 'hover:bg-amber-100/50 hover:scale-102'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full aspect-square rounded-lg object-cover border border-amber-200"
                      />
                      {isSelected && (
                        <div className="absolute top-1 right-1 w-5 h-5 bg-red-700 text-white rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="block text-[10px] text-slate-600 truncate mt-1 text-center font-medium">
                      {item.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-white border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Khôi phục ảnh mẫu ban đầu</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 bg-red-700 hover:bg-red-800 active:bg-red-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu ảnh đại diện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
