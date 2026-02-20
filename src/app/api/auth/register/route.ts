import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const { name, email, password, year } = await request.json()

    // Validate fields
    if (!name || !email || !password || !year) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    // Only allow @tcd.ie emails
    if (!email.endsWith('@tcd.ie')) {
      return NextResponse.json(
        { error: 'You must use a @tcd.ie email address' },
        { status: 400 }
      )
    }

    // Check year is valid
    if (year < 1 || year > 5) {
      return NextResponse.json(
        { error: 'Year must be between 1 and 5' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        year: parseInt(year),
      },
    })

    return NextResponse.json(
      { message: 'Account created successfully', userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
