import { NativeModules, NativeEventEmitter, PermissionsAndroid, Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import * as Speech from "expo-speech";
const native = NativeModules.IrisNativeModule;
const emitter = native ? new NativeEventEmitter(native) : null;
export type ChatMessage = { id: string; role: "user" | "assistant"; text: string; createdAt: number };
export async function saveApiKey(key: string) { if (!key.trim()) throw new Error("API key ফাঁকা রাখা যাবে না"); await SecureStore.setItemAsync("iris_gemini_api_key", key.trim()); }
export async function getApiKey() { return (await SecureStore.getItemAsync("iris_gemini_api_key")) || ""; }
export async function clearApiKey() { await SecureStore.deleteItemAsync("iris_gemini_api_key"); }
export async function askGemini(prompt: string, history: ChatMessage[] = []) {
 const key = await getApiKey(); if (!key) throw new Error("প্রথমে Settings থেকে Gemini API Key যোগ করুন।");
 const contents = [...history.slice(-10).map(m => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.text }] })), { role: "user", parts: [{ text: prompt }] }];
 const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${encodeURIComponent(key)}`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({systemInstruction:{parts:[{text:"You are IRIS NOVA, a concise, careful Bengali-English mobile assistant. Reply in the user's language. Never claim a device action happened unless the local app confirms it. Do not request secrets. For dangerous actions, ask the user to confirm."}]}, contents, generationConfig:{temperature:0.55,maxOutputTokens:900}}) });
 const data = await r.json(); if (!r.ok) throw new Error(data?.error?.message || `AI request failed (${r.status})`);
 const answer = data?.candidates?.[0]?.content?.parts?.map((p:any)=>p.text||"").join("").trim(); if (!answer) throw new Error("AI কোনো উত্তর দেয়নি।"); return answer;
}
export async function startVoice(onText:(text:string)=>void, onError:(message:string)=>void) {
 if (Platform.OS !== "android") throw new Error("Voice input adapter আপাতত Android-এর জন্য।");
 const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO); if (granted !== PermissionsAndroid.RESULTS.GRANTED) throw new Error("Microphone permission দেওয়া হয়নি।");
 if (!native || !emitter) throw new Error("Native speech module পাওয়া যায়নি।");
 const a=emitter.addListener("IrisSpeechResult",(e: {text?:string})=>e?.text&&onText(e.text)); const b=emitter.addListener("IrisSpeechError",(e: {message?:string})=>onError(e?.message||"Voice recognition failed"));
 try { await native.startSpeechRecognition("bn-BD"); } catch(e) { a.remove(); b.remove(); throw e; }
 return ()=>{a.remove();b.remove();native.stopSpeechRecognition?.();};
}
export function speak(text:string) { const language=/[\u0980-\u09FF]/.test(text)?"bn-BD":"en-US"; Speech.stop(); Speech.speak(text,{language,rate:1,pitch:1}); }
export async function openDialer(number:string) { return native?.openDialer(number); }
export async function openSmsDraft(number:string,message:string) { return native?.openSmsDraft(number,message); }
export async function openWhatsAppDraft(number:string,message:string) { return native?.openWhatsAppDraft(number,message); }
export async function createCalendarDraft(title:string,start:Date,durationMinutes=30) { return native?.createCalendarDraft(title,start.getTime(),start.getTime()+durationMinutes*60000); }
export async function openNotificationAccessSettings() { return native?.openNotificationAccessSettings(); }
export async function controlMedia(action:string) { return native?.controlMediaPlayback(action); }
export async function setFlashlight(enabled:boolean) {
 const granted=await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.CAMERA);
 if(granted!==PermissionsAndroid.RESULTS.GRANTED) throw new Error("Flashlight-এর জন্য Camera permission দরকার।");
 return native?.setFlashlight(enabled);
}
export async function readNotifications(filter?:string) {
 const items=await native?.getLatestNotifications?.() || [];
 const selected=filter?items.filter((x:any)=>String(x.packageName).toLowerCase().includes(filter.toLowerCase())):items;
 return selected.slice(-8).map((x:any)=>`${x.title||x.packageName}: ${x.text||"(কোনো preview নেই)"}`).join("\n");
}
export async function runPhoneCommand(text:string):Promise<string|null> {
 const q=text.toLowerCase();
 if(q.includes("notification") || q.includes("নোটিফিকেশন") || q.includes("latest whatsapp message") || q.includes("সর্বশেষ মেসেজ")) {
  const filter=q.includes("whatsapp")?"whatsapp":q.includes("instagram")?"instagram":undefined;
  const latest=await readNotifications(filter);
  return latest || "কোনো notification preview পাওয়া যায়নি। Android Settings থেকে Notification Access চালু করুন এবং অ্যাপগুলোর notification preview অন রাখুন।";
 }
 if(q.includes("pause") || q.includes("গান থামাও") || q.includes("মিউজিক থামাও")) { const ok=await controlMedia("pause"); return ok?"Media pause করেছি।":"Media control-এর জন্য Notification Access চালু করুন এবং কোনো media app চালু রাখুন।"; }
 if(q.includes("play music") || q.includes("গান চালাও") || q.includes("resume music")) { const ok=await controlMedia("play"); return ok?"Media play করেছি।":"Media control-এর জন্য Notification Access চালু করুন এবং কোনো media app চালু রাখুন।"; }
 if(q.includes("next song") || q.includes("পরের গান")) { const ok=await controlMedia("next"); return ok?"পরের track চালিয়েছি।":"Media control-এর জন্য Notification Access চালু করুন।"; }
 if(q.includes("previous song") || q.includes("আগের গান")) { const ok=await controlMedia("previous"); return ok?"আগের track চালিয়েছি।":"Media control-এর জন্য Notification Access চালু করুন।"; }
 if(q.includes("flashlight") || q.includes("torch") || q.includes("টর্চ") || q.includes("ফ্ল্যাশ")) {
  if(q.includes("off") || q.includes("বন্ধ")) { await setFlashlight(false); return "Flashlight বন্ধ করেছি।"; }
  if(q.includes("on") || q.includes("চালু") || q.includes("জ্বালাও")) { await setFlashlight(true); return "Flashlight চালু করেছি।"; }
  return "Flashlight চালু করতে বলুন ‘flashlight on’, বন্ধ করতে বলুন ‘flashlight off’।";
 }
 const numberMatch=text.match(/\+?\d[\d\s()\-]{7,}\d/);
 const number=numberMatch?.[0]?.replace(/[\s()\-]/g,"");
 const messageMatch=text.match(/(?:saying|say|message|মেসেজ|বার্তা|লিখে)\s*[:：]?\s*(.+)$/i);
 if(number && (q.includes("whatsapp") || q.includes("হোয়াটসঅ্যাপ")) && messageMatch?.[1]) { await openWhatsAppDraft(number,messageMatch[1].trim()); return "WhatsApp draft খুলেছি। পাঠানোর আগে chat ও message নিজে যাচাই করে Send চাপুন।"; }
 if(number && (q.includes("sms") || q.includes("text message") || q.includes("এসএমএস")) && messageMatch?.[1]) { await openSmsDraft(number,messageMatch[1].trim()); return "SMS draft খুলেছি। পাঠানোর আগে message যাচাই করে Send চাপুন।"; }
 if(number && (q.includes("call") || q.includes("কল") || q.includes("ফোন কর") || q.includes("dial"))) { await openDialer(number); return "Dialer খুলেছি। নম্বর যাচাই করে Call চাপুন।"; }
 const settings:[string,string][]=[["wifi","wifi"],["wi-fi","wifi"],["bluetooth","bluetooth"],["hotspot","hotspot"],["location","location"],["লোকেশন","location"],["settings","settings"],["সেটিংস","settings"],["camera","camera"],["ক্যামেরা","camera"]];
 for(const [word,target] of settings) if(q.includes(word)){await native?.openSystemSettings(target);return target === "camera" ? "ক্যামেরা চালু করার চেষ্টা করেছি।" : `${target} Settings খুলেছি।`;}
 const apps:[string,string,string][]=[["youtube","com.google.android.youtube","YouTube"],["whatsapp","com.whatsapp","WhatsApp"],["spotify","com.spotify.music","Spotify"],["chrome","com.android.chrome","Chrome"]];
 for(const [word,pkg,name] of apps) if(q.includes(word)){const ok=await native?.openApp(pkg);return ok?`${name} খুলেছি।`:`${name} ইনস্টল করা নেই বা খোলা যায়নি।`;}
 return null;
}
