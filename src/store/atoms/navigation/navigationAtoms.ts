import { atom } from 'recoil';
import { NavigationState } from '@react-navigation/native';

// Navigation state atom WITHOUT automatic persistence (handled manually in hook)
export const navigationStateAtom = atom<NavigationState | null>({
  key: 'navigationState',
  default: null,
});

// Loading state for navigation restoration
export const navigationLoadingAtom = atom<boolean>({
  key: 'navigationLoading',
  default: true,
});

// Flag to indicate if this is the first app launch (no persisted navigation)
export const isFirstLaunchAtom = atom<boolean>({
  key: 'isFirstLaunch',
  default: true,
}); 