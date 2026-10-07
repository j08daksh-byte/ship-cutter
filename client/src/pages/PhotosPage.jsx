import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import ImageUpload from '../components/common/ImageUpload';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { Image as ImageIcon, Filter, Maximize2, X, Plus } from 'lucide-react';

export default function PhotosPage() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const fetchPhotos = async () => {
    try {
      const data = await api.getPhotos();
      setPhotos(data);
    } catch (err) {
      console.error('Failed to load photos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  if (loading) return <LoadingSpinner text="Indexing photo library..." />;

  const filteredPhotos = photos.filter((p) => {
    if (activeCategory === 'all') return true;
    return p.category === activeCategory;
  });

  const categories = [
    { id: 'all', label: 'All Photos' },
    { id: 'robot', label: 'Robotic Crawler' },
    { id: 'machine', label: 'Machinery & Cutters' },
    { id: 'cutting', label: 'Cutting In-Progress' },
    { id: 'parts', label: 'Structural Parts' },
    { id: 'material', label: 'Material Scrap' },
    { id: 'before_after', label: 'Before & After' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-accent-cyan" />
            <h2 className="text-xl font-bold text-white">Field Photos & Visual Inspection Archive</h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Visual logs of plasma kerf lines, extracted bulkheads, crawler mounts, and dismantled sections.
          </p>
        </div>

        <button
          onClick={() => setShowUploadForm(!showUploadForm)}
          className="btn-primary text-xs flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4 text-black" />
          <span>{showUploadForm ? 'Close Uploader' : 'Upload Machine / Robot Photo'}</span>
        </button>
      </div>

      {/* Upload Drawer if opened */}
      {showUploadForm && (
        <div className="mb-6">
          <ImageUpload
            onUploaded={(newPhoto) => {
              setPhotos([newPhoto, ...photos]);
              setShowUploadForm(false);
            }}
          />
        </div>
      )}

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-dark-border">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-neutral-800 text-white border border-neutral-600 font-semibold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredPhotos.map((photo) => (
          <div
            key={photo._id || photo.url}
            onClick={() => setSelectedPhoto(photo)}
            className="group card-surface border border-dark-border bg-dark-card rounded-xl overflow-hidden cursor-pointer hover:border-neutral-500 transition-all flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-neutral-950 overflow-hidden">
              <img
                src={
                  photo.url?.startsWith('/uploads')
                    ? photo.url.replace('/uploads', '/images')
                    : photo.url || '/images/plasma_cut_hull.jpg'
                }
                alt={photo.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/plasma_cut_hull.jpg';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-110 group-hover:grayscale-0"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Maximize2 className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="p-3">
              <span className="text-[10px] font-mono text-accent-cyan uppercase">{photo.category}</span>
              <h4 className="text-xs font-semibold text-white truncate mt-0.5">{photo.title}</h4>
              {photo.description && (
                <p className="text-[11px] text-neutral-400 truncate mt-1">{photo.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-dark-card border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl"
          >
            <div className="relative bg-black flex items-center justify-center max-h-[70vh]">
              <img
                src={
                  selectedPhoto.url?.startsWith('/uploads')
                    ? selectedPhoto.url.replace('/uploads', '/images')
                    : selectedPhoto.url || '/images/plasma_cut_hull.jpg'
                }
                alt={selectedPhoto.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/images/plasma_cut_hull.jpg';
                }}
                className="max-h-[70vh] w-auto object-contain"
              />
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/80 text-white hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 border-t border-dark-border flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-accent-cyan uppercase">
                  {selectedPhoto.category}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">{selectedPhoto.title}</h3>
                <p className="text-xs text-text-secondary mt-1">{selectedPhoto.description}</p>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                {new Date(selectedPhoto.createdAt || Date.now()).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
