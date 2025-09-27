import { createContext, useEffect, useState } from "react";
import { products } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const ShopContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const ShopContextProvider = (props) => {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  const currency = "$";
  const delivery_fee = 10;

  useEffect(() => {
    // INFO: Load cart items from localStorage when the component mounts
    const storedCartItems = JSON.parse(localStorage.getItem("cartItems"));
    if (storedCartItems) {
      setCartItems(storedCartItems);
    }
    
    // INFO: Load token from localStorage
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    // INFO: Save cart items to localStorage whenever cartItems changes
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    // INFO: Get user data when token changes
    if (token) {
      getUserData();
    } else {
      setUserData(null);
    }
  }, [token]);

  const addToCart = async (itemId, size) => {
    if (!size) {
      toast.error("Please Select a Size");
      return;
    } else {
      toast.success("Item Added To The Cart");
    }

    let cartData = structuredClone(cartItems);
    let quantity = 1;

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
        quantity = cartData[itemId][size];
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    setCartItems(cartData);

    // Track add to cart action
    const product = products.find(p => p._id === itemId);
    trackUserAction('add_to_cart', {
      productId: itemId,
      productName: product?.name || 'Unknown Product',
      quantity: 1,
      metadata: { size }
    });
  };

  const getCartCount = () => {
    let totalCount = 0;
    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCount += cartItems[items][item];
          }
        } catch (error) {
          // INFO: Error Handling
        }
      }
    }
    return totalCount;
  };

  const updateQuantity = async (itemId, size, quantity) => {
    if (quantity === 0) {
      const productData = products.find((product) => product._id === itemId);
      toast.success("Item Removed From The Cart");
    }

    let cartData = structuredClone(cartItems);

    cartData[itemId][size] = quantity;

    setCartItems(cartData);
  };

  const getCartAmount = () => {
    let totalAmount = 0;
    for (const items in cartItems) {
      let itemInfo = products.find((product) => product._id === items);
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalAmount += itemInfo.price * cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalAmount;
  };

  // INFO: Get user data from backend using token
  const getUserData = async () => {
    try {
      const response = await axios.post(`${backendUrl}/api/user/get-profile`, {}, {
        headers: { token }
      });
      
      if (response.data.success) {
        setUserData(response.data.userData);
      }
    } catch (error) {
      console.error("Error getting user data:", error);
      // If token is invalid, clear it
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // INFO: Login function to set token and get user data
  const login = (userToken) => {
    setToken(userToken);
    localStorage.setItem("token", userToken);
  };

  // INFO: Logout function
  const logout = () => {
    setToken("");
    setUserData(null);
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/");
  };

  // INFO: Track user actions for analytics
  const trackUserAction = async (action, data = {}) => {
    try {
      await axios.post(`${backendUrl}/api/analytics/track`, {
        action,
        ...data
      }, {
        headers: token ? { token } : {}
      });
    } catch (error) {
      // Silently fail analytics tracking to not interrupt user experience
      console.log("Analytics tracking failed:", error);
    }
  };

  const value = {
    products,
    currency,
    delivery_fee,
    search,
    setSearch,
    showSearch,
    setShowSearch,
    cartItems,
    addToCart,
    getCartCount,
    updateQuantity,
    getCartAmount,
    navigate,
    token,
    setToken,
    userData,
    login,
    logout,
    getUserData,
    trackUserAction,
  };

  return (
    <ShopContext.Provider value={value}>{props.children}</ShopContext.Provider>
  );
};

export default ShopContextProvider;
