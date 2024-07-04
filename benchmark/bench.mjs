import { bench, group, run } from 'mitata'
import { routers } from './routers.mjs'
import { requests, routes } from './input.mjs'

// Test all routers
let testsFailed = false
for (const name in routers) {
  let routerHasIssues = false
  console.log(`\n🧪 Validating ${name}`)
  const router = new routers[name](routes)
  router.init()
  for (const request of requests) {
    const title = `${request.name} ([${request.method}] ${request.path})`
    const match = router.match(request)
    if (!match) {
      console.error(`❌ No match for ${title}`)
      routerHasIssues = true
      testsFailed = true
      continue
    }
    if (typeof match.handler !== 'function') {
      console.error(`❌ No handler for ${title}`)
      routerHasIssues = true
      testsFailed = true
      continue
    }
    if (request.params && JSON.stringify(match.params) !== JSON.stringify(request.params)) {
      console.error(`❌ Invalid params for ${title}. Expected %s Got %s`, request.params, match.params)
      routerHasIssues = true
      testsFailed = true
      continue
    }

  }
  if (!routerHasIssues) {
    console.log(`\r✅ Validated ${name}`)
  }
}
if (testsFailed) {
  console.error('❌ Some routers failed validation')
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}

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
