# 介護記録アプリ (Sanwa Kiroku App)

介護施設向けの施設サービス記録システム。モバイルファーストでデスクトップにも対応し、バイタル・排泄・食事・水分量の記録を少ない画面遷移で効率的に入力できます。

## 主な機能

- **バイタル記録**: 体温、血圧、脈拍、SpO2をワンタップで入力
- **排泄記録**: 排尿・排便の種類、量、状態を簡単に記録
- **食事記録**: 朝昼夕の主食・副菜・汁物の摂取量を選択式で入力
- **水分記録**: 飲水量と種類を記録、1日の合計を自動計算
- **利用者管理**: 利用者情報のCRUD操作
- **記録履歴**: 日別の記録一覧表示

## 技術スタック

- **Frontend**: Next.js 16 (App Router) + TypeScript + Tailwind CSS
- **Backend**: Firebase (Authentication + Firestore)
- **Hosting**: Firebase Hosting または Vercel

## デモモード

本番環境とは別にデモモードを用意しています。

- ゲストログイン（認証不要でアクセス可能）
- Seedデータ投入（サンプル利用者30名 + 各7日分の記録）
- リセット機能（データを初期状態に戻す）

デモモードは環境変数 `NEXT_PUBLIC_APP_MODE=demo` で有効化されます。

**デモURL**: https://sanwa-kiroku-app.web.app

## セットアップ

### 前提条件

- Node.js 20以上
- npm
- Firebase プロジェクト

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/sanwaminamihonda/sanwa-kiroku-app.git
cd sanwa-kiroku-app

# 依存関係をインストール
npm install

# 環境変数を設定
cp .env.example .env.local
# .env.local を編集してFirebase設定を追加
```

### 環境変数

`.env.local` に以下を設定:

```
NEXT_PUBLIC_APP_MODE=demo  # demo または production
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 開発サーバー起動

```bash
npm run dev
```

http://localhost:3000 でアクセス可能

### ビルド

```bash
npm run build
npm run start
```

## プロジェクト構成

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

詳細は [docs/data-model.md](docs/data-model.md) を参照

### コレクション

- `residents` / `demo_residents`: 利用者マスタ
- `records/{residentId}/daily/{date}`: 日別記録
- `users` / `demo_users`: ユーザー（職員）

## 画面遷移

```
/login          → ログイン画面（デモ: ゲストログインボタン）
/               → ダッシュボード（利用者一覧 + クイックアクション）
/records        → 記録入力（利用者選択）
/records/[id]   → 個別利用者の記録入力（タブ切替: バイタル/排泄/食事/水分）
/history        → 記録履歴一覧
/residents      → 利用者管理（CRUD）
/settings       → 設定
```

## UI設計の特徴

- **モバイルファースト**: スマートフォンでの操作を最優先に設計
- **タブ切替式**: 画面遷移を最小化、1画面で複数カテゴリの記録
- **折りたたみ式カード**: 「＋追加」ボタンで入力フォームを展開、追加アクションが明確
- **ワンタップ入力**: よく使う値はボタン選択式
- **即座保存**: 入力と同時にFirestoreへ保存
- **検索機能**: ひらがな入力で利用者をインクリメンタル検索

## ライセンス

MIT
