'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Contact } from './MessagesClient'

interface Props {
  currentUserYear: number
  selectedContact: Contact | null
  onSelectContact: (contact: Contact) => void
}

export default function ContactsSidebar({ currentUserYear, selectedContact, onSelectContact }: Props) {
  const [year, setYear] = useState(currentUserYear)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/messages/contacts?year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        setContacts(data.contacts ?? [])
        setFavoriteIds(new Set(data.favoriteIds ?? []))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [year])

  async function toggleFavorite(e: React.MouseEvent<HTMLButtonElement>, contactId: string) {
    e.stopPropagation()
    const res = await fetch('/api/messages/favorites', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetId: contactId }),
    })
    if (res.ok) {
      const { isFavorited } = await res.json()
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (isFavorited) next.add(contactId)
        else next.delete(contactId)
        return next
      })
    }
  }

  const favorites = contacts.filter((c) => favoriteIds.has(c.id))
  const others = contacts.filter((c) => !favoriteIds.has(c.id))

  return (
    <div className="w-64 flex-shrink-0 border-r border-zinc-800 flex flex-col">
      {/* Year selector */}
      <div className="p-4 border-b border-zinc-800">
        <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Year</label>
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          {[1, 2, 3, 4, 5].map((y) => (
            <option key={y} value={y}>Year {y}</option>
          ))}
        </select>
      </div>

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-sm text-zinc-500">Loading...</div>
        ) : (
          <>
            {/* Favourites section */}
            {favorites.length > 0 && (
              <div>
                <div className="px-4 pt-4 pb-1 text-xs text-zinc-500 uppercase tracking-wider">
                  Favourites
                </div>
                {favorites.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContact?.id === contact.id}
                    isFavorite
                    onSelect={() => onSelectContact(contact)}
                    onToggleFavorite={(e) => toggleFavorite(e, contact.id)}
                  />
                ))}
              </div>
            )}

            {/* All students in selected year */}
            <div>
              <div className="px-4 pt-4 pb-1 text-xs text-zinc-500 uppercase tracking-wider">
                Year {year} Students
              </div>
              {others.length === 0 ? (
                <div className="px-4 py-2 text-sm text-zinc-600">No students found</div>
              ) : (
                others.map((contact) => (
                  <ContactRow
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContact?.id === contact.id}
                    isFavorite={false}
                    onSelect={() => onSelectContact(contact)}
                    onToggleFavorite={(e) => toggleFavorite(e, contact.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function ContactRow({
  contact,
  isSelected,
  isFavorite,
  onSelect,
  onToggleFavorite,
}: {
  contact: Contact
  isSelected: boolean
  isFavorite: boolean
  onSelect: () => void
  onToggleFavorite: (e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div
      onClick={onSelect}
      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
        isSelected ? 'bg-zinc-800 text-white' : 'text-zinc-300 hover:bg-zinc-800/50'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <Link
          href={`/profile/${contact.id}`}
          onClick={(e) => e.stopPropagation()}
          className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-semibold text-white flex-shrink-0 hover:bg-emerald-700 transition-colors"
        >
          {contact.name.charAt(0).toUpperCase()}
        </Link>
        <span className="text-sm truncate">{contact.name}</span>
      </div>
      <button
        onClick={onToggleFavorite}
        className={`flex-shrink-0 text-base leading-none transition-colors ${
          isFavorite ? 'text-emerald-400' : 'text-zinc-600 hover:text-zinc-400'
        }`}
        title={isFavorite ? 'Remove from favourites' : 'Add to favourites'}
      >
        {isFavorite ? '★' : '☆'}
      </button>
    </div>
  )
}
