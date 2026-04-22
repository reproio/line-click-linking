// サービスユーザー
export interface User {
  userId: string;
  email: string;
  password: string; // bcryptでハッシュ化
  username: string;
  createdAt: string;
}

// LINE連携情報
export interface LineLink {
  userId: string;    // サービスのユーザーID
  lineUserId: string; // LINE User ID
  linkedAt: string;
}

// セッション情報（Messaging APIフローではlineUserIdは不要）
export interface SessionData {
  userId?: string;
}

// LINE Webhookイベント型
export interface LineMessageEvent {
  type: 'message';
  source: { type: 'user'; userId: string };
  message: { type: 'text'; id: string; text: string };
  replyToken: string;
  timestamp: number;
}

export interface LineAccountLinkEvent {
  type: 'accountLink';
  source: { type: 'user'; userId: string };
  link: { result: 'ok' | 'failed'; nonce: string };
  replyToken: string;
  timestamp: number;
}

export interface LineFollowEvent {
  type: 'follow';
  source: { type: 'user'; userId: string };
  replyToken: string;
  timestamp: number;
}

export type LineEvent = LineMessageEvent | LineAccountLinkEvent | LineFollowEvent | { type: string; source?: { userId?: string } };
