import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db/prisma';
import { UserRole } from '@/generated/prisma';
import { sendWelcomeEmail } from '@/lib/services/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        hashedPassword,
        role: role || UserRole.CUSTOMER,
      },
    });

    // Create associated profile based on role
    if (user.role === UserRole.CREATOR) {
      // Generate unique username from email
      const username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      let finalUsername = username;
      let counter = 1;

      // Ensure username is unique
      while (await prisma.creator.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${username}${counter}`;
        counter++;
      }

      await prisma.creator.create({
        data: {
          userId: user.id,
          username: finalUsername,
        },
      });
    } else if (user.role === UserRole.CUSTOMER) {
      await prisma.customer.create({
        data: {
          userId: user.id,
        },
      });
    }

    // Send welcome email
    try {
      await sendWelcomeEmail(user);
      console.log(`Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error(`Failed to send welcome email to ${user.email}:`, error);
      // Don't fail the registration if email fails
    }

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}