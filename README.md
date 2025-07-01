# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

# PriceCheck

A minimal Expo React Native app for tracking product prices and content on e-commerce pages.  
Supports dark mode, embedded link previews, notifications, and a persistent watchlist.

---

## Features

- **Full dark theme** for all screens.
- **WebView tracking:** Open any product page, long-press to select an element to track (price, title, etc.).
- **AsyncStorage watchlist:** Tracked items are saved with their history for the last month.
- **Embedded link previews:** Watchlist shows a WhatsApp-style preview (title, image) for each tracked link.
- **History:** See all tracked values for each item from the last month.
- **Remove items:** Easily remove tracked items from your watchlist.
- **Refresh:** Reload and update your watchlist at any time.
- **Notifications:** Get notified when a tracked value changes (requires notification permissions).
- **Deep linking:** Supports opening links via custom scheme (`pricetracker://webview?url=...`).

---

## How It Works

### 1. Add a Product to Track

- Open the app.
- Paste or share a product URL (e.g., from Amazon or Flipkart).
- The app opens the product page in a WebView.
- **Long-press** on the price, title, image, or any element you want to track.
- Confirm tracking in the popup.
- **Repeat the long-press on different elements** (e.g., price, title, image) to track multiple things for the same product.
- The app saves each selected element's class, text, and URL to your watchlist as a separate tracked item.

### 2. Watchlist

- Go to the Watchlist page.
- See all tracked items from the last month.
- Each tracked element (price, title, image, etc.) appears as a separate entry.
- Each item shows:
  - The product link (clickable)
  - A WhatsApp-style preview (title, image if available)
  - The last tracked value
  - The class name being tracked
  - The date added
  - **History**: All tracked values for the last month
  - Remove button

### 3. Price Monitoring

- The app periodically checks each tracked item (every 30 minutes).
- If the tracked value changes, you receive a local notification.
- The new value is added to the item's history.

### 4. Notifications

- On first launch, the app requests notification permissions.
- Notifications are sent when a tracked value changes.

---

## Main Functions & Logic

### Tracking Elements

- When you **long-press** on any element in the WebView (price, title, image, etc.), the app injects JavaScript to capture:
  - The element's `innerText`
  - Its `className`
  - Its `tagName`
  - Its `id`
- After confirmation, the app saves this info along with the URL and timestamp to AsyncStorage as a tracked item.
- You can repeat this for multiple elements on the same page (each is tracked separately).

### Watchlist

- The watchlist reads all tracked items from AsyncStorage.
- For each tracked item, it displays:
  - The product URL (clickable)
  - A link preview (title, image if available)
  - The last tracked value
  - The class name being tracked
  - The date added
  - The history of tracked values for the last month
  - A remove button

### Price/Value Monitoring

- Every 30 minutes, the app checks each tracked item:
  - Loads the product page (in the background)
  - Injects JavaScript to find the element by its class name
  - Reads the current value/text
  - If the value has changed, it:
    - Updates the tracked item's history
    - Sends a local notification

### Notifications

- Uses `expo-notifications` to request permission and send local notifications when a tracked value changes.

### Link Previews

- The app fetches Open Graph meta tags from each product URL to display a preview (title and image) in the watchlist, similar to WhatsApp link previews.

### Deep Linking

- Supports opening the app directly to a product page using a custom URL scheme:
  - Example: `pricetracker://webview?url=https://amazon.in/...`
- Handles shared URLs from other apps.

---

## Technical Details

- **Expo Router v2** for navigation.
- **AsyncStorage** for persistent storage.
- **expo-notifications** for local notifications.
- **expo-linking** for deep linking and shared URLs.
- **Open Graph meta** is fetched for link previews in the watchlist.
- **No external dependencies** for link previews (uses fetch and regex).

---

## Setup & Run

1. Clone the repo.
2. Run `npm install` or `yarn`.
3. Start the app: `npx expo start`
4. Open on your device or emulator.

---

## Notes

- Some product pages may not provide Open Graph meta for previews.
- Long-press tracking works best on Android and web; iOS support may vary.
- For best results, use with Amazon/Flipkart product pages.

---

## License

MIT
