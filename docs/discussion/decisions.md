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

## 未決定論点（次に議論）

- 開発環境（Node/pnpm、IDE、CI/CD、Docker、ブランチ戦略、シークレット管理）
- 実装ステップ（フェーズ定義 / 各フェーズで何を確定させるか）
- 技術選定の詳細比較（Vuetify3 vs PrimeVue vs Quasar、Ionic vs Capacitor 単体 vs 他）
- 開発環境（IDE、ローカルセットアップ、Docker、CI/CD）
- テスト方法（ユニット / 結合 / E2E / モバイル実機 / 性能 / セキュリティ）
