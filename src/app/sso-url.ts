let initialUrl = '';

export function captureInitialUrl(): () => void {
  return () => {
    initialUrl = window.location.href;
  };
}

export function getInitialUrl(): string {
  return initialUrl || window.location.href;
}
