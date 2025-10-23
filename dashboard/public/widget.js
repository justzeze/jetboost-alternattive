(function() {
  'use strict';

  const config = window.JetboostConfig || {};
  const API_URL = config.apiUrl || 'http://localhost:3000/api';
  const API_KEY = config.apiKey;

  if (!API_KEY) {
    console.error('Jetboost: API key is required. Please set window.JetboostConfig.apiKey');
    return;
  }

  let currentUser = null;
  let authToken = null;
  let wishlistItems = [];

  const storage = {
    get: (key) => {
      try {
        return localStorage.getItem(`jetboost_${key}`);
      } catch (e) {
        return null;
      }
    },
    set: (key, value) => {
      try {
        localStorage.setItem(`jetboost_${key}`, value);
      } catch (e) {
        console.error('Jetboost: Failed to save to localStorage', e);
      }
    },
    remove: (key) => {
      try {
        localStorage.removeItem(`jetboost_${key}`);
      } catch (e) {
        console.error('Jetboost: Failed to remove from localStorage', e);
      }
    }
  };

  async function apiRequest(endpoint, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Jetboost API Error:', error);
      return { success: false, error: error.message };
    }
  }

  async function register(email, password, firstName, lastName) {
    const result = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        projectId: API_KEY,
        email,
        password,
        firstName,
        lastName
      })
    });

    if (result.success) {
      currentUser = result.user;
      authToken = result.token;
      storage.set('token', authToken);
      storage.set('user', JSON.stringify(currentUser));
      await loadWishlist();
      dispatchEvent('auth:login', currentUser);
    }

    return result;
  }

  async function login(email, password) {
    const result = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        projectId: API_KEY,
        email,
        password
      })
    });

    if (result.success) {
      currentUser = result.user;
      authToken = result.token;
      storage.set('token', authToken);
      storage.set('user', JSON.stringify(currentUser));
      await loadWishlist();
      dispatchEvent('auth:login', currentUser);
    }

    return result;
  }

  async function logout() {
    if (authToken) {
      await apiRequest('/auth/logout', {
        method: 'POST'
      });
    }

    currentUser = null;
    authToken = null;
    wishlistItems = [];
    storage.remove('token');
    storage.remove('user');
    dispatchEvent('auth:logout');

    return { success: true };
  }

  async function getCurrentUser() {
    if (!authToken) {
      return null;
    }

    const result = await apiRequest('/auth/me');
    if (result.success) {
      currentUser = result.user;
      return currentUser;
    }

    return null;
  }

  async function loadWishlist() {
    if (!authToken) {
      wishlistItems = [];
      return [];
    }

    const result = await apiRequest('/wishlist');
    if (result.success) {
      wishlistItems = result.items;
      dispatchEvent('wishlist:updated', wishlistItems);
      return wishlistItems;
    }

    return [];
  }

  async function addToWishlist(itemId, itemData = null) {
    if (!authToken) {
      throw new Error('User must be logged in to add to wishlist');
    }

    const result = await apiRequest('/wishlist', {
      method: 'POST',
      body: JSON.stringify({ itemId, itemData })
    });

    if (result.success) {
      wishlistItems.push(result.item);
      dispatchEvent('wishlist:added', result.item);
      dispatchEvent('wishlist:updated', wishlistItems);
    }

    return result;
  }

  async function removeFromWishlist(itemId) {
    if (!authToken) {
      throw new Error('User must be logged in to remove from wishlist');
    }

    const item = wishlistItems.find(i => i.itemId === itemId);
    if (!item) {
      return { success: false, error: 'Item not in wishlist' };
    }

    const result = await apiRequest(`/wishlist/${item.id}`, {
      method: 'DELETE'
    });

    if (result.success) {
      wishlistItems = wishlistItems.filter(i => i.id !== item.id);
      dispatchEvent('wishlist:removed', item);
      dispatchEvent('wishlist:updated', wishlistItems);
    }

    return result;
  }

  function isInWishlist(itemId) {
    return wishlistItems.some(i => i.itemId === itemId);
  }

  function getWishlist() {
    return wishlistItems;
  }

  function isAuthenticated() {
    return !!authToken && !!currentUser;
  }

  function getUser() {
    return currentUser;
  }

  function dispatchEvent(eventName, detail = null) {
    const event = new CustomEvent(`jetboost:${eventName}`, { detail });
    window.dispatchEvent(event);
  }

  async function init() {
    const savedToken = storage.get('token');
    const savedUser = storage.get('user');

    if (savedToken && savedUser) {
      authToken = savedToken;
      try {
        currentUser = JSON.parse(savedUser);
        const user = await getCurrentUser();
        if (user) {
          await loadWishlist();
          dispatchEvent('ready', { user, authenticated: true });
        } else {
          logout();
          dispatchEvent('ready', { authenticated: false });
        }
      } catch (e) {
        logout();
        dispatchEvent('ready', { authenticated: false });
      }
    } else {
      dispatchEvent('ready', { authenticated: false });
    }
  }

  window.Jetboost = {
    register,
    login,
    logout,
    getCurrentUser,
    getUser,
    isAuthenticated,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlist,
    loadWishlist
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
