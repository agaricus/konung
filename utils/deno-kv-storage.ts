import type { Storage } from "@gramio/storage";

export class DenoKvStorage implements Storage {
  private kv: Promise<Deno.Kv>;
  private prefix: string[];

  constructor(kv?: Deno.Kv, prefix: string[] = ["gramio"]) {
    this.kv = kv ? Promise.resolve(kv) : Deno.openKv();
    this.prefix = prefix;
  }

  private getKey(key: string): string[] {
    return [...this.prefix, key];
  }

  async get(key: string): Promise<unknown | undefined> {
    const kv = await this.kv;
    const result = await kv.get(this.getKey(key));
    return result.value || undefined;
  }

  async set(key: string, value: unknown): Promise<void> {
    const kv = await this.kv;
    await kv.set(this.getKey(key), value);
  }

  async delete(key: string): Promise<boolean> {
    const kv = await this.kv;
    await kv.delete(this.getKey(key));
    return true;
  }

  async has(key: string): Promise<boolean> {
    const kv = await this.kv;
    const result = await kv.get(this.getKey(key));
    return result.value !== null;
  }

  async clear(): Promise<void> {
    const kv = await this.kv;
    const iter = kv.list({ prefix: this.prefix });

    for await (const { key } of iter) {
      await kv.delete(key);
    }
  }

  async *entries(): AsyncIterableIterator<[string, unknown]> {
    const kv = await this.kv;
    const iter = kv.list({ prefix: this.prefix });

    for await (const { key, value } of iter) {
      const keyStr = key.slice(this.prefix.length).join(":");
      yield [keyStr, value];
    }
  }
}

export function denoKvStorage(
  kv?: Deno.Kv,
  prefix: string[] = ["gramio"],
): DenoKvStorage {
  return new DenoKvStorage(kv, prefix);
}
