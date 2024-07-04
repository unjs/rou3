// Inputs are based on hono router benchmarks

export const routes = [
  { method: "GET", path: "/user" },
  { method: "GET", path: "/user/comments" },
  { method: "GET", path: "/user/avatar" },
  { method: "GET", path: "/user/lookup/username/:username" },
  { method: "GET", path: "/user/lookup/email/:address" },
  { method: "GET", path: "/event/:id" },
  { method: "GET", path: "/event/:id/comments" },
  { method: "POST", path: "/event/:id/comment" },
  { method: "GET", path: "/map/:location/events" },
  { method: "GET", path: "/status" },
  { method: "GET", path: "/very/deeply/nested/route/hello/there" },
  { method: "GET", path: "/static/:path" },
]

export const requests = [
  {
    name: 'short static',
    method: 'GET',
    path: '/user',
  },
  {
    name: 'static with same radix',
    method: 'GET',
    path: '/user/comments',
  },
  {
    name: 'dynamic route',
    method: 'GET',
    path: '/user/lookup/username/hey',
    params: { username: 'hey' }
  },
  {
    name: 'mixed static dynamic',
    method: 'GET',
    path: '/event/abcd1234/comments',
    params: { id: 'abcd1234' }
  },
  {
    name: 'post',
    method: 'POST',
    path: '/event/abcd1234/comment',
    params: { id: 'abcd1234' }
  },
  {
    name: 'long static',
    method: 'GET',
    path: '/very/deeply/nested/route/hello/there',
  },
  {
    name: 'wildcard',
    method: 'GET',
    path: '/static/index.html',
    params: { 'path': 'index.html' }
  },
]

