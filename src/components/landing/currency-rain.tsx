'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FallingSymbol {
  id: number;
  char: string;
  x: number;
  speed: number;
  size: number;
  opacity: number;
  rotation: number;
  delay: number;
}

const CURRENCY_SYMBOLS = ['₹', '$', '€', '£'];
const MAX_SYMBOLS = 25;

let idCounter = 0;

function createSymbol(): FallingSymbol {
  return {
    id: idCounter++,
    char: CURRENCY_SYMBOLS[Math.floor(Math.random() * CURRENCY_SYMBOLS.length)],
    x: Math.random() * 100,
    speed: 8 + Math.random() * 12,
    size: 14 + Math.random() * 20,
    opacity: 0.08 + Math.random() * 0.15,
    rotation: -30 + Math.random() * 60,
    delay: Math.random() * 5,
  };
}

export function CurrencyRain() {
  const [symbols, setSymbols] = useState<FallingSymbol[]>([]);

  useEffect(() => {
    const initial = Array.from({ length: MAX_SYMBOLS }, createSymbol);
    setSymbols(initial);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <AnimatePresence>
        {symbols.map((s) => (
          <motion.span
            key={s.id}
            className="absolute font-mono select-none"
            style={{
              left: `${s.x}%`,
              fontSize: `${s.size}px`,
              color: `rgba(255, 106, 0, ${s.opacity})`,
              filter: 'blur(0.5px)',
              willChange: 'transform',
            }}
            initial={{ y: '-5vh', rotate: 0, opacity: 0 }}
            animate={{
              y: '110vh',
              rotate: s.rotation,
              opacity: [0, s.opacity, s.opacity, 0],
            }}
            transition={{
              duration: s.speed,
              delay: s.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {s.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  );
}
