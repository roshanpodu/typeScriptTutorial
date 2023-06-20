import { type GraphQLClient } from 'leanix-js'
import type { IApplication, IPlatform } from './types'

const applicationFragment = `fragment App on Application {
  id
  type
  name
  relApplicationToITComponent {
    edges {
      node {
        factSheet {
          ... on ITComponent {
            id
            type
            name
            relITComponentToPlatform {
              edges {
                node {
                  factSheet {
                    ... on Platform {
                      id
                      type
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  relCurrentApplicationToPlatform {
    edges {
      node {
        id
        factSheet {
          ... on Platform {
            id
            type
          }
        }
      }
    }
  }
}`

const applicationReducer = (node: any): IApplication => {
  const { id, name, type, relApplicationToITComponent: { edges: relApplicationToITComponent }, relCurrentApplicationToPlatform: { edges: relCurrentApplicationToPlatform } } = node
  const existingCurrentApplicationToPlatformRelationsIndex: Record<string, string> = relCurrentApplicationToPlatform
    .reduce((accumulator: Record<string, string>, { node }: any) => {
      const { id: relCurrentApplicationToPlatformId, factSheet: { id: platformId } } = node
      accumulator[platformId] = relCurrentApplicationToPlatformId
      return accumulator
    }, {})
  const relatedPlatformsInInventoryIndex = relApplicationToITComponent
    .reduce((accumulator: Record<string, IPlatform>, { node: { factSheet: itComponent } }: any) => {
      const { relITComponentToPlatform } = itComponent
      relITComponentToPlatform.edges
        .forEach(({ node: { factSheet: platform } }: { node: { factSheet: IPlatform } }) => {
          accumulator[platform.id] = platform
        })
      return accumulator
    }, {})
  const relatedPlatformsInInventory = Object.values<IPlatform>(relatedPlatformsInInventoryIndex)
  const relApplicationToPlatformForDeletion = Object.entries(existingCurrentApplicationToPlatformRelationsIndex)
    .reduce((accumulator: string[], [platformId, relationId]) => {
      const relationStillExists = platformId in relatedPlatformsInInventoryIndex
      if (!relationStillExists) accumulator.push(relationId)
      return accumulator
    }, [])

  const relApplicationToPlatformToSet = relatedPlatformsInInventory
    .filter(platform => !(platform.id in existingCurrentApplicationToPlatformRelationsIndex))
  const currentApplicationToPlatform = {
    delete: relApplicationToPlatformForDeletion,
    set: relApplicationToPlatformToSet
  }
  const application: IApplication = {
    id,
    type,
    name,
    relatedPlatforms: relatedPlatformsInInventory,
    currentApplicationToPlatform
  }
  return application
}

export const fetchApplicationsPage = async (params: { first?: number, after?: string, graphql: GraphQLClient }): Promise<{ page: IApplication[], nextPage: string | null }> => {
  const { first = 15000, after = '' } = params
  const fetchApplicationsQuery = `${applicationFragment} query FetchApplications($filter: FilterInput, $first: Int, $after: String) {
  allFactSheets(filter: $filter, first: $first, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
    edges {
      node {
        ...App
      }
    }
  }
}
`
  const variables = {
    first,
    after,
    filter: {
      facetFilters: [
        {
          facetKey: 'FactSheetTypes',
          keys: ['Application']
        }
      ]
    }
  }

  const { applications: page, nextPage } = await params.graphql.executeGraphQL(fetchApplicationsQuery, variables)
    .then(({ allFactSheets }) => {
      const { edges, pageInfo: { hasNextPage, endCursor } } = allFactSheets
      const nextPage: string | null = hasNextPage === true ? endCursor : null
      const applications: IApplication[] = edges.map(({ node }: any) => applicationReducer(node))
      return { applications, nextPage }
    })
  return { page, nextPage }
}

export const fetchApplications = async (params: { graphql: GraphQLClient }): Promise<IApplication[]> => {
  let nextPage: string | null = ''
  const applications: IApplication[] = []
  do {
    const data = await fetchApplicationsPage({ ...params, after: nextPage })
    applications.push(...data.page)
    nextPage = data.nextPage
  } while (nextPage !== null)
  return applications
}

export const mutateApplication = async (params: { application: IApplication, graphql: GraphQLClient }): Promise<IApplication> => {
  const { application, graphql } = params
  const query = `${applicationFragment} mutation ($id: ID!, $patches: [Patch]!) {
  updateFactSheet(id: $id, patches: $patches) {
    factSheet {
      ...App
    }
  }
}`
  const variables = {
    id: application.id,
    patches: [
      ...application.currentApplicationToPlatform.delete.map(relationId => ({ op: 'remove', path: `/relCurrentApplicationToPlatform/${relationId}`, value: '' })),
      ...application.currentApplicationToPlatform.set.map(platform => ({
        op: 'add', path: `/relCurrentApplicationToPlatform/new_${platform.id}`, value: JSON.stringify({ factSheetId: platform.id })
      }))
    ]
  }
  // nothing to do, return the application as it is...
  if (variables.patches.length === 0) return application
  // else mutate the inventory
  const updatedApplication = await graphql.executeGraphQL(query, variables)
    .then(({ updateFactSheet: { factSheet } }) => applicationReducer(factSheet))
  return updatedApplication
}

export const mutateApplications = async (params: { applications: IApplication[], graphql: GraphQLClient }): Promise<IApplication[]> => {
  const { applications, graphql } = params
  const updatedApplications: IApplication[] = []
  for (const application of applications) {
    const updatedApplication = await mutateApplication({ application, graphql })
    updatedApplications.push(updatedApplication)
  }
  return updatedApplications
}
