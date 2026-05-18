# Playbook Artifacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** リポジトリのスペック群を実プロジェクトで即利用可能な「再利用アーティファクト集」へ拡充する。`docs/templates/`（章立てひな型）、`docs/examples/`（PR テンプレ・CI YAML・各種設定）、`docs/checklists/`（フェーズゲート・PR レビュー観点）の 3 ディレクトリに具体的成果物を埋める。

**Architecture:** 各アーティファクトは単独で参照可能・コピー可能。Markdown 文書（章立て＋短い例示）、設定ファイル（JSON/YAML/JS）、GitHub Actions YAML を含む。アプリケーション本体の Vue/Spring コードは含まない（本リポは設計プレイブック）。Backend 関連は DD-050 保留中のため、Backend-CI ワークフローは骨格のみ（gradle ジョブのコメント付きスケルトン）。

**Tech Stack:** Markdown / YAML / JSON / TypeScript config / GitHub Actions / Docker Compose / dotenv

---

## File Structure

新規作成ファイル一覧（全 28 ファイル）:

```
docs/
├── templates/
│   ├── README.md
│   ├── template-requirements.md
│   ├── template-screen-design.md
│   ├── template-internal-design.md
│   ├── template-test-spec.md
│   └── template-api-internal.md
├── examples/
│   ├── README.md
│   ├── github/
│   │   ├── pull_request_template.md
│   │   ├── ISSUE_TEMPLATE/
│   │   │   ├── bug_report.md
│   │   │   └── feature_request.md
│   │   └── workflows/
│   │       ├── web-ci.yml
│   │       ├── android-ci.yml
│   │       └── backend-ci.yml
│   ├── tsconfig/
│   │   └── tsconfig.base.json
│   ├── eslint/
│   │   └── eslint.config.js
│   ├── vscode/
│   │   ├── settings.json
│   │   └── extensions.json
│   ├── docker/
│   │   └── docker-compose.yml
│   ├── env/
│   │   └── .env.example
│   └── openapi/
│       └── error-response.yaml
└── checklists/
    ├── README.md
    ├── phase-gate-checklist.md
    ├── pr-review-checklist.md
    ├── api-change-checklist.md
    ├── release-checklist.md
    └── onboarding-checklist.md
```

修正ファイル: `README.md`、`docs/superpowers/specs/2026-05-19-vue-biz-app-design-spec.md`

## コミット境界

実装中は以下の単位でコミットする:

1. ディレクトリ構造 + 3 つの索引 README
2. 全 templates（5 ファイル）
3. GitHub 関連 examples（PR テンプレ + Issue テンプレ + 3 ワークフロー）
4. 設定系 examples（tsconfig / eslint / vscode）
5. インフラ系 examples（docker-compose / .env / openapi）
6. 全 checklists（5 ファイル）
7. ルート README + 最終 spec のリンク更新

---

## Task 1: ディレクトリ構造と索引 README を作成

**Files:**

- Create: `docs/templates/README.md`
- Create: `docs/examples/README.md`
- Create: `docs/checklists/README.md`

- [ ] **Step 1.1: ディレクトリを作成**

Run:

```bash
mkdir -p docs/templates docs/examples/github/ISSUE_TEMPLATE docs/examples/github/workflows docs/examples/tsconfig docs/examples/eslint docs/examples/vscode docs/examples/docker docs/examples/env docs/examples/openapi docs/checklists
```

- [ ] **Step 1.2: `docs/templates/README.md` を作成**

内容:

````markdown
# Templates — 設計書ひな型

各プロジェクト（Backend / Web / Android）で使う設計書の **章立てひな型**。Approach C のチーム独立性を保ちつつ、文書フォーマットだけ統一する（DD-016）。

## ひな型一覧

| ファイル                          | 想定使用箇所                        | 関連 DD                |
| --------------------------------- | ----------------------------------- | ---------------------- |
| `template-requirements.md`        | S1 / B1 / W1 / A1 の機能要件定義書 | DD-014, DD-015         |
| `template-screen-design.md`       | W3 / A3 の画面設計書                | DD-014                 |
| `template-internal-design.md`     | B3 / W5 / A6 の内部設計書           | DD-014                 |
| `template-test-spec.md`           | B8 / W7 / A8 のテスト仕様書         | DD-014, DD-041, DD-042 |
| `template-api-internal.md`        | B5 API 内部処理設計書                | DD-014, DD-010         |

## 使い方

1. 案件リポジトリ（`<案件>-backend` / `-web` / `-android`）に `docs/` ディレクトリを作成
2. 必要なひな型をコピー（または symlink）し、リネーム（例: `template-requirements.md` → `requirements-customer.md`）
3. プロジェクトに合わせて埋める
4. 案件内でひな型をさらにカスタマイズしてもよい（本リポは「最低限の枠組み」）

## 改善方針

ひな型は本リポの DD-014〜DD-022 と整合性を保つ。スコープ追加が必要なら、まず本リポでひな型を更新し、案件側に展開する。
````

- [ ] **Step 1.3: `docs/examples/README.md` を作成**

内容:

```markdown
# Examples — 設定・CI・契約の具体例

実プロジェクトにコピー&ペーストして使える具体的な設定ファイル・GitHub Actions ワークフロー・契約データ例。

## 一覧

| ディレクトリ                | 内容                                                                                |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `github/`                   | PR テンプレ、Issue テンプレ、CI ワークフロー (Web / Android / Backend)               |
| `tsconfig/`                 | TypeScript strict 設定の共通ベース (DD-026)                                          |
| `eslint/`                   | ESLint Flat Config 雛形 (DD-027)                                                    |
| `vscode/`                   | VS Code 共通設定・推奨拡張機能 (DD-034)                                              |
| `docker/`                   | ローカル開発用 Docker Compose (PostgreSQL + Redis)                                  |
| `env/`                      | `.env.example` (シークレットなし)                                                    |
| `openapi/`                  | RFC 7807 エラーレスポンス スキーマ例 (DD-010)                                       |

## 使い方

各ファイルは案件リポジトリの相応の位置にコピーする:

- `github/pull_request_template.md` → 案件リポ `.github/pull_request_template.md`
- `github/workflows/web-ci.yml` → Web 案件リポ `.github/workflows/ci.yml`（適宜リネーム）
- `tsconfig/tsconfig.base.json` → 案件リポ `tsconfig.base.json`（`tsconfig.json` から extends）
- `eslint/eslint.config.js` → 案件リポルート

## 注意

- Backend ワークフロー (`backend-ci.yml`) は **DD-050 保留中**のため、骨格（gradle ジョブのスケルトン）のみ。Spring 詳細決定後に詳細を埋める。
- 環境変数の値は **絶対に Git にコミットしない**。`.env.example` はキーのみ。
```

- [ ] **Step 1.4: `docs/checklists/README.md` を作成**

内容:

```markdown
# Checklists — 運用チェックリスト

プロジェクト運用の各場面で参照する確認項目集。フェーズゲート、PR レビュー、API 変更、リリース、新規参画者オンボーディング。

## 一覧

| ファイル                       | 使用タイミング                                |
| ------------------------------ | --------------------------------------------- |
| `phase-gate-checklist.md`      | 各フェーズ完了時のゲート判定                  |
| `pr-review-checklist.md`       | PR レビュー時の観点                           |
| `api-change-checklist.md`      | API 変更 PR 提案・レビュー時 (3 チーム合意手順) |
| `release-checklist.md`         | 本番リリース判定時                            |
| `onboarding-checklist.md`      | 新規参画者の初日〜1 週間                      |

## 使い方

GitHub Issue テンプレートと組み合わせて、関連 Issue / PR に該当チェックリストを貼り付ける運用が推奨。

## 改善方針

実プロジェクトで「足りなかった項目」「不要だった項目」を吸い上げて本リポへ還元する。プレイブックは継続改善する。
```

- [ ] **Step 1.5: コミット**

Run:

```bash
git add docs/templates/README.md docs/examples/README.md docs/checklists/README.md
git commit -m "$(cat <<'EOF'
プレイブック拡充のディレクトリ構造と索引 README を追加

- docs/templates/README.md
- docs/examples/README.md
- docs/checklists/README.md

各ディレクトリの目的・一覧・使い方を整理。後続タスクで各ディレクトリ
内の具体ファイル (ひな型 5 / examples 10 / checklists 5) を埋める。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: template-requirements.md（要件定義書ひな型）

**Files:**

- Create: `docs/templates/template-requirements.md`

- [ ] **Step 2.1: ファイル全内容を作成**

内容:

````markdown
# 要件定義書 — [プロジェクト名]

> このファイルは [vue-biz-app-design-spec/docs/templates/template-requirements.md](https://github.com/m-miyawaki-m/vue-biz-app-design-spec) を起点としたひな型。
> プロジェクトに合わせて埋める。空欄や TBD のままレビュー提出してはいけない。

## 0. 文書情報

| 項目     | 内容                          |
| -------- | ----------------------------- |
| 文書 ID   | RD-[YYYY-NNN]                |
| バージョン | 0.1.0                         |
| 作成日    | YYYY-MM-DD                    |
| 作成者    | [氏名]                        |
| 承認者    | [氏名]                        |
| 適用範囲  | [Backend / Web / Android / 共通] |

### 更新履歴

| バージョン | 日付       | 更新者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 0.1.0      | YYYY-MM-DD | [氏名] | 初版     |

---

## 1. 目的と対象範囲

### 1.1 目的

本文書は [対象システム] の要件を定義する。読者: PM・アーキテクト・開発リード・QA リード・ステークホルダー。

### 1.2 対象範囲

- 含むもの: [機能領域 / 業務範囲]
- 含まないもの: [スコープ外を明示]

### 1.3 用語

業務用語の詳細は **データ辞書 (S2)** を参照。本文書では主要用語のみ要約する。

| 用語           | 定義                                                |
| -------------- | --------------------------------------------------- |
| [業務用語1]    | [定義]                                              |

---

## 2. 業務概要

### 2.1 業務全体像

業務フロー図（Mermaid）:

```mermaid
flowchart LR
  A[業務イベント] --> B[アクション]
  B --> C[結果]
```

### 2.2 登場ロール

| ロール ID  | 名称            | 主要責務                                     |
| ---------- | --------------- | -------------------------------------------- |
| ROLE-001   | [担当者ロール]  | [責務]                                       |
| ROLE-002   | [管理者ロール]  | [責務]                                       |

---

## 3. ユースケース一覧

| UC ID    | 名称                    | 主アクター | 事前条件 | 事後条件 | 関連機能 ID  |
| -------- | ----------------------- | ---------- | -------- | -------- | ------------ |
| UC-001   | [ユースケース名]        | ROLE-001   | [条件]   | [結果]   | F-001, F-002 |

---

## 4. 機能要件

各機能は以下の章立てで記述する。

### F-NNN: [機能名]

| 項目        | 内容                                                          |
| ----------- | ------------------------------------------------------------- |
| 機能 ID      | F-NNN                                                         |
| 名称         | [機能名]                                                      |
| 概要         | [1-3 行で説明]                                                |
| 対象ロール   | ROLE-001, ROLE-002                                            |
| 関連 UC      | UC-NNN                                                        |
| 入力         | [入力データ・パラメータ。データ辞書 (S2) を参照]              |
| 処理         | [業務処理の流れ。業務ルールへのリンク]                        |
| 出力         | [出力データ・通知]                                            |
| 例外         | [異常系・業務エラー。エラーコード一覧 (S5) を参照]            |
| 優先度       | 必須 / 高 / 中 / 低                                           |
| 備考         | [補足]                                                        |

---

## 5. 業務ルール

| ルール ID | 名称                  | 内容                                              | 関連機能          |
| --------- | --------------------- | ------------------------------------------------- | ----------------- |
| BR-001    | [ルール名]            | [if ... then ... の論理規則]                      | F-001, F-002      |

---

## 6. 非機能要件

非機能要件の詳細は **非機能要件書 (S6)** を参照。本文書では本プロジェクト固有の追加要件のみ記載する。

| カテゴリ       | 要件                                              |
| -------------- | ------------------------------------------------- |
| 性能           | [API レスポンス 95%tile < 500ms 等]               |
| 可用性         | [99.9% 等]                                         |
| セキュリティ   | [認証/認可仕様書 (S4) に従う]                     |
| アクセシビリティ | [WCAG 2.1 AA 準拠等]                              |

---

## 7. 制約事項

| 制約 ID | 内容                                                            |
| ------- | --------------------------------------------------------------- |
| C-001   | [使用可能な OS / ブラウザ / 言語制約等]                          |
| C-002   | [既存システム連携の API バージョン制約等]                       |

---

## 8. 前提条件

- [前提条件 1: 例 / お客様側で X が稼働済みである]
- [前提条件 2]

---

## 9. 将来課題（本リリースでは見送り）

| 項目                    | 想定対応時期 |
| ----------------------- | ------------ |
| [機能 X の追加]         | 次フェーズ   |

---

## 10. 関連ドキュメント

- 業務要件定義書 (共有部分): S1
- データ辞書: S2
- API 仕様書: S3
- 認証/認可仕様書: S4
- 業務エラーコード一覧: S5
- 非機能要件書: S6
- 画面設計書: W3 / A3
- 内部設計書: B3 / W5 / A6
````

- [ ] **Step 2.2: ファイル整合確認**

Run:

```bash
test -f docs/templates/template-requirements.md && echo "OK: file exists" || echo "NG: file missing"
wc -l docs/templates/template-requirements.md
```

Expected: ファイル存在、行数 約 170 行

---

## Task 3: template-screen-design.md（画面設計書ひな型）

**Files:**

- Create: `docs/templates/template-screen-design.md`

- [ ] **Step 3.1: ファイル全内容を作成**

内容:

````markdown
# 画面設計書 — [画面名]

> ひな型: vue-biz-app-design-spec/docs/templates/template-screen-design.md
> Web (Vuetify3) / Android (Ionic) のいずれにも適用可。コンポーネント割当の章で Vuetify / Ionic を選択する。

## 0. 文書情報

| 項目         | 内容                            |
| ------------ | ------------------------------- |
| 文書 ID       | SD-[YYYY-NNN]                  |
| バージョン    | 0.1.0                           |
| 作成日        | YYYY-MM-DD                      |
| 作成者        | [氏名]                          |
| 対象プラットフォーム | Web / Android                   |

### 更新履歴

| バージョン | 日付       | 更新者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 0.1.0      | YYYY-MM-DD | [氏名] | 初版     |

---

## 1. 画面情報

| 項目        | 内容                              |
| ----------- | --------------------------------- |
| 画面 ID      | SCR-[NNN]                         |
| 画面名       | [日本語名]                        |
| 識別名       | [英語キャメル: customerListPage]  |
| URL          | /customers                       |
| 関連 UC      | UC-001, UC-002                    |
| 対象ロール   | ROLE-001                          |

---

## 2. 画面概要

### 2.1 利用シーン

[いつ、誰が、何のために使う画面か]

### 2.2 主要機能サマリ

- [機能1: 検索]
- [機能2: 一覧表示]
- [機能3: 新規作成導線]

---

## 3. 画面遷移

```mermaid
flowchart LR
  PREV[前画面] --> THIS[この画面]
  THIS -->|新規| CREATE[作成画面]
  THIS -->|行クリック| DETAIL[詳細画面]
```

| 遷移元 → 先 | トリガー | 条件 |
| ----------- | -------- | ---- |
| ログイン画面 → この画面 | ログイン成功 | 認証成功 + ロール=ROLE-001 |
| この画面 → 詳細画面 | 行クリック | — |

---

## 4. レイアウト

ワイヤーフレーム (画像 or Mermaid):

```mermaid
graph TB
  subgraph 画面全体
    HEADER[ヘッダー: アプリ名・ユーザーメニュー]
    SEARCH[検索バー]
    TABLE[データテーブル]
    PAGINATION[ページネーション]
    FAB[新規作成 FAB ボタン]
  end
```

レイアウトの方針:

- 検索バー（上部固定）→ テーブル（メイン）→ ページネーション（下部）
- FAB は右下固定（モバイル時）/ 検索バー横に「新規」ボタン（Web 時）

---

## 5. 項目定義

| 項目 ID  | 名称       | 種別         | 型・桁         | 必須 | 初期値 | バリデーション                                       | コンポーネント        | 備考             |
| -------- | ---------- | ------------ | -------------- | ---- | ------ | ---------------------------------------------------- | --------------------- | ---------------- |
| F-001    | 顧客コード | 検索入力     | string(20)     | -    | -      | 半角英数のみ                                         | v-text-field          | データ辞書: CUSTOMER_CODE |
| F-002    | 顧客名     | 検索入力     | string(100)    | -    | -      | -                                                    | v-text-field          | 部分一致         |
| F-003    | 状態       | 検索プルダウン | enum           | -    | 全て   | -                                                    | v-select              | コード値: S2 参照 |
| F-004    | 検索ボタン | アクション   | -              | -    | -      | -                                                    | v-btn                 | F-005 を実行     |
| F-005    | 検索結果   | テーブル     | 顧客情報の配列 | -    | -      | -                                                    | v-data-table-server   | サーバーサイドページング |

### 5.1 テーブル列定義（F-005）

| 列 ID    | 列名       | 型       | ソート | フィルタ | アクション   |
| -------- | ---------- | -------- | ------ | -------- | ------------ |
| C-001    | 顧客コード | string   | ◯     | -        | クリックで詳細遷移 |
| C-002    | 顧客名     | string   | ◯     | -        | -            |
| C-003    | 状態       | enum     | ◯     | ◯       | バッジ表示   |
| C-004    | 更新日時   | datetime | ◯     | -        | YYYY/MM/DD HH:mm |

---

## 6. アクション一覧

| アクション ID | トリガー               | 処理                                         | 呼び出し API             |
| ------------- | ---------------------- | -------------------------------------------- | ------------------------ |
| A-001         | 検索ボタンクリック     | F-001〜F-003 で API 呼出、F-005 を更新       | GET /v1/customers?...    |
| A-002         | ページネーション変更   | API 呼出（page/perPage を変えて）            | GET /v1/customers?...    |
| A-003         | FAB クリック           | 新規作成画面へ遷移                            | -                        |
| A-004         | 行クリック             | 詳細画面へ遷移（顧客 ID をパラメータ）        | -                        |

---

## 7. 状態管理

| 状態 ID    | 名称              | 種別               | 管理場所            |
| ---------- | ----------------- | ------------------ | ------------------- |
| ST-001     | 検索条件          | フォーム下書き     | Pinia               |
| ST-002     | 検索結果一覧      | サーバーキャッシュ | TanStack Query      |
| ST-003     | ローディング状態   | サーバー状態        | TanStack Query (isFetching) |
| ST-004     | エラー状態         | サーバー状態        | TanStack Query (error)      |

---

## 8. API 連携

| API ID         | エンドポイント            | 用途                  | 関連画面項目  |
| -------------- | ------------------------- | --------------------- | ------------- |
| API-CUST-001   | GET /v1/customers          | 一覧取得・検索        | F-005         |

API スキーマ詳細は **S3 API 仕様書** を参照。

---

## 9. エラー処理

| エラー種別     | 画面表示                                                | 関連エラーコード      |
| -------------- | ------------------------------------------------------- | --------------------- |
| 認証切れ (401) | ログイン画面へ自動遷移                                  | E-AUTH-002            |
| 権限不足 (403) | エラーメッセージ表示 + 前画面へ戻る                       | E-AUTH-003            |
| サーバーエラー (5xx) | スナックバー表示「サーバーエラーが発生しました」+ リトライ | E-SYS-001             |
| バリデーションエラー (400) | 該当項目にエラーメッセージ表示                    | E-CUSTOMER-*          |

業務エラーコードは **S5 業務エラーコード一覧** を参照。

---

## 10. アクセシビリティ・キーボード操作

| 操作                   | キー                       |
| ---------------------- | -------------------------- |
| 検索実行               | Enter                      |
| 検索条件クリア          | Escape                     |
| 行間移動                | ↑ / ↓                      |
| 新規作成画面へ          | Alt + N                    |

ARIA 属性:

- `v-data-table` の各セルに `role="cell"` + 列見出しと関連付け
- ローディング中は `aria-busy="true"`

---

## 11. レスポンシブ対応 (Web のみ)

| 画面幅                    | レイアウト変化                                |
| ------------------------- | --------------------------------------------- |
| ≥ 1280px (デスクトップ)    | サイドバー表示・テーブル全列表示              |
| 960-1279px (タブレット)    | サイドバー折りたたみ・テーブル列省略可        |
| < 960px (モバイル/簡易閲覧) | カードリスト表示に切替                         |

---

## 12. Android 固有 (該当時)

| 項目                   | 内容                                              |
| ---------------------- | ------------------------------------------------- |
| Ionic ナビ構造          | Tab 配下のスタック [Tab=顧客] / [Stack=一覧→詳細] |
| プルダウンリフレッシュ   | あり (`ion-refresher`)                            |
| 無限スクロール          | あり (`ion-infinite-scroll`)                      |
| ハードウェアバック       | スタックポップで前画面復帰                         |

---

## 13. 補足事項

- [補足や検討中の事項を残す]

---

## 14. 関連ドキュメント

- W2 画面一覧・画面遷移図
- W4 状態管理設計書
- W5 コンポーネント設計書
- S3 API 仕様書
- S5 業務エラーコード一覧
````

- [ ] **Step 3.2: ファイル整合確認**

Run:

```bash
test -f docs/templates/template-screen-design.md && echo "OK"
```

---

## Task 4: template-internal-design.md（内部設計書ひな型）

**Files:**

- Create: `docs/templates/template-internal-design.md`

- [ ] **Step 4.1: ファイル全内容を作成**

内容:

````markdown
# 内部設計書 — [モジュール/コンポーネント名]

> ひな型: vue-biz-app-design-spec/docs/templates/template-internal-design.md
> Backend モジュール / Web コンポーネント群 / Android ページ群 のいずれにも適用可。

## 0. 文書情報

| 項目        | 内容                                  |
| ----------- | ------------------------------------- |
| 文書 ID      | ID-[YYYY-NNN]                        |
| バージョン   | 0.1.0                                 |
| 作成日       | YYYY-MM-DD                            |
| 作成者       | [氏名]                                |
| 対象範囲     | [Backend モジュール / Web 画面群 / Android 画面群] |

---

## 1. 対象モジュール / コンポーネント

| 項目     | 内容                                                            |
| -------- | --------------------------------------------------------------- |
| 識別 ID   | MOD-[NNN]                                                       |
| 名称      | [モジュール名 / コンポーネント名]                               |
| 種別      | NestJS Module / Spring @Service / Vue コンポーネント / Composable |
| 配置場所  | [src/modules/customer/]                                         |

---

## 2. 責務

### 2.1 概要

[このモジュールが負う責務を 2-4 行で]

### 2.2 やること

- [責務1]
- [責務2]

### 2.3 やらないこと（責務外）

- [明示的な責務外項目1]
- [明示的な責務外項目2]

---

## 3. 公開インターフェース

### 3.1 関数/メソッド/コンポーネント

| 名前           | シグネチャ                                                     | 用途                            |
| -------------- | -------------------------------------------------------------- | ------------------------------- |
| `findById`     | `(id: CustomerId): Promise<Customer>`                          | 顧客 ID で 1 件取得              |
| `search`       | `(criteria: SearchCriteria): Promise<Paged<Customer>>`         | 条件検索（ページング付き）       |

### 3.2 型定義

```typescript
type CustomerId = string & { readonly __brand: 'CustomerId' };

interface SearchCriteria {
  code?: string;
  name?: string;
  status?: CustomerStatus;
  page: number;
  perPage: number;
}

interface Paged<T> {
  items: readonly T[];
  total: number;
  page: number;
  perPage: number;
}
```

---

## 4. 依存関係

| 依存先        | 種別          | 用途                                |
| ------------- | ------------- | ----------------------------------- |
| `PrismaClient` | 外部ライブラリ | DB アクセス                         |
| `Logger`      | 内部           | 構造化ログ出力                       |
| `EventBus`    | 内部           | 顧客状態変更イベント発行             |

依存関係図 (Mermaid):

```mermaid
flowchart TB
  Controller[CustomerController] --> Service[CustomerService]
  Service --> Repo[CustomerRepository]
  Service --> Bus[EventBus]
  Repo --> Prisma[PrismaClient]
```

---

## 5. 内部処理フロー

主要処理のシーケンス図:

```mermaid
sequenceDiagram
  participant C as Controller
  participant S as Service
  participant R as Repository
  participant B as EventBus
  C->>S: search(criteria)
  S->>R: findManyWithCount(criteria)
  R-->>S: { items, total }
  S->>S: validate (Zod)
  S-->>C: Paged<Customer>
  Note over S,B: 状態変更時のみイベント発行
```

---

## 6. データ構造（内部状態）

[モジュールが保持する内部状態があれば記載]

| 状態名      | 型                    | 初期値 | 用途                              |
| ----------- | --------------------- | ------ | --------------------------------- |
| `cache`     | `Map<CustomerId, Customer>` | `new Map()` | 直近取得した顧客のメモリキャッシュ |

---

## 7. 例外処理

| 例外クラス                    | 発生条件                          | 処理                                          |
| ----------------------------- | --------------------------------- | --------------------------------------------- |
| `CustomerNotFoundException`   | 指定 ID の顧客なし                | 404 + errorCode `E-CUSTOMER-404` を返却        |
| `ValidationException`         | Zod 検証エラー                    | 400 + RFC 7807 Problem Details を返却         |
| 想定外例外                    | -                                 | Logger.error + 500 + errorCode `E-SYS-500`    |

---

## 8. ログ出力

| イベント       | レベル | 構造化フィールド                                | 監査対象 |
| -------------- | ------ | ----------------------------------------------- | -------- |
| 検索実行       | INFO   | `userId`, `criteria`, `resultCount`             | -        |
| 詳細取得       | INFO   | `userId`, `customerId`                          | -        |
| 顧客状態更新   | INFO   | `userId`, `customerId`, `oldStatus`, `newStatus` | ◯       |

ログ規約は **B6 ログ・監査ログ設計書** に従う。

---

## 9. 性能考慮事項

| 項目              | 想定値                                  | 対応                                                  |
| ----------------- | --------------------------------------- | ----------------------------------------------------- |
| 検索 RPS           | 100 RPS                                 | Prisma クエリにインデックス必須 (`code`, `status`)      |
| 一覧データボリューム | 1 ページあたり 50 件、総 100K 件          | サーバーサイドページング・キーセットページング検討     |
| 詳細取得レイテンシ  | p95 < 200ms                              | キャッシュ層導入（Redis）検討                          |

---

## 10. テスト方針

- 単体: `findById` / `search` / `update` の正常系・例外系
- 結合: テスト DB (Docker) + 実 Prisma で repository 層含めて検証
- カバレッジ目標: ステートメント・ブランチとも 80% (DD-042)

詳細は **B8 / W7 / A8 テスト仕様書** を参照。

---

## 11. 関連ドキュメント

- 機能要件: F-[NNN]
- API 仕様: S3
- DB 設計: B2 (Backend のみ)
- テスト仕様: B8 / W7 / A8
````

- [ ] **Step 4.2: ファイル整合確認**

Run: `test -f docs/templates/template-internal-design.md && echo OK`

---

## Task 5: template-test-spec.md（テスト仕様書ひな型）

**Files:**

- Create: `docs/templates/template-test-spec.md`

- [ ] **Step 5.1: ファイル全内容を作成**

内容:

````markdown
# テスト仕様書 — [対象モジュール/画面]

> ひな型: vue-biz-app-design-spec/docs/templates/template-test-spec.md

## 0. 文書情報

| 項目     | 内容                                  |
| -------- | ------------------------------------- |
| 文書 ID   | TS-[YYYY-NNN]                        |
| バージョン | 0.1.0                                 |
| 作成日    | YYYY-MM-DD                            |
| 作成者    | [氏名]                                |
| 対象範囲  | [Backend モジュール / Web 画面 / Android 画面] |

---

## 1. 対象範囲

### 1.1 含むもの

- [機能 F-NNN]
- [画面 SCR-NNN]
- [API API-NNN]

### 1.2 含まないもの

- [スコープ外を明示]

---

## 2. テスト計画概要

### 2.1 テストレベル別の戦略

| レベル          | 担当                  | 目的                                      | カバレッジ目標 (DD-042) |
| --------------- | --------------------- | ----------------------------------------- | ----------------------- |
| 静的検査         | CI                    | typecheck / lint / format / Secret 検出   | 100% (CI 必須)           |
| 単体テスト       | 各開発者              | 関数・コンポーネント単位の挙動            | 80% (ロジック) / 70% (UI) |
| 結合テスト       | 各チーム              | モジュール間・API ↔ DB                     | 全 API 1 シナリオ以上    |
| 契約テスト       | CI                    | OpenAPI ↔ 生成型 ↔ Zod 検証                | 全エンドポイント         |
| E2E             | QA + 開発             | 主要業務フロー全体                         | 黄金パス 100% / 例外 80% |
| 性能テスト       | QA / SRE              | 非機能要件 (S6) 達成検証                  | S6 準拠                  |
| セキュリティ     | QA / Security         | 静的・動的・依存脆弱性                     | Critical/High ゼロ        |
| 実機テスト       | QA                    | デバイスマトリクス全件                     | 必須デバイス 100%        |

---

## 3. テスト環境

| 環境     | 用途                  | アクセス                              |
| -------- | --------------------- | ------------------------------------- |
| local    | 開発者ローカル        | 各 PC                                 |
| dev      | 開発統合              | https://dev.example.com               |
| staging  | UAT 環境              | https://stg.example.com               |
| ローカル DB | 結合テスト            | Docker Compose (PostgreSQL 16)        |
| MSW      | 単体・コンポーネント   | フロント開発時のモック                 |
| Prism     | 結合テスト             | OpenAPI モックサーバー (CI)            |

---

## 4. テストデータ

### 4.1 単体・コンポーネント

各テストでファクトリーにて生成（インライン）。例:

```typescript
const customer = makeCustomer({ code: 'C001', status: 'active' });
```

### 4.2 結合・E2E

Seed スクリプトで投入。各テストはトランザクション ROLLBACK で初期化。

### 4.3 性能テスト

本番相当ボリュームの合成データを別途生成。**本番データのコピー禁止 (DD-049)**。

---

## 5. テストケース一覧

| ID     | カテゴリ | レベル | 前提条件                | 手順                                              | 期待結果                                  | 自動/手動 | 担当 | 状態     |
| ------ | -------- | ------ | ----------------------- | ------------------------------------------------- | ----------------------------------------- | --------- | ---- | -------- |
| TC-001 | 正常系   | 単体   | -                       | findById に存在する ID を渡す                     | Customer オブジェクト返却                  | 自動      | [氏名] | 未実施    |
| TC-002 | 例外系   | 単体   | -                       | findById に存在しない ID を渡す                   | CustomerNotFoundException 発生             | 自動      | [氏名] | 未実施    |
| TC-003 | 正常系   | E2E    | ログイン済み (ROLE-001)  | 検索バーに「C001」入力 → 検索 → 1 行表示確認       | 顧客 C001 が一覧に表示される               | 自動      | [氏名] | 未実施    |

---

## 6. テスト実施記録

各テストケース実施時に以下を記入:

| TC ID  | 実施日     | 実施者 | 結果 | エビデンス     | 不具合 ID |
| ------ | ---------- | ------ | ---- | -------------- | --------- |
| TC-001 | YYYY-MM-DD | [氏名] | OK   | [リンク/Issue] | -         |

---

## 7. 合否基準

| 項目                          | 基準                                  |
| ----------------------------- | ------------------------------------- |
| 全テストケース実施率           | 100%                                  |
| Critical/High 不具合解消        | 0 件                                  |
| カバレッジ                    | DD-042 目標達成                       |
| 非機能要件達成 (Phase 6)       | S6 全項目達成                         |

---

## 8. 不具合記録

GitHub Issues で起票・管理 (DD-037)。
ラベル: `bug` + `severity:critical|high|medium|low` + `area:backend|web|android`

---

## 9. 関連ドキュメント

- 機能要件: B1 / W1 / A1
- 内部設計: B3 / W5 / A6
- API 仕様: S3
- 業務エラーコード一覧: S5
- 非機能要件: S6
````

- [ ] **Step 5.2: ファイル整合確認**

Run: `test -f docs/templates/template-test-spec.md && echo OK`

---

## Task 6: template-api-internal.md（API 内部処理設計書ひな型）

**Files:**

- Create: `docs/templates/template-api-internal.md`

- [ ] **Step 6.1: ファイル全内容を作成**

内容:

````markdown
# API 内部処理設計書 — [エンドポイント]

> ひな型: vue-biz-app-design-spec/docs/templates/template-api-internal.md
> 1 エンドポイント = 1 ファイル を推奨。エンドポイント数が多い場合は機能領域ごとにまとめてもよい。

## 0. 文書情報

| 項目     | 内容                       |
| -------- | -------------------------- |
| 文書 ID   | API-INT-[YYYY-NNN]        |
| バージョン | 0.1.0                      |
| 作成日    | YYYY-MM-DD                 |
| 作成者    | [氏名]                     |

---

## 1. エンドポイント情報

| 項目         | 内容                                              |
| ------------ | ------------------------------------------------- |
| メソッド      | GET / POST / PUT / PATCH / DELETE                |
| パス          | /v1/customers                                    |
| API バージョン | v1                                                |
| 認証          | 要 (Bearer JWT, ROLE-001 以上)                    |
| Idempotency  | はい / いいえ                                     |
| 関連機能     | F-001 (顧客一覧)                                  |

---

## 2. 概要と業務処理

[このエンドポイントが何の業務処理を行うかを 3-5 行で]

業務処理フロー:

1. リクエストパラメータを Bean Validation (Backend) で検証
2. 認証トークンから userId / role を取得
3. ロールに応じた可視範囲フィルタを構築
4. データアクセス層（MyBatis Mapper）で検索
5. 結果を DTO に詰めて返却

---

## 3. リクエスト

### 3.1 パスパラメータ

| 名前  | 型      | 必須 | 説明               | 制約         |
| ----- | ------- | ---- | ------------------ | ------------ |
| (なし) |         |      |                    |              |

### 3.2 クエリパラメータ

| 名前         | 型      | 必須 | 既定値 | 説明               | バリデーション                       |
| ------------ | ------- | ---- | ------ | ------------------ | ------------------------------------ |
| code         | string  | -    | -      | 顧客コード（前方一致） | 半角英数 / 1-20 桁                    |
| name         | string  | -    | -      | 顧客名（部分一致）  | 1-100 文字                           |
| status       | enum    | -    | all    | 状態フィルタ        | active / inactive / all              |
| page         | int     | -    | 1      | ページ番号          | ≥ 1                                  |
| perPage      | int     | -    | 50     | 1 ページ件数        | 1-100                                |

### 3.3 リクエストボディ

該当なし（GET なら不要）。POST/PUT の場合:

```typescript
interface CreateCustomerRequest {
  code: string;        // 半角英数 1-20
  name: string;        // 1-100 文字
  status: 'active' | 'inactive';
}
```

### 3.4 ヘッダー

| 名前            | 必須 | 値                         |
| --------------- | ---- | -------------------------- |
| Authorization   | 必須 | `Bearer <JWT>`             |
| X-Request-Id    | 任意 | リクエスト追跡用 UUID     |

---

## 4. レスポンス

### 4.1 成功時 (200 OK)

```typescript
interface CustomerListResponse {
  items: Customer[];
  total: number;
  page: number;
  perPage: number;
}

interface Customer {
  id: string;
  code: string;
  name: string;
  status: 'active' | 'inactive';
  updatedAt: string;   // ISO 8601
}
```

### 4.2 エラー時 (RFC 7807 — DD-010)

| HTTP   | errorCode             | type                                          | title             | 発生条件                       |
| ------ | --------------------- | --------------------------------------------- | ----------------- | ------------------------------ |
| 400    | E-CUSTOMER-001        | https://example.com/errors/validation         | Validation Error  | クエリパラメータ違反            |
| 401    | E-AUTH-001            | https://example.com/errors/auth/missing-token | Missing Token     | Authorization ヘッダーなし     |
| 401    | E-AUTH-002            | https://example.com/errors/auth/expired-token | Expired Token     | JWT 期限切れ                    |
| 403    | E-AUTH-003            | https://example.com/errors/auth/forbidden     | Forbidden         | ロール不足                      |
| 500    | E-SYS-500             | https://example.com/errors/system             | Server Error      | 想定外例外                      |

レスポンス例 (400):

```json
{
  "type": "https://example.com/errors/validation",
  "title": "Validation Error",
  "status": 400,
  "detail": "perPage は 1〜100 の範囲で指定してください",
  "instance": "/v1/customers?perPage=999",
  "errorCode": "E-CUSTOMER-001",
  "errors": [{ "field": "perPage", "message": "1-100" }]
}
```

---

## 5. 処理フロー

```mermaid
sequenceDiagram
  participant CL as Client
  participant CT as Controller
  participant SV as Service
  participant MP as Mapper
  participant DB as DB

  CL->>CT: GET /v1/customers?code=...
  CT->>CT: Bean Validation (or Zod)
  CT->>SV: search(criteria, principal)
  SV->>SV: ロール別可視範囲フィルタ構築
  SV->>MP: selectByCondition(query)
  MP->>DB: SELECT ... WHERE ...
  DB-->>MP: rows
  MP-->>SV: List<CustomerEntity>
  SV->>SV: DTO 変換 (MapStruct)
  SV-->>CT: Paged<CustomerDto>
  CT-->>CL: 200 OK + JSON
```

---

## 6. 認証・認可

| 項目              | 内容                                              |
| ----------------- | ------------------------------------------------- |
| 認証方式          | Bearer JWT (DD-011)                               |
| 必要ロール        | ROLE-001 (担当者) または ROLE-002 (管理者)         |
| 認可ルール        | 自身の部署の顧客のみ閲覧可。ROLE-002 は全件可。   |
| Spring Security 設定 | `@PreAuthorize("hasAnyRole('ROLE-001', 'ROLE-002')")` |

---

## 7. データアクセス (Backend のみ)

| Mapper                  | メソッド             | SQL ID                       | 備考                          |
| ----------------------- | -------------------- | ---------------------------- | ----------------------------- |
| CustomerMapper          | selectByCondition    | `customer.selectByCondition` | 条件部は `<if>` で動的構築    |
| CustomerMapper          | countByCondition     | `customer.countByCondition`  | total 件数取得                 |

SQL マッピング XML の格納場所: `src/main/resources/mapper/CustomerMapper.xml`

---

## 8. トランザクション境界

| 範囲     | 内容                                  |
| -------- | ------------------------------------- |
| Service層 | `@Transactional(readOnly = true)`      |
| 例外時   | 自動 ROLLBACK                          |

---

## 9. 例外マッピング

| 内部例外                          | 外部レスポンス                         | ハンドラ                                |
| --------------------------------- | -------------------------------------- | --------------------------------------- |
| `MethodArgumentNotValidException` | 400 + RFC 7807 + E-CUSTOMER-001         | `@ControllerAdvice`                     |
| `AccessDeniedException`           | 403 + E-AUTH-003                       | Spring Security ExceptionHandler        |
| `DataIntegrityViolationException` | 409 + E-CUSTOMER-409                   | `@ControllerAdvice`                     |
| `Exception` (catchall)            | 500 + E-SYS-500                        | `@ControllerAdvice` (最終 fallback)     |

---

## 10. ログ・監査

| イベント        | レベル | フィールド                                       | 監査対象 |
| --------------- | ------ | ------------------------------------------------ | -------- |
| API 呼出開始     | INFO   | `traceId`, `userId`, `endpoint`, `params`        | -        |
| 検索成功        | INFO   | `traceId`, `userId`, `resultCount`               | -        |
| バリデーション失敗| WARN   | `traceId`, `userId`, `errors`                    | -        |
| 想定外例外      | ERROR  | `traceId`, `userId`, `exception`, `stackTrace`   | -        |

---

## 11. 性能注記

| 項目                  | 目標値                       | 対策                                                       |
| --------------------- | ---------------------------- | ---------------------------------------------------------- |
| p95 レイテンシ         | < 300ms                       | インデックス (code, status, updated_at)、N+1 撲滅            |
| 同時 RPS               | 200 RPS                       | DB コネクションプール、レプリカ参照                          |
| ページサイズ最大       | 100                           | リクエストで制限。超過は 400 を返す                          |

---

## 12. テスト観点

- 単体: 各バリデーションパターン、各エラーマッピング
- 結合: 実 DB を使った検索、ロール別フィルタの効き方
- E2E: 検索シナリオ（黄金パス）+ 認証切れ（401）+ ロール不足（403）

詳細は **B8 Backend テスト仕様書** を参照。

---

## 13. 関連ドキュメント

- API 仕様（自動生成）: S3
- データ辞書: S2
- 認証仕様: S4
- 業務エラーコード: S5
- 内部設計（モジュール）: B3
````

- [ ] **Step 6.2: ファイル整合確認**

Run: `test -f docs/templates/template-api-internal.md && echo OK`

---

## Task 7: テンプレート一括コミット

- [ ] **Step 7.1: コミット**

Run:

```bash
git add docs/templates/template-requirements.md docs/templates/template-screen-design.md docs/templates/template-internal-design.md docs/templates/template-test-spec.md docs/templates/template-api-internal.md
git commit -m "$(cat <<'EOF'
設計書ひな型 5 種を追加 (DD-016 の実体化)

- template-requirements.md: S1/B1/W1/A1 要件定義書ひな型
- template-screen-design.md: W3/A3 画面設計書ひな型 (Vuetify/Ionic 両対応)
- template-internal-design.md: B3/W5/A6 内部設計書ひな型
- template-test-spec.md: B8/W7/A8 テスト仕様書ひな型
- template-api-internal.md: B5 API 内部処理設計書ひな型 (RFC 7807 例含む)

DD-014〜DD-022 と整合する章立て。Backend 部分は MyBatis + Spring Security
を前提とした例示を含む (DD-050)。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 8: GitHub PR テンプレート + Issue テンプレート

**Files:**

- Create: `docs/examples/github/pull_request_template.md`
- Create: `docs/examples/github/ISSUE_TEMPLATE/bug_report.md`
- Create: `docs/examples/github/ISSUE_TEMPLATE/feature_request.md`

- [ ] **Step 8.1: PR テンプレートを作成**

ファイル `docs/examples/github/pull_request_template.md`:

```markdown
## 概要

(変更内容を 1-3 行)

## 関連 Issue

- closes #

## 変更タイプ

- [ ] feature (新機能)
- [ ] fix (バグ修正)
- [ ] refactor (リファクタリング)
- [ ] chore (環境・依存・ビルド)
- [ ] docs (ドキュメント)
- [ ] test (テスト追加・修正のみ)

## 影響範囲

- area: [ ] backend / [ ] web / [ ] android / [ ] shared (OpenAPI 等)
- 破壊的変更: [ ] あり / [ ] なし

## 動作確認

- [ ] 単体テスト追加・更新
- [ ] ローカルで動作確認
- [ ] 影響範囲のリグレッションを目視確認
- [ ] (API 変更ありの場合) 3 チーム合意済み — チェックリスト参照: `docs/checklists/api-change-checklist.md`

## レビュアー向けメモ

(注目してほしい点・トレードオフ・あえて選ばなかった選択肢)

## スクリーンショット / ログ (該当時)

(UI 変更ならスクショ、Backend なら関連ログ抜粋)
```

- [ ] **Step 8.2: bug_report.md を作成**

ファイル `docs/examples/github/ISSUE_TEMPLATE/bug_report.md`:

```markdown
---
name: Bug report
about: 不具合を報告する
title: '[Bug] '
labels: 'bug'
assignees: ''
---

## 概要

(不具合内容を 1-3 行)

## 再現手順

1.
2.
3.

## 期待される挙動

## 実際の挙動

## 環境

- OS:
- ブラウザ / 端末:
- バージョン:

## Severity (推定)

- [ ] Critical (業務停止・データ破損)
- [ ] High (主要機能が動作不能)
- [ ] Medium (機能制限あり、回避策あり)
- [ ] Low (UI 細部・軽微な表示崩れ)

## 関連 area

- [ ] backend
- [ ] web
- [ ] android
- [ ] shared (API/契約)

## ログ・スクリーンショット

(該当時)
```

- [ ] **Step 8.3: feature_request.md を作成**

ファイル `docs/examples/github/ISSUE_TEMPLATE/feature_request.md`:

```markdown
---
name: Feature request
about: 機能追加・改善を提案する
title: '[Feature] '
labels: 'enhancement'
assignees: ''
---

## 提案内容

(何を追加・改善したいか)

## 解決したい課題 / 背景

(なぜこの提案が必要か。業務シナリオを含めると良い)

## 想定されるユーザー / ロール

## スコープ

- 含むもの:
- 含まないもの:

## 関連 area

- [ ] backend
- [ ] web
- [ ] android
- [ ] shared (API/契約)

## 受け入れ条件 (Acceptance Criteria)

- [ ] [条件1]
- [ ] [条件2]

## 代替案 / 検討した他の方法

## 補足
```

- [ ] **Step 8.4: ファイル整合確認**

Run:

```bash
test -f docs/examples/github/pull_request_template.md && test -f docs/examples/github/ISSUE_TEMPLATE/bug_report.md && test -f docs/examples/github/ISSUE_TEMPLATE/feature_request.md && echo OK
```

---

## Task 9: web-ci.yml (Web 用 GitHub Actions)

**Files:**

- Create: `docs/examples/github/workflows/web-ci.yml`

- [ ] **Step 9.1: ファイル全内容を作成**

内容:

```yaml
name: Web CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *' # 毎日 0:00 UTC に openapi-sync-check を回す

permissions:
  contents: read
  pull-requests: write

jobs:
  static:
    name: Static checks (typecheck / lint / format)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm format:check

  unit:
    name: Unit tests
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-web
          path: coverage/

  component:
    name: Component tests (Vue Test Utils + MSW)
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:component

  e2e:
    name: E2E tests (Playwright)
    needs: [unit, component]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  openapi-sync-check:
    name: OpenAPI sync check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Download latest OpenAPI from Backend Releases
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release download --repo m-miyawaki-m/[BACKEND_REPO_NAME] --pattern 'openapi.yaml' -O openapi-latest.yaml
      - name: Regenerate orval client
        run: pnpm orval --config orval.config.ts
      - name: Verify no diff
        run: |
          if ! git diff --exit-code -- src/api/generated; then
            echo "::error::orval 生成済みファイルが OpenAPI 最新と乖離しています。pnpm orval を実行して再生成・PR してください。"
            exit 1
          fi

  build:
    name: Build & deploy (main only)
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [e2e, openapi-sync-check]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      # 以下、案件に応じて S3 + CloudFront / Cloudflare Pages へデプロイ
      # - name: Deploy to S3
      #   uses: aws-actions/configure-aws-credentials@v4
      #   ...
```

- [ ] **Step 9.2: ファイル整合確認**

Run: `test -f docs/examples/github/workflows/web-ci.yml && echo OK`

---

## Task 10: android-ci.yml (Android 用 GitHub Actions)

**Files:**

- Create: `docs/examples/github/workflows/android-ci.yml`

- [ ] **Step 10.1: ファイル全内容を作成**

内容:

```yaml
name: Android CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  schedule:
    - cron: '0 0 * * *'

permissions:
  contents: read
  pull-requests: write

jobs:
  static:
    name: Static checks (typecheck / lint / format)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm format:check

  unit:
    name: Unit tests
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test --coverage

  component:
    name: Component tests (Vue Test Utils + Ionic + MSW)
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test:component

  e2e-pwa:
    name: E2E tests (Playwright on PWA build)
    needs: [unit, component]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm exec playwright install --with-deps chromium
      - run: pnpm test:e2e

  openapi-sync-check:
    name: OpenAPI sync check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - name: Download latest OpenAPI from Backend Releases
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          gh release download --repo m-miyawaki-m/[BACKEND_REPO_NAME] --pattern 'openapi.yaml' -O openapi-latest.yaml
      - run: pnpm orval --config orval.config.ts
      - name: Verify no diff
        run: |
          if ! git diff --exit-code -- src/api/generated; then
            echo "::error::orval 生成済みファイルが OpenAPI 最新と乖離しています。"
            exit 1
          fi

  capacitor-build-check:
    name: Capacitor Android build check
    needs: [unit, component]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec cap sync android
      - name: Gradle build APK
        working-directory: android
        run: ./gradlew assembleDebug

  release-internal:
    name: Capacitor APK + Firebase App Distribution (main only)
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [e2e-pwa, openapi-sync-check, capacitor-build-check]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
      - run: pnpm exec cap sync android
      - name: Build release APK
        working-directory: android
        run: ./gradlew assembleRelease
      # - name: Upload to Firebase App Distribution
      #   uses: wzieba/Firebase-Distribution-Github-Action@v1
      #   with:
      #     appId: ${{ secrets.FIREBASE_APP_ID }}
      #     serviceCredentialsFileContent: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
      #     groups: internal-testers
      #     file: android/app/build/outputs/apk/release/app-release.apk
```

- [ ] **Step 10.2: ファイル整合確認**

Run: `test -f docs/examples/github/workflows/android-ci.yml && echo OK`

---

## Task 11: backend-ci.yml (Backend 用 GitHub Actions、スケルトン)

**Files:**

- Create: `docs/examples/github/workflows/backend-ci.yml`

- [ ] **Step 11.1: ファイル全内容を作成（DD-050 保留中につき骨格のみ）**

内容:

```yaml
# Backend CI (Java + Spring Boot + MyBatis + Gradle Groovy DSL)
# Status: SKELETON — DD-050 保留中。Spring 詳細 (springdoc-openapi、Flyway、TestContainers 等) 確定後に詰める。

name: Backend CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

permissions:
  contents: write   # GitHub Releases に openapi.yaml をアップロードする
  pull-requests: write

jobs:
  static:
    name: Static checks (compile / checkstyle / spotbugs)
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v3
      - run: ./gradlew compileJava
      # - run: ./gradlew checkstyleMain spotbugsMain    # 採否決定後に有効化

  unit:
    name: Unit tests (JUnit 5)
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v3
      - run: ./gradlew test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-reports
          path: build/reports/tests/test/

  integration:
    name: Integration tests (TestContainers + PostgreSQL)
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v3
      # TestContainers が Docker を必要とする
      - run: ./gradlew integrationTest
        # 注: integrationTest タスクは build.gradle で別ソースセット定義済み想定

  openapi-generate:
    name: OpenAPI generation (springdoc-openapi)
    needs: static
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v3
      # TODO (DD-050): springdoc-openapi の OpenAPI YAML 生成タスクを定義
      # 例:
      # - run: ./gradlew generateOpenApiDocs
      # - uses: actions/upload-artifact@v4
      #   with:
      #     name: openapi-yaml
      #     path: build/openapi/openapi.yaml

  build:
    name: Build Docker image (main only)
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: [unit, integration, openapi-generate]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v3
      - run: ./gradlew bootBuildImage
      # TODO: GHCR push

  publish-openapi:
    name: Publish openapi.yaml to GitHub Releases (main only)
    if: github.ref == 'refs/heads/main' && github.event_name == 'push'
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: '21'
      - uses: gradle/actions/setup-gradle@v3
      # TODO (DD-050): build openapi.yaml と tag + Release 化
      # - run: ./gradlew generateOpenApiDocs
      # - run: gh release create v${{ github.run_number }} build/openapi/openapi.yaml --notes "Auto release"
      #   env:
      #     GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **Step 11.2: ファイル整合確認**

Run: `test -f docs/examples/github/workflows/backend-ci.yml && echo OK`

---

## Task 12: GitHub 関連 examples を一括コミット

- [ ] **Step 12.1: コミット**

Run:

```bash
git add docs/examples/github/
git commit -m "$(cat <<'EOF'
GitHub 関連 examples を追加 (PR テンプレ / Issue テンプレ / 3 ワークフロー)

- pull_request_template.md: PR テンプレート (DD-036)
- ISSUE_TEMPLATE/bug_report.md: 不具合報告テンプレ
- ISSUE_TEMPLATE/feature_request.md: 機能要望テンプレ
- workflows/web-ci.yml: Web CI (typecheck/lint/unit/component/e2e/openapi-sync) (DD-037)
- workflows/android-ci.yml: Android CI (上記 + capacitor-build-check + Firebase App Distribution)
- workflows/backend-ci.yml: Backend CI スケルトン (DD-050 保留中、Gradle ジョブ枠組み)

実プロジェクトの .github/ ディレクトリにコピーして使用可能。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 13: tsconfig.base.json (TypeScript strict 共通設定)

**Files:**

- Create: `docs/examples/tsconfig/tsconfig.base.json`

- [ ] **Step 13.1: ファイル全内容を作成**

内容:

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "useDefineForClassFields": true,

    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,

    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "forceConsistentCasingInFileNames": true,

    "noEmit": true,
    "sourceMap": true,
    "declaration": false,

    "types": []
  },
  "exclude": ["node_modules", "dist", "build", "coverage", ".cache"]
}
```

- [ ] **Step 13.2: ファイル整合確認**

Run: `test -f docs/examples/tsconfig/tsconfig.base.json && echo OK`

---

## Task 14: eslint.config.js (ESLint Flat Config)

**Files:**

- Create: `docs/examples/eslint/eslint.config.js`

- [ ] **Step 14.1: ファイル全内容を作成**

内容:

```javascript
// ESLint Flat Config (ESM)
// Required packages:
//   pnpm add -D eslint typescript-eslint eslint-plugin-vue vue-eslint-parser
//             eslint-plugin-import eslint-plugin-security eslint-config-prettier

import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import importPlugin from 'eslint-plugin-import';
import security from 'eslint-plugin-security';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  // Base
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,

  // Vue
  ...vue.configs['flat/recommended'],

  // Files-specific config for .vue
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
      },
    },
  },

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  },

  // Plugins
  {
    plugins: {
      import: importPlugin,
      security,
    },
    rules: {
      // Import order
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
      'import/no-duplicates': 'error',

      // Security
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-fs-filename': 'warn',
      'security/detect-object-injection': 'off', // false positive 多い

      // TypeScript
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',

      // Vue
      'vue/multi-word-component-names': 'off', // ページ単位の単一名コンポーネントを許容
      'vue/component-name-in-template-casing': ['error', 'PascalCase'],
      'vue/no-v-html': 'error',
    },
  },

  // Prettier (last to override formatting rules)
  prettier,

  // Ignore patterns
  {
    ignores: [
      'dist',
      'build',
      'coverage',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      'src/api/generated/**', // orval generated
    ],
  }
);
```

- [ ] **Step 14.2: ファイル整合確認**

Run: `test -f docs/examples/eslint/eslint.config.js && echo OK`

---

## Task 15: vscode settings.json + extensions.json

**Files:**

- Create: `docs/examples/vscode/settings.json`
- Create: `docs/examples/vscode/extensions.json`

- [ ] **Step 15.1: vscode settings.json を作成**

内容:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit",
    "source.organizeImports": "never"
  },
  "editor.tabSize": 2,
  "editor.insertSpaces": true,

  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true,
  "typescript.preferences.importModuleSpecifier": "non-relative",

  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true,
  "files.associations": {
    "*.vue": "vue"
  },

  "vue.complete.casing.tags": "pascal",
  "vue.complete.casing.props": "camel",

  "eslint.useFlatConfig": true,
  "eslint.validate": ["javascript", "typescript", "vue"],

  "[markdown]": {
    "files.trimTrailingWhitespace": false
  },

  "[json][jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

- [ ] **Step 15.2: vscode extensions.json を作成**

内容:

```json
{
  "recommendations": [
    "Vue.volar",
    "vue.vscode-typescript-vue-plugin",
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "editorconfig.editorconfig",
    "eamodio.gitlens",
    "usernamehw.errorlens",
    "streetsidesoftware.code-spell-checker",

    "Prisma.prisma",
    "rangav.vscode-thunder-client",

    "ionic.ionic",
    "ionic.ionicv8-snippets"
  ],
  "unwantedRecommendations": [
    "octref.vetur"
  ]
}
```

- [ ] **Step 15.3: ファイル整合確認**

Run: `test -f docs/examples/vscode/settings.json && test -f docs/examples/vscode/extensions.json && echo OK`

---

## Task 16: 設定系 examples を一括コミット

- [ ] **Step 16.1: コミット**

Run:

```bash
git add docs/examples/tsconfig/ docs/examples/eslint/ docs/examples/vscode/
git commit -m "$(cat <<'EOF'
設定系 examples を追加 (tsconfig / eslint / vscode)

- tsconfig/tsconfig.base.json: TypeScript strict + 追加厳格オプション (DD-026)
- eslint/eslint.config.js: Flat Config + Vue/TS/import/security プラグイン (DD-027)
- vscode/settings.json: 保存時 format / ESLint autofix / 改行 LF 等 (DD-034)
- vscode/extensions.json: 必須拡張 + プロジェクト別追加拡張の推奨セット

各案件で extends or コピーして使用。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 17: docker-compose.yml + .env.example

**Files:**

- Create: `docs/examples/docker/docker-compose.yml`
- Create: `docs/examples/env/.env.example`

- [ ] **Step 17.1: docker-compose.yml を作成**

内容:

```yaml
# Backend ローカル開発用 docker-compose
# PostgreSQL + Redis を起動する。Backend 本体は IDE から起動する想定。

services:
  db:
    image: postgres:16-alpine
    container_name: appdev-db
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: appdev
      TZ: Asia/Tokyo
    ports:
      - "5432:5432"
    volumes:
      - ./.docker/db:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d appdev"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: appdev-redis
    ports:
      - "6379:6379"
    volumes:
      - ./.docker/redis:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 結合テスト用の Prism モックサーバー (任意起動)
  # 起動: docker compose --profile mock up -d
  prism:
    profiles: ["mock"]
    image: stoplight/prism:5
    container_name: appdev-prism
    command: mock -h 0.0.0.0 /openapi.yaml
    ports:
      - "4010:4010"
    volumes:
      - ../openapi/openapi.yaml:/openapi.yaml:ro
```

- [ ] **Step 17.2: .env.example を作成**

内容:

```bash
# .env.example
# 案件リポジトリにコピーして .env.local を作成 (実値を入れる、git にはコミット禁止)
# 詳細は docs/discussion/05-dev-environment.md "シークレット管理" 参照

# === Common ===
NODE_ENV=development
TZ=Asia/Tokyo

# === Backend ===
SPRING_PROFILES_ACTIVE=local
DATABASE_URL=postgres://dev:dev@localhost:5432/appdev
REDIS_URL=redis://localhost:6379

# === Auth (JWT) ===
JWT_ISSUER=https://auth.example.com
JWT_AUDIENCE=appdev
JWT_ACCESS_TOKEN_TTL_SECONDS=900       # 15 分
JWT_REFRESH_TOKEN_TTL_SECONDS=2592000  # 30 日
# 本番では Secrets Manager から取得。ローカルのみここで指定
JWT_SIGNING_KEY=__dev_only_signing_key_change_in_production__

# === Web / Android (frontend) ===
VITE_API_BASE_URL=http://localhost:8080
VITE_API_VERSION=v1
VITE_SENTRY_DSN=
VITE_FEATURE_FLAGS_ENDPOINT=

# === Mock (orval / msw / Prism) ===
VITE_USE_MOCK=false
VITE_MOCK_BASE_URL=http://localhost:4010

# === Observability ===
LOG_LEVEL=info
OTEL_EXPORTER_OTLP_ENDPOINT=
SENTRY_DSN=

# === 注意 ===
# - .env.local は絶対に git にコミットしない (.gitignore で除外済み)
# - 本番値は AWS Secrets Manager / Doppler / Vault から取得
# - 共有が必要なら 1Password / Bitwarden 等で
```

- [ ] **Step 17.3: ファイル整合確認**

Run: `test -f docs/examples/docker/docker-compose.yml && test -f docs/examples/env/.env.example && echo OK`

---

## Task 18: openapi error-response.yaml (RFC 7807 例)

**Files:**

- Create: `docs/examples/openapi/error-response.yaml`

- [ ] **Step 18.1: ファイル全内容を作成**

内容:

```yaml
# RFC 7807 Problem Details + 業務エラーコード (DD-010) の OpenAPI スキーマ例
# 案件の openapi.yaml に取り込んで再利用する。

openapi: 3.0.3
info:
  title: Error Response Schema Example
  version: 1.0.0
  description: |
    RFC 7807 Problem Details + 業務エラーコード `errorCode: "E-{領域}-{番号}"` の標準スキーマ。
    全エンドポイントのエラーレスポンスは本スキーマに準拠する。

components:
  schemas:
    ProblemDetails:
      type: object
      description: RFC 7807 Problem Details + 業務エラーコード
      required: [type, title, status, errorCode]
      properties:
        type:
          type: string
          format: uri
          description: エラー種別を一意に識別する URI
          example: https://example.com/errors/validation
        title:
          type: string
          description: 人間可読のエラータイトル
          example: Validation Error
        status:
          type: integer
          format: int32
          description: HTTP ステータス
          example: 400
        detail:
          type: string
          description: 具体的なエラー説明
          example: 顧客コードは必須です
        instance:
          type: string
          description: エラーが発生したリクエストの URI
          example: /v1/customers
        errorCode:
          type: string
          pattern: '^E-[A-Z0-9]+-\d{3}$'
          description: 業務エラーコード (E-{領域}-{3 桁番号})
          example: E-CUSTOMER-001
        errors:
          type: array
          description: フィールド単位のエラー詳細
          items:
            type: object
            required: [field, message]
            properties:
              field:
                type: string
                description: 対象フィールド名
                example: customerCode
              message:
                type: string
                description: フィールド単位のエラーメッセージ
                example: 必須項目です
              code:
                type: string
                description: フィールド単位のエラー識別子
                example: required
        traceId:
          type: string
          description: トレーシング用の ID (ログと突き合わせ可能)
          example: 0af7651916cd43dd8448eb211c80319c

  responses:
    BadRequest:
      description: 400 Bad Request — バリデーションエラー
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
          examples:
            validation:
              summary: バリデーションエラー
              value:
                type: https://example.com/errors/validation
                title: Validation Error
                status: 400
                detail: perPage は 1〜100 の範囲で指定してください
                instance: /v1/customers?perPage=999
                errorCode: E-CUSTOMER-001
                errors:
                  - field: perPage
                    message: 1-100 の範囲で指定
                    code: out_of_range

    Unauthorized:
      description: 401 Unauthorized — 認証失敗
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
          examples:
            missingToken:
              summary: トークン未設定
              value:
                type: https://example.com/errors/auth/missing-token
                title: Missing Token
                status: 401
                detail: Authorization ヘッダーがありません
                errorCode: E-AUTH-001
            expiredToken:
              summary: トークン期限切れ
              value:
                type: https://example.com/errors/auth/expired-token
                title: Expired Token
                status: 401
                detail: アクセストークンの有効期限が切れています
                errorCode: E-AUTH-002

    Forbidden:
      description: 403 Forbidden — 権限不足
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
          examples:
            forbidden:
              value:
                type: https://example.com/errors/auth/forbidden
                title: Forbidden
                status: 403
                detail: 本機能を実行する権限がありません
                errorCode: E-AUTH-003

    NotFound:
      description: 404 Not Found — リソース未発見
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'

    Conflict:
      description: 409 Conflict — リソース競合
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'

    InternalServerError:
      description: 500 Internal Server Error — サーバー内部エラー
      content:
        application/problem+json:
          schema:
            $ref: '#/components/schemas/ProblemDetails'
          examples:
            serverError:
              value:
                type: https://example.com/errors/system
                title: Server Error
                status: 500
                detail: サーバー内部でエラーが発生しました
                errorCode: E-SYS-500
                traceId: 0af7651916cd43dd8448eb211c80319c
```

- [ ] **Step 18.2: ファイル整合確認**

Run: `test -f docs/examples/openapi/error-response.yaml && echo OK`

---

## Task 19: インフラ系 examples を一括コミット

- [ ] **Step 19.1: コミット**

Run:

```bash
git add docs/examples/docker/ docs/examples/env/ docs/examples/openapi/
git commit -m "$(cat <<'EOF'
インフラ系 examples を追加 (docker / env / openapi)

- docker/docker-compose.yml: PostgreSQL + Redis (DD-039 ローカル環境)
  + Prism モック (DD-012、--profile mock で起動可)
- env/.env.example: 各環境変数のキーと説明 (シークレットなし、DD-038)
- openapi/error-response.yaml: RFC 7807 + 業務エラーコードの OpenAPI スキーマ (DD-010)

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 20: phase-gate-checklist.md (フェーズゲート チェックリスト)

**Files:**

- Create: `docs/checklists/phase-gate-checklist.md`

- [ ] **Step 20.1: ファイル全内容を作成**

内容:

````markdown
# フェーズゲート チェックリスト

各フェーズ完了時のゲート判定で使う。本リポ `docs/discussion/03-implementation-steps.md` の Phase 0〜8 と対応。

## Phase 0: プロジェクト立ち上げ

- [ ] X1 プロジェクト計画書 / WBS が作成され承認済み
- [ ] X6 体制図とコミュニケーションルールが合意済み
- [ ] X2 リスク管理表に既知のリスクが登録され、High リスクの初期対応が決定済み
- [ ] 3 リポジトリ (`<案件>-backend`/`-web`/`-android`) が作成され、Branch Protection が設定済み (DD-035, DD-036)
- [ ] PR テンプレ / Issue テンプレ / CI ワークフロー (skeleton) が各リポに配備済み
- [ ] ローカル前提環境（Node 22 / pnpm / Docker / Android Studio / IntelliJ）の手順書がある
- [ ] チケット管理 (GitHub Issues) のラベル体系・マイルストーン定義済み

## Phase 1: 要件定義

- [ ] S1 業務要件定義書 (大枠) が作成されお客様承認済み (DD-015)
- [ ] S6 非機能要件書が具体値で合意済み (性能・可用性・セキュリティ目標値)
- [ ] B1 / W1 / A1 各機能要件定義書が作成されお客様承認済み
- [ ] 業務スコープと「将来課題」が明確に分離されている
- [ ] ロール一覧と各ロールの責務範囲が確定
- [ ] 主要ユースケース一覧（UC-NNN）が完成
- [ ] 要件レビュー会が実施され議事録あり

## Phase 2: 基本設計（外部設計）

- [ ] S2 データ辞書（草案）— 主要エンティティの用語対応・桁・コード値
- [ ] S3 API エンドポイント一覧（草案）— 全エンドポイント名・メソッド・概要
- [ ] S4 認証/認可仕様書 — トークン形式・ロールとエンドポイントの対応
- [ ] S5 業務エラーコード一覧（草案）— 主要エラーコードと HTTP ステータス対応
- [ ] B2 DB 設計（ER 図 + 主要エンティティ）
- [ ] W2 画面一覧と画面遷移図 — 全画面の網羅
- [ ] W3 主要画面設計書（草案）
- [ ] A2 Android ナビゲーション設計
- [ ] A3 Android 主要画面設計書（草案）
- [ ] A4 ネイティブ機能設計（Capacitor プラグイン使用範囲）
- [ ] 3 チーム合同 API レビュー実施済み
- [ ] お客様基本設計レビュー会実施済み

## Phase 3: 詳細設計（内部設計）

- [ ] B3 Backend 内部設計（Spring モジュール構成）
- [ ] B4 バッチ・ジョブ設計
- [ ] B5 主要 API の内部処理設計書（template-api-internal.md ベース）
- [ ] B6 ログ・監査ログ設計書 (DD-017)
- [ ] W4 状態管理設計（Pinia + TanStack Query 役割分担）
- [ ] W5 コンポーネント設計（ディレクトリ構造・Composables 一覧）
- [ ] A5 オフライン・同期設計（該当時）
- [ ] A6 Android コンポーネント設計
- [ ] **S3 OpenAPI YAML v0.1.0 を確定** — Backend で springdoc-openapi が稼働し YAML 生成済み
- [ ] フロント (Web/Android) で orval 生成パイプラインが稼働
- [ ] OpenAPI sync check ジョブが PR 時に走る

## Phase 4: 実装

- [ ] 単体テスト カバレッジ目標達成 (DD-042: ロジック 80% / UI 70%)
- [ ] 全 PR で CI 全段階緑、コードレビュー完了
- [ ] OpenAPI 破壊変更がある場合、URL バージョン分岐 (`/v2/` 等) で対応 (DD-013)
- [ ] スプリントレビュー（週次）+ 3 チーム合同 API 整合確認（隔week）が継続
- [ ] 主要機能の動作確認が dev 環境で完了

## Phase 5: 結合テスト

- [ ] Backend ↔ Web、Backend ↔ Android の段階結合完了（MSW → Prism → 実 Backend）
- [ ] E2E 黄金パス 100% / 主要例外シナリオ 80% 達成 (DD-042)
- [ ] 契約テスト (OpenAPI schema validation) 全エンドポイント緑 (DD-045)
- [ ] Critical / High 不具合解消
- [ ] テスト結果レビュー会実施済み

## Phase 6: システムテスト

- [ ] 性能テスト (k6) で S6 非機能要件達成
- [ ] Lighthouse CI で Web の Core Web Vitals 達成
- [ ] セキュリティテスト: SAST (Snyk) / DAST (OWASP ZAP) / 依存脆弱性 Critical 0
- [ ] 監査ログ機能の動作確認
- [ ] 運用シナリオ通し試験完了

## Phase 7: 受入テスト (UAT)

- [ ] お客様による業務シナリオ確認完了
- [ ] W6 / A7 操作マニュアル最終版完成 (DD-019)
- [ ] UAT で発見された Critical / High 不具合解消
- [ ] お客様検収サインオフ

## Phase 8: リリース・運用引継

- [ ] 本番デプロイ完了 (Backend / Web)
- [ ] Google Play Console 公開審査完了 (Android)
- [ ] B7 運用手順書 / 障害対応手順書 最終版 (DD-018)
- [ ] 運用引継会実施済み・保守体制起動
- [ ] 監視・アラート (Sentry / OpenTelemetry / CloudWatch) 稼働確認
- [ ] リリース判定会 議事録あり

---

## 横断チェック（全フェーズ末）

- [ ] X3 課題管理表が最新化されている
- [ ] X2 リスク管理表で High リスクの状況が更新されている
- [ ] 関連 DD（decisions.md）の影響変更があれば追記・更新

## 関連ドキュメント

- `docs/discussion/03-implementation-steps.md` — 各フェーズの詳細
- `docs/discussion/decisions.md` — 全 DD 一覧
````

- [ ] **Step 20.2: ファイル整合確認**

Run: `test -f docs/checklists/phase-gate-checklist.md && echo OK`

---

## Task 21: pr-review-checklist.md (PR レビュー観点)

**Files:**

- Create: `docs/checklists/pr-review-checklist.md`

- [ ] **Step 21.1: ファイル全内容を作成**

内容:

````markdown
# PR レビュー観点 チェックリスト

レビュアーが PR を見るときに確認する観点集。すべて満たす必要はないが、該当する PR で関連項目を確認する。

## 共通（全 PR）

### 説明・コンテキスト

- [ ] PR タイトルが内容を表している（変更タイプ含む）
- [ ] PR 本文に概要・関連 Issue・動作確認チェックが書かれている
- [ ] 破壊的変更があるならその旨が明示されている

### コード品質

- [ ] CI が全段階緑 (typecheck / lint / unit / component / e2e / openapi-sync)
- [ ] 既存パターンに従っている（独自パターンの混入なし）
- [ ] 命名が業務用語・データ辞書 (S2) に沿っている
- [ ] 不要なコメント・デッドコード・コメントアウトが残っていない
- [ ] TODO / FIXME はチケット番号付き（`// TODO(#123): ...`）
- [ ] 重複ロジック（DRY 違反）がない

### テスト

- [ ] 新規ロジックに対する単体テストが追加されている
- [ ] バグ修正 PR の場合、再発防止のテストケースが追加されている
- [ ] テストが意味のあるアサーション（ただ呼んでるだけ・スナップショット濫用なし）
- [ ] テストデータが本番データに依存していない (DD-049 禁止事項)

### セキュリティ

- [ ] シークレット (API キー / トークン / パスワード) がハードコードされていない (DD-038)
- [ ] ユーザー入力の検証が境界で行われている (Zod / Bean Validation)
- [ ] SQL インジェクション・XSS 対策が抜けていない
- [ ] 認証・認可が必要な箇所で抜けていない (DD-011)
- [ ] 監査ログ対象操作にログ出力がある (DD-017)

### ドキュメント

- [ ] API 変更があるなら OpenAPI 仕様 (S3) も更新されている
- [ ] 業務ルール / 制約に変更があるなら関連ドキュメント (S1, B1, W1, A1) も更新
- [ ] エラーコード追加があるなら S5 業務エラーコード一覧も更新
- [ ] 新規モジュール / 新規画面なら章立てひな型に沿った設計書が追加されている

## Backend 特有

- [ ] API レスポンスは RFC 7807 + errorCode に準拠 (DD-010)
- [ ] バリデーションは Bean Validation で DTO に集約
- [ ] トランザクション境界が明示的 (`@Transactional`)
- [ ] MyBatis Mapper の SQL ID 規約に準拠
- [ ] 監査対象操作にログ・トレース ID 出力あり

## Web 特有

- [ ] Vuetify コンポーネントの API（props / slots）を正しく使っている
- [ ] 状態管理が Pinia / TanStack Query で適切に分離 (DD-028)
- [ ] フォームバリデーションが Zod schema 経由で実行されている
- [ ] アクセシビリティ（ARIA、キーボード操作）に配慮がある
- [ ] レスポンシブ動作を主要画面幅で確認した

## Android 特有

- [ ] Ionic ナビゲーション構造（Tab + Stack）が崩れていない
- [ ] ハードウェアバックボタンの挙動が想定通り
- [ ] Capacitor プラグインの呼出が iOS との互換性を意識（将来 iOS 対応想定なら）
- [ ] Secure Storage を要する情報を Preferences API で扱っている (DD-011)
- [ ] オフライン挙動が考慮されている（該当時）

## API 変更 PR

別チェックリスト `docs/checklists/api-change-checklist.md` を参照。

## 大型 PR の扱い

500 行を超える PR は分割を強く推奨。やむを得ない場合、レビュアーは:

- [ ] 分割できなかった理由を確認
- [ ] レビュー作業を 2 回以上に分けて時間を確保
- [ ] 重要箇所と機械的変更箇所を分けて確認

## 不適切な PR の例

レビュアーが pause / 拒否してよい PR の典型:

- 説明が空、または「fix some bugs」など内容不明
- 未関連の大規模リファクタが混在
- 緑になっていない CI 状態で submit
- 設計ドキュメント更新を伴わない大きな仕様変更
- セキュリティ関連の変更で監査ログ追加が漏れている

## 関連ドキュメント

- DD-035 / DD-036（ブランチ戦略・PR テンプレ標準化）
- `docs/examples/github/pull_request_template.md`
````

- [ ] **Step 21.2: ファイル整合確認**

Run: `test -f docs/checklists/pr-review-checklist.md && echo OK`

---

## Task 22: api-change-checklist.md (API 変更チェックリスト)

**Files:**

- Create: `docs/checklists/api-change-checklist.md`

- [ ] **Step 22.1: ファイル全内容を作成**

内容:

```markdown
# API 変更 チェックリスト

3 チーム独立並走 (Approach C) で API を変更する際の合意手順。Backend / Web / Android の整合を保つ。

## 1. 変更分類を判定

- [ ] **非破壊変更** (フィールド追加 / 新エンドポイント / オプション追加): URL バージョン据え置き、マイナーバンプ
- [ ] **破壊変更** (フィールド削除 / 型変更 / 必須化 / 意味変更): **URL バージョン分岐 (`/v1/` → `/v2/`) 必須** (DD-013)
- [ ] 判定根拠を PR 本文に明記

## 2. 提案フェーズ

- [ ] Backend チームが API 変更 PR を起票
- [ ] Backend PR 本文に: 変更理由 / 影響範囲 / Web/Android チームへの影響見積もり
- [ ] OpenAPI schema を更新 (Spring の場合は DTO + アノテーション、結果として springdoc が生成)
- [ ] 業務エラーコード追加なら S5 エラーコード一覧も更新
- [ ] Web チーム + Android チームをレビュアーに指名（必須）

## 3. レビューフェーズ

### Backend レビュアー

- [ ] DTO / Validation / Service / Mapper / SQL の整合
- [ ] エラーマッピングが RFC 7807 + errorCode に準拠 (DD-010)
- [ ] 単体・結合テストが追加・更新されている
- [ ] 認証・認可ロールが正しい (DD-011)

### Web レビュアー

- [ ] orval 生成型に変更がある場合、Web 側の参照箇所への影響を確認
- [ ] 画面設計書 (W3) の項目定義・API 連携セクションを更新する必要があるか確認
- [ ] 破壊変更ならフロント追従計画 (どの画面で受け入れるか) を Issue に切る

### Android レビュアー

- [ ] orval 生成型に変更がある場合、Android 側の参照箇所への影響を確認
- [ ] Ionic 画面設計書 (A3) を更新する必要があるか確認
- [ ] 破壊変更ならフロント追従計画を Issue に切る

## 4. マージフェーズ

- [ ] 3 チーム全員が approval
- [ ] Backend が merge
- [ ] **マージ後、Backend で OpenAPI を再生成 + GitHub Releases に新タグでアセット添付** (DD-008)
- [ ] リリースノートに変更要約を記載 (semver: major / minor / patch)

## 5. 追従フェーズ

- [ ] Web チーム: orval 自動再生成 PR が openapi-sync-check で検知される → 確認・必要対応
- [ ] Android チーム: 同上
- [ ] 破壊変更の場合: 旧バージョン (`/v1/`) は 6 ヶ月以上維持 (DD-013、案件で調整)

## 6. 破壊変更の特別手順

破壊変更 (`/v2/` 等) のみ:

- [ ] Backend で `/v1/` を deprecation アナウンス（OpenAPI の `deprecated: true`）
- [ ] Web / Android で `/v2/` への移行 Issue を切る（マイルストーン: 次メジャーリリース）
- [ ] 移行完了後、`/v1/` の削除 PR を作成（**削除前に全フロントの`/v2/` 移行完了確認必須**）

## 関連ドキュメント

- DD-008 / DD-013 / DD-022（API 配布・バージョニング・並走同期）
- `docs/examples/github/pull_request_template.md`
```

- [ ] **Step 22.2: ファイル整合確認**

Run: `test -f docs/checklists/api-change-checklist.md && echo OK`

---

## Task 23: release-checklist.md (リリースチェックリスト)

**Files:**

- Create: `docs/checklists/release-checklist.md`

- [ ] **Step 23.1: ファイル全内容を作成**

内容:

```markdown
# リリース判定 チェックリスト

本番リリース直前 (Phase 8 開始時) に判定する。プロジェクト単位 (Backend / Web / Android) で個別に判定し、必要なら同期リリースする。

## 共通（全プロジェクト）

### 品質

- [ ] Phase 5 結合テスト合格 (Critical / High 不具合ゼロ)
- [ ] Phase 6 システムテスト合格 (S6 非機能要件達成)
- [ ] Phase 7 UAT サインオフ
- [ ] カバレッジ目標 (DD-042) 達成
- [ ] セキュリティスキャン Critical / High ゼロ (DD-048)
- [ ] dependabot / renovate の Critical / High 依存脆弱性ゼロ (DD-040)

### ドキュメント

- [ ] X4 リリース計画書 (バージョン整合表) が更新されている
- [ ] B7 運用手順書 / 障害対応手順書 最終版 (DD-018)
- [ ] W6 / A7 操作マニュアル最終版 (DD-019)
- [ ] CHANGELOG / リリースノート作成

### 監視・運用準備

- [ ] Sentry / OpenTelemetry / CloudWatch のダッシュボード準備済み
- [ ] 監査ログの保管先・検索方法が運用チームと合意済み (DD-017)
- [ ] 障害連絡フロー（Slack / オンコール）が稼働

### ロールバック計画

- [ ] ロールバック手順が文書化されている
- [ ] ロールバック判断基準（メトリクス・しきい値）が明確
- [ ] ロールバックの責任者・実施者が決まっている

## Backend 固有

- [ ] DB マイグレーション (Flyway) の前方互換性確認（Web / Android 既存版が動くか）
- [ ] OpenAPI バージョン整合（フロントが参照しているバージョンが本番稼働対象）
- [ ] バッチジョブ (Spring Batch) のスケジュール登録完了
- [ ] ヘルスチェックエンドポイント稼働
- [ ] APM / メトリクス収集稼働
- [ ] 監査対象操作のログ出力動作確認

## Web 固有

- [ ] 本番 Backend エンドポイントの設定確認 (`.env.production`)
- [ ] CDN / WAF 設定確認
- [ ] CSP (Content Security Policy) ヘッダー設定確認
- [ ] アクセス解析（GA4 等）の本番タグ反映
- [ ] お問い合わせ・サポートリンクの本番設定

## Android 固有

- [ ] Google Play Console の Internal Testing → Closed Testing → Production の段階確認
- [ ] アプリ署名キーの安全な管理（Play App Signing 推奨）
- [ ] プライバシーポリシー / 利用規約のリンク有効
- [ ] ストア表示（スクリーンショット / 説明文 / 対象国）整備
- [ ] Capacitor Native プラグインの本番権限申請（カメラ・位置情報・通知等）

## リリース判定会

- [ ] PM / アーキテクト / QA / 運用代表 が出席
- [ ] 上記チェックリストの完了状況を確認
- [ ] 残課題と本番後フォロー計画を共有
- [ ] **GO / NO-GO 判定** を記録

## リリース後

- [ ] リリース直後の監視（30 分間）
- [ ] 主要 KPI（エラー率 / レスポンス時間 / ユーザー流入）が想定範囲内
- [ ] ロールバック判断（必要なら即実施）
- [ ] リリース完了報告（Slack / Email）

## 関連ドキュメント

- `docs/discussion/03-implementation-steps.md` Phase 8
- B7 運用手順書 / 障害対応手順書（案件内）
```

- [ ] **Step 23.2: ファイル整合確認**

Run: `test -f docs/checklists/release-checklist.md && echo OK`

---

## Task 24: onboarding-checklist.md (新規参画者オンボーディング)

**Files:**

- Create: `docs/checklists/onboarding-checklist.md`

- [ ] **Step 24.1: ファイル全内容を作成**

内容:

```markdown
# 新規参画者 オンボーディング チェックリスト

新規参画者が初日〜1 週間で完了すべき項目。目標: 1 日でローカル開発可能、1 週間で最初の PR を出せる状態。

## 初日（半日〜1 日）

### 環境準備

- [ ] GitHub Organization に招待された
- [ ] GitHub の 2FA を有効化
- [ ] 案件 Slack / Teams チャンネルに参加
- [ ] ロール別の権限 (案件チケット管理 / GitHub Issues / Sentry / 開発環境) が付与された

### 共通開発環境

- [ ] Node.js LTS (v22) インストール (Volta or fnm で固定)
- [ ] pnpm インストール
- [ ] Docker Desktop インストール・動作確認
- [ ] Git バージョン 2.40+ + gh CLI ログイン
- [ ] VS Code + 必須拡張機能インストール (`docs/examples/vscode/extensions.json` 参照)

### Backend 担当者のみ

- [ ] Java 21 LTS インストール
- [ ] IntelliJ IDEA インストール + Spring/MyBatis プラグイン
- [ ] Android Studio (必要なら) インストール

### Android 担当者のみ

- [ ] Android Studio インストール
- [ ] Android SDK + Emulator イメージ準備
- [ ] Capacitor 関連の Doctor 確認 (`pnpm exec cap doctor`)

### リポジトリ clone

- [ ] 担当プロジェクトのリポを clone
- [ ] `.env.example` を `.env.local` にコピーして必要値を埋める（チームから取得）
- [ ] `pnpm install` (frontend) / `./gradlew build` (backend) 成功
- [ ] `pnpm dev` / IDE 起動 でアプリ起動確認

## 2-3 日目

### ドキュメントを読む

- [ ] このリポジトリ (`vue-biz-app-design-spec`) を読む
  - [ ] README.md
  - [ ] 最終 spec (`docs/superpowers/specs/2026-05-19-vue-biz-app-design-spec.md`)
  - [ ] decisions.md（DD-001〜DD-050）
  - [ ] 自分の担当領域の discussion 詳細 (02〜06 のうち該当)
- [ ] 案件リポの README + 既存 docs/ を読む
- [ ] S1 業務要件 / 自分の担当領域の要件 (B1/W1/A1) を読む

### コードを読む

- [ ] 担当領域のディレクトリ構造を把握
- [ ] 主要モジュール / コンポーネント 3〜5 を実際に読む（依存関係を追う）
- [ ] CI ワークフローを読む（自分の PR がどう検証されるか）

### テストを走らせる

- [ ] `pnpm test` / `./gradlew test` がローカルで全緑
- [ ] 1 つのテストを意図的に壊して失敗を観察 → 元に戻す
- [ ] `pnpm test:e2e` / Playwright を 1 ケースだけ実行

## 4-5 日目

### 最初の小さい変更

- [ ] `good-first-issue` ラベルのチケットを 1 つ assign
- [ ] feature ブランチを切って実装
- [ ] 単体テストを追加 (TDD)
- [ ] CI を緑にする
- [ ] PR を提出 (PR テンプレに従う)
- [ ] レビュー反映 → merge

## 1 週間目

### チェックリストとの突き合わせ

- [ ] `docs/checklists/pr-review-checklist.md` を読み、自分の PR を逆チェック
- [ ] 不明点を Issue / Slack で質問
- [ ] 次のチケットを取りに行ける

## 2 週間目以降

### 段階的に責任範囲を広げる

- [ ] レビュアーとして他者の PR を見る
- [ ] 設計書 (W3 / A3 / B5) のひな型を使って 1 文書書く
- [ ] スプリントレビューで自分の進捗を共有

## メンター・バディ

- [ ] メンター（同じチーム）が割り当てられている
- [ ] バディ（別チーム、横の繋がり用）が割り当てられている
- [ ] 週次 1on1 が設定されている

## 関連ドキュメント

- `docs/discussion/05-dev-environment.md` "オンボーディング手順"
- 案件リポの README
```

- [ ] **Step 24.2: ファイル整合確認**

Run: `test -f docs/checklists/onboarding-checklist.md && echo OK`

---

## Task 25: チェックリスト一括コミット

- [ ] **Step 25.1: コミット**

Run:

```bash
git add docs/checklists/phase-gate-checklist.md docs/checklists/pr-review-checklist.md docs/checklists/api-change-checklist.md docs/checklists/release-checklist.md docs/checklists/onboarding-checklist.md
git commit -m "$(cat <<'EOF'
運用チェックリスト 5 種を追加

- phase-gate-checklist.md: 各フェーズ完了時のゲート判定 (Phase 0-8)
- pr-review-checklist.md: PR レビュー観点 (共通 + Backend/Web/Android 特有)
- api-change-checklist.md: API 変更時の 3 チーム合意手順 (DD-013, DD-022)
- release-checklist.md: 本番リリース判定 (Backend/Web/Android 固有含む)
- onboarding-checklist.md: 新規参画者の初日〜1 週間〜2 週間以降の段階

実プロジェクトの Issue / PR から参照する運用想定。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Task 26: ルート README + 最終 spec のリンク更新

**Files:**

- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-05-19-vue-biz-app-design-spec.md`

- [ ] **Step 26.1: README.md の「主要ドキュメント」セクションに templates/examples/checklists を追加**

`README.md` の「主要ドキュメント」セクション末尾（`各セクション詳細:` ブロックの直後）に以下を追加:

```markdown
- 再利用アーティファクト:
  - [docs/templates/](docs/templates/) — 設計書ひな型 5 種
  - [docs/examples/](docs/examples/) — PR テンプレ / CI ワークフロー / tsconfig / eslint / docker / openapi 等
  - [docs/checklists/](docs/checklists/) — フェーズゲート / PR レビュー / API 変更 / リリース / オンボーディング
```

`README.md` の「ディレクトリ構成」セクションも更新:

```markdown
.
├── README.md
├── .gitignore
└── docs/
    ├── superpowers/
    │   ├── specs/
    │   │   └── 2026-05-19-vue-biz-app-design-spec.md
    │   └── plans/
    │       └── 2026-05-19-playbook-artifacts.md
    ├── discussion/
    │   ├── decisions.md
    │   ├── 01-contract-layer-proposal.md
    │   ├── 02-document-set.md
    │   ├── 03-implementation-steps.md
    │   ├── 04-tech-selection.md
    │   ├── 05-dev-environment.md
    │   └── 06-testing-strategy.md
    ├── templates/                               # 設計書ひな型 (5 種)
    ├── examples/                                # 設定・CI・契約の具体例
    │   ├── github/
    │   ├── tsconfig/
    │   ├── eslint/
    │   ├── vscode/
    │   ├── docker/
    │   ├── env/
    │   └── openapi/
    └── checklists/                              # 運用チェックリスト (5 種)
```

- [ ] **Step 26.2: 最終 spec の Section 9 にリンク追加**

`docs/superpowers/specs/2026-05-19-vue-biz-app-design-spec.md` の「9. 関連ドキュメント」テーブルに以下行を追加:

```markdown
| `docs/templates/*.md`                                           | 設計書ひな型 (S/B/W/A 共通枠 5 種)     |
| `docs/examples/`                                                | 設定・CI・契約の具体例コピー元         |
| `docs/checklists/*.md`                                          | フェーズゲート / PR / API 変更 / リリース / オンボーディング |
```

- [ ] **Step 26.3: コミット**

Run:

```bash
git add README.md docs/superpowers/specs/2026-05-19-vue-biz-app-design-spec.md
git commit -m "$(cat <<'EOF'
README と最終 spec に新規アーティファクトディレクトリへのリンクを追加

- docs/templates/ (設計書ひな型 5 種)
- docs/examples/ (PR テンプレ / CI / tsconfig / eslint / vscode / docker / env / openapi)
- docs/checklists/ (フェーズゲート / PR レビュー / API 変更 / リリース / オンボーディング)

ディレクトリ構成図と関連ドキュメント表も更新。

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"
git push
```

---

## Self-Review

実装完了後、以下を確認:

### Spec coverage 確認

- [ ] DD-014（5 カテゴリ分類）と templates の対応関係: requirements/screen-design/internal-design/test-spec/api-internal は B/W/A 全てをカバー
- [ ] DD-016（章立てテンプレ統一）の実体化: 5 ひな型が完成
- [ ] DD-017〜DD-019（B6/B7/W6/A7）の必要性が templates または checklists で言及されている
- [ ] DD-022（6 つの強制同期ポイント）が phase-gate-checklist の Phase 1-7 にマップされている
- [ ] DD-026 / DD-027（TS 設定 / Lint 設定）が examples/tsconfig / examples/eslint で実体化
- [ ] DD-034（VS Code 設定）が examples/vscode で実体化
- [ ] DD-035 / DD-036（PR テンプレ / Branch Protection）が examples/github/pull_request_template + checklists/pr-review で実体化
- [ ] DD-037（CI/CD ワークフロー）が examples/github/workflows で実体化
- [ ] DD-039 / DD-040（環境分離 / Renovate）が examples/env / 各ワークフローで言及
- [ ] DD-050（Backend 保留）が backend-ci.yml で「skeleton」として明示

### Placeholder 確認

- [ ] 全 28 ファイルに TBD / TODO（チケット番号なし） / 空欄がない
- [ ] template-* の例示は具体的（`[ロール名]` / `[氏名]` 等の埋め枠は「ひな型として正しい」placeholders なので OK）
- [ ] backend-ci.yml の `TODO (DD-050)` は意図的（保留事項の明示なので OK）

### Type / 命名 整合確認

- [ ] DD-NNN 参照が decisions.md に存在
- [ ] S1〜S6, B1〜B8, W1〜W7, A1〜A8 の文書 ID 体系が 02-document-set.md と一致
- [ ] DD-050 への参照が一貫している（DD-050 へのリンクは relative path で書く）

問題があれば inline で修正・コミット。

---

## Execution Handoff

このプランは 26 タスク・約 28 ファイル新規作成 + 2 ファイル更新。全タスクが Markdown / 設定ファイルの記述で、コードコンパイル・テスト実行は不要（CI ワークフロー YAML の syntax 検証はマージ後の GitHub 側で実施）。

**実装オプション:**

1. **Subagent-Driven**: 各タスクを fresh subagent に投げて、タスク間で私がレビュー。多数のテンプレ・チェックリスト記述で並列化可能性は低いので、メリットは限定的
2. **Inline Execution**: このセッションで連続実行。中間ファイルが多いので、まとめてのほうが効率的

Markdown / YAML 主体のため Inline Execution 推奨。実行を始める前にユーザー確認を取る。
