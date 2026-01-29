# 介護記録アプリ (Sanwa Kiroku App)

## プロジェクト概要

介護施設向けの施設サービス記録システム。モバイルファーストでデスクトップにも対応し、バイタル・排泄・食事・水分量の記録を少ない画面遷移で効率的に入力できる。

**本番URL**: https://sanwa-kiroku-app.web.app

## 技術スタック

| カテゴリ | 技術 |
|---------|------|
| Frontend | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Backend | Firebase (Authentication + Firestore) |
| Hosting | Firebase Hosting |
| PWA | next-pwa |

## ディレクトリ構成

```
src/
├── app/                    # Next.js App Router
│   ├── (main)/             # 認証必須ページ
│   │   ├── page.tsx        # ダッシュボード
│   │   ├── records/        # 記録入力
│   │   ├── history/        # 記録履歴
│   │   ├── residents/      # 利用者管理
│   │   └── settings/       # 設定
│   └── login/              # ログインページ
├── components/             # UIコンポーネント
│   ├── auth/               # 認証関連
│   ├── demo/               # デモモード用
│   ├── records/            # 記録入力コンポーネント
│   └── ui/                 # 共通UI
├── contexts/               # React Context
├── lib/                    # ユーティリティ
│   ├── auth.ts             # 認証ロジック
│   ├── firebase.ts         # Firebase初期化
│   ├── firestore.ts        # Firestoreアクセス
│   ├── seed.ts             # Seedデータ投入
│   └── env.ts              # 環境判定
└── types/                  # 型定義
```

## データモデル

詳細は `docs/data-model.md` を参照。

### 主要コレクション
- `residents` / `demo_residents`: 利用者マスタ
- `records/{residentId}/daily/{date}`: 日別記録
- `users` / `demo_users`: ユーザー（職員）

### デモモード
環境変数 `NEXT_PUBLIC_APP_MODE=demo` で有効化。`demo_` プレフィックス付きコレクションを使用。

## 画面遷移

```
/login    → ログイン（デモ: ゲストログイン）
/         → ダッシュボード（利用者一覧）
/records  → 記録入力（利用者選択）
/records/[id] → 個別利用者の記録（タブ切替: バイタル/排泄/食事/水分）
/history  → 記録履歴（カテゴリ別フィルタ可能）
/residents → 利用者管理
/settings → 設定
```

## UI設計方針

- **モバイルファースト**: スマートフォン操作を最優先
- **タブ切替式**: 画面遷移を最小化
- **折りたたみ式カード**: 「＋追加」で入力フォーム展開
- **ワンタップ入力**: よく使う値はボタン選択式
- **即座保存**: 入力と同時にFirestoreへ保存
- **検索機能**: ひらがな入力でインクリメンタル検索

## カテゴリカラー

| カテゴリ | 背景色 | テキスト色 |
|---------|--------|-----------|
| バイタル | #fce7e8 | #c97476 |
| 排泄 | #fef6e6 | #c9a44a |
| 食事 | #e6f7ed | #4da672 |
| 水分 | #e6f5fb | #4a9ebe |

## 開発コマンド

```bash
npm run dev      # 開発サーバー（port 3003）
npm run build    # ビルド
npm run lint     # ESLint
```

## デプロイ

mainブランチへのpushでGitHub Actionsが自動デプロイ（Firebase Hosting）。

## 環境分離

- GitHub CLI: `.gh/` ディレクトリで分離
- Firebase: `FIREBASE_PROJECT=sanwa-kiroku-app`
- 詳細は `.envrc` を参照

## ADR

設計判断は `docs/adr/` に記録。

## 注意事項

- PWA関連ファイル（`public/sw.js`, `public/fallback-*.js`）はビルド時に自動生成される
- デモモードと本番モードでFirestoreコレクションが異なる
