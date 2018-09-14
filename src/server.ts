import Koa from 'koa'
import koaStatic from 'koa-static'
import koaLogger from 'koa-logger'

const app = new Koa()
app.use(koaStatic('frontend/dist'))
app.use(koaLogger())
app.listen(8338)
