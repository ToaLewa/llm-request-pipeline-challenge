let envLoaded = false;

export function loadEnvFile(): void {
  if (envLoaded) {
    return;
  }

  envLoaded = true;
  process.loadEnvFile?.();
}
