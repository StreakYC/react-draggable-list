/* @flow */

export default function delay(n: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, n);
  });
}
