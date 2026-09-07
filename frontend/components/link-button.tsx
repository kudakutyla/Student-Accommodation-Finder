import Link from 'next/link';
import { ComponentProps } from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type LinkButtonProps = ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

// Base UI's Button does not support asChild/Link composition - style the anchor directly instead.
export function LinkButton({ className, variant, size, ...props }: LinkButtonProps) {
  return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
