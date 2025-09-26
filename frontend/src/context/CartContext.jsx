import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART':
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return {
          ...state,
          items: state.items.map(item =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + (action.payload.quantity || 1) }
              : item
          )
        };
      }
      
      return {
        ...state,
        items: [...state.items, { ...action.payload, quantity: action.payload.quantity || 1 }]
      };

    case 'REMOVE_FROM_CART':
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(0, action.payload.quantity) }
            : item
        ).filter(item => item.quantity > 0)
      };

    case 'CLEAR_CART':
      return {
        ...state,
        items: []
      };

    case 'SET_SHIPPING_ADDRESS':
      return {
        ...state,
        shippingAddress: action.payload
      };

    case 'SET_PAYMENT_METHOD':
      return {
        ...state,
        paymentMethod: action.payload
      };

    default:
      return state;
  }
};

const initialState = {
  items: [],
  shippingAddress: null,
  paymentMethod: null
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        cartData.items.forEach(item => {
          dispatch({ type: 'ADD_TO_CART', payload: item });
        });
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const addToCart = (product, quantity = 1) => {
    if (product.stock < quantity) {
      throw new Error('Stock insuficiente');
    }
    
    dispatch({
      type: 'ADD_TO_CART',
      payload: {
        id: product.id,
        nombre: product.nombre,
        precio: product.precio,
        imagen_url: product.imagen_urls?.[0] || null,
        tienda_nombre: product.nombre_tienda,
        stock: product.stock,
        quantity
      }
    });
  };

  const removeFromCart = (productId) => {
    dispatch({
      type: 'REMOVE_FROM_CART',
      payload: productId
    });
  };

  const updateQuantity = (productId, quantity) => {
    dispatch({
      type: 'UPDATE_QUANTITY',
      payload: { id: productId, quantity }
    });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const setShippingAddress = (address) => {
    dispatch({
      type: 'SET_SHIPPING_ADDRESS',
      payload: address
    });
  };

  const setPaymentMethod = (method) => {
    dispatch({
      type: 'SET_PAYMENT_METHOD',
      payload: method
    });
  };

  const getCartTotal = () => {
    return state.items.reduce((total, item) => total + (item.precio * item.quantity), 0);
  };

  const getCartItemsCount = () => {
    return state.items.reduce((count, item) => count + item.quantity, 0);
  };

  const getShippingCost = () => {
    const total = getCartTotal();
    return total >= 50000 ? 0 : 5000;
  };

  const getTaxes = () => {
    return getCartTotal() * 0.19;
  };

  const getFinalTotal = () => {
    return getCartTotal() + getShippingCost() + getTaxes();
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setShippingAddress,
    setPaymentMethod,
    getCartTotal,
    getCartItemsCount,
    getShippingCost,
    getTaxes,
    getFinalTotal
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};