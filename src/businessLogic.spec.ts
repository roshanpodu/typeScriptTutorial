import { getquote } from './businessLogic'
it('Get the set of quotes', async () => {
  const quotes = await getquote()
  expect(Array.isArray(quotes)).toBe(true)
})
