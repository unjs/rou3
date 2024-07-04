import { bench, group, run } from 'mitata'
import "./test.mjs"
import { routers } from './routers.mjs'
import { requests, routes } from './input.mjs'

// Benchmark all routers
group('All requests (with params)', () => {
  for (const name in routers) {
    const router = new routers[name](routes, true /* params */)
    router.init()
    bench(name, () => {
      for (const request of requests) {
        router.match(request)
      }
    })
  }
})

group('All requests (without params)', () => {
  for (const name in routers) {
    const router = new routers[name](routes, false /* params */)
    router.init()
    bench(name, () => {
      for (const request of requests) {
        router.match(request)
      }
    })
  }
})

run({})
