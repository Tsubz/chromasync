import { Preferences } from '../core/Preferences';
import { BreathSettings } from '../core/BreathSettings';

/**
 * Safety notes shown once, before the first session: breathe gently, stop if dizzy, skip holds
 * with some conditions. Offers to start with shorter holds (checked by default).
 */
export function showOnboardingIfNeeded(onDone: () => void): void {
  const dialog = document.getElementById('onboarding');
  const accept = document.getElementById('onboarding-accept') as HTMLButtonElement | null;
  const shortHolds = document.getElementById('onboarding-short-holds') as HTMLInputElement | null;
  if (!dialog || !accept || Preferences.get('onboarded') === true) return;

  const previousFocus = document.activeElement as HTMLElement | null;
  const controls: HTMLElement[] = shortHolds ? [shortHolds, accept] : [accept];
  dialog.classList.remove('hidden');
  accept.focus();

  // While the dialog is open it owns the keyboard: captured at window level so the app's
  // shortcuts (Space starts a session) never fire behind it, even if focus was lost
  const onKeyDown = (e: KeyboardEvent) => {
    const focusInside = dialog.contains(document.activeElement);
    if (e.key === 'Escape') {
      e.preventDefault();
      finish();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const i = controls.indexOf(document.activeElement as HTMLElement);
      controls[(i + (e.shiftKey ? controls.length - 1 : 1)) % controls.length].focus();
    } else if (!focusInside) {
      e.preventDefault();
      accept.focus();
    }
    e.stopPropagation();
  };
  window.addEventListener('keydown', onKeyDown, true);

  const finish = () => {
    window.removeEventListener('keydown', onKeyDown, true);
    if (shortHolds) BreathSettings.gentleHolds = shortHolds.checked;
    Preferences.set('onboarded', true);
    dialog.classList.add('hidden');
    previousFocus?.focus?.();
    onDone();
  };

  accept.addEventListener('click', e => {
    e.stopPropagation();
    finish();
  }, { once: true });

  // Taps on the backdrop must not reach the canvas (they would start or pause a session)
  // nor take focus away from the dialog
  dialog.addEventListener('pointerdown', e => {
    e.stopPropagation();
    if (!(e.target as HTMLElement).closest('input, button, label')) e.preventDefault();
  });
}
