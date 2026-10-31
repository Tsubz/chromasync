/** Bottom-sheet drawers close when dragged down by their handle or header. */
export function enableSwipeToDismiss(drawer: HTMLElement | null, onClose: () => void): void {
  if (!drawer) return;
  const content = drawer.querySelector<HTMLElement>('.drawer-content');
  const handle = drawer.querySelector<HTMLElement>('.drawer-handle');
  const backdrop = drawer.querySelector<HTMLElement>('.drawer-backdrop');
  if (!content) return;

  let startY = 0;
  let currentY = 0;
  let isDragging = false;

  const onPointerDown = (e: PointerEvent) => {
    const target = e.target as HTMLElement;
    const rect = content.getBoundingClientRect();
    const isTopArea = (e.clientY - rect.top) < 70;
    if (!handle?.contains(target) && !target.closest('.drawer-header') && !isTopArea) {
      return;
    }
    startY = e.clientY;
    currentY = e.clientY;
    isDragging = true;
    content.style.transition = 'none';
    try { content.setPointerCapture?.(e.pointerId); } catch {}
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!isDragging) return;
    currentY = e.clientY;
    const dy = currentY - startY;
    if (dy > 0) {
      content.style.transform = `translateY(${dy}px)`;
      if (backdrop) {
        backdrop.style.opacity = `${Math.max(0.15, 1 - dy / 260)}`;
      }
    }
  };

  const onPointerUp = (e: PointerEvent) => {
    if (!isDragging) return;
    isDragging = false;
    try { content.releasePointerCapture?.(e.pointerId); } catch {}
    const dy = currentY - startY;

    if (dy > 70) {
      // Dismiss downward smoothly
      content.style.transition = 'transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)';
      content.style.transform = 'translateY(100%)';
      window.setTimeout(() => {
        onClose();
        content.style.transition = '';
        content.style.transform = '';
        if (backdrop) backdrop.style.opacity = '';
      }, 220);
    } else {
      // Bounce back up
      content.style.transition = 'transform 0.26s cubic-bezier(0.16, 1, 0.3, 1)';
      content.style.transform = 'translateY(0)';
      if (backdrop) {
        backdrop.style.transition = 'opacity 0.26s ease';
        backdrop.style.opacity = '';
      }
      window.setTimeout(() => {
        content.style.transition = '';
        content.style.transform = '';
        if (backdrop) backdrop.style.transition = '';
      }, 260);
    }
  };

  content.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('pointercancel', onPointerUp);
}
