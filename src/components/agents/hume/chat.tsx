'use client';

import { ComponentRef, useRef } from 'react';
import { VoiceProvider } from '@humeai/voice-react';

import Controls from './controls';
import Messages from './messages';
import StartCall from './start-call';

export default function ClientComponent({
  accessToken,
}: {
  accessToken: string;
}) {
  const timeout = useRef<number | null>(null);
  const ref = useRef<ComponentRef<typeof Messages> | null>(null);

  return (
    <div
      className={'relative mx-auto flex w-full grow flex-col overflow-hidden'}
    >
      <VoiceProvider
        onMessage={() => {
          if (timeout.current) {
            window.clearTimeout(timeout.current);
          }

          timeout.current = window.setTimeout(() => {
            if (ref.current) {
              const scrollHeight = ref.current.scrollHeight;

              ref.current.scrollTo({
                top: scrollHeight,
                behavior: 'smooth',
              });
            }
          }, 200);
        }}
      >
        <Messages ref={ref} />
        <Controls />
        <StartCall
          configId="31efa75c-2fa6-4386-ba27-210c1539866a"
          accessToken={accessToken}
        />
      </VoiceProvider>
    </div>
  );
}
