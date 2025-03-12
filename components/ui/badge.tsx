"use client"
import * as React from "react";
import { cva, VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn_tw_merger";
import { Icon } from "judix-icon";
import { IconProps } from "judix-icon/dist/Icon";

export const badgeVariants = cva(
  "flex items-center justify-center gap-1.5 w-max transition-colors cursor-pointer border",
  {
    variants: {
      color: {
        red: "bg-red-000 text-red-300 border-red-200",
        orange: "bg-orange-000 text-orange-300 border-orange-200",
        yellow: "bg-yellow-000 text-yellow-400 border-yellow-300",
        green: "bg-green-000 text-green-400 border-green-300",
        blue: "bg-blue-000 text-blue-400 border-blue-300",
        grey: "bg-neutral-200 text-neutral-600 border-neutral-500",
        primary: "bg-primary--100 text-primary-300 border-primary-200",
        accent: "bg-accent--100 text-accent-300 border-accent-200",
      },
      variant: {
        default: "border-transparent",
        "two-tone-with-bg":
          "border",
        "two-tone-no-bg":
          "border bg-transparent",
      },
      size: {
        small: "px-3.5 py-1.5 h-[22px] text-label-md leading-[16.2%]",
        medium: "px-3.5 py-1.5 h-6 text-body-sm leading-[18.9%]",
        large: "px-4 h-7 text-body-md leading-[21.6%]",
      },
      corner: {
        sharp: "rounded-xs",
        rounded: "rounded-full",
      },
    },
    defaultVariants: {
      color: "grey",

      variant: "default",
      size: "medium",
      corner: "rounded",
    },
  }
);

export interface BadgeProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof badgeVariants> {
  showPrefixDot?: boolean;
  suffixIcon?: IconProps["name"];
}

/**
 * A customizable badge component with support for colors, variants, sizes, and icons.
 * 
 * @example
 * // Default badge with grey color
 * <Badge>Default Badge</Badge>
 * 
 * @example
 * // Badge with a prefix dot and suffix icon
 * <Badge color="blue" showPrefixDot suffixIcon="Checkmark">
 *   Success
 * </Badge>
 * 
 * @variants
 * - **default**: No border, solid background
 * - **two-tone-with-bg**: With border and background
 * - **two-tone-no-bg**: With border, no background
 * 
 * @colors
 * - **red**: Red color scheme
 * - **orange**: Orange color scheme
 * - **yellow**: Yellow color scheme
 * - **green**: Green color scheme
 * - **blue**: Blue color scheme
 * - **grey**: Neutral grey color scheme
 * - **primary**: Primary brand color scheme
 * - **accent**: Secondary accent color scheme
 * 
 * @sizes
 * - **small**: Compact size (22px height)
 * - **medium**: Medium size (24px height)
 * - **large**: Large size (28px height)
 * 
 * @corners
 * - **sharp**: Sharp corners with small radius
 * - **rounded**: Fully rounded corners
 * 
 * @props
 * - `color` (string): Color scheme of the badge
 * - `variant` (string): Visual style of the badge
 * - `size` (string): Size of the badge
 * - `corner` (string): Corner style of the badge
 * - `showPrefixDot` (boolean): Whether to show a dot before the text
 * - `suffixIcon` (IconName): Icon to display after the text
 * - `className` (string): Additional custom class names
 */
function Badge({
  className,
  color,
  variant,
  size,
  corner,
  showPrefixDot = false,
  suffixIcon,
  children,
  ...props
}: BadgeProps) {
  const IconSizeMapBasedOnSize = {
    small: 14,
    medium: 14,
    large: 16,
  };
  return (
    <div
      className={cn(badgeVariants({ color, variant, size, corner }), className)}
      {...props}
    >
      {showPrefixDot && (
        <span className="w-1 h-1 rounded-full bg-current"></span>
      )}
      <span className="whitespace-nowrap">{children}</span>
      {suffixIcon && (
        <span className="inline-block text-current">
          <Icon name={suffixIcon} size={IconSizeMapBasedOnSize[size!]} />
        </span>
      )}
    </div>
  );
}

export default Badge;
