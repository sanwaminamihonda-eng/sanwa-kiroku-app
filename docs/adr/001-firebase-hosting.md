# ADR-001: Firebase Hosting によるデプロイ

## ステータス

採用

## コンテキスト

介護記録アプリのホスティング先を決定する必要がある。
現在のアーキテクチャ:
- フロントエンド: Next.js (App Router)
- バックエンド: Firebase (Auth, Firestore)
- PWA対応

## 検討した選択肢

### 1. Firebase Hosting (採用)
- **メリット**
  - Firebase エコシステムとの統合が自然
  - Next.js Web Frameworks サポートによる SSR/ISR 対応
  - 同一プロジェクトでの Auth/Firestore との連携
  - asia-northeast1 リージョンによる低レイテンシ
  - GitHub Actions との統合が容易
- **デメリット**
  - Cloud Functions の cold start（初回アクセス時）

### 2. Vercel
- **メリット**
  - Next.js の開発元による最適化
  - Edge Functions による高速な応答
- **デメリット**
  - Firebase との二重管理
  - 別サービスへの依存追加

### 3. Cloud Run
- **メリット**
  - より柔軟なスケーリング
  - コンテナベースの自由度
- **デメリット**
  - 設定の複雑さ
  - 小規模アプリには過剰

## 決定

**Firebase Hosting (Web Frameworks)** を採用する。

理由:
1. 既存の Firebase インフラとの一貫性
2. 単一プロジェクトでの管理による運用簡素化
3. Next.js SSR のネイティブサポート
4. CI/CD パイプラインの簡潔さ

## 結果

### 構成
```
Firebase Project: sanwa-kiroku-app
├── Hosting (Next.js SSR)
├── Auth (認証)
├── Firestore (データベース)
└── Cloud Functions (SSR バックエンド - 自動生成)
```

### デプロイフロー
```
main ブランチへの push
    ↓
GitHub Actions (CI)
    ↓ lint, test 通過
Firebase Hosting Deploy
    ↓
本番環境更新
```

### URL
- 本番: https://sanwa-kiroku-app.web.app
- PR プレビュー: 自動生成される一時 URL

## 関連
- firebase.json: Hosting 設定
- .github/workflows/deploy.yml: デプロイワークフロー
