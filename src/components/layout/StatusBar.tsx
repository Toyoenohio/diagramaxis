import React from 'react';
import { useProjectStore } from '../../store/useProjectStore';

/**
 * Antes era una barra de estado fija. En el diseño de lienzo limpio los
 * indicadores viven en la barra superior / herramientas, y aquí solo queda
 * la notificación flotante (toast).
 */
export const StatusBar: React.FC = () => {
  const { toastMessage } = useProjectStore();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 left-1/2 z-[60] animate-fade-in pointer-events-none">
      <div className="px-4 py-2 rounded-lg bg-diagramaxis-brandChip text-diagramaxis-bg text-[13px] font-medium shadow-2xl max-w-[480px] text-center">
        {toastMessage}
      </div>
    </div>
  );
};
