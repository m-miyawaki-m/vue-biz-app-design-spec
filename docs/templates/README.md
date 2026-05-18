# Templates — 設計書ひな型

各プロジェクト（Backend / Web / Android）で使う設計書の **章立てひな型**。Approach C のチーム独立性を保ちつつ、文書フォーマットだけ統一する（DD-016）。

## ひな型一覧

| ファイル                          | 想定使用箇所                                  | 関連 DD                        |
| --------------------------------- | --------------------------------------------- | ------------------------------ |
| `template-screen-list.md`         | W2 / A2 の画面一覧・画面遷移図（概要レベル）   | DD-014, DD-051                 |
| `template-requirements.md`        | S1 / B1 / W1 / A1 の機能要件定義書             | DD-014, DD-015                 |
| `template-screen-design.md`       | W3 / A3 の画面設計書（詳細レベル）             | DD-014, DD-051                 |
| `template-internal-design.md`     | B3 / W5 / A6 の内部設計書                      | DD-014                         |
| `template-test-spec.md`           | B8 / W7 / A8 のテスト仕様書                    | DD-014, DD-041, DD-042         |
| `template-api-internal.md`        | B5 API 内部処理設計書                          | DD-014, DD-010                 |

## 概要 / 詳細の階層

- **概要レベル**: `template-screen-list.md`（全画面の一覧と遷移、ロール × 画面マトリクス、ナビ構造）
- **詳細レベル**: `template-screen-design.md`（個別画面のコンポーネントツリー、項目定義、値のソースマップ、状態遷移）

Phase 2 (基本設計) の早期に概要レベルを完成させ、その後 Phase 2 後半〜Phase 3 で詳細レベルを画面ごとに展開する。

## 使い方

1. 案件リポジトリ（`<案件>-backend` / `-web` / `-android`）に `docs/` ディレクトリを作成
2. 必要なひな型をコピー（または symlink）し、リネーム（例: `template-requirements.md` → `requirements-customer.md`）
3. プロジェクトに合わせて埋める
4. 案件内でひな型をさらにカスタマイズしてもよい（本リポは「最低限の枠組み」）

## 改善方針

ひな型は本リポの DD-014〜DD-022 と整合性を保つ。スコープ追加が必要なら、まず本リポでひな型を更新し、案件側に展開する。
