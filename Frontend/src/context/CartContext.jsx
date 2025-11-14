import { createContext, useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const CartContext = createContext();
const CART_STORAGE_KEY = "shoppingCart";
const API_URL =
  "https://granreserva-brd0e6efdmhsdddb.canadacentral-01.azurewebsites.net/api/Order";

const loadCartFromStorage = () => {
  try {
    const serializedCart = localStorage.getItem(CART_STORAGE_KEY);
    return serializedCart ? JSON.parse(serializedCart) : [];
  } catch (error) {
    console.error("Error al cargar el carrito desde localStorage:", error);
    return [];
  }
};

const saveCartToStorage = (cart) => {
  try {
    const serializedCart = JSON.stringify(cart);
    localStorage.setItem(CART_STORAGE_KEY, serializedCart);
  } catch (error) {
    console.error("Error al guardar el carrito en localStorage:", error);
  }
};

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children, onPointsUpdate }) => {
  const [cartItems, setCartItems] = useState(loadCartFromStorage);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    saveCartToStorage(cartItems);
  }, [cartItems]);

  const addToCart = (product, amount = 1) => {
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) => item.id === product.id
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        const currentItem = updatedItems[existingItemIndex];
        const theoreticalMax = currentItem.maxStock;

        if (currentItem.amount + amount > theoreticalMax) {
          toast.warn(
            `Solo quedan ${
              theoreticalMax - currentItem.amount
            } unidades disponibles para agregar de ${product.name}.`
          );
          return prevItems;
        }

        updatedItems[existingItemIndex] = {
          ...currentItem,
          amount: currentItem.amount + amount,
        };
        toast.success(`${amount}x ${product.name} agregado/s al carrito.`);
        return updatedItems;
      } else {
        const maxAvailableStock = product.stock;
        if (amount > maxAvailableStock) {
          toast.warn(
            `No hay stock suficiente para agregar ${amount} unidades de ${product.name}. Stock: ${maxAvailableStock}`
          );
          return prevItems;
        }

        const newItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl,
          amount: amount,
          maxStock: product.stock,
        };
        toast.success(`${amount}x ${product.name} agregado/s al carrito.`);
        return [...prevItems, newItem];
      }
    });
  };

  const updateItemAmount = (itemId, newAmount) => {
    setCartItems((prevItems) => {
      const itemIndex = prevItems.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return prevItems;

      if (newAmount <= 0) {
        toast.info(`${prevItems[itemIndex].name} removido del carrito.`);
        return prevItems.filter((item) => item.id !== itemId);
      }

      const itemToUpdate = prevItems[itemIndex];

      if (newAmount > itemToUpdate.maxStock) {
        toast.warn(
          `Solo puedes comprar hasta ${itemToUpdate.maxStock} unidades de ${itemToUpdate.name}.`
        );
        return prevItems;
      }

      const updatedItems = [...prevItems];
      updatedItems[itemIndex] = { ...itemToUpdate, amount: newAmount };
      return updatedItems;
    });
  };

  const removeFromCart = (productId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((item) => item.id === productId);
      if (item) {
        toast.info(`${item.name} removido del carrito.`);
      }
      return prevItems.filter((item) => item.id !== productId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.amount,
    0
  );
  const totalItemsCount = cartItems.reduce(
    (total, item) => total + item.amount,
    0
  );

  const handleCheckout = async () => {
    if (cartItems.length === 0 || isProcessing) {
      if (cartItems.length === 0) toast.warn("El carrito está vacío.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Debes iniciar sesión para completar la compra.");
      return;
    }

    setIsProcessing(true);

    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      amount: item.amount,
    }));

    const payload = {
      items: orderItems,
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();

      if (!response.ok) {
        let errorMsg = "Error al procesar la orden.";
        try {
          const errorData = JSON.parse(responseText);
          errorMsg = errorData.error || errorData.message || errorMsg;
        } catch (jsonError) {
          if (responseText && responseText.length < 150)
            errorMsg = responseText;
        }
        throw new Error(errorMsg);
      } else {
        let newOrder;
        try {
          newOrder = JSON.parse(responseText);
        } catch (e) {
          console.error("Respuesta de orden no es JSON válido:", responseText);
        }

        if (
          newOrder &&
          newOrder.clientCurrentPoints !== undefined &&
          typeof onPointsUpdate === "function"
        ) {
          onPointsUpdate(newOrder.clientCurrentPoints);
          toast.success(
            `Orden #${newOrder.id} creada con éxito! Ganaste ${newOrder.pointsEarned} puntos.`
          );
        } else {
          toast.success("¡Orden creada con éxito!");
        }

        clearCart();
        setIsCartOpen(false);
        navigate("/my-orders");
      }
    } catch (error) {
      console.error("Error en el checkout:", error);
      toast.error(error.message || "Error al comunicarse con el servidor.");
    } finally {
      setIsProcessing(false);
    }
  };

  const contextValue = {
    cartItems,
    addToCart,
    removeFromCart,
    clearCart,
    updateItemAmount,
    totalAmount,
    totalItemsCount,
    isCartOpen,
    setIsCartOpen,
    isProcessing,
    handleCheckout,
  };

  return (
    <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>
  );
};
