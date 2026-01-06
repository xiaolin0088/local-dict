# local-dict

> 一个用于前端项目的 **强类型本地字典工具库**，基于 TypeScript 泛型与类型推断，
> 用于替代传统 `enum / 常量对象`，提升类型安全性与工程可维护性。

---

## 特性（Features）

- ✅ 字典数据即类型，自动推导 `value / label` 联合类型
- ✅ 支持 `STATUS.SUCCESS.getLabel()` 链式访问
- ✅ 同时提供 `list / map / itemMap / dictItemMap`
- ✅ 内置 `includes` 类型守卫，支持条件分支类型收窄
- ✅ 支持扩展属性（颜色、样式、UI 状态等）
- ✅ 零运行时依赖，体积小，Tree Shaking 友好

---

## 安装（Installation）

```bash
npm install local-dict
```

或使用 pnpm / yarn：

```bash
pnpm add local-dict
# 或
yarn add local-dict
```

---

## 快速开始（Quick Start）

### 1. 创建字典

```ts
import createLocalDict from 'local-dict';

const STATUS = createLocalDict({
  SUCCESS: {
    label: '成功',
    value: 1,
    color: 'green'
  },
  FAIL: {
    label: '失败',
    value: 2,
    color: 'red'
  }
});
```

---

### 2. 链式访问（强类型）

```ts
STATUS.SUCCESS.getLabel(); // '成功'
STATUS.FAIL.getValue();   // 2
STATUS.SUCCESS.getIndex(); // 0
```

所有 key / value / label 均具备完整 TS 提示。

---

### 3. 常用查询能力

#### 获取列表（下拉框 / 表单）

```ts
STATUS.getList();
```

#### 根据 value 获取 label

```ts
STATUS.getLabel4Value(1); // '成功'
```

#### 获取 value -> label Map

```ts
STATUS.getMap().get(2); // '失败'
```

---

### 4. 类型守卫（includes）

```ts
function handleStatus(value: number) {
  if (STATUS.includes(value, [1, 2] as const)) {
    // value 在此分支中被收窄为 1 | 2
  }
}
```

---

## 类型定义说明（API）

### DictItemVo

```ts
type DictItemVo<
  V,
  E extends Record<string, unknown> = Record<string, unknown>
> = {
  label: string;
  value: V;
} & E;
```

支持通过泛型 `E` 扩展业务字段。

---

### DictInstance

```ts
export type DictInstance<T extends DictSourceVo> =
  LocalDict<T> & {
    readonly [K in keyof T]: LocalDictItem<T[K]>;
  };
```

用于支持 `DICT.KEY.xxx()` 的链式类型提示。

---

## LocalDict API

```ts
getList(): T[keyof T][]
getMap(): ReadonlyMap<value, label>
getItemMap(): ReadonlyMap<value, DictItemVo>
getDictItemMap(): ReadonlyMap<value, LocalDictItem>
getIndex(value): number
getLabel4Value(value): label | undefined
includes(value, values): value is values[number]
```

---

## 为什么不直接用 enum？

| 对比项 | enum | local-dict |
|------|------|------------|
| label 支持 | ❌ | ✅ |
| 扩展属性 | ❌ | ✅ |
| 类型推导 | 一般 | 强 |
| 链式访问 | ❌ | ✅ |
| 运行时能力 | ❌ | ✅ |

---

## 设计说明

- 所有字典实例 **必须通过 `createLocalDict` 创建**
- 原因：
  - `LocalDict` 内部存在动态属性挂载
  - 工厂函数用于兜底 TS 类型系统

---

## 适用场景

- 业务状态字典
- 枚举 + UI 映射
- 表单选项
- 中后台系统
- 对 TS 类型质量要求较高的项目

---

## License

MIT
