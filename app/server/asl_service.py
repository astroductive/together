import os
import sqlite3
import pickle
import numpy as np
import warnings
import io
import contextlib
import logging

# Heavy imports moved inside class to prevent module-level blocking

# Resolve paths dynamically relative to the root project directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "data", "signs.db")
MODEL_PATH = os.path.join(BASE_DIR, "models", "model.tflite")
LABELS_PATH = os.path.join(BASE_DIR, "models", "sign_to_prediction_index_map.json")

# Reconstruct database from split parts if missing (for GitHub/Vercel/Railway size limits)
if not os.path.exists(DB_PATH):
    part_a = DB_PATH + ".parta"
    part_b = DB_PATH + ".partb"
    if os.path.exists(part_a) and os.path.exists(part_b):
        print(f"[ASL Service] DB missing at {DB_PATH}. Reassembling from parts...")
        try:
            import shutil
            with open(DB_PATH, "wb") as f_out:
                for p in [part_a, part_b]:
                    with open(p, "rb") as f_in:
                        shutil.copyfileobj(f_in, f_out)
            print(f"[ASL Service] DB successfully reassembled.")
        except Exception as e:
            print(f"[ASL Service] ERROR reassembling database: {e}")



class SignDB:
    """
    Lightweight sign-database reader — no TensorFlow dependency.
    Handles Text-to-Sign and Speech-to-Sign landmark lookups.
    """
    def __init__(self):
        print("\n[SignDB] Loading sign landmark database...")
        logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
        logging.getLogger("transformers").setLevel(logging.ERROR)
        logging.getLogger("huggingface_hub").setLevel(logging.ERROR)

        import torch
        torch.set_num_threads(1)

        from sentence_transformers import SentenceTransformer, util
        self.util = util

        print("  - Loading semantic model (SBERT)...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')

        self.words = []
        self.embeddings = []
        self.landmarks_dict = {}
        
        # Words that should skip semantic matching because they cause wrong matches
        # These words typically only make sense as part of larger phrases
        self.skip_semantic_match = {
            'i',      # pronoun - matches to "you" incorrectly
            'am',     # helper verb - matches below threshold
            'is',     # helper verb 
            'be',     # helper verb
        }
        
        # Fallback mappings for common words that don't have good semantic matches
        self.exact_match_map = {
            'im': 'i am',             # contraction
            "i'm": 'i am',           # contraction
            'is': 'are',              # helper verb: close match
            'be': 'are',              # helper verb
            'youre': 'you are welcome', # contraction
        }

        if os.path.exists(DB_PATH):
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT word, embedding, landmarks FROM signs WHERE landmarks IS NOT NULL AND embedding IS NOT NULL")
            for word, emb, lms in cur.fetchall():
                self.words.append(word)
                self.embeddings.append(pickle.loads(emb))
                self.landmarks_dict[word] = pickle.loads(lms)
            conn.close()
            self.embeddings = np.array(self.embeddings) if self.words else np.array([])
            print(f"[SignDB] Loaded {len(self.words)} signs into cache.")
        else:
            print(f"[SignDB] WARNING: Database not found at {DB_PATH}")

    def match_word(self, query):
        if not self.words or len(self.embeddings) == 0:
            return None
        
        query_lower = query.lower().strip()
        query_key = query_lower.replace("'", "")
        
        # Step 1: Check exact match (case-insensitive)
        if query_lower in self.words:
            return query_lower
        if query_key in self.words:
            return query_key
        
        # Step 2: Check if this word should skip semantic matching
        if query_key in self.skip_semantic_match:
            return None
        
        # Step 3: Check exact-match fallback dictionary
        if query_key in self.exact_match_map:
            fallback = self.exact_match_map[query_key]
            if fallback in self.landmarks_dict:
                return fallback
        
        # Step 4: Semantic matching with threshold
        q_emb = self.model.encode(query)
        sims = self.util.cos_sim(q_emb, self.embeddings)[0]
        idx = int(np.argmax(sims))
        if sims[idx] > 0.65:
            return self.words[idx]
        return None

    def get_landmarks(self, word):
        match = self.match_word(word)
        if match:
            lm = self.landmarks_dict.get(match)
            if lm is not None:
                return lm.tolist()  # Convert numpy array to JSON-serializable list
        return None


AR_DB_PATH = os.path.join(BASE_DIR, "data", "signs_ar.db")


class ArabicSignDB:
    """
    Separate sign-database reader for Arabic sign language.
    Reads from data/signs_ar.db — completely isolated from English signs.db.
    """
    # The 20 Arabic vocabulary words
    VOCAB = [
        "baby", "eat", "father", "finish", "good",
        "happy", "hear", "house", "important", "love",
        "mall", "me", "mosque", "mother", "normal",
        "sad", "stop", "thanks", "thinking", "worry"
    ]

    def __init__(self, sbert_model=None, sbert_util=None):
        print("\n[ArabicSignDB] Loading Arabic sign landmark database...")

        if sbert_model is not None and sbert_util is not None:
            self.model = sbert_model
            self.util = sbert_util
            print("  - Reusing shared SBERT model.")
        else:
            logging.getLogger("sentence_transformers").setLevel(logging.ERROR)
            logging.getLogger("transformers").setLevel(logging.ERROR)
            logging.getLogger("huggingface_hub").setLevel(logging.ERROR)
            import torch
            torch.set_num_threads(1)
            from sentence_transformers import SentenceTransformer, util
            self.util = util
            print("  - Loading semantic model (SBERT)...")
            self.model = SentenceTransformer('all-MiniLM-L6-v2')

        self.words = []
        self.embeddings = []
        self.landmarks_dict = {}

        if os.path.exists(AR_DB_PATH):
            conn = sqlite3.connect(AR_DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT word, embedding, landmarks FROM signs WHERE landmarks IS NOT NULL AND embedding IS NOT NULL")
            for word, emb, lms in cur.fetchall():
                self.words.append(word)
                self.embeddings.append(pickle.loads(emb))
                self.landmarks_dict[word] = pickle.loads(lms)
            conn.close()
            self.embeddings = np.array(self.embeddings) if self.words else np.array([])
            print(f"[ArabicSignDB] Loaded {len(self.words)} Arabic signs into cache.")
        else:
            print(f"[ArabicSignDB] WARNING: Arabic database not found at {AR_DB_PATH}")

    def match_word(self, query):
        """Match an English word to the closest of the 20 Arabic vocabulary words using SBERT."""
        if not self.words or len(self.embeddings) == 0:
            return None

        query_lower = query.lower().strip()

        # Step 1: Exact match
        if query_lower in self.words:
            return query_lower

        # Step 2: Semantic matching (match to closest of 20 words)
        q_emb = self.model.encode(query_lower)
        sims = self.util.cos_sim(q_emb, self.embeddings)[0]
        idx = int(np.argmax(sims))
        score = float(sims[idx])
        if score > 0.45:  # Lower threshold since we only have 20 words
            matched = self.words[idx]
            print(f"[ArabicSignDB] Matched '{query_lower}' → '{matched}' (score={score:.3f})")
            return matched
        print(f"[ArabicSignDB] No match for '{query_lower}' (best={self.words[idx]}, score={score:.3f})")
        return None

    def get_landmarks(self, word):
        match = self.match_word(word)
        if match:
            lm = self.landmarks_dict.get(match)
            if lm is not None:
                return lm.tolist()
        return None


class ASLService(SignDB):
    """
    Full ASL service — inherits sign DB lookup from SignDB,
    adds TFLite gesture recognition on top.
    """
    def __init__(self, sign_db: SignDB | None = None):
        # Reuse an already-loaded SignDB when available to avoid duplicate heavy loads.
        if sign_db is not None:
            self.util = sign_db.util
            self.model = sign_db.model
            self.words = sign_db.words
            self.embeddings = sign_db.embeddings
            self.landmarks_dict = sign_db.landmarks_dict
            self.skip_semantic_match = sign_db.skip_semantic_match
            self.exact_match_map = sign_db.exact_match_map
            print("[ASLService] Reusing loaded SignDB cache.")
        else:
            super().__init__()

        print("[ASLService] Loading TFLite Gesture Model...")
        warnings.filterwarnings(
            "ignore",
            message=r"\s*Warning: tf\.lite\.Interpreter is deprecated.*",
            category=UserWarning,
        )
        os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
        os.environ.setdefault("TF_ENABLE_ONEDNN_OPTS", "0")
        try:
            from ai_edge_litert.interpreter import Interpreter
        except ImportError as ie:
            print(f"[ERROR] LiteRT not available: {ie}")
            raise RuntimeError(
                f"LiteRT is not available. Sign-to-Text features will be unavailable. Error: {ie}"
            )
        
        try:
            self.interpreter = Interpreter(model_path=MODEL_PATH)
            self.interpreter.allocate_tensors()
            self.input_details = self.interpreter.get_input_details()
            self.output_details = self.interpreter.get_output_details()
        except Exception as tf_err:
            print(f"[ERROR] TFLite initialization failed: {tf_err}")
            raise RuntimeError(f"TFLite initialization failed: {tf_err}")

        print("  - Loading Sign Map & label index...")
        import json
        with open(LABELS_PATH, 'r') as f:
            raw = json.load(f)
            self.labels = (
                {v: k for k, v in raw.items()}
                if isinstance(list(raw.values())[0], int)
                else {int(k): v for k, v in raw.items()}
            )
        print("[ASLService] Ready.")

    def predict_sign(self, landmarks):
        """
        Sequence inference matching the standalone sign-to-speech.py script.
        Input: (N, 543, 3) — N can be 1..60, padded/trimmed to SEQUENCE_LENGTH=60.
        Landmark order: face(468) + leftHand(21) + pose(33) + rightHand(21)
        Returns (label, confidence) or (None, 0.0).
        """
        SEQUENCE_LENGTH  = 60
        CONFIDENCE_THRESH = 0.80
        try:
            frames = np.array(landmarks, dtype=np.float32)

            # Strip extra batch dim if present
            if frames.ndim == 4 and frames.shape[0] == 1:
                frames = frames[0]

            if frames.ndim != 3 or frames.shape[1:] != (543, 3):
                print(f"[Inference] Bad shape: {frames.shape}")
                return None, 0.0

            if frames.shape[0] < 1:
                return None, 0.0

            # (Removed np.nan_to_num: we MUST pass NaN to the model, not 0.0,
            # otherwise the model thinks the hand is pinned to the top-left corner!)
            
            # Pad or trim to exactly SEQUENCE_LENGTH frames
            n = frames.shape[0]
            if n < SEQUENCE_LENGTH:
                # Repeat the last frame to pad
                pad = np.repeat(frames[-1:], SEQUENCE_LENGTH - n, axis=0)
                frames = np.concatenate([frames, pad], axis=0)
            elif n > SEQUENCE_LENGTH:
                frames = frames[-SEQUENCE_LENGTH:]  # keep most recent

            # Shape: (1, 60, 543, 3)
            batch = frames[np.newaxis, ...]     # (1, 60, 543, 3)
            expected_dtype = self.input_details[0]['dtype']
            batch = batch.astype(expected_dtype)

            # Resize input tensor then run
            self.interpreter.resize_tensor_input(
                self.input_details[0]['index'], batch.shape)
            self.interpreter.allocate_tensors()
            self.interpreter.set_tensor(self.input_details[0]['index'], batch)
            self.interpreter.invoke()

            out_arr = np.squeeze(self.interpreter.get_tensor(self.output_details[0]['index']))

            if out_arr.ndim == 0:
                out_arr = np.array([out_arr])

            idx  = int(np.argmax(out_arr))
            top_prob = float(out_arr[idx])

            # Match the standalone sign-to-text.py acceptance rule:
            # accept a prediction when the model's top score clears the threshold.
            CONFIDENCE_THRESH = 0.80
            if top_prob > CONFIDENCE_THRESH:
                label = self.labels.get(idx, self.labels.get(str(idx), f"class_{idx}"))
                exp_o = np.exp(out_arr - np.max(out_arr))
                softmax_conf = float(exp_o[idx] / exp_o.sum())
                print(f"[Inference] {label} logit={top_prob:.2f} p={softmax_conf:.3f}")
                return label, softmax_conf

            print(f"[Inference] No sign detected (top_logit={top_prob:.2f})")
            return None, 0.0

        except Exception as e:
            print(f"[Inference Error] {e}")
            return None, 0.0

