# Smart Navigation & Timer Persistence

A complete solution for persisting navigation state and timer functionality across app sessions using **Recoil + MMKV**.

## ✨ Features

### 🧭 **Smart Navigation Persistence**
- **Quick Resume** (< 10 min): Return to exact screen where you left off
- **Fresh Start** (> 10 min or app killed): Clean startup through splash screen
- **Seamless UX**: No loading screens or jarring transitions

### ⏱️ **Background-Aware Timer**
- **Timestamp-based**: Continues counting when app is backgrounded
- **Persistent**: Survives app kills and restarts
- **Accurate**: Accounts for exact time spent away from app

## 🚀 How It Works

### Navigation Persistence Logic
```
App Minimized < 10 min → Restore exact navigation state
App Minimized > 10 min → Fresh start (clear navigation)
App Killed/Closed     → Fresh start (clear navigation)
```

### Timer Persistence Logic
```
Timer starts → Store timestamp + duration in MMKV
App backgrounded → Timer keeps running (timestamp-based)
App restored → Calculate remaining = duration - (now - startTime)
```

## 📱 User Experience

| Scenario | Behavior | Example |
|----------|----------|---------|
| **Quick Switch** | Restore exact position | Navigate to Profile → minimize 5 min → return to Profile |
| **Long Break** | Fresh startup | Navigate to Profile → minimize 15 min → return to Splash |
| **App Killed** | Fresh startup | Navigate to Profile → kill app → return to Splash |
| **Timer Background** | Continues counting | Start 5:00 timer → minimize 2 min → return shows 3:00 |

## 🏗️ Architecture

### Core Components
- **`useNavigationPersistence`** - Smart restoration logic
- **`TimerModal`** - Timestamp-based timer with persistence
- **MMKV Storage** - Fast, synchronous persistence layer
- **Recoil Atoms** - Reactive state management

### File Structure
```
src/
├── hooks/useNavigationPersistence.ts     # Navigation restoration logic
├── store/
│   ├── atoms/navigation/navigationAtoms.ts   # Navigation & timer state
│   └── mmkv/storage.ts                       # MMKV utilities
├── components/modals/TimerModal.tsx          # Background-aware timer
└── utils/navigationDebugger.ts               # Debug utilities
```

## 🔧 Implementation Details

### Navigation Atoms
```typescript
navigationStateAtom      // Current navigation state
timerStartTimeAtom      // Timer start timestamp  
timerDurationAtom       // Timer total duration
modalOpenAtom           // Modal open state
```

### MMKV Storage
```typescript
backgroundTimestamp     // When app was backgrounded
navigationState         // Navigation stack state
timerStartTime         // Timer persistence
```

### Background Detection
```typescript
// 10-minute rule implementation
const shouldRestore = () => {
  const backgroundTime = getBackgroundTimestamp();
  if (!backgroundTime) return false; // App was killed
  
  const elapsed = Date.now() - backgroundTime;
  return elapsed < 10 * 60 * 1000; // < 10 minutes
};
```

## 🧪 Testing

### Navigation Persistence
1. Navigate deep into app (e.g., User → Profile → Settings)
2. **Test A**: Minimize for 5 minutes → Should restore to Settings
3. **Test B**: Minimize for 15 minutes → Should start fresh at Splash
4. **Test C**: Kill app completely → Should start fresh at Splash

### Timer Persistence  
1. Start 5-minute timer in modal
2. **Test A**: Minimize for 1 minute → Should show 4:00 remaining
3. **Test B**: Minimize for 6 minutes → Should trigger onComplete
4. **Test C**: Kill app after 2 minutes → Should show 3:00 on restart

## 🛠️ Debug Commands

```javascript
// Clear all navigation data
NavigationDebugger.clearPersistedNavigation();

// Simulate backgrounded app
NavigationDebugger.simulateBackground(15); // 15 minutes ago

// Check current status
NavigationDebugger.checkBackgroundStatus();

// Get current route info
NavigationDebugger.getCurrentRouteInfo(navigationState);
```

## 🎯 Key Benefits

✅ **User-Friendly**: Matches user expectations for app behavior  
✅ **Performance**: Fast MMKV storage, no AsyncStorage delays  
✅ **Reliable**: Handles edge cases (corrupted data, app kills)  
✅ **Developer Experience**: Clear debugging tools and logging  
✅ **Industry Standard**: Follows React Native best practices  

## 🔄 Integration

The system integrates seamlessly with your existing app:

1. **RootNavigator** - Unchanged from original structure
2. **SplashScreen** - Works normally for auth flow  
3. **TimerModal** - Drop-in replacement with background support
4. **Navigation** - Transparent persistence layer

No breaking changes to existing functionality - everything just works better! 🎉 