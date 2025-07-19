import { Cache } from "./cache";

const DELAY_TIME = 5;

const cache = new Cache<number, number>(
  new Map<number, number>([
    [0, 0],
    [1, 1],
  ])
);

export async function concurrentMemoFibonacci(n: number): Promise<number> {
  return cache.fetch(n, async () => {
    return new Promise((resolve, _reject) => {
      setTimeout(async () => {
        const nMinus1 = await concurrentMemoFibonacci(n - 1);
        const nMinus2 = await concurrentMemoFibonacci(n - 2);
        resolve(nMinus1 + nMinus2);
      }, DELAY_TIME);
    });
  });
}
