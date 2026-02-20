export type PostType = 'TEXT' | 'IMAGE' | 'LINK' | 'QUESTION'
export type ModuleSection = 'NOTES' | 'QUESTIONS' | 'UPLOADED_WORK'

export interface Post {
  id: string
  title: string
  body: string | null
  type: PostType
  imageUrl: string | null
  linkUrl: string | null
  moduleCode: string | null
  moduleYear: number | null
  section: ModuleSection | null
  createdAt: string
  author: { name: string; year: number }
  commentCount: number
  voteScore: number
  userVote: 1 | -1 | null
  isBookmarked: boolean
}

export interface Comment {
  id: string
  body: string
  createdAt: string
  author: { name: string; year: number }
}
