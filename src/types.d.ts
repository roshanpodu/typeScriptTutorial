export interface IPlatform {
  id: string
  type: 'Platform'
  name: string
}

export interface IApplication {
  id: string
  type: 'Application'
  name: string
  // current related platforms, via ITComponents, to this application
  relatedPlatforms: IPlatform[]
  currentApplicationToPlatform: {
    // relation ids to be deleted, given the set of established currentApplicationToPlatform for this Application
    delete: string[]
    // platforms to establish a relation with, given the set of established currentApplicationToPlatform for this Application
    set: IPlatform[]
  }
}
