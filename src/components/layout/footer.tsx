import React from 'react';

function Footer() {
  return (
    <footer
      className="relative mt-auto py-8"
      style={{
        background: 'var(--tron-bg-secondary)',
        borderTop: '1px solid rgba(255,106,0,0.1)',
        boxShadow: '0 -1px 12px rgba(255,106,0,0.04)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
        <p className="text-sm" style={{ color: 'var(--tron-text-secondary)' }}>
          Built by Shriansh Jena
        </p>
        <p
          className="text-xs"
          style={{ color: 'rgba(136,136,160,0.6)' }}
        >
          For informational purposes only. Not investment advice.
        </p>
      </div>
    </footer>
  );
}

export { Footer };
