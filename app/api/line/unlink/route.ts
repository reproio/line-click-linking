import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { lineLinkDb } from '@/lib/kv';
import { sessionOptions } from '@/lib/session';
import { SessionData } from '@/lib/types';
import { cookies } from 'next/headers';

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

    if (!session.userId) {
      return NextResponse.json({ error: '未認証です' }, { status: 401 });
    }

    const lineLink = await lineLinkDb.findByUserId(session.userId);
    if (!lineLink) {
      return NextResponse.json({ error: 'LINE連携が存在しません' }, { status: 404 });
    }

    await lineLinkDb.delete(session.userId, lineLink.lineUserId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unlink error:', error);
    return NextResponse.json({ error: '連携解除に失敗しました' }, { status: 500 });
  }
}
