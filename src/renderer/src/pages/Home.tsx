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
//       // const response = await fetch('http://localhost:3000/api/photos');
//       const response = await fetch('http://localhost:3000/api/photos');

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
//           // url: `http://localhost:3000/uploads/${photo.filename}`,
//           url: `http://localhost:3000/uploads/${photo.filename}`,

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

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import Slider from 'react-slick'
import { LanguageSelector } from '../components/LanguageSelector'
// import { Camera, Calendar, Image, ArrowRight } from 'lucide-react'
// import 'slick-carousel/slick/slick.css';
// import 'slick-carousel/slick/slick-theme.css';

interface APIPhoto {
  _id: string
  album_id: {
    _id: string
    name: string
  }
  photographer_id: {
    _id: string
    name: string
  }
  filename: string
  uploaded_at: string
  status: string
  is_deleted: boolean
}

interface Photo {
  id: string
  url: string
  title: string
  date: string
  photographer?: string
  albumId?: string
  albumName?: string
}

export const Home = () => {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)

  const fetchPhotos = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:3000/api/photos')

      if (!response.ok) {
        throw new Error('Failed to fetch photos')
      }

      const apiPhotos: APIPhoto[] = await response.json()
      console.log('API Photos:', apiPhotos)

      // Filter the photos, keep only non-deleted and available photos, then sort by the most recent
      const formattedPhotos: Photo[] = apiPhotos
        .filter((photo) => !photo.is_deleted && photo.status === 'AVAILABLE')
        .map((photo) => ({
          id: photo._id,
          url: `http://localhost:3000/uploads/${photo.filename}`,
          title: photo.filename,
          date: new Date(photo.uploaded_at).toISOString().split('T')[0],
          photographer: photo.photographer_id?.name || 'Unknown',
          albumId: photo.album_id?._id || '',
          albumName: photo.album_id?.name || 'Uncategorized'
        }))

      // Sort photos by uploaded date (most recent first) and select the latest 21
      const sortedPhotos = formattedPhotos.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      const latestPhotos = sortedPhotos.slice(0, 21)

      setPhotos(latestPhotos)
      console.log('Processed photos:', latestPhotos)
    } catch (err) {
      console.error('Error fetching photos:', err)
      setError(
        err instanceof Error ? err.message : 'Une erreur est survenue lors du chargement des photos'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [])

  // Calculate the number of slides we'll need
  const numberOfSlides = Math.ceil(photos.length / 3)

  // Settings for the slider
  const settings = {
    dots: true,
    infinite: photos.length > 3,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    cssEase: 'cubic-bezier(0.87, 0, 0.13, 1)',
    pauseOnHover: true,
    fade: true,
    beforeChange: (_: number, next: number) => setCurrentSlide(next),
    customPaging: () => (
      <div className="w-2 h-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors"></div>
    ),
    dotsClass: 'slick-dots custom-dots flex gap-2 justify-center'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
      </div>
    )
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
    )
  }

  // If we have no photos, show a fallback message
  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl mb-4">No photos available</p>
          <button
            onClick={() => fetchPhotos()}
            className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  // Render the component
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Render content directly (no slider) when we have 3 or fewer photos */}
      {photos.length <= 3 ? (
        <div className="absolute inset-0 z-10 p-6">
          <div className="h-full grid grid-cols-2 gap-4">
            {/* Left column with 2 horizontal images */}
            <div className="flex flex-col gap-4">
              {photos[0] && (
                <div className="h-1/2 group relative overflow-hidden rounded-lg">
                  <img
                    src={photos[0].url}
                    alt={photos[0].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium mb-1">{photos[0].photographer}</p>
                    <p className="text-white/80 text-xs">{photos[0].albumName}</p>
                  </div>
                </div>
              )}
              
              {photos[1] && (
                <div className="h-1/2 group relative overflow-hidden rounded-lg">
                  <img
                    src={photos[1].url}
                    alt={photos[1].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-sm font-medium mb-1">{photos[1].photographer}</p>
                    <p className="text-white/80 text-xs">{photos[1].albumName}</p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right column with 1 full-height image */}
            {photos[2] && (
              <div className="h-full group relative overflow-hidden rounded-lg">
                <img
                  src={photos[2].url}
                  alt={photos[2].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm font-medium mb-1">{photos[2].photographer}</p>
                  <p className="text-white/80 text-xs">{photos[2].albumName}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        // Use Slider when we have more than 3 photos
        <div className="absolute inset-0 z-10">
          <Slider {...settings}>
            {/* Generate slides based on the available photos */}
            {Array.from({ length: numberOfSlides }).map((_, slideIndex) => {
              // Get the 3 photos for this slide
              const startIdx = slideIndex * 3
              const slidePhotos = [
                photos[startIdx],
                photos[startIdx + 1],
                photos[startIdx + 2]
              ].filter(Boolean) // Remove undefined items
              
              // If we don't have 3 photos, fill with photos from the beginning
              while (slidePhotos.length < 3 && photos.length > 0) {
                slidePhotos.push(photos[slidePhotos.length % photos.length])
              }
              
              return (
                <div key={`slide-${slideIndex}`} className="h-screen">
                  <div className="h-full grid grid-cols-2 gap-4 p-6">
                    {/* Left column with 2 horizontal images */}
                    <div className="flex flex-col gap-4">
                      <div className="h-1/2 group relative overflow-hidden rounded-lg">
                        <img
                          src={slidePhotos[0].url}
                          alt={slidePhotos[0].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-medium mb-1">{slidePhotos[0].photographer}</p>
                          <p className="text-white/80 text-xs">{slidePhotos[0].albumName}</p>
                        </div>
                      </div>
                      
                      <div className="h-1/2 group relative overflow-hidden rounded-lg">
                        <img
                          src={slidePhotos[1].url}
                          alt={slidePhotos[1].title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-white text-sm font-medium mb-1">{slidePhotos[1].photographer}</p>
                          <p className="text-white/80 text-xs">{slidePhotos[1].albumName}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right column with 1 full-height image */}
                    <div className="h-full group relative overflow-hidden rounded-lg">
                      <img
                        src={slidePhotos[2].url}
                        alt={slidePhotos[2].title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-white text-sm font-medium mb-1">{slidePhotos[2].photographer}</p>
                        <p className="text-white/80 text-xs">{slidePhotos[2].albumName}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </Slider>

          {/* Slide Counter with modern design */}
          <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 font-medium text-sm">
            {currentSlide + 1} / {numberOfSlides}
          </div>
        </div>
      )}

      {/* Language Selector with glass morphism */}
      <div className="absolute top-0 right-0 bottom-0 w-20 bg-black/30 backdrop-blur-sm z-30 border-l border-white/10">
        <div className="h-full flex flex-col items-center justify-center">
          <LanguageSelector />
        </div>
      </div>

      {/* Welcome Button with modern glass morphism */}
      <div className="absolute inset-0 flex items-center justify-center z-20">
        <button
          onClick={() => navigate('/albums')}
          className="group bg-black/40 backdrop-blur-md p-8 rounded-xl transform transition-all duration-500 hover:scale-105 hover:bg-black/70 border border-white/10"
        >
          <h1 className="text-white text-4xl md:text-6xl font-bold text-center">{t('welcome')}</h1>
          <div className="h-1 bg-white scale-x-0 group-hover:scale-x-100 transition-transform duration-500 mt-4" />
        </button>
      </div>
    </div>
  )
}