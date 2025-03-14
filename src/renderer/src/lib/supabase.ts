import { createClient } from '@supabase/supabase-js';
import { Photo, Album, PhotoFormat } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API pour récupérer tous les albums
export async function getAlbums(): Promise<Album[]> {
  // Implémentation de l'API:
  // const { data, error } = await supabase
  //   .from('albums')
  //   .select('*')
  //   .eq('user_id', supabase.auth.user()?.id);
  // 
  // if (error) throw error;
  // return data;
  return [];
}

// API pour récupérer toutes les photos d'un album
export async function getPhotosByAlbumId(albumId: string): Promise<Photo[]> {
  // Implémentation de l'API:
  // const { data, error } = await supabase
  //   .from('photos')
  //   .select('*')
  //   .eq('album_id', albumId)
  //   .eq('user_id', supabase.auth.user()?.id);
  // 
  // if (error) throw error;
  // return data;
  return [];
}

// API pour récupérer une photo spécifique
export async function getPhotoById(photoId: string): Promise<Photo | null> {
  // Implémentation de l'API:
  // const { data, error } = await supabase
  //   .from('photos')
  //   .select('*')
  //   .eq('id', photoId)
  //   .eq('user_id', supabase.auth.user()?.id)
  //   .single();
  // 
  // if (error) throw error;
  // return data;
  return null;
}

// API pour récupérer les formats de photos et leurs prix
export async function getPhotoFormats(): Promise<Array<{
  value: PhotoFormat;
  label: string;
  price: number;
}>> {
  // Implémentation de l'API:
  // const { data, error } = await supabase
  //   .from('photo_formats')
  //   .select('*')
  //   .order('price', { ascending: true });
  // 
  // if (error) throw error;
  // return data.map(format => ({
  //   value: format.size as PhotoFormat,
  //   label: format.label,
  //   price: format.price
  // }));
  return [];
}

// API pour sauvegarder une photo filtrée
export async function saveFilteredPhoto(
  photoId: string,
  filterName: string,
  filterClass: string
): Promise<void> {
  // Implémentation de l'API:
  // const { error } = await supabase
  //   .from('filtered_photos')
  //   .insert({
  //     original_photo_id: photoId,
  //     filter_name: filterName,
  //     filter_class: filterClass,
  //     user_id: supabase.auth.user()?.id
  //   });
  // 
  // if (error) throw error;
}

// API pour récupérer les photos filtrées d'un utilisateur
export async function getFilteredPhotos(): Promise<Photo[]> {
  // Implémentation de l'API:
  // const { data, error } = await supabase
  //   .from('filtered_photos')
  //   .select(`
  //     *,
  //     original_photo:photos(*)
  //   `)
  //   .eq('user_id', supabase.auth.user()?.id);
  // 
  // if (error) throw error;
  // return data.map(filtered => ({
  //   ...filtered.original_photo,
  //   filter_name: filtered.filter_name,
  //   filter_class: filtered.filter_class
  // }));
  return [];
}