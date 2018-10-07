import parametrizeQuery from './parametrizeQuery'

describe('queryParametrizer', function() {
  it('should parametrize queries', async () => {
    expect(parametrizeQuery(`{ foo (first: 213) { ok koo } }`))
      .toMatchInlineSnapshot(`
"query {
  foo(first: $fooFirst) {
    ok
    koo
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
