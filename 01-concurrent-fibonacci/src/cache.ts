export class Cache<K, V> {
  private store: Map<K, V>;

  constructor(init: Map<K, V> = new Map<K, V>()) {
    this.store = init;
  }

  async fetch(key: K, computeFn: () => Promise<V>): Promise<V> {
    const cached = this.store.get(key);

    if (typeof cached !== "undefined") {
      return cached;
    }

    const computed = await computeFn();
    this.store.set(key, computed);

    return computed;
  }
}
