import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, X, ChevronUp, ChevronDown, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { PhotoFormat } from '../types';

interface OrderForm {
  customer_name: string;
  customer_email: string;
  room_number: string;
  date_depart: string;
}

const formatToSize = (format: PhotoFormat): 'small' | 'medium' | 'large' => {
  switch (format) {
    case '13x18':
    case '15x21':
      return 'small';
    case '20x30':
      return 'medium';
    case '30x40':
      return 'large';
    default:
      return 'small';
  }
};

const getFormatPrice = (format: PhotoFormat, settings: any) => {
  switch (format) {
    case '13x18':
      return settings?.small_print_price || 0;
    case '15x21':
      return settings?.medium_print_price || 0;
    case '20x30':
      return settings?.large_print_price || 0;
    case '30x40':
      return settings?.xlarge_print_price || 0;
    case 'email':
      return settings?.digital_price || 0;
    default:
      return 0;
  }
};

export const Cart: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { cart, removeFromCart, clearCart, settings, setSettings } = useStore();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customer_name: '',
    customer_email: '',
    room_number: '',
    date_depart: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://127.0.0.1:3000/api/settings');
        if (!response.ok) throw new Error('Failed to fetch settings');
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    if (!settings) {
      fetchSettings();
    }
  }, [settings, setSettings]);

  const total = cart.reduce((sum, item) => sum + getFormatPrice(item.format, settings), 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const orderData = {
      customer_name: orderForm.customer_name,
      customer_email: orderForm.customer_email,
      room_number: orderForm.room_number,
      date_depart: new Date(orderForm.date_depart),
      items: cart.map(item => ({
        photo_id: item.photoId,
        price: getFormatPrice(item.format, settings),
        print_size: formatToSize(item.format),
      })),
      delivery_method: 'print',
      delivery_price: 0,
      total_amount: total,
      status: 'pending'
    };

    try {
      const response = await fetch('http://127.0.0.1:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit order');
      }

      clearCart();
      setOrderForm({
        customer_name: '',
        customer_email: '',
        room_number: '',
        date_depart: ''
      });
      setShowOrderForm(false);
      alert('Commande envoyée avec succès !');
      navigate('/'); // Redirection vers la page d'accueil
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('Erreur lors de l\'envoi de la commande. Veuillez réessayer.');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Cart Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
            {cart.length}
          </span>
        )}
      </button>

      {/* Cart Panel */}
      <div
        className={`absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl transform transition-transform duration-300 ${
          isOpen ? 'translate-y-0' : 'translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">{t('cart')}</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {cart.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              Votre panier est vide
            </div>
          ) : (
            <>
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={`${item.photoId}-${item.filterName}-${item.format}`} className="p-4 flex items-center space-x-4">
                    <div className="relative w-20 h-20">
                      <img
                        src={item.photo.url}
                        alt={item.photo.title}
                        className={`w-full h-full object-cover rounded ${item.filterClass}`}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.photo.title}</h3>
                      <p className="text-sm text-gray-500">{item.filterName}</p>
                      <p className="text-sm font-medium text-blue-600">
                        {item.format} - {getFormatPrice(item.format, settings)}€
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.photoId)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Total:</span>
                  <span className="font-bold text-lg">{total}€</span>
                </div>

                {!showOrderForm ? (
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowOrderForm(true)}
                      className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                    >
                      {t('checkout')}
                    </button>
                    <button
                      onClick={() => clearCart()}
                      className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors"
                    >
                      Vider le panier
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitOrder} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nom
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.customer_name}
                        onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de départ
                      </label>
                      <input
                        type="date"
                        required
                        value={orderForm.date_depart}
                        onChange={(e) => setOrderForm({ ...orderForm, date_depart: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Numéro de chambre
                      </label>
                      <input
                        type="text"
                        required
                        value={orderForm.room_number}
                        onChange={(e) => setOrderForm({ ...orderForm, room_number: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        required
                        value={orderForm.customer_email}
                        onChange={(e) => setOrderForm({ ...orderForm, customer_email: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                      >
                        Commander
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowOrderForm(false)}
                        className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
                      >
                        Retour
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-2 border-t text-center">
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isOpen ? <ChevronDown className="w-5 h-5 mx-auto" /> : <ChevronUp className="w-5 h-5 mx-auto" />}
          </button>
        </div>
      </div>
    </div>
  );
};