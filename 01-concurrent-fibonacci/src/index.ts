const DELAY_TIME = 5;

const cache: { [key: number]: number } = {
  [0]: 0,
  [1]: 1,
};

export async function concurrentMemoFibonacci(n: number): Promise<number> {
  if (typeof cache[n] !== "undefined") {
    return cache[n];
  }

  return new Promise((resolve, _reject) => {
    setTimeout(async () => {
      const nMinus1 = await concurrentMemoFibonacci(n - 1);
      const nMinus2 = await concurrentMemoFibonacci(n - 2);
      const result = nMinus1 + nMinus2;
      cache[n] = result;
      resolve(result);
    }, DELAY_TIME);
  });
}
