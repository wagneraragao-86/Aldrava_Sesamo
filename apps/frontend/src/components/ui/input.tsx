import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        'min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm outline-none ring-sky-500 transition placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-800 dark:bg-zinc-950',
        props.className,
      )}
    />
  );
}
