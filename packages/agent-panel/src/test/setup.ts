import '@testing-library/jest-dom/vitest';

// cyberui-2045 checks for its stylesheet at import time by reading
// --color-primary from document.documentElement and warns "Stylesheet not
// detected" when it is missing. Tests do not load CSS, so provide the token
// inline (setup runs before any test module imports cyberui-2045).
document.documentElement.style.setProperty('--color-primary', '#ff005d');
