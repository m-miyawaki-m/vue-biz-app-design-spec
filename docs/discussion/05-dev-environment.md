# 開発環境 — 確定

> ステータス: **確定**（DD-032〜DD-040 として decisions.md に転記済み）
> 関連: DD-001（コードベース完全分離）、DD-004（企業・受託スタイル）、DD-007（NestJS）、DD-024（Android = Ionic + Capacitor）

## 開発体制と前提

- 3 プロジェクト（Backend / Web / Android）は **別々の GitHub リポジトリ**
- 各チームは独立した CI/CD パイプラインを持つ
- 共有はあくまで「契約」（OpenAPI / 認証仕様 / データ辞書）のみ

## リポジトリ構成

| リポジトリ                                  | 内容                                     | 公開範囲   |
| ------------------------------------------- | ---------------------------------------- | ---------- |
| `<案件>-backend`                            | NestJS Backend                           | Private    |
| `<案件>-web`                                | Vue + Vuetify3 Web フロントエンド          | Private    |
| `<案件>-android`                            | Vue + Ionic + Capacitor Android アプリ    | Private    |
| `<案件>-docs` (任意)                        | 共有設計書 (S1-S6) 集約                  | Private    |

**命名規約**: `<案件略称>-{backend|web|android|docs}`、ハイフン区切り、英小文字。

## Node.js / パッケージマネージャ

| 項目                | 採用                                                                         |
| ------------------- | ---------------------------------------------------------------------------- |
| Node.js             | LTS バージョン (本スペック時点で v22 LTS 想定)                                |
| バージョン固定      | `.nvmrc` / `.tool-versions` ファイル + Volta or fnm を推奨                    |
| パッケージマネージャ | **pnpm**（高速、ディスク効率良好、ロックファイル厳密）                        |

pnpm 選定理由:

- npm より高速、yarn より厳密なロック
- Monorepo 化しない (Approach C) ためワークスペース機能は必須ではないが、将来余地あり
- ディスク容量効率 (hardlink) が大規模プロジェクトで効く

## 推奨 IDE / エディタ

**VS Code** を推奨（全プロジェクト共通）。

### 必須拡張機能

| 拡張機能                                  | 用途                                  |
| ----------------------------------------- | ------------------------------------- |
| **Vue - Official (Volar)**                | Vue 3 言語サポート                    |
| **TypeScript Vue Plugin (Volar)**         | Vue ファイル内の TypeScript           |
| **ESLint**                                | リアルタイム lint                     |
| **Prettier - Code formatter**             | 保存時フォーマット                    |
| **EditorConfig**                          | 行末・インデント統一                  |
| **GitLens**                               | Git ブレーム・履歴可視化              |
| **Error Lens**                            | エラー/警告を行内表示                 |
| **Code Spell Checker**                    | スペルチェック                        |

### プロジェクト別の追加拡張

| 拡張機能                                  | プロジェクト       |
| ----------------------------------------- | ------------------ |
| **Prisma**                                | Backend            |
| **REST Client** or **Bruno**              | Backend (API 動作確認) |
| **Vuetify Snippets**                      | Web                |
| **Ionic** (Ionic VSCode Extension Pack)   | Android            |

### `.vscode/settings.json` 共通設定（推奨）

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "files.insertFinalNewline": true,
  "files.trimTrailingWhitespace": true
}
```

## ローカル開発前提環境

| ツール                 | バージョン                | 用途                                       |
| ---------------------- | ------------------------- | ------------------------------------------ |
| **Docker Desktop**     | 最新                      | Backend ローカル開発用 (PostgreSQL / Redis) |
| **Android Studio**     | 最新安定版                | Capacitor Android ビルド・Emulator         |
| **Git**                | 2.40+                     | バージョン管理                              |
| **gh (GitHub CLI)**    | 最新                      | PR・Issue 操作                              |

## ブランチ戦略

**GitHub Flow** を採用（シンプル）。

```
main (常にデプロイ可能)
  ├─ feature/<issue-id>-<短い説明>
  ├─ fix/<issue-id>-<短い説明>
  ├─ refactor/<issue-id>-<短い説明>
  └─ chore/<短い説明>
```

### ブランチ命名規約

- `feature/PROJ-123-add-customer-search`
- `fix/PROJ-456-fix-login-validation`
- `chore/upgrade-node-22`

### ルール

1. 全変更は PR 経由（main への直 push 禁止）
2. PR には Issue リンク必須
3. PR テンプレート必須使用
4. レビュアー 1 名以上 + Required Status Checks 全緑で merge 可能
5. merge は **Squash & Merge** を推奨（main 履歴がきれい）
6. merge 後は feature ブランチ削除

### `main` ブランチ保護設定（GitHub Branch Protection）

- Require pull request reviews (1 名以上)
- Require status checks to pass (CI 全段階緑)
- Require linear history (Squash & Merge 強制)
- Require branches up to date before merging
- Restrict who can push to matching branches (admins のみ強制 push 可)

## PR テンプレート

`.github/pull_request_template.md`:

```markdown
## 概要

(変更内容を 1-3 行)

## 関連 Issue

- closes #

## 変更タイプ

- [ ] feature
- [ ] fix
- [ ] refactor
- [ ] chore
- [ ] docs

## 動作確認

- [ ] 単体テスト追加・更新
- [ ] ローカルで動作確認
- [ ] 影響範囲のリグレッションを目視確認

## レビュアー向けメモ

(注目してほしい点・トレードオフ)
```

## CI/CD（GitHub Actions）

各プロジェクトに独立した GitHub Actions ワークフロー。

### Backend (`<案件>-backend`)

```
pull_request:
  jobs:
    - typecheck (tsc --noEmit)
    - lint (eslint)
    - unit-test (jest)
    - integration-test (jest + テスト DB / Docker Compose)
    - openapi-generate (zod-to-openapi 出力 → 差分検証)
    - prisma-validate

push to main:
  jobs:
    - 上記 + Docker build → GHCR push
    - openapi-publish (タグ付け + GitHub Releases にアセット添付)
    - deploy (本番 / staging に応じて)
```

### Web (`<案件>-web`)

```
pull_request:
  jobs:
    - typecheck
    - lint
    - unit-test (vitest)
    - component-test (vue-test-utils + MSW)
    - e2e-test (playwright on dev server with MSW)
    - openapi-sync-check (Backend Releases の最新 openapi.yaml と orval 生成済みファイルが整合しているか)

push to main:
  jobs:
    - 上記 + ビルド (Vite) → S3 + CloudFront / Cloudflare Pages デプロイ
```

### Android (`<案件>-android`)

```
pull_request:
  jobs:
    - typecheck
    - lint
    - unit-test (vitest)
    - component-test
    - e2e-test (playwright on PWA build)
    - openapi-sync-check
    - capacitor-build-check (Android APK ビルドが通るか)

push to main:
  jobs:
    - 上記 + Capacitor build → APK 生成
    - Firebase App Distribution へ内部配布 (社内テスト)
    - 手動承認後 → Google Play Internal Testing トラック
```

### OpenAPI 同期チェック（重要）

Web / Android の CI で `openapi-sync-check` ジョブを定期実行（毎日 + PR 時）:

1. Backend の GitHub Releases から最新 `openapi.yaml` を取得
2. ローカルの orval 生成設定で再生成
3. 生成済みファイルとの diff があれば PR を自動作成（Renovate / Dependabot 風）

これによりフロントが Backend の API 変更を見逃さない。

## シークレット管理

| 用途                     | 保管場所                                    |
| ------------------------ | ------------------------------------------- |
| ローカル開発             | `.env.local` (gitignore 済み)               |
| GitHub Actions           | GitHub Secrets / GitHub Environments        |
| 本番                     | AWS Secrets Manager / Doppler / HashiCorp Vault |
| 開発者間共有 (一時的)    | 1Password / Bitwarden                        |

**禁止事項**:

- `.env` を Git にコミット
- Secret を Slack / Email で平文送信
- CI ログに Secret を出力

## 環境分離

| 環境           | 用途                                          | URL 例 (Web)                    |
| -------------- | --------------------------------------------- | ------------------------------- |
| **local**      | 開発者ローカル                                | http://localhost:5173            |
| **dev**        | 開発統合環境（チーム共有・最新 main 自動デプロイ） | https://dev.example.com         |
| **staging**    | リリース前検証 (UAT 環境)                     | https://stg.example.com         |
| **production** | 本番                                          | https://app.example.com         |

各環境は別 Backend エンドポイント + 別 DB に分離。

## Docker / Compose（Backend ローカル開発用）

Backend リポジトリ内に `docker-compose.yml`:

```yaml
services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: appdev
    ports: ["5432:5432"]
    volumes: ["./.docker/db:/var/lib/postgresql/data"]

  redis:
    image: redis:7
    ports: ["6379:6379"]
```

開発者は `docker compose up -d` で DB / Redis を起動 → Backend は `pnpm dev` で起動。

## 依存関係更新

- **Renovate** (推奨) or **Dependabot** で週次に PR 自動作成
- メジャーアップデートはレビュー必須
- マイナー・パッチは CI 緑なら自動 merge 可能（設定次第）

## チケット管理

- **GitHub Issues** をプライマリ（X3 課題管理表）
- マイルストーン = リリース単位
- ラベル: `type:bug` / `type:feature` / `priority:high` / `area:backend` / `area:web` / `area:android`
- Issue テンプレート: `bug_report.md` / `feature_request.md`
- 大規模案件で Excel 課題管理表を併用する場合は、GitHub Issues との双方向同期は手運用 (週次)

## コミュニケーション基盤

- 日次同期: Slack / Teams（プロジェクト共通チャンネル + チーム別チャンネル）
- 設計レビュー会: 週次 1 回 (Zoom / Teams)
- 3 チーム合同 API レビュー: 隔週 (Phase 2-4)
- ドキュメント共有: GitHub Wiki or Confluence (案件次第)

## オンボーディング手順（新規参画者向け）

各リポジトリの `README.md` に以下を含める:

1. 前提環境 (Node バージョン、pnpm、Docker)
2. リポジトリ clone 手順
3. `.env.local` テンプレート (`.env.example` をコピー)
4. 依存関係インストール (`pnpm install`)
5. ローカル起動 (`pnpm dev`)
6. テスト実行 (`pnpm test`)
7. 主要ディレクトリ説明
8. よくあるトラブルシューティング

オンボーディングを 1 日以内に完了できることを目標とする。
