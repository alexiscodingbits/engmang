'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
  initialBio: string
  initialAvatarUrl: string
  initialLinkedInUrl: string
  initialPhoneNumber: string
  initialSmsNotifications: boolean
}

export default function EditProfileClient({
  userId,
  initialBio,
  initialAvatarUrl,
  initialLinkedInUrl,
  initialPhoneNumber,
  initialSmsNotifications,
}: Props) {
  const router = useRouter()
  const [bio, setBio] = useState(initialBio)
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl)
  const [linkedInUrl, setLinkedInUrl] = useState(initialLinkedInUrl)
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)
  const [smsNotifications, setSmsNotifications] = useState(initialSmsNotifications)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function uploadAvatar(file: File) {
    setAvatarUploading(true)
    setError('')
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      })
      if (!res.ok) throw new Error('Could not get upload URL')
      const { presignedUrl, publicUrl } = await res.json()

      const putRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!putRes.ok) throw new Error('Upload failed')
      setAvatarUrl(publicUrl)
    } catch {
      setError('Avatar upload failed — please try again.')
    } finally {
      setAvatarUploading(false)
    }
  }

  function sanitiseUrl(raw: string): string {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    return `https://${trimmed}`
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    const res = await fetch('/api/user/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bio, avatarUrl, linkedInUrl: sanitiseUrl(linkedInUrl), phoneNumber, smsNotifications }),
    })
    setSaving(false)
    if (res.ok) {
      router.push(`/profile/${userId}`)
      router.refresh()
    } else {
      const data = await res.json()
      setError(data.error ?? 'Failed to save')
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-6">
      {/* Avatar */}
      <div>
        <label className="block text-sm text-slate-500 dark:text-zinc-400 mb-3">Profile Picture</label>
        <div className="flex items-center gap-4">
          <div className="shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-zinc-700"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                ?
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="px-4 py-2 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-sm rounded-lg transition-colors disabled:opacity-50"
            >
              {avatarUploading ? 'Uploading…' : 'Upload photo'}
            </button>
            {avatarUrl && (
              <button
                type="button"
                onClick={() => setAvatarUrl('')}
                className="text-xs text-slate-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-colors text-left"
              >
                Remove photo
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadAvatar(file)
            }}
          />
        </div>
      </div>

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm text-slate-500 dark:text-zinc-400 mb-1.5">
          Bio <span className="text-slate-400 dark:text-zinc-600">({bio.length}/300)</span>
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, 300))}
          placeholder="Tell people a bit about yourself…"
          rows={4}
          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
        />
      </div>

      {/* LinkedIn URL */}
      <div>
        <label htmlFor="linkedin" className="block text-sm text-slate-500 dark:text-zinc-400 mb-1.5">
          LinkedIn URL <span className="text-slate-400 dark:text-zinc-600">(optional)</span>
        </label>
        <input
          id="linkedin"
          type="text"
          value={linkedInUrl}
          onChange={(e) => setLinkedInUrl(e.target.value)}
          placeholder="https://linkedin.com/in/yourname"
          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
      </div>

      {/* Phone Number */}
      <div>
        <label htmlFor="phone" className="block text-sm text-slate-500 dark:text-zinc-400 mb-1.5">
          Phone Number <span className="text-slate-400 dark:text-zinc-600">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="+353 85 123 4567"
          className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors"
        />
        <p className="text-xs text-slate-400 dark:text-zinc-600 mt-1.5">Used for SMS notifications about important updates.</p>
      </div>

      {/* SMS Notifications Toggle */}
      <label className="flex items-center justify-between cursor-pointer">
        <div>
          <span className="block text-sm text-slate-700 dark:text-zinc-300">SMS Notifications</span>
          <span className="block text-xs text-slate-400 dark:text-zinc-600">Receive text messages for important updates</span>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={smsNotifications}
            onChange={(e) => setSmsNotifications(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 dark:bg-zinc-700 rounded-full peer-checked:bg-emerald-500 transition-colors" />
          <div className="absolute left-[2px] top-[2px] w-5 h-5 bg-white rounded-full shadow-sm peer-checked:translate-x-5 transition-transform" />
        </div>
      </label>

      {error && (
        <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200 text-sm font-medium transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || avatarUploading}
          className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 text-sm font-semibold transition-colors"
        >
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </form>
  )
}
