import { useEffect, useId, useRef } from 'react';
import { Button } from 'cyberui-2045';

export interface ApprovalCardProps {
  prompt: string;
  onApprove: () => void;
  onReject: () => void;
}

/**
 * The human-in-the-loop step: the run is parked until one of these is pressed.
 * It sits inline in the conversation, not in a modal, so the question stays
 * next to what led to it.
 */
export function ApprovalCard({ prompt, onApprove, onReject }: ApprovalCardProps) {
  const promptId = useId();
  const cardRef = useRef<HTMLDivElement>(null);

  // Lands the keyboard on the decision. Found through the wrapper because the
  // library's Button is not documented to forward a ref.
  useEffect(() => {
    cardRef.current?.querySelector('button')?.focus();
  }, []);

  return (
    <div ref={cardRef} role="group" aria-labelledby={promptId} className="approval-card">
      <p className="approval-label">Approval needed</p>
      <p id={promptId} className="approval-prompt">
        {prompt}
      </p>
      <div className="approval-actions">
        <Button variant="primary" size="sm" onClick={onApprove}>
          Approve
        </Button>
        <Button variant="danger" size="sm" onClick={onReject}>
          Reject
        </Button>
      </div>
    </div>
  );
}
