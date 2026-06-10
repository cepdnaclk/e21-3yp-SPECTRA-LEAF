# Using ngrok to run the mobile app without localhost

This project can be run on a physical phone or remote device by exposing your local backend using `ngrok`. Follow these steps:

1. Start the backend server locally (from the repo root):

```bash
cd backend
npm install
npm run dev
```

2. Install and run `ngrok` (https://ngrok.com/) to expose port 5000:

```bash
ngrok http 5000
```

Copy the HTTPS URL that ngrok shows (e.g. `https://abcd1234.ngrok.io`).

3. Configure the mobile app to use the public URL. Edit `mobile/.env` and set:

```
EXPO_PUBLIC_API_BASE_URL=https://abcd1234.ngrok.io/api
```

4. Start Expo (use tunnel or LAN):

```bash
cd mobile
npx expo start --tunnel
# or use --lan if your phone is on the same Wi-Fi network
npx expo start --lan
```

5. To share an installed APK, rebuild it after setting `EXPO_PUBLIC_API_BASE_URL`:

```bash
cd mobile
npx eas build --profile preview --platform android
```

Install this new APK on your friend's phone. The old APK will still point to the URL that existed when it was built.

6. Verify from your phone's browser:

```
https://abcd1234.ngrok.io/api/health
```

If you see JSON (status OK), the mobile app should be able to reach the backend.

Notes:
- For an APK that you send to a friend, `EXPO_PUBLIC_API_BASE_URL` must be set before building the APK. Expo embeds this value into the build.
- If you prefer LAN instead of ngrok, replace the `.env` value with your PC LAN IP, e.g. `http://192.168.1.45:5000/api`.
- Ensure your phone and PC are on the same Wi-Fi network for LAN mode, and allow port 5000 through Windows Firewall if needed.
