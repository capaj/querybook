import { print } from 'graphql/language/printer'
import {
  parse,
  visit,
  DocumentNode,
  OperationDefinitionNode,
  ObjectTypeDefinitionNode,
} from 'graphql'
import { findDuplicates } from './findDuplicates'

const capitalize = (s: string) => {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export default function parametrizeQuery(
  query: string,
  schema?: DocumentNode
): string {
  const parsed = parse(query)

  let allArgumentNames = []
  const argumentsToTypesMap = new Map()
  const fieldsMap = new Map()

  if (schema) {
    visit(schema, {
      FieldDefinition(node, key, parent, path, ancestors) {
        const lastAncestor = ancestors[ancestors.length - 1] as
          | OperationDefinitionNode
          | ObjectTypeDefinitionNode

        for (const arg of node.arguments) {
          const argGlobalKey = `${lastAncestor.name?.value}.${node.name.value}.${arg.name.value}`

          argumentsToTypesMap.set(argGlobalKey, arg)
        }

        fieldsMap.set(`${lastAncestor.name?.value}.${node.name.value}`, node)
      },
    })
  }

  visit(parsed, {
    Argument(node, key, parent, path, ancestors) {
      const argumentName = node.name.value
      allArgumentNames.push(argumentName)
    },
  })

  const duplicatedArgumentNames = findDuplicates(allArgumentNames)
  let operationType
  const edited = visit(parsed, {
    OperationDefinition(node) {
      operationType = capitalize(node.operation)
      const replacedLiterals = []

      visit(node, {
        Argument(node, key, parent, path, ancestors) {
          const fieldPathFromRoot = ancestors
            .filter((ancestor) => ancestor['kind'] === 'Field')
            // @ts-ignore
            .map((a) => a.name.value)

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
              originalArgName: node.name.value,
              kind: node.value.kind,
              fieldPathFromRoot,
            })
          } else {
            argumentName = argumentName + (alreadyNumberedArguments.length + 1)
            replacedLiterals.push({
              name: argumentName,
              originalArgName: node.name.value,
              kind: node.value.kind,
              fieldPathFromRoot,
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
        let type = {
          kind: 'NamedType',
          name: {
            kind: 'Name',
            value: replaced.kind.replace('Value', ''), // todo try to get a type from schema
          },
        }
        if (schema) {
          let objectTypeName = operationType
          let inputValueDefinition

          for (const fieldName of replaced.fieldPathFromRoot) {
            const fieldMapKey = `${objectTypeName}.${fieldName}`
            const argMapKey = `${fieldMapKey}.${replaced.originalArgName}`

            inputValueDefinition = argumentsToTypesMap.get(argMapKey)
            if (inputValueDefinition) {
              type = inputValueDefinition.type
            } else {
              objectTypeName = fieldsMap.get(fieldMapKey).type.name.value
            }
          }
        }
        return {
          kind: 'VariableDefinition',
          variable: {
            kind: 'Variable',
            name: {
              kind: 'Name',
              value: replaced.name,
            },
          },
          type,
        }
      })
      return node
    },
  })
  return print(edited)
}
