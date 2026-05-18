# 技術選定 詳細比較 — 確定

> ステータス: **確定**（DD-023〜DD-031 として decisions.md に転記済み）
> 関連: DD-001（コードベース完全分離）、DD-003（業務系 CRUD・Web メイン）、DD-007（NestJS）

## 比較の前提

- 業務系 CRUD（フォーム・一覧・検索が一級市民）
- Web はデスクトップメイン（データ密度高め）
- Android はモバイル補助（フォーム入力・参照中心、現場利用シーンも想定）
- Vue エコシステムを基本とする（Web/Android 共通の言語・ツーリング知識を活用）
- Backend は NestJS + Prisma + zod 確定 (DD-007)

## Web UI ライブラリ比較

| 候補               | データテーブル | フォーム / 入力部品 | デザイン体系         | 業務系実績 | TypeScript | エコシステム                      | 評価 |
| ------------------ | -------------- | ------------------- | -------------------- | ---------- | ---------- | --------------------------------- | ---- |
| **Vuetify 3**      | ◎ (v-data-table) | ◎ (高機能・豊富)    | Material Design      | ◎          | ◎          | Vue 専用・公式ドキュメント充実   | **採用** |
| PrimeVue           | ◎ (DataTable)  | ◎                   | 複数テーマ選択可     | ◎          | ◎          | Vue 専用・有償テンプレあり        | 次点 |
| Quasar             | ◎              | ◎                   | Material 風          | ◯          | ◎          | Vue 専用・全部入り（Web/Mobile 兼） | 不採用 |
| Element Plus       | ◯              | ◯                   | カスタム             | △ (中国系) | ◯          | Vue 専用・中国系業務系に強い      | 不採用 |
| Naive UI           | ◯              | ◯                   | モダン軽快           | △          | ◎          | Vue 専用・新興                    | 不採用 |

### 採用: Vuetify 3

**選定理由**:

- 業務系で最も使われる UI 部品（データテーブル、フォーム、ダイアログ）が公式で揃う
- Material Design は業務系で受け入れられやすい (社内利用向けで UX 議論を減らせる)
- ドキュメント・コミュニティが充実
- TypeScript 完全対応
- Quasar は機能過剰（Mobile も兼ねるが Approach C では不要）、PrimeVue は次点

**不採用理由（主要候補）**:

- **PrimeVue**: 機能は十分だが、有償テンプレ前提の章立てが多くドキュメントが分散気味
- **Quasar**: 1 つで Web + Mobile を兼ねるが、Approach C のチーム完全分離前提では「Web チームが Quasar を学ぶ必要性」が薄い

## Android プラットフォーム比較

| 候補                              | Vue 知識活用 | ネイティブ機能 | ストア配布 | 業務系実績 | 学習コスト   | 評価 |
| --------------------------------- | ------------ | -------------- | ---------- | ---------- | ------------ | ---- |
| **Vue + Ionic 8 + Capacitor**     | ◎            | ◎ (Plugin 豊富) | ◎          | ◎          | 低           | **採用** |
| Quasar の Capacitor モード         | ◎            | ◎              | ◎          | ◯          | 中 (Quasar 縛り) | 不採用 |
| Vue + Capacitor 単独 (Ionic なし) | ◎            | ◎              | ◎          | △          | 中 (UI 自作) | 不採用 |
| React Native                      | ×            | ◎              | ◎          | ◎          | 高           | 不採用 |
| Flutter / Kotlin Compose          | ×            | ◎              | ◎          | ◎          | 非常に高     | 不採用 |

### 採用: Vue + Ionic 8 + Capacitor

**選定理由**:

- Web チームの Vue 知識を活用可能（DD-001 でチーム分離だが、技術スキル基盤は共通化したい）
- Ionic コンポーネント (`ion-list`, `ion-input`, `ion-modal` 等) がモバイル UX に最適化済み
- Capacitor で Camera / Geolocation / Secure Storage / Push 等のネイティブ機能にアクセス可能
- PWA としてもビルド可能（Web 経由の動作確認が容易）
- Play Console 配布フローが確立

**不採用理由（主要候補）**:

- **React Native / Flutter / Kotlin**: Vue 系から外れる。チームスキル前提（Vue 系を選んだ DD-003 の背景）に反する
- **Quasar Capacitor モード**: Quasar 縛りで Web 側との分離が薄れる（Approach C と整合性が弱い）

## ビルドツール

| 候補         | Vue 対応 | Vuetify 対応 | Ionic 対応 | 速度 | 評価 |
| ------------ | -------- | ------------ | ---------- | ---- | ---- |
| **Vite**     | ◎        | ◎            | ◎          | ◎    | **採用** |
| Webpack      | ◎        | ◎            | ◎          | △    | 不採用 |
| Turbopack    | ◎        | ?            | ?          | ◎    | 不採用 |

### 採用: Vite

Vuetify 3 / Ionic 8 ともに Vite が公式推奨。ビルド高速、HMR 体験良好。

## TypeScript 設定

- **`strict: true`**: 全プロジェクトで必須
- **`noUncheckedIndexedAccess: true`**: 配列インデックスを安全に扱う
- **`exactOptionalPropertyTypes: true`**: optional の意味を厳密化
- **共通 tsconfig.base.json**: Approach C 完全分離なので各プロジェクトで個別管理だが、推奨設定を本リポジトリの `docs/templates/tsconfig.base.json` (将来) として置く

## Lint / Format

| ツール                | 用途                       | 評価     |
| --------------------- | -------------------------- | -------- |
| **ESLint**            | コード品質ルール           | 採用     |
| **Prettier**          | フォーマット               | 採用     |
| **typescript-eslint** | TypeScript 用 ESLint ルール | 採用     |
| **eslint-plugin-vue** | Vue SFC 用                 | 採用     |
| **eslint-plugin-import** | import 順制御            | 採用     |
| **eslint-plugin-security** | セキュリティルール       | 採用     |

### ESLint 設定の配布方法

Approach C 完全分離下で、ESLint 設定を共有するか:

- **採用案**: 各チームに**初期設定をコピー配布**する。本リポジトリの `docs/templates/eslint.config.js`（将来配備）を参考。各チームが必要に応じてカスタマイズする
- **不採用案**: `@org/eslint-config` を npm 公開して共有 — チーム独立性を損なうため不採用

## 状態管理（フロントエンド）

| ライブラリ                       | 用途                   | 評価   |
| -------------------------------- | ---------------------- | ------ |
| **Pinia**                        | UI 状態 / 認証情報など | 採用   |
| **TanStack Query for Vue (Vue Query)** | サーバーキャッシュ     | 採用 (DD-009 で既決) |

### 使い分け方針

- **Pinia**: ローカル UI 状態（モーダル開閉、選択中タブ、フォーム下書き、認証ユーザー情報）
- **TanStack Query**: サーバー由来データ（一覧、検索結果、詳細）のキャッシュ・再取得・楽観更新
- Pinia の中で API データを抱え込まない（責務分離）

## ルーティング

- **Web**: Vue Router 4 (history mode)
- **Android (Ionic)**: Vue Router 4 + Ionic ナビゲーション統合 (`IonRouterOutlet`)

## ナビゲーション・タブ構造

- **Web**: トップバー + サイドバー (Vuetify `v-app-bar` + `v-navigation-drawer`)
- **Android**: ボトムタブ + スタックナビゲーション (Ionic `ion-tabs` + `ion-nav`)

## フォームバリデーション

- **共通**: Zod schema をフロントでも実行時バリデーション (DD-009)
- **Web**: Vuetify の `rules` プロパティ + Zod → 統一ラッパー (Composable) で吸収
- **Android**: Ionic 入力 + Zod → 同上

## アイコン

| 候補                   | 用途             | 評価   |
| ---------------------- | ---------------- | ------ |
| **Material Design Icons (MDI)** | Web (Vuetify 公式) | 採用 |
| **Ionicons**           | Android (Ionic 公式) | 採用 |

## 日付・時刻

- **共通**: `date-fns`（軽量・関数ベース）を採用
- moment.js は不採用（メンテナンスモード）
- dayjs も候補だが date-fns のほうが TypeScript フレンドリー

## i18n（多言語対応）

- 業務系で多言語が必要な場合: **vue-i18n v9+**
- 不要なら無効化可能だが、本スペックでは「将来追加可能な設計」を推奨

## Backend 補強ライブラリ

| ライブラリ                | 用途                            |
| ------------------------- | ------------------------------- |
| Prisma (DD-007 既決)      | ORM                             |
| Zod (DD-005 既決)          | スキーマ検証                    |
| @asteasolutions/zod-to-openapi | OpenAPI 生成 (DD-006)       |
| Passport.js               | 認証ストラテジ                  |
| @nestjs/jwt               | JWT 生成・検証                  |
| bcrypt / argon2           | パスワードハッシュ              |
| BullMQ                    | ジョブキュー (B4 バッチ設計向け) |
| Redis                     | キャッシュ・セッション・BullMQ バック |
| pino + nestjs-pino        | 構造化ログ                      |
| Helmet                    | セキュリティヘッダー            |
| class-validator (任意)    | NestJS 標準だが Zod と併用は注意 |

## ファイルアップロード / S3

- **共通**: 直接 S3 presigned URL に upload する方式（Backend 通さない）
- ライブラリ: `@aws-sdk/client-s3` (Backend)、フロントは axios で PUT

## 監視・モニタリング

| ツール                    | 用途                          |
| ------------------------- | ----------------------------- |
| Sentry                    | エラー監視 (フロント・Backend) |
| OpenTelemetry             | 分散トレーシング              |
| CloudWatch / Grafana      | メトリクス・ログ              |

選定は案件規模・予算に応じて調整。

## 技術スタック サマリ

### Web

```
Vue 3 + TypeScript (strict)
├─ Vite (ビルド)
├─ Vuetify 3 (UI)
├─ Vue Router 4
├─ Pinia (UI 状態)
├─ TanStack Query for Vue (サーバー状態)
├─ axios (HTTP)
├─ Zod (バリデーション・型)
├─ orval (API クライアント自動生成)
├─ MSW (開発時モック)
└─ date-fns / vue-i18n / MDI
```

### Android (PWA + Capacitor)

```
Vue 3 + TypeScript (strict)
├─ Vite (ビルド)
├─ Ionic 8 (UI)
├─ Capacitor 6+ (ネイティブブリッジ)
│   ├─ @capacitor/camera
│   ├─ @capacitor/geolocation
│   ├─ @capacitor/preferences (Secure Storage)
│   └─ @capacitor/push-notifications
├─ Vue Router 4 (Ionic 統合)
├─ Pinia / TanStack Query / axios / Zod / orval / MSW
└─ date-fns / vue-i18n / Ionicons
```

### Backend

```
Node.js (LTS) + TypeScript (strict)
├─ NestJS
├─ Prisma (ORM)
├─ Zod + @asteasolutions/zod-to-openapi
├─ Passport.js + @nestjs/jwt
├─ BullMQ + Redis
├─ pino + nestjs-pino
├─ Helmet
└─ DB: PostgreSQL (推奨)
```
