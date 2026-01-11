export function getEnv(key: string): string {
  const value = import.meta.env[key]
  if (value === undefined) {
    throw new Error(
      `Environment variable ${key} is missing and has no default value.`
    )
  }
  return value
}
