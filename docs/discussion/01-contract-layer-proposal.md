# 契約レイヤー 推奨構成案（レビュー中）

> ステータス: 提案中（ユーザレビュー待ち）
> 関連: DD-005（orval/zod/prisma 前提）、DD-002（API/連携仕様書を唯一の共有契約とする方針）

## 背景

Approach C（コードベース完全分離）+ orval/zod/prisma 前提のもとで、フロント 2 チーム（Web/Android）と Backend チームを橋渡しする「契約レイヤー」の論点を 8 つに整理し、それぞれの推奨を提示する。

## 推奨構成 一覧

| #   | 論点                  | 推奨                                                                                                              | 理由                                                                                                                                                       | 主な代替案                                                                                                       |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 1   | OpenAPI 生成方向      | **Zod-first → zod-to-openapi で生成**                                                                             | Backend 実装の真実源が Zod に一本化。Prisma モデルとも自然に共存。手書き YAML のドリフトが構造的に発生しない                                               | (a) Backend コード-first (NestJS @nestjs/swagger) / (b) OpenAPI 手書き-first                                     |
| 2   | Backend フレームワーク | **NestJS + Prisma + zod**（企業案件の安心感優先）                                                                  | 実績豊富、モジュール分割が業務系の規模に合う、Prisma 公式統合あり、@nestjs/zod で連携可能                                                                  | (a) Hono + @hono/zod-openapi（軽量・モダン・型安全強い） / (b) Fastify + zod-to-openapi                          |
| 3   | OpenAPI 配布方法      | **Backend リポジトリで `openapi.yaml` を生成・Git タグ付けして GitHub Releases に添付**                            | チーム完全分離でも、フロント側は Backend リポジトリのソース閲覧不要。バージョン固定取得が容易                                                              | (a) 専用「contract」リポジトリ / (b) npm private package 化 / (c) git submodule                                  |
| 4   | orval 生成構成        | **axios + TanStack Query for Vue + Zod runtime validation + msw mock 生成**                                       | TanStack Query は一覧/キャッシュ/楽観更新が業務系に強い。Zod 実行時検証で API 契約違反を即検出。msw で Backend 独立開発可能                                | (a) fetch + composables 手書き / (b) Pinia 直管理                                                                |
| 5   | エラーレスポンス      | **RFC 7807 (Problem Details) + 業務エラーコード `errorCode: "E-{領域}-{番号}"`**                                  | 標準仕様で各種ツール対応。業務エラーコードで運用・問合せ対応が楽                                                                                           | (a) 独自フォーマット / (b) JSON:API errors                                                                       |
| 6   | 認証                  | **JWT (短命 access + refresh token rotation) + httpOnly Cookie (Web) / Secure Storage (Android)**                  | Web・モバイル両対応で標準的。Refresh rotation で漏洩耐性向上。Web だけ Cookie で XSS 耐性、Android は Capacitor Secure Storage                              | (a) OAuth2/OIDC (Keycloak 等の IdP 分離) / (b) セッション Cookie のみ (Web のみなら可)                            |
| 7   | モック戦略            | **orval `--mock` で MSW mock 自動生成（開発時）＋ Prism で結合テスト用モックサーバー**                              | フロント 2 チームが Backend 完成を待たずに着手可能。CI でも回せる                                                                                          | (a) Backend に dev profile を作る / (b) 専用 mock backend                                                        |
| 8   | バージョニング        | **URL パス方式 (`/v1/`, `/v2/`) ＋ Semver 管理**                                                                   | 業務系で最もシンプル・運用実績豊富。Web と Android が別タイミングで追従可能                                                                                | (a) Header ベース / (b) サブドメイン                                                                             |

## 押さえているポイント

1. **真実源の一本化**: Zod schema が業務型の真実源 → そこから OpenAPI / Prisma / orval-Frontend が派生（Prisma だけは別ファイルで人間が書くが、Zod schema と対応関係を保つ規約を作る）
2. **チーム完全分離との整合**: フロント 2 チームは Backend ソースを見ない。`openapi.yaml`（タグ付きリリース）だけを契約として消費
3. **業務系特性への適合**: フォームバリデーション (Zod) / 一覧キャッシュ (TanStack Query) / エラーコード体系 (RFC 7807 拡張)
4. **モバイル特性への配慮**: 認証トークン保管・オフライン考慮

## 差分議論候補（次回まで持ち越し）

1. **#2 Backend フレームワーク**: NestJS（企業安心）vs Hono（モダン軽量）
2. **#3 OpenAPI 配布**: Backend リポジトリ + Releases vs 専用契約リポジトリ
3. **#6 認証**: 自前 JWT vs IdP 分離 (OIDC)

## 未確定事項

レビューフィードバック反映後にここを「決定事項（DD として decisions.md に転記）」として確定させる。
