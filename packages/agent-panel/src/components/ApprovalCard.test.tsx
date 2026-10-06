import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApprovalCard } from './ApprovalCard';

const PROMPT = 'Refund $42.00 to the customer for order #4821?';

describe('ApprovalCard', () => {
  it('shows the prompt in a group named by it', () => {
    render(<ApprovalCard prompt={PROMPT} onApprove={vi.fn()} onReject={vi.fn()} />);
    expect(screen.getByRole('group', { name: PROMPT })).toBeInTheDocument();
    expect(screen.getByText('Approval needed')).toBeInTheDocument();
  });

  it('calls back once for Approve and once for Reject', async () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    render(<ApprovalCard prompt={PROMPT} onApprove={onApprove} onReject={onReject} />);
    await userEvent.click(screen.getByRole('button', { name: 'Approve' }));
    expect(onApprove).toHaveBeenCalledTimes(1);
    expect(onReject).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Reject' }));
    expect(onReject).toHaveBeenCalledTimes(1);
  });

  it('moves focus to Approve when it appears, so the keyboard lands on the decision', () => {
    render(<ApprovalCard prompt={PROMPT} onApprove={vi.fn()} onReject={vi.fn()} />);
    expect(screen.getByRole('button', { name: 'Approve' })).toHaveFocus();
  });
});
