import crypto from 'crypto';

const LINE_API = 'https://api.line.me';

/**
 * 連携トークンを発行する
 * @see https://developers.line.biz/ja/reference/messaging-api/#issue-link-token
 */
export async function issueLinkToken(userId: string): Promise<string> {
  const res = await fetch(`${LINE_API}/v2/bot/user/${userId}/linkToken`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`issueLinkToken failed: ${res.status} ${body}`);
  }
  const data = await res.json();
  return data.linkToken as string;
}

/**
 * ユーザーにPushメッセージを送信する
 * @see https://developers.line.biz/ja/reference/messaging-api/#send-push-message
 */
export async function pushMessage(userId: string, messages: object[]): Promise<void> {
  const res = await fetch(`${LINE_API}/v2/bot/message/push`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({ to: userId, messages }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`pushMessage failed: ${res.status} ${body}`);
  }
}

/**
 * LINEのWebhook署名を検証する
 * X-Line-Signatureヘッダーの値をHMAC-SHA256で検証
 * @see https://developers.line.biz/ja/docs/messaging-api/receiving-messages/#verifying-signatures
 */
export function verifySignature(body: string, signature: string): boolean {
  const secret = process.env.LINE_CHANNEL_SECRET;
  if (!secret) {
    console.error('LINE_CHANNEL_SECRET is not set');
    return false;
  }
  const hash = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('base64');
  // タイミング攻撃を防ぐため定数時間比較を使用
  const hashBuffer = Buffer.from(hash);
  const signatureBuffer = Buffer.from(signature);
  if (hashBuffer.length !== signatureBuffer.length) return false;
  return crypto.timingSafeEqual(hashBuffer, signatureBuffer);
}
