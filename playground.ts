import { createRouter } from './src';

const router = createRouter();

router.insert('/path', { payload: 'this path' });
router.insert('/path/:name', { payload: 'named route' });
router.insert('/path/foo/**', { payload: 'wildcard route' });

console.log([
    router.lookup('/path'),
    router.lookup('/path/fooval'),
    router.lookup('/path/foo/bar/baz'),
    router.lookup('/'),
]);
