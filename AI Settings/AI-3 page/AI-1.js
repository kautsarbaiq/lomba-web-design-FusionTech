$(document).ready(function () {
  const API_KEY = "AIzaSyAzyokpM2muVvB8Vju-uhxRDlgMNHzWcyg"; // Ganti dengan API key Anda
  const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

  // Elemen DOM
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendButton = document.getElementById("send-button");

  // Format waktu
  function getTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Menambahkan pesan ke chat box
  function addMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${sender}-message`;
    const timeClass = sender === "user" ? "message-time-user" : "message-time-AI";
    messageDiv.innerHTML = message + `<div class="${timeClass}">${getTime()}</div>`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Menampilkan indikator mengetik
  function showTypingIndicator() {
    const indicator = document.createElement("div");
    indicator.className = "message typing-indicator";
    indicator.id = "typing-indicator";
    indicator.innerHTML = `
          <span></span>
          <span></span>
          <span></span>
          <div class="message-time-IA">Sedang mengetik</div>
      `;
    chatBox.appendChild(indicator);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Menghilangkan indikator mengetik
  function hideTypingIndicator() {
    const indicator = document.getElementById("typing-indicator");
    if (indicator) {
      indicator.remove();
    }
  }

  // Menambahkan pesan error
  function addErrorMessage(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.textContent = message;
    chatBox.appendChild(errorDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  // Mengirim pesan ke API Gemini
  async function sendToGemini(message) {
    try {
      showTypingIndicator();

      const promptPrefix =
        "Anda adalah asisten AI yang ahli dalam Pendidikan ilmu pengetahuan sosial. anda hanya bisa menjawab soal Pendidikan ilmu pengetahuan sosial saja. Jika pertanyaan tidak berkaitan dengan Pendidikan ilmu pengetahuan sosial, mohon beri tahu pengguna bahwa Anda hanya dapat menjawab pertanyaan seputar Pendidikan ilmu pengetahuan sosial. Jika pengguna menyapa anda, maka anda mengulangi perkataan pengguna lalu menjawab selamat datang di halaman Guru AI , apakah ada yang ingin ditanyakan ?. Anda adalah asisten AI yang tau jenis kalimat yang user beri tanpa membutuhkan simbol-simbol pada kalimat. ";

      const response = await fetch(`${API_URL}?key=${API_KEY}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: message + promptPrefix,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          },
        }),
      });

      const data = await response.json();
      hideTypingIndicator();

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts.length > 0) {
        const aiResponse = data.candidates[0].content.parts[0].text;
        addMessage(aiResponse.replace(/\n/g, "<br>"), "ai");
      } else {
        if (data.error) {
          addErrorMessage(`Error: ${data.error.message || "Tidak ada respons dari AI"}`);
        } else {
          addErrorMessage("Tidak ada respons yang sesuai dari AI");
        }
      }
    } catch (error) {
      hideTypingIndicator();
      console.error("Error:", error);
      addErrorMessage("Terjadi kesalahan saat menghubungi AI. Silakan coba lagi.");
    }
  }

  // Event handler untuk tombol kirim
  sendButton.addEventListener("click", function () {
    sendMessage();
  });

  // Event handler untuk input (enter key)
  userInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  // Fungsi untuk mengirim pesan
  function sendMessage() {
    const message = userInput.value.trim();
    if (message.length === 0) return;

    addMessage(message, "user");
    userInput.value = "";

    sendToGemini(message);
  }
});
