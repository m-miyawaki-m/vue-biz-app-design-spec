# コンポーネント設計書 — [対象範囲]

> ひな型: vue-biz-app-design-spec/docs/templates/template-component-design.md
> Vue / Ionic フロントエンド (W5 / A6) 用の専用ひな型。
> Backend モジュールは `template-internal-design.md` を使用する。

## 0. 文書情報

| 項目                  | 内容                                             |
| --------------------- | ------------------------------------------------ |
| 文書 ID                | CD-[YYYY-NNN]                                   |
| バージョン             | 0.1.0                                            |
| 作成日                 | YYYY-MM-DD                                       |
| 作成者                 | [氏名]                                           |
| 対象範囲               | [Web 全体 / 顧客領域 / 認証領域 等]              |
| 対象プラットフォーム    | Web (Vuetify) / Android (Ionic)                  |

### 更新履歴

| バージョン | 日付       | 更新者 | 変更内容 |
| ---------- | ---------- | ------ | -------- |
| 0.1.0      | YYYY-MM-DD | [氏名] | 初版     |

---

## 1. 設計方針

### 1.1 コンポーネント分類

採用方針: **Atomic Design ベース + 機能別フォルダ**

| 分類                | 例                                            | 配置                          | 特徴                                         |
| ------------------- | --------------------------------------------- | ----------------------------- | -------------------------------------------- |
| 原子部品 (atoms)     | `<TextInput>`, `<StatusBadge>`, `<PrimaryButton>` | `src/components/atoms/`       | 単独で意味を持つ最小単位                     |
| 分子部品 (molecules) | `<SearchField>`, `<UserAvatar>`               | `src/components/molecules/`   | 原子の組み合わせ。ローカル状態あり可          |
| 部分 (organisms)     | `<CustomerSearchForm>`, `<CustomerTable>`     | `src/components/<feature>/`   | 業務領域に紐づく                              |
| ページ (pages)       | `<CustomerListPage>`                          | `src/views/<feature>/`        | ルーティングに対応                            |
| レイアウト (layouts) | `<AppBar>`, `<MainLayout>`                    | `src/layouts/`                | 複数ページで共有                              |

### 1.2 shared vs feature-specific

- **shared**: 案件内の複数領域で再利用される汎用部品 → `src/components/shared/`
- **feature-specific**: 特定の業務領域固有 → `src/components/<feature>/`

迷ったら最初は feature-specific に置き、2 回目に使う時点で shared へ昇格させる（rule of three）。

---

## 2. ディレクトリ構造

```
src/
├── views/                   # ページコンポーネント (router 紐付け)
│   ├── auth/
│   │   └── LoginPage.vue
│   └── customer/
│       ├── CustomerListPage.vue
│       └── CustomerDetailPage.vue
├── layouts/                 # レイアウト
│   ├── AppBar.vue
│   └── MainLayout.vue
├── components/
│   ├── atoms/               # 原子部品
│   │   ├── TextInput.vue
│   │   └── PrimaryButton.vue
│   ├── molecules/           # 分子部品
│   │   └── SearchField.vue
│   ├── shared/              # 共通 organisms
│   │   ├── CreateFab.vue
│   │   └── ConfirmDialog.vue
│   └── customer/            # 業務領域固有
│       ├── CustomerSearchForm.vue
│       └── CustomerTable.vue
├── composables/             # Vue Composables
│   ├── useAuth.ts
│   ├── useCustomers.ts
│   └── useFormValidation.ts
├── stores/                  # Pinia
│   ├── auth.store.ts
│   └── customer-search.store.ts
├── api/
│   ├── generated/           # orval 生成 (lint/format 対象外推奨)
│   └── client.ts
├── router/
│   └── index.ts
├── plugins/                 # Vuetify / Ionic / i18n
│   └── vuetify.ts
└── main.ts
```

### Android (Ionic) 追加

```
src/
└── plugins/
    ├── ionic.ts
    └── capacitor.ts             # Capacitor プラグイン初期化
```

---

## 3. コンポーネント一覧

### 3.1 ページ (Views)

| ID         | 名前                | 関連画面 ID  | 関連ルート       | 配置                                              |
| ---------- | ------------------- | ------------ | ---------------- | ------------------------------------------------- |
| CMP-V-001  | LoginPage           | SCR-001      | /login           | `src/views/auth/LoginPage.vue`                    |
| CMP-V-002  | CustomerListPage    | SCR-002      | /customers       | `src/views/customer/CustomerListPage.vue`         |
| CMP-V-003  | CustomerDetailPage  | SCR-003      | /customers/:id   | `src/views/customer/CustomerDetailPage.vue`       |

### 3.2 レイアウト

| ID         | 名前         | 用途                          | 配置                              |
| ---------- | ------------ | ----------------------------- | --------------------------------- |
| CMP-L-001  | MainLayout   | 認証後の標準レイアウト         | `src/layouts/MainLayout.vue`      |
| CMP-L-002  | AppBar       | 上部バー (アプリ名・ユーザーメニュー) | `src/layouts/AppBar.vue`         |

### 3.3 業務領域 organisms

| ID         | 名前                | 機能              | 配置                                                          |
| ---------- | ------------------- | ----------------- | ------------------------------------------------------------- |
| CMP-O-001  | CustomerSearchForm  | 顧客検索フォーム   | `src/components/customer/CustomerSearchForm.vue`              |
| CMP-O-002  | CustomerTable       | 顧客一覧テーブル   | `src/components/customer/CustomerTable.vue`                   |
| CMP-O-003  | CustomerDetailCard  | 顧客詳細カード     | `src/components/customer/CustomerDetailCard.vue`              |

### 3.4 shared organisms

| ID         | 名前              | 機能                       | 配置                                            |
| ---------- | ----------------- | -------------------------- | ----------------------------------------------- |
| CMP-S-001  | CreateFab         | 新規作成 FAB               | `src/components/shared/CreateFab.vue`           |
| CMP-S-002  | ConfirmDialog     | 汎用確認ダイアログ          | `src/components/shared/ConfirmDialog.vue`       |
| CMP-S-003  | ErrorSnackbar     | エラー通知スナックバー      | `src/components/shared/ErrorSnackbar.vue`       |

### 3.5 分子・原子部品

| ID         | 名前         | 機能                       | 配置                                            |
| ---------- | ------------ | -------------------------- | ----------------------------------------------- |
| CMP-M-001  | SearchField  | ラベル付き検索入力          | `src/components/molecules/SearchField.vue`      |
| CMP-A-001  | TextInput    | テキスト入力ラッパー        | `src/components/atoms/TextInput.vue`            |
| CMP-A-002  | StatusBadge  | 状態バッジ (active/inactive 等) | `src/components/atoms/StatusBadge.vue`      |
| CMP-A-003  | PrimaryButton | プライマリボタン (Vuetify ラップ) | `src/components/atoms/PrimaryButton.vue`  |

---

## 4. 主要コンポーネント詳細

**変更頻度が高い・複雑な・shared コンポーネントを優先**して記述する。原子部品は省略可（命名・型シグネチャだけで十分）。

### CMP-O-001: CustomerSearchForm

| 項目        | 内容                                           |
| ----------- | ---------------------------------------------- |
| 種別         | organism (feature-specific)                    |
| 配置         | `src/components/customer/CustomerSearchForm.vue` |
| 利用ページ   | SCR-002 (CustomerListPage)                     |

#### Props

```typescript
interface Props {
  modelValue: SearchCriteria;     // v-model 双方向バインド
  loading?: boolean;              // ローディング中の操作抑止
}
```

#### Emits

```typescript
interface Emits {
  'update:modelValue': (criteria: SearchCriteria) => void;
  'submit': () => void;
  'reset': () => void;
}
```

#### Slots

なし

#### 内部状態

なし（フォーム値は親から受け取る v-model パターン。コンポーネント内で `ref` を持たない）

#### 利用 Composables

- `useFormValidation(customerSearchSchema)` — Zod schema からの実行時検証

#### 子コンポーネント

- `<TextInput v-model="..." />` × 2（顧客コード / 顧客名）
- `<StatusSelect v-model="..." />`
- `<v-btn @click="onSubmit">検索</v-btn>`
- `<v-btn variant="text" @click="onReset">クリア</v-btn>`

#### スタイリング

- Vuetify Grid (`v-row` / `v-col`) で 3 列レイアウト（>= md）/ 1 列（< md）
- 検索ボタンは右寄せ、クリアボタンは左寄せ

---

### CMP-O-002: CustomerTable

| 項目        | 内容                                           |
| ----------- | ---------------------------------------------- |
| 種別         | organism (feature-specific)                    |
| 配置         | `src/components/customer/CustomerTable.vue`    |
| 利用ページ   | SCR-002                                        |

#### Props

```typescript
interface Props {
  items: readonly Customer[];
  total: number;
  loading?: boolean;
  page: number;
  perPage: number;
  sortBy?: SortKey;
}
```

#### Emits

```typescript
interface Emits {
  'row-click': (id: CustomerId) => void;
  'update:page': (page: number) => void;
  'update:sortBy': (sort: SortKey) => void;
}
```

#### Slots

```typescript
defineSlots<{
  'item.status': (props: { item: Customer }) => any;  // 状態列のカスタム描画
  'no-data': () => any;                                // データなし時の表示
}>();
```

---

### CMP-S-002: ConfirmDialog

| 項目        | 内容                                           |
| ----------- | ---------------------------------------------- |
| 種別         | organism (shared)                              |
| 配置         | `src/components/shared/ConfirmDialog.vue`      |
| 利用箇所     | 全画面（削除確認・送信確認等）                  |

#### Props

```typescript
interface Props {
  modelValue: boolean;                  // 開閉状態 (v-model)
  title: string;
  message: string;
  confirmLabel?: string;                // default: '実行'
  cancelLabel?: string;                 // default: 'キャンセル'
  variant?: 'danger' | 'primary';       // 危険操作は赤
}
```

#### Emits

```typescript
interface Emits {
  'update:modelValue': (open: boolean) => void;
  'confirm': () => void;
  'cancel': () => void;
}
```

---

## 5. Composables 一覧

| 名前                       | 引数                          | 戻り値                                              | 責務                                                 | 配置                                          |
| -------------------------- | ----------------------------- | --------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| `useAuth()`                | -                             | `{ user, login, logout, hasRole, isAuthenticated }` | 認証状態と操作（authStore のラッパー）                | `src/composables/useAuth.ts`                  |
| `useCustomersQuery(criteria)` | `Ref<SearchCriteria>`         | TanStack Query result `{ data, isFetching, error }` | 顧客一覧取得（orval 生成型を内包）                    | `src/composables/useCustomers.ts`             |
| `useCustomerQuery(id)`     | `Ref<CustomerId>`              | TanStack Query result                                | 顧客 1 件取得                                          | `src/composables/useCustomers.ts`             |
| `useFormValidation(schema)` | Zod schema                    | `{ validate, errors, isValid }`                      | フォームの Zod 実行時検証                              | `src/composables/useFormValidation.ts`        |
| `useDebouncedSearch(fn, ms)` | function, delay              | debounced function                                    | 検索入力のデバウンス                                  | `src/composables/useDebounce.ts`              |
| `useDialog()`              | -                             | `{ open, close, confirm }`                            | shared ダイアログの開閉と Promise 化                  | `src/composables/useDialog.ts`                |
| `useNotification()`        | -                             | `{ success, error, info }`                            | スナックバー通知のグローバル制御                       | `src/composables/useNotification.ts`          |

### 5.1 Composables の責務範囲

- **UI 横断のロジック抽出に使う**（API 取得・フォーム検証・デバウンス・通知等）
- ストア (Pinia) の直接 import を避け、composable 越しに使う（テストしやすさ）
- 1 つの composable は 1 つの責務に絞る（複合する場合は分割）

---

## 6. 命名規約

| 種別                  | 規約                          | 例                                |
| --------------------- | ----------------------------- | --------------------------------- |
| コンポーネント名 (SFC) | PascalCase、Multi-word         | `CustomerSearchForm.vue`          |
| ページコンポーネント   | `<Feature>Page.vue`            | `CustomerListPage.vue`            |
| Composable            | `use<Name>` (camelCase)        | `useAuth()`, `useCustomersQuery()` |
| Store                 | `use<Name>Store`               | `useAuthStore()`                  |
| props                 | camelCase                      | `modelValue`, `isLoading`         |
| events (emit)          | kebab-case 発火・camelCase 定義 | `'update:modelValue'`, `'row-click'` |
| Pinia state           | camelCase                      | `currentUser`                     |
| Pinia getter           | camelCase                      | `isAuthenticated`                 |
| TypeScript 型          | PascalCase                     | `SearchCriteria`, `Customer`      |
| TypeScript 関数        | camelCase                      | `parseQueryToCriteria()`          |
| ファイル名 (.ts)        | kebab-case                     | `customer-search.store.ts`        |

ESLint ルール `vue/component-name-in-template-casing: PascalCase` で template も PascalCase 強制 (DD-027)。

---

## 7. スタイリング方針

### 7.1 Web (Vuetify)

- Vuetify テーマで色・タイポグラフィを集中管理 (`src/plugins/vuetify.ts`)
- カスタム CSS は最小限。必要なら CSS Variables で
- `<style scoped>` を基本、共通スタイルは `src/assets/styles/`
- ユーティリティクラスは Vuetify 標準 (`d-flex`, `pa-4`, `ma-2` 等) を優先

### 7.2 Android (Ionic)

- Ionic CSS Variables (`--ion-color-primary` 等) で色管理
- ダークモード対応は `prefers-color-scheme` メディアクエリで自動切替
- プラットフォーム別表示は `ion-platform-ios` / `ion-platform-android` クラスで分岐（将来 iOS 対応視野）
- セーフエリアは `ion-padding-safe-area-top` を使う

---

## 8. 共通実装パターン

### 8.1 フォーム実装パターン

```typescript
// 1. Zod schema 定義 (src/schemas/customer.schema.ts)
const customerFormSchema = z.object({
  code: z.string().min(1).max(20).regex(/^[A-Z0-9]+$/),
  name: z.string().min(1).max(100),
  status: z.enum(['active', 'inactive']),
});

// 2. Composable で検証
const { validate, errors } = useFormValidation(customerFormSchema);

// 3. submit ハンドラ
const onSubmit = async () => {
  if (!validate(form.value)) return;
  await mutate(form.value);
};
```

### 8.2 一覧画面実装パターン

```typescript
// 1. URL クエリと Pinia store を同期
const router = useRouter();
const route = useRoute();
const criteria = computed(() => parseQueryToCriteria(route.query));

// 2. TanStack Query で取得
const { data, isFetching, error } = useCustomersQuery(criteria);

// 3. 検索条件変更時に URL を更新
const onSearch = (newCriteria: SearchCriteria) => {
  router.push({ query: serializeCriteriaToQuery(newCriteria) });
};
```

### 8.3 モーダル実装パターン

- Pinia store `useDialogStore()` で開閉状態を管理
- shared `<ConfirmDialog />` で標準確認モーダルを再利用
- Vuetify `<v-dialog v-model="isOpen" />` または Ionic `<ion-modal />` を採用
- 確認結果は Promise 化（`await useDialog().confirm({...})`）

### 8.4 エラーハンドリングパターン

```typescript
// HTTP エラーを Snackbar 表示にマップ
const { error } = useCustomersQuery(criteria);
const { error: notifyError } = useNotification();

watch(error, (err) => {
  if (!err) return;
  // RFC 7807 ProblemDetails を Snackbar 用テキストに変換
  notifyError(formatProblemDetails(err));
});
```

---

## 9. アクセシビリティ規約

| 項目                | 規約                                                              |
| ------------------- | ----------------------------------------------------------------- |
| キーボード操作       | 全ての主要アクションはキーボードで完結可能（Enter / Space / Esc / Tab） |
| ARIA 属性           | 動的状態を `aria-busy` / `aria-expanded` / `aria-invalid` で表現    |
| フォーカス管理       | モーダル開閉時はフォーカストラップ必須                                 |
| カラーコントラスト   | WCAG AA 準拠 (4.5:1 以上)                                          |
| エラーメッセージ     | `aria-describedby` で入力フィールドと関連付け                       |
| 画面読み上げ         | 動的更新は `aria-live="polite"` 領域に出す                          |

---

## 10. テスト方針

- **原子部品**: Vue Test Utils + @testing-library/vue でユーザー視点テスト
- **organisms**: 同上 + MSW で API モック（DD-009, DD-044）
- **ページ**: コンポーネントテスト レベル（E2E は別途 Playwright で）
- **Composables**: 関数として単体テスト（`useFormValidation` 等は副作用なしのため通常テスト）
- カバレッジ目標: UI 70% / ロジック (composables) 80% (DD-042)

詳細は **W7 / A8 テスト仕様書** を参照。

---

## 11. 補足事項

- [補足や検討中の事項を残す]
- [将来 iOS 対応する場合の影響範囲メモ等]

---

## 12. 関連ドキュメント

- W2 / A2 画面一覧 (template-screen-list.md)
- W3 / A3 画面設計書 (template-screen-design.md)
- W4 状態管理・データフロー設計書
- W7 / A8 テスト仕様書 (template-test-spec.md)
- S2 データ辞書
- S5 業務エラーコード一覧
