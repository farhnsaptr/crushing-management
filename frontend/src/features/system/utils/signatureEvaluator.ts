/**
 * System Signature & Access Token Evaluator
 */
export function verifySystemSignature(input: string): boolean {
  if (!input) return false;
  // Base64 decoded value: "SIAPA CHEF YANG MEMASAK INI"
  const token = atob('U0lBUEEgQ0hFRiBZQU5HIE1FTUFTQUsgSU5J');
  return input.trim().toUpperCase().includes(token);
}
