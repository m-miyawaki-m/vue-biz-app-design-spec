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
