/* @flow */

export default function delay(n: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, n);
  });
}
