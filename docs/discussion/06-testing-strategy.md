# テスト方法 — 確定

> ステータス: **確定**（DD-041〜DD-049 として decisions.md に転記済み）
> 関連: DD-009（orval + MSW）、DD-012（モック戦略）、DD-020（実装ステップ）、DD-021（単体テストは Phase 4 内 TDD）

## テスト戦略全体像

業務系 CRUD + チーム独立並走を前提に、**テストピラミッド** を採用する。

```
                      △  実機・運用試験 (Phase 6-7)
                     ／ ＼  - Android デバイスマトリクス
                    ／   ＼  - UAT (お客様シナリオ)
                   ／─────＼
                  ／  E2E   ＼  Phase 5
                 ／   テスト  ＼  - Playwright (Web)
                ／─────────────＼ - Maestro / Appium (Android)
               ／    結合テスト    ＼  Phase 5
              ／  - 契約テスト       ＼
             ／   - API 結合           ＼
            ／─────────────────────────────＼
           ／         単体テスト              ＼  Phase 4 (TDD)
          ／  - 関数・コンポーネント単位        ＼
         ／───────────────────────────────────────＼
        ／              静的検査                     ＼ 常時
       ／    - typecheck / ESLint / Prettier           ＼
      ／──────────────────────────────────────────────────＼
```

底辺ほど自動化率を高く、上層は人手・実機を含む。

## カバレッジ目標

| レイヤー        | 対象              | カバレッジ目標                                |
| --------------- | ----------------- | --------------------------------------------- |
| 静的検査        | 全コード          | 100%（CI で必須）                            |
| 単体テスト      | Backend サービス層 / Web/Android Composables | **80%** (ステートメント・ブランチ) |
| 単体テスト      | UI コンポーネント | **70%**（純粋ロジック中心）                  |
| 結合テスト      | API エンドポイント | 全エンドポイント 1 シナリオ以上              |
| E2E             | 主要業務フロー    | **黄金パス 100%**、主要例外シナリオ 80%       |
| 実機テスト      | 主要 Android デバイス | デバイスマトリクス全件                    |
| 性能テスト      | 主要 API + Web 主要画面 | 非機能要件 (S6) 達成                    |
| セキュリティ    | 全コード + デプロイ環境 | Critical/High ゼロ                       |

## レイヤー別ツールチェーン

### 静的検査（全プロジェクト共通）

| ツール                        | 用途                                      |
| ----------------------------- | ----------------------------------------- |
| **TypeScript Compiler (tsc)** | 型チェック（`--noEmit`）                  |
| **ESLint**                    | コード品質ルール                          |
| **Prettier**                  | フォーマット                              |
| **markdownlint**              | Markdown ドキュメントの整形               |
| **commitlint** (任意)         | コミットメッセージ規約 (Conventional Commits) |

すべて pre-commit hook（lefthook or husky + lint-staged）+ CI で実行。

### 単体テスト

| プロジェクト | ツール               | 補足                                                                     |
| ------------ | -------------------- | ------------------------------------------------------------------------ |
| Backend      | **Jest** + **ts-jest** | NestJS デフォルト。@nestjs/testing でモジュール組み立て                  |
| Web          | **Vitest**           | Vite ネイティブ・速い・Jest 互換 API                                     |
| Android      | **Vitest**           | Web と同じ（Capacitor 周りはモック）                                       |

#### モック方針

- 外部 API: MSW (orval --mock 自動生成)
- 時刻: `vi.useFakeTimers()` / `vi.setSystemTime()`
- ファイルシステム: `memfs`
- DB: Backend ではテスト DB (Docker) を使うことを推奨、ユニットレベルでは Prisma クライアントをモック (`prismock` 等)

### コンポーネントテスト（Web / Android）

| ツール                                | 用途                                                  |
| ------------------------------------- | ----------------------------------------------------- |
| **Vue Test Utils**                    | Vue コンポーネントマウント・操作                       |
| **@testing-library/vue**              | ユーザー視点でのクエリ（推奨）                        |
| **MSW**                               | API モック                                            |
| **@ionic/vue-test-utils** (Android)   | Ionic コンポーネント特化のテストユーティリティ        |

### 結合テスト

| プロジェクト | アプローチ                                                                                                                                |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Backend      | NestJS Testing module で controller → service → Prisma を結合。テスト DB (Docker Compose の `db` を `test` 用に複製) を使用              |
| Web          | dev server (Vite) + MSW で API モックして主要画面遷移をシナリオテスト。`@playwright/test` でブラウザ操作                                |
| Android      | PWA build を Playwright で動作確認（ネイティブブリッジ部分はモック）。Capacitor ビルド版は別途実機 / Emulator で確認 (E2E 段)            |

### 契約テスト

| アプローチ                                | 評価                          |
| ----------------------------------------- | ----------------------------- |
| **OpenAPI schema validation**             | 採用（Backend ↔ OpenAPI ↔ Frontend）|
| Pact (Consumer-Driven Contracts)          | 不採用（OpenAPI 自動生成で代替可能） |

#### OpenAPI schema validation の実装

- **Backend 側**: 各エンドポイントのレスポンスを Zod schema で検証してから返す（DD-009 と整合）。CI で全エンドポイントに対するレスポンスサンプル生成 + OpenAPI 整合チェック
- **Frontend 側**: orval が生成した型 + Zod 実行時検証で受信時に整合チェック。違反時はエラーログを Sentry へ送出

Pact 不採用理由: orval + Zod + 自動生成の組み合わせで「コンシューマー側の期待」が型レベルで自動表現されるため、別途 Pact ブローカーを運用する重複コストが見合わない。

### E2E テスト

| プロジェクト | ツール                              | 用途                                                            |
| ------------ | ----------------------------------- | --------------------------------------------------------------- |
| Web          | **Playwright**                      | Chromium / Firefox / WebKit マトリクス、画面操作シナリオ全体    |
| Android      | **Maestro** (推奨) または **Appium** | Capacitor ビルド版を実機 / Emulator で操作                       |
| Android (PWA build) | **Playwright**               | PWA としての動作確認 (Capacitor 抜きの最小確認)                  |

#### Playwright の活用

- `playwright.config.ts` で projects (chromium / firefox / webkit / mobile-chromium) を分離
- Storage State (ログイン済み) を再利用してテスト高速化
- スクリーンショット・トレース取得を CI 失敗時のみ有効化

#### Maestro vs Appium

| ツール   | 学習コスト | 記述形式      | 並列実行  | エミュレータ起動 | 推奨            |
| -------- | ---------- | ------------- | --------- | ---------------- | --------------- |
| Maestro  | 低         | YAML          | ◯         | 自動             | **採用** (シンプル業務系シナリオ向け) |
| Appium   | 高         | 各言語スクリプト | ◯         | 手動寄り         | 高度カスタムが必要な場合 |

### 性能テスト

| 対象       | ツール                       | 指標                                            |
| ---------- | ---------------------------- | ----------------------------------------------- |
| Backend API | **k6** (推奨) または Artillery | RPS、レイテンシ p50/p95/p99、エラー率           |
| Web 画面   | **Lighthouse CI**            | LCP、FID/INP、CLS、TBT                          |
| Web 画面   | **WebPageTest**              | 詳細なネットワークプロファイル                  |
| Android    | Capacitor 性能計測 + 実機計測 | 起動時間、画面遷移、メモリ使用量                |

性能目標値は **S6 非機能要件書** で定義する。Phase 6 のシステムテストで合否判定。

### セキュリティテスト

| カテゴリ              | ツール / 方法                            | タイミング                  |
| --------------------- | ---------------------------------------- | --------------------------- |
| 静的解析 (SAST)       | **ESLint security plugin**, **Snyk Code** | PR 時 + 週次                |
| 依存脆弱性            | **npm audit**, **Snyk**, **Dependabot/Renovate** | PR 時 + 週次              |
| 動的解析 (DAST)       | **OWASP ZAP** (Backend に対して)         | Phase 6 + リリース前        |
| 認証・認可テスト      | 手動シナリオ + 自動シナリオ              | Phase 5-6                   |
| Secret 検出           | **gitleaks** or **truffleHog**           | PR 時 + 週次                |
| 監査ログ検証          | B6 ログ設計書の対象操作をテストでカバー  | Phase 4-5                   |

### 実機・デバイスマトリクス（Android）

| デバイス区分              | 例                                         | 優先度     |
| ------------------------- | ------------------------------------------ | ---------- |
| ハイエンド最新            | Pixel 8 / Galaxy S24 (Android 14)          | 必須       |
| ミドルレンジ              | Pixel 6a / Galaxy A シリーズ (Android 13)   | 必須       |
| 旧 OS 対応下限            | Android 12 (旧端末)                        | 必須       |
| 大画面 / タブレット (任意) | Galaxy Tab S9                              | 案件次第   |

クラウド実機サービス（**BrowserStack** or **Sauce Labs**）+ **Firebase Test Lab** で網羅。

### ビジュアルリグレッション（任意）

| ツール                    | 用途                                          |
| ------------------------- | --------------------------------------------- |
| **Chromatic + Storybook** | コンポーネントレベルのビジュアル差分検出      |
| **Playwright snapshot**   | 画面レベルのスクリーンショット比較            |

Phase 4 で Storybook を整備するなら Chromatic 採用が効果的。本スペックでは「採用余地あり」とし、案件規模次第。

## テスト実行戦略

### 開発時 (Phase 4)

- 機能開発と並行して TDD で単体テスト記述 (DD-021)
- ローカル: `pnpm test:watch` でホットリロード
- pre-commit hook: lint + typecheck + 影響ファイルの単体テストのみ実行 (lefthook / lint-staged)

### PR 時 (CI)

- 全段階 (typecheck / lint / unit / component / e2e (smoke) / openapi-sync)
- 並列ジョブ化でフィードバック < 10 分を目標

### main マージ後 (CI)

- 全段階 + デプロイパイプライン
- デプロイ後の E2E (smoke) を dev 環境で実行

### 夜次 / 週次 (Scheduled)

- 性能テスト (k6) — staging に対して
- セキュリティスキャン (OWASP ZAP, Snyk)
- 実機 E2E (BrowserStack / Firebase Test Lab)
- 全 E2E full スイート

### Phase 5-6 集中テスト期間

- 結合テスト計画 (Web×Backend、Android×Backend、Web↔Android データ整合)
- システムテスト (性能、セキュリティ、運用シナリオ)
- 不具合管理表で進捗追跡

### Phase 7 UAT

- お客様による業務シナリオ確認
- フィードバック反映ループ

## 不具合管理

- **GitHub Issues** で起票（X3 課題管理表）
- ラベル: `bug` + `severity:critical|high|medium|low` + `area:backend|web|android`
- Severity 定義:
  - **Critical**: 業務停止・データ破損
  - **High**: 主要機能が動作不能
  - **Medium**: 機能制限あり、回避策あり
  - **Low**: UI 細部・軽微な表示崩れ
- リリース判定: Critical/High ゼロ、Medium は許容範囲合意

## テストデータ管理

| 用途                | 方針                                                                      |
| ------------------- | ------------------------------------------------------------------------- |
| 単体テスト          | Test ごとにインライン生成 (factory)                                       |
| 結合テスト          | Seed スクリプト + 各テストでトランザクション ROLLBACK                     |
| E2E                 | 専用テストデータベース (Docker Compose の `test` プロファイル)            |
| 性能テスト          | 本番相当のボリュームデータを別途生成 (匿名化済み or 合成)                 |
| UAT                 | お客様提供のテストデータ + ダミーデータ                                  |

**禁止事項**: 本番データを開発・テスト環境にコピー (PII 漏洩リスク)。

## テスト関連の成果物（再掲）

| 文書                            | 担当               | 含む内容                                          |
| ------------------------------- | ------------------ | ------------------------------------------------- |
| B8 Backend テスト仕様書         | Backend            | 単体・結合・契約・性能テストケース                |
| W7 Web テスト仕様書             | Web                | 単体・コンポーネント・E2E テストケース            |
| A8 Android テスト仕様書         | Android            | 単体・コンポーネント・E2E・実機マトリクス        |
| テスト計画書 (Phase 5-7 専用)   | 品質管理 / PM      | テストスケジュール・体制・合否基準                |
| テスト結果報告書 (Phase 5-7 末) | 品質管理 / PM      | 実施結果・不具合一覧・改善事項                    |
