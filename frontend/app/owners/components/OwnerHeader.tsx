'use client';

export default function OwnerHeader({ title }: { title: string }) {
  return (
    <header className="db-header">
      <h1 className="db-header__title">{title}</h1>
    </header>
  );
}
