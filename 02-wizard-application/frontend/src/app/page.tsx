'use client';

import { WizardProvider } from '@/context/WizardContext';
import { WizardContainer } from '@/components/wizard/WizardContainer';

export default function Home() {
  return (
    <WizardProvider>
      <WizardContainer />
    </WizardProvider>
  );
}
