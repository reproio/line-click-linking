// サービスユーザー
export interface User {
  userId: string;
  email: string;
  password: string; // bcryptでハッシュ化
  username: string;
  createdAt: string;
}

// セッション情報
export interface SessionData {
  userId?: string;
}
