# vue-biz-app-design-spec

Vue 系フロントエンド（Vuetify 3 / Vue + Ionic + Capacitor）で、Web 版と Android 版を**完全分離コードベース**として開発する**業務系（CRUD）アプリ**の、設計書体系・実装ステップ・技術選定・開発環境・テスト方法を整理した設計プレイブック。

コードの実装はせず、設計プロセス・ドキュメント体系・開発環境・テスト方法の検討に専念する。

> ⚠ **Backend スタック変更通知（2026-05-19）**: Backend は当初想定の Node.js (NestJS + Prisma + Zod) から **Java 21 + Spring Boot 3.x + MyBatis + Gradle (Groovy DSL)** に変更。詳細 DD は保留中（[DD-050](docs/discussion/decisions.md#dd-050-backend-スタックを-java--spring-に変更前提変更) 参照）。本リポジトリの Backend 関連記述は今後更新される。Frontend / 契約レイヤー / 設計書体系 / 実装ステップ / 開発環境（Frontend 部分）/ テスト戦略（Frontend 部分）は不変で有効。

## スコープ

- 想定アプリ性質: 入力・一覧・フォーム中心の業務系
- Web 版: デスクトップ業務 UI（メイン）
- Android 版: モバイル補助 UI
- 開発体制: 企業・受託スタイル（要件定義書〜テスト仕様書を一通り揃える）
- アプローチ: **Approach C** — Web/Android は完全独立プロジェクト。Backend API のみ共有契約。
- バックエンド前提: **NestJS + Prisma + Zod + orval** をベースとした TypeScript スタック

## ステータス

**ユーザレビュー待ち**（全 6 セクション確定、最終 spec 完成）

## 主要ドキュメント

- **[最終 spec](docs/superpowers/specs/2026-05-19-vue-biz-app-design-spec.md)** — まず読むべき統合ドキュメント
- [設計判断ログ (decisions.md)](docs/discussion/decisions.md) — 全 DD-001〜DD-055 の理由と代替案
- 各セクション詳細:
  - [01 契約レイヤー](docs/discussion/01-contract-layer-proposal.md)
  - [02 設計書体系](docs/discussion/02-document-set.md)
  - [03 実装ステップ](docs/discussion/03-implementation-steps.md)
  - [04 技術選定](docs/discussion/04-tech-selection.md)
  - [05 開発環境](docs/discussion/05-dev-environment.md)
  - [06 テスト方法](docs/discussion/06-testing-strategy.md)
- 再利用アーティファクト:
  - [docs/templates/](docs/templates/) — 設計書ひな型 7 種 (画面一覧 / 要件 / 画面設計 / コンポーネント設計 (Vue/Ionic) / 内部設計 (Backend) / テスト仕様 / API 内部処理)
  - [docs/examples/](docs/examples/) — PR テンプレ / Issue テンプレ / 3 CI ワークフロー / tsconfig / eslint / **prettier / editorconfig / lefthook / gradle静的解析 / checkstyle** / vscode / docker / env / openapi
  - [docs/checklists/](docs/checklists/) — フェーズゲート / PR レビュー / API 変更 / リリース / オンボーディング

## ディレクトリ構成

```
.
├── README.md                                   # このファイル
├── .gitignore
└── docs/
    ├── superpowers/
    │   ├── specs/
    │   │   └── 2026-05-19-vue-biz-app-design-spec.md   # 最終 spec
    │   └── plans/
    │       └── 2026-05-19-playbook-artifacts.md        # 実装計画
    ├── discussion/
    │   ├── decisions.md                        # 設計判断ログ (DD-001〜DD-055)
    │   ├── 01-contract-layer-proposal.md       # 契約レイヤー
    │   ├── 02-document-set.md                  # 設計書体系
    │   ├── 03-implementation-steps.md          # 実装ステップ (9 Phase)
    │   ├── 04-tech-selection.md                # 技術選定詳細比較
    │   ├── 05-dev-environment.md               # 開発環境 (CI/CD・ブランチ戦略 等)
    │   └── 06-testing-strategy.md              # テスト方法 (テストピラミッド)
    ├── templates/                              # 設計書ひな型 (7 種)
    ├── examples/                               # 設定・CI・契約の具体例
    │   ├── github/                             # PR/Issue/CI ワークフロー
    │   ├── tsconfig/                           # TS strict 設定 (DD-026)
    │   ├── eslint/                             # ESLint Flat Config (DD-027)
    │   ├── prettier/                           # Prettier 設定 (DD-054)
    │   ├── editorconfig/                       # .editorconfig (DD-054)
    │   ├── lefthook/                           # pre-commit hooks (DD-053)
    │   ├── gradle/                             # Backend 静的解析 (DD-055)
    │   ├── checkstyle/                         # Checkstyle 設定 (DD-055)
    │   ├── vscode/                             # VS Code 設定 (DD-034)
    │   ├── docker/                             # Docker Compose
    │   ├── env/                                # .env.example
    │   └── openapi/                            # RFC 7807 例 (DD-010)
    └── checklists/                             # 運用チェックリスト (5 種)
```

## 採用された主要技術スタック

| レイヤー   | スタック                                                          |
| ---------- | ----------------------------------------------------------------- |
| Web        | Vue 3 + Vuetify 3 + Vite + Pinia + TanStack Query + axios + Zod   |
| Android    | Vue 3 + Ionic 8 + Capacitor 6+ + Vite + Pinia + TanStack Query    |
| Backend    | NestJS + Prisma + Zod + @asteasolutions/zod-to-openapi + BullMQ   |
| 共通       | TypeScript (strict)、orval、MSW、ESLint + Prettier                 |
| CI/CD      | GitHub Actions（OpenAPI 同期チェックジョブを含む）                |
| テスト     | Vitest / Jest / Playwright / Maestro / k6 / OWASP ZAP / Snyk      |

## 次のアクション

1. **本リポジトリ内容のユーザレビュー**（現在ここ）
2. レビュー承認後、実装計画（implementation plan）を作成
3. 各案件で本スペックを参照し、3 プロジェクト (Backend / Web / Android) を立ち上げ
