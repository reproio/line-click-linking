import { verifySignature, issueLinkToken, pushMessage } from '@/lib/line';
import { nonceDb, lineLinkDb } from '@/lib/kv';
import { LineEvent, LineMessageEvent, LineAccountLinkEvent, LineFollowEvent } from '@/lib/types';

export async function POST(req: Request) {
  // rawBodyを取得（署名検証に必要）
  const body = await req.text();
  const signature = req.headers.get('x-line-signature') ?? '';

  if (!verifySignature(body, signature)) {
    return new Response('Unauthorized', { status: 401 });
  }

  let events: LineEvent[];
  try {
    const data = JSON.parse(body) as { events: LineEvent[] };
    events = data.events;
  } catch {
    return new Response('Bad Request', { status: 400 });
  }

  // イベントを並列処理（エラーが出ても200を返す）
  await Promise.allSettled(events.map(handleEvent));

  return new Response('OK', { status: 200 });
}

async function handleEvent(event: LineEvent): Promise<void> {
  if (!('source' in event) || event.source?.userId == null) return;
  const lineUserId = event.source.userId;

  switch (event.type) {
    case 'follow':
      await handleFollow(lineUserId, event as LineFollowEvent);
      break;
    case 'message':
      await handleMessage(lineUserId, event as LineMessageEvent);
      break;
    case 'accountLink':
      await handleAccountLink(lineUserId, event as LineAccountLinkEvent);
      break;
  }
}

async function handleFollow(lineUserId: string, _event: LineFollowEvent): Promise<void> {
  await pushMessage(lineUserId, [
    {
      type: 'text',
      text: 'フォローありがとうございます！\n「連携」と送信するとサービスアカウントとのアカウント連携を開始できます。',
    },
  ]);
}

async function handleMessage(lineUserId: string, event: LineMessageEvent): Promise<void> {
  if (event.message.type !== 'text') return;
  if (event.message.text.trim() !== '連携') return;

  // すでに連携済みか確認
  const existing = await lineLinkDb.findByLineUserId(lineUserId);
  if (existing) {
    await pushMessage(lineUserId, [
      { type: 'text', text: 'すでにサービスアカウントと連携済みです。' },
    ]);
    return;
  }

  // 連携トークンを発行して連携URLを送信
  let linkToken: string;
  try {
    linkToken = await issueLinkToken(lineUserId);
  } catch (err) {
    console.error('issueLinkToken error:', err);
    await pushMessage(lineUserId, [
      { type: 'text', text: '連携URLの発行に失敗しました。しばらく後に再度お試しください。' },
    ]);
    return;
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? '';
  const linkUrl = `${baseUrl}/link?linkToken=${encodeURIComponent(linkToken)}`;

  await pushMessage(lineUserId, [
    {
      type: 'template',
      altText: 'アカウント連携',
      template: {
        type: 'buttons',
        text: 'アカウント連携を開始します。下のボタンをタップしてください。\n（リンクの有効期限は10分です）',
        actions: [
          {
            type: 'uri',
            label: 'アカウント連携を開始',
            uri: linkUrl,
          },
        ],
      },
    },
  ]);
}

async function handleAccountLink(lineUserId: string, event: LineAccountLinkEvent): Promise<void> {
  if (event.link.result !== 'ok') {
    await pushMessage(lineUserId, [
      { type: 'text', text: '❌ アカウント連携に失敗しました。もう一度「連携」と送信してお試しください。' },
    ]);
    return;
  }

  // nonceからserviceUserIdを取得（1回限り）
  const serviceUserId = await nonceDb.findAndDelete(event.link.nonce);
  if (!serviceUserId) {
    await pushMessage(lineUserId, [
      { type: 'text', text: '❌ 連携セッションが無効または期限切れです。もう一度「連携」と送信してお試しください。' },
    ]);
    return;
  }

  // LINE連携を保存
  await lineLinkDb.create({
    userId: serviceUserId,
    lineUserId,
    linkedAt: new Date().toISOString(),
  });

  await pushMessage(lineUserId, [
    {
      type: 'text',
      text: '✅ アカウント連携が完了しました！\nこれからはLINEを通じてサービスのお知らせを受け取れます。',
    },
  ]);
}
