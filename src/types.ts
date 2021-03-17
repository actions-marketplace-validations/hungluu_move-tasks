import { get, map, zipObject } from './utils'

export interface IRepo {
  id: string
  name: string
  ownerId: string
  ownerType: string
  labels: {[key: string]: string} // id: name
}
export function repo (data: any): IRepo {
  const root = get(data, 'repositoryOwner', {})
  const repository = get(root, 'repository', {})
  const labels = map(get(repository, 'labels.edges'), 'node')

  return {
    id: get(repository, 'id'),
    name: get(repository, 'name'),
    ownerId: get(root, 'id'),
    ownerType: (get(root, '__typename') as string).toLowerCase(),
    labels: zipObject(
      map(labels, 'id'),
      map(labels, 'name')
    )
  }
}

export interface IProjectCard {
  id: string
  contentType: string
  contentId: string
  contentLabels: {[key: string]: string}
}
export interface IProjectColumn {
  id: string
  name: string
  cards: IProjectCard[]
}
export interface IProject {
  id: string
  name: string
  columns: IProjectColumn[]
}
export function project (data: any): IProject {
  const root = get(data, 'organization', get(data, 'user', {}))
  const project = get(root, 'projects.edges.0.node', get(root, 'project', {}))
  const columns = map(get(project, 'columns.edges'), 'node')

  return {
    id: get(project, 'id'),
    name: get(project, 'name'),
    columns: map(columns, column => {
      const cards = map(get(column, 'cards.edges'), 'node')

      return {
        ...column,
        cards: map(cards, card => {
          const content = get(card, 'content', {})
          const labels = map(get(content, 'labels.edges'), 'node')

          return {
            id: get(card, 'id'),
            contentId: get(content, 'id'),
            contentType: get(content, '__typeName'),
            contentLabels: zipObject(
              map(labels, 'id'),
              map(labels, 'name')
            )
          }
        })
      }
    })
  }
}