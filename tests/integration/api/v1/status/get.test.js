test("GET to /api/v1/status should return 200", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");
  expect(response.status).toBe(200);
});

test("GET to /api/v1/status should return date in ISO format", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");

  const responseBody = await response.json(response);
  expect(responseBody.updated_at).toBeDefined();

  const parsedUpdatedAt = new Date(responseBody.updated_at).toISOString();
  expect(responseBody.updated_at).toEqual(parsedUpdatedAt);
});

test("GET to /api/v1/status should return Postgres version", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");

  const responseBody = await response.json(response);
  expect(responseBody.dependencies.database.version).toEqual("16.0");
});

test("GET to /api/v1/status should return Max connections", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");

  const responseBody = await response.json(response);
  expect(responseBody.max_connections).toBe(100);
});

test("GET to /api/v1/status should return in use connections", async () => {
  const response = await fetch("http://localhost:3000/api/v1/status");

  const responseBody = await response.json(response);
  expect(responseBody.in_use_connections).toBe(22);
});
