  if (!document.getElementById("wconnect-voice-widget")) {
    const style = document.createElement("style");
    style.textContent = `
      #wconnect-voice-widget {
        position: fixed;
        top: 50%;
        right: 30px;
        left: auto;
        transform: translateY(-50%);
        width: 220px;
        height: 97px;
        background: #1b1b34;
        border-radius: 14px;
        box-shadow: 0 12px 28px rgba(0,0,0,0.35);
        z-index: 999999;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.05);
        touch-action: none;
        color: white;
        font-family: Arial, sans-serif;
      }

      #wconnect-voice-widget * {
        box-sizing: border-box;
      }

      #wconnect-widget-body {
        padding: 6px 10px 8px;
      }

      #wconnect-voice-widget .title {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.08;
        margin: 0 0 8px;
        color: #f4f4f5;
        text-align: center;
      }

      #wconnect-voice-widget .action-area {
        display: flex;
        justify-content: center;
      }

      #wconnect-voice-widget button.actionBtn {
        width: 180px;
        max-width: 100%;
        min-height: 38px;
        border: none;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        cursor: pointer;
      }

      #wconnect-btnLigar {
        background: #53b44f;
        color: white;
        display: block;
      }

      #wconnect-btnDesligar {
        background: #e54848;
        color: white;
        display: none;
      }

      #wconnect-status {
        margin-top: 6px;
        text-align: center;
        font-size: 9px;
        color: rgba(255,255,255,0.78);
        min-height: 14px;
        word-break: break-word;
      }
    `;
    document.head.appendChild(style);

    const widget = document.createElement("div");
    widget.id = "wconnect-voice-widget";
    widget.innerHTML = `
      <div id="wconnect-widget-body">
        <h1 class="title">🗣️ Tire suas dúvidas</h1>
        <div class="action-area">
          <button id="wconnect-btnLigar" class="actionBtn">🎤 Converse com nosso Agente</button>
          <button id="wconnect-btnDesligar" class="actionBtn">⏹️ Desligar</button>
        </div>
        <div id="wconnect-status">Aguardando...</div>
      </div>
    `;
    document.body.appendChild(widget);

    const btnLigar = document.getElementById("wconnect-btnLigar");
    const btnDesligar = document.getElementById("wconnect-btnDesligar");
    const statusDiv = document.getElementById("wconnect-status");

    let session = null;

    function setStatus(text) {
      statusDiv.innerText = text;
      console.log("[STATUS]", text);
    }

    function podeArrastar(target) {
      return !target.closest("button");
    }

    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    function iniciarArraste(clientX, clientY) {
      const rect = widget.getBoundingClientRect();
      isDragging = true;
      offsetX = clientX - rect.left;
      offsetY = clientY - rect.top;
      widget.style.left = rect.left + "px";
      widget.style.top = rect.top + "px";
      document.body.style.userSelect = "none";
    }

    function moverWidget(clientX, clientY) {
      if (!isDragging) return;
      let left = clientX - offsetX;
      let top = clientY - offsetY;
      const maxLeft = window.innerWidth - widget.offsetWidth;
      const maxTop = window.innerHeight - widget.offsetHeight;
      if (left < 0) left = 0;
      if (top < 0) top = 0;
      if (left > maxLeft) left = maxLeft;
      if (top > maxTop) top = maxTop;
      widget.style.left = left + "px";
      widget.style.top = top + "px";
    }

    function finalizarArraste() {
      isDragging = false;
      document.body.style.userSelect = "auto";
    }

    widget.addEventListener("mousedown", function (e) {
      if (!podeArrastar(e.target)) return;
      iniciarArraste(e.clientX, e.clientY);
    });

    document.addEventListener("mousemove", function (e) {
      moverWidget(e.clientX, e.clientY);
    });

    document.addEventListener("mouseup", function () {
      finalizarArraste();
    });

    widget.addEventListener("touchstart", function (e) {
      if (!podeArrastar(e.target)) return;
      const touch = e.touches[0];
      iniciarArraste(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener("touchmove", function (e) {
      const touch = e.touches[0];
      moverWidget(touch.clientX, touch.clientY);
    }, { passive: true });

    document.addEventListener("touchend", function () {
      finalizarArraste();
    });

    async function prepararMicrofone() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch (error) {
        setStatus("❌ Erro no microfone: " + error.message);
        return false;
      }
    }

    async function getPermissionState(name) {
      try {
        if (!navigator.permissions?.query) return "unsupported";
        const result = await navigator.permissions.query({ name });
        return result.state || "unknown";
      } catch {
        return "unsupported";
      }
    }

    async function getMediaInfo() {
      try {
        if (!navigator.mediaDevices?.enumerateDevices) return [];
        const devices = await navigator.mediaDevices.enumerateDevices();
        return devices.map(d => ({
          kind: d.kind,
          label: d.label || "",
          deviceId: d.deviceId ? "present" : "",
          groupId: d.groupId ? "present" : ""
        }));
      } catch (error) {
        return [{ error: error.message }];
      }
    }

    function getBrowserInfo() {
      return {
        url: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        referrer: document.referrer || "",
        title: document.title,
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages || [],
        platform: navigator.platform || "",
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        hardwareConcurrency: navigator.hardwareConcurrency || null,
        deviceMemory: navigator.deviceMemory || null,
        screen: {
          width: window.screen.width,
          height: window.screen.height,
          availWidth: window.screen.availWidth,
          availHeight: window.screen.availHeight,
          colorDepth: window.screen.colorDepth,
          pixelDepth: window.screen.pixelDepth
        },
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          outerWidth: window.outerWidth,
          outerHeight: window.outerHeight,
          devicePixelRatio: window.devicePixelRatio || 1
        },
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        localTime: new Date().toISOString(),
        cookies: document.cookie || ""
      };
    }

    async function collectClientContext() {
      const [micPermission, camPermission, geoPermission, notificationsPermission, mediaDevices] = await Promise.all([
        getPermissionState("microphone"),
        getPermissionState("camera"),
        getPermissionState("geolocation"),
        getPermissionState("notifications"),
        getMediaInfo()
      ]);

      let connection = null;
      try {
        const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (c) {
          connection = {
            effectiveType: c.effectiveType || "",
            rtt: c.rtt || null,
            downlink: c.downlink || null,
            saveData: c.saveData || false
          };
        }
      } catch {}

      return {
        browser: getBrowserInfo(),
        permissions: {
          microphone: micPermission,
          camera: camPermission,
          geolocation: geoPermission,
          notifications: notificationsPermission
        },
        mediaDevices,
        connection
      };
    }

    btnLigar.addEventListener("click", async () => {
      try {
        btnLigar.disabled = true;
        btnLigar.innerText = "⏳ Conectando...";

        setStatus("Solicitando acesso ao microfone...");
        const micOk = await prepararMicrofone();

        if (!micOk) {
          btnLigar.disabled = false;
          btnLigar.innerText = "🎤 Tentar Novamente";
          return;
        }

        setStatus("Coletando dados do navegador...");
        const clientContext = await collectClientContext();

        setStatus("Criando chamada com wconnect.ai...");

        const payload = new URLSearchParams();
        payload.append("source", "voz.wconnect.tech");
        payload.append("leadName", "Visitante do site");
        payload.append("fluxo", "WEBRTC_TESTE");
        payload.append("clientContext", JSON.stringify(clientContext));

        const response = await fetch("https://webhook.wconnect.tech/webhook/ultravox-webrtc", {
          method: "POST",
          body: payload
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data?.error || `Erro HTTP ${response.status}`);
        if (!data.joinUrl) throw new Error("Resposta sem joinUrl");

        const { UltravoxSession } = await import("https://esm.sh/ultravox-client@0.4.2");

        setStatus("Conectando sessão de voz...");
        session = new UltravoxSession({ experimentalMessages: ["debug"] });

        await session.joinCall(data.joinUrl, "web-test");

        try { session.setOutputMedium("voice"); } catch {}
        try { session.unmuteMic(); } catch {}
        try { session.unmuteSpeaker(); } catch {}

        setStatus("✅ Conectado! Pode falar.");
        btnLigar.style.display = "none";
        btnDesligar.style.display = "block";
      } catch (error) {
        console.error("[ERRO GERAL]", error);
        setStatus("❌ Erro ao conectar: " + error.message);
        btnLigar.disabled = false;
        btnLigar.innerText = "🎤 Tentar Novamente";
      }
    });

    btnDesligar.addEventListener("click", async () => {
      try {
        if (session) await session.leaveCall();
      } catch (error) {
        console.error("[ERRO AO DESLIGAR]", error);
      } finally {
        setStatus("Chamada encerrada.");
        btnLigar.style.display = "block";
        btnDesligar.style.display = "none";
        btnLigar.disabled = false;
        btnLigar.innerText = "🎤 Converse com nosso Agente";
        session = null;
      }
    });
  }
