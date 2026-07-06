import type { MouseEvent } from 'react';
import type { AppRoute } from './types';

export function useAppNavigation(onNavigate: (route: AppRoute) => void) {
  function navigate(route: AppRoute): void {
    window.history.pushState({}, '', route);
    onNavigate(route);
  }

  function handleNavigationClick(event: MouseEvent<HTMLAnchorElement>, route: AppRoute): void {
    event.preventDefault();
    navigate(route);
  }

  return { navigate, handleNavigationClick };
}
