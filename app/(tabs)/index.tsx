import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Activity, AudioLines, Bot, ChevronRight, Mic, MicOff, Send, Sparkles, Volume2, Wifi, Zap, Bell, Music2 } from 'lucide-react-native';
import { askGemini, ChatMessage, runPhoneCommand, speak, startVoice } from '../../services/assistant';

const C = { bg:'#070711', panel:'#111122', panel2:'#17172b', line:'#292943', purple:'#9b5cff', pink:'#ed64c8', cyan:'#59d8ff', white:'#f4f1ff', muted:'#9693ad', green:'#52e0a0' };
const suggestions = ['আজকের কাজের তালিকা বানাও','YouTube খোলো','Wi-Fi Settings খোলো','আমাকে বাংলায় সাহায্য করো'];

export default function Home() {
 const [messages,setMessages]=useState<ChatMessage[]>([{id:'welcome',role:'assistant',text:'হ্যালো! আমি IRIS NOVA। কথা বলুন অথবা নিচে লিখুন—আমি সাহায্য করার চেষ্টা করব।',createdAt:Date.now()}]);
 const [input,setInput]=useState(''); const [busy,setBusy]=useState(false); const [listening,setListening]=useState(false); const [voiceStop,setVoiceStop]=useState<null|(()=>void)>(null);
 const scroll=useRef<ScrollView>(null);
 useEffect(()=>()=>{voiceStop?.();},[voiceStop]);
 const send = async (raw?:string) => {
  const prompt=(raw ?? input).trim(); if(!prompt||busy)return;
  const user:ChatMessage={id:`u${Date.now()}`,role:'user',text:prompt,createdAt:Date.now()};
  const next=[...messages,user]; setMessages(next); setInput(''); setBusy(true);
  try {
   const action=await runPhoneCommand(prompt);
   const answer=action || await askGemini(prompt,messages);
   const bot:ChatMessage={id:`a${Date.now()}`,role:'assistant',text:answer,createdAt:Date.now()}; setMessages(v=>[...v,bot]);
   speak(answer);
  } catch(e:any) { setMessages(v=>[...v,{id:`e${Date.now()}`,role:'assistant',text:`সমস্যা হয়েছে: ${e?.message||'অজানা সমস্যা'}\n\nAI চ্যাটের জন্য Settings-এ Gemini API Key যোগ করুন।`,createdAt:Date.now()}]); }
  finally {setBusy(false);setTimeout(()=>scroll.current?.scrollToEnd({animated:true}),120);}
 };
 const mic = async()=>{
  if(listening){voiceStop?.();setVoiceStop(null);setListening(false);return;}
  try { const stop=await startVoice(t=>{setInput(t);setListening(false);setVoiceStop(null);send(t);},m=>{setListening(false);setVoiceStop(null);Alert.alert('Voice Input',m);}); setVoiceStop(()=>stop);setListening(true); }
  catch(e:any){Alert.alert('Microphone',e?.message||'Voice input চালু করা যায়নি।');}
 };
 return <SafeAreaView style={s.safe}>
  <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':undefined}>
   <View style={s.header}>
    <View style={s.brand}><View style={s.brandIcon}><Sparkles color={C.white} size={20}/></View><View><Text style={s.brandName}>IRIS <Text style={{color:C.purple}}>NOVA</Text></Text><Text style={s.brandSub}>PERSONAL AI OPERATING LAYER</Text></View></View>
    <View style={s.online}><View style={s.dot}/><Text style={s.onlineText}>READY</Text></View>
   </View>
   <ScrollView ref={scroll} style={{flex:1}} contentContainerStyle={{padding:18,paddingBottom:20}} keyboardShouldPersistTaps="handled">
    <View style={s.hero}>
     <View style={s.orbOuter}><View style={s.orbMid}><View style={s.orbCore}><AudioLines color={C.white} size={38}/></View></View></View>
     <Text style={s.heroTitle}>{listening?'আমি শুনছি…':'আপনার AI সহকারী প্রস্তুত'}</Text>
     <Text style={s.heroCaption}>Speak naturally · Think faster · Act safely</Text>
     <View style={s.stats}><View style={s.stat}><Activity color={C.green} size={14}/><Text style={s.statText}>LOCAL COMMANDS</Text></View><View style={s.stat}><Zap color={C.cyan} size={14}/><Text style={s.statText}>CLOUD AI READY</Text></View></View>
    </View>
    <View style={s.sectionHead}><Text style={s.sectionTitle}>QUICK ACTIONS</Text><Text style={s.sectionHint}>Tap to run</Text></View>
    <View style={s.actions}>
     {[{label:'YouTube',sub:'Open app',icon:Volume2,cmd:'YouTube খোলো'},{label:'Wi-Fi',sub:'Settings',icon:Wifi,cmd:'Wi-Fi Settings খোলো'},{label:'Bluetooth',sub:'Settings',icon:Activity,cmd:'Bluetooth Settings খোলো'},{label:'Ask AI',sub:'New question',icon:Bot,cmd:'আমাকে বাংলায় সাহায্য করো'},{label:'Pause Music',sub:'Media session',icon:Music2,cmd:'Pause music'},{label:'Flashlight',sub:'Turn on',icon:Zap,cmd:'Flashlight on'},{label:'Notifications',sub:'Read latest',icon:Bell,cmd:'Read latest notifications'}].map((a,i)=><Pressable key={a.label} style={s.action} onPress={()=>send(a.cmd)}><View style={[s.actionIcon,{backgroundColor:i%2?'#19283b':'#25183b'}]}><a.icon color={i%2?C.cyan:C.purple} size={20}/></View><Text style={s.actionTitle}>{a.label}</Text><Text style={s.actionSub}>{a.sub}</Text><ChevronRight color={C.muted} size={14} style={{position:'absolute',right:12,top:14}}/></Pressable>)}
    </View>
    <View style={s.sectionHead}><Text style={s.sectionTitle}>CONVERSATION</Text><Text style={s.sectionHint}>{messages.length-1} messages</Text></View>
    {messages.map(m=><View key={m.id} style={[s.bubble,m.role==='user'?s.userBubble:s.aiBubble]}><View style={s.bubbleHead}><Text style={[s.bubbleRole,{color:m.role==='user'?C.cyan:C.pink}]}>{m.role==='user'?'YOU':'IRIS NOVA'}</Text></View><Text style={s.bubbleText}>{m.text}</Text></View>)}
    {busy&&<View style={s.loading}><ActivityIndicator color={C.purple}/><Text style={s.loadingText}>IRIS ভাবছে…</Text></View>}
   </ScrollView>
   <View style={s.composerWrap}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{gap:8,paddingBottom:10}}>{suggestions.map(v=><Pressable key={v} style={s.chip} onPress={()=>send(v)}><Text style={s.chipText}>{v}</Text></Pressable>)}</ScrollView>
    <View style={s.composer}>
     <Pressable onPress={mic} style={[s.mic,{backgroundColor:listening?C.pink:'#28203f'}]}>{listening?<MicOff color={C.white} size={21}/>:<Mic color={C.white} size={21}/>}</Pressable>
     <TextInput value={input} onChangeText={setInput} placeholder="কথা বলুন বা লিখুন…" placeholderTextColor={C.muted} style={s.input} multiline maxLength={1200} onSubmitEditing={()=>send()}/>
     <Pressable disabled={busy||!input.trim()} onPress={()=>send()} style={[s.send,{opacity:busy||!input.trim()?0.4:1}]}><Send color={C.white} size={19}/></Pressable>
    </View>
    <Text style={s.disclaimer}>ফোনের কাজের জন্য Android permission লাগতে পারে · AI-এর জন্য নিজের API Key ব্যবহার করুন</Text>
   </View>
  </KeyboardAvoidingView>
 </SafeAreaView>;
}
const s=StyleSheet.create({safe:{flex:1,backgroundColor:C.bg},header:{paddingHorizontal:18,paddingVertical:12,borderBottomWidth:1,borderBottomColor:C.line,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},brand:{flexDirection:'row',alignItems:'center',gap:10},brandIcon:{width:38,height:38,borderRadius:13,backgroundColor:'#342052',alignItems:'center',justifyContent:'center',borderWidth:1,borderColor:'#6b46a0'},brandName:{color:C.white,fontSize:19,fontWeight:'900',letterSpacing:1.4},brandSub:{color:C.muted,fontSize:8,letterSpacing:1.5,marginTop:2},online:{flexDirection:'row',alignItems:'center',gap:6,borderWidth:1,borderColor:'#275744',borderRadius:20,paddingHorizontal:10,paddingVertical:6},dot:{width:6,height:6,borderRadius:4,backgroundColor:C.green},onlineText:{fontSize:9,color:C.green,fontWeight:'800',letterSpacing:1},hero:{alignItems:'center',paddingVertical:20,borderRadius:24,backgroundColor:'#0e0d1c',borderWidth:1,borderColor:'#29213f',marginBottom:22},orbOuter:{width:150,height:150,borderRadius:80,borderWidth:1,borderColor:'#66449a',alignItems:'center',justifyContent:'center',backgroundColor:'#17102b'},orbMid:{width:122,height:122,borderRadius:70,borderWidth:1,borderColor:'#9b5cff',alignItems:'center',justifyContent:'center',backgroundColor:'#21153c'},orbCore:{width:88,height:88,borderRadius:50,alignItems:'center',justifyContent:'center',backgroundColor:'#6535a0',borderWidth:1,borderColor:'#d2a7ff',shadowColor:C.purple,shadowOpacity:0.7,shadowRadius:18,elevation:12},heroTitle:{color:C.white,fontSize:18,fontWeight:'800',marginTop:16},heroCaption:{color:C.muted,fontSize:10,letterSpacing:1,marginTop:5},stats:{flexDirection:'row',gap:18,marginTop:17},stat:{flexDirection:'row',alignItems:'center',gap:6},statText:{fontSize:8,color:C.muted,letterSpacing:1},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:11},sectionTitle:{fontSize:11,color:C.white,fontWeight:'900',letterSpacing:1.7},sectionHint:{fontSize:10,color:C.muted},actions:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:24},action:{width:'48%',minHeight:92,backgroundColor:C.panel,borderRadius:16,borderWidth:1,borderColor:C.line,padding:12},actionIcon:{width:34,height:34,borderRadius:11,alignItems:'center',justifyContent:'center',marginBottom:8},actionTitle:{fontSize:12,color:C.white,fontWeight:'800'},actionSub:{fontSize:10,color:C.muted,marginTop:2},bubble:{padding:13,borderRadius:16,marginBottom:9,maxWidth:'94%',borderWidth:1},userBubble:{alignSelf:'flex-end',backgroundColor:'#172337',borderColor:'#284c66'},aiBubble:{alignSelf:'flex-start',backgroundColor:'#151123',borderColor:'#40305a'},bubbleHead:{marginBottom:5},bubbleRole:{fontSize:8,fontWeight:'900',letterSpacing:1.4},bubbleText:{color:C.white,fontSize:13,lineHeight:20},loading:{flexDirection:'row',alignItems:'center',gap:9,padding:10},loadingText:{color:C.muted,fontSize:11},composerWrap:{paddingHorizontal:14,paddingTop:8,paddingBottom:7,borderTopWidth:1,borderTopColor:C.line,backgroundColor:'#0a0915'},chip:{paddingHorizontal:11,paddingVertical:7,borderRadius:20,backgroundColor:'#171329',borderWidth:1,borderColor:'#302548'},chipText:{fontSize:10,color:'#c9b7e8'},composer:{flexDirection:'row',alignItems:'center',backgroundColor:C.panel2,borderWidth:1,borderColor:'#40335a',borderRadius:18,padding:6,gap:8},mic:{width:40,height:40,borderRadius:14,alignItems:'center',justifyContent:'center'},input:{flex:1,color:C.white,fontSize:13,maxHeight:90,paddingHorizontal:4,paddingVertical:8},send:{width:40,height:40,borderRadius:14,backgroundColor:C.purple,alignItems:'center',justifyContent:'center'},disclaimer:{fontSize:8,color:'#77728e',textAlign:'center',marginTop:7}});
