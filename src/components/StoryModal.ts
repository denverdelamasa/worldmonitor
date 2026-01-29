import type { StoryData } from '@/services/story-data';
import { renderStoryToCanvas } from '@/services/story-renderer';

let modalEl: HTMLElement | null = null;
let currentDataUrl: string | null = null;
let currentBlob: Blob | null = null;

export function openStoryModal(data: StoryData): void {
  closeStoryModal();

  modalEl = document.createElement('div');
  modalEl.className = 'story-modal-overlay';
  modalEl.innerHTML = `
    <div class="story-modal">
      <div class="story-modal-content">
        <div class="story-loading">
          <div class="story-spinner"></div>
          <span>Generating story...</span>
        </div>
      </div>
      <div class="story-actions" style="display:none">
        <button class="story-btn story-save">Save PNG</button>
        <button class="story-btn story-whatsapp">WhatsApp</button>
        <button class="story-btn story-instagram">Instagram</button>
        <button class="story-btn story-close">Close</button>
      </div>
    </div>
  `;

  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeStoryModal();
  });
  modalEl.querySelector('.story-close')?.addEventListener('click', closeStoryModal);
  modalEl.querySelector('.story-save')?.addEventListener('click', downloadStory);
  modalEl.querySelector('.story-whatsapp')?.addEventListener('click', () => shareWhatsApp(data.countryName));
  modalEl.querySelector('.story-instagram')?.addEventListener('click', () => shareInstagram(data.countryName));

  document.body.appendChild(modalEl);

  requestAnimationFrame(() => {
    if (!modalEl) return;
    try {
      const canvas = renderStoryToCanvas(data);
      currentDataUrl = canvas.toDataURL('image/png');
      // Create blob synchronously from data URL
      const binStr = atob(currentDataUrl.split(',')[1] ?? '');
      const bytes = new Uint8Array(binStr.length);
      for (let i = 0; i < binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
      currentBlob = new Blob([bytes], { type: 'image/png' });

      const content = modalEl.querySelector('.story-modal-content');
      if (content) {
        content.innerHTML = '';
        const img = document.createElement('img');
        img.className = 'story-image';
        img.src = currentDataUrl;
        img.alt = `${data.countryName} Intelligence Story`;
        content.appendChild(img);
      }
      const actions = modalEl.querySelector('.story-actions') as HTMLElement;
      if (actions) actions.style.display = 'flex';
    } catch (err) {
      console.error('[StoryModal] Render error:', err);
      const content = modalEl?.querySelector('.story-modal-content');
      if (content) content.innerHTML = '<div class="story-error">Failed to generate story.</div>';
    }
  });
}

export function closeStoryModal(): void {
  if (modalEl) {
    modalEl.remove();
    modalEl = null;
    currentDataUrl = null;
    currentBlob = null;
  }
}

function downloadStory(): void {
  if (!currentDataUrl) return;
  const a = document.createElement('a');
  a.href = currentDataUrl;
  a.download = `worldmonitor-story-${Date.now()}.png`;
  a.click();
  flashButton('.story-save', 'Saved!', 'Save PNG');
}

function shareWhatsApp(countryName: string): void {
  if (!currentBlob) {
    downloadStory();
    return;
  }

  const file = new File([currentBlob], `${countryName.toLowerCase()}-worldmonitor.png`, { type: 'image/png' });
  const msg = `${countryName} intelligence snapshot — worldmonitor.app`;

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    navigator.share({ text: msg, files: [file] }).catch(() => {
      openWhatsApp(msg);
    });
  } else {
    downloadStory();
    openWhatsApp(msg);
    flashButton('.story-whatsapp', 'Image saved — attach in WhatsApp', 'WhatsApp');
  }
}

function openWhatsApp(text: string): void {
  const encoded = encodeURIComponent(text);
  const t0 = Date.now();
  window.location.href = `whatsapp://send?text=${encoded}`;
  setTimeout(() => {
    if (Date.now() - t0 < 1500 && !document.hidden) {
      window.open(`https://wa.me/?text=${encoded}`, '_blank');
    }
  }, 1000);
}

async function shareInstagram(countryName: string): Promise<void> {
  if (!currentBlob) {
    downloadStory();
    return;
  }

  const file = new File([currentBlob], `${countryName.toLowerCase()}-worldmonitor.png`, { type: 'image/png' });

  if (navigator.share && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({
        files: [file],
      });
      return;
    } catch {
      // cancelled or failed
    }
  }

  // Fallback: copy to clipboard + instruct
  try {
    await navigator.clipboard.write([
      new ClipboardItem({ 'image/png': currentBlob }),
    ]);
    flashButton('.story-instagram', 'Copied! Paste in IG', 'Instagram');
  } catch {
    downloadStory();
    flashButton('.story-instagram', 'Saved! Upload to IG', 'Instagram');
  }
}

function flashButton(selector: string, flashText: string, originalText: string): void {
  const btn = modalEl?.querySelector(selector);
  if (btn) {
    btn.textContent = flashText;
    setTimeout(() => { if (btn) btn.textContent = originalText; }, 2500);
  }
}
