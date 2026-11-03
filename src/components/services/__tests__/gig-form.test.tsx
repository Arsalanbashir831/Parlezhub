// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ServiceForm from '../service-form';

// The AI assist button is not part of what these tests assert, and its hook
// reaches for a generation endpoint on mount.
vi.mock('@/hooks/useAIGeneration', () => ({
  useAIGeneration: () => ({
    isGenerating: false,
    generateContent: vi.fn(async () => ({ content: null, error: null })),
  }),
}));

const renderForm = (props = {}) =>
  render(
    <ServiceForm
      onSubmit={vi.fn(async () => undefined)}
      availableTypes={['astrology']}
      {...props}
    />
  );

// The student-facing card is the only <aside> the form renders.
const preview = (container: HTMLElement) => within(container.querySelector('aside')!);

afterEach(cleanup);

describe('gig preview', () => {
  it('appears only when the screen asks for it', () => {
    const { unmount } = renderForm();
    expect(screen.queryByText('How students see it')).toBeNull();
    unmount();

    renderForm({ showPreview: true });
    expect(screen.queryByText('How students see it')).not.toBeNull();
  });

  it('holds an empty-state shape before anything is typed', () => {
    const { container } = renderForm({ showPreview: true });

    expect(preview(container).queryByText('Your gig title')).not.toBeNull();
    expect(preview(container).getByText('Draft')).not.toBeNull();
  });

  it('follows the title as it is typed', () => {
    const { container } = renderForm({ showPreview: true });
    const title = screen.getByLabelText(/Gig Title/i);

    fireEvent.change(title, {
      target: { value: 'I will read your natal chart' },
    });

    expect(preview(container).queryByText('Your gig title')).toBeNull();
    expect(
      preview(container).queryByText('I will read your natal chart')
    ).not.toBeNull();
  });
});

describe('session duration', () => {
  it('is a field the consultant can actually edit', () => {
    renderForm();
    const input = screen.getByLabelText(/Session Duration/i) as HTMLInputElement;

    expect(input.disabled).toBe(false);
    fireEvent.change(input, { target: { value: '75' } });
    expect(input.value).toBe('75');
  });

  it('takes a one-tap value and shows it in the preview', () => {
    const { container } = renderForm({ showPreview: true });
    const input = screen.getByLabelText(/Session Duration/i) as HTMLInputElement;

    fireEvent.click(screen.getByRole('button', { name: '60 min' }));

    expect(input.value).toBe('60');
    expect(preview(container).getByText('60 min')).not.toBeNull();
  });
});

describe('suggested tags', () => {
  it('lands in the gig and counts toward the five-tag ceiling', () => {
    const { container } = renderForm({ showPreview: true });

    fireEvent.click(screen.getByRole('button', { name: '+ Natal chart' }));

    expect(screen.getByText(/1\/5/)).not.toBeNull();
    expect(preview(container).queryByText('Natal chart')).not.toBeNull();
  });

  it('offers astrology vocabulary, not language-learning one', () => {
    renderForm({ availableTypes: ['astrology'] });

    expect(screen.queryByRole('button', { name: '+ Kundli' })).not.toBeNull();
    expect(
      screen.queryByRole('button', { name: '+ Business English' })
    ).toBeNull();
  });
});
