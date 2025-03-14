// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useTranslation } from 'react-i18next';
// import { Camera, Image, Calendar } from 'lucide-react';

// // Interface pour les albums de l'API
// interface Album {
//   _id: string;
//   name: string;
//   cover_image: string;
//   date: string;
//   photoCount: number;
// }

// /*
// Pour utiliser l'API des albums:
// 1. Faire un appel GET à http://127.0.0.1:3000/api/albums
// 2. L'API retourne un tableau d'albums avec:
//    - id: identifiant unique de l'album
//    - name: le name de l'album
//    - cover_image: l'URL de l'image de couverture
// */

// export const Albums: React.FC = () => {
//   const navigate = useNavigate();
//   const { t } = useTranslation();
//   const [albums, setAlbums] = useState<Album[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchAlbums = async () => {
//       try {
//         const response = await fetch('http://127.0.0.1:3000/api/albums');
//         if (!response.ok) {
//           throw new Error('Failed to fetch albums');
//         }
//         const data = await response.json();
//         console.log(data);
//         // Transformer les données pour correspondre à notre interface
//         const formattedAlbums = data.map((album: any) => ({
//           _id: album._id,
//           name: album.name,
//           cover_image: `http://127.0.0.1:3000/uploads/${album.cover_image}`,
//           date: new Date().toISOString().split('T')[0], // Date par défaut pour l'exemple
//           photoCount: 0 // namebre par défaut pour l'exemple
//         }));
//         setAlbums(formattedAlbums);
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'Une erreur est survenue');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAlbums();
//   }, []);

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-red-500">{error}</p>
//       </div>
//     );
//   }

//   return (  
//     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//       {albums.map((album) => (
//         <div
//           // key={`${album._id}`}       
//           key={album._id   || `fallback-${album.name}`}
//           // onClick={() => navigate(`/albums/${album._id}`)}
//           onClick={() => {
//             console.log('Navigating to album with ID:', album._id);
//             navigate(`/albums/${album._id}`);}}
          
//           className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
//         >
//           {/* Image Container */}
//           <div className="relative aspect-[4/3] overflow-hidden">
//             <img
//               src={album.cover_image}
//               alt={album.name}
//               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
//           </div>

//           {/* Content */}
//           <div className="absolute inset-0 flex flex-col justify-end p-6">
//             {/* Album Title */}
//             <h3 className="text-2xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:translate-x-2">
//               {album.name}
//             </h3>

//             {/* Album Info */}
//             <div className="flex items-center gap-4 text-white/90">
//               <div className="flex items-center gap-1">
//                 <Image className="w-4 h-4" />
//                 <span className="text-sm">{album.photoCount} photos</span>
//               </div>
//               <div className="flex items-center gap-1">
//                 <Calendar className="w-4 h-4" />
//                 <span className="text-sm">{album.date}</span>
//               </div>
//             </div>

//             {/* Hover Effect Line */}
//             <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
//           </div>

//           {/* Camera Icon Overlay */}
//           <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
//             <Camera className="w-5 h-5 text-white" />
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Camera, Image, Calendar } from 'lucide-react';

// Interface pour les albums de l'API
interface Album {
  _id: string;
  name: string;
  cover_image: string;
  date: string;
  photoCount: number;
}

export const Albums: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer for automatic navigation
  useEffect(() => {
    // Set up the timer to navigate back to the home page after 1 minute (60000 milliseconds)
    const timer = setTimeout(() => {
      console.log("1 minute passed, redirecting to the home page...");
      navigate('/');
    }, 60000);

    // Clean up the timer when the component unmounts or when navigation happens
    return () => clearTimeout(timer);
  }, [navigate]);

  // Function to fetch albums from the API
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/albums');
        if (!response.ok) {
          throw new Error('Failed to fetch albums');
        }
        const data = await response.json();
        console.log(data);
        const formattedAlbums = data.map((album: any) => ({
          _id: album._id,
          name: album.name,
          cover_image: `http://127.0.0.1:3000/uploads/${album.cover_image}`,
          date: new Date().toISOString().split('T')[0], // Default date for example
          // photoCount: 0 // Default photo count for example
        }));
        setAlbums(formattedAlbums);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  if (loading) {
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
    <div className="min-h-screen ">
      {/* Back to Home Button */}
      <button
        onClick={() => navigate('/')}
        className="fixed top-4 left-4 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-all"
      >
        Back to Home
      </button>

      {/* Album Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {albums.map((album) => (
          <div
            key={album._id || `fallback-${album.name}`}
            onClick={() => {
              console.log('Navigating to album with ID:', album._id);
              navigate(`/albums/${album._id}`);
            }}
            className="group relative bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
              <img
                src={album.cover_image}
                alt={album.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-70 transition-opacity" />
            </div>

            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-end p-6">
              {/* Album Title */}
              <h3 className="text-2xl font-bold text-white mb-2 transform transition-transform duration-300 group-hover:translate-x-2">
                {album.name}
              </h3>

              {/* Album Info */}
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1">
                  <Image className="w-4 h-4" />
                  <span className="text-sm">{album.photoCount} photos</span>
                </div>
                {/* <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{album.date}</span>
                </div> */}
              </div>

              {/* Hover Effect Line */}
              <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
            </div>

            {/* Camera Icon Overlay */}
            <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-transform duration-300">
              <Camera className="w-5 h-5 text-white" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
