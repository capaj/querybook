import { observable } from 'mobx'

const state = observable({
  // url: 'https://localhost:5000'
  url: 'https://api.graphcms.com/simple/v1/swapi'
})

window.state = state

export default state
