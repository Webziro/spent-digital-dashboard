import type {} from '@mui/lab/themeAugmentation';
import type {} from '@mui/material/themeCssVarsAugmentation';

import type { FontStyleExtend } from './core/typography';
import type { CustomShadows } from './core/custom-shadows';
import type {
  GreyExtend,
  TypeTextExtend,
  CommonColorsExtend,
  PaletteColorExtend,
  TypeBackgroundExtend,
} from './core/palette';

// ----------------------------------------------------------------------

/** **************************************
 * EXTEND CORE
 * Palette, typography, shadows...
 *************************************** */

/**
 * Palette
 * https://mui.com/customization/palette/
 * @from {@link file://./core/palette.ts}
 */
declare module '@mui/material/styles' {
  // shape
  interface Shape {
    borderRadius: number;
  }
  // grey
  interface Color extends GreyExtend {}
  // text
  interface TypeText extends TypeTextExtend {}
  // black & white
  interface CommonColors extends CommonColorsExtend {}
  // background
  interface TypeBackground extends TypeBackgroundExtend {}
  // primary, secondary, info, success, warning, error
  interface PaletteColor extends PaletteColorExtend {}
  interface SimplePaletteColorOptions extends Partial<PaletteColorExtend> {}
}

// Make sure @mui/system Theme references the same Theme type so sx callbacks receive a typed theme
declare module '@mui/system' {
  // re-export the Theme from @mui/material/styles so the `theme` param in sx callbacks is typed
  interface Theme extends import('@mui/material/styles').Theme {}
  // also ensure ThemeOptions is linked for consistency
  interface ThemeOptions extends import('@mui/material/styles').ThemeOptions {}
}

/**
 * Typography
 * https://mui.com/customization/typography/
 * @from {@link file://./core/typography.ts}
 */
declare module '@mui/material/styles' {
  interface TypographyVariants extends FontStyleExtend {}
  interface TypographyVariantsOptions extends Partial<FontStyleExtend> {}
}

declare module '@mui/material/styles' {
  /**
   * Custom shadows
   * @from {@link file://./core/custom-shadows.ts}
   */
  interface Theme {
    customShadows: CustomShadows;
  }
  interface ThemeOptions {
    customShadows?: CustomShadows;
  }
  interface ThemeVars {
    customShadows: CustomShadows;
    typography: Theme['typography'];
    transitions: Theme['transitions'];
  }
}
