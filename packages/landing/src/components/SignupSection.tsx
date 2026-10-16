import { sectionProps } from '../sections';
import { SectionHeading } from './SectionHeading';
import { SignupForm } from './SignupForm';

export function SignupSection() {
  return (
    <section {...sectionProps('signup')} className="section signup">
      <div className="page-width signup-inner">
        <SectionHeading id="signup" />
        <SignupForm />
      </div>
    </section>
  );
}
