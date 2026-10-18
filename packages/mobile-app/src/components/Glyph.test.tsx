import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { DEVICE_KINDS } from '../data/types';
import { haloOpacity, haloRadius } from '../utils/glow';
import { Glyph, gradientId } from './Glyph';

const svgOf = (container: HTMLElement) => container.querySelector('svg')!;

describe('Glyph', () => {
  it('draws something decorative for every kind of device', () => {
    for (const kind of DEVICE_KINDS) {
      const { container, unmount } = render(<Glyph kind={kind} level={50} />);
      expect(svgOf(container), kind).toHaveAttribute('aria-hidden', 'true');
      expect(container.querySelectorAll('path, circle').length, `${kind} draws nothing`).toBeGreaterThan(1);
      unmount();
    }
  });

  it('is dark at level 0: no halo at all, and no lit class', () => {
    const { container } = render(<Glyph kind="light" level={0} />);
    expect(container.querySelector('.glyph-halo')).toBeNull();
    expect(svgOf(container)).not.toHaveClass('glyph--lit');
    expect(container.querySelector('.glyph-body')).toHaveAttribute('fill-opacity', '0');
  });

  it('glows in proportion to its level: the halo grows brighter and wider, and the body fills more', () => {
    const read = (level: number) => {
      const { container, unmount } = render(<Glyph kind="light" level={level} />);
      const halo = container.querySelector('.glyph-halo')!;
      const result = {
        opacity: Number(halo.getAttribute('opacity')),
        radius: Number(halo.getAttribute('r')),
        body: Number(container.querySelector('.glyph-body')!.getAttribute('fill-opacity')),
        lit: svgOf(container).classList.contains('glyph--lit'),
      };
      unmount();
      return result;
    };
    const dim = read(10);
    const medium = read(50);
    const bright = read(100);
    expect([dim.lit, medium.lit, bright.lit]).toEqual([true, true, true]);
    expect(dim.opacity).toBeLessThan(medium.opacity);
    expect(medium.opacity).toBeLessThan(bright.opacity);
    expect(dim.radius).toBeLessThan(medium.radius);
    expect(medium.radius).toBeLessThan(bright.radius);
    expect(dim.body).toBeLessThan(bright.body);
    expect(medium).toMatchObject({ opacity: haloOpacity(50), radius: haloRadius(50) });
  });

  it('gives each glyph its own gradient id, so two on one screen never share a halo', () => {
    const { container } = render(
      <>
        <Glyph kind="light" level={40} />
        <Glyph kind="light" level={90} />
      </>,
    );
    const ids = [...container.querySelectorAll('radialGradient')].map((gradient) => gradient.id);
    expect(ids).toHaveLength(2);
    expect(new Set(ids).size).toBe(2);
    for (const id of ids) expect(id).not.toMatch(/[:\s]/);
    const fills = [...container.querySelectorAll('.glyph-halo')].map((halo) => halo.getAttribute('fill'));
    expect(fills).toEqual(ids.map((id) => `url(#${id})`));
  });

  it('turns whatever useId returns into an id that is safe inside url(#...), in every React 19 format', () => {
    expect(gradientId(':r1:')).toBe('halo-r1');
    expect(gradientId('«r1»')).toBe('halo-r1');
    expect(gradientId('_r_1_')).toBe('halo-_r_1_');
    expect(gradientId('a b:c«d»e')).toBe('halo-abcde');
  });

  it('colours the glow with classes, never inline styles or colour literals, so the accent token reaches it', () => {
    const { container } = render(<Glyph kind="thermostat" level={80} />);
    expect(container.querySelector('[style]')).toBeNull();
    for (const node of container.querySelectorAll('stop, .glyph-body')) expect(node.getAttribute('fill') ?? node.getAttribute('stop-color')).toBeNull();
    expect(container.querySelectorAll('.glyph-stop')).toHaveLength(2);
  });
});
