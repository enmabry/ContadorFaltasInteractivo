import React, { useState } from 'react';
import { X, Key, ExternalLink, Check, AlertCircle, HelpCircle } from 'lucide-react';
import { useGoogleAuth } from '../context/GoogleAuthContext';

interface CalendarConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigured?: () => void;
}

export const CalendarConfigModal: React.FC<CalendarConfigModalProps> = ({
  isOpen,
  onClose,
  onConfigured
}) => {
  const { clientId, setClientId } = useGoogleAuth();
  const [inputVal, setInputVal] = useState(clientId);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputVal.trim();
    if (!clean) {
      setError('Por favor ingresa un Client ID válido.');
      return;
    }
    if (!clean.includes('.apps.googleusercontent.com')) {
      setError('El Client ID debe terminar en ".apps.googleusercontent.com"');
      return;
    }

    setClientId(clean);
    setSuccess(true);
    setError('');

    setTimeout(() => {
      onClose();
      if (onConfigured) {
        onConfigured();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-canvas border border-hairline rounded-lg shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] p-6 text-charcoal my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-card-tint-sky text-link-blue">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                Configuración de Google Calendar API
              </h2>
              <p className="text-xs text-steel">
                Conecta tu Google Client ID para importar horarios automáticamente
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

        {error && (
          <div className="mt-3 p-2.5 rounded-md bg-card-tint-rose border border-semantic-error/30 text-semantic-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mt-3 p-2.5 rounded-md bg-card-tint-mint border border-brand-green/30 text-brand-green text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Client ID guardado correctamente. Ya puedes sincronizar tu calendario.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Google OAuth Client ID *
            </label>
            <input
              type="text"
              value={inputVal}
              onChange={(e) => {
                setInputVal(e.target.value);
                setError('');
              }}
              placeholder="Ej: 123456789-abcdef.apps.googleusercontent.com"
              className="w-full h-11 px-3 rounded-md bg-canvas border border-hairline-strong text-ink placeholder-muted focus:outline-none focus:border-2 focus:border-primary text-xs font-mono transition-colors"
              required
            />
            <span className="text-[11px] text-steel mt-1 block">
              Se guarda en tu navegador local (`localStorage`) o en la variable <code>VITE_GOOGLE_CLIENT_ID</code>.
            </span>
          </div>

          {/* Current Origin Box for Google Cloud */}
          <div className="p-3 rounded-md bg-card-tint-amber/40 border border-amber-300/60 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>Solución a "Error 400: origin_mismatch":</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  alert(`Copiado al portapapeles: ${window.location.origin}`);
                }}
                className="text-[11px] font-medium text-primary hover:underline px-1.5 py-0.5 rounded bg-canvas border border-hairline"
              >
                Copiar origen
              </button>
            </div>
            <p className="text-[11px] text-charcoal">
              En Google Cloud Console, dentro de tu ID de cliente OAuth, en <strong>"Orígenes autorizados de JavaScript"</strong>, debes agregar exactamente:
            </p>
            <code className="block p-1.5 bg-canvas rounded border border-hairline font-mono text-xs font-semibold text-ink select-all">
              {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}
            </code>
            <p className="text-[10px] text-steel">
              💡 <em>Consejo: Agrega también <code>http://localhost:5173</code>, <code>http://localhost:5174</code> y <code>http://127.0.0.1:5173</code> sin barra final (<code>/</code>). Tras guardar en Google, espera 1 o 2 minutos a que Google sincronice sus servidores.</em>
            </p>
          </div>

          {/* Setup steps guide */}
          <div className="p-3.5 rounded-md bg-surface border border-hairline text-xs space-y-2.5">
            <div className="flex items-center justify-between font-semibold text-ink">
              <span className="flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-link-blue" />
                Pasos en Google Cloud Console:
              </span>
              <a
                href="https://console.cloud.google.com/apis/credentials"
                target="_blank"
                rel="noreferrer"
                className="text-link-blue hover:text-link-blue-pressed flex items-center gap-1 text-[11px]"
              >
                <span>Ir a Credenciales</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <ol className="list-decimal pl-4 space-y-1.5 text-steel text-[11px] leading-relaxed">
              <li>Haz clic en tu <strong>ID de cliente de OAuth 2.0</strong> en la lista de Credenciales.</li>
              <li>Baja hasta la sección <strong>"Orígenes autorizados de JavaScript"</strong>.</li>
              <li>Pulsa <strong>"+ AGREGAR URI"</strong> y pega <code>{typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}</code>.</li>
              <li>Haz clic en <strong>Guardar</strong> al final de la página.</li>
              <li>Espera 1-2 minutos y vuelve a pulsar el botón de Google Calendar.</li>
            </ol>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-surface border border-hairline-strong rounded-md transition-colors"
            >
              Cerrar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-on-primary bg-primary hover:bg-primary-pressed rounded-md shadow-sm transition-all active:scale-[0.98]"
            >
              Guardar Client ID
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
