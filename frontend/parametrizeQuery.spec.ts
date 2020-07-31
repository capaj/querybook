import parametrizeQuery from './parametrizeQuery'
import { parse } from 'graphql'

describe('queryParametrizer', function () {
  it('should parametrize queries', async () => {
    expect(
      parametrizeQuery(
        `{
        foo (first: 213) { ok koo }
        foo2(second: "aaa") {id}
        foo3(dupe: {a: "aaa"}) {id}
        foo4(dupe: {b: "aaa"}) {id} }`
      )
    ).toMatchInlineSnapshot(`
      "query ($first: Int, $second: String, $dupe1: Object, $dupe2: Object) {
        foo(first: $first) {
          ok
          koo
        }
        foo2(second: $second) {
          id
        }
        foo3(dupe: $dupe1) {
          id
        }
        foo4(dupe: $dupe2) {
          id
        }
      }
      "
    `)

    // expect(parametrizeQuery(`{ foo (input: {a: 50, b: "g"}) { ok koo } }`))
    // .toMatchInlineSnapshot(`
    // "{
    // lolo(first: 20) {
    // ok
    // koo
    // }
    // }
    // "
    // `)
  })

  //   it('should detect name collisions and resolve them by prepending a field name', async () => {
  //     expect(parametrizeQuery(`{ foo (first: 213) { ok koo } }`))
  //   })

  it('should acquire types from the schema', () => {
    expect(
      parametrizeQuery(
        `{
        foo (first: 213) {
          foo2(second: {a: "aaa"}) {
            foo3(third: {b: "bbb"}) {
              id
            }
          }
         }
        }`,
        parse(`
        input InputOne {
          a: String
        }

        input InputSecond {
          b: String
        }
        

        type FooReturn {
          foo2(second: InputOne): FooReturn2
        }

        type FooReturn2 {
          foo3(third: InputSecond!): FooReturn3
        }

        type FooReturn3 {
          id: Int!
        }

        type Query {
          foo(first: Int!): FooReturn
        }`)
      )
    ).toMatchInlineSnapshot(`
      "query ($first: Int!, $second: InputOne, $third: InputSecond!) {
        foo(first: $first) {
          foo2(second: $second) {
            foo3(third: $third) {
              id
            }
          }
        }
      }
      "
    `)
  })
})
