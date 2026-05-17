# vue-biz-app-design-spec

Vue 系フロントエンド（Vuetify 3 / Vue + Ionic + Capacitor）で、Web 版と Android 版を**完全分離コードベース**として開発する**業務系（CRUD）アプリ**の、設計書体系・実装ステップ・技術選定・テスト方法を整理する設計スペック集。

コードの実装はせず、設計プロセス・ドキュメント体系・開発環境・テスト方法の検討に専念する。

## スコープ

- 想定アプリ性質: 入力・一覧・フォーム中心の業務系
- Web 版: デスクトップ業務 UI（メイン）
- Android 版: モバイル補助 UI
- 開発体制: 企業・受託スタイル（要件定義書〜テスト仕様書を一通り揃える）
- アプローチ: **Approach C** — Web/Android は完全独立プロジェクト。Backend API のみ共有契約。
- バックエンド前提: **orval / zod / prisma** をベースとした TypeScript スタック

## ディレクトリ

- `docs/discussion/` — ブレインストーミング過程・意思決定ログ
- `docs/superpowers/specs/` — 最終 spec ドキュメント

## ステータス

ブレインストーミング進行中（契約レイヤー詳細 → 設計書体系 → 実装ステップ → 技術選定 → 開発環境 → テスト方法 の順で整理予定）。

## 進行中の検討

- [docs/discussion/decisions.md](docs/discussion/decisions.md) — これまでの意思決定ログ
- [docs/discussion/01-contract-layer-proposal.md](docs/discussion/01-contract-layer-proposal.md) — 契約レイヤー推奨構成案（レビュー中）
