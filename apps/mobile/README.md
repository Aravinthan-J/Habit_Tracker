# Habity Mobile App

Build routines, track streaks, win badges. React Native mobile app built with Expo for the Habity habit tracking application.

## 🚀 Tech Stack

- **Framework**: Expo SDK 50+
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Zustand + React Query
- **Secure Storage**: Expo SecureStore
- **Offline Storage**: Expo SQLite (coming soon)
- **HTTP Client**: Axios (via @habit-tracker/api-client)

## 📁 Project Structure

```
apps/mobile/
├── src/
│   ├── components/
│   │   └── common/          # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       └── LoadingSpinner.tsx
│   ├── constants/
│   │   └── theme.ts        # Design system tokens
│   ├── hooks/
│   │   └── useAuth.ts      # Authentication hook
│   ├── navigation/
│   │   ├── AuthNavigator.tsx    # Auth screens stack
│   │   └── RootNavigator.tsx    # Root navigation
│   ├── screens/
│   │   ├── auth/           # Login, Register
│   │   └── home/           # Home screen
│   ├── services/
│   │   ├── api/            # API client instance
│   │   └── storage/        # Secure storage service
│   ├── store/
│   │   └── authStore.ts    # Zustand auth store
│   └── App.tsx             # Main app component
├── assets/                 # Images, fonts
├── app.json               # Expo configuration
├── babel.config.js        # Babel configuration
├── index.js               # App entry point
├── package.json
└── tsconfig.json
```

## 🛠️ Setup

### Prerequisites

- Node.js 20+
- npm 9+
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. **Navigate to mobile directory**:
   ```bash
   cd apps/mobile
   ```

2. **Install dependencies** (from root):
   ```bash
   cd ../..  # Go to root
   npm install
   ```

3. **Configure API URL**:

   Edit `src/services/api/apiClient.ts` and update the API_BASE_URL:

   ```typescript
   // For iOS Simulator
   const API_BASE_URL = 'http://localhost:3000/api';

   // For Android Emulator
   const API_BASE_URL = 'http://10.0.2.2:3000/api';

   // For physical device (replace with your computer's IP)
   const API_BASE_URL = 'http://192.168.1.XXX:3000/api';
   ```

## 🏃 Running the App

### Start Expo Development Server

```bash
cd apps/mobile
npx expo start
```

This will open Expo Dev Tools in your browser.

### Run on iOS

```bash
# Press 'i' in the terminal, or
npx expo start --ios
```

### Run on Android

```bash
# Press 'a' in the terminal, or
npx expo start --android
```

### Run on Physical Device

1. Install **Expo Go** app from App Store / Play Store
2. Scan the QR code shown in terminal
3. Make sure your phone and computer are on the same WiFi network

## 📱 Features Implemented

### ✅ Current Features
- [x] User authentication (Login/Register/Logout)
- [x] Secure token storage
- [x] Track unlimited habits with custom icons and colors
- [x] Daily habit completion tracking
- [x] Beautiful monthly calendar view
- [x] Unlock 30+ achievement badges
- [x] Streak tracking with fire 🔥
- [x] Step counter integration
- [x] Monthly goal progress tracking
- [x] Smart goal completion indicators
- [x] Habit management (Add/Edit/Delete)
- [x] Pull-to-refresh
- [x] Form validation
- [x] Loading states
- [x] Error handling
- [x] Tab navigation
- [x] Zustand state management
- [x] React Query integration

### 🚧 Coming Soon
- [ ] Push notifications / Smart daily reminders
- [ ] Offline-first with SQLite sync
- [ ] Dark mode support
- [ ] Habit statistics and analytics
- [ ] Export habit data
- [ ] Social features (share achievements)

## 🧪 Testing

### Test Credentials

After seeding the backend database:
- **Email**: test@example.com
- **Password**: Test1234

Or register a new account in the app.

### Finding Your Computer's IP

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

Look for your local IP (usually starts with 192.168.x.x or 10.0.x.x)

## 🎨 Design System

### Colors
- **Primary**: #6C63FF (Indigo)
- **Secondary**: #48BB78 (Green)
- **Error**: #F56565 (Red)
- **Success**: #48BB78 (Green)

### Spacing
- xs: 4px, sm: 8px, md: 12px, lg: 16px, xl: 24px

### Typography
- xs: 12px, sm: 14px, md: 16px, lg: 18px, xl: 20px, xxl: 24px, xxxl: 32px

All design tokens are defined in `src/constants/theme.ts`

## 📦 Dependencies

### Core
- `expo` - Expo framework
- `react` - React library
- `react-native` - React Native

### Navigation
- `@react-navigation/native` - Navigation core
- `@react-navigation/stack` - Stack navigator
- `@react-navigation/bottom-tabs` - Tab navigator (coming soon)

### State Management
- `zustand` - Client state
- `@tanstack/react-query` - Server state

### Storage
- `expo-secure-store` - Encrypted token storage
- `expo-sqlite` - Local database (coming soon)

### UI
- `@expo/vector-icons` - Icons
- `react-native-gesture-handler` - Gestures
- `react-native-reanimated` - Animations

### Shared Packages
- `@habit-tracker/api-client` - API service layer
- `@habit-tracker/shared-types` - TypeScript types
- `@habit-tracker/shared-utils` - Utility functions

## 🐛 Troubleshooting

**Metro bundler won't start:**
```bash
# Clear cache and restart
npx expo start --clear
```

**Can't connect to backend:**
- Verify backend is running on http://localhost:3000
- Check API_BASE_URL in apiClient.ts
- For Android emulator, use 10.0.2.2 instead of localhost
- For physical device, use your computer's IP address

**Build errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

**iOS build fails:**
```bash
# Clear iOS build cache
rm -rf ios/build
npx expo start --ios --clear
```

## 📚 Resources

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Query](https://tanstack.com/query/latest)
- [Zustand](https://github.com/pmndrs/zustand)

---

Built with ❤️ using Expo and React Native
