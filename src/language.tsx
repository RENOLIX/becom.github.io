import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";

type Language = "fr" | "ar";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  isArabic: boolean;
};

const STORAGE_KEY = "becom-language";
const LanguageContext = createContext<LanguageContextValue | null>(null);
const originalText = new WeakMap<Text, string>();
const originalAttributes = new WeakMap<Element, Map<string, string>>();
const translatedAttributes = ["placeholder", "aria-label", "title", "alt"];

function readStoredLanguage(): Language {
  if (typeof window === "undefined") return "fr";
  return localStorage.getItem(STORAGE_KEY) === "ar" ? "ar" : "fr";
}

const arTranslations: Record<string, string> = {
  "Accueil": "الرئيسية",
  "Boutique": "المتجر",
  "Notre histoire": "قصتنا",
  "Contact": "اتصل بنا",
  "Rechercher": "بحث",
  "Menu": "القائمة",
  "Langue": "اللغة",
  "Votre sélection": "اختياراتك",
  "Mon panier": "سلتي",
  "Votre panier attend son premier jouet": "سلتك تنتظر أول لعبة",
  "Découvrez nos favoris classés par âge.": "اكتشف ألعابنا المفضلة المناسبة لكل مرحلة.",
  "Explorer la boutique": "تصفح المتجر",
  "Supprimer": "حذف",
  "Sous-total": "المجموع الفرعي",
  "Livraison calculée à l'étape suivante.": "يتم حساب التوصيل في الخطوة التالية.",
  "Passer la commande": "إتمام الطلب",
  "Continuer mes achats": "متابعة التسوق",
  "De petits jeux.": "ألعاب صغيرة.",
  "De grandes histoires.": "قصص كبيرة.",
  "Des jouets beaux, durables et malins pour éveiller la curiosité des enfants à chaque âge.": "ألعاب جميلة ومتينة وذكية توقظ فضول الأطفال في كل عمر.",
  "Découvrir la boutique": "اكتشف المتجر",
  "Livraison rapide": "توصيل سريع",
  "Partout en Algérie": "في كل الجزائر",
  "Jouets contrôlés": "ألعاب مختبرة",
  "Sûrs et adaptés": "آمنة ومناسبة",
  "Emballage cadeau": "تغليف هدية",
  "Préparé avec amour": "محضر بعناية",
  "Conseils personnalisés": "نصائح مخصصة",
  "On vous guide": "نرشدك للاختيار",
  "Stick-O": "ستيك-أو",
  "La magie des aimants": "سحر المغناطيس",
  "Ce jouet fascinant attire les enfants vers la construction, l'imagination et le jeu libre. Avec 33 elements Stick-O differents, ils creent des formes, inventent des roles et developpent leur coordination oeil-main, leur pensee spatiale et leurs competences sociales.": "هذه اللعبة الساحرة تجذب الأطفال نحو البناء والخيال واللعب الحر. مع 33 قطعة Stick-O مختلفة، يصنعون أشكالا جديدة ويبتكرون أدوارا وينمون التنسيق بين العين واليد والتفكير المكاني والمهارات الاجتماعية.",
  "Ce jouet fascinant attire les enfants vers la construction, l’imagination et le jeu libre. Avec 33 éléments Stick-O différents, ils créent des formes, inventent des rôles et développent leur coordination œil-main, leur pensée spatiale et leurs compétences sociales.": "هذه اللعبة الساحرة تجذب الأطفال نحو البناء والخيال واللعب الحر. مع 33 قطعة Stick-O مختلفة، يصنعون أشكالا جديدة ويبتكرون أدوارا وينمون التنسيق بين العين واليد والتفكير المكاني والمهارات الاجتماعية.",
  "Les chouchous du moment": "الأكثر حبا الآن",
  "Jouets qui font waouh": "ألعاب تدهش الأطفال",
  "Voir toute la boutique": "عرض كل المتجر",
  "Pourquoi BECOM ?": "لماذا BECOM؟",
  "Les enfants ne font pas que jouer.": "الأطفال لا يلعبون فقط.",
  "Ils deviennent.": "إنهم يكبرون ويكتشفون أنفسهم.",
  "Chaque jeu peut ouvrir une porte : vers l'autonomie, l'imagination, la confiance ou le plaisir d'apprendre. Nous sélectionnons moins, mais mieux.": "كل لعبة يمكن أن تفتح بابا: نحو الاستقلالية، الخيال، الثقة أو متعة التعلم. نحن نختار أقل، لكن بجودة أفضل.",
  "Chaque jeu peut devenir une petite victoire : apprendre à patienter, raconter, construire, essayer encore. BECOM choisit des jouets qui laissent de la place à l'imagination et donnent envie de recommencer.": "كل لعبة يمكن أن تصبح انتصارا صغيرا: تعلم الصبر، الحكي، البناء، والمحاولة من جديد. تختار BECOM ألعابا تفتح المجال للخيال وتشجع الطفل على العودة للعب.",
  "Des matières agréables et durables": "مواد لطيفة ومتينة",
  "Des jeux choisis pour leur vraie valeur": "ألعاب مختارة لقيمتها الحقيقية",
  "Une sélection joyeuse, jamais bruyante": "اختيار مبهج، بدون ضجيج",
  "Sélection durable et responsable": "اختيار متين ومسؤول",
  "Conseil selon l'âge, pas selon la mode": "نصيحة حسب العمر وليس حسب الموضة",
  "Expérience douce du clic à la livraison": "تجربة سلسة من الطلب إلى التوصيل",
  "Découvrir notre histoire": "اكتشف قصتنا",
  "Testé par les enfants, validé par les parents": "اختبرها الأطفال ووافق عليها الآباء",
  "Des familles heureuses": "عائلات سعيدة",
  "Parent vérifié": "ولي أمر موثق",
  "Le petit courrier BECOM": "رسائل BECOM الصغيرة",
  "Des idées de jeux,": "أفكار ألعاب،",
  "pas des emails ennuyeux.": "وليست رسائل مملة.",
  "Votre adresse email": "بريدك الإلكتروني",
  "Je m'inscris": "أشترك",
  "Promis, seulement les belles nouvelles.": "نعدك، أخبار جميلة فقط.",
  "Bienvenue dans la famille BECOM !": "مرحبا بك في عائلة BECOM!",
  "La boutique BECOM": "متجر BECOM",
  "Trouver leur prochain": "ابحث عن لعبتهم",
  "coup de cœur.": "المفضلة القادمة.",
  "Rechercher un jouet...": "ابحث عن لعبة...",
  "Filtrer": "تصفية",
  "Univers": "العالم",
  "Toutes": "الكل",
  "Aucun jouet ne correspond": "لا توجد لعبة مطابقة",
  "Essayez un autre âge ou un autre univers.": "جرّب عمرا أو عالما آخر.",
  "Retour à la boutique": "العودة إلى المتجر",
  "Sélection BECOM": "اختيار BECOM",
  "En stock · expédition sous 24/48h": "متوفر · شحن خلال 24/48 ساعة",
  "Ajouter au panier": "أضف إلى السلة",
  "À partir de 500 DA": "ابتداء من 500 DA",
  "Paiement sécurisé": "دفع آمن",
  "Ou à la livraison": "أو عند التوصيل",
  "Option cadeau": "خيار الهدية",
  "Message personnalisé": "رسالة شخصية",
  "Dans la boîte": "داخل العلبة",
  "Un jeu qui grandit avec eux": "لعبة تكبر معهم",
  "compétences stimulées": "مهارات محفزة",
  "jeu libre": "لعب حر",
  "note familles": "تقييم العائلات",
  "Dans le même univers": "من نفس العالم",
  "Ils pourraient aussi aimer": "قد يعجبهم أيضا",
  "BECOM Store": "BECOM Store",
  "Jouets originaux": "ألعاب أصلية",
  "et innovants": "ومبتكرة",
  "Chez BECOM, nous aimons les jouets et les enfants. Alors nous choisissons des pieces belles, solides et utiles, capables de nourrir l'imagination sans remplir la maison de bruit.": "في BECOM نحب الألعاب والأطفال. لذلك نختار قطعا جميلة ومتينة ومفيدة، قادرة على تغذية الخيال دون ملء البيت بالضجيج.",
  "Notre mission est simple : aider les parents a trouver le bon jouet, au bon moment, avec une selection claire, joyeuse et vraiment adaptee aux familles.": "مهمتنا بسيطة: مساعدة الآباء على إيجاد اللعبة المناسبة، في الوقت المناسب، مع اختيار واضح ومبهج ومناسب فعلا للعائلات.",
  "Grandir, c'est devenir": "أن تكبر يعني أن تصبح",
  "un peu plus soi.": "أقرب إلى نفسك.",
  "BECOM est née d'une idée simple : proposer aux familles des jouets que l'on aime regarder, offrir et transmettre.": "وُلدت BECOM من فكرة بسيطة: تقديم ألعاب للعائلات نحب رؤيتها وإهداءها وتمريرها من طفل لآخر.",
  "Notre manifeste": "مبادئنا",
  "Moins de bruit.": "ضجيج أقل.",
  "Plus d'imagination.": "خيال أكثر.",
  "Nous croyons aux jeux ouverts, aux objets qui durent et aux moments où l'enfant oublie le temps. Notre sélection privilégie la qualité d'usage, la sécurité et une esthétique joyeuse qui trouve sa place dans la maison.": "نؤمن بالألعاب المفتوحة، بالأشياء التي تدوم، وباللحظات التي ينسى فيها الطفل الوقت. اختيارنا يفضل جودة الاستخدام، الأمان، وجمالا مرحا يجد مكانه داخل البيت.",
  "Depuis": "منذ",
  "Bien choisir": "اختيار جيد",
  "Chaque produit est évalué pour son intérêt, sa finition et son âge réel d'utilisation.": "كل منتج يتم تقييمه حسب فائدته، جودة تشطيبه، والعمر الحقيقي المناسب لاستخدامه.",
  "Faire durer": "ليدوم أكثر",
  "Nous préférons les matières solides et les designs qui traversent les années.": "نفضل المواد المتينة والتصاميم التي تبقى جميلة عبر السنوات.",
  "Rester proches": "نبقى قريبين",
  "Une équipe disponible pour conseiller, rassurer et trouver le cadeau juste.": "فريق متاح للنصيحة، الطمأنة، وإيجاد الهدية المناسبة.",
  "On est là pour vous": "نحن هنا لمساعدتكم",
  "Une question ?": "لديك سؤال؟",
  "Parlons jouets.": "لنتحدث عن الألعاب.",
  "Besoin d'un conseil, d'un suivi de commande ou d'une idée cadeau ? L'équipe BECOM vous répond avec plaisir.": "تحتاج نصيحة، متابعة طلب أو فكرة هدية؟ فريق BECOM يرد عليك بكل سرور.",
  "Appelez-nous": "اتصل بنا",
  "Écrivez-nous": "راسلنا",
  "Horaires": "الأوقات",
  "Sam - Jeu, 9h à 18h": "السبت - الخميس، 9h إلى 18h",
  "Nous trouver": "موقعنا",
  "Alger, Algérie": "الجزائر العاصمة، الجزائر",
  "Bonjour !": "مرحبا!",
  "Comment pouvons-nous aider ?": "كيف يمكننا مساعدتك؟",
  "Votre nom": "اسمك",
  "Nom et prénom": "الاسم واللقب",
  "Votre email": "بريدك الإلكتروني",
  "Sujet": "الموضوع",
  "Conseil produit": "نصيحة منتج",
  "Suivi de commande": "متابعة طلب",
  "Retour ou échange": "إرجاع أو استبدال",
  "Autre demande": "طلب آخر",
  "Votre message": "رسالتك",
  "Dites-nous tout...": "اكتب لنا التفاصيل...",
  "Envoyer": "إرسال",
  "Message bien reçu": "تم استلام الرسالة",
  "Notre équipe vous répondra très vite.": "سيرد عليك فريقنا بسرعة.",
  "Envoyer un autre message": "إرسال رسالة أخرى",
  "Finaliser la commande": "إتمام الطلب",
  "Confirmation de commande": "تأكيد الطلب",
  "Numéro de téléphone": "رقم الهاتف",
  "Wilaya": "الولاية",
  "Choisir la wilaya": "اختر الولاية",
  "Adresse précise": "العنوان الكامل",
  "Rue, résidence, numéro de maison...": "الشارع، الحي، رقم المنزل...",
  "Commune": "البلدية",
  "Commune ou point de repère": "البلدية أو نقطة قريبة",
  "Méthode de livraison": "طريقة التوصيل",
  "Livraison à domicile": "توصيل إلى المنزل",
  "Livraison au bureau": "توصيل إلى المكتب",
  "Paiement à la livraison": "الدفع عند الاستلام",
  "Total à payer": "المبلغ الإجمالي",
  "Envoi de la commande...": "جاري إرسال الطلب...",
  "Confirmer la commande": "تأكيد الطلب",
  "Votre commande": "طلبك",
  "Quantité :": "الكمية:",
  "Livraison": "التوصيل",
  "Méthode": "الطريقة",
  "Total": "المجموع",
  "Commande confirmée": "تم تأكيد الطلب",
  "Merci pour votre confiance.": "شكرا لثقتكم.",
  "Votre commande BECOM est en préparation. Nous vous contacterons rapidement pour confirmer la livraison.": "طلبك من BECOM قيد التحضير. سنتواصل معك قريبا لتأكيد التوصيل.",
  "Retour à l'accueil": "العودة إلى الرئيسية",
  "Des jouets qui font grandir l'imagination, la confiance et les beaux souvenirs.": "ألعاب تنمي الخيال والثقة والذكريات الجميلة.",
  "Tous les jouets": "كل الألعاب",
  "Espace admin": "مساحة الإدارة",
  "Questions fréquentes": "أسئلة شائعة",
  "Besoin d'aide ?": "تحتاج مساعدة؟",
  "© 2026 BECOM Store. Tous droits réservés.": "© 2026 BECOM Store. كل الحقوق محفوظة.",
  "Administration BECOM": "إدارة BECOM",
  "Vue d'ensemble": "نظرة عامة",
  "Produits": "المنتجات",
  "Commandes": "الطلبات",
  "Équipe": "الفريق",
  "Déconnexion": "تسجيل الخروج",
  "Voir la boutique": "عرض المتجر",
  "Créer un utilisateur": "إنشاء مستخدم",
  "Actif": "نشط",
  "Fusée explorateur": "صاروخ المستكشف",
  "Anneaux arc-en-ciel": "حلقات قوس قزح",
  "Puzzle Safari": "بازل سفاري",
  "Caméra petit reporter": "كاميرا المراسل الصغير",
  "Blocs petit architecte": "مكعبات المهندس الصغير",
  "Ours Nino": "الدب نينو",
  "Cube des découvertes": "مكعب الاكتشافات",
  "Draisienne Comète": "دراجة التوازن كوميت",
  "Imagination": "خيال",
  "Éveil": "تنمية مبكرة",
  "Puzzles": "ألغاز",
  "Construction": "بناء",
  "Peluches": "دمى قطنية",
  "Plein air": "ألعاب خارجية",
  "Best-seller": "الأكثر مبيعا",
  "Dès 12 mois": "من 12 شهرا",
  "Nouveau": "جديد",
  "Coup de cœur": "مفضل",
  "Montessori": "مونتيسوري",
  "Tous les âges": "كل الأعمار",
  "0-2 ans": "0-2 سنوات",
  "3-5 ans": "3-5 سنوات",
  "6-8 ans": "6-8 سنوات",
  "9 ans +": "9 سنوات +",
};

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function dynamicTranslation(value: string) {
  const selectedMatch = value.match(/^(\d+)\s+jouets sélectionnés$/);
  if (selectedMatch) return `${selectedMatch[1]} ألعاب مختارة`;

  const cartLabelMatch = value.match(/^Panier,\s*(\d+)\s+produits$/);
  if (cartLabelMatch) return `السلة، ${cartLabelMatch[1]} منتجات`;

  const quantityMatch = value.match(/^Quantité\s*:\s*(\d+)$/);
  if (quantityMatch) return `الكمية: ${quantityMatch[1]}`;

  return null;
}

function translate(original: string, language: Language) {
  if (language === "fr") return original;

  const leading = original.match(/^\s*/)?.[0] ?? "";
  const trailing = original.match(/\s*$/)?.[0] ?? "";
  const key = normalize(original);
  const translated = arTranslations[key] ?? dynamicTranslation(key);

  return translated ? `${leading}${translated}${trailing}` : original;
}

function storeOriginalAttribute(element: Element, attribute: string) {
  const value = element.getAttribute(attribute);
  if (value === null) return null;

  let elementAttributes = originalAttributes.get(element);
  if (!elementAttributes) {
    elementAttributes = new Map();
    originalAttributes.set(element, elementAttributes);
  }

  if (!elementAttributes.has(attribute)) elementAttributes.set(attribute, value);
  return elementAttributes.get(attribute) ?? value;
}

function applyLanguage(root: ParentNode, language: Language) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || parent.closest("script, style, noscript, textarea, [data-no-translate]")) return NodeFilter.FILTER_REJECT;
      if (!normalize(node.nodeValue ?? "")) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const nodes: Text[] = [];
  while (walker.nextNode()) nodes.push(walker.currentNode as Text);

  nodes.forEach((node) => {
    if (!originalText.has(node)) originalText.set(node, node.nodeValue ?? "");
    const nextValue = translate(originalText.get(node) ?? "", language);
    if (node.nodeValue !== nextValue) node.nodeValue = nextValue;
  });

  translatedAttributes.forEach((attribute) => {
    root.querySelectorAll?.(`[${attribute}]`).forEach((element) => {
      if (element.closest("[data-no-translate]")) return;
      const original = storeOriginalAttribute(element, attribute);
      if (original !== null) {
        const nextValue = translate(original, language);
        if (element.getAttribute(attribute) !== nextValue) element.setAttribute(attribute, nextValue);
      }
    });
  });
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [language, setLanguage] = useState<Language>(() => readStoredLanguage());
  const isAdminRoute = location.pathname.startsWith("/admin");
  const effectiveLanguage: Language = isAdminRoute ? "fr" : language;

  const value = useMemo(
    () => ({ language, setLanguage, isArabic: !isAdminRoute && language === "ar" }),
    [isAdminRoute, language],
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
    document.documentElement.lang = effectiveLanguage === "ar" ? "ar" : "fr";
    document.documentElement.dir = effectiveLanguage === "ar" ? "rtl" : "ltr";
    document.body.dataset.language = effectiveLanguage;

    const root = document.getElementById("root");
    if (!root) return;

    applyLanguage(root, effectiveLanguage);
    document.documentElement.classList.remove("language-preload");
    const observer = new MutationObserver(() => applyLanguage(root, effectiveLanguage));
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [effectiveLanguage, language]);

  useEffect(() => {
    const syncStoredLanguage = () => {
      const storedLanguage = readStoredLanguage();
      setLanguage((current) => current === storedLanguage ? current : storedLanguage);
    };

    syncStoredLanguage();
    window.addEventListener("storage", syncStoredLanguage);
    window.addEventListener("focus", syncStoredLanguage);
    return () => {
      window.removeEventListener("storage", syncStoredLanguage);
      window.removeEventListener("focus", syncStoredLanguage);
    };
  }, []);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageContext absent");
  return context;
}

export function LanguageSelect() {
  const { language, setLanguage } = useLanguage();

  return (
    <label className="language-select" aria-label={language === "ar" ? "اختيار اللغة" : "Choisir la langue"}>
      <span>{language === "ar" ? "اللغة" : "Langue"}</span>
      <select value={language} onChange={(event) => setLanguage(event.target.value as Language)}>
        <option value="fr">FR</option>
        <option value="ar">AR</option>
      </select>
    </label>
  );
}

export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (!pickerRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const options: Array<{ value: Language; label: string; name: string }> = [
    { value: "fr", label: "FR", name: "Français" },
    { value: "ar", label: "AR", name: "العربية" },
  ];
  const current = options.find((option) => option.value === language) || options[0];

  return (
    <div className="language-picker" ref={pickerRef}>
      <button
        type="button"
        className={open ? "language-picker-button open" : "language-picker-button"}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={language === "ar" ? "اختيار اللغة" : "Choisir la langue"}
      >
        <span className="language-dot" />
        <span className="language-code">{current.label}</span>
        <span className="language-caret" />
      </button>
      {open && (
        <div className="language-menu" role="listbox">
          {options.map((option) => (
            <button
              type="button"
              className={option.value === language ? "active" : ""}
              key={option.value}
              onClick={() => {
                setLanguage(option.value);
                setOpen(false);
              }}
              role="option"
              aria-selected={option.value === language}
            >
              <span>{option.label}</span>
              <strong>{option.name}</strong>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
