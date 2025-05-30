import { NavigationState } from '@react-navigation/native';

export const NavigationDebugger = {
  // Log navigation state changes
  logNavigationState: (state: NavigationState | undefined, label: string = 'Navigation State') => {
    if (__DEV__) {
      console.log(`[${label}]`, {
        routeNames: state?.routeNames,
        index: state?.index,
        currentRoute: state?.routes[state?.index || 0]?.name,
        params: state?.routes[state?.index || 0]?.params,
        timestamp: new Date().toISOString(),
      });
    }
  },

  // Validate navigation state structure
  validateNavigationState: (state: NavigationState | null): boolean => {
    if (!state) return false;
    
    try {
      return (
        typeof state === 'object' &&
        Array.isArray(state.routes) &&
        state.routes.length > 0 &&
        typeof state.index === 'number' &&
        state.index >= 0 &&
        state.index < state.routes.length
      );
    } catch (error) {
      console.error('Navigation state validation error:', error);
      return false;
    }
  },

  // Get current route info
  getCurrentRouteInfo: (state: NavigationState | null) => {
    if (!state || !NavigationDebugger.validateNavigationState(state)) {
      return null;
    }

    const currentRoute = state.routes[state.index];
    return {
      name: currentRoute.name,
      params: currentRoute.params,
      key: currentRoute.key,
    };
  },

  // Clear persisted navigation state (for debugging)
  clearPersistedNavigation: () => {
    if (__DEV__) {
      const { mmkvUtils } = require('../store/mmkv/storage');
      mmkvUtils.setNavigationState(null);
      console.log('✅ Persisted navigation state cleared - app will start fresh');
    }
  },

  // Force clear all navigation data
  forceResetNavigation: () => {
    if (__DEV__) {
      const { storage } = require('../store/mmkv/storage');
      storage.delete('navigationState');
      console.log('✅ Force reset: All navigation data cleared from MMKV');
    }
  },
}; 