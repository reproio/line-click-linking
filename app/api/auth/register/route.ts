import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { getIronSession } from 'iron-session';
import { userDb } from '@/lib/kv';
import { sessionOptions } from '@/lib/session';
import { User, SessionData } from '@/lib/types';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username } = await request.json();

    // バリデーション
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'メールアドレス、パスワード、ユーザー名は必須です' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上である必要があります' },
        { status: 400 }
      );
    }

    // メールアドレスの重複チェック
    const existingUser = await userDb.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }

    // ユーザー作成
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user: User = {
      userId,
      email,
      password: hashedPassword,
      username,
      createdAt: new Date().toISOString(),
    };

    await userDb.create(user);

    // セッション作成
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);
    session.userId = userId;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'アカウント作成に失敗しました' },
      { status: 500 }
    );
  }
}
