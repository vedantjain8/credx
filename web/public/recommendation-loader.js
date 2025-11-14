(async function () {
  const CREDX_ORIGIN = "https://credx-network.vercel.app"

  const hostTokenMeta = document.querySelector(
    'meta[name="site-verification"]'
  );
  const hostToken = hostTokenMeta ? hostTokenMeta.content : null;
  console.log("CredX: Found host token:", hostToken);

  if (!hostToken) {
    console.error(
      "CredX Error: Missing meta tag <meta name='site-verification'>"
    );
    return;
  }

  // Create hidden iframe to talk to CredX
  const iframe = document.createElement("iframe");
  iframe.src = `${CREDX_ORIGIN}/iframe.html`;
  iframe.style.display = "none";
  document.body.appendChild(iframe);

  // Get userId from iframe handshake
  const userId = await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.error("CredX: Timed out waiting for userId from iframe");
      resolve("ROBINHOOD");
    }, 3000);

    function sendRequest() {
      try {
        iframe.contentWindow.postMessage(
          { type: "REQUEST_USER_ID" },
          CREDX_ORIGIN
        );
        console.log("CredX: Sent REQUEST_USER_ID to iframe");
      } catch (err) {
        console.error("CredX: Error sending message to iframe", err);
      }
    }

    // Wait for iframe to load before sending message
    if (iframe.complete || iframe.readyState === "complete") {
      sendRequest();
    } else {
      iframe.onload = sendRequest;
    }

    window.addEventListener("message", function handler(e) {
      console.log("CredX: Full data from iframe:", e.data, "origin:", e.origin);
      if (e.origin === CREDX_ORIGIN && e.data.type === "RESPONSE_USER_ID") {
        clearTimeout(timeout);
        window.removeEventListener("message", handler);
        console.log("CredX: Received userId from iframe:", e.data.userId);
        resolve(e.data.userId);
      }
    });
  });

  // Call your Next.js API
  try {
    console.log("CredX: Fetching widget for user:", userId);
    
    const res = await fetch(`${CREDX_ORIGIN}/api/widget`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, hostToken }),
    });

    if (!res.ok) throw new Error("API returned error");
    const data = await res.json();

    // Display ad using RecommendedArticle format
    const slot = document.getElementById("credx-ad-slot");
    if (slot && data) {
      slot.innerHTML = `
        <div class="credx-ad-card" style="border:1px solid #ddd; border-radius:8px; padding:16px; max-width:350px; background:#fff; box-shadow:0 2px 8px rgba(0,0,0,0.08);">
          <a href="${data.url}" target="_blank" rel="noopener" class="credx-ad-link" style="text-decoration:none; color:inherit;">
        ${data.image ? `<img src="${data.image}" alt="${data.title}" style="width:100%; border-radius:6px; margin-bottom:12px;">` : ""}
        <h3 style="font-size:1.1rem; margin:0 0 8px 0; color:#333;">${data.title}</h3>
        <p style="font-size:0.95rem; color:#666; margin:0;">${data.description}</p>
          </a>
          <a href="${CREDX_ORIGIN}">Sponsored by CredX</a>
        </div>
      `;

      // report clicks to credx.com/api/widget/click
      const adLink = slot.querySelector('.credx-ad-link');
      if (adLink) {
        adLink.addEventListener('click', function () {
          try {
        fetch(`${CREDX_ORIGIN}/api/widget/click`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userId,
            hostToken: hostToken,
            promotion_id: data.id,
          }),
          keepalive: true,
        }).catch((err) =>
          console.error('CredX click fetch error:', err)
        );
          } catch (err) {
        console.error('CredX click handler error:', err);
          }
        });
      }
    } else if (slot) {
      slot.innerHTML = "<p>No ads available</p>";
    }
  } catch (err) {
    console.error("CredX Widget Error:", err);
  }
})();
