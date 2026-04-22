'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface SessionResponse {
  authenticated: boolean;
  user?: { userId: string; username: string; email: string };
  lineLink?: { lineUserId: string; linkedAt: string } | null;
}

function LinkContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const linkToken = searchParams.get('linkToken');

  const [session, setSession] = useState<SessionResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((r) => r.json())
      .then((data: SessionResponse) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => {
        setSession({ authenticated: false });
        setLoading(false);
      });
  }, []);

  if (!linkToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-red-600 font-medium">無効なリンクです。</p>
          <p className="text-gray-500 mt-2 text-sm">LINEのトーク画面から再度お試しください。</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  // すでに連携済み
  if (session?.authenticated && session.lineLink) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">連携済みです</h1>
          <p className="text-gray-600">このアカウントはすでにLINEと連携されています。</p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            トップへ戻る
          </button>
        </div>
      </div>
    );
  }

  // 未ログイン
  if (!session?.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">アカウント連携</h1>
            <p className="text-gray-600 text-sm">
              LINEアカウントとサービスアカウントを連携します。<br />
              まずサービスアカウントにログインしてください。
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push(`/login?from=link&linkToken=${encodeURIComponent(linkToken)}`)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              ログイン
            </button>
            <button
              onClick={() => router.push(`/register?from=link&linkToken=${encodeURIComponent(linkToken)}`)}
              className="w-full bg-white hover:bg-gray-50 text-green-600 font-semibold py-3 px-6 rounded-lg border-2 border-green-600 transition-colors"
            >
              新規登録
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ログイン済み・未連携 → 連携ボタン表示
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">アカウント連携</h1>
          <p className="text-gray-600 text-sm">
            ようこそ、<strong>{session?.user?.username}</strong> さん。<br />
            LINEアカウントとサービスアカウントを連携します。
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm text-gray-600">
          <p className="font-medium text-gray-900 mb-2">連携するとできること</p>
          <ul className="space-y-1 list-disc list-inside">
            <li>LINEでサービスからのお知らせを受け取る</li>
            <li>LINEを通じてサービスを操作できる</li>
          </ul>
        </div>

        <button
          onClick={() => { window.location.href = `/api/line/start-link?linkToken=${encodeURIComponent(linkToken)}`; }}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
        >
          連携する
        </button>

        <p className="text-xs text-gray-400 text-center mt-4">
          このリンクの有効期限は10分です
        </p>
      </div>
    </div>
  );
}

export default function LinkPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    }>
      <LinkContent />
    </Suspense>
  );
}
