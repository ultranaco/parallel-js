import { Parallel } from './index';
jest.setTimeout(9000);
let timeout = 2000;

test("Test 1: 3 tasks simultaneously over 10 invokes", async ()=> {
  const parallel = new Parallel(3);
  for (let i = 0; i < 9 ;i++) {
    await parallel.exec(heavyWork, i);
  }

  await parallel.wait();

  expect(parallel.tasks).toBe(0);
});

function heavyWork(index: Number): Promise<void>{
  return new Promise((resolve)=>{
    timeout = timeout - 100;

    setTimeout(() => {
      const date = new Date();
      const min = date.getMinutes();
      const sec = date.getSeconds();
      const ms = date.getUTCMilliseconds();
      const time = `${min}:${sec}-${ms}`;
      console.log(`Index: ${index}, Time: ${time}`);
      resolve();
    }, timeout);

  });
}
