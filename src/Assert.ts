export class Assert {
  static isNull(val: unknown): asserts val is null {
    if (val != null) {
      throw new Error(`${val} is not null.`);
    }
  }

  static isNotNull<T>(val: T): asserts val is NonNullable<T> {
    if (val == null) {
      throw new Error(`${val} is null.`);
    }
  }
}
