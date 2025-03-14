// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import Slider from 'react-slick';
// import { LanguageSelector } from '../components/LanguageSelector';
// import { Camera, Calendar, Image, ArrowRight } from 'lucide-react';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

// interface APIPhoto {
//   _id: string;
//   album_id: {
//     _id: string;
//     name: string;
//   };
//   photographer_id: {
//     _id: string;
//     name: string;
//   };
//   filename: string;
//   uploaded_at: string;
//   status: string;
//   is_deleted: boolean;
// }

// interface PhotoGroup {
//   landscape: Photo;
//   portraits: Photo[];
// }

// interface Photo {
//   id: string;
//   url: string;
//   title: string;
//   date: string;
//   photographer?: string;
//   albumId?: string;
//   albumName?: string;
// }

// export const Home = () => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const [photoGroups, setPhotoGroups] = useState<PhotoGroup[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   // Fonction pour vérifier si une photo est en mode portrait
//   const isPortrait = (filename: string): boolean => {
//     return filename.toLowerCase().includes('portrait');
//   };

//   const fetchPhotos = async () => {
//     try {
//       setLoading(true);
//       // const response = await fetch('http://127.0.0.1:3000/api/photos');
//       const response = await fetch('http://127.0.0.1:3000/api/photos');

//       if (!response.ok) {
//         throw new Error('Failed to fetch photos');
//       }
      
//       const apiPhotos: APIPhoto[] = await response.json();
//       console.log(apiPhotos);
//       console.log(apiPhotos[0].album_id._id);
//       // Filtrer les photos valides et les transformer
//       const formattedPhotos: Photo[] = apiPhotos
//         .filter(photo => !photo.is_deleted && photo.status === 'AVAILABLE')
//         .map(photo => ({
          
//           id: photo._id,
//           // url: `http://127.0.0.1:3000/uploads/${photo.filename}`,
//           url: `http://127.0.0.1:3000/uploads/${photo.filename}`,
          
//           title: photo.filename,
//           date: new Date(photo.uploaded_at).toISOString().split('T')[0],
//           photographer: photo.photographer_id.name,
//           albumId: photo.album_id._id,
//           albumName: photo.album_id.name
//         }));

//       // Séparer les photos en paysage et portrait
//       const landscapes = formattedPhotos.filter(photo => (photo.title));
//       const portraits = formattedPhotos.filter(photo => isPortrait(photo.title));

//       // Mélanger les tableaux
//       const shuffleArray = <T extends unknown>(array: T[]): T[] => {
//         const shuffled = [...array];
//         for (let i = shuffled.length - 1; i > 0; i--) {
//           const j = Math.floor(Math.random() * (i + 1));
//           [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
//         }
//         return shuffled;
//       };

//       const shuffledLandscapes = shuffleArray(landscapes);
//       const shuffledPortraits = shuffleArray(portraits);

//       // Créer des groupes de photos (1 paysage + 2 portraits)
//       const groups: PhotoGroup[] = [];
//       shuffledLandscapes.forEach((landscape, index) => {
//         const startIdx = index * 2;
//         const portraitsForGroup = shuffledPortraits.slice(startIdx, startIdx + 2);
        
//         if (portraitsForGroup.length === 2) {
//           groups.push({
//             landscape,
//             portraits: portraitsForGroup
//           });
//         }
//       });

//       setPhotoGroups(groups);
//       console.log('groups log ',groups);
//     } catch (err) {
//       console.error('Error fetching photos:', err);
//       setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des photos');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchPhotos();
//   }, []);

//   const settings = {
//     dots: false,
//     infinite: true,
//     speed: 1000,
//     slidesToShow: 1,
//     slidesToScroll: 1,
//     autoplay: true,
//     autoplaySpeed: 5000,
//     cssEase: 'cubic-bezier(0.87, 0, 0.13, 1)',
//     pauseOnHover: true,
//     fade: true,
//     beforeChange: (_: number, next: number) => setCurrentSlide(next)
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-black flex items-center justify-center">
//         <div className="text-white text-center">
//           <p className="text-xl mb-4">{error}</p>
//           <button
//             onClick={() => fetchPhotos()}
//             className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
//           >
//             Réessayer
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-black relative overflow-hidden">
//       {/* Slider Container */}
//       <div className="absolute inset-0">
//         <Slider {...settings}>
//           {photoGroups.map((group, groupIndex) => (
//             <div key={groupIndex} className="h-screen">
//               <div className="h-full flex">
//                 {/* Photo horizontale (moitié gauche) */}
//                 <div className="w-1/2 h-full p-1">
//                   <div className="h-full relative overflow-hidden group">
//                     <img
//                       src={group.landscape.url}
//                       alt={group.landscape.title}
//                       className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                     />
//                     <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                    
//                     {/* Metadata overlay */}
//                     <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
//                       <p className="text-white text-sm mb-1">{group.landscape.photographer}</p>
//                       <p className="text-white/80 text-xs">{group.landscape.albumName}</p>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Photos verticales (moitié droite) */}
//                 <div className="w-1/2 h-full flex flex-col">
//                   {group.portraits.map((photo, index) => (
//                     <div key={photo.id} className="h-1/2 p-1">
//                       <div className="h-full relative overflow-hidden group">
//                         <img
//                           src={photo.url}
//                           alt={photo.title}
//                           className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//                         />
//                         <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                        
//                         {/* Metadata overlay */}
//                         <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
//                           <p className="text-white text-sm mb-1">{photo.photographer}</p>
//                           <p className="text-white/80 text-xs">{photo.albumName}</p>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </Slider>

//         {/* Slide Counter */}
//         <div className="absolute bottom-8 left-8 text-white/80 font-medium">
//           {currentSlide + 1} / {photoGroups.length}
//         </div>
//       </div>

//       {/* Language Selector */}
//       <div className="absolute top-0 right-0 bottom-0 w-20 bg-black/30 backdrop-blur-sm z-30">
//         <div className="h-full flex flex-col items-center justify-center">
//           <LanguageSelector />
//         </div>
//       </div>

//       {/* Welcome Button */}
//       <div className="absolute inset-0 flex items-center justify-center z-20">
//         <button
//           onClick={() => navigate('/albums')}
//           className="group bg-black/50 backdrop-blur-sm p-8 rounded-lg transform transition-all duration-300 hover:scale-110 hover:bg-black/70"
//         >
//           <h1 className="text-white text-4xl md:text-6xl font-bold text-center">
//             {t('welcome')}
//           </h1>
//           <div className="h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 mt-4" />
//         </button>
//       </div>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Slider from 'react-slick';
import { LanguageSelector } from '../components/LanguageSelector';
import { Camera, Calendar, Image, ArrowRight } from 'lucide-react';
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

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
}

interface Photo {
  id: string;
  url: string;
  title: string;
  date: string;
  photographer?: string;
  albumId?: string;
  albumName?: string;
}

export const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:3000/api/photos');

      if (!response.ok) {
        throw new Error('Failed to fetch photos');
      }

      const apiPhotos: APIPhoto[] = await response.json();
      console.log(apiPhotos);

      // Filter the photos, keep only non-deleted and available photos, then sort by the most recent
      const formattedPhotos: Photo[] = apiPhotos
        .filter(photo => !photo.is_deleted && photo.status === 'AVAILABLE')
        .map(photo => ({
          id: photo._id,
          url: `http://127.0.0.1:3000/uploads/${photo.filename}`,
          title: photo.filename,
          date: new Date(photo.uploaded_at).toISOString().split('T')[0],
          photographer: photo.photographer_id.name,
          albumId: photo.album_id._id,
          albumName: photo.album_id.name
        }));

      // Sort photos by uploaded date (most recent first) and select the latest 20
      const sortedPhotos = formattedPhotos.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const latest20Photos = sortedPhotos.slice(0, 20);

      setPhotos(latest20Photos);
    } catch (err) {
      console.error('Error fetching photos:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des photos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const settings = {
    dots: false,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,  // Only show 1 slide at a time (even though the slide contains multiple images)
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: 'cubic-bezier(0.87, 0, 0.13, 1)',
    pauseOnHover: true,
    fade: true,
    beforeChange: (_: number, next: number) => setCurrentSlide(next)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">{error}</p>
          <button
            onClick={() => fetchPhotos()}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Slider Container */}
      <div className="absolute inset-0">
        <Slider {...settings}>
          {photos.map((photo, index) => (
            <div key={photo.id} className="h-screen">
              <div className="h-full grid grid-cols-3 gap-4 px-4 py-6">
                {/* Loop through the photos and show them in a grid layout */}
                {photos.slice(index * 3, index * 3 + 3).map((photo, photoIndex) => (
                  <div key={photoIndex} className="group relative">
                    <img
                      src={photo.url}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <p className="text-white text-sm mb-1">{photo.photographer}</p>
                      <p className="text-white/80 text-xs">{photo.albumName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </Slider>

        {/* Slide Counter */}
        <div className="absolute bottom-8 left-8 text-white/80 font-medium">
          {currentSlide + 1} / {photos.length}
        </div>
      </div>

      {/* Language Selector */}
      <div className="absolute top-0 right-0 bottom-0 w-20 bg-black/30 backdrop-blur-sm z-30">
        <div className="h-full flex flex-col items-center justify-center">
          <LanguageSelector />
        </div>
      </div>

      {/* Welcome Button */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <button
          onClick={() => navigate('/albums')}
          className="group bg-black/50 backdrop-blur-sm p-8 rounded-lg transform transition-all duration-300 hover:scale-110 hover:bg-black/70"
        >
          <h1 className="text-white text-4xl md:text-6xl font-bold text-center">
            {t('welcome')}
          </h1>
          <div className="h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-300 mt-4" />
        </button>
      </div>
    </div>
  );
};
