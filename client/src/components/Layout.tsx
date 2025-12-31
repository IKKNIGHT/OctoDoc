import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="container">
      <header className="header">
        <h1>Secure Pastebin</h1>
        <p>End-to-end encrypted, anonymous paste sharing</p>
      </header>
      <main>{children}</main>
    </div>
  );
}
