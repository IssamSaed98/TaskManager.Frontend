import { useState, useEffect } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import {
  getEvents, createEvent, respondToEvent,
  approveResponse, removeResponse, deleteEvent
} from '../api'
import { useSignalR } from '../hooks/useSignalR'
import { useCallback } from 'react'
function Events({ userRole }) {
  const { t, isRTL } = useLanguage()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [requiredStaff, setRequiredStaff] = useState(1)

  const isAdmin = userRole === 'Admin'

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const res = await getEvents()
      setEvents(res.data)
    } catch {
      console.error('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvent = async () => {
    if (!title || !eventDate) return
    try {
      await createEvent({
        title, description,
        eventDate: new Date(eventDate).toISOString(),
        location, requiredStaff: parseInt(requiredStaff)
      })
      setTitle(''); setDescription(''); setEventDate('')
      setLocation(''); setRequiredStaff(1)
      setShowForm(false)
      loadEvents()
    } catch { console.error('error') }
  }

  const handleRespond = async (eventId, status) => {
    try {
      await respondToEvent(eventId, status)
      loadEvents()
    } catch { console.error('error') }
  }

  const handleApprove = async (eventId, userId) => {
    try {
      await approveResponse(eventId, userId)
      loadEvents()
    } catch { console.error('error') }
  }

  const handleRemove = async (eventId, userId) => {
    try {
      await removeResponse(eventId, userId)
      loadEvents()
    } catch { console.error('error') }
  }

  const handleDelete = async (eventId) => {
    try {
      await deleteEvent(eventId)
      loadEvents()
    } catch { console.error('error') }
  }

  return (
    <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-white">{t('events')}</span>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
            + {t('new_event')}
          </button>
        )}
      </div>

      {/* Create Form */}
      {showForm && isAdmin && (
        <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
          style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder={t('event_title')}
            className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
            style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder={t('event_description')}
            className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
            style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder={t('event_location')}
            className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
            style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
            <input type="number" value={requiredStaff} onChange={e => setRequiredStaff(e.target.value)}
              placeholder={t('required_staff')} min={1}
              className="rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#c0d8f0', fontFamily: 'inherit' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateEvent}
              className="flex-1 rounded-xl py-2.5 text-xs font-medium"
              style={{ background: 'linear-gradient(135deg,#1565C0,#1E88E5)', color: '#fff' }}>
              {t('save_event')}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Events List */}
      {loading ? (
        <div className="text-center py-16 text-xs" style={{ color: '#3a5070' }}>{t('loading')}</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#3a5070' }}>
          <div className="text-4xl mb-3">📅</div>
          <p className="text-xs">{t('no_events')}</p>
        </div>
      ) : events.map(event => (
        <div key={event.id} className="rounded-2xl p-4 mb-3"
          style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>

          {/* Event Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-sm font-semibold text-white mb-1">{event.title}</div>
              {event.description && (
                <div className="text-xs mb-1" style={{ color: '#4a6080' }}>{event.description}</div>
              )}
              <div className="flex gap-3 flex-wrap">
                <span className="text-xs" style={{ color: '#60a5fa' }}>
                  📅 {new Date(event.eventDate).toLocaleDateString()}
                </span>
                {event.location && (
                  <span className="text-xs" style={{ color: '#4a6080' }}>📍 {event.location}</span>
                )}
                <span className="text-xs" style={{ color: '#fbbf24' }}>
                  👥 {event.approvedResponses}/{event.requiredStaff} {t('staff_confirmed')}
                </span>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(event.id)}
                className="text-xs px-2 py-1 rounded-lg"
                style={{ color: '#f87171', background: 'rgba(239,68,68,0.06)' }}>
                🗑
              </button>
            )}
          </div>

          {/* Employee Response Buttons */}
          {!isAdmin && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleRespond(event.id, 'Available')}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: event.myResponse?.status === 'Available'
                    ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.06)',
                  border: `0.5px solid ${event.myResponse?.status === 'Available'
                    ? 'rgba(34,197,94,0.4)' : 'rgba(34,197,94,0.1)'}`,
                  color: '#4ade80',
                }}>
                {event.myResponse?.isApproved ? t('approved') : t('will_attend')}
              </button>
              <button
                onClick={() => handleRespond(event.id, 'Unavailable')}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                style={{
                  background: event.myResponse?.status === 'Unavailable'
                    ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.06)',
                  border: `0.5px solid ${event.myResponse?.status === 'Unavailable'
                    ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.1)'}`,
                  color: '#f87171',
                }}>
                {t('wont_attend')}
              </button>
            </div>
          )}

          {/* Admin — Responses List */}
          {isAdmin && event.responses && event.responses.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '0.5px solid #1e2d40' }}>
              <div className="text-xs mb-2" style={{ color: '#3a5070' }}>
                {t('event_responses')} ({event.availableResponses} {t('available')})
              </div>
              {event.responses.filter(r => r.status === 'Available').map(response => (
                <div key={response.id} className="flex items-center gap-3 py-2 rounded-xl px-3 mb-1"
                  style={{ background: response.isApproved ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)' }}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {response.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs flex-1" style={{ color: '#c0d8f0' }}>{response.username}</span>
                  {response.isApproved ? (
                    <span className="text-xs" style={{ color: '#4ade80' }}>{t('approved')}</span>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(event.id, response.userId)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '0.5px solid rgba(34,197,94,0.2)' }}>
                        {t('approve')}
                      </button>
                      <button onClick={() => handleRemove(event.id, response.userId)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
                        {t('remove')}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default Events