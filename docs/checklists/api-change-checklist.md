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
