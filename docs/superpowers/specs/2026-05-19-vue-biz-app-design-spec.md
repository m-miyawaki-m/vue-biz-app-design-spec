# Vue 系 Web + Android 業務アプリ 設計スペック集

> 作成日: 2026-05-19
> ステータス: **ユーザレビュー待ち（Backend 関連は前提変更あり、詳細保留）**
> リポジトリ: https://github.com/m-miyawaki-m/vue-biz-app-design-spec

> ⚠ **Backend スタック変更通知（DD-050、2026-05-19 更新）**
>
> 本ドキュメント本文中の Backend 関連記述は当初 **Node.js + NestJS + Prisma + Zod** 前提で書かれているが、
> 実際の Backend は **Java 21 + Spring Boot 3.x + MyBatis + Gradle (Groovy DSL)** に変更された。
> Backend 詳細 DD（OpenAPI 生成方針、MyBatis 規約、Spring Security 設定、Spring Batch、Flyway、JUnit/TestContainers、CI/CD Gradle 化など）は保留中で、後日別セッションで詰める予定。
>
> 以下のセクションは Backend に依存せず**そのまま有効**:
>
> - Section 1（アプローチと前提）— Approach C は不変
> - Section 2（契約レイヤー）— DD-008/009/010/012/013 は不変、DD-006/007 は方向性のみ確定し詳細保留、DD-011 は方式不変・実装変更
> - Section 3（設計書体系）— 全文有効（B1-B8 の章立ては不変）
> - Section 4（実装ステップ）— 全文有効
> - Section 5.1 Web / Android スタック — 不変
> - Section 5.1 Backend スタック — **Java + Spring + MyBatis に読み替え（詳細未確定）**
> - Section 6（開発環境）— Frontend 部分は不変、Backend 部分は Gradle/IntelliJ/JUnit ベースに読み替え
> - Section 7（テスト方法）— Frontend 部分は不変、Backend は JUnit 5 + AssertJ + Mockito + TestContainers + RestAssured 系に読み替え
>
> 詳細な影響範囲は [DD-050](../../discussion/decisions.md) を参照。

## 0. このスペックは何か

Vue 系フロントエンド（Vuetify 3 / Vue + Ionic + Capacitor）で、**Web 版と Android 版を完全分離コードベース**として開発する**業務系（CRUD）アプリ**のための、**設計書体系・実装ステップ・技術選定・開発環境・テスト方法**を体系化した「プレイブック」。

特定の業務領域には依らない。**「企業・受託スタイルでこの構成を採用する場合、何を揃えて何を選び何の順で進めるか」**の指針として用いる。

### スコープ

| 項目             | 内容                                                                             |
| ---------------- | -------------------------------------------------------------------------------- |
| アプリ性質       | 入力・一覧・フォーム中心の業務系 CRUD                                            |
| Web              | デスクトップ業務 UI（メイン）                                                    |
| Android          | モバイル補助 UI（フォーム入力・参照・現場利用）                                 |
| 開発体制         | 企業・受託スタイル（要件定義書〜テスト仕様書を一通り揃える）                    |
| アプローチ       | **Approach C** — Web / Android は完全独立プロジェクト、Backend API のみ共有契約 |
| Backend スタック | TypeScript + NestJS + Prisma + Zod                                              |
| コードの実装     | スコープ外（本スペックは設計プロセスのみ扱う）                                  |

### スコープ外

- 個別業務領域の機能要件
- インフラ詳細（AWS/Azure/GCP のサービス選定）
- 監視・SRE 詳細
- 法務・コンプライアンス対応

---

## 1. アプローチと前提

### 1.1 Approach C：コードベース完全分離

Web 版と Android 版を完全に独立した別プロジェクトで開発し、両者は **Backend API を介してのみ業務データを共有**する。フロント同士の直接依存はない。

```
[Web Frontend] ────┐
                   ├──► [Backend API] ◄──► [Database]
[Android Frontend] ┘
```

選定理由: チームが異なり、共通化のオーバーヘッドより独立して動くメリットが大きい (DD-001)。

### 1.2 「契約」だけを厳密に管理

3 プロジェクトの結合点を以下 6 種の文書に限定する:

1. **業務要件定義書 (S1)** — 業務概要・主要ロール・業務フロー大枠
2. **データ辞書 (S2)** — 業務用語 ↔ Prisma フィールド対応
3. **API 仕様書 (S3)** — OpenAPI YAML (自動生成)
4. **認証/認可仕様書 (S4)**
5. **業務エラーコード一覧 (S5)**
6. **非機能要件書 (S6)**

それ以外（画面、内部設計、UI 部品選定）は各プロジェクトが独立に決める。

### 1.3 真実源 (Source of Truth) の一本化

```
┌─────────────────────────────────────────────────┐
│  Backend                                         │
│  ┌────────────┐    ┌──────────────────────┐     │
│  │ Zod schema │ ──► │ zod-to-openapi で    │     │
│  │ (真実源)   │     │ OpenAPI YAML 生成    │     │
│  └─────┬──────┘    └──────────┬───────────┘     │
│        │                       │                 │
│        ▼                       ▼                 │
│  ┌────────────┐         openapi.yaml             │
│  │ Prisma     │         (GitHub Releases)        │
│  │ schema.    │                                  │
│  └────────────┘                                  │
└────────────────────────────────┬────────────────┘
                                 │
              ┌──────────────────┼──────────────────┐
              ▼                  ▼                  ▼
        [Web orval]      [Android orval]     (Backend がデータ辞書/
        TS 型 + Zod      TS 型 + Zod          エラー一覧を Markdown で
        + MSW mock       + MSW mock           人手管理 → S2/S5)
```

Zod schema を一本の真実源とし、OpenAPI → orval 経由で 3 プロジェクトに型・モック・バリデーションを伝搬する (DD-005, DD-006, DD-009)。

---

## 2. 契約レイヤー詳細

### 2.1 8 つの設計決定（一覧）

| #   | 論点                  | 採用                                                                                        | DD     |
| --- | --------------------- | ------------------------------------------------------------------------------------------- | ------ |
| 1   | OpenAPI 生成方向      | **Zod-first → zod-to-openapi で生成**                                                       | DD-006 |
| 2   | Backend フレームワーク | **NestJS + Prisma + Zod**                                                                   | DD-007 |
| 3   | OpenAPI 配布方法      | **Backend リポジトリで `openapi.yaml` を生成・Git タグ + GitHub Releases に添付**          | DD-008 |
| 4   | orval 生成構成        | **axios + TanStack Query for Vue + Zod runtime validation + MSW mock 生成**                 | DD-009 |
| 5   | エラーレスポンス      | **RFC 7807 (Problem Details) + 業務エラーコード `errorCode: "E-{領域}-{番号}"`**            | DD-010 |
| 6   | 認証                  | **JWT (短命 access + refresh token rotation) + httpOnly Cookie (Web) / Secure Storage (Android)** | DD-011 |
| 7   | モック戦略            | **orval `--mock` (MSW、開発時) + Prism (結合テスト用モックサーバー)**                       | DD-012 |
| 8   | バージョニング        | **URL パス方式 (`/v1/`, `/v2/`) + Semver 管理**                                              | DD-013 |

### 2.2 契約変更ガバナンス

- **非破壊変更**（フィールド追加・新エンドポイント）: Backend がマージしたらフロントは CI で自動追従（`openapi-sync-check` ジョブ）
- **破壊変更**（フィールド削除・型変更）: 必ずバージョン分岐 (`/v1/` → `/v2/`)。Web と Android が別タイミングで追従可能
- API 変更 PR には 3 チームのレビュアー必須
- 旧バージョン (`/v1/`) は次のメジャーリリースから 6 ヶ月維持を推奨（要件により調整）

### 2.3 エラーレスポンス形式

```json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "顧客コードは必須です",
  "instance": "/customers",
  "errorCode": "E-CUSTOMER-001",
  "errors": [{ "field": "customerCode", "message": "必須" }]
}
```

### 2.4 認証フロー

- アクセストークン: **15 分** 程度の短命
- リフレッシュトークン: 14 〜 30 日、回転 (rotation) 必須
- **Web**: refresh token → httpOnly Cookie、access token → メモリ
- **Android**: refresh/access token → Capacitor Secure Storage (Android Keystore 経由)

---

## 3. 設計書体系

### 3.1 5 カテゴリ分類 (DD-014)

| カテゴリ      | プレフィクス | 文書数 | 内容                                                  |
| ------------- | ------------ | ------ | ----------------------------------------------------- |
| 共有 (契約)   | S1-S6        | 6      | 業務要件 (大枠) / データ辞書 / API / 認証 / エラー / 非機能 |
| Backend 固有  | B1-B8        | 8      | 機能要件 / DB / 内部設計 / バッチ / API 内部処理 / ログ / 運用 / テスト |
| Web 固有      | W1-W7        | 7      | 機能要件 / 画面一覧 / 画面設計 / 状態管理 / コンポーネント / 操作マニュアル / テスト |
| Android 固有  | A1-A8        | 8      | 機能要件 / ナビゲーション / 画面設計 / ネイティブ機能 / オフライン / コンポーネント / 操作マニュアル / テスト |
| 横断          | X1-X6        | 6      | WBS / リスク / 課題 / リリース計画 / 用語集 / 体制図   |

詳細リスト・章立て・主管チーム: `docs/discussion/02-document-set.md` 参照。

### 3.2 トレーサビリティ

```
S1 業務要件 (大枠)
  ├─ B1 Backend 要件 ─→ B2 DB ─→ B5 API 処理 ─→ B6 ログ → B8 Test
  ├─ W1 Web 要件 ─→ W2 画面一覧 ─→ W3 画面設計 ─→ W5 コンポーネント ─→ W7 Test
  └─ A1 Android 要件 ─→ A2 画面一覧 ─→ A3 画面設計 ─→ A6 コンポーネント ─→ A8 Test

S3 API 仕様 (OpenAPI) ←── B5 から自動生成
                       └──→ W3/W5, A3/A6 が orval 経由で消費

S2 データ辞書, S4 認証仕様, S5 エラーコード ←── 全 B/W/A 文書から参照
S6 非機能要件 ←── B3/B4/B6/B7 で具体化、W/A はクライアント影響範囲のみ参照
```

### 3.3 章立てテンプレート (DD-016, DD-051, DD-052)

`docs/templates/` 配下に統一ひな型を整備:

- `template-screen-list.md` — 画面一覧・画面遷移図（**概要レベル** W2/A2、DD-051）
- `template-requirements.md` — 要件定義書
- `template-screen-design.md` — 画面設計書（**詳細レベル**、コンポーネントツリー + 値のソースマップ含む、DD-051）
- `template-component-design.md` — **W5/A6 専用** Vue/Ionic コンポーネント設計書（Atomic Design 分類 + Composables + 命名規約 + 実装パターン、DD-052）
- `template-internal-design.md` — **B3** Backend モジュール内部設計書（Spring 主軸）
- `template-test-spec.md` — テスト仕様書
- `template-api-internal.md` — API 内部処理設計書

Approach C の独立性を保ちつつ「目次は揃える」ことで、レビューと再利用性を向上させる。**概要レベル（screen-list）と詳細レベル（screen-design）の階層**で、Phase 2 早期 → Phase 2 後半〜Phase 3 の流れに沿った執筆順を設計に組み込んでいる。Frontend (W5/A6) と Backend (B3) は専用ひな型に分離し、それぞれの語彙・パターンで書きやすくしている (DD-052)。

---

## 4. 実装ステップ

### 4.1 9 フェーズ構成 (DD-020)

| Phase | 名称                 | 期間目安   | 主な成果物                                                                     |
| ----- | -------------------- | ---------- | ------------------------------------------------------------------------------ |
| 0     | プロジェクト立ち上げ | 1-2 週     | X1 WBS、X2 リスク、X6 体制図                                                   |
| 1     | 要件定義             | 3-6 週     | S1 業務要件、S6 非機能、B1/W1/A1 各機能要件                                    |
| 2     | 基本設計（外部）     | 4-8 週     | S2-S5 草案、B2 DB、W2/W3、A2/A3/A4                                             |
| 3     | 詳細設計（内部）     | 3-6 週     | B3-B6、W4/W5、A5/A6、**S3 OpenAPI YAML 確定版 v0.1.0**                         |
| 4     | 実装                 | 8-16 週    | 全プロジェクト並走実装 + 単体テスト (TDD)                                       |
| 5     | 結合テスト           | 3-6 週     | Backend ↔ Web、Backend ↔ Android の段階結合、E2E                              |
| 6     | システムテスト       | 2-4 週     | 性能・セキュリティ・運用シナリオ                                                |
| 7     | UAT                  | 2-4 週     | お客様シナリオ確認、操作マニュアル最終調整                                      |
| 8     | リリース・運用引継   | 1-2 週     | 本番稼働、Play Console 公開、運用引継                                          |

詳細は `docs/discussion/03-implementation-steps.md` 参照。

### 4.2 単体テストは Phase 4 内で完結 (DD-021)

単体テストは実装と同時に書く (TDD)。別フェーズに分割しない。Phase 5 (結合) 開始時点で単体緑が前提。

### 4.3 並走時の強制同期ポイント (DD-022)

| 同期点                       | フェーズ      |
| ---------------------------- | ------------- |
| 要件レビュー会               | Phase 1 末    |
| API エンドポイント一覧確定    | Phase 2 中盤  |
| OpenAPI v0.1.0 確定          | Phase 3 末    |
| API 破壊変更レビュー         | Phase 4 随時 |
| 結合テスト開始               | Phase 5 開始  |
| UAT 開始                     | Phase 7 開始  |

これ以外はチームごとのペースで進める。

### 4.4 並走時の難所と対策

| 難所                                     | 対策                                                                                          |
| ---------------------------------------- | --------------------------------------------------------------------------------------------- |
| Backend 遅延でフロントがブロックされる   | DD-012 のモック戦略 (MSW + Prism) で Backend なしでも Phase 3-4 を進行可能                    |
| Web と Android で API 要件がぶつかる     | 全チーム合同 API レビュー (Phase 2-3) で superset として Backend に集約                       |
| OpenAPI の破壊変更でフロントが壊れる     | DD-013 の URL パスバージョニング + フロント側 CI で型生成差分検出                              |
| フロント 2 チームの実装ペース差         | フェーズゲートはプロジェクト単位で個別、お客様への報告はマイルストーン単位で揃える            |
| 非機能要件 (S6) の解釈差                | Phase 1 で具体値合意、Phase 6 のシステムテスト基準として固定                                  |

---

## 5. 技術選定

### 5.1 採用スタック サマリ

#### Web

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

#### Android (PWA + Capacitor)

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

#### Backend

```
Node.js LTS + TypeScript (strict)
├─ NestJS
├─ Prisma (ORM)
├─ Zod + @asteasolutions/zod-to-openapi
├─ Passport.js + @nestjs/jwt
├─ BullMQ + Redis
├─ pino + nestjs-pino
├─ Helmet
└─ DB: PostgreSQL (推奨)
```

### 5.2 主要選定理由

| 領域                | 採用            | 主な理由                                                                                       |
| ------------------- | --------------- | ---------------------------------------------------------------------------------------------- |
| Web UI              | Vuetify 3       | データテーブル・フォーム公式部品が業務系に最適、Material Design 受容性、ドキュメント充実 |
| Android UI          | Ionic 8 + Capacitor | Vue 知識活用、Plugin 豊富、PWA + Native 両対応、ストア配布フロー確立                       |
| ビルド              | Vite            | Vuetify / Ionic 公式推奨、HMR 高速                                                            |
| 状態管理            | Pinia + TanStack Query | UI 状態とサーバー状態の責務分離。業務系で運用しやすい                                   |
| 日付                | date-fns        | 軽量・関数ベース・TS フレンドリー (moment は非採用)                                            |
| Backend FW          | NestJS          | 企業案件実績豊富、モジュール分割、Prisma 公式統合                                              |
| 認証                | JWT             | Web/モバイル両対応で標準的、refresh rotation で漏洩耐性                                       |

### 5.3 TypeScript 設定 (DD-026)

全プロジェクトで以下を有効化:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### 5.4 Lint / Format (DD-027, DD-054)

**Frontend**: ESLint + Prettier + typescript-eslint + eslint-plugin-vue + eslint-plugin-import + eslint-plugin-security。

Prettier 設定は `printWidth: 100 / singleQuote: true / trailingComma: 'all' / endOfLine: 'lf'` ほかを `.prettierrc.json` で標準化。`.editorconfig` を全リポジトリ配備 (DD-054)。設定は npm パッケージ共有せず、各チームに**初期コピー配布**。

**Backend (Java) 静的解析・カバレッジ (DD-055)**:

- **Spotless** + **Google Java Format** — フォーマット強制
- **Checkstyle** — スタイル違反（Google Java Style ベース）
- **SpotBugs** + FindSecBugs プラグイン — バグ・セキュリティパターン検出
- **ErrorProne** — Javac レベル追加チェック
- **JaCoCo** — テストカバレッジ（ライン 80% / ブランチ 80%）

集約タスク `./gradlew ciVerify` で CI 1 コマンドで全部実行可能。SonarQube は将来検討（案件規模次第）。

### 5.5 Git Hooks — lefthook (DD-053)

全リポジトリで **lefthook** を採用し、pre-commit / pre-push / commit-msg を共通管理:

- pre-commit: 変更ファイルだけ format/lint/typecheck/secret 検出
- pre-push: 単体テスト
- commit-msg: Conventional Commits 風メッセージ規約

Go バイナリで Frontend (Node) / Backend (Java) 両方で同じ設定が使える。

詳細比較表（採用しなかった候補と理由）は `docs/discussion/04-tech-selection.md` 参照。

---

## 6. 開発環境

### 6.1 リポジトリ構成 (DD-032)

| リポジトリ                | 公開範囲   |
| ------------------------- | ---------- |
| `<案件>-backend`          | Private    |
| `<案件>-web`              | Private    |
| `<案件>-android`          | Private    |
| `<案件>-docs` (任意)      | Private    |

命名規約: ハイフン区切り英小文字、`<案件>-{backend|web|android|docs}`。

### 6.2 ローカル環境 (DD-033)

- Node.js LTS (v22 想定)、`.nvmrc` / `.tool-versions` + Volta or fnm
- **pnpm** (高速・ロック厳密・ディスク効率)
- Docker Desktop (Backend ローカル開発用 DB/Redis)
- Android Studio (Capacitor ビルド)

### 6.3 IDE — VS Code (DD-034)

必須拡張: Vue Volar / TypeScript Vue Plugin / ESLint / Prettier / EditorConfig / GitLens / Error Lens / Code Spell Checker。プロジェクト別追加 (Prisma / Vuetify Snippets / Ionic) も定義済み。

`.vscode/settings.json` 共通設定（保存時フォーマット・ESLint 自動修正・LF 行末等）も標準化。

### 6.4 ブランチ戦略 — GitHub Flow + Squash Merge (DD-035, DD-036)

- `main` 直 push 禁止、全変更 PR 経由
- ブランチ命名: `feature/PROJ-123-add-customer-search` 等
- Squash & Merge で main 履歴を整理
- Branch Protection: 1 名以上レビュー + 全 CI 緑 + Linear history
- PR テンプレ標準化（概要 / Issue / 変更タイプ / 動作確認 / レビュアー向けメモ）

### 6.5 CI/CD — GitHub Actions (DD-037)

各プロジェクト独立に CI/CD を構成。

| プロジェクト | PR 時の主要ジョブ                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------ |
| Backend      | typecheck / lint / unit / integration (Docker DB) / OpenAPI 生成検証 / prisma-validate            |
| Web          | typecheck / lint / unit / component / e2e (smoke) / **openapi-sync-check**                       |
| Android      | typecheck / lint / unit / component / e2e (PWA) / openapi-sync-check / capacitor-build-check    |

**`openapi-sync-check`**: Backend Releases の最新 `openapi.yaml` と orval 生成済みファイルの整合性を毎日 + PR 時にチェック。API 変更見逃しを防ぐ。

push to main の主要ジョブ:

- Backend: Docker build → GHCR push、OpenAPI publish (Releases)、デプロイ
- Web: Vite build → S3+CloudFront or Cloudflare Pages
- Android: Capacitor build → Firebase App Distribution → Google Play Internal Testing

### 6.6 シークレット管理 (DD-038)

| 用途                  | 保管場所                                       |
| --------------------- | ---------------------------------------------- |
| ローカル              | `.env.local` (gitignore 済み)                  |
| CI                    | GitHub Secrets / GitHub Environments           |
| 本番                  | AWS Secrets Manager / Doppler / HashiCorp Vault |
| 開発者間共有 (一時的) | 1Password / Bitwarden                          |

### 6.7 環境分離 — 4 環境 (DD-039)

`local` → `dev` (最新 main 自動デプロイ) → `staging` (UAT) → `production`。各環境で別 Backend エンドポイント + 別 DB。

### 6.8 依存関係更新 (DD-040)

**Renovate (推奨)** または Dependabot で週次依存更新 PR。メジャーはレビュー必須、マイナー・パッチは CI 緑で自動 merge 可能（設定により切替）。

---

## 7. テスト方法

### 7.1 テストピラミッド (DD-041)

```
                  ┌───────────────────┐
                  │ 実機・運用試験    │ Phase 6-7
                  └───────────────────┘
                ┌──────────────────────┐
                │   E2E テスト          │ Phase 5
                └──────────────────────┘
              ┌────────────────────────┐
              │  結合テスト (含 契約)   │ Phase 5
              └────────────────────────┘
            ┌──────────────────────────┐
            │     単体テスト (TDD)      │ Phase 4
            └──────────────────────────┘
          ┌────────────────────────────┐
          │         静的検査           │ 常時
          └────────────────────────────┘
```

### 7.2 カバレッジ目標 (DD-042)

| レイヤー        | 目標                                          |
| --------------- | --------------------------------------------- |
| 静的検査        | 100%（CI 必須）                              |
| 単体（ロジック）| 80% (statements + branches)                  |
| 単体（UI）      | 70%                                           |
| 結合            | 全エンドポイント 1 シナリオ以上               |
| E2E             | 黄金パス 100%、主要例外シナリオ 80%           |
| 性能・セキュリティ | 非機能要件 (S6) 達成                         |

### 7.3 ツールチェーン

| レイヤー         | Backend                             | Web                                                          | Android                                                                       |
| ---------------- | ----------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| 静的             | tsc / ESLint / Prettier / markdownlint / gitleaks | 同左                                                          | 同左                                                                          |
| 単体             | **Jest** + ts-jest + @nestjs/testing | **Vitest**                                                   | **Vitest** (Capacitor はモック)                                                |
| コンポーネント   | —                                    | Vue Test Utils + @testing-library/vue + MSW                  | Vue Test Utils + @ionic/vue-test-utils + MSW                                  |
| 結合             | NestJS Testing + テスト DB (Docker)   | Vite dev + MSW + Playwright                                  | PWA build + Playwright + Capacitor モック                                     |
| 契約             | OpenAPI schema validation (Zod)     | orval 生成型 + Zod 受信時検証 + openapi-sync-check          | 同左                                                                          |
| E2E              | —                                    | **Playwright** (Chromium / Firefox / WebKit)                | **Maestro** (Capacitor 実機/Emulator) + Playwright (PWA build)                |
| 性能             | **k6** / Artillery                  | **Lighthouse CI** / WebPageTest                              | Capacitor 性能計測 + 実機計測                                                  |
| セキュリティ     | OWASP ZAP / Snyk / npm audit        | ESLint security / Snyk                                       | 同左                                                                          |
| 実機             | —                                    | BrowserStack / Sauce Labs                                    | **Firebase Test Lab** + BrowserStack                                          |

### 7.4 契約テスト方針 (DD-045)

**採用**: OpenAPI schema validation
**不採用**: Pact (Consumer-Driven Contracts)

理由: orval + Zod + 自動生成の組み合わせで「コンシューマー側の期待」が型レベルで自動表現されるため、Pact ブローカー運用は重複コスト。Backend は Zod で出力検証、Frontend は orval 型 + Zod 受信検証 + `openapi-sync-check` で十分。

### 7.5 実機テスト (DD-049)

| デバイス区分              | 優先度     |
| ------------------------- | ---------- |
| ハイエンド最新 (Pixel 8 / Galaxy S24, Android 14) | 必須       |
| ミドルレンジ (Pixel 6a / Galaxy A シリーズ, Android 13) | 必須       |
| 旧 OS 下限 (Android 12)    | 必須       |
| タブレット (Galaxy Tab S9) | 案件次第   |

クラウド実機 (BrowserStack / Sauce Labs) + Firebase Test Lab で網羅。

### 7.6 不具合管理

| Severity | 定義                          | リリース判定 |
| -------- | ----------------------------- | ------------ |
| Critical | 業務停止・データ破損          | 解消必須     |
| High     | 主要機能が動作不能            | 解消必須     |
| Medium   | 機能制限あり、回避策あり      | 許容範囲合意 |
| Low      | UI 細部・軽微な表示崩れ        | 許容範囲合意 |

### 7.7 テストデータ管理

- 単体: ファクトリーでインライン生成
- 結合: Seed + トランザクション ROLLBACK
- E2E: 専用テスト DB
- 性能: 本番相当ボリュームの合成データ
- UAT: お客様提供データ + ダミー
- **禁止**: 本番データを開発・テスト環境にコピー (PII リスク)

---

## 8. 設計判断一覧（DD インデックス）

| DD     | タイトル                                                       |
| ------ | -------------------------------------------------------------- |
| DD-001 | 構成パターン — Approach C（コードベース完全分離）              |
| DD-002 | 設計書体系 — 2 プロジェクト独立 + API/連携仕様書のみ共有       |
| DD-003 | アプリ性質 — 業務系 CRUD（Web メイン・モバイル補助）           |
| DD-004 | 開発体制スタイル — 企業・受託スタイル                          |
| DD-005 | バックエンドスタック前提 — orval / zod / prisma               |
| DD-006 | OpenAPI 生成方向 — Zod-first                                  |
| DD-007 | Backend フレームワーク — NestJS + Prisma + zod                |
| DD-008 | OpenAPI 配布方法 — Backend リポジトリ + GitHub Releases       |
| DD-009 | orval 生成構成 — axios + TanStack Query + Zod + MSW           |
| DD-010 | エラーレスポンス規格 — RFC 7807 + 業務エラーコード             |
| DD-011 | 認証方式 — JWT + プラットフォーム別ストレージ                  |
| DD-012 | モック戦略 — orval MSW + Prism                                |
| DD-013 | API バージョニング — URL パス + Semver                        |
| DD-014 | 設計書体系の 5 カテゴリ分類                                    |
| DD-015 | S1（業務要件定義書）の共有範囲を限定                          |
| DD-016 | 章立てテンプレートを統一                                       |
| DD-017 | B6 ログ・監査ログ設計書を Backend 固有として明示              |
| DD-018 | B7 運用手順書・障害対応手順書を Backend 固有として明示        |
| DD-019 | W6/A7 操作マニュアルを各フロント固有として明示                |
| DD-020 | 実装ステップを 9 フェーズで構成                                |
| DD-021 | 単体テストは Phase 4 (実装) 内で TDD として完結                |
| DD-022 | 並走時の強制同期ポイントを 6 つ設定                            |
| DD-023 | Web UI ライブラリ — Vuetify 3                                  |
| DD-024 | Android UI 構成 — Vue + Ionic 8 + Capacitor                    |
| DD-025 | ビルドツール — Vite                                            |
| DD-026 | TypeScript 設定 — strict + 追加厳格オプション                  |
| DD-027 | Lint/Format — ESLint + Prettier + 各種プラグイン               |
| DD-028 | 状態管理 — Pinia + TanStack Query                              |
| DD-029 | 日付・時刻ライブラリ — date-fns                                |
| DD-030 | i18n — vue-i18n（将来追加可能設計）                            |
| DD-031 | Backend 補強ライブラリ — Passport.js / BullMQ / pino / Helmet  |
| DD-032 | リポジトリ構成 — 3 リポジトリ独立 + 任意の docs リポジトリ     |
| DD-033 | Node.js / パッケージマネージャ — Node LTS + pnpm               |
| DD-034 | IDE — VS Code + 共通拡張機能セット                             |
| DD-035 | ブランチ戦略 — GitHub Flow + Squash Merge                      |
| DD-036 | PR テンプレート / Branch Protection の標準化                  |
| DD-037 | CI/CD — GitHub Actions + OpenAPI 同期チェック                  |
| DD-038 | シークレット管理 — GitHub Secrets + 本番は外部 Secrets Manager |
| DD-039 | 環境分離 — local / dev / staging / production の 4 環境        |
| DD-040 | 依存関係更新 — Renovate (推奨) または Dependabot               |
| DD-041 | テスト戦略 — テストピラミッド採用                              |
| DD-042 | カバレッジ目標                                                  |
| DD-043 | 単体テストツール — Jest (Backend) / Vitest (Web/Android)      |
| DD-044 | コンポーネントテスト — Vue Test Utils + Testing Library + MSW |
| DD-045 | 契約テスト — OpenAPI schema validation 採用 / Pact 不採用     |
| DD-046 | E2E テスト — Playwright (Web) / Maestro (Android)             |
| DD-047 | 性能テスト — k6 + Lighthouse CI                                |
| DD-048 | セキュリティテスト — SAST + DAST + gitleaks                   |
| DD-049 | 実機テスト — クラウド実機 + Firebase Test Lab                  |
| DD-050 | Backend スタックを Java + Spring に変更（前提変更）           |
| DD-051 | 設計書ひな型を追加・拡張（画面一覧・コンポーネントツリー・値のソースマップ） |
| DD-052 | W5/A6 専用 `template-component-design.md` を採用、`template-internal-design.md` は Backend 主軸へ |
| DD-053 | pre-commit hook ツール — lefthook 採用（Frontend / Backend 共通）                |
| DD-054 | Frontend Prettier 設定詳細 + `.editorconfig` 採用                                  |
| DD-055 | Backend 静的解析・カバレッジ — Spotless / Checkstyle / SpotBugs / ErrorProne / JaCoCo |

各 DD の詳細（理由・代替案不採用理由）: `docs/discussion/decisions.md` 参照。

---

## 9. 関連ドキュメント

| ドキュメント                                                    | 内容                                  |
| --------------------------------------------------------------- | ------------------------------------- |
| `docs/discussion/decisions.md`                                  | 設計判断ログ (全 DD-001〜DD-050)      |
| `docs/discussion/01-contract-layer-proposal.md`                 | 契約レイヤー詳細案                    |
| `docs/discussion/02-document-set.md`                            | 設計書体系（成果物リスト）             |
| `docs/discussion/03-implementation-steps.md`                    | 実装ステップ（フェーズ定義）           |
| `docs/discussion/04-tech-selection.md`                          | 技術選定詳細比較                       |
| `docs/discussion/05-dev-environment.md`                         | 開発環境                              |
| `docs/discussion/06-testing-strategy.md`                        | テスト方法                            |
| `docs/templates/*.md`                                           | 設計書ひな型 6 種（概要/詳細階層あり、DD-051）|
| `docs/examples/`                                                | 設定・CI・契約・静的解析の具体例コピー元（DD-053/054/055 含む）|
| `docs/checklists/*.md`                                          | フェーズゲート / PR / API 変更 / リリース / オンボーディング |

---

## 10. 次のアクション

1. **本スペックのユーザレビュー**（現在ここ）
2. レビュー承認後、本スペックを実行可能なタスク群に分解した**実装計画** (implementation plan) を別途作成する
3. 各案件で本スペックを参照し、`docs/templates/` 配下のひな型を起点に個別 3 プロジェクト (Backend / Web / Android) を立ち上げる

---

## 11. 想定読者と使い方

| 読者                  | 推奨される使い方                                                            |
| --------------------- | --------------------------------------------------------------------------- |
| プロジェクトマネージャ | セクション 4 (実装ステップ) と セクション 3 (設計書体系) で見積・体制設計  |
| アーキテクト          | セクション 2 (契約レイヤー) と セクション 5 (技術選定) で技術判断           |
| Backend リード        | セクション 2, 5, 7 + B1-B8 の章立てひな型                                   |
| Web リード            | セクション 5, 6, 7 + W1-W7 の章立てひな型                                   |
| Android リード        | セクション 5, 6, 7 + A1-A8 の章立てひな型 + Capacitor 関連                  |
| QA / 品質管理         | セクション 7 (テスト方法)                                                   |
| 新規参画者            | セクション 0-1 (概要・前提) → セクション 6.4-6.8 (オンボーディング関連) |
