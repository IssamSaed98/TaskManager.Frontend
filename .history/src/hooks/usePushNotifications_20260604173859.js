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
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true)
      checkSubscription()
    }
  }, [])

  const checkSubscription = async () => {
    try {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      setIsSubscribed(!!sub)
    } catch { }
  }

  const subscribe = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      if (!token) return
  
      // 1. طلب إذن الإشعارات بشكل صريح (مهم جداً للـ iOS)
      if ('Notification' in window) {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') {
          alert('يرجى السماح بالإشعارات من إعدادات الهاتف لكي تصلك المناسبات!')
          return
        }
      }
  
      // 2. جلب مفتاح VAPID من السيرفر
      const res = await axios.get(`${BASE_URL}/notifications/vapid-public-key`, {
        headers: { Authorization: `Bearer ${token}` }
      })
  
      const publicKey = res.data.publicKey
      
      // 3. تأمين جلب الـ Registration المتوافق مع المتصفحات
      let reg = await navigator.serviceWorker.ready
      
      // إذا لم يجد التسجيل الجاهز، نحاول جلبه من التسجيلات الحالية
      if (!reg) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        reg = registrations[0]
      }
  
      if (!reg) {
        console.error('Service Worker is not registered yet!')
        return
      }
  
      // 4. الاشتراك في خدمة الـ Push
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey)
      })
  
      const subJson = sub.toJSON()
  
      // 5. إرسال البيانات إلى سيرفر Azure الخاص بك
      await axios.post(`${BASE_URL}/notifications/subscribe`, {
        endpoint: subJson.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
  
      setIsSubscribed(true)
      alert('تم تفعيل الإشعارات بنجاح على هاتفك!') // للتأكد أثناء التجربة
    } catch (err) {
      console.error('Subscribe error:', err)
      alert('حدث خطأ أثناء الاشتراك: ' + err.message)
    }
  }
  const unsubscribe = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token')
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()

      if (sub) {
        await axios.delete(`${BASE_URL}/notifications/unsubscribe`, {
          data: { endpoint: sub.endpoint },
          headers: { Authorization: `Bearer ${token}` }
        })
        await sub.unsubscribe()
        setIsSubscribed(false)
      }
    } catch (err) {
      console.error('Unsubscribe error:', err)
    }
  }

  return { isSubscribed, isSupported, subscribe, unsubscribe }
}