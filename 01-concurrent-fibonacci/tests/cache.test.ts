import { Cache } from "../src/cache";

describe("Cache", () => {
  describe("fetch", () => {
    it("calls the compute function on cache miss", async () => {
      const cache = new Cache<string, string>();
      const computeFn = jest.fn().mockResolvedValue("bar");

      const value = await cache.fetch("foo", computeFn);

      expect(value).toEqual("bar");
      expect(computeFn).toHaveBeenCalledTimes(1);
    });

    it("returns cached values on cache hit", async () => {
      const init = new Map<string, string>([["foo", "bar"]]);
      const cache = new Cache<string, string>(init);
      const computeFn = jest.fn().mockResolvedValue("bar");

      const value = await cache.fetch("foo", computeFn);

      expect(value).toEqual("bar");
      expect(computeFn).not.toHaveBeenCalled();
    });
  });
});
