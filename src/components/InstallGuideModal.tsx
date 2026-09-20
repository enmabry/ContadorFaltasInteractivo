import React, { useState } from 'react';
import { X, Smartphone, Share, PlusSquare, ArrowDownToLine, Check, WifiOff, Zap } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerInstall?: () => void;
  canInstallDirectly?: boolean;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  onTriggerInstall,
  canInstallDirectly
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('ios');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] p-6 text-charcoal">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-card-tint-lavender text-brand-purple-800">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                Instalar WEBER en tu Teléfono
              </h2>
              <p className="text-xs text-steel">
                Pantalla completa (standalone) y modo sin internet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-steel hover:text-ink rounded-sm hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Superpowers pill summary */}
        <div className="my-3.5 grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded-md bg-card-tint-mint border border-brand-green/20 text-brand-green flex items-center gap-2">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">Funciona 100% offline sin datos</span>
          </div>
          <div className="p-2 rounded-md bg-card-tint-sky border border-link-blue/20 text-link-blue flex items-center gap-2">
            <Zap className="w-4 h-4 shrink-0" />
            <span className="text-[11px] font-medium leading-tight">Carga instantánea sin tiendas</span>
          </div>
        </div>

        {/* Platform Selector Pill-Tabs */}
        <div className="flex items-center gap-1.5 bg-surface p-1 rounded-md border border-hairline mb-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setPlatform('ios')}
            className={`flex-1 py-1.5 rounded-sm transition-all text-center ${
              platform === 'ios'
                ? 'bg-canvas text-ink font-semibold shadow-xs'
                : 'text-steel hover:text-ink'
            }`}
          >
            iPhone (iOS / Safari)
          </button>
          <button
            type="button"
            onClick={() => setPlatform('android')}
            className={`flex-1 py-1.5 rounded-sm transition-all text-center ${
              platform === 'android'
                ? 'bg-canvas text-ink font-semibold shadow-xs'
                : 'text-steel hover:text-ink'
            }`}
          >
            Android (Chrome)
          </button>
        </div>

        {/* Instructions */}
        {platform === 'ios' ? (
          <div className="space-y-3 text-xs text-charcoal">
            <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-ink">Abre el enlace en Safari</p>
                <p className="text-steel text-[11px]">En iOS, Safari es el único navegador que permite añadir a la pantalla de inicio.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-ink flex items-center gap-1.5">
                  <span>Toca el botón Compartir</span>
                  <Share className="w-3.5 h-3.5 text-link-blue" />
                </p>
                <p className="text-steel text-[11px]">Es el icono cuadrado con la flecha hacia arriba en la barra inferior.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-semibold text-ink flex items-center gap-1.5">
                  <span>"Añadir a la pantalla de inicio"</span>
                  <PlusSquare className="w-3.5 h-3.5 text-brand-green" />
                </p>
                <p className="text-steel text-[11px]">Desliza hacia abajo en el menú y toca esta opción.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs text-charcoal">
            {canInstallDirectly && onTriggerInstall && (
              <button
                type="button"
                onClick={() => {
                  onTriggerInstall();
                  onClose();
                }}
                className="w-full py-2.5 px-4 rounded-md bg-primary hover:bg-primary-pressed text-on-primary font-medium text-xs shadow-xs flex items-center justify-center gap-2 mb-2"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Instalar ahora con 1 clic</span>
              </button>
            )}

            <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                1
              </div>
              <div>
                <p className="font-semibold text-ink">Abre el enlace en Google Chrome</p>
                <p className="text-steel text-[11px]">Chrome detectará automáticamente que es una aplicación instalable.</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                2
              </div>
              <div>
                <p className="font-semibold text-ink">Acepta el aviso o toca los 3 puntos</p>
                <p className="text-steel text-[11px]">Aparecerá un aviso en la parte inferior o puedes tocar los tres puntos arriba a la derecha y elegir "Instalar aplicación".</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
              <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                3
              </div>
              <div>
                <p className="font-semibold text-ink flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-brand-green" />
                  <span>¡Listo en tu cajón de apps!</span>
                </p>
                <p className="text-steel text-[11px]">Se abrirá a pantalla completa sin la barra del navegador.</p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-hairline flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-charcoal hover:bg-surface border border-hairline-strong rounded-md transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};
