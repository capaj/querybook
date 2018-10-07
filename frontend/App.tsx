import React, { Component } from 'react'
import GraphiQL from 'graphiql'
import fetch from 'unfetch'
import 'graphiql/graphiql.css'
import './App.less'
import {
  introspectionQuery,
  buildClientSchema,
  printSchema,
  parse
} from 'graphql'
import gql from 'graphql-tag'
import state from './state'
import { getDiagnostics } from 'graphql-language-service-interface'
import { print } from 'graphql/language/printer'

import Bound from 'react-bound'
import { observer } from 'mobx-react'

function graphQLFetcher(graphQLParams) {
  return fetch(state.url + '/graphql', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(graphQLParams)
  }).then((response) => response.json())
}

@observer
class App extends Component {
  state = {
    schema: null
  }

  async componentDidMount() {
    const { data } = await graphQLFetcher({ query: introspectionQuery })
    console.log('data: ', data)

    const schema = buildClientSchema(data)
    // console.log('s: ', parse(schema))
    this.setState({ schema })
  }

  componentWillUnmount() {}

  render() {
    if (!this.state.schema) {
      return null
    }
    return (
      <div>
        <Bound to={state}>
          url:
          <input name="url" />
        </Bound>
        <button
          onClick={() => {
            console.log('aa')
          }}
        >
          parametrize
        </button>
        <GraphiQL
          fetcher={graphQLFetcher}
          onEditQuery={(ee) => {
            const parsed = parse(ee)
            console.log('parsed: ', parsed)
            // console.log('ee: ', gql(ee))
            console.log(print(parsed))
          }}
        >
          <GraphiQL.Logo>Querybook</GraphiQL.Logo>
        </GraphiQL>
      </div>
    )
  }
}

export default App
