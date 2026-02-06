# 🤖 Gesture Language Lab

**An interactive AI education platform for students (Grades 8–12)**

Learn how machines understand human hand gestures and convert them into language — no coding required.

---

## 🎯 What Is This?

Gesture Language Lab is a browser-based educational tool that teaches students:

- How AI sees and interprets hand movements
- Why training data matters
- How symbols can become a communication system
- Why AI makes mistakes and how confidence works

Students create their own custom hand gesture languages, collect datasets, train AI models in real-time, and translate gestures into sentences.

---

## 🚀 Quick Start

### Requirements

- **Chrome or Edge browser** (recommended for MediaPipe support)
- **Webcam** (built-in or external)
- **No installation needed** — runs entirely in the browser

### Running Locally

1. **Download this project**
   ```bash
   git clone https://github.com/yourusername/gesture-language-lab.git
   cd gesture-language-lab
   ```

2. **Open with Live Server** (VS Code Extension)
   - Install "Live Server" extension in VS Code
   - Right-click `index.html`
   - Select "Open with Live Server"

3. **Or use Python HTTP Server**
   ```bash
   python -m http.server 8000
   ```
   Then open `http://localhost:8000`

### Deploying to GitHub Pages

1. Push this repository to GitHub
2. Go to Settings → Pages
3. Select "Deploy from a branch"
4. Choose `main` branch, `/root` folder
5. Your site will be live at: `https://yourusername.github.io/gesture-language-lab/`

---

## 📚 Two Learning Modes

### 🟢 Normal Mode (Grades 8–10)

**Focus:** Exploration and creativity

**Features:**
- Simple interface
- One-click training
- Friendly explanations
- Focus on interaction

**Goal:** Make AI feel understandable and fun

---

### 🔵 In-Depth Mode (Grades 11–12)

**Focus:** Analysis and technical understanding

**Features:**
- Dataset visibility
- Sample counts per symbol
- Confidence percentages
- Model retraining
- Data export (JSON)

**Goal:** Prepare students for college-level AI concepts

---

## 🎓 How to Use

### Step 1: Choose Your Mode

On the landing page, select:
- **Normal Mode** for exploratory learning
- **In-Depth Mode** for detailed analysis

### Step 2: Create Your First Symbol

1. Enter a symbol name (e.g., "Hello", "Peace", "A", "B")
2. Show your hand gesture to the camera
3. Click **Record Sample** (collect at least 5 samples per symbol)

### Step 3: Build Your Dataset

- Create at least **2 different symbols**
- Collect **5+ samples** for each symbol
- Vary your hand position slightly for each sample

### Step 4: Train the AI

- Click **Train AI Model**
- Wait for training to complete (~10-30 seconds)
- The model learns in your browser (no data sent to a server)

### Step 5: Test Your Language

- Make gestures in front of the camera
- Hold steady for 2-3 seconds
- Watch as your gesture translates into words
- Build full sentences!

---

## 🔧 Technical Stack

| Technology | Purpose |
|------------|---------|
| **MediaPipe Hands** | Real-time hand landmark detection |
| **TensorFlow.js** | Browser-based neural network training |
| **Vanilla JavaScript** | No frameworks — pure web standards |
| **CSS Grid & Flexbox** | Modern, responsive layout |

---

## 📂 Project Structure

```
gesture-language-lab/
│
├── index.html              # Landing page
├── lab.html                # AI Lab interface
│
├── css/
│   ├── base.css            # Global styles, dark theme
│   ├── landing.css         # Landing page styles
│   └── lab.css             # AI Lab layout
│
├── js/
│   ├── config/
│   │   └── modes.js        # Mode configuration system
│   │
│   ├── core/
│   │   ├── camera.js       # Webcam management
│   │   ├── hands.js        # MediaPipe integration
│   │   ├── dataset.js      # Sample collection
│   │   ├── trainer.js      # TensorFlow model training
│   │   └── predictor.js    # Live gesture prediction
│   │
│   ├── ui/
│   │   ├── controls.js     # Button handlers
│   │   ├── panels.js       # Panel visibility
│   │   └── output.js       # Sentence builder
│   │
│   ├── landing.js          # Landing page interactions
│   └── main.js             # Application entry point
│
└── README.md
```

---

## 🧠 How It Works (Technical)

### 1. Hand Tracking

- **MediaPipe Hands** detects 21 landmarks per hand
- Each landmark has x, y, z coordinates
- Landmarks are drawn on canvas in real-time

### 2. Dataset Collection

- Each sample = flattened array of 63 values (21 landmarks × 3 coordinates)
- Samples are grouped by label (symbol name)
- Stored in browser memory

### 3. Model Training

- **Neural Network Architecture:**
  - Input: 63 features (landmark coordinates)
  - Hidden Layer 1: 64 neurons (ReLU activation)
  - Dropout: 20%
  - Hidden Layer 2: 32 neurons (ReLU activation)
  - Dropout: 20%
  - Output: N classes (softmax)

- **Training:** 50 epochs, 32 batch size, 20% validation split

### 4. Prediction

- Continuous prediction loop (60 FPS)
- Stability checking: gesture must be consistent for 10 frames
- Minimum confidence threshold: 60%
- Stable gestures are appended to sentence

---

## 🎨 Design Philosophy

### Visual Identity

- **Dark modern theme** with neon accents
- Feels like a "real AI tool" (not a school website)
- Startup-style UI to engage students

### User Experience

- **Minimal friction:** No sign-up, no installation
- **Instant feedback:** See hand tracking immediately
- **Clear cause-effect:** Every action has visible results

---

## 🔒 Privacy & Safety

- ✅ **All processing happens in the browser**
- ✅ **No data sent to servers**
- ✅ **No user accounts or tracking**
- ✅ **Camera access required, but video never leaves your device**

---

## 🐛 Troubleshooting

### Camera Not Working

- Grant camera permission when prompted
- Check browser settings (Chrome → Settings → Privacy → Camera)
- Try reloading the page

### Hand Not Detected

- Ensure good lighting
- Keep hand visible and steady
- Try different hand positions

### Training Fails

- Collect at least 5 samples per symbol
- Need at least 2 different symbols
- Check browser console for errors

### Page Loads Slowly

- MediaPipe and TensorFlow.js load from CDN
- First load may take 5-10 seconds
- Subsequent loads are faster (cached)

---

## 📖 Educational Use Cases

### Classroom Activities

1. **Individual Exploration:** Students create personal sign languages
2. **Group Challenge:** Teams create communication systems
3. **Competitive Mode:** Who can build the most accurate model?
4. **Analysis Task:** (In-Depth Mode) Compare confidence across symbols

### Learning Outcomes

**Students will understand:**
- Computer vision basics
- Training data requirements
- Overfitting vs. generalization
- Classification confidence
- Real-world AI limitations

---

## 🛠️ Extending the Platform

Want to add features? Here are some ideas:

- **Multi-hand support:** Detect two hands simultaneously
- **Pose detection:** Expand to full-body gestures
- **Sign language mode:** Pre-trained ASL recognition
- **Model persistence:** Save/load trained models
- **Multiplayer:** Share gesture languages between students

---

## 📄 License

MIT License — Free to use, modify, and distribute.

---

## 🙏 Credits

**Built with:**
- [MediaPipe Hands](https://google.github.io/mediapipe/solutions/hands.html) by Google
- [TensorFlow.js](https://www.tensorflow.org/js) by TensorFlow Team
- [Inter Font](https://rsms.me/inter/) by Rasmus Andersson

**Created for educational purposes** to make AI accessible and engaging for students.

---

## 📬 Support

Questions? Issues? Ideas?

- Open an issue on GitHub
- Contact: [your-email@example.com]

---

**Ready to build your own AI language?** 🚀

Open `index.html` and start exploring!