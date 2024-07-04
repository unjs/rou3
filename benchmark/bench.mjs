import { bench, group, run } from 'mitata'
import "./test.mjs"
import { routers } from './routers.mjs'
import { requests, routes } from './input.mjs'

const withParams = !process.argv.includes('--no-params')

// Benchmark all routers
group(`All requests (match params: ${withParams})`, () => {
  for (const name in routers) {
    const router = new routers[name](routes, withParams)
    router.init()
    bench(name, () => {
      for (const request of requests) {
        router.match(request)
      }
    })
  }
})

run({})
