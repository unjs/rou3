import { routers } from './routers.mjs'
import { requests, routes } from './input.mjs'

// Test all routers
let testsFailed = false
for (const name in routers) {
  process.stdout.write(`🧪 Testing ${name}`)
  const router = new routers[name](routes)
  router.init()
  const issues = []
  for (const request of requests) {
    const reqLabel = `[${request.method}] ${request.path} (${request.name})`
    const match = router.match(request)
    if (!match) {
      issues.push(`${reqLabel}: No route matched`)
      continue
    }
    if (typeof match.handler !== 'function') {
      issues.push(`${reqLabel}: No handler returned`)
      continue
    }
    if (request.params && JSON.stringify(match.params) !== JSON.stringify(request.params)) {
      issues.push(`${reqLabel}: Params not matched. Expected ${JSON.stringify(request.params)} Got ${JSON.stringify(match.params)}`)
      continue
    }
  }
  console.log(
    issues.length > 0 ?
      `\r❌ Some tests failed for ${name}: \n  - ${issues.join('\n  - ')}` :
      `\r✅ All tests passed for ${name}!`)
}
if (testsFailed) {
  console.error('❌ Some routers failed validation')
  // eslint-disable-next-line unicorn/no-process-exit
  process.exit(1)
}
