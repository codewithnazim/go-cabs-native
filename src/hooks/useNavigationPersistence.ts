import { useEffect, useCallback, useRef } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { NavigationState } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import { 
  navigationStateAtom, 
  navigationLoadingAtom, 
  isFirstLaunchAtom 
} from '../store/atoms/navigation/navigationAtoms';
import { mmkvUtils } from '../store/mmkv/storage';
import { NavigationDebugger } from '../utils/navigationDebugger';

export const useNavigationPersistence = () => {
  const [navigationState, setNavigationState] = useRecoilState(navigationStateAtom);
  const setNavigationLoading = useSetRecoilState(navigationLoadingAtom);
  const setIsFirstLaunch = useSetRecoilState(isFirstLaunchAtom);
  
  // Prevent multiple initializations
  const isInitialized = useRef(false);
  const isRestoring = useRef(false);

  // Save navigation state when it changes (but not during restoration)
  const handleNavigationStateChange = useCallback((state: NavigationState | undefined) => {
    // Don't save during restoration to prevent loops
    if (isRestoring.current || !isInitialized.current) {
      return;
    }
    
    if (state && NavigationDebugger.validateNavigationState(state)) {
      NavigationDebugger.logNavigationState(state, 'Navigation State Changed');
      setNavigationState(state);
      mmkvUtils.setNavigationState(state);
    }
  }, [setNavigationState]);

  // Save state when app goes to background
  const handleAppStateChange = useCallback((nextAppState: AppStateStatus) => {
    if (nextAppState === 'background' && navigationState && !isRestoring.current) {
      console.log('App going to background - saving navigation state');
      NavigationDebugger.logNavigationState(navigationState, 'Saving to Background');
      mmkvUtils.setNavigationState(navigationState);
    } else if (nextAppState === 'active') {
      console.log('App came to foreground');
    }
  }, [navigationState]);

  useEffect(() => {
    // Initialize navigation state on app start (only once)
    const initializeNavigation = async () => {
      if (isInitialized.current || isRestoring.current) {
        return;
      }
      
      isInitialized.current = true;
      isRestoring.current = true;
      
      try {
        console.log('Initializing navigation state...');
        const persistedState = mmkvUtils.getNavigationState();
        
        if (persistedState && NavigationDebugger.validateNavigationState(persistedState)) {
          NavigationDebugger.logNavigationState(persistedState, 'Restored Navigation State');
          setNavigationState(persistedState);
          setIsFirstLaunch(false);
        } else {
          console.log('No valid persisted navigation state found - starting fresh');
          setIsFirstLaunch(true);
        }
      } catch (error) {
        console.error('Failed to restore navigation state:', error);
        setIsFirstLaunch(true);
      } finally {
        isRestoring.current = false;
        setNavigationLoading(false);
        console.log('Navigation initialization complete');
      }
    };

    // Initialize only once
    if (!isInitialized.current) {
      initializeNavigation();
    }

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [setNavigationState, setNavigationLoading, setIsFirstLaunch, handleAppStateChange]);

  return {
    navigationState,
    handleNavigationStateChange,
  };
}; 