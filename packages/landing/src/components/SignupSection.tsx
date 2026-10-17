import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';
import { SignupForm } from './SignupForm';

export function SignupSection() {
  return (
    <section {...sectionProps('signup')} className="section">
      <div className="page-width">
        <SectionHeading id="signup" />
        <SignupForm />
      </div>
    </section>
  );
}
