/** Authorization header tuple for Supertest. The mocked verifier accepts `test-*` UIDs. */
export const authHeader = (uid = 'test-uid-1'): [string, string] => [
  'Authorization',
  `Bearer ${uid}`,
];
