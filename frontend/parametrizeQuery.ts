import { print } from 'graphql/language/printer'
import { parse, visit } from 'graphql'
import { findDuplicates } from './findDuplicates'

// const findArgumentType = (source) => {}

export default function parametrizeQuery(query: string): string {
  const parsed = parse(query)

  let allArgumentNames = []

  visit(parsed, {
    Argument(node, key, parent, path, ancestors) {
      const argumentName = node.name.value
      allArgumentNames.push(argumentName)
    },
  })

  const duplicatedArgumentNames = findDuplicates(allArgumentNames)

  const edited = visit(parsed, {
    OperationDefinition(node) {
      const replacedLiterals = []

      visit(node, {
        Argument(node, key, parent, path, ancestors) {
          let argumentName = node.name.value

          const alreadyNumberedArguments = replacedLiterals.filter(
            ({ name }) => {
              return name.includes(node.name.value)
            }
          )

          if (
            alreadyNumberedArguments.length === 0 &&
            !duplicatedArgumentNames.includes(argumentName)
          ) {
            replacedLiterals.push({
              name: argumentName,
              kind: node.value.kind,
            })
          } else {
            argumentName = argumentName + (alreadyNumberedArguments.length + 1)
            replacedLiterals.push({
              name: argumentName,
              kind: node.value.kind,
            })
          }

          // @ts-ignore
          node.value = {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: argumentName,
            },
          }

          return node
        },
      })
      // @ts-ignore
      node.variableDefinitions = replacedLiterals.map((replaced) => {
        return {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: replaced.name,
            },
          },
          type: {
            kind: 'NamedType',
            name: {
              kind: 'Name',
              value: replaced.kind.replace('Value', ''),
            },
          },
        }
      })
      return node
    },
  })
  return print(edited)
}
