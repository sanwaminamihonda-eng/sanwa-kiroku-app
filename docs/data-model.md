# データモデル設計

## 概要

Firestore のコレクション設計。デモモードでは `demo_` プレフィックス付きコレクションを使用。

## コレクション構成

```
firestore/
├── residents/              # 利用者マスタ
├── records/                # 記録データ（サブコレクション形式）
│   └── {residentId}/
│       └── daily/
│           └── {date}/     # 日別記録
└── users/                  # ユーザー（職員）

# デモモード時
├── demo_residents/
├── demo_records/
└── demo_users/
```

## スキーマ定義

### Resident（利用者）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | ドキュメントID |
| name | string | 氏名 |
| nameKana | string | フリガナ |
| birthDate | Timestamp | 生年月日 |
| gender | 'male' \| 'female' | 性別 |
| roomNumber | string | 居室番号 |
| careLevel | number | 要介護度（1-5）|
| notes | string | 備考 |
| isActive | boolean | 有効フラグ |
| createdAt | Timestamp | 作成日時 |
| updatedAt | Timestamp | 更新日時 |

### DailyRecord（日別記録）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | ドキュメントID |
| residentId | string | 利用者ID |
| date | string | 日付（YYYY-MM-DD）|
| vitals | Vital[] | バイタル記録 |
| excretions | Excretion[] | 排泄記録 |
| meals | Meal[] | 食事記録 |
| hydrations | Hydration[] | 水分記録 |
| createdAt | Timestamp | 作成日時 |
| updatedAt | Timestamp | 更新日時 |

### Vital（バイタル）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | UUID |
| time | string | 時刻（HH:mm）|
| temperature | number | 体温（℃）|
| bloodPressureHigh | number | 血圧（上）|
| bloodPressureLow | number | 血圧（下）|
| pulse | number | 脈拍 |
| spO2 | number | SpO2（%）|
| note | string | 備考 |
| recordedBy | string | 記録者ID |
| recordedAt | Timestamp | 記録日時 |

### Excretion（排泄）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | UUID |
| time | string | 時刻（HH:mm）|
| type | 'urine' \| 'feces' \| 'both' | 種類 |
| urineAmount | 'small' \| 'medium' \| 'large' | 尿量 |
| fecesAmount | 'small' \| 'medium' \| 'large' | 便量 |
| fecesCondition | 'hard' \| 'normal' \| 'soft' \| 'watery' | 便の状態 |
| hasIncontinence | boolean | 失禁有無 |
| note | string | 備考 |
| recordedBy | string | 記録者ID |
| recordedAt | Timestamp | 記録日時 |

### Meal（食事）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | UUID |
| mealType | 'breakfast' \| 'lunch' \| 'dinner' \| 'snack' | 食事種別 |
| mainDishAmount | number | 主食摂取量（0-100%）|
| sideDishAmount | number | 副菜摂取量（0-100%）|
| soupAmount | number | 汁物摂取量（0-100%）|
| note | string | 備考 |
| recordedBy | string | 記録者ID |
| recordedAt | Timestamp | 記録日時 |

### Hydration（水分）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | UUID |
| time | string | 時刻（HH:mm）|
| amount | number | 水分量（ml）|
| drinkType | string | 飲み物種類 |
| note | string | 備考 |
| recordedBy | string | 記録者ID |
| recordedAt | Timestamp | 記録日時 |

### User（ユーザー/職員）

| フィールド | 型 | 説明 |
|-----------|-----|------|
| id | string | Firebase Auth UID |
| email | string | メールアドレス |
| name | string | 氏名 |
| role | 'admin' \| 'staff' | 権限 |
| isActive | boolean | 有効フラグ |
| createdAt | Timestamp | 作成日時 |

## インデックス

```
# 日別記録の取得用
records/{residentId}/daily - date DESC

# 利用者一覧（有効のみ）
residents - isActive ASC, name ASC
```

## Seedデータ

`src/lib/seed-data.ts` に定義。10名の利用者と各3日分の記録を生成。
