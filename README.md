# IRIS NOVA — Advanced Voice Assistant

An Android-first independent assistant build using the MIT-licensed public UI shell from IRIS-X and newly written app adapters. It does not unlock or copy the upstream private PRO engine.

**বাংলা নির্দেশিকা:** [NOVA_README_BN.md](NOVA_README_BN.md) · [Feature Status](FEATURE_STATUS_BN.md) · [APK Build Guide](BUILD_APK_BN.md)

## Login model

The app opens directly to the assistant dashboard; no app account or subscription screen is wired into this independent build. Gemini API access still requires the user’s own API key and is subject to the provider’s quota and pricing.

## Included in this build

- IRIS-inspired dark neon assistant interface.
- Bengali Android speech recognition → Gemini API chat → Android text-to-speech response.
- Secure local storage for the user's Gemini API key and private notes.
- App launch and Android system settings shortcuts.
- Opt-in notification preview reading, media-session controls and permission-gated flashlight toggle.
- Safe draft intents for dialer, SMS, WhatsApp and calendar (user completes the action).
- GitHub Actions debug APK workflow.

## Not included yet

Always-on wake word, real-time Gemini Live duplex audio, screen streaming, notification auto-reply, automatic call answering/rejection, background overlay, screen streaming and full-duplex Gemini Live audio are not implemented in this build. See the feature status document.

## License

The upstream license and copyright notice are retained. The upstream public UI shell is MIT-licensed; the upstream proprietary engine remains under its original commercial terms. Newly added adapter code is independent and does not bypass those terms.
