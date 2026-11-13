package com.x201harsh.IRISMX.nativebridge

import android.app.Notification
import android.content.ComponentName
import android.content.Context
import android.media.session.PlaybackState
import android.media.session.MediaSessionManager
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import org.json.JSONArray
import java.util.ArrayDeque
import org.json.JSONObject

class IrisNotificationListenerService : NotificationListenerService() {
    companion object {
        @Volatile var activeService: IrisNotificationListenerService? = null
        private val recentItems = ArrayDeque<JSONObject>()

        fun readLatest(limit: Int = 30): JSONArray = synchronized(recentItems) {
            val result = JSONArray()
            recentItems.toList().takeLast(limit).forEach { result.put(it) }
            result
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        activeService = this
    }

    override fun onListenerDisconnected() {
        activeService = null
        super.onListenerDisconnected()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        try {
            val extras = sbn.notification.extras
            val title = extras.getCharSequence(Notification.EXTRA_TITLE)?.toString().orEmpty()
            val text = (extras.getCharSequence(Notification.EXTRA_BIG_TEXT)
                ?: extras.getCharSequence(Notification.EXTRA_TEXT))?.toString().orEmpty()
            if (title.isBlank() && text.isBlank()) return
            val item = JSONObject().apply {
                put("packageName", sbn.packageName)
                put("title", title.take(160))
                put("text", text.take(500))
                put("postedAt", sbn.postTime)
            }
            synchronized(recentItems) {
                recentItems.addLast(item)
                while (recentItems.size > 30) recentItems.removeFirst()
            }
        } catch (_: Exception) { /* Notification parsing must never crash the service. */ }
    }

    fun controlMedia(action: String): Boolean {
        return try {
            val manager = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
            val sessions = manager.getActiveSessions(ComponentName(this, IrisNotificationListenerService::class.java))
            val controller = sessions.firstOrNull { it.playbackState?.state == PlaybackState.STATE_PLAYING }
                ?: sessions.firstOrNull() ?: return false
            val controls = controller.transportControls
            when (action.lowercase()) {
                "play" -> controls.play()
                "pause" -> controls.pause()
                "toggle" -> if (controller.playbackState?.state == PlaybackState.STATE_PLAYING) controls.pause() else controls.play()
                "next" -> controls.skipToNext()
                "previous" -> controls.skipToPrevious()
                else -> return false
            }
            true
        } catch (_: SecurityException) { false } catch (_: Exception) { false }
    }
}
