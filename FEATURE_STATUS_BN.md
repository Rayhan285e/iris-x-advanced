# IRIS NOVA — Feature Status

| Capability | Status | Notes |
|---|---|---|
| Assistant UI / chat | Implemented | New dark neon dashboard |
| Bengali speech input | Implemented, device-dependent | Android SpeechRecognizer; requires mic permission and speech service |
| Gemini AI chat | Implemented, API-key required | Gemini 3.8 Flash GenerateContent |
| Bengali voice output | Implemented, device-dependent | Android TTS via Expo Speech |
| Open common apps | Implemented | Installed apps only |
| Open system settings | Implemented | Settings panels, not silent toggles |
| WhatsApp draft | Native adapter | Opens draft; user sends manually |
| SMS draft / dialer | Native adapter | Opens system composer/dialer; no automatic send/call |
| Calendar draft | Native adapter | Opens calendar event composer |
| Local notes | Implemented | Encrypted app storage |
| Notification preview read | Implemented, opt-in | Enable Notification Access; app/package may hide preview text |
| Notification auto reply | Not implemented | RemoteInput reply pipeline not added |
| Auto answer/reject calls | Not implemented | Requires Android call screening/default role and testing |
| Always-on floating assistant | Not implemented | Requires overlay + foreground service |
| Gemini Live full duplex | Not implemented | Current voice path is speech-to-text → API → TTS |
| Screen streaming | Not implemented | Requires MediaProjection consent and streaming pipeline |
| Media session control | Implemented, device-dependent | Requires Notification Access + active media session |
| Flashlight on/off | Implemented, permission-gated | Requires Camera permission + flash hardware |

No capability is marked complete merely because an upstream README mentions it.
