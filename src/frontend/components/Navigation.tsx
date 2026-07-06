import type { MouseEvent } from 'react';
import type { AppRoute } from '../types';

type NavigationProps = {
  route: AppRoute;
  onNavigate: (route: AppRoute) => void;
};

export function Navigation({ route, onNavigate }: NavigationProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>, nextRoute: AppRoute): void {
    event.preventDefault();
    window.history.pushState({}, '', nextRoute);
    onNavigate(nextRoute);
  }

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <a href="/" className="brand" onClick={(event) => handleClick(event, '/')}>Request Pipeline</a>
      <div className="nav-links">
        <a href="/" className={route === '/' ? 'is-active' : ''} onClick={(event) => handleClick(event, '/')}>Home</a>
        <a href="/requests" className={route === '/requests' ? 'is-active' : ''} onClick={(event) => handleClick(event, '/requests')}>New Request</a>
        <a href="/doctors" className={route === '/doctors' ? 'is-active' : ''} onClick={(event) => handleClick(event, '/doctors')}>Doctor Pool</a>
      </div>
    </nav>
  );
}
