# IRIS NOVA APK Build — বাংলা

## GitHub Actions দিয়ে Build

- ZIP Extract করুন এবং ফাইলগুলো GitHub repository-র root-এ push করুন।
- GitHub repository-তে Actions চালু রাখুন।
- Actions tab → **Build IRIS NOVA Android APK** → **Run workflow** চাপুন।
- Build সফল হলে `iris-nova-debug-apk` Artifact ডাউনলোড করুন।

## ফোনে ইনস্টল

- Artifact ZIP Extract করে `app-debug.apk` বের করুন।
- Android Settings থেকে আপনার ব্যবহৃত File Manager/Browser-এর জন্য Install unknown apps অনুমতি দিন।
- APK install করুন; প্রথমবার Microphone permission চাইলে voice input ব্যবহার করতে Allow দিন।

## AI চালু

- Google AI Studio থেকে Gemini API Key তৈরি করুন।
- IRIS NOVA → Settings → Gemini API Key-তে Key দিন → Save Key।
- API Key ছাড়া local app-opening/settings commands চলবে; cloud AI chat চলবে না।

## সতর্কতা

- Build artifact হলো Debug APK; এটি Play Store release signing-এর বিকল্প নয়।
- Free-tier quota এবং model availability Google পরিবর্তন করতে পারে। Unlimited free API usage নেই।
- GitHub Actions-এর free minutes/limits আপনার GitHub account ও repository settings-এর উপর নির্ভর করে।
