import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { userDb, lineLinkDb } from '@/lib/kv';
import { sessionOptions } from '@/lib/session';
import { SessionData } from '@/lib/types';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ authenticated: false });
    }

    const user = await userDb.findById(session.userId);
    if (!user) {
      return NextResponse.json({ authenticated: false });
    }

    // LINE連携情報も取得
    const lineLink = await lineLinkDb.findByUserId(user.userId);

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: user.userId,
        email: user.email,
        username: user.username,
      },
      lineLink: lineLink
        ? {
            lineUserId: lineLink.lineUserId,
            linkedAt: lineLink.linkedAt,
          }
        : null,
    });
  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { error: 'セッション確認に失敗しました' },
      { status: 500 }
    );
  }
}
