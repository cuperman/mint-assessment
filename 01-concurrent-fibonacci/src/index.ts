export async function concurrentMemoFibonacci(n: number): Promise<number> {
  if (n === 0) {
    return 0;
  } else if (n === 1) {
    return 1;
  } else {
    return new Promise((resolve, _reject) => {
      Promise.all([
        concurrentMemoFibonacci(n - 2),
        concurrentMemoFibonacci(n - 1),
      ]).then(([nMinus2, nMinus1]) => {
        resolve(nMinus1 + nMinus2);
      });
    });
  }
}
