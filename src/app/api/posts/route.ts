import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { PostType, ModuleSection } from '@prisma/client'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  const { searchParams } = new URL(req.url)
  const sort = searchParams.get('sort') ?? 'newest'
  const moduleCode = searchParams.get('moduleCode')
  const moduleYear = searchParams.get('moduleYear')
  const section = searchParams.get('section')

  const where: any = {}
  if (moduleCode && moduleYear && section) {
    where.moduleCode = moduleCode
    where.moduleYear = parseInt(moduleYear)
    where.section = section as ModuleSection
  } else {
    where.moduleCode = null
  }

  const posts = await prisma.post.findMany({
    where,
    include: {
      author: { select: { name: true, year: true } },
      _count: { select: { comments: true } },
      votes: true,
      bookmarks: { where: { userId } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const shaped = posts.map((post) => {
    const voteScore = post.votes.reduce((sum, v) => sum + v.value, 0)
    const userVote = post.votes.find((v) => v.userId === userId)?.value ?? null
    const isBookmarked = post.bookmarks.length > 0
    return {
      id: post.id,
      title: post.title,
      body: post.body,
      type: post.type,
      imageUrl: post.imageUrl,
      linkUrl: post.linkUrl,
      fileUrl: post.fileUrl,
      isAnonymous: post.isAnonymous,
      isPinned: post.isPinned,
      noteTag: post.noteTag,
      moduleCode: post.moduleCode,
      moduleYear: post.moduleYear,
      section: post.section,
      createdAt: post.createdAt,
      authorId: post.authorId,
      author: post.author,
      commentCount: post._count.comments,
      voteScore,
      userVote,
      isBookmarked,
    }
  })

  if (sort === 'popular') {
    shaped.sort((a, b) => b.voteScore - a.voteScore)
  }

  // Pinned posts always float to top regardless of sort
  shaped.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))

  return NextResponse.json(shaped)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = user.id

  // Ensure Prisma User exists before creating a post with an authorId FK
  const { ensureUser } = await import('@/lib/supabase/ensure-user')
  await ensureUser(user)

  const body = await req.json()
  const { title, postBody, type, imageUrl, linkUrl, fileUrl, isAnonymous, noteTag, moduleCode, moduleYear, section } = body

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  const post = await prisma.post.create({
    data: {
      title: title.trim(),
      body: postBody?.trim() ?? null,
      type: (type as PostType) ?? 'TEXT',
      imageUrl: imageUrl?.trim() ?? null,
      linkUrl: linkUrl?.trim() ?? null,
      fileUrl: fileUrl?.trim() ?? null,
      isAnonymous: isAnonymous === true,
      noteTag: noteTag?.trim() ?? null,
      moduleCode: moduleCode ?? null,
      moduleYear: moduleYear ? parseInt(moduleYear) : null,
      section: section ? (section as ModuleSection) : null,
      authorId: userId,
    },
    include: {
      author: { select: { name: true, year: true } },
    },
  })

  return NextResponse.json({
    id: post.id,
    title: post.title,
    body: post.body,
    type: post.type,
    imageUrl: post.imageUrl,
    linkUrl: post.linkUrl,
    fileUrl: post.fileUrl,
    isAnonymous: post.isAnonymous,
    isPinned: post.isPinned,
    noteTag: post.noteTag,
    moduleCode: post.moduleCode,
    moduleYear: post.moduleYear,
    section: post.section,
    createdAt: post.createdAt,
    authorId: post.authorId,
    author: post.author,
    commentCount: 0,
    voteScore: 0,
    userVote: null,
    isBookmarked: false,
  }, { status: 201 })
}
