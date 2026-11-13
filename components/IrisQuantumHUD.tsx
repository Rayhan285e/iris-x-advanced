import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Honest capability panel: only report capabilities wired in this build.
export default function IrisQuantumHUD() {
  const items = [
    ['VOICE INPUT', 'ANDROID SPEECH RECOGNIZER'],
    ['AI CHAT', 'GEMINI API · BYO KEY'],
    ['VOICE OUTPUT', 'ANDROID TEXT TO SPEECH'],
    ['DEVICE ACTIONS', 'APP + SETTINGS INTENTS'],
  ];
  return <View style={styles.card}>
    <Text style={styles.title}>IRIS NOVA · CAPABILITY MATRIX</Text>
    <View style={styles.grid}>{items.map(([name,value])=><View key={name} style={styles.item}><Text style={styles.label}>{name}</Text><Text style={styles.value}>{value}</Text></View>)}</View>
    <Text style={styles.note}>অন্যান্য Native automation module এখনো সংযুক্ত করা হয়নি।</Text>
  </View>;
}
const styles=StyleSheet.create({card:{width:'100%',padding:14,borderRadius:16,backgroundColor:'#0A0314',borderWidth:1,borderColor:'rgba(112,0,255,0.4)',marginVertical:8},title:{color:'#FF7BCB',fontSize:11,fontWeight:'bold',fontFamily:'monospace',letterSpacing:1,marginBottom:10},grid:{flexDirection:'row',flexWrap:'wrap',justifyContent:'space-between',gap:8},item:{width:'48%',padding:10,backgroundColor:'rgba(255,255,255,0.03)',borderRadius:8,borderLeftWidth:3,borderLeftColor:'#59D8FF'},label:{color:'#A0AEC0',fontSize:9,fontFamily:'monospace'},value:{color:'#FFFFFF',fontSize:10,fontWeight:'bold',fontFamily:'monospace',marginTop:4},note:{color:'#8c86a3',fontSize:9,marginTop:10}});
