# Project Rules: HoopScript

## UI & Styling Rules
- **NO INLINE STYLES:** Do not use the `style={{...}}` prop directly in components.
- **Centralized Styling:** All styles must be defined in `src/styles/globalStyles.ts` or `src/styles/theme.ts`.
- **Main Color:** Always use #B34726 as color whenever I say 'Terracotta'.
- **Icons:** Always use `react-native-vector-icons` for icons.
- **Fonts:** Only use fonts that are in `assets/fonts/` and never use default fonts.
- **Workflow:** When I ask for UI changes:
  1. Modify `src/styles/globalStyles.ts` (for layouts) or `src/styles/theme.ts` (for colors/branding).
  2. Export the new styles.
  3. Update the component to import and use those styles.

- **Consistency:** Use the existing theme variables for colors to maintain the minimalist, flat-color aesthetic.
- **TypeScript & React Native:** Always use `StyleSheet.create` for styles in `.ts` files to ensure full TypeScript support and performance optimization.