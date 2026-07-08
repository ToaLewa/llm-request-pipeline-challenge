import type { FormEvent } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

type ChatPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  textareaId: string;
  textareaLabel: string;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  placeholder: string;
  submitLabel: string;
  isSubmitting: boolean;
  expandable?: boolean;
  submitDisabled?: boolean;
  status?: string;
  statusMessage?: string;
};

export function ChatPanel({
  eyebrow,
  title,
  description,
  textareaId,
  textareaLabel,
  value,
  onChange,
  onSubmit,
  placeholder,
  submitLabel,
  isSubmitting,
  expandable = false,
  submitDisabled = false,
  status,
  statusMessage,
}: ChatPanelProps) {
  const heading = (
    <span>
      <span className="eyebrow">{eyebrow}</span>
      <span className="workflow-chat-title">{title}</span>
    </span>
  );
  const content = (
    <div className="workflow-chat-content">
      <p>{description}</p>

      <LoadingSpinner
        isLoading={isSubmitting}
        className="workflow-action-thinking"
        spinnerClassName="workflow-action-spinner"
        message="Processing..."
      />

      {!isSubmitting ? (
        <form className="workflow-chat-composer" onSubmit={onSubmit}>
          <label className="sr-only" htmlFor={textareaId}>{textareaLabel}</label>
          <textarea
            id={textareaId}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            rows={4}
          />
          <div className="composer-actions">
            <span>{value.trim().length} characters drafted</span>
            <button type="submit" disabled={isSubmitting || submitDisabled}>{submitLabel}</button>
          </div>
        </form>
      ) : null}

      {status && statusMessage ? (
        <p className={`workflow-action-message is-${status}`} role={status === 'error' ? 'alert' : 'status'}>{statusMessage}</p>
      ) : null}
    </div>
  );

  if (expandable) {
    return (
      <details className="workflow-chat-panel" open={isSubmitting ? true : undefined}>
        <summary className="workflow-chat-summary">
          {heading}
          <span className="workflow-chat-toggle">Expand</span>
        </summary>
        {content}
      </details>
    );
  }

  return (
    <section className="workflow-chat-panel">
      <div className="chat-panel-static-heading workflow-chat-summary">{heading}</div>
      {content}
    </section>
  );
}
