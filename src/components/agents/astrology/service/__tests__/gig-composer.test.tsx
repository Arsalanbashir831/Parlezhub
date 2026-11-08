// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import GigComposer from '../gig-composer';

// The AI draft button reaches for a generation endpoint; these tests are about
// the fields around it.
vi.mock('@/hooks/useAIGeneration', () => ({
  useAIGeneration: () => ({
    isGenerating: false,
    generateContent: vi.fn(async () => ({ content: null, error: null })),
  }),
}));

const renderComposer = (props = {}) =>
  render(<GigComposer mode="create" onSubmit={vi.fn(async () => undefined)} onCancel={vi.fn()} {...props} />);

// The student-facing card is the only <aside> the composer renders.
const preview = (container: HTMLElement) => within(container.querySelector('aside')!);

afterEach(cleanup);

describe('the observatory gig composer', () => {
  it('shows the student card next to the fields', () => {
    const { container } = renderComposer();

    expect(screen.getByText('How a student sees it')).not.toBeNull();
    expect(preview(container).queryByText('Your gig title')).not.toBeNull();
  });

  it('follows the title as it is typed', () => {
    const { container } = renderComposer();

    fireEvent.change(screen.getByLabelText(/^Gig title/), {
      target: { value: 'I will read your natal chart' },
    });

    expect(preview(container).queryByText('I will read your natal chart')).not.toBeNull();
    expect(screen.getByText('28/80')).not.toBeNull();
  });

  it('suggests astrology vocabulary, not language-tutor vocabulary', () => {
    renderComposer();

    // New gigs are astrology readings only: the type is shown, not offered.
    expect(screen.queryByRole('group', { name: 'Type of session' })).toBeNull();
    expect(screen.getAllByText('Astrology Reading').length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: 'Language Consultation' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'General Consultancy' })).toBeNull();
    expect(screen.getByPlaceholderText(/map the next five years/)).not.toBeNull();
    expect(screen.queryByRole('button', { name: '+ Kundli' })).not.toBeNull();
    expect(screen.queryByRole('button', { name: '+ Pronunciation' })).toBeNull();
  });

  it('takes a duration from the quick picks and prices it in the card', () => {
    const { container } = renderComposer();
    const duration = screen.getByLabelText('Length in minutes') as HTMLInputElement;

    fireEvent.click(screen.getByRole('button', { name: '90 min' }));

    expect(duration.value).toBe('90');
    expect(preview(container).getByText('/ 90 min')).not.toBeNull();
  });

  it('adds a suggested tag and counts it toward the five-tag ceiling', () => {
    const { container } = renderComposer();

    fireEvent.click(screen.getByRole('button', { name: '+ Dasha timing' }));

    expect(screen.getByText('1/5 · tap to use')).not.toBeNull();
    expect(preview(container).queryByText('Dasha timing')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Dasha timing' }));
    expect(screen.getByText('0/5 · tap to use')).not.toBeNull();
  });

  it('lists what the student gets, in the card, once it is written', () => {
    const { container } = renderComposer();

    expect(preview(container).queryByText('A written summary of the reading')).toBeNull();

    fireEvent.change(screen.getByLabelText('New item the student gets'), {
      target: { value: 'A written summary of the reading' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add item' }));

    expect(preview(container).queryByText('A written summary of the reading')).not.toBeNull();
  });

  it('opens an existing gig with its own values, not the defaults', () => {
    renderComposer({
      mode: 'edit',
      availableTypes: ['astrology'],
      initialData: {
        type: 'astrology',
        title: 'A career read from your dasha',
        shortDescription: 'Ninety minutes on work, timing and the next move.',
        description: 'A long description of the session that clears the validator easily enough.',
        price: 120,
        duration: 90,
        tags: ['Career'],
        whatYouProvide: ['Written summary'],
      },
    });

    expect((screen.getByLabelText(/^Gig title/) as HTMLInputElement).value).toBe('A career read from your dasha');
    expect((screen.getByLabelText('Price per session') as HTMLInputElement).value).toBe('120');
    expect(screen.queryByRole('button', { name: '+ Career' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Save changes' })).not.toBeNull();
  });
});
