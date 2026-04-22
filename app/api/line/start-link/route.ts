import { NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions } from '@/lib/session';
import { nonceDb } from '@/lib/kv';
import { SessionData } from '@/lib/types';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const linkToken = searchParams.get('linkToken');

  if (!linkToken) {
    return new Response('Missing linkToken', { status: 400 });
  }

  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.userId) {
    // 未ログインの場合はログインページへ（linkTokenを保持）
    return NextResponse.redirect(
      new URL(`/login?from=link&linkToken=${encodeURIComponent(linkToken)}`, req.url)
    );
  }

  // nonceを生成（128ビット以上のランダム値、Base64URL形式）
  const nonce = crypto.randomBytes(32).toString('base64url');

  // KVにnonce→serviceUserIdを保存（TTL: 600秒）
  try {
    await nonceDb.create(nonce, session.userId);
  } catch (err) {
    console.error('nonceDb.create error:', err);
    return new Response('Internal Server Error', { status: 500 });
  }

  // LINEのアカウント連携エンドポイントへリダイレクト
  const lineUrl = `https://access.line.me/dialog/bot/accountLink?linkToken=${encodeURIComponent(linkToken)}&nonce=${encodeURIComponent(nonce)}`;
  return NextResponse.redirect(lineUrl, { status: 307 });
}
