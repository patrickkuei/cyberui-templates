import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from '../data/faq';
import { FaqSection } from './FaqSection';

// Accordion keeps every answer in the DOM (hidden with aria-hidden and inert),
// so getByText would find closed answers. These tests read each question
// button's aria-expanded, and the answer through its region role, which a
// closed (aria-hidden) answer does not have.
const question = (index: number) => screen.getByRole('button', { name: FAQ[index]!.question });

describe('FaqSection', () => {
  it('lists every question, all closed to start with', () => {
    render(<FaqSection />);
    expect(screen.getAllByRole('button')).toHaveLength(FAQ.length);
    for (let i = 0; i < FAQ.length; i += 1) expect(question(i)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('region', { name: FAQ[0]!.question })).toHaveLength(0);
  });

  it('opens one answer at a time', async () => {
    render(<FaqSection />);
    await userEvent.click(question(0));
    expect(question(0)).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('region', { name: FAQ[0]!.question })).toHaveTextContent(FAQ[0]!.answer);

    await userEvent.click(question(1));
    expect(question(1)).toHaveAttribute('aria-expanded', 'true');
    expect(question(0)).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryAllByRole('region', { name: FAQ[0]!.question })).toHaveLength(0);
  });

  it('closes an open answer when its question is pressed again', async () => {
    render(<FaqSection />);
    await userEvent.click(question(2));
    await userEvent.click(question(2));
    expect(question(2)).toHaveAttribute('aria-expanded', 'false');
  });

  it('works from the keyboard: Tab to a question, Enter opens it, the arrow keys move between questions', async () => {
    render(<FaqSection />);
    await userEvent.tab();
    expect(question(0)).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(question(0)).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard('{ArrowDown}');
    expect(question(1)).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(question(FAQ.length - 1)).toHaveFocus();
  });
});
