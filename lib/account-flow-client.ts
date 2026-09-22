type AccountFlowInput = { operation: "post-login-destination" };

export async function accountFlow<T>(input: AccountFlowInput): Promise<T> {
  const response = await fetch("/api/auth/account-flow", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const result = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(result.error ?? "Request failed.");
  return result;
}
