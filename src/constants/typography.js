/**
 * Quest App — Design System: Typography
 */

export const FontFamily = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  display: 36,
};

export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800',
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

export const Typography = {
  displayLarge: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.extraBold,
    lineHeight: FontSize.display * LineHeight.tight,
    letterSpacing: -0.5,
  },
  displaySmall: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xxl * LineHeight.tight,
    letterSpacing: -0.3,
  },
  headingLg: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    lineHeight: FontSize.xl * LineHeight.tight,
  },
  headingMd: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.lg * LineHeight.normal,
  },
  headingSm: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semiBold,
    lineHeight: FontSize.md * LineHeight.normal,
  },
  bodyLg: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * LineHeight.relaxed,
  },
  bodyMd: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.sm * LineHeight.relaxed,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.3,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    letterSpacing: 0.2,
  },
  captionBold: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semiBold,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
};

export default Typography;
