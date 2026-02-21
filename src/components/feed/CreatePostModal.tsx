'use client'

import { useState } from 'react'
import type { Post, PostType } from './types'
import { NOTE_TAGS } from '@/lib/modules'

type ModuleContext = {
  moduleCode: string
  moduleYear: number
  section: string
} | null

interface Props {
  onClose: () => void
  onCreated: (post: Post) => void
  moduleContext?: ModuleContext
}

const MODULE_POST_TYPES: { value: PostType; label: string; icon: string }[] = [
  { value: 'TEXT', label: 'Text', icon: '📝' },
  { value: 'LINK', label: 'Link', icon: '🔗' },
  { value: 'IMAGE', label: 'Image', icon: '🖼️' },
]

export default function CreatePostModal({ onClose, onCreated, moduleContext }: Props) {
  const isGeneralFeed = !moduleContext
  const isNotes = moduleContext?.section === 'NOTES'

  // Shared fields
  const [postBody, setPostBody] = useState('')
  const [linkUrl, setLinkUrl] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [fileUrl, setFileUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Module-only fields
  const [title, setTitle] = useState('')
  const [type, setType] = useState<PostType>('TEXT')
  const [noteTag, setNoteTag] = useState('')

  // Image upload tracking
  const [imageUploading, setImageUploading] = useState(false)
  const [imageUploadedName, setImageUploadedName] = useState('')

  // File/PDF upload tracking
  const [fileUploading, setFileUploading] = useState(false)
  const [fileUploadedName, setFileUploadedName] = useState('')

  const anyUploading = imageUploading || fileUploading

  async function uploadFile(
    file: File,
    setUrl: (url: string) => void,
    setUploading: (v: boolean) => void,
    setName: (n: string) => void,
  ) {
    setUploading(true)
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
      if (!putRes.ok) throw new Error('Upload to storage failed')

      setUrl(publicUrl)
      setName(file.name)
    } catch {
      setError('File upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    if (isGeneralFeed) {
      if (!postBody.trim()) { setError('Write something before posting'); return }
    } else {
      if (!title.trim()) { setError('Title is required'); return }
      if (isNotes && !noteTag) { setError('Please select a tag for this note'); return }
    }

    if (anyUploading) { setError('Please wait for the upload to finish'); return }

    setSubmitting(true)

    const payload: Record<string, unknown> = isGeneralFeed
      ? {
          title: postBody.slice(0, 200),
          type: 'TEXT',
          imageUrl: imageUrl || undefined,
          linkUrl: linkUrl.trim() || undefined,
          fileUrl: fileUrl || undefined,
        }
      : {
          title,
          postBody,
          type,
          imageUrl: type === 'IMAGE' ? imageUrl : undefined,
          linkUrl: type === 'LINK' ? linkUrl : undefined,
          fileUrl: fileUrl || undefined,
          noteTag: isNotes ? noteTag : undefined,
          moduleCode: moduleContext!.moduleCode,
          moduleYear: moduleContext!.moduleYear,
          section: moduleContext!.section,
        }

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (res.ok) {
      onCreated(await res.json())
    } else {
      const data = await res.json()
      setError(data.error ?? 'Something went wrong')
    }
    setSubmitting(false)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-zinc-800">
          <h2 className="text-zinc-100 font-semibold text-base">
            {moduleContext ? 'Post to Module' : 'Create Post'}
          </h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 text-xl leading-none">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {isGeneralFeed ? (
            /* ── Unified General Feed form ── */
            <>
              <textarea
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                placeholder="What's on your mind?"
                rows={4}
                maxLength={1000}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
              />

              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Add a link (optional)"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-3">
                <UploadButton
                  accept="image/*"
                  label="Upload Image"
                  icon="🖼️"
                  uploading={imageUploading}
                  uploaded={!!imageUrl}
                  uploadedName={imageUploadedName}
                  onChange={(file) =>
                    uploadFile(file, setImageUrl, setImageUploading, setImageUploadedName)
                  }
                />
                <UploadButton
                  accept=".pdf"
                  label="Upload PDF"
                  icon="📄"
                  uploading={fileUploading}
                  uploaded={!!fileUrl}
                  uploadedName={fileUploadedName}
                  onChange={(file) =>
                    uploadFile(file, setFileUrl, setFileUploading, setFileUploadedName)
                  }
                />
              </div>
            </>
          ) : (
            /* ── Module post form ── */
            <>
              {/* Note tag selector (NOTES section only) */}
              {isNotes && (
                <select
                  value={noteTag}
                  onChange={(e) => setNoteTag(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500 text-zinc-200"
                >
                  <option value="" disabled className="text-zinc-500">Select a tag…</option>
                  {NOTE_TAGS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              )}

              {/* Type selector */}
              <div className="flex gap-2">
                {MODULE_POST_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => {
                      setType(t.value)
                      setImageUrl('')
                      setImageUploadedName('')
                    }}
                    className={`flex-1 flex flex-col items-center gap-1 py-2.5 rounded-lg border text-xs font-medium transition-colors ${
                      type === t.value
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                        : 'border-zinc-700 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300'
                    }`}
                  >
                    <span className="text-lg">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Title */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
              />

              {/* Body */}
              {(type === 'TEXT' || type === 'LINK') && (
                <textarea
                  value={postBody}
                  onChange={(e) => setPostBody(e.target.value)}
                  placeholder={type === 'LINK' ? 'Description (optional)…' : 'Write something…'}
                  rows={3}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500 resize-none"
                />
              )}

              {/* Link URL */}
              {type === 'LINK' && (
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="URL (https://…)"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2.5 text-zinc-200 text-sm placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
                />
              )}

              {/* Image picker */}
              {type === 'IMAGE' && (
                <FilePicker
                  accept="image/*"
                  label="Click to choose an image"
                  uploading={imageUploading}
                  uploadedFileName={imageUploadedName}
                  uploaded={!!imageUrl}
                  onChange={(file) =>
                    uploadFile(file, setImageUrl, setImageUploading, setImageUploadedName)
                  }
                />
              )}

              {/* Attachment picker for NOTES */}
              {isNotes && (
                <FilePicker
                  accept=".pdf,.doc,.docx,.ppt,.pptx,image/*"
                  label="Attach file (PDF, slides, images…)"
                  uploading={fileUploading}
                  uploadedFileName={fileUploadedName}
                  uploaded={!!fileUrl}
                  onChange={(file) =>
                    uploadFile(file, setFileUrl, setFileUploading, setFileUploadedName)
                  }
                />
              )}
            </>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-zinc-700 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                anyUploading ||
                (isGeneralFeed ? !postBody.trim() : !title.trim())
              }
              className="flex-1 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 text-sm font-semibold transition-colors"
            >
              {anyUploading ? 'Uploading…' : submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function UploadButton({
  accept,
  label,
  icon,
  uploading,
  uploaded,
  uploadedName,
  onChange,
}: {
  accept: string
  label: string
  icon: string
  uploading: boolean
  uploaded: boolean
  uploadedName: string
  onChange: (file: File) => void
}) {
  return (
    <label className="flex-1 cursor-pointer">
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
        }}
      />
      <div
        className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
          uploaded
            ? 'border-emerald-600 bg-emerald-500/10 text-emerald-400'
            : uploading
            ? 'border-zinc-600 bg-zinc-800 text-zinc-400'
            : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-zinc-200'
        }`}
      >
        <span>{uploading ? '⏳' : uploaded ? '✅' : icon}</span>
        <span className="truncate max-w-[120px]">
          {uploading ? 'Uploading…' : uploaded ? uploadedName : label}
        </span>
      </div>
    </label>
  )
}

function FilePicker({
  accept,
  label,
  uploading,
  uploadedFileName,
  uploaded,
  onChange,
}: {
  accept: string
  label: string
  uploading: boolean
  uploadedFileName: string
  uploaded: boolean
  onChange: (file: File) => void
}) {
  return (
    <label className="block w-full cursor-pointer">
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
        }}
      />
      <div
        className={`flex items-center gap-3 border border-dashed rounded-lg px-4 py-3 transition-colors ${
          uploaded
            ? 'border-emerald-600 bg-emerald-500/5'
            : 'border-zinc-700 bg-zinc-800 hover:border-emerald-600'
        }`}
      >
        <span className="text-lg flex-shrink-0">
          {uploading ? '⏳' : uploaded ? '✅' : '📎'}
        </span>
        <span className="text-sm truncate min-w-0">
          {uploading ? (
            <span className="text-zinc-400">Uploading…</span>
          ) : uploaded ? (
            <span className="text-emerald-400">{uploadedFileName}</span>
          ) : (
            <span className="text-zinc-500">{label}</span>
          )}
        </span>
      </div>
    </label>
  )
}
