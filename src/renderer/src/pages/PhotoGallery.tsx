import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, X, ChevronUp, ChevronDown, ShoppingCart, ArrowLeft, Download } from 'lucide-react';
import { format } from 'date-fns';
import { useStore } from '../store/useStore';
import { Cart } from '../components/Cart';
import { Photo, PhotoFormat } from '../types';

interface APIPhoto {
  _id: string;
  album_id: {
    _id: string;
    name: string;
  };
  photographer_id: {
    _id: string;
    name: string;
  };
  filename: string;
  uploaded_at: string;
  status: string;
  is_deleted: boolean;
  url: string;
}

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
  { name: 'Vif', class: 'saturate-150' }
];

const photoFormats: { value: PhotoFormat; label: string }[] = [
  { value: '13x18', label: '13 × 18 cm' },
  { value: '15x21', label: '15 × 21 cm' },
  { value: '20x30', label: '20 × 30 cm' },
  { value: '30x40', label: '30 × 40 cm' },
  { value: 'email', label: 'Format email' }
];

export const PhotoGallery: React.FC = () => {
  const { albumId } = useParams<{ albumId: string }>();
  console.log("Album ID:", albumId);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('');
  const [selectedFilterName, setSelectedFilterName] = useState<string>('Original');
  const [selectedFormat, setSelectedFormat] = useState<PhotoFormat>('13x18');
  const { addToCart, cart, settings } = useStore();
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = async (pageNumber: number) => {
    if (!albumId) {
      setError('ID de l\'album non trouvé');
      return;
    }
    
    if (loadingPhotos) return;
    
    setLoadingPhotos(true);
    setError(null);
    
    try {
      console.log('Fetching photos from:', albumId);
      const apiUrl = new URL(`http://127.0.0.1:3000/api/albums/${albumId}/photos`);
      apiUrl.searchParams.append('page', pageNumber.toString());
      apiUrl.searchParams.append('limit', '100');

      console.log('Fetching photos from:', apiUrl.toString());
      
      const response = await fetch(apiUrl.toString());
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Échec du chargement des photos');
      }
      
      const apiData: APIPhoto[] = await response.json();
      
      // Transformation des données
      const formattedPhotos: Photo[] = apiData
        .filter(photo => !photo.is_deleted && photo.status === 'AVAILABLE')
        .map(photo => ({
          id: photo._id,
          albumId: photo.album_id._id,
          title: photo.filename,
          url: `http://127.0.0.1:3000/uploads/${photo.filename}`,
          date: format(new Date(photo.uploaded_at), 'yyyy-MM-dd'),
          photographer: photo.photographer_id.name
        }));

      if (pageNumber === 1) {
        setPhotos(formattedPhotos);
      } else {
        setPhotos(prev => [...prev, ...formattedPhotos]);
      }
      
      setHasMore(formattedPhotos.length === 100);
    } catch (err) {
      console.error('Erreur lors du chargement des photos:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des photos');
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => {
    if (albumId) {
      setCurrentPage(1);
      setPhotos([]);
      setHasMore(true);
      fetchPhotos(1);
    }
  }, [albumId]);

  const loadMore = () => {
    if (hasMore && !loadingPhotos) {
      setCurrentPage(prev => prev + 1);
      fetchPhotos(currentPage + 1);
    }
  };

  const filteredPhotos = photos.filter(photo => 
    !selectedDate || photo.date === selectedDate
  );

  const isInCart = selectedPhoto ? cart.some(item => 
    item.photoId === selectedPhoto.id && 
    item.filterName === selectedFilterName &&
    item.format === selectedFormat
  ) : false;

  const handleAddToCart = () => {
    if (selectedPhoto && !isInCart) {
      setIsLoading(true);
      try {
        addToCart(selectedPhoto, selectedFormat, selectedFilterName, selectedFilter);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleFilterSelect = (filterClass: string, filterName: string) => {
    setSelectedFilter(filterClass);
    setSelectedFilterName(filterName);
  };

  const handleDownload = async () => {
    if (!selectedPhoto) return;
    
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = selectedPhoto.url;
      });
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      if (!ctx) throw new Error('Could not get canvas context');
      
      ctx.drawImage(img, 0, 0);
      
      if (selectedFilter) {
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
        
        ctx.drawImage(img, 0, 0);
      }
      
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => {
          if (b) resolve(b);
        }, 'image/jpeg', 0.95);
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedPhoto.title}_${selectedFilterName}.jpg`;
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (!albumId) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Album non trouvé</p>
      </div>
    );
  }

  if (loadingPhotos && photos.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <button
            onClick={() => navigate('/albums')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 mr-2" />
            <span className="text-lg">Retour aux albums</span>
          </button>
          
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => setSelectedPhoto(photo)}
              className="cursor-pointer group"
            >
              <div className="relative aspect-square overflow-hidden rounded-lg shadow-md">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-gray-200 text-sm">
                      {format(new Date(photo.date), 'PP')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 text-center">
            <button
              onClick={loadMore}
              disabled={loadingPhotos}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
            >
              {loadingPhotos ? 'Chargement...' : 'Charger plus de photos'}
            </button>
          </div>
        )}

        {selectedPhoto && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-40">
            <div className="bg-white rounded-lg shadow-xl w-[95%] max-w-7xl h-[90vh] flex overflow-hidden">
              {/* Left Sidebar - Formats and Filters */}
              <div className="w-48 bg-gray-50 border-r flex flex-col">
                {/* Formats */}
                <div className="p-2 border-b">
                  <h3 className="font-medium text-sm mb-2">Format</h3>
                  <div className="space-y-1">
                    {photoFormats.map((format) => (
                      <button
                        key={format.value}
                        onClick={() => setSelectedFormat(format.value)}
                        className={`w-full px-2 py-1.5 rounded text-xs font-medium transition-colors flex justify-between items-center ${
                          selectedFormat === format.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <span>{format.label}</span>
                        <span className={selectedFormat === format.value ? 'text-white' : 'text-blue-600'}>
                          {format.value === '13x18' && settings?.small_print_price}€
                          {format.value === '15x21' && settings?.medium_print_price}€
                          {format.value === '20x30' && settings?.large_print_price}€
                          {format.value === '30x40' && settings?.xlarge_print_price}€
                          {format.value === 'email' && settings?.digital_price}€
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div className="p-2 flex-1 overflow-y-auto">
                  <h3 className="font-medium text-sm mb-2">Filtres</h3>
                  <div className="space-y-1">
                    {filters.map((filter) => (
                      <button
                        key={filter.name}
                        onClick={() => handleFilterSelect(filter.class, filter.name)}
                        className={`w-full text-left transition-colors ${
                          selectedFilter === filter.class 
                            ? 'bg-blue-600 text-white' 
                            : 'bg-white text-gray-700 hover:bg-gray-50'
                        } rounded overflow-hidden`}
                      >
                        <div className="relative">
                          <div className="aspect-video">
                            <img
                              src={selectedPhoto.url}
                              alt={`${filter.name} filter`}
                              className={`w-full h-full object-cover ${filter.class}`}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <p className="text-xs font-medium text-white px-1">
                              {filter.name}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Content - Photo and Actions */}
              <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="p-2 border-b flex justify-between items-center bg-white">
                  <div className="flex gap-2">
                    <button
                      onClick={handleAddToCart}
                      disabled={isInCart || isLoading}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded transition-colors ${
                        isInCart || isLoading
                          ? 'bg-gray-200 text-gray-600 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span className="text-sm">
                        {isLoading 
                          ? 'Chargement...' 
                          : isInCart 
                            ? 'Dans le panier' 
                            : t('addToCart')}
                      </span>
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Télécharger</span>
                    </button>
                  </div>
                  <button
                    onClick={() => setSelectedPhoto(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Photo */}
                <div className="flex-1 bg-gray-100 p-2 overflow-hidden">
                  <div className="w-full h-full relative">
                    <img
                      src={selectedPhoto.url}
                      alt={selectedPhoto.title}
                      className={`absolute inset-0 w-full h-full object-contain ${selectedFilter}`}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Cart />
    </div>
  );
};