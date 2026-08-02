// Node 25+ removed SlowBuffer; buffer-equal-constant-time (via jwa/jsonwebtoken) still expects it.
// Must run before any JWT-related imports. Nest compiles to CommonJS, so mutate require('buffer').
const buffer = require('buffer') as typeof import('buffer') & {
  SlowBuffer?: typeof import('buffer').Buffer;
};

if (!buffer.SlowBuffer) {
  buffer.SlowBuffer = buffer.Buffer;
}
