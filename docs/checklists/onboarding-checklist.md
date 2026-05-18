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
