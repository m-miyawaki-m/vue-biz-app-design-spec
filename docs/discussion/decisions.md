# 設計判断ログ (Decisions Log)

このプロジェクトの設計に関わる判断を、ブレインストーミング・討議の経過に沿って時系列で記録する。

## 凡例

- **DD-NNN**: Design Decision の連番
- 各判断には「決定」「理由」「代替案（なぜ採用しなかったか）」を残す
- 後で覆る判断もあり得るが、覆ったときは新しい DD を追加し、古い DD には「**Superseded by DD-XXX**」と注記する

---

## DD-001: 構成パターン — Approach C（コードベース完全分離）

**決定**: Web 版と Android 版を完全に独立した別プロジェクトで開発する。両者は Backend API を介してのみ業務データを共有し、フロント同士の直接依存は持たない。

**理由**: チームが異なり、共通化のオーバーヘッドより独立して動くメリットの方が大きい。

**代替案（不採用）**:

- Approach A (ワンソース・マルチターゲット): Vue コードベース共有で Web/Android 両方ビルド。チームが分かれている前提では不適合。
- Approach B (共通コア + プラットフォーム別 UI): ビジネスロジックや API クライアントを共通パッケージ化。チーム分離下では運用負荷が高い。

---

## DD-002: 設計書体系の組み方 — 2 プロジェクト独立 + API/連携仕様書のみ共有

**決定**: Web 版・Android 版それぞれが独立した設計書セット（要件定義書〜テスト仕様書）を持つ。両者の唯一の契約として API 仕様書・認証仕様・データ辞書を共有する。

**理由**: チーム完全分離前提では、共通設計書の整合性維持コストが高い。契約面だけ厳密に管理する方が結合点が小さく済む。

---

## DD-003: アプリ性質 — 業務系 CRUD（Web メイン・モバイル補助）

**決定**: 想定アプリは「入力・一覧・フォーム中心の業務系」とし、デスクトップ Web を主軸、Android を補助とする。

**設計への影響**:

- UI 選定: Web はデータ密度高め (Vuetify3) / Android はモバイルパターン (Vue+Ionic+Capacitor 等)
- 認証: PC ブラウザ + モバイル両対応（Cookie + JWT/Secure Storage の併用を検討）
- 機能優先順位: フォーム入力・一覧・検索が一級市民

---

## DD-004: 開発体制スタイル — 企業・受託スタイル

**決定**: 要件定義書 / 外部設計書 / 内部設計書 / テスト仕様書 を一通り揃える、ウォーターフォール寄り（ただし内部はアジャイル混合可）の体制を前提とする。

**設計への影響**: 設計書の粒度は受託・企業案件水準（レビュー可能・トレーサビリティあり）にする。

---

## DD-005: バックエンドスタック前提 — orval / zod / prisma

**決定**: バックエンドは TypeScript ベースで、`prisma` を ORM、`zod` をスキーマ検証、`orval` を OpenAPI からのフロントクライアント生成に使う構成を前提とする。

**設計への影響**:

- 契約レイヤーの真実源は Zod schema（そこから OpenAPI 生成 + フロント側型/Zod 再生成）
- フロント 2 プロジェクトは Backend ソースを見ず、生成された `openapi.yaml` のみを契約として消費

---

## DD-006: OpenAPI 生成方向 — Zod-first

**決定**: Backend で Zod schema を真実源とし、`zod-to-openapi` (`@asteasolutions/zod-to-openapi` 等) で OpenAPI YAML を生成する。

**理由**: 真実源が Zod 一つに集約されるため、OpenAPI YAML と実装のドリフトが構造的に発生しない。Prisma モデルとも共存しやすい。

**代替案（不採用）**:

- Backend コード-first (NestJS @nestjs/swagger): デコレータが冗長化しやすい
- OpenAPI 手書き-first: YAML と実装のドリフトを人手で防ぐ必要があり保守困難

---

## DD-007: Backend フレームワーク — NestJS + Prisma + zod

**決定**: NestJS を Backend フレームワークに採用し、Prisma を ORM、zod をスキーマ検証として組み合わせる。

**理由**: 企業・受託案件で実績豊富。モジュール分割が業務系の規模感に合う。Prisma 公式統合あり。`@nestjs/zod` 等で Zod 連携も可能。

**代替案（不採用）**:

- Hono + @hono/zod-openapi: モダン軽量だが企業案件での実績がまだ薄い（DD-004 企業・受託スタイルとの整合性を優先）
- Fastify + zod-to-openapi: 軽量で良いが、NestJS ほどのモジュール構造が標準化されていない

---

## DD-008: OpenAPI 配布方法 — Backend リポジトリ + GitHub Releases

**決定**: Backend リポジトリ内で `openapi.yaml` を生成し、Backend のリリース時に Git タグ付け + GitHub Releases にアセットとして添付する。フロント側はバージョン固定でダウンロード/参照する。

**理由**: チーム完全分離 (DD-001) でもフロント側は Backend ソース閲覧不要。バージョン固定取得が容易。専用リポジトリを増やすオーバーヘッドなし。

**代替案（不採用）**:

- 専用「contract」リポジトリ: リポジトリ運用コストが増える
- npm private package: registry 運用コスト・権限管理が増える
- git submodule: 開発体験が悪い

---

## DD-009: orval 生成構成 — axios + TanStack Query for Vue + Zod runtime + MSW mock

**決定**: orval の出力構成として以下を採用する。

- HTTP クライアント: axios
- データフェッチング: TanStack Query for Vue (Vue Query)
- ランタイム検証: Zod schema を OpenAPI から再生成し、実行時にレスポンスを検証
- モック: `--mock=msw` で MSW モックを同時生成

**理由**: TanStack Query は一覧/キャッシュ/楽観更新が業務系 CRUD に強い。Zod 実行時検証で API 契約違反を即検出。MSW で Backend 独立開発可能 (DD-012 と整合)。

---

## DD-010: エラーレスポンス規格 — RFC 7807 + 業務エラーコード

**決定**: API のエラーレスポンスは RFC 7807 (Problem Details for HTTP APIs) に準拠し、業務エラーコード `errorCode: "E-{領域}-{番号}"` を拡張フィールドとして付与する。

**理由**: 標準仕様のため各種ツール対応がある。業務エラーコード体系で運用・問合せ対応が楽になる。

**フィールド例**:

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

---

## DD-011: 認証方式 — JWT + プラットフォーム別ストレージ

**決定**: 認証は以下の構成で統一する。

- 短命 access token (例: 15 分) + refresh token rotation
- **Web**: refresh token を httpOnly Cookie に保管、access token はメモリ
- **Android**: refresh/access token を Capacitor Secure Storage (Android Keystore 経由) に保管

**理由**: Web/モバイル両対応の標準的構成。Refresh rotation で漏洩耐性向上。Web は httpOnly Cookie で XSS 耐性、Android は OS のセキュアストレージを活用。

**代替案（不採用）**:

- OAuth2/OIDC (Keycloak 等の IdP 分離): SSO/監査要件があれば再検討。初期は不要
- セッション Cookie のみ: モバイル対応で不利

---

## DD-012: モック戦略 — orval MSW + Prism

**決定**: モック戦略を二層構成にする。

- **開発時 (フロント単独開発)**: orval が生成する MSW mock を使用
- **結合テスト・E2E**: Prism (OpenAPI モックサーバー) を CI/コンテナで起動

**理由**: フロント 2 チームが Backend 完成を待たずに着手可能 (DD-001 のチーム完全分離前提と整合)。CI でも回せる。

---

## DD-013: API バージョニング — URL パス + Semver

**決定**: API バージョニングは URL パス方式 (`/v1/`, `/v2/`) を採用し、Semver で管理する。

**理由**: 業務系で最もシンプル・運用実績豊富。Web と Android が破壊変更を別タイミングで追従できる。

**運用ルール**:

- 非破壊変更 (フィールド追加・新エンドポイント): マイナー番号アップ、URL バージョン据え置き
- 破壊変更 (フィールド削除・型変更): メジャー番号アップ、URL バージョン更新 (`/v2/`)
- 旧バージョン (`/v1/`) は次のメジャーリリースから 6 ヶ月維持を推奨 (要件により調整)

---

## DD-014: 設計書体系の 5 カテゴリ分類

**決定**: ドキュメント体系を以下 5 カテゴリで整理する。

- **共有 (契約)**: S1〜S6 — 業務要件(共有部分)、データ辞書、API 仕様、認証/認可仕様、エラーコード、非機能要件
- **Backend 固有**: B1〜B8 — 機能要件、DB、内部設計、バッチ、API 内部処理、ログ・監査、運用手順、テスト仕様
- **Web 固有**: W1〜W7 — 機能要件、画面一覧、画面設計、状態管理、コンポーネント、操作マニュアル、テスト仕様
- **Android 固有**: A1〜A8 — 機能要件、ナビゲーション、画面設計、ネイティブ機能、オフライン同期、コンポーネント、操作マニュアル、テスト仕様
- **横断**: X1〜X6 — WBS、リスク、課題、リリース計画、用語集、体制図

**理由**: Approach C を厳守しつつ、契約面（共有）だけ厳密に管理し、各プロジェクトは独立して進められる構造。

詳細は [02-document-set.md](02-document-set.md) を参照。

---

## DD-015: S1（業務要件定義書）の共有範囲を限定

**決定**: S1 業務要件定義書は「業務概要・主要ロール・業務フロー大枠・用語(導入)」までを共有範囲とする。機能要件詳細は各プロジェクト固有 (B1/W1/A1) に分割する。

**理由**: Approach C 厳守との整合性確保。業務全体像はチーム間で共通理解、機能要件レベルでは各チームが独立して詳細を書く。

---

## DD-016: 章立てテンプレートを統一

**決定**: `docs/templates/` 配下に各文書種別のひな型 (`template-requirements.md` / `template-screen-design.md` / `template-internal-design.md` / `template-test-spec.md` / `template-api-internal.md`) を整備し、Backend/Web/Android 全チームで使う。

**理由**: Approach C 厳守でも文書フォーマット統一はレビュアー認知コスト削減・抜け漏れチェック自動化・後続案件への再利用性に効く。中身の書き手は各チーム独立だが、目次が揃っていれば横串レビュー可能。

---

## DD-017: B6 ログ・監査ログ設計書を Backend 固有として明示

**決定**: ログ規約・監査ログ設計書 (B6) を Backend 固有成果物に含める。アプリケーションログ規約・監査ログ対象操作・保管・検索方針を含む。

**理由**: 業務系で監査要件が高頻度。Backend 集中管理が妥当。

---

## DD-018: B7 運用手順書・障害対応手順書を Backend 固有として明示

**決定**: 運用手順書・障害対応手順書 (B7) を Backend 固有成果物に含める。デプロイ手順・ロールバック・障害切り分け・連絡フローを含む。

**理由**: 本番運用責任は Backend チームが負うことが多い。フロント側は別途デプロイ手順を簡略版で持つ。

---

## DD-019: W6/A7 操作マニュアル（エンドユーザー向け）を含める

**決定**: 業務系・受託案件特性として、エンドユーザー向け操作マニュアル (W6: Web、A7: Android) を各フロント固有成果物に含める。

**理由**: 受託・企業案件では納品物として操作マニュアルが要求されることが多い。

---

## DD-020: 実装ステップを 9 フェーズで構成

**決定**: Phase 0 (立ち上げ) → Phase 1 (要件定義) → Phase 2 (基本設計) → Phase 3 (詳細設計) → Phase 4 (実装) → Phase 5 (結合テスト) → Phase 6 (システムテスト) → Phase 7 (UAT) → Phase 8 (リリース) の 9 フェーズで進行する。

**理由**: 企業・受託スタイル (DD-004) で標準的なフェーズ分割。フェーズゲートでステークホルダー承認を得る運用と整合。

**運用上の特徴**: Phase 2 以降は 3 プロジェクト (Backend/Web/Android) で並走し、強制同期ポイントを設ける (DD-022 参照)。

詳細は [03-implementation-steps.md](03-implementation-steps.md) を参照。

---

## DD-021: 単体テストは Phase 4 (実装) 内で TDD として完結させる

**決定**: 単体テストは Phase 4 内で実装と同時に書く (TDD)。別フェーズに分割しない。

**理由**:

- 単体テストは実装と不可分。後工程に追いやると技術的負債化する
- TDD で書く方が設計品質が上がる
- Phase 5 (結合テスト) では既に単体テスト緑が前提

---

## DD-022: 並走時の強制同期ポイントを 6 つ設定

**決定**: Approach C で並走する 3 プロジェクトに以下 6 つの強制同期ポイントを置く。

1. 要件レビュー会 (Phase 1 末)
2. API エンドポイント一覧確定 (Phase 2 中盤)
3. OpenAPI v0.1.0 確定 (Phase 3 末)
4. API 破壊変更レビュー (Phase 4 随時)
5. 結合テスト開始 (Phase 5 開始)
6. UAT 開始 (Phase 7 開始)

**理由**: 完全独立並走でもこれらは技術的に同期が必須。これ以外はチームごとのペースで進めてよい。

---

## DD-023: Web UI ライブラリ — Vuetify 3

**決定**: Web 版の UI ライブラリは **Vuetify 3** を採用する。

**理由**: 業務系で必要なデータテーブル・フォーム・ダイアログが公式で揃う。Material Design は業務系で受け入れられやすい。ドキュメント充実、TypeScript 完全対応。

**代替案（不採用）**: PrimeVue (次点、有償テンプレ前提箇所が多い) / Quasar (機能過剰) / Element Plus (中国系寄り) / Naive UI (実績薄)

---

## DD-024: Android UI 構成 — Vue + Ionic 8 + Capacitor

**決定**: Android 版は **Vue + Ionic 8 + Capacitor** を採用する。

**理由**: Web チームの Vue 知識を活用可能。Ionic コンポーネントがモバイル UX に最適化済み。Capacitor で Camera/Geolocation/Secure Storage/Push へアクセス可能。PWA としてもビルド可能。

**代替案（不採用）**: React Native / Flutter / Kotlin (Vue 系から外れる) / Quasar Capacitor モード (Web 側との分離が薄れる)

---

## DD-025: ビルドツール — Vite

**決定**: 全 3 プロジェクトで Vite を採用する。Vuetify/Ionic ともに公式推奨。

---

## DD-026: TypeScript 設定 — strict + 追加厳格オプション

**決定**: 全プロジェクトで `strict: true` + `noUncheckedIndexedAccess: true` + `exactOptionalPropertyTypes: true` を採用する。

**理由**: 業務系で型安全性を最大化。Zod ランタイム検証と組み合わせて契約違反を早期検出。

---

## DD-027: Lint/Format — ESLint + Prettier + 各種プラグイン

**決定**: ESLint + Prettier + typescript-eslint + eslint-plugin-vue + eslint-plugin-import + eslint-plugin-security を採用。設定は各チームに**初期設定をコピー配布**する方針。

**理由**: npm 共有パッケージ化は Approach C のチーム独立性を損なうため不採用。テンプレートは docs/templates/ で参照可能。

---

## DD-028: 状態管理 — Pinia (UI 状態) + TanStack Query (サーバー状態)

**決定**: Pinia と TanStack Query for Vue を併用し、責務を分離する。

- Pinia: ローカル UI 状態・認証ユーザー情報・フォーム下書き
- TanStack Query: サーバー由来データのキャッシュ・再取得・楽観更新

**理由**: 一つの状態管理で全部抱えるとキャッシュ戦略が複雑化。役割分離が業務系で運用しやすい。

---

## DD-029: 日付・時刻ライブラリ — date-fns

**決定**: 全プロジェクトで `date-fns` を採用する。

**理由**: 軽量・関数ベース・TypeScript フレンドリー。moment.js はメンテナンスモードのため不採用。

---

## DD-030: i18n — vue-i18n（将来追加可能設計）

**決定**: 当面は単言語でも、`vue-i18n` 導入を前提とした「キー化された文言管理」を初期から行う。

**理由**: 業務系で「将来多言語化」要件が後から出るケースが多い。初期から i18n キーで書いておけば追加コストが低い。

---

## DD-031: Backend 補強ライブラリ — Passport.js / BullMQ / pino / Helmet

**決定**: NestJS 標準構成に加えて Passport.js (認証ストラテジ)、@nestjs/jwt、BullMQ + Redis (ジョブキュー)、pino + nestjs-pino (構造化ログ)、Helmet (セキュリティヘッダー) を採用する。DB は PostgreSQL を推奨。

**理由**: 業務系 Backend の標準構成として実績豊富。

---

## DD-032: リポジトリ構成 — 3 リポジトリ独立 + 任意の docs リポジトリ

**決定**: `<案件>-backend` / `<案件>-web` / `<案件>-android` の 3 リポジトリを独立で持つ。共有設計書集約用に `<案件>-docs` を任意で追加可能。命名規約はハイフン区切り英小文字。

**理由**: Approach C のチーム完全分離前提と一致。リポジトリ単位で権限・CI が独立。

---

## DD-033: Node.js / パッケージマネージャ — Node LTS + pnpm

**決定**: Node.js は LTS (時点で v22 LTS)、パッケージマネージャは **pnpm** を採用。バージョン固定は `.nvmrc` または `.tool-versions` + Volta/fnm。

**理由**: pnpm は高速・ロック厳密・ディスク効率。Monorepo 化しなくても利点を活用可能。

---

## DD-034: IDE — VS Code + 共通拡張機能セット

**決定**: 全プロジェクトで VS Code を推奨。必須拡張機能セット（Vue Volar、ESLint、Prettier、EditorConfig、GitLens、Error Lens、Code Spell Checker）+ プロジェクト別追加（Prisma / Vuetify / Ionic）を定める。

`.vscode/settings.json` の共通設定（保存時フォーマット、ESLint 自動修正、改行コード LF 等）を各リポジトリで採用する。

---

## DD-035: ブランチ戦略 — GitHub Flow + Squash Merge

**決定**: GitHub Flow を採用。`main` 直 push 禁止、全変更 PR 経由、Required Status Checks 全緑 + 1 名以上レビューで merge 可能。Merge は Squash & Merge。

**理由**: シンプルでチーム独立性とも整合。

---

## DD-036: PR テンプレート / Branch Protection の標準化

**決定**: `.github/pull_request_template.md` で「概要 / 関連 Issue / 変更タイプ / 動作確認 / レビュアー向けメモ」を必須化。Branch Protection (1 名以上のレビュー + 全 CI 緑 + Linear history) を main に設定する。

---

## DD-037: CI/CD — GitHub Actions、各プロジェクト独立 + OpenAPI 同期チェック

**決定**: GitHub Actions で各プロジェクト独立に CI/CD を構成。

- **Backend**: typecheck / lint / unit test / integration test (Docker Compose) / OpenAPI 自動生成 / Docker build → GHCR push / OpenAPI publish (GitHub Releases) / デプロイ
- **Web**: typecheck / lint / unit test / component test / e2e (Playwright) / OpenAPI sync check / Vite build → S3+CloudFront or Cloudflare Pages
- **Android**: 上記 + Capacitor build → Firebase App Distribution → Google Play Internal Testing

**特記**: Web/Android は Backend Releases の最新 OpenAPI と orval 生成済みファイルの整合性チェック (`openapi-sync-check` ジョブ) を毎日 + PR 時に実行。API 変更見逃しを防ぐ。

---

## DD-038: シークレット管理 — GitHub Secrets + 本番は外部 Secrets Manager

**決定**: ローカルは `.env.local` (gitignore)、CI は GitHub Secrets / GitHub Environments、本番は AWS Secrets Manager / Doppler / HashiCorp Vault のいずれか。開発者間の一時共有は 1Password / Bitwarden 等。

**禁止事項**: `.env` の Git コミット / Secret の平文送信 / CI ログへの出力。

---

## DD-039: 環境分離 — local / dev / staging / production の 4 環境

**決定**: 各プロジェクトで 4 環境を分離する。それぞれ別 Backend エンドポイント + 別 DB。

- local: 開発者ローカル
- dev: 統合開発環境 (最新 main 自動デプロイ)
- staging: リリース前検証 (UAT)
- production: 本番

---

## DD-040: 依存関係更新 — Renovate (推奨) または Dependabot

**決定**: Renovate (推奨) または Dependabot で週次依存更新 PR を自動作成。メジャーはレビュー必須、マイナー・パッチは CI 緑で自動 merge 可能 (設定により切替)。

**理由**: セキュリティ脆弱性の継続的対応と保守工数の削減。Renovate のほうがグループ化・スケジュール柔軟性が高い。

---

## DD-041: テスト戦略 — テストピラミッド採用

**決定**: 静的検査 → 単体 → 結合・契約 → E2E → 実機・運用試験 のピラミッド型構造で組み立てる。底辺ほど自動化率高く、上層は人手・実機を含む。

**理由**: テストごとの実行コスト・速度に応じた配分。業務系 CRUD で標準的かつ実証済み。

---

## DD-042: カバレッジ目標

**決定**:

- 静的検査: 100%（CI 必須）
- 単体テスト (Backend サービス / Web/Android Composables): 80% (statements + branches)
- 単体テスト (UI コンポーネント): 70%
- 結合テスト: 全エンドポイントに 1 シナリオ以上
- E2E: 黄金パス 100%、主要例外シナリオ 80%
- 性能・セキュリティ: 非機能要件 (S6) 達成

---

## DD-043: 単体テストツール — Backend=Jest、Web/Android=Vitest

**決定**: Backend は Jest (NestJS デフォルト)、Web/Android は Vitest を採用。

**理由**: Vitest は Vite ネイティブ・高速・Jest 互換 API でフロント親和性が高い。Backend は @nestjs/testing との統合が確立。

---

## DD-044: コンポーネントテスト — Vue Test Utils + @testing-library/vue + MSW

**決定**: コンポーネントテストは Vue Test Utils をベースに @testing-library/vue (ユーザー視点クエリ) を併用、API モックは MSW (DD-009)。Android では @ionic/vue-test-utils を追加採用。

---

## DD-045: 契約テスト — OpenAPI schema validation 採用 / Pact 不採用

**決定**: 契約テストは「OpenAPI schema validation」(Backend 側で Zod 検証 + Frontend 側で orval 生成型 + Zod 受信時検証) で行う。Pact (Consumer-Driven Contracts) は不採用。

**理由**: orval + Zod + 自動生成の組み合わせで「コンシューマー側の期待」が型レベルで自動表現されるため、Pact ブローカー運用は重複コスト。

---

## DD-046: E2E テスト — Web=Playwright / Android=Maestro (推奨)

**決定**: Web は Playwright (Chromium/Firefox/WebKit マトリクス)、Android Capacitor 版は Maestro を推奨、複雑な制御が必要な場合のみ Appium。Android PWA build に対しては Playwright を併用。

**理由**: Maestro は YAML 記述・並列実行・エミュレータ自動起動で業務系シナリオ向けに学習コストが低い。

---

## DD-047: 性能テスト — k6 (推奨) + Lighthouse CI

**決定**: Backend API は k6 (推奨) または Artillery、Web 画面は Lighthouse CI を採用。Android は Capacitor 性能計測 + 実機計測。

---

## DD-048: セキュリティテスト — 静的 (SAST/Snyk) + 動的 (OWASP ZAP) + Secret 検出 (gitleaks)

**決定**: SAST は ESLint security plugin + Snyk Code、依存脆弱性は npm audit + Snyk + Dependabot/Renovate、DAST は OWASP ZAP、Secret 検出は gitleaks を採用。Phase 5-6 で集中実施し、PR 時にも軽量チェックを行う。

---

## DD-049: 実機テスト — クラウド実機 (BrowserStack/Sauce Labs) + Firebase Test Lab

**決定**: Android 実機マトリクスはハイエンド最新 / ミドル / 旧 OS 下限を必須カバー。タブレットは案件次第。クラウド実機サービス + Firebase Test Lab で網羅する。

**禁止事項**: 本番データを開発・テスト環境にコピー (PII 漏洩リスク)。

---

## DD-050: Backend スタックを Java + Spring に変更（前提変更）

**決定**: Backend は当初の Node.js (NestJS + Prisma + Zod) 想定から **Java + Spring Boot 3.x + MyBatis + Gradle (Groovy DSL)** に変更する。

**理由**: 案件・チームの前提（Java + Spring）に合わせる。

**確定済みの大枠スタック**:

- 言語: **Java 21 LTS**
- フレームワーク: **Spring Boot 3.x**（Web MVC）
- データアクセス: **MyBatis**（業務系で SQL 制御を握りたいケース向け、日本の受託で実績豊富）
- ビルド: **Gradle (Groovy DSL)**

**影響を受ける DD**（詳細は保留）:

| DD     | 当初の値                                            | 変更後の方向性                                                                            | 状態     |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| DD-005 | orval / Zod / Prisma 前提                           | orval / Zod は frontend のみ前提。Backend は Java + Spring + MyBatis 前提                  | 部分修正 |
| DD-006 | OpenAPI 生成 = Zod-first → zod-to-openapi          | **保留**: springdoc-openapi / Spring REST Docs / OpenAPI 手書き から再選定が必要         | 保留     |
| DD-007 | Backend FW = NestJS + Prisma + Zod                  | Spring Boot 3.x + MyBatis + Bean Validation に置換                                        | 大枠決定 |
| DD-008 | OpenAPI 配布 = Backend リポ + GitHub Releases       | 不変（生成方法のみ gradle タスク経由に変更）                                              | 不変     |
| DD-009 | orval 構成                                          | 不変（frontend 側）                                                                       | 不変     |
| DD-010 | RFC 7807 + 業務エラーコード                         | 不変（Spring Boot 3 はネイティブで `ProblemDetail` をサポート）                            | 不変     |
| DD-011 | JWT + Cookie / Secure Storage                       | 認証方式は不変。実装は **Spring Security + OAuth2 Resource Server (JWT)** に変更         | 部分修正 |
| DD-012 | orval MSW + Prism                                   | 不変                                                                                      | 不変     |
| DD-013 | URL パスバージョニング + Semver                     | 不変                                                                                      | 不変     |
| DD-031 | Passport.js / @nestjs/jwt / BullMQ / pino / Helmet  | **保留**: Spring Security / Spring Batch / Logback + Logstash encoder 系へ置換予定         | 保留     |
| DD-033 | Node LTS + pnpm                                     | frontend は不変。Backend は **Java 21 LTS + Gradle (Groovy DSL)** を追加                  | 追加     |
| DD-034 | VS Code + 共通拡張                                  | frontend は不変。Backend は **IntelliJ IDEA** を推奨に追加                                | 追加     |
| DD-037 | CI/CD GitHub Actions                                | frontend は不変。Backend ジョブは npm/pnpm → **gradle build / test / bootBuildImage** に置換 | 保留     |
| DD-043 | 単体テスト Backend = Jest                           | **JUnit 5 + AssertJ + Mockito + TestContainers** に置換                                  | 大枠決定 |

## Backend 詳細の保留事項（後日決着）

以下は Backend スタック決定後に詳細を詰める:

- [ ] OpenAPI 生成方針: **springdoc-openapi-starter-webmvc-ui** / Spring REST Docs / 手書き YAML から選定（推奨: springdoc-openapi）
- [ ] MyBatis Mapper の管理規約（XML マッパー / アノテーション、SQL ID 命名、Generator 採用可否）
- [ ] Bean Validation の活用範囲（DTO / Form / Command）
- [ ] 認証実装詳細（Spring Security 設定、JWT エンコード方式、Refresh Token Rotation 実装）
- [ ] バッチ実装方式（Spring Batch / Spring Boot @Scheduled / Quartz）
- [ ] DB マイグレーション（**Flyway** / Liquibase）
- [ ] DTO ↔ MyBatis 結果型マッピング（手書き / MapStruct）
- [ ] ロギング詳細（Logback + logstash-logback-encoder 構造化ログ）
- [ ] テスト関連（JUnit 5 + AssertJ + Mockito + TestContainers + RestAssured）
- [ ] Java 系 IDE 拡張（IntelliJ プラグイン / Eclipse + STS）
- [ ] Gradle 設定の標準化（Spring Boot Gradle Plugin、依存バージョン管理）
- [ ] Backend 用 Docker イメージ化（`gradle bootBuildImage` の活用可否、CIS Hardened JRE 採否）

上記が決まり次第、影響を受ける DD を再起こし（DD-051 以降として追記）、Backend 関連の discussion ドキュメント（`07-backend-stack.md` 等）と最終 spec を更新する。

## DD-051: 設計書ひな型を追加・拡張（画面一覧・コンポーネントツリー・値のソースマップ）

**決定**: 既存の章立てテンプレ群 (DD-016) に以下を追加・拡張する。

1. **`template-screen-list.md` を新規追加**（W2/A2 画面一覧・画面遷移図、**概要レベル**）
   - 全画面の ID / 名称 / URL / 種別 / 対象ロール / 関連 UC / 詳細リンク
   - 通常遷移図・例外遷移図（Mermaid）
   - ロール × 画面マトリクス
   - ナビゲーション構造（Web Vuetify / Android Ionic 別）
   - URL ルーティング規約
   - モーダル・ダイアログ一覧

2. **`template-screen-design.md` を拡張**（W3/A3 画面設計書、**詳細レベル**）
   - 新規 Section 5「コンポーネントツリー」追加: Mermaid graph + コンポーネント定義表（Props/Emits/種別/配置）+ Slots 公開構造
   - Section 7（旧）状態管理を拡張して「Section 8 状態管理 / 値のソースマップ」に改名
     - 8.1 ソースマップ: 各表示値について「ソース種別 / 具体的なストア・API・ストレージ」を明示
     - 8.2 ソース種別の凡例: Pinia / TanStack Query / URL / props / local / computed / JWT claim / LocalStorage / Capacitor Preferences / ENV
     - 8.3 状態遷移図（複雑な画面のみ）
   - 後続セクションを順次繰り下げ（旧 5〜14 → 新 6〜15）

**理由**:

- DD-016 の 5 ひな型では「概要 vs 詳細」の階層が暗黙だった。`template-screen-list.md` を独立させて Phase 2 早期に書くことを明示
- 業務系では「この値はどこから来るのか」（Pinia / TanStack Query / JWT 等）の混乱が頻繁。値のソースマップ強制化で実装着手前に整理可能
- Vue/Ionic 特有のコンポーネント親子構造は Mermaid で 1 画面 1 図化することでレビュー・引継ぎが容易になる

**代替案（不採用）**:

- `template-component-design.md` を W5/A6 専用に新規分離: 必要性はあるが優先度低。`template-internal-design.md` で代用可能なため将来検討に回す（Backend と Frontend を併存させる方が共通章立てが活きる）
- 状態管理を独立した `template-state-management.md` に分離: 画面ごとの参照頻度が高い「値のソースマップ」は画面設計書内にある方が動線が良い

---

## DD-052: W5/A6 専用 `template-component-design.md` を採用

**決定**: DD-051 で「将来検討」としていた W5/A6 Vue/Ionic 専用ひな型 `template-component-design.md` を採用する。`template-internal-design.md` は Backend (Spring) 主軸に位置付け直す。

**追加されるひな型の主な章立て**:

1. 設計方針（Atomic Design 分類、shared vs feature-specific）
2. ディレクトリ構造（Web / Android Ionic 追加）
3. コンポーネント一覧（ID 採番付き: CMP-V/L/O/S/M/A-NNN）
4. 主要コンポーネント詳細（Props/Emits/Slots/内部状態/利用 Composables/子コンポーネント）
5. Composables 一覧（引数・戻り値・責務）
6. 命名規約（SFC/Composable/Store/型/ファイル名）
7. スタイリング方針（Vuetify テーマ / Ionic CSS Variables）
8. 共通実装パターン（フォーム / 一覧 / モーダル / エラー）
9. アクセシビリティ規約
10. テスト方針

**ひな型の使い分け**:

- **W5 / A6**: `template-component-design.md`（Vue/Ionic 専用、推奨）
- **B3**: `template-internal-design.md`（Backend Spring 主軸、フロント共通モジュールにも兼用可）

**理由**:

- Vue/Ionic 特有の概念（Composables、SFC、Atomic Design 分類、Vuetify/Ionic スタイリング）を `template-internal-design.md` の汎用形式に押し込むと読み手の認知コストが高い
- Composables 一覧・命名規約・共通実装パターンは Vue/Ionic 固有の標準化が必要
- DD-051 で予告した「将来検討」を実施

**`template-internal-design.md` の位置付け修正**:

- 冒頭の説明を「Backend モジュール (Spring) 向け主軸ひな型。フロントの汎用モジュール（共通処理層・SDK ラッパー等）にも適用可」に改定
- 「Vue/Ionic フロントエンドのコンポーネント設計 (W5/A6) は専用の `template-component-design.md` を優先する」と注記

---

## DD-053: pre-commit hook ツール — lefthook 採用（Frontend / Backend 共通）

**決定**: 3 リポジトリ（Backend / Web / Android）すべてで **lefthook** を pre-commit / pre-push / commit-msg hook の共通ツールとして採用する。

**選定理由**:

- Go バイナリで言語非依存。Node 専用の husky や Python 専用の pre-commit と異なり、Backend (Java/Gradle) でもそのまま使える
- 設定が YAML 1 ファイル (`lefthook.yml`) で完結
- 並列実行サポートで pre-commit が高速
- `glob` フィルタで「変更ファイルだけ実行」が標準
- Approach C (DD-001) のチーム分離下でも、共通ツールにすることでオンボーディング・PR レビュー観点が揃う

**代替案（不採用）**:

- husky + lint-staged: Frontend 専用で Backend に流用しにくい
- pre-commit (Python): Python ランタイム前提が増える
- 生 .git/hooks: チーム間で揃わない・install 手順が複雑

**運用ルール**:

- 各リポジトリに `lefthook.yml` を配備
- 開発者は `lefthook install` を初回実行（CONTRIBUTING.md に記載）
- hook 内容: pre-commit (format/lint/typecheck/secret 検出) / pre-push (test) / commit-msg (Conventional Commits)

詳細サンプル: `docs/examples/lefthook/lefthook.yml`

---

## DD-054: Frontend Prettier 設定詳細 + editorconfig 採用

**決定**: Frontend (Web / Android) の Prettier 設定を以下で標準化する。各案件は `.prettierrc.json` をコピー配布。

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

加えて、IDE 非依存の最低限規約として **`.editorconfig`** を全リポジトリ（Backend 含む）に配備する。Java / Kotlin / Markdown 等の言語別 override を含む。

**理由**:

- DD-027 で「ESLint + Prettier 採用」を決めたが具体設定が暗黙だった。実装時の議論を避けるため明示化
- `.editorconfig` で IDE の最低限規約（改行コード LF、UTF-8、末尾改行）を IDE 種類を問わず担保
- Backend の Spotless との整合（行末改行、UTF-8）も `.editorconfig` で揃う

詳細サンプル: `docs/examples/prettier/.prettierrc.json` / `docs/examples/editorconfig/.editorconfig`

---

## DD-055: Backend 静的解析・カバレッジ — Spotless / Checkstyle / SpotBugs / ErrorProne / JaCoCo

**決定**: Backend (Java + Spring Boot + Gradle) で以下 5 ツールを採用する。

| ツール        | 用途                                                    | プラグイン                                   |
| ------------- | ------------------------------------------------------- | -------------------------------------------- |
| **Spotless**  | フォーマット強制（Google Java Format ベース）            | `com.diffplug.spotless`                      |
| **Checkstyle** | スタイル違反（Google Java Style ベース、案件向け緩和あり） | `checkstyle` (Gradle 標準)                   |
| **SpotBugs**  | バグパターン検出（+ FindSecBugs プラグイン）             | `com.github.spotbugs`                        |
| **ErrorProne** | Javac レベル追加チェック（null 安全等の追加可能）        | `net.ltgt.errorprone`                        |
| **JaCoCo**    | テストカバレッジ計測（目標: ライン 80% / ブランチ 80%）   | `jacoco` (Gradle 標準)                       |

集約タスク:

- `./gradlew staticAnalysis` — spotlessCheck + checkstyleMain + spotbugsMain + compileJava (ErrorProne)
- `./gradlew ciVerify` — staticAnalysis + test + jacocoTestReport + jacocoTestCoverageVerification

CI 配置:

- backend-ci.yml の `static` ジョブで spotlessCheck / checkstyleMain / spotbugsMain / compileJava を順次実行
- backend-ci.yml の `unit` ジョブで test + jacocoTestReport + 80% カバレッジ閾値検証
- レポート (HTML/XML) を artifact としてアップロード

**代替案（採用検討の上、不採用）**:

- **PMD**: Checkstyle / SpotBugs と検出ルールが重複。三重チェックは過剰
- **SonarQube / SonarCloud**: 統合解析として強力だが運用コスト・予算が必要。**将来検討**（案件規模次第）
- **Mutation Testing (Pitest)**: テスト品質向上に効くが学習コスト・実行時間が大きい。将来検討

**FindSecBugs プラグイン**: SpotBugs のセキュリティ拡張として併用採用（DD-048 のセキュリティ静的解析を Backend 側で強化）。

詳細サンプル:

- `docs/examples/gradle/static-analysis.gradle` — Gradle 標準設定
- `docs/examples/checkstyle/checkstyle.xml` — Checkstyle 設定

---

## 次のアクション

- Backend 詳細 DD（OpenAPI 生成方針、MyBatis 規約、Spring Security 設定、Spring Batch、Flyway、JUnit/TestContainers、CI/CD Gradle 化）を別セッションで議論・確定する
- 案件規模次第で SonarQube / SonarCloud 統合を将来検討
- 必要なら Mutation Testing (Pitest) を将来追加検討
- 実装ステップ（フェーズ定義 / 各フェーズで何を確定させるか）
- 技術選定の詳細比較（Vuetify3 vs PrimeVue vs Quasar、Ionic vs Capacitor 単体 vs 他）
- 開発環境（IDE、ローカルセットアップ、Docker、CI/CD）
- テスト方法（ユニット / 結合 / E2E / モバイル実機 / 性能 / セキュリティ）
