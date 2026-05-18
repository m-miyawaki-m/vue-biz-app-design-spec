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
- [ ] スプリントレビュー（週次）+ 3 チーム合同 API 整合確認（隔週）が継続
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
