import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Button, Input } from 'cyberui-2045';
import { SIGNUP } from '../data/product';

// Deliberately loose: it catches typos, not undeliverable addresses (only
// sending a message can do that). Replace it if your backend is stricter.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
    if (error) setError('');
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setConfirmation('');
      setError(SIGNUP.invalid);
      // Focus goes back to the field so a screen reader reads its label and
      // the linked error together. Input does not forward a ref, so find it by name.
      (event.currentTarget.elements.namedItem('email') as HTMLInputElement | null)?.focus();
      return;
    }
    // MOCK: nothing is sent. This is where your sign-up request goes, e.g.
    //   await fetch('/api/signup', { method: 'POST', body: JSON.stringify({ email }) });
    // and the confirmation below should wait for it to succeed (and show a
    // failure message when it does not).
    setConfirmation(SIGNUP.confirmation);
    setEmail('');
  };

  return (
    // noValidate: the browser's own validation bubble would pre-empt the
    // message below, which is the one this template styles and links to the field.
    <form className="signup-form" onSubmit={onSubmit} noValidate>
      {/*
        Input renders the <label>, the error text, and aria-invalid; when
        `error` is set it also points aria-describedby at that text. It does not
        mark the error as an alert, which is why submit moves focus to the field
        (reported as patrickkuei/CyberUI#121; drop the focus() call if it is
        fixed in the version you use).
      */}
      <Input
        label={SIGNUP.fieldLabel}
        name="email"
        type="email"
        autoComplete="email"
        placeholder={SIGNUP.placeholder}
        aria-required="true"
        value={email}
        onChange={onChange}
        error={error || undefined}
      />
      <Button type="submit">{SIGNUP.button}</Button>
      {/* role="status" is a polite live region. It must be in the page before its text changes, so it is always rendered. */}
      <p role="status" className="signup-status">
        {confirmation}
      </p>
    </form>
  );
}
