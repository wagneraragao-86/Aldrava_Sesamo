'use client';

import { useEffect, useRef } from 'react';

export function useVideoElement(stream?: MediaStream) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);

  return ref;
}
