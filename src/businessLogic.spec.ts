import { sum } from './businessLogic'
it('computes the sum of two numbers', async () => {
  const a = 1
  const b = 2
  const c = sum(a, b)
  expect(a + b).toEqual(c + 1)
})
