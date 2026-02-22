export type PostType = 'TEXT' | 'IMAGE' | 'LINK' | 'QUESTION'
export type ModuleSection = 'NOTES' | 'QUESTIONS'

export interface Post {
  id: string
  title: string
  body: string | null
  type: PostType
  imageUrl: string | null
  linkUrl: string | null
  fileUrl: string | null
  isAnonymous: boolean
  isPinned: boolean
  noteTag: string | null
  moduleCode: string | null
  moduleYear: number | null
  section: ModuleSection | null
  createdAt: string
  authorId: string
  author: { name: string; year: number; avatarUrl: string | null }
  commentCount: number
  voteScore: number
  userVote: 1 | -1 | null
  isBookmarked: boolean
}

export interface Comment {
  id: string
  body: string
  isDeleted: boolean
  createdAt: string
  authorId: string
  author: { name: string; year: number; avatarUrl: string | null }
}
