import parametrizeQuery from './parametrizeQuery'

describe('queryParametrizer', function () {
  it('should parametrize queries', async () => {
    expect(
      parametrizeQuery(
        `{ foo (first: 213) { ok koo } foo2(second: "aaa") {id} foo3(dupe: {a: "aaa"}) {id} foo4(dupe: {b: "aaa"}) {id} }`
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
})
