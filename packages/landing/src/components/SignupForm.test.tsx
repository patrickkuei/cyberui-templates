import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignupForm } from './SignupForm';

const input = () => screen.getByLabelText('Email address');
const submit = () => screen.getByRole('button', { name: 'Start free trial' });

describe('SignupForm', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('has a labelled email field and an empty polite status that is already in the page', () => {
    render(<SignupForm />);
    expect(input()).toHaveAttribute('type', 'email');
    expect(input()).toHaveAttribute('aria-invalid', 'false');
    // role="status" is a polite live region; it has to exist before its text does.
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('rejects a malformed address: shows the error, links it to the field, and puts focus back on the field', async () => {
    render(<SignupForm />);
    await userEvent.type(input(), 'not-an-email');
    await userEvent.click(submit());
    expect(screen.getByText('Enter a valid email address.')).toBeInTheDocument();
    expect(input()).toHaveAttribute('aria-invalid', 'true');
    expect(input()).toHaveAccessibleDescription('Enter a valid email address.');
    expect(input()).toHaveFocus();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('rejects an empty field the same way', async () => {
    render(<SignupForm />);
    await userEvent.click(submit());
    expect(input()).toHaveAccessibleDescription('Enter a valid email address.');
  });

  it('accepts a valid address, announces the confirmation politely, and clears the field', async () => {
    render(<SignupForm />);
    await userEvent.type(input(), '  ada@example.com ');
    await userEvent.click(submit());
    expect(screen.getByRole('status')).toHaveTextContent("Thanks, you're on the list. This is a demo, so nothing was sent.");
    expect(input()).toHaveValue('');
    expect(input()).toHaveAttribute('aria-invalid', 'false');
  });

  it('clears the error as soon as the person edits the field, and replaces it with the confirmation on a good retry', async () => {
    render(<SignupForm />);
    await userEvent.type(input(), 'oops');
    await userEvent.click(submit());
    await userEvent.type(input(), '@example.com');
    expect(screen.queryByText('Enter a valid email address.')).not.toBeInTheDocument();
    await userEvent.click(submit());
    expect(screen.getByRole('status')).toHaveTextContent('on the list');
  });

  it('sends nothing: no network request is made (the form is a mock)', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
    render(<SignupForm />);
    await userEvent.type(input(), 'ada@example.com');
    await userEvent.click(submit());
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
