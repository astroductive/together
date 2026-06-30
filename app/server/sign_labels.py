# -*- coding: utf-8 -*-
"""English→Arabic display labels for dictionary / practice sign names.

The ASL (250-class) and ArSL (20-class) models are keyed by *English* glosses
(``baby``, ``eat``, ``zipper`` …). On the Arabic dashboard those names must be
shown in Arabic, so this module maps every recognized sign key to a natural
Modern Standard Arabic label.

Used by ``main.py:_load_vocabulary`` to attach ``word_ar`` to each vocabulary
entry. Lookups are exact, case-insensitive; an unknown key falls back to the
English word (so a new model class never renders blank).
"""
from __future__ import annotations

# English sign key -> Arabic label. Covers all 250 ASL + 20 ArSL classes.
EN_TO_AR: dict[str, str] = {
    "TV": "تلفاز", "after": "بعد", "airplane": "طائرة", "all": "الكل",
    "alligator": "تمساح", "animal": "حيوان", "another": "آخر", "any": "أي",
    "apple": "تفاحة", "arm": "ذراع", "aunt": "خالة", "awake": "مستيقظ",
    "backyard": "الفناء الخلفي", "bad": "سيئ", "balloon": "بالون", "bath": "حمّام",
    "because": "لأن", "bed": "سرير", "bedroom": "غرفة النوم", "bee": "نحلة",
    "before": "قبل", "beside": "بجانب", "better": "أفضل", "bird": "طائر",
    "black": "أسود", "blow": "ينفخ", "blue": "أزرق", "boat": "قارب",
    "book": "كتاب", "boy": "ولد", "brother": "أخ", "brown": "بني",
    "bug": "حشرة", "bye": "وداعاً", "callonphone": "يتصل هاتفياً", "can": "يستطيع",
    "car": "سيارة", "carrot": "جزرة", "cat": "قطة", "cereal": "حبوب",
    "chair": "كرسي", "cheek": "خد", "child": "طفل", "chin": "ذقن",
    "chocolate": "شوكولاتة", "clean": "نظيف", "close": "يغلق", "closet": "خزانة",
    "cloud": "غيمة", "clown": "مهرج", "cow": "بقرة", "cowboy": "راعي بقر",
    "cry": "يبكي", "cut": "يقطع", "cute": "لطيف", "dad": "أبي",
    "dance": "يرقص", "dirty": "متسخ", "dog": "كلب", "doll": "دمية",
    "donkey": "حمار", "down": "تحت", "drawer": "درج", "drink": "يشرب",
    "drop": "يسقط", "dry": "جاف", "dryer": "مجفف", "duck": "بطة",
    "ear": "أذن", "elephant": "فيل", "empty": "فارغ", "every": "كل",
    "eye": "عين", "face": "وجه", "fall": "يسقط", "farm": "مزرعة",
    "fast": "سريع", "feet": "قدمان", "find": "يجد", "fine": "بخير",
    "finger": "إصبع", "finish": "ينتهي", "fireman": "رجل إطفاء", "first": "أول",
    "fish": "سمكة", "flag": "علم", "flower": "زهرة", "food": "طعام",
    "for": "لـ", "frenchfries": "بطاطس مقلية", "frog": "ضفدع", "garbage": "قمامة",
    "gift": "هدية", "giraffe": "زرافة", "girl": "بنت", "give": "يعطي",
    "glasswindow": "نافذة", "go": "يذهب", "goose": "إوزة", "grandma": "جدة",
    "grandpa": "جد", "grass": "عشب", "green": "أخضر", "gum": "علكة",
    "hair": "شعر", "happy": "سعيد", "hat": "قبعة", "hate": "يكره",
    "have": "يملك", "haveto": "يجب", "head": "رأس", "hear": "يسمع",
    "helicopter": "مروحية", "hello": "مرحباً", "hen": "دجاجة", "hesheit": "هو/هي",
    "hide": "يختبئ", "high": "عالٍ", "home": "بيت", "horse": "حصان",
    "hot": "حار", "hungry": "جائع", "icecream": "آيس كريم", "if": "إذا",
    "into": "داخل", "jacket": "سترة", "jeans": "جينز", "jump": "يقفز",
    "kiss": "قبلة", "kitty": "قطة", "lamp": "مصباح", "later": "لاحقاً",
    "like": "يحب", "lion": "أسد", "lips": "شفاه", "listen": "يستمع",
    "look": "ينظر", "loud": "عالٍ", "mad": "غاضب", "make": "يصنع",
    "man": "رجل", "many": "كثير", "milk": "حليب", "minemy": "ملكي",
    "mitten": "قفاز", "mom": "أمي", "moon": "قمر", "morning": "صباح",
    "mouse": "فأر", "mouth": "فم", "nap": "قيلولة", "napkin": "منديل",
    "night": "ليل", "no": "لا", "noisy": "صاخب", "nose": "أنف",
    "not": "ليس", "now": "الآن", "nuts": "مكسرات", "old": "قديم",
    "on": "على", "open": "يفتح", "orange": "برتقالة", "outside": "خارج",
    "owie": "وجع", "owl": "بومة", "pajamas": "بيجاما", "pen": "قلم حبر",
    "pencil": "قلم رصاص", "penny": "بنس", "person": "شخص", "pig": "خنزير",
    "pizza": "بيتزا", "please": "من فضلك", "police": "شرطة", "pool": "مسبح",
    "potty": "قصرية", "pretend": "يتظاهر", "pretty": "جميل", "puppy": "جرو",
    "puzzle": "أحجية", "quiet": "هادئ", "radio": "راديو", "rain": "مطر",
    "read": "يقرأ", "red": "أحمر", "refrigerator": "ثلاجة", "ride": "يركب",
    "room": "غرفة", "sad": "حزين", "same": "نفس", "say": "يقول",
    "scissors": "مقص", "see": "يرى", "shhh": "اسكت", "shirt": "قميص",
    "shoe": "حذاء", "shower": "دش", "sick": "مريض", "sleep": "ينام",
    "sleepy": "نعسان", "smile": "يبتسم", "snack": "وجبة خفيفة", "snow": "ثلج",
    "stairs": "درج", "stay": "يبقى", "sticky": "لزج", "store": "متجر",
    "story": "قصة", "stuck": "عالق", "sun": "شمس", "table": "طاولة",
    "talk": "يتكلم", "taste": "يتذوق", "thankyou": "شكراً", "that": "ذلك",
    "there": "هناك", "think": "يفكر", "thirsty": "عطشان", "tiger": "نمر",
    "time": "وقت", "tomorrow": "غداً", "tongue": "لسان", "tooth": "سن",
    "toothbrush": "فرشاة أسنان", "touch": "يلمس", "toy": "لعبة", "tree": "شجرة",
    "uncle": "عم", "underwear": "ملابس داخلية", "up": "فوق", "vacuum": "مكنسة كهربائية",
    "wait": "ينتظر", "wake": "يستيقظ", "water": "ماء", "wet": "مبلل",
    "weus": "نحن", "where": "أين", "white": "أبيض", "who": "من",
    "why": "لماذا", "will": "سوف", "wolf": "ذئب", "yellow": "أصفر",
    "yes": "نعم", "yesterday": "أمس", "yourself": "نفسك", "yucky": "مقرف",
    "zebra": "حمار وحشي", "zipper": "سحّاب",
    # ── ArSL-only keys (not in the ASL 250) ──
    "baby": "رضيع", "eat": "يأكل", "father": "أب", "good": "جيد",
    "house": "منزل", "important": "مهم", "love": "حب", "mall": "مركز تجاري",
    "me": "أنا", "mosque": "مسجد", "mother": "أم", "normal": "طبيعي",
    "stop": "يتوقف", "thanks": "شكراً", "thinking": "يفكر", "worry": "قلق",
}

# Arabic labels for the dictionary's category buckets (see main.py _VOCAB_CATEGORIES).
CATEGORY_AR: dict[str, str] = {
    "family": "العائلة",
    "animals": "الحيوانات",
    "colors": "الألوان",
    "food": "الطعام",
    "actions": "الأفعال",
    "feelings": "المشاعر",
    "places": "الأماكن",
    "general": "عام",
}


def ar_label(word: str) -> str:
    """Arabic display label for a sign key; falls back to the English word."""
    if not word:
        return ""
    return EN_TO_AR.get(word) or EN_TO_AR.get(word.lower()) or word
