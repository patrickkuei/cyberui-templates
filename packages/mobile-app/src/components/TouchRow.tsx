import type { ReactNode } from 'react';

type Control = 'switch' | 'slider' | 'radios';

// Class names live in App.css ("Touch targets"), where the 44px rule is
// written down once. A Record over Control, so a new control type has to say
// which rule it gets.
const CLASS_NAMES: Record<Control, string> = {
  switch: 'touch-switch',
  slider: 'touch-slider',
  radios: 'touch-radios',
};

/**
 * Wrap every cyberui-2045 control that is smaller than 44 by 44 CSS pixels in
 * this, because on a phone a thumb needs about that much to hit it. In 2.8.0
 * that is Toggle (a 28 or 32px track), Checkbox (20 or 24px), RadioGroup
 * (20px rows) and Slider (a 20 or 24px thumb on an 8 or 12px track). Making
 * the control itself bigger is not an option the library offers (a touch-size
 * option is an open feature request, patrickkuei/CyberUI#133), so the rule
 * is a class here that stretches the part
 * of the control that takes the tap, without changing how it looks. App.css
 * has the rules and says which part of the library's markup each one relies
 * on; re-check them when you upgrade cyberui-2045 (the README's Phone
 * checklist).
 *
 * Do not "clean this up" as an extra wrapper: removing it brings back
 * switches and sliders that are hard to hit. Button and Input are already 44px
 * or more at size md, so they do not need it.
 */
export function TouchRow({ control, children }: { control: Control; children: ReactNode }) {
  return <div className={CLASS_NAMES[control]}>{children}</div>;
}
