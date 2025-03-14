import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  fr: {
    translation: {
      welcome: 'Chercher vos photos',
      selectLanguage: 'Sélectionnez votre langue',
      albums: 'Albums',
      cart: 'Panier',
      addToCart: 'Ajouter au panier',
      dateFilter: 'Filtrer par date',
      noPhotos: 'Aucune photo trouvée',
      checkout: 'Commander'
    }
  },
  en: {
    translation: {
      welcome: 'Search your photos',
      selectLanguage: 'Select your language',
      albums: 'Albums',
      cart: 'Cart',
      addToCart: 'Add to cart',
      dateFilter: 'Filter by date',
      noPhotos: 'No photos found',
      checkout: 'Checkout'
    }
  },
  de: {
    translation: {
      welcome: 'Suchen Sie Ihre Fotos',
      selectLanguage: 'Wählen Sie Ihre Sprache',
      albums: 'Alben',
      cart: 'Warenkorb',
      addToCart: 'In den Warenkorb',
      dateFilter: 'Nach Datum filtern',
      noPhotos: 'Keine Fotos gefunden',
      checkout: 'Zur Kasse'
    }
  },
  it: {
    translation: {
      welcome: 'Cerca le tue foto',
      selectLanguage: 'Seleziona la tua lingua',
      albums: 'Album',
      cart: 'Carrello',
      addToCart: 'Aggiungi al carrello',
      dateFilter: 'Filtra per data',
      noPhotos: 'Nessuna foto trovata',
      checkout: 'Checkout'
    }
  },
  pl: {
    translation: {
      welcome: 'Szukaj swoich zdjęć',
      selectLanguage: 'Wybierz język',
      albums: 'Albumy',
      cart: 'Koszyk',
      addToCart: 'Dodaj do koszyka',
      dateFilter: 'Filtruj według daty',
      noPhotos: 'Nie znaleziono zdjęć',
      checkout: 'Do kasy'
    }
  },
  pt: {
    translation: {
      welcome: 'Procure suas fotos',
      selectLanguage: 'Selecione seu idioma',
      albums: 'Álbuns',
      cart: 'Carrinho',
      addToCart: 'Adicionar ao carrinho',
      dateFilter: 'Filtrar por data',
      noPhotos: 'Nenhuma foto encontrada',
      checkout: 'Finalizar compra'
    }
  },
  cs: {
    translation: {
      welcome: 'Hledejte své fotografie',
      selectLanguage: 'Vyberte svůj jazyk',
      albums: 'Alba',
      cart: 'Košík',
      addToCart: 'Přidat do košíku',
      dateFilter: 'Filtrovat podle data',
      noPhotos: 'Žádné fotky nenalezeny',
      checkout: 'K pokladně'
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'fr',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;