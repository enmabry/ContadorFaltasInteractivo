import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Smartphone, Share, PlusSquare, Check, X, ArrowDownToLine, Zap, WifiOff } from 'lucide-react';

interface InstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  canInstallDirectly?: boolean;
  onTriggerInstall?: () => void;
}

export const InstallGuideModal: React.FC<InstallGuideModalProps> = ({
  isOpen,
  onClose,
  canInstallDirectly = false,
  onTriggerInstall
}) => {
  const [platform, setPlatform] = useState<'ios' | 'android'>('android');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      if (/iphone|ipad|ipod/.test(userAgent)) {
        setPlatform('ios');
      } else {
        setPlatform('android');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-xl p-4 sm:p-6 text-charcoal my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-md bg-card-tint-lavender text-brand-purple-800 shrink-0">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink truncate">
                Instalar WEBER en tu Teléfono
              </h2>
              <p className="text-[11px] sm:text-xs text-steel truncate">
                Pantalla completa (standalone) y modo sin internet
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-steel hover:text-ink rounded-md hover:bg-surface transition-colors shrink-0 ml-2"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-0.5 py-3 space-y-3.5 min-h-0">
          {/* Superpowers pill summary */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-md bg-card-tint-mint border border-brand-green/20 text-brand-green flex items-center gap-2 min-w-0">
              <WifiOff className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-medium leading-tight truncate sm:whitespace-normal">Funciona 100% offline</span>
            </div>
            <div className="p-2 rounded-md bg-card-tint-sky border border-link-blue/20 text-link-blue flex items-center gap-2 min-w-0">
              <Zap className="w-4 h-4 shrink-0" />
              <span className="text-[11px] font-medium leading-tight truncate sm:whitespace-normal">Carga instantánea</span>
            </div>
          </div>

          {/* Platform Selector Pill-Tabs */}
          <div className="flex items-center gap-1.5 bg-surface p-1 rounded-md border border-hairline text-xs font-medium">
            <button
              type="button"
              onClick={() => setPlatform('ios')}
              className={`flex-1 py-1.5 rounded-sm transition-all text-center truncate ${
                platform === 'ios'
                  ? 'bg-canvas text-ink font-semibold shadow-xs'
                  : 'text-steel hover:text-ink'
              }`}
            >
              iPhone (iOS)
            </button>
            <button
              type="button"
              onClick={() => setPlatform('android')}
              className={`flex-1 py-1.5 rounded-sm transition-all text-center truncate ${
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
            <div className="space-y-2.5 text-xs text-charcoal">
              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Abre el enlace en Safari</p>
                  <p className="text-steel text-[11px]">En iOS, Safari permite añadir a la pantalla de inicio.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink flex items-center gap-1.5">
                    <span>Toca el botón Compartir</span>
                    <Share className="w-3.5 h-3.5 text-link-blue shrink-0" />
                  </p>
                  <p className="text-steel text-[11px]">Icono cuadrado con flecha hacia arriba en la barra inferior.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink flex items-center gap-1.5">
                    <span>"Añadir a la pantalla de inicio"</span>
                    <PlusSquare className="w-3.5 h-3.5 text-brand-green shrink-0" />
                  </p>
                  <p className="text-steel text-[11px]">Desliza hacia abajo en el menú y toca esta opción.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-2.5 text-xs text-charcoal">
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
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Abre en Google Chrome</p>
                  <p className="text-steel text-[11px]">Chrome detectará automáticamente que es una aplicación instalable.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink">Acepta el aviso o toca los 3 puntos</p>
                  <p className="text-steel text-[11px]">Aparecerá un aviso abajo o en el menú: "Instalar aplicación".</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-md bg-surface border border-hairline">
                <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-ink flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-brand-green shrink-0" />
                    <span>¡Listo en tu cajón de apps!</span>
                  </p>
                  <p className="text-steel text-[11px]">Se abrirá a pantalla completa sin la barra del navegador.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-hairline flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 text-xs font-medium text-charcoal hover:bg-surface border border-hairline-strong rounded-md transition-colors text-center"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
