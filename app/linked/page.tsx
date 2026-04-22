'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SessionResponse {
  authenticated: boolean;
  user?: { userId: string; username: string; email: string };
  lineLink?: { lineUserId: string; linkedAt: string } | null;
}

export default function LinkedPage() {
  const router = useRouter();
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">読み込み中...</p>
      </div>
    );
  }

  if (!session?.authenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-gray-600">ログインしていません。</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            ログイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-green-50 to-white px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-green-100 rounded-full mb-4">
            {session.lineLink ? (
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {session.lineLink ? 'アカウント連携済み' : 'アカウント連携待ち'}
          </h1>
          <p className="text-gray-600 text-sm">
            {session.lineLink
              ? 'LINEアカウントとの連携が完了しています。'
              : 'LINEのトーク画面で「連携」と送信すると連携を開始できます。'}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">アカウント情報</h2>
          <dl className="space-y-2">
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">ユーザー名</dt>
              <dd className="font-medium text-gray-900">{session.user?.username}</dd>
            </div>
            <div className="flex justify-between text-sm">
              <dt className="text-gray-500">サービスユーザーID</dt>
              <dd className="font-mono text-xs text-gray-900 truncate ml-4">{session.user?.userId}</dd>
            </div>
            {session.lineLink && (
              <>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">LINE ユーザーID</dt>
                  <dd className="font-mono text-xs text-gray-900 truncate ml-4">{session.lineLink.lineUserId}</dd>
                </div>
                <div className="flex justify-between text-sm">
                  <dt className="text-gray-500">連携日時</dt>
                  <dd className="text-gray-900 text-xs">
                    {new Date(session.lineLink.linkedAt).toLocaleString('ja-JP')}
                  </dd>
                </div>
              </>
            )}
          </dl>
        </div>

        <button
          onClick={() => router.push('/')}
          className="w-full bg-white hover:bg-gray-50 text-gray-600 font-semibold py-3 px-6 rounded-lg border border-gray-300 transition-colors"
        >
          トップへ戻る
        </button>
      </div>
    </div>
  );
}
