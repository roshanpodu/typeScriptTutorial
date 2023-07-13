#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'
import { getquote } from './businessLogic'
import { version, description } from '../package.json'

console.log(figlet.textSync('Quote Generator'))

const program = new Command()

program
  .version(version)
  .description(description)
  .parse(process.argv)

void (async () => {
  const quotes = await getquote()
  const quote = quotes.at(-1)
  console.log(quote)
})()
