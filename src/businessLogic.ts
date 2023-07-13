import axios from 'axios'

interface IQuote {
  a: string // the author
  c: string // pages?
  h: string // formatted quote
  q: string // quote
}
export const getquote = async (): Promise<string[]> => {
  const response = await axios.get<IQuote[]>('https://zenquotes.io/api/quotes/')
  const quotes = response.data.map(quote => quote.q)
  return quotes
}
