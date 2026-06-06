const defaultBaseUrl = "http://127.0.0.1:4000";

async function request(path, { token, body, method = "POST", baseUrl = defaultBaseUrl } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "request_failed");
  return data;
}

export function register(payload, baseUrl) {
  return request("/api/auth/register", { body: payload, baseUrl });
}

export function login(payload, baseUrl) {
  return request("/api/auth/login", { body: payload, baseUrl });
}

export function verify(token, baseUrl) {
  return request("/api/auth/verify", { token, method: "GET", baseUrl });
}

export function chat(token, payload, baseUrl) {
  return request("/api/ai/chat", { token, body: payload, baseUrl });
}
