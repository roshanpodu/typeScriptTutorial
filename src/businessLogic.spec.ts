import { Authenticator, GraphQLClient } from 'leanix-js'
import { fetchApplications, mutateApplications } from './businessLogic'

const host = process.env.LEANIX_HOST
const apitoken = process.env.LEANIX_APITOKEN

describe('The business logic', () => {
  const authenticator = new Authenticator({ host, apitoken })
  const graphql = new GraphQLClient(authenticator)
  beforeAll(async () => {
    expect(typeof host).toEqual('string')
    expect(typeof apitoken).toEqual('string')
    await authenticator.start()
  })
  afterAll(() => {
    authenticator.stop()
  })

  it('fetches applications from the inventory', async () => {
    const applications = await fetchApplications({ graphql })
    expect(Array.isArray(applications)).toBeTruthy()
    const updatedApplications = await mutateApplications({ applications, graphql })
    expect(Array.isArray(updatedApplications)).toBeTruthy()
  }, 10000)
})
