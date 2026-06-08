import { useState, useEffect } from 'react'
import axios from 'axios'

const BASE_URL = 'https://taskmanager-api-issam-avafg0fphpe8bqbb.germanywestcentral-01.azurewebsites.net/api'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const usePushNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported =
      'serviceWorker' in navigator &&
      'PushManager' in window &&
      'Notification' in window

    setIsSupported(supported)

    if (supported) {
      // انتظر حتى يتسجّل الـ SW ثم تحقق من الاشتراك
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub)
          if (sub) console.log('🔔 Already subscribed to push notifications')
        })
      })
    }
  }, [])

  const subscribe = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.error('❌ No token found')
        return
      }

      // طلب إذن الإشعارات
      console.log('📋 Requesting notification permission...')
      const perm = await Notification.requestPermission()
      console.log('Permission result:', perm)

      if (perm !== 'granted') {
        alert('Bitte erlauben Sie Benachrichtigungen in den Browser-Einstellungen und laden Sie die Seite neu.')
        return
      }

      // انتظر الـ SW
      console.log('⏳ Waiting for Service Worker...')
      const reg = await navigator.serviceWorker.ready
      console.log('✅ Service Worker ready:', reg.scope)

      // جيب الـ VAPID Key
      console.log('🔑 Fetching VAPID key...')
      const res = await axios.get(`${BASE_URL}/notifications/vapid-public-key`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const publicKey = res.data.publicKey
      console.log('✅ VAPID key received')

      // ألغ الاشتراك القديم لو موجود
      const existingSub = await reg.pushManager.getSubscription()
      if (existingSub) {
        await existingSub.unsubscribe()
        console.log('🗑 Removed old subscription')
      }

      // اشترك من جديد
      console.log('📡 Subscribing to push...')
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })
      console.log('✅ Push subscription created')

      const subJson = sub.toJSON()

      // أرسل للباك اند
      await axios.post(`${BASE_URL}/notifications/subscribe`, {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setIsSubscribed(true)
      console.log('🎉 Push notifications ENABLED successfully!')
    } catch (err) {
      console.error('❌ Subscribe error:', err)
      console.error('Details:', err.message)
    }
  }

  const unsubscribe = async () => {
    try {
      const token = localStorage.getItem('token')
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()

      if (sub) {
        await axios.delete(`${BASE_URL}/notifications/unsubscribe`, {
          data: { endpoint: sub.endpoint },
          headers: { Authorization: `Bearer ${token}` }
        })
        await sub.unsubscribe()
        setIsSubscribed(false)
        console.log('🔕 Push notifications disabled')
      }
    } catch (err) {
      console.error('❌ Unsubscribe error:', err)
    }
  }

  return { isSubscribed, isSupported, subscribe, unsubscribe }
}