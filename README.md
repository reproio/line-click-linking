# LINE ID連携デモアプリケーション

LINE PlatformのLINEログインを使ったID連携フローを検証するためのデモアプリケーションです。

## 機能

- ✅ アカウント作成・ログイン機能
- ✅ LINE Login連携フロー
- ✅ ユーザーIDとLINEユーザーIDの紐付け
- ✅ 連携完了画面でのデバッグ情報表示

## 技術スタック

- **フロントエンド**: Next.js 16 (App Router)
- **認証**: iron-session
- **データベース**: Upstash Redis (ローカル開発ではメモリストア)
- **デプロイ**: Vercel

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd line-id-link-demo
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. LINE Platformの設定

#### 3.1 LINE Developersコンソールでチャネル作成

1. [LINE Developers Console](https://developers.line.biz/console/) にアクセス
2. プロバイダーを作成（既存のものを使用してもOK）
3. **LINE Login**チャネルを作成
4. チャネル基本設定から以下の情報を取得：
   - **Channel ID**
   - **Channel Secret**

#### 3.2 コールバックURLの設定

LINEログインチャネルの設定で、以下のコールバックURLを追加：

**ローカル開発:**
```
http://localhost:3000/api/line/callback
```

**本番環境（Vercel）:**
```
https://your-domain.vercel.app/api/line/callback
```

#### 3.3 スコープ設定

以下のスコープを有効化：
- `profile`
- `openid`

### 4. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定：

```env
# LINE Login
LINE_CHANNEL_ID=your_channel_id_here
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CALLBACK_URL=http://localhost:3000/api/line/callback

# Session Secret（32文字以上のランダムな文字列）
SESSION_SECRET=your_random_secret_key_at_least_32_characters_long
```

### 5. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 にアクセスしてください。

## トークルームからの起動設定（オプション）

トークルームからID連携を開始したい場合は、Messaging APIチャネルも設定してください。

### 1. Messaging APIチャネル作成

1. LINE Developersコンソールで同じプロバイダーに**Messaging API**チャネルを作成
2. Channel Access Tokenを取得

### 2. リッチメニュー設定

リッチメニューにID連携開始ページへのリンクを設定：

```
https://your-domain.vercel.app/
```

## Vercelへのデプロイ

### 1. Upstash Redisの作成

1. [Vercel Marketplace](https://vercel.com/marketplace?category=storage&search=redis) から **Upstash Redis** インテグレーションを追加
2. プロジェクトにリンクすると `UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN` が自動設定されます

### 2. 環境変数の設定

Vercelプロジェクトの設定で以下の環境変数を設定：

```
LINE_CHANNEL_ID=your_channel_id_here
LINE_CHANNEL_SECRET=your_channel_secret_here
LINE_CALLBACK_URL=https://your-domain.vercel.app/api/line/callback
SESSION_SECRET=your_production_secret_key_at_least_32_characters_long
```

※ Upstash Redisの環境変数（`UPSTASH_REDIS_REST_URL`、`UPSTASH_REDIS_REST_TOKEN`）はインテグレーション連携で自動的に設定されます

### 3. デプロイ

```bash
npm run build
vercel --prod
```

または、GitHubリポジトリと連携して自動デプロイを設定してください。

### 4. コールバックURL更新

デプロイ後、LINE Developersコンソールで本番環境のコールバックURLを追加：

```
https://your-domain.vercel.app/api/line/callback
```

## 使い方

### 1. アカウント作成

1. トップページから「アカウント登録」をクリック
2. メールアドレス、パスワード、ユーザー名を入力
3. アカウント作成

### 2. LINE連携

1. トップページの「LINEと連携する」ボタンをクリック
2. LINEログイン画面で認証
3. 連携許諾画面で許可
4. 既にログイン済みの場合は自動的に連携完了
5. 未ログインの場合はログイン画面へ遷移

### 3. 連携完了

連携完了画面で以下のデバッグ情報が表示されます：
- ユーザー名
- サービスユーザーID
- LINE User ID
- 連携日時

## プロジェクト構造

```
line-id-link-demo/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts    # アカウント作成API
│   │   │   ├── login/route.ts       # ログインAPI
│   │   │   ├── logout/route.ts      # ログアウトAPI
│   │   │   └── session/route.ts     # セッション確認API
│   │   └── line/
│   │       ├── auth/route.ts        # LINE認証開始
│   │       ├── callback/route.ts    # LINEコールバック
│   │       └── link/route.ts        # LINE連携実行
│   ├── login/page.tsx               # ログインページ
│   ├── register/page.tsx            # アカウント作成ページ
│   ├── linked/page.tsx              # 連携完了ページ
│   └── page.tsx                     # トップページ
├── lib/
│   ├── types.ts                     # 型定義
│   ├── kv.ts                        # Upstash Redis操作
│   └── session.ts                   # セッション設定
└── README.md
```

## トラブルシューティング

### LINE認証がエラーになる

- `.env.local`の`LINE_CHANNEL_ID`と`LINE_CHANNEL_SECRET`が正しいか確認
- LINE DevelopersコンソールでコールバックURLが正しく設定されているか確認

### セッションが保存されない

- `SESSION_SECRET`が32文字以上の文字列に設定されているか確認
- ブラウザのCookieが有効になっているか確認

### Upstash Redisに接続できない

- ローカル開発ではメモリストアが自動的に使用されます
- 本番環境ではVercel MarketplaceからUpstash Redisインテグレーションを追加してください
- `UPSTASH_REDIS_REST_URL` と `UPSTASH_REDIS_REST_TOKEN` が設定されているか確認

## 参考リンク

- [LINE Login v2.1 API Reference](https://developers.line.biz/en/reference/line-login/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis/overall/getstarted)
- [iron-session Documentation](https://github.com/vvo/iron-session)

## ライセンス

MIT
