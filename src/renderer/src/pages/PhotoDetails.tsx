import React, { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ShoppingCart, Download } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format } from 'date-fns';
import { PhotoFormat } from '../types';

const filters = [
  { name: 'Original', class: '' },
  { name: 'Noir & Blanc', class: 'grayscale' },
  { name: 'Sépia', class: 'sepia' },
  { name: 'Contraste élevé', class: 'contrast-150' },
  { name: 'Lumineux', class: 'brightness-125' },
  { name: 'Froid', class: 'hue-rotate-180' },
  { name: 'Chaud', class: 'hue-rotate-60' },
  { name: 'Vintage', class: 'sepia brightness-75' },
  { name: 'Dramatique', class: 'contrast-125 brightness-75' },
  { name: 'Vif', class: 'saturate-150' },
];

// Mock data - replace with API call later
const mockPhotos = [
  {
    id: '1',
    albumId: '1',
    title: 'Sunset at the Beach',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    date: '2024-03-15',
  },
  {
    id: '2',
    albumId: '1',
    title: 'Ocean Waves',
    url: 'https://images.unsplash.com/photo-1476673160081-cf065607f449',
    date: '2024-03-15',
  },
  {
    id: '3',
    albumId: '1',
    title: 'Beach Palm Trees',
    url: 'https://images.unsplash.com/photo-1509233725247-49e657c54213',
    date: '2024-03-16',
  },
];

export const PhotoDetails: React.FC = () => {
  const { photoId } = useParams<{ photoId: string }>();
  const { t } = useTranslation();
  const { addToCart, cart } = useStore();
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [selectedFilterName, setSelectedFilterName] = useState<string>('Original');
  const [selectedFormat] = useState<PhotoFormat>('13x18'); // Default format
  const [isLoading, setIsLoading] = useState(false);

  const photo = useMemo(() => mockPhotos.find((p) => p.id === photoId), [photoId]);

  const isInCart = useMemo(
    () =>
      cart.some(
        (item) =>
          item.photoId === photoId &&
          item.filterName === selectedFilterName &&
          item.format === selectedFormat
      ),
    [cart, photoId, selectedFilterName, selectedFormat]
  );

  const handleAddToCart = () => {
    if (!photo || isInCart) return;
    setIsLoading(true);
    try {
      // Add to cart with filter and format information
      addToCart(photo, selectedFormat, selectedFilterName, selectedFilter);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!photo) return;

    try {
      // Create a temporary canvas
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.crossOrigin = 'anonymous'; // Allow loading images from other domains

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = photo.url;
      });

      // Set canvas dimensions
      canvas.width = img.width;
      canvas.height = img.height;

      if (!ctx) throw new Error('Could not get canvas context');

      // Draw the image
      ctx.drawImage(img, 0, 0);

      // Apply CSS filters via a filter matrix
      if (selectedFilter) {
        // Apply filters based on the CSS class
        if (selectedFilter.includes('grayscale')) {
          ctx.filter = 'grayscale(100%)';
        }
        if (selectedFilter.includes('sepia')) {
          ctx.filter = 'sepia(100%)';
        }
        if (selectedFilter.includes('contrast')) {
          const contrast = selectedFilter.includes('150') ? '150%' : '75%';
          ctx.filter = `contrast(${contrast})`;
        }
        if (selectedFilter.includes('brightness')) {
          const brightness = selectedFilter.includes('125') ? '125%' : '75%';
          ctx.filter = `brightness(${brightness})`;
        }
        if (selectedFilter.includes('saturate')) {
          ctx.filter = 'saturate(150%)';
        }
        if (selectedFilter.includes('hue-rotate')) {
          const rotation = selectedFilter.includes('180') ? '180deg' : '60deg';
          ctx.filter = `hue-rotate(${rotation})`;
        }

        // Redraw the image with filters
        ctx.drawImage(img, 0, 0);
      }

      // Convert the canvas to a blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/jpeg', 0.95);
      });

      // Create the URL and trigger the download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${photo.title}_${selectedFilterName}.jpg`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (!photo) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">Photo not found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Main Photo */}
      <div className="space-y-4">
        <div className="relative aspect-square">
          <img
            src={photo.url}
            alt={photo.title}
            className={`w-full h-full object-cover rounded-lg shadow-lg ${selectedFilter}`}
          />
        </div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{photo.title}</h1>
            <p className="text-gray-600">{format(new Date(photo.date), 'PP')}</p>
            <p className="text-blue-600 font-medium mt-1">
              Filtre sélectionné: {selectedFilterName}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-6 py-3 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              <span>Télécharger</span>
            </button>
            <button
              onClick={handleAddToCart}
              disabled={isInCart || isLoading}
              className={`flex items-center space-x-2 px-6 py-3 rounded-md transition-colors ${
                isInCart || isLoading
                  ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              <span>
                {isLoading
                  ? 'Chargement...'
                  : isInCart
                  ? 'Dans le panier'
                  : t('addToCart')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Filtered Versions */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Filtres disponibles</h2>
        <div className="grid grid-cols-2 gap-4">
          {filters.map((filter) => (
            <div
              key={filter.name}
              onClick={() => {
                setSelectedFilter(filter.class);
                setSelectedFilterName(filter.name);
              }}
              className={`cursor-pointer space-y-2 transition-all ${
                selectedFilterName === filter.name
                  ? 'ring-2 ring-blue-500 ring-offset-2 rounded-lg'
                  : 'hover:ring-2 hover:ring-blue-200 hover:ring-offset-2 rounded-lg'
              }`}
            >
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img
                  src={photo.url}
                  alt={`${filter.name} filter`}
                  className={`w-full h-full object-cover ${filter.class}`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-sm font-medium text-white bg-black/50 px-2 py-1 rounded text-center">
                    {filter.name}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};