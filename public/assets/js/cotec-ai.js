(function () {
  const CONTACT_PHONE = '+243 817 483 857';
  const GREETING = 'Bonjour, je suis COTEC IA. Je peux vous renseigner sur Internet, Starlink, les installations, la maintenance, les tarifs, les stages et formations. Comment puis-je vous aider ?';

  // Identifiant de conversation, conservé le temps de la session du navigateur.
  function getConversationId() {
    try {
      let id = sessionStorage.getItem('cotec-ai-conversation');
      if (!id) {
        id = (crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(36).slice(2)).replace(/[^a-zA-Z0-9_-]/g, '');
        sessionStorage.setItem('cotec-ai-conversation', id);
      }
      return id;
    } catch {
      return 'guest-' + Math.random().toString(36).slice(2, 12);
    }
  }
  const conversationId = getConversationId();

  async function askAssistant(input) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 30000);
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, conversationId }),
        signal: controller.signal
      });
      clearTimeout(timer);
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.reply) return data.reply;
      if (data.error) return data.error;
      if (response.status === 429) return 'Vous écrivez très vite ! Laissez-moi une petite minute et réessayez.';
    } catch (error) {
      // Serveur injoignable : message d’orientation ci-dessous.
    }
    return 'Je rencontre une difficulté de connexion pour le moment. Vous pouvez joindre l’équipe COTEC directement au ' + CONTACT_PHONE + ' (appel ou WhatsApp), nous vous répondrons rapidement.';
  }

  function createWidget() {
    const existing = document.getElementById('cotec-ai-widget');
    if (existing) return existing;

    const widget = document.createElement('div');
    widget.id = 'cotec-ai-widget';
    widget.className = 'cotec-ai-widget';
    widget.setAttribute('aria-hidden', 'true');

    widget.innerHTML = `
      <div class="cotec-ai-widget__header">
        <div class="cotec-ai-widget__title-wrap">
          <span class="cotec-ai-widget__badge"></span>
          <div>
            <strong>COTEC IA</strong>
            <small>Assistante COTEC · en ligne</small>
          </div>
        </div>
        <button class="cotec-ai-widget__close" type="button" aria-label="Fermer la conversation">×</button>
      </div>
      <div class="cotec-ai-widget__messages" aria-live="polite">
        <div class="cotec-ai-message cotec-ai-message--bot">${GREETING}</div>
      </div>
      <div class="cotec-ai-widget__quick-actions">
        <button type="button" class="cotec-ai-quick" data-q="Quels sont vos tarifs ?">Tarifs</button>
        <button type="button" class="cotec-ai-quick" data-q="Je veux une installation Starlink">Installation</button>
        <button type="button" class="cotec-ai-quick" data-q="J’ai un problème de connexion">Dépannage</button>
        <button type="button" class="cotec-ai-quick" data-q="Proposez-vous des stages et des formations ?">Stage</button>
        <a class="cotec-ai-quick cotec-ai-quick--wa" href="#" data-whatsapp-key="general_contact" data-whatsapp-fallback="Bonjour COTEC, je souhaite parler à un conseiller." target="_blank" rel="noopener">Conseiller</a>
      </div>
      <form class="cotec-ai-widget__composer">
        <input type="text" name="message" placeholder="Posez votre question…" aria-label="Votre message pour l’assistant COTEC IA" autocomplete="off" />
        <button type="submit" aria-label="Envoyer">Envoyer</button>
      </form>
    `;

    document.body.appendChild(widget);
    return widget;
  }

  function createLauncher() {
    const existing = document.querySelector('.cotec-ai-launcher');
    if (existing) {
      existing.style.width = '58px';
      existing.style.height = '58px';
      existing.style.border = '3px solid #fff';
      const img = existing.querySelector('img');
      if (img) {
        img.style.width = '29px';
        img.style.height = '29px';
      }
      return existing;
    }

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'cotec-ai-launcher';
    launcher.setAttribute('aria-label', 'Ouvrir l’assistant COTEC IA');
    launcher.innerHTML = '<img src="/assets/img/COTEC_IA.png" alt="COTEC IA" aria-hidden="false">';
    launcher.style.width = '58px';
    launcher.style.height = '58px';
    launcher.style.border = '3px solid #fff';
    const img = launcher.querySelector('img');
    if (img) {
      img.style.width = '29px';
      img.style.height = '29px';
    }
    document.body.appendChild(launcher);
    return launcher;
  }

  function addMessage(text, type) {
    const widget = document.getElementById('cotec-ai-widget');
    if (!widget) return;
    const messages = widget.querySelector('.cotec-ai-widget__messages');
    const message = document.createElement('div');
    message.className = `cotec-ai-message cotec-ai-message--${type}`;
    messages.appendChild(message);

    if (type === 'bot') {
      const cursor = document.createElement('span');
      cursor.textContent = '|';
      cursor.style.opacity = '0.8';
      let index = 0;

      const tick = () => {
        message.textContent = text.slice(0, index);
        if (index < text.length) {
          message.appendChild(cursor);
          index += 1;
          messages.scrollTop = messages.scrollHeight;
          setTimeout(tick, 9);
          return;
        }

        message.textContent = text;
        messages.scrollTop = messages.scrollHeight;
      };

      tick();
      return;
    }

    message.textContent = text;
    messages.scrollTop = messages.scrollHeight;
  }

  function syncLauncherState() {
    const launcher = document.querySelector('.cotec-ai-launcher');
    const widget = document.getElementById('cotec-ai-widget');
    if (!launcher) return;
    if (widget && widget.classList.contains('is-open')) {
      launcher.classList.add('is-hidden');
    } else {
      launcher.classList.remove('is-hidden');
    }
  }

  function openWidget() {
    const widget = createWidget();
    widget.classList.add('is-open');
    widget.setAttribute('aria-hidden', 'false');
    syncLauncherState();
    const input = widget.querySelector('input[name="message"]');
    if (input) setTimeout(() => input.focus(), 100);
  }

  function closeWidget() {
    const widget = document.getElementById('cotec-ai-widget');
    if (!widget) return;
    widget.classList.remove('is-open');
    widget.setAttribute('aria-hidden', 'true');
    syncLauncherState();
  }

  function bindInteraction() {
    const widget = document.getElementById('cotec-ai-widget');
    if (!widget) return;

    widget.querySelector('.cotec-ai-widget__close').addEventListener('click', closeWidget);

    widget.querySelector('.cotec-ai-widget__composer').addEventListener('submit', async (event) => {
      event.preventDefault();
      const input = widget.querySelector('input[name="message"]');
      const value = (input.value || '').trim();
      if (!value) return;

      addMessage(value, 'user');
      input.value = '';
      input.disabled = true;

      const messages = widget.querySelector('.cotec-ai-widget__messages');
      const typing = document.createElement('div');
      typing.className = 'cotec-ai-message cotec-ai-message--bot cotec-ai-typing';
      typing.setAttribute('aria-label', 'COTEC IA écrit');
      typing.innerHTML = '<span></span><span></span><span></span>';
      messages.appendChild(typing);
      messages.scrollTop = messages.scrollHeight;

      const reply = await askAssistant(value);
      typing.remove();
      addMessage(reply, 'bot');
      input.disabled = false;
      input.focus();
    });

    widget.querySelectorAll('button.cotec-ai-quick').forEach((button) => {
      button.addEventListener('click', () => {
        const input = widget.querySelector('input[name="message"]');
        input.value = button.dataset.q || button.textContent.trim();
        input.dispatchEvent(new Event('input', { bubbles: true }));
        widget.querySelector('.cotec-ai-widget__composer').dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
      });
    });
  }

  function wireLinks() {
    document.querySelectorAll('a[href="#cotec-ai"]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        openWidget();
      });
    });
  }

  function toggleOnLauncher() {
    const launcher = createLauncher();
    launcher.addEventListener('click', () => {
      const widget = document.getElementById('cotec-ai-widget');
      if (!widget) {
        openWidget();
        return;
      }
      if (widget.classList.contains('is-open')) {
        closeWidget();
      } else {
        openWidget();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    wireLinks();
    toggleOnLauncher();
    const widget = createWidget();
    bindInteraction();
    widget.classList.remove('is-open');
    widget.setAttribute('aria-hidden', 'true');
    syncLauncherState();
  });
})();
