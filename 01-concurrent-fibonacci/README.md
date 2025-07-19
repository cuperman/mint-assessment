# Exercise 01 – Concurrent Memoized Fibonacci

Implement the function `concurrentMemoFibonacci(n: number): Promise<number>` that returns the `n`-th Fibonacci number. The function must be asynchronous and memoized so that concurrent calls for the same `n` share the computation.

Use `setTimeout` to simulate an expensive operation. Ensure that when multiple calls request the same `n` at the same time, the calculation only occurs once and the result is reused.

## Example

```ts
await Promise.all([
  concurrentMemoFibonacci(35),
  concurrentMemoFibonacci(35),
  concurrentMemoFibonacci(34),
]);
```

The call above should compute `fibonacci(35)` only once.

## How to test

Run the following from the repository root:

```bash
npm test 01-concurrent-fibonacci
```

The tests are in `tests/index.test.ts` and should pass when your implementation is complete.
