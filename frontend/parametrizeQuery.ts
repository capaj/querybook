import { print } from 'graphql/language/printer'
import { parse, visit } from 'graphql'

export default function parametrizeQuery(query: string): string {
  const parsed = parse(query)
  const edited = visit(parsed, {
    Argument(node, key, parent, path, ancestors) {
      console.log('x: ', node)
      node.value = {
        kind: 'Variable',
        name: {
          kind: 'Name',
          value: 'abc'
        }
      }
      return node
    }
  })
  return print(edited)
}
