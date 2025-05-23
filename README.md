# 🚖 Go Cabs Rider App

**Go Cabs** is a decentralized, 100% EV ride-hailing platform built to offer eco-friendly, transparent, and flexible transport solutions. This repository contains the **Rider App**, empowering users to book electric cab rides while interacting directly with drivers — no middlemen, no surge pricing.

---

## Driver app repository: https://github.com/GourabSanyal/go-drive

# 🌟 Key Features

- 🔍 **Easy Location Input**  
  Enter pickup and drop locations using an intuitive Mapbox-powered interface.

- ⚡ **Fare Bidding System**  
  Say goodbye to rigid fares! Riders can negotiate prices directly with drivers in real time.

- 💳 **Flexible Payments**  
  Pay using integrated options — fiat, crypto, or Go Cabs scan-to-pay integration (via Aeon/Gaian).

- 🌱 **All-Electric Rides**  
  Contribute to a cleaner planet by riding only electric vehicles.

- 🔗 **On-Chain Transparency**  
  Ride data is logged immutably on-chain for full transparency using smart contract integrations.

---

# ⚙️ Tech Stack

| Tech                      | Purpose                           |
|---------------------------|-----------------------------------|
| React Native + TypeScript | Cross-platform mobile development |
| Firebase Auth             | Secure user authentication        |
| Firebase Realtime DB      | Live ride tracking & messaging    |
| Socket.IO                 | Real-time driver-rider sync       |
| Mapbox API                | Location input & mapping          |
| Anchor                    | On-chain escrow wallet (Solana)   |
| OpenCharge API            | Charging infra integration        |

---

📱 Live Demo 
🎥 Watch the full App demo on YouTube:  
[![Watch Now](https://www.youtube.com/watch?v=E5tLv4YkVqs&t=3s/hqdefault.jpg)](https://www.youtube.com/watch?v=E5tLv4YkVqs&t=3s)  
🔗 [Click here to watch](https://www.youtube.com/watch?v=E5tLv4YkVqs&t=3s)

- Waitlist: Join Now at https://www.gocabs.xyz/

- Telegram Community: https://t.me/GoCabsTG

# 🚀 Getting Started (For Developers)

This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
