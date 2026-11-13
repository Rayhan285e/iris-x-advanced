# IRIS NOVA — Advanced Voice Assistant (Android-first)

এই প্রজেক্টটি IRIS-X-এর MIT-licensed public UI shell-এর উপর তৈরি একটি স্বতন্ত্র assistant implementation। এটি IRIS-MX-এর private PRO engine কপি বা unlock করে না। নতুন voice/chat/device adapters আলাদাভাবে লেখা হয়েছে। মূল upstream `LICENSE` ও attribution ফাইল অপরিবর্তিত রাখা হয়েছে।

## Login ও ব্যবহার

- এই নতুন app flow-তে account login বা subscription screen নেই; অ্যাপ সরাসরি assistant dashboard-এ খোলে।
- Gemini API Key হলো AI service ব্যবহারের credential, এটি IRIS-X PRO license নয়।
- API Key না দিলেও local app/settings/flashlight shortcuts ব্যবহার করা যাবে; cloud AI chat-এর জন্য key লাগবে।

## এই Build-এ বাস্তবভাবে যুক্ত

- IRIS-inspired dark neon/purple assistant dashboard, chat bubbles, quick actions ও bottom navigation।
- Android SpeechRecognizer দিয়ে বাংলা (bn-BD) voice-to-text; recognition শেষ হলে প্রশ্ন AI-তে পাঠায়। এটি continuous Gemini Live streaming নয়।
- Gemini Developer API `gemini-3.8-flash` দিয়ে text chat; নিজের API Key SecureStore-এ সংরক্ষণ।
- Android Text-to-Speech দিয়ে assistant-এর উত্তর পড়ে শোনানো।
- Local command adapter: YouTube, WhatsApp, Spotify, Chrome খোলা; Wi-Fi, Bluetooth, Location, Hotspot ও Phone Settings খোলা।
- Phone dialer draft, SMS draft, WhatsApp draft ও Calendar draft-এর Native Intent adapter আছে; এগুলো নিজে থেকে কল/মেসেজ পাঠায় না। ব্যবহারকারীকে শেষ ধাপ নিশ্চিত করতে হয়।
- ব্যক্তিগত Notes SecureStore-এ সংরক্ষণ।
- NotificationListenerService দিয়ে notification preview পড়া (user Notification Access চালু করলে; সাম্প্রতিক ৩০টি শুধু RAM-এ থাকে, ডিস্কে সংরক্ষণ হয় না)।
- MediaSession-এর মাধ্যমে play/pause/next/previous (Notification Access ও active media session লাগবে)।
- Camera permission দিলে flashlight on/off।
- Missing Apps/Notes/Settings routes তৈরি করা হয়েছে।

## এখনো বাস্তবায়িত নয়

- Incoming call auto-answer/reject ও caller announcement।
- Notification auto-reply / RemoteInput message send।
- Background always-on wake word / persistent floating overlay।
- Gemini Live full-duplex real-time audio ও screen streaming।
- সব media app-এ নির্ভরযোগ্য playback control (কিছু app/ROM session expose নাও করতে পারে)।
- Arbitrary app close, unrestricted device setting changes।
- Full contact lookup, calendar read/sync, autonomous multi-step task executor।

এসব Android-এর role/permission/service এবং আলাদা নিরাপদ native implementation চায়। UI বা README-তে লেখা থাকলেই ফিচার বাস্তবে কাজ করে না।

## Build (Cloud)

1. ZIP Extract করুন।
2. GitHub-এ নতুন private/public repository তৈরি করে project files push করুন।
3. Repository → Actions → `Build IRIS NOVA Android APK` → Run workflow।
4. Job সফল হলে `iris-nova-debug-apk` artifact থেকে `app-debug.apk` নামান।
5. ফোনে APK install করার আগে Android-এর Install unknown apps অনুমতি দিন।

Cloud build প্রথমবার npm dependencies ও Android Gradle/NDK downloads করবে। এই ZIP-এর মধ্যে prebuilt APK নেই।

## API Key

Google AI Studio থেকে নিজের Gemini API Key নিন এবং অ্যাপের Settings-এ দিন। Free-tier quota, model access ও rate limits Google-এর বর্তমান শর্তের উপর নির্ভরশীল; unlimited free use নিশ্চিত নয়। API Key কাউকে পাঠাবেন না, GitHub-এ commit করবেন না।

## Android permissions

- Microphone: শুধু voice input-এর সময় request হয়।
- Internet: Gemini API call-এর জন্য।
- App launching/system settings: Android intents ব্যবহার করে।
- Notification Access ঐচ্ছিকভাবে Settings থেকে চালু করতে হবে; এটি notification preview পড়া ও media session control-এর জন্য ব্যবহৃত হয়। Overlay ও automatic call control এই Build-এ নেই।

## গুরুত্বপূর্ণ

- Debug APK পরীক্ষার জন্য। স্থায়ী release distribution-এর জন্য নিজের release keystore দিয়ে sign করতে হবে।
- Build workflow ও source পরিবর্তন করা হয়েছে, কিন্তু এই পরিবেশে Android SDK/NDK + Gradle build চালানো যায়নি। তাই APK compile/runtime verification এখনো বাকি।
- Realme C15 / Android 11-এ install ও microphone test করে তারপর দৈনন্দিন ব্যবহারে নিন।
