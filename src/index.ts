#!/usr/bin/env node
import { Command } from 'commander'
import figlet from 'figlet'
import { writeFileSync } from 'node:fs'
import { Authenticator, GraphQLClient } from 'leanix-js'
import { fetchApplications, mutateApplications } from './businessLogic'
import { version, description } from '../package.json'

export interface ICliOptions {
  host: string
  apitoken: string
  query?: string
  output?: string
}

console.log(figlet.textSync('LeanIX Ticket #73263 Tool'))

const program = new Command()

const DEFAULT_OUTPUT_PATH = 'data.json'

program
  .version(version)
  .description(description)
  .requiredOption(
    '-h, --host <your_leanix_api_host>',
    'LeanIX API host, e.g. "app.leanix.net"'
  )
  .requiredOption('-t, --apitoken <your_leanix_api_token>', 'LeanIX API token')
  .option(
    '-o, --output <json file path>',
    'The path for the output file',
    DEFAULT_OUTPUT_PATH
  )
  .parse(process.argv)

const {
  host,
  apitoken,
  output = DEFAULT_OUTPUT_PATH
} = program.opts<ICliOptions>()

const authenticator = new Authenticator({ host, apitoken })
const graphql = new GraphQLClient(authenticator)

void (async () => {
  await authenticator.start()
  try {
    const applications = await fetchApplications({ graphql })
    const updatedApplications = await mutateApplications({ applications, graphql })
    writeFileSync(output, JSON.stringify(updatedApplications, null, 2))
    console.log(`Saved data to ${output}`)
  } finally {
    authenticator.stop()
  }
})()
