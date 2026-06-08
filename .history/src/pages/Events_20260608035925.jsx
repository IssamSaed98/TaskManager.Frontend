import { useState, useEffect, useCallback } from 'react'
import { useLanguage } from '../hooks/useLanguage'
import { usePolling } from '../hooks/usePolling'
import {
  getEvents, createEvent, respondToEvent,
  approveResponse, removeResponse, deleteEvent
} from '../api'

function Events({ userRole }) {
  const { t, isRTL } = useLanguage()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [location, setLocation] = useState('')
  const [requiredStaff, setRequiredStaff] = useState(1)

  const isAdmin = userRole === 'Admin'

  const loadEvents = useCallback(async () => {
    try {
      const res = await getEvents()
      setEvents(res.data)
    } catch {
      console.error('error loading events')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadEvents() }, [])
  usePolling(loadEvents, 5000, true)

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
    } catch (err) {
      if (err.response?.status === 400) {
        alert(err.response.data?.message || 'Eine Änderung ist nicht möglich.')
      }
    }
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

      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
          {isAdmin ? 'Veranstaltungen verwalten' : 'Bevorstehende Veranstaltungen'}
        </span>
        {isAdmin && (
          <button onClick={() => setShowForm(!showForm)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
            + Neue Veranstaltung
          </button>
        )}
      </div>

      {showForm && isAdmin && (
        <div className="rounded-2xl p-4 mb-4 flex flex-col gap-3"
          style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Titel der Veranstaltung *"
            className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
            style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
          <input value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Beschreibung"
            className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
            style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
          <input value={location} onChange={e => setLocation(e.target.value)}
            placeholder="Ort"
            className="rounded-xl px-3 py-2.5 text-xs outline-none w-full"
            style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
            <input type="number" value={requiredStaff} onChange={e => setRequiredStaff(e.target.value)}
              placeholder="Benötigte Mitarbeiter" min={1}
              className="rounded-xl px-3 py-2.5 text-xs outline-none"
              style={{ background: '#111827', border: '0.5px solid #1e2d40', color: '#ffffff', fontFamily: 'inherit' }} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleCreateEvent}
              className="flex-1 rounded-xl py-2.5 text-xs font-medium"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff' }}>
              Speichern
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 rounded-xl text-xs"
              style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
              ✕
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-16 text-xs" style={{ color: '#3a5070' }}>Wird geladen...</div>
      ) : events.length === 0 ? (
        <div className="text-center py-16" style={{ color: '#3a5070' }}>
          <div className="text-4xl mb-3">📅</div>
          <p className="text-xs">Keine Veranstaltungen vorhanden</p>
        </div>
      ) : events.map(event => (
        <div key={event.id} className="rounded-2xl p-4 mb-3"
          style={{ background: '#0a0f1a', border: '0.5px solid #1e2d40' }}>

          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="text-sm font-semibold mb-1" style={{ color: '#ffffff' }}>{event.title}</div>
              {event.description && (
                <div className="text-xs mb-2" style={{ color: '#7090b0' }}>{event.description}</div>
              )}
              <div className="flex gap-3 flex-wrap">
                <span className="text-xs" style={{ color: '#60a5fa' }}>
                  📅 {new Date(event.eventDate).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                {event.location && (
                  <span className="text-xs" style={{ color: '#7090b0' }}>📍 {event.location}</span>
                )}
                <span className="text-xs" style={{ color: '#fbbf24' }}>
                  👥 {event.approvedResponses}/{event.requiredStaff} bestätigt
                </span>
              </div>
            </div>
            {isAdmin && (
              <button onClick={() => handleDelete(event.id)}
                className="text-xs px-2 py-1 rounded-lg ml-2"
                style={{ color: '#f87171', background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.15)' }}>
                🗑
              </button>
            )}
          </div>

          {/* Employee response */}
          {!isAdmin && (
            <div className="mt-3 pt-3" style={{ borderTop: '0.5px solid #1e2d40' }}>
              {event.myResponse ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs px-3 py-2 rounded-xl"
                    style={{
                      background: event.myResponse.status === 'Available' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                      color: event.myResponse.status === 'Available' ? '#4ade80' : '#f87171',
                      border: `0.5px solid ${event.myResponse.status === 'Available' ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
                    }}>
                    {event.myResponse.isApproved
                      ? '✅ Teilnahme bestätigt'
                      : event.myResponse.status === 'Available'
                        ? '✓ Ich bin dabei (wartet auf Bestätigung)'
                        : '❌ Ich kann nicht teilnehmen'}
                  </span>
                  <span className="text-xs" style={{ color: '#3a5070' }}>
                    (Änderung nicht möglich)
                  </span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleRespond(event.id, 'Available')}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{ background: 'rgba(34,197,94,0.08)', border: '0.5px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
                    ✅ Ich bin dabei
                  </button>
                  <button onClick={() => handleRespond(event.id, 'Unavailable')}
                    className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                    style={{ background: 'rgba(239,68,68,0.06)', border: '0.5px solid rgba(239,68,68,0.15)', color: '#f87171' }}>
                    ❌ Ich kann nicht
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin responses */}
          {isAdmin && event.responses && event.responses.length > 0 && (
            <div className="mt-3 pt-3" style={{ borderTop: '0.5px solid #1e2d40' }}>
              <div className="text-xs mb-2" style={{ color: '#3a5070' }}>
                Antworten ({event.availableResponses} verfügbar)
              </div>
              {event.responses.filter(r => r.status === 'Available').map(response => (
                <div key={response.id} className="flex items-center gap-3 py-2 px-3 rounded-xl mb-1"
                  style={{ background: response.isApproved ? 'rgba(34,197,94,0.06)' : 'rgba(255,255,255,0.02)' }}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                    {response.username.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs flex-1" style={{ color: '#ffffff' }}>{response.username}</span>
                  {response.isApproved ? (
                    <span className="text-xs" style={{ color: '#4ade80' }}>✅ Bestätigt</span>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(event.id, response.userId)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80', border: '0.5px solid rgba(34,197,94,0.2)' }}>
                        ✓ Bestätigen
                      </button>
                      <button onClick={() => handleRemove(event.id, response.userId)}
                        className="text-xs px-2 py-1 rounded-lg"
                        style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '0.5px solid rgba(239,68,68,0.15)' }}>
                        ✕ Entfernen
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