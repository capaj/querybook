import { print } from 'graphql/language/printer'
import { parse, visit } from 'graphql'

// const findArgumentType = (source) => {}

export default function parametrizeQuery(query: string): string {
  const parsed = parse(query)
  const edited = visit(parsed, {
    OperationDefinition(node) {
      const replacedLiterals = []

      visit(node, {
        Argument(node, key, parent, path, ancestors) {
          replacedLiterals.push({
            name: node.name.value,
            kind: node.value.kind
          })
          // @ts-ignore
          node.value = {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: node.name.value
            }
          }

          return node
        }
      })
      // @ts-ignore
      node.variableDefinitions = replacedLiterals.map((replaced) => {
        return {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: replaced.name
            }
          },
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: replaced.kind.replace('Value', '')
            }
          }
        }
      })
      return node
    }
  })
  return print(edited)
}
