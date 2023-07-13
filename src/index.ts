#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'
import { sum } from './businessLogic'
import { version, description } from '../package.json'

export interface ICliOptions {
  a: number
  b: number
}

console.log(figlet.textSync('Sum Calculator'))

const program = new Command()

program
  .version(version)
  .description(description)
  .requiredOption('-a', '--first', 'number to be summed')
  .requiredOption('-b', '--second', 'second number to be summed')
  .parse(process.argv)

const { a, b } = program.opts<ICliOptions>()
console.log(program.options)
void (async () => {
  console.log('GOT A', a, b)
  const c = sum(a, b)
  console.log(`The sum of ${a} + ${b} is ${c}`)
})()
