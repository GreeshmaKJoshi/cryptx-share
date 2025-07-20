// Step 1: Toggle between Text and Image input
function toggleInput() {
    const dataType = document.getElementById("dataType").value;
    const inputSection = document.getElementById("inputSection");

    if (dataType === "text") {
        inputSection.innerHTML = `
            <h3>Enter Text</h3>
            <textarea id="textInput" rows="5" style="width: 100%;"></textarea>
        `;
    } else if (dataType === "image") {
        inputSection.innerHTML = `
            <h3>Upload Image</h3>
            <input type="file" id="imageInput" accept="image/*" onchange="previewImage()">
            <img id="preview">
        `;
    } else {
        inputSection.innerHTML = ""; // Clear if nothing selected
    }
}

// Preview uploaded image
function previewImage() {
    const file = document.getElementById("imageInput").files[0];
    const preview = document.getElementById("preview");
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = "block";
        };
        reader.readAsDataURL(file);
    }
}

// Generate a random key (AES)
function generateKey() {
    const key = CryptoJS.lib.WordArray.random(16).toString();
    document.getElementById("secretKey").value = key;
}

// Encrypt Data (AES)
function encryptData() {
    const dataType = document.getElementById("dataType").value;
    const secretKey = document.getElementById("secretKey").value;

    if (!secretKey) {
        alert("Please generate or enter a key first!");
        return;
    }

    if (dataType === "text") {
        const text = document.getElementById("textInput").value;
        if (!text) {
            alert("Please enter text to encrypt!");
            return;
        }
        // Encrypt text as Base64
        const encrypted = CryptoJS.AES.encrypt(text, secretKey).toString();
        showResults(encrypted, 'text');
        
    } else if (dataType === "image") {
        const file = document.getElementById("imageInput").files[0];
        if (!file) {
            alert("Please upload an image first!");
            return;
        }
        
        const reader = new FileReader();
        reader.onload = function(e) {
            // Get binary data (not Base64)
            const arrayBuffer = e.target.result;
            const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
            // Encrypt binary data
            const encrypted = CryptoJS.AES.encrypt(wordArray, secretKey).toString();
            showResults(encrypted, 'image');
        };
        reader.readAsArrayBuffer(file);
    }
}
// Display encrypted results
function showResults(encrypted, type) {
    document.getElementById("encryptedOutput").textContent = type === 'text' ? encrypted : "[Binary Image Data]";
    document.getElementById("keyOutput").textContent = document.getElementById("secretKey").value;
    document.getElementById("results").style.display = 'block';
    
    // Store encrypted data and type for sharing
    window.lastEncrypted = {
        data: encrypted,
        type: type,
        key: document.getElementById("secretKey").value
    };
}
// Share via WhatsApp
function shareViaWhatsApp() {
    if (!window.lastEncrypted) {
        alert("No data to share! Encrypt something first.");
        return;
    }

    const { data, type, key } = window.lastEncrypted;
    const appLink = "https://greeshmakjoshi.github.io/cryptx-share/share/decrypt.html";
    
    // Create downloadable file
    const blob = new Blob([data], { type: "application/octet-stream" });
    const fileUrl = URL.createObjectURL(blob);
    const fileName = type === 'text' ? 'encrypted_text.enc' : 'encrypted_image.enc';

    // Create message
    const message = `🔐 *Encrypted ${type.toUpperCase()}* 🔐\n\n` +
                   `📁 *Download Encrypted File:* ${fileUrl}\n` +
                   `🔑 *Secret Key:* ${key}\n\n` +
                   `🔓 Decrypt it here: ${appLink}\n\n` +
                   `(Download the file first, then visit the link to decrypt)`;

    // Open WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
}

// Updated decrypt.html should handle both types:
function decryptData() {
    const fileInput = document.getElementById('encryptedFile');
    const secretKey = document.getElementById('secretKey').value;
    
    if (!fileInput.files[0]) {
        alert('Please upload an encrypted file!');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const encryptedData = e.target.result;
            const decrypted = CryptoJS.AES.decrypt(encryptedData, secretKey);
            
            // Handle different data types
            if (window.lastEncryptedType === 'text') {
                document.getElementById('decryptedText').textContent = decrypted.toString(CryptoJS.enc.Utf8);
            } else {
                // For images, convert back to binary
                const imageData = decrypted.toString(CryptoJS.enc.Base64);
                document.getElementById('decryptedImage').src = 'data:image/jpeg;base64,' + imageData;
                document.getElementById('decryptedImage').style.display = 'block';
            }
        } catch (error) {
            alert('Decryption failed: ' + error.message);
        }
    };
    reader.readAsText(fileInput.files[0]);
}


// Share via Gmail
function shareViaGmail() {
    const encrypted = document.getElementById("encryptedOutput").textContent;
    const key = document.getElementById("keyOutput").textContent;
    const subject = "CryptoShare: Encrypted Data";
    const body = `Encrypted: ${encrypted}\nKey: ${key}\n\nDecrypt here: https://GreeshmaKJoshi.github.io/cryptx-share/share/decrypt.html`; // 👈 Update this line
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
}

// Download as .txt file
function downloadFile() {
    const encrypted = document.getElementById("encryptedOutput").textContent;
    const key = document.getElementById("keyOutput").textContent;
    const blob = new Blob([`ENCRYPTED:\n${encrypted}\n\nKEY:\n${key}`], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cryptoshare.txt";
    a.click();
}