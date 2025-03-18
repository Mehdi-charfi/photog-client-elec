import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { ShoppingCart, X, ChevronDown, Trash2, CreditCard, Loader2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { PhotoFormat } from '../types'
import { AnimatePresence, motion } from 'framer-motion'

interface OrderForm {
  customer_name: string
  customer_email: string
  room_number: string
  date_depart: string
}

// Format helpers
const formatToSize = (format: PhotoFormat): 'small' | 'medium' | 'large' => {
  switch (format) {
    case '13x18':
    case '15x21':
      return 'small'
    case '20x30':
      return 'medium'
    case '30x40':
      return 'large'
    default:
      return 'small'
  }
}

const getFormatPrice = (format: PhotoFormat, settings: any) => {
  switch (format) {
    case '13x18':
      return settings?.small_print_price || 0
    case '15x21':
      return settings?.medium_print_price || 0
    case '20x30':
      return settings?.large_print_price || 0
    case '30x40':
      return settings?.xlarge_print_price || 0
    case 'email':
      return settings?.digital_price || 0
    default:
      return 0
  }
}

export const Cart: React.FC = () => {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useTranslation()
  const { cart, removeFromCart, clearCart, settings, setSettings } = useStore()
  const [showOrderForm, setShowOrderForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSuccess, setOrderSuccess] = useState(false)
  const [checkoutStep, setCheckoutStep] = useState(1)
  const [orderForm, setOrderForm] = useState<OrderForm>({
    customer_name: '',
    customer_email: '',
    room_number: '',
    date_depart: ''
  })

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/settings')
        if (!response.ok) throw new Error('Failed to fetch settings')
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error('Error fetching settings:', error)
      }
    }

    if (!settings) {
      fetchSettings()
    }
  }, [settings, setSettings])

  const total = cart.reduce((sum, item) => sum + getFormatPrice(item.format, settings), 0)

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const orderData = {
      customer_name: orderForm.customer_name,
      customer_email: orderForm.customer_email,
      room_number: orderForm.room_number,
      date_depart: new Date(orderForm.date_depart),
      items: cart.map((item) => ({
        photo_id: item.photoId,
        price: getFormatPrice(item.format, settings),
        print_size: formatToSize(item.format)
      })),
      delivery_method: 'print',
      delivery_price: 0,
      total_amount: total,
      status: 'pending'
    }

    try {
      const response = await fetch('http://localhost:3000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit order')
      }

      setOrderSuccess(true)
      setTimeout(() => {
        clearCart()
        setOrderForm({
          customer_name: '',
          customer_email: '',
          room_number: '',
          date_depart: ''
        })
        setShowOrderForm(false)
        setCheckoutStep(1)
        setOrderSuccess(false)
        setIsOpen(false)
        navigate('/')
      }, 3000)
    } catch (error) {
      console.error('Error submitting order:', error)
      alert("Erreur lors de l'envoi de la commande. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleCart = () => {
    setIsOpen(!isOpen)
    if (!isOpen) {
      // Reset form states when opening
      setShowOrderForm(false)
      setCheckoutStep(1)
    }
  }

  const handleRemoveItem = (photoId: string) => {
    removeFromCart(photoId)
    if (cart.length === 1) {
      setShowOrderForm(false)
      setCheckoutStep(1)
    }
  }

  const renderCheckoutStep = () => {
    switch (checkoutStep) {
      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                type="text"
                required
                value={orderForm.customer_name}
                onChange={(e) => setOrderForm({ ...orderForm, customer_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
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
                type="button"
                onClick={() => setCheckoutStep(2)}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                disabled={!orderForm.customer_name || !orderForm.customer_email}
              >
                Continuer
              </button>
              <button
                type="button"
                onClick={() => setShowOrderForm(false)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              >
                Retour
              </button>
            </div>
          </motion.div>
        )
      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de départ</label>
              <input
                type="date"
                required
                value={orderForm.date_depart}
                onChange={(e) => setOrderForm({ ...orderForm, date_depart: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCheckoutStep(1)}
                className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition-colors"
              >
                Précédent
              </button>
              <button
                type="submit"
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors flex justify-center items-center"
                disabled={!orderForm.room_number || !orderForm.date_depart || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <CreditCard className="w-5 h-5 mr-2" />
                )}
                {isSubmitting ? 'Traitement...' : 'Commander'}
              </button>
            </div>
          </motion.div>
        )
      default:
        return null
    }
  }

  const renderSuccessMessage = () => {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-4 text-center"
      >
        <div className="bg-green-100 p-4 rounded-lg mb-4">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-green-800 mb-2">
            Votre commande a été envoyée avec succès!
          </h3>
          <p className="text-green-700">
            Merci pour votre achat. Vous allez recevoir un email de confirmation.
          </p>
        </div>
        <div className="text-sm text-gray-500">Redirection en cours...</div>
      </motion.div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Cart Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleCart}
        className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors relative"
      >
        <ShoppingCart className="w-6 h-6" />
        {cart.length > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center"
          >
            {cart.length}
          </motion.span>
        )}
      </motion.button>

      {/* Cart Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="absolute bottom-20 right-0 w-96 bg-white rounded-lg shadow-xl overflow-hidden"
          >
            <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  <h2 className="text-lg font-semibold">{t('cart')}</h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {orderSuccess ? (
              renderSuccessMessage()
            ) : (
              <>
                <div className="max-h-96 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                      <div className="mb-4">
                        <ShoppingCart className="w-16 h-16 mx-auto text-gray-300" />
                      </div>
                      <p className="text-lg">Votre panier est vide</p>
                      <p className="text-sm mt-2">
                        Ajoutez des photos à votre panier pour commencer
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {cart.map((item, index) => (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          key={`${item.photoId}-${item.filterName}-${item.format}`}
                          className="p-4 flex items-center space-x-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="relative w-20 h-20 overflow-hidden rounded-lg">
                            <img
                              src={item.photo.url}
                              alt={item.photo.title}
                              className={`w-full h-full object-cover ${item.filterClass}`}
                            />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-medium">{item.photo.title}</h3>
                            <p className="text-sm text-gray-500">
                              {item.filterName} • {item.format}
                            </p>
                            <p className="text-sm font-medium text-blue-600">
                              {getFormatPrice(item.format, settings)}€
                            </p>
                          </div>
                          <button
                            onClick={() => handleRemoveItem(item.photoId)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="p-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-medium text-gray-700">Total:</span>
                      <span className="font-bold text-lg text-blue-600">{total}TND</span>
                    </div>

                    {!showOrderForm ? (
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowOrderForm(true)}
                          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <CreditCard className="w-5 h-5 mr-2" />
                          {t('checkout')}
                        </button>
                        <button
                          onClick={() => clearCart()}
                          className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Vider le panier
                        </button>
                      </div>
                    ) : (
                      <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onSubmit={handleSubmitOrder}
                        className="space-y-4"
                      >
                        <div className="flex items-center justify-center mb-4">
                          <div className="flex items-center w-full">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                checkoutStep >= 1
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              1
                            </div>
                            <div
                              className={`h-1 flex-1 ${
                                checkoutStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'
                              }`}
                            ></div>
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                checkoutStep >= 2
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-200 text-gray-500'
                              }`}
                            >
                              2
                            </div>
                          </div>
                        </div>

                        <AnimatePresence mode="wait">
                          {renderCheckoutStep()}
                        </AnimatePresence>
                      </motion.form>
                    )}
                  </div>
                )}
              </>
            )}

            <div className="p-2 border-t text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                <ChevronDown className="w-5 h-5 mx-auto" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}