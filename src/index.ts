/*********************types start************************* */

// 创建Dict的原数据格式 Vo
type DictSourceVo = Record<string, DictItemVo<unknown>>;

// DictItem 子项数据格式 Vo (泛型E是为了扩展属性用，如状态需要特定背景色、字体颜色等等)
type DictItemVo<V, E extends Record<string, unknown> = Record<string, unknown>> = {
  label: string;
  value: V;
} & E;

// 父级 LocalDict 实例中, 额外添加的属性, 以支持 STATUS.SUCCESS.getLabel() 整条链路的 ts 提示
export type DictInstance<T extends DictSourceVo> = LocalDict<T> & {
  readonly [K in keyof T]: LocalDictItem<T[K]>;
};

// 从源数据推断出 value 的联合类型
export type DictValueOf<T extends DictSourceVo> = T[keyof T]['value'];

// 从源数据推断出 label 的联合类型
export type DictLabelOf<T extends DictSourceVo> = T[keyof T]['label'];

/*********************types end************************* */

// 本地字典类
class LocalDict<T extends DictSourceVo> {
  private list: T[keyof T][] = [];
  private map: Map<DictValueOf<T>, DictLabelOf<T>> = new Map();
  private itemMap = new Map<DictValueOf<T>, T[keyof T]>();
  private dictItemMap = new Map<DictValueOf<T>, LocalDictItem<T[keyof T]>>();

  public constructor(data: T) {
    const self = this as unknown as {
      [key in keyof T]: LocalDictItem<T[key]>;
    };

    for (const key in data) {
      const item = data[key];
      const dictItem = new LocalDictItem(item);
      dictItem._setIndex(this.list.length);
      self[key] = dictItem;

      this.list.push(item);
      this.map.set(dictItem.getValue(), dictItem.getLabel());
      this.itemMap.set(dictItem.getValue(), dictItem.getItem());
      this.dictItemMap.set(dictItem.getValue(), dictItem);
    }
  }

  // 获取 list { DictItemVo }[]
  public getList(): T[keyof T][] {
    return this.list;
  }

  // 获取 Map { value: label }
  public getMap(): ReadonlyMap<DictValueOf<T>, DictLabelOf<T>> {
    return this.map;
  }

  // 获取 ItemMap { value: DictItemVo }
  public getItemMap(): ReadonlyMap<DictValueOf<T>, T[keyof T]> {
    return this.itemMap;
  }

  // 获取 DictItemMap { value: DictItem  }
  public getDictItemMap(): ReadonlyMap<DictValueOf<T>, LocalDictItem<T[keyof T]>> {
    return this.dictItemMap;
  }

  // 根据 value 获取 index
  public getIndex(value: DictValueOf<T>): number {
    const dictItem = this.dictItemMap.get(value);
    if (dictItem) return dictItem.getIndex();
    return -1;
  }

  // 根据 value 获取 label
  public getLabel4Value(value: DictValueOf<T>): DictLabelOf<T> | undefined {
    return this.map.get(value);
  }

  /**
   * 数组 includes 函数, 用于判断 value 是否在 values 数组中
   * @param value 用于检查的字典值
   * @param values 字典值数组
   * @returns boolean
   * 当返回值为true时, 推断出 value 的类型, 否则 value 为 never,只在条件分支使用
   */
  public includes<const U extends readonly DictValueOf<T>[]>(value: DictValueOf<T>, values: U): value is U[number] {
    return values.includes(value);
  }
}

// 字典项类
class LocalDictItem<T extends DictItemVo<V>, V = T['value']> {
  private label;
  private value;
  private item: T;
  protected index: number = 0;

  public constructor(item: T) {
    this.label = item.label;
    this.value = item.value;
    this.item = item;
  }

  /**
   * 获取扩展属性
   * @param key 扩展属性的key
   */
  // public getAttr<K extends Exclude<keyof T, 'label' | 'value'>>(key: K): T[K] {
  //   return this.item[key];
  // }

  // 当前字典项在list中的索引
  public _setIndex(index: number) {
    this.index = index;
  }

  // 获取 index
  public getIndex() {
    return this.index;
  }

  // 获取 label
  public getLabel(): T['label'] {
    return this.label;
  }

  // 获取 value
  public getValue(): T['value'] {
    return this.value;
  }

  public getItem() {
    return this.item;
  }
}

// 因这段代码问题: LocalDict => ;(this as any)[key] = dictItem
// 外部创建字典都需要通过该工厂函数创建, 工厂函数用于兜底 ts 的提示

function createLocalDict<const T extends DictSourceVo>(data: T): DictInstance<T> {
  return new LocalDict(data) as DictInstance<T>;
}

export { createLocalDict };
export default createLocalDict;
