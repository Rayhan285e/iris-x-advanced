package com.x201harsh.IRISMX.nativebridge

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import android.content.Intent
import android.content.Context
import android.provider.Settings
import android.net.Uri
import android.provider.CalendarContract
import android.hardware.camera2.CameraManager
import android.content.pm.PackageManager
import androidx.core.content.ContextCompat
import org.json.JSONArray
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.os.Handler
import android.os.Looper
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.x201harsh.IRISMX.core.IrisNativeEngine

class IrisNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private val mainHandler = Handler(Looper.getMainLooper())
    @Volatile private var speechRecognizer: SpeechRecognizer? = null

    @ReactMethod fun addListener(eventName: String) { /* Required by NativeEventEmitter */ }
    @ReactMethod fun removeListeners(count: Int) { /* Required by NativeEventEmitter */ }

    private fun emit(event: String, message: String) {
        reactApplicationContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(event, Arguments.createMap().apply { putString("text", message); putString("message", message) })
    }

    @ReactMethod
    fun startSpeechRecognition(language: String, promise: Promise) {
        mainHandler.post {
            try {
                if (!SpeechRecognizer.isRecognitionAvailable(reactApplicationContext)) {
                    promise.reject("SPEECH_UNAVAILABLE", "এই ডিভাইসে Speech Recognition service নেই")
                    return@post
                }
                speechRecognizer?.destroy()
                val recognizer = SpeechRecognizer.createSpeechRecognizer(reactApplicationContext)
                speechRecognizer = recognizer
                recognizer.setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: android.os.Bundle?) {}
                    override fun onBeginningOfSpeech() {}
                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}
                    override fun onEndOfSpeech() {}
                    override fun onError(error: Int) {
                        emit("IrisSpeechError", "Voice recognition error: $error")
                        stopSpeechInternal()
                    }
                    override fun onResults(results: android.os.Bundle?) {
                        val text = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)?.firstOrNull()
                        if (!text.isNullOrBlank()) emit("IrisSpeechResult", text)
                        stopSpeechInternal()
                    }
                    override fun onPartialResults(partialResults: android.os.Bundle?) { }
                    override fun onEvent(eventType: Int, params: android.os.Bundle?) {}
                })
                val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
                    putExtra(RecognizerIntent.EXTRA_LANGUAGE, language)
                    putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
                    putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
                }
                recognizer.startListening(intent)
                promise.resolve(true)
            } catch (e: Exception) { promise.reject("SPEECH_START_FAILED", e.message, e) }
        }
    }

    private fun stopSpeechInternal() {
        try { speechRecognizer?.stopListening(); speechRecognizer?.destroy() } catch (_: Exception) {}
        speechRecognizer = null
    }

    @ReactMethod fun stopSpeechRecognition(promise: Promise) {
        mainHandler.post { stopSpeechInternal(); promise.resolve(true) }
    }

    @ReactMethod fun openSystemSettings(target: String, promise: Promise) {
        try {
            val action = when (target.lowercase()) {
                "wifi" -> Settings.ACTION_WIFI_SETTINGS
                "bluetooth" -> Settings.ACTION_BLUETOOTH_SETTINGS
                "hotspot" -> Settings.ACTION_WIRELESS_SETTINGS
                "location" -> Settings.ACTION_LOCATION_SOURCE_SETTINGS
                "camera" -> android.provider.MediaStore.ACTION_IMAGE_CAPTURE
                else -> Settings.ACTION_SETTINGS
            }
            val intent = Intent(action).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) { promise.reject("SETTINGS_OPEN_FAILED", e.message, e) }
    }

    @ReactMethod fun openApp(packageName: String, promise: Promise) {
        try {
            val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage(packageName)
            if (intent == null) { promise.resolve(false); return }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) { promise.reject("APP_OPEN_FAILED", e.message, e) }
    }

    @ReactMethod fun openDialer(number: String, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${Uri.encode(number)}"))
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent); promise.resolve(true)
        } catch (e: Exception) { promise.reject("DIALER_OPEN_FAILED", e.message, e) }
    }

    @ReactMethod fun openSmsDraft(number: String, message: String, promise: Promise) {
        try {
            val uri = Uri.parse("smsto:${Uri.encode(number)}")
            val intent = Intent(Intent.ACTION_SENDTO, uri).apply {
                putExtra("sms_body", message)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent); promise.resolve(true)
        } catch (e: Exception) { promise.reject("SMS_DRAFT_FAILED", e.message, e) }
    }

    @ReactMethod fun openWhatsAppDraft(number: String, message: String, promise: Promise) {
        try {
            val digits = number.filter { it.isDigit() }
            val uri = Uri.parse("https://wa.me/$digits?text=${Uri.encode(message)}")
            val intent = Intent(Intent.ACTION_VIEW, uri).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent); promise.resolve(true)
        } catch (e: Exception) { promise.reject("WHATSAPP_DRAFT_FAILED", e.message, e) }
    }

    @ReactMethod fun createCalendarDraft(title: String, beginMillis: Double, endMillis: Double, promise: Promise) {
        try {
            val intent = Intent(Intent.ACTION_INSERT).setData(CalendarContract.Events.CONTENT_URI).apply {
                putExtra(CalendarContract.Events.TITLE, title)
                putExtra(CalendarContract.EXTRA_EVENT_BEGIN_TIME, beginMillis.toLong())
                putExtra(CalendarContract.EXTRA_EVENT_END_TIME, endMillis.toLong())
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent); promise.resolve(true)
        } catch (e: Exception) { promise.reject("CALENDAR_DRAFT_FAILED", e.message, e) }
    }

    @ReactMethod fun openNotificationAccessSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)
                .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent); promise.resolve(true)
        } catch (e: Exception) { promise.reject("NOTIFICATION_SETTINGS_FAILED", e.message, e) }
    }

    @ReactMethod fun getLatestNotifications(promise: Promise) {
        try {
            val source = IrisNotificationListenerService.readLatest()
            val result = Arguments.createArray()
            for (i in 0 until source.length()) {
                val item = source.getJSONObject(i)
                result.pushMap(Arguments.createMap().apply {
                    putString("packageName", item.optString("packageName"))
                    putString("title", item.optString("title"))
                    putString("text", item.optString("text"))
                    putDouble("postedAt", item.optLong("postedAt").toDouble())
                })
            }
            promise.resolve(result)
        } catch (e: Exception) { promise.reject("NOTIFICATION_READ_FAILED", e.message, e) }
    }

    @ReactMethod fun controlMediaPlayback(action: String, promise: Promise) {
        val service = IrisNotificationListenerService.activeService
        if (service == null) {
            promise.reject("NOTIFICATION_ACCESS_REQUIRED", "প্রথমে Notification Access চালু করুন")
            return
        }
        promise.resolve(service.controlMedia(action))
    }

    @ReactMethod fun setFlashlight(enabled: Boolean, promise: Promise) {
        try {
            if (ContextCompat.checkSelfPermission(reactApplicationContext, android.Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                promise.reject("CAMERA_PERMISSION_REQUIRED", "Flashlight ব্যবহারের জন্য Camera permission দিন")
                return
            }
            val manager = reactApplicationContext.getSystemService(Context.CAMERA_SERVICE) as CameraManager
            val cameraId = manager.cameraIdList.firstOrNull { id ->
                val chars = manager.getCameraCharacteristics(id)
                chars.get(android.hardware.camera2.CameraCharacteristics.FLASH_INFO_AVAILABLE) == true &&
                    chars.get(android.hardware.camera2.CameraCharacteristics.LENS_FACING) == android.hardware.camera2.CameraCharacteristics.LENS_FACING_BACK
            } ?: run { promise.reject("FLASH_NOT_AVAILABLE", "এই ফোনে flashlight পাওয়া যায়নি"); return }
            manager.setTorchMode(cameraId, enabled)
            promise.resolve(true)
        } catch (e: Exception) { promise.reject("FLASHLIGHT_FAILED", e.message, e) }
    }


    override fun getName(): String {
        return "IrisNativeModule"
    }

    @ReactMethod
    fun startNativeEngine(promise: Promise) {
        try {
            IrisNativeEngine.startNativeLoop()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_ENGINE_START", e.message, e)
        }
    }

    @ReactMethod
    fun stopNativeEngine(promise: Promise) {
        try {
            IrisNativeEngine.stopNativeLoop()
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_ENGINE_STOP", e.message, e)
        }
    }

    @ReactMethod
    fun getTelemetryData(promise: Promise) {
        try {
            val telem = IrisNativeEngine.telemetryFlow.value
            val map = Arguments.createMap().apply {
                putDouble("cpuLoad", telem.cpuLoad)
                putDouble("allocatedBytes", telem.allocatedBytes.toDouble())
                putDouble("processedFrames", telem.processedFrames.toDouble())
                putDouble("inferenceLatencyMs", telem.inferenceLatencyMs)
            }
            promise.resolve(map)
        } catch (e: Exception) {
            promise.reject("ERR_TELEMETRY", e.message, e)
        }
    }
}
