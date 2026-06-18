import {
  motion,
  useScroll,
  useTransform,
} from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Box,
  Check,
  CircleHelp,
  Clock3,
  Filter,
  Gift,
  Heart,
  ImagePlus,
  Instagram,
  LayoutDashboard,
  Mail,
  MapPin,
  Menu,
  Minus,
  PackageCheck,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Trash2,
  Truck,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "./assets/becom-logo.png";
import hero from "./assets/becom-hero.jpg";
import sprite from "./assets/product-sprite.jpg";
import stickCenter from "./assets/stick-o-center.png";
import stickLeft from "./assets/stick-o-left.png";
import stickRight from "./assets/stick-o-right.png";
import whyBecomChild from "./assets/why-becom-child.png";
import { PressButton } from "./components/PressButton";
import { type PieceOption, type Product } from "./data";
import { getAdminSession, signInAdmin, signOutAdmin, uploadProductImage } from "./lib/supabase";
import { algeriaWilayas, type ShippingRate } from "./shipping";
import { LanguagePicker, LanguageProvider, useLanguage } from "./language";
import { useStore, type AdminRole, type AdminUser, type CustomerOrder, type OrderStatus } from "./store";

const money = (value: number) => `${value.toLocaleString("fr-DZ")} DA`;
const sitePhone = "0558413077";
const siteEmail = "becom.storedz@gmail.com";
const facebookUrl = "https://www.facebook.com/share/1ciNkaDzQG/?mibextid=wwXIfr";
const instagramUrl = "https://www.instagram.com/becom.storedz?igsh=Z3pseGEyb2pmeHht";
const productName = (product: Product, isArabic: boolean) => isArabic && product.nameAr ? product.nameAr : product.name;
const productDescription = (product: Product, isArabic: boolean) => isArabic && product.descriptionAr ? product.descriptionAr : product.description;
const productCategory = (category: string, isArabic: boolean) => {
  if (!isArabic) return category;
  const categories: Record<string, string> = {
    jeux: "ألعاب",
    imagination: "خيال",
    éveil: "تنمية مبكرة",
    puzzles: "ألغاز",
    construction: "بناء",
    peluches: "دمى محشوة",
    "plein air": "ألعاب خارجية",
  };
  return categories[category.trim().toLowerCase()] || category;
};
const productColorName = (color: string, isArabic: boolean) => {
  if (!isArabic) return color;
  const colors: Record<string, string> = {
    blanc: "أبيض",
    bleu: "أزرق",
    gris: "رمادي",
    jaune: "أصفر",
    marron: "بني",
    noir: "أسود",
    orange: "برتقالي",
    rose: "وردي",
    rouge: "أحمر",
    vert: "أخضر",
    violet: "بنفسجي",
  };
  return colors[color.trim().toLowerCase()] || color;
};
const namedColors: Record<string, string> = {
  blanc: "#ffffff",
  bleu: "#4c83bd",
  gris: "#9ca3af",
  jaune: "#ffd746",
  marron: "#9a6a38",
  noir: "#111827",
  orange: "#fb923c",
  rose: "#f9a8d4",
  rouge: "#ff3c38",
  vert: "#37d77a",
  violet: "#8b5cf6",
};
const resolveProductColor = (value?: string) => {
  const color = (value || "").trim().toLowerCase();
  return namedColors[color] || value || "#e8f1fb";
};
const productColors = (product: Product) => product.colorLabels?.length ? product.colorLabels : product.colorLabel ? [product.colorLabel] : product.color ? [product.color] : [];
const productPieceOptions = (product: Product) => product.pieceOptions?.filter((option) => option.pieces > 0 && option.name.trim() && option.price > 0) || [];
const pieceKey = (piece?: PieceOption) => piece ? `${piece.pieces}-${piece.name}-${piece.price}` : "default";

type CartLine = { product: Product; quantity: number; selectedColor?: string; selectedPiece?: PieceOption };
type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (product: Product, quantity?: number, selectedColor?: string, selectedPiece?: PieceOption) => void;
  change: (id: string, quantity: number, selectedColor?: string, selectedPiece?: PieceOption) => void;
  remove: (id: string, selectedColor?: string, selectedPiece?: PieceOption) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("CartContext absent");
  return value;
}

function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("becom-cart") || "[]") as CartLine[];
    } catch {
      return [];
    }
  });
  const [open, setOpen] = useState(false);

  useEffect(() => localStorage.setItem("becom-cart", JSON.stringify(lines)), [lines]);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const total = lines.reduce((sum, line) => sum + (line.selectedPiece?.price || line.product.price) * line.quantity, 0);
  const add = (product: Product, quantity = 1, selectedColor?: string, selectedPiece?: PieceOption) => {
    setLines((current) => {
      const found = current.find((line) => line.product.id === product.id && line.selectedColor === selectedColor && pieceKey(line.selectedPiece) === pieceKey(selectedPiece));
      return found
        ? current.map((line) => line.product.id === product.id && line.selectedColor === selectedColor && pieceKey(line.selectedPiece) === pieceKey(selectedPiece) ? { ...line, quantity: line.quantity + quantity } : line)
        : [...current, { product, quantity, selectedColor, selectedPiece }];
    });
    setOpen(true);
  };
  const change = (id: string, quantity: number, selectedColor?: string, selectedPiece?: PieceOption) => setLines((current) => current
    .map((line) => line.product.id === id && line.selectedColor === selectedColor && pieceKey(line.selectedPiece) === pieceKey(selectedPiece) ? { ...line, quantity } : line)
    .filter((line) => line.quantity > 0));
  const remove = (id: string, selectedColor?: string, selectedPiece?: PieceOption) => setLines((current) => current.filter((line) => !(line.product.id === id && line.selectedColor === selectedColor && pieceKey(line.selectedPiece) === pieceKey(selectedPiece))));
  const clear = () => setLines([]);

  return <CartContext.Provider value={{ lines, count, total, open, setOpen, add, change, remove, clear }}>{children}</CartContext.Provider>;
}

function ProductArt({ product, className = "", imageUrl }: { product: Product; className?: string; imageUrl?: string }) {
  const { isArabic } = useLanguage();
  const x = [0, 33.333, 66.667, 100][product.sprite % 4];
  const y = product.sprite < 4 ? 0 : 100;
  const customImage = imageUrl || product.imageUrls?.[0] || product.imageUrl;
  return (
    <div
      className={`product-art ${className}`}
      style={{ backgroundImage: customImage ? `url(${customImage})` : `url(${sprite})`, backgroundPosition: customImage ? "center" : `${x}% ${y}%`, backgroundSize: customImage ? "cover" : undefined, backgroundColor: customImage ? "#f4f8fc" : product.color }}
      role="img"
      aria-label={productName(product, isArabic)}
    />
  );
}

function Logo({ compact = false }: { compact?: boolean }) {
  return <img src={logo} className={compact ? "h-10 w-auto" : "h-12 w-auto"} alt="BECOM Store" />;
}

function Header() {
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="site-header">
      <div className="glass-nav shell">
        <button className="icon-button mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu"><Menu /></button>
        <Link to="/" aria-label="Accueil BECOM"><Logo compact /></Link>
        <nav className={menuOpen ? "main-nav is-open" : "main-nav"}>
          <NavLink to="/">Accueil</NavLink>
          <NavLink to="/boutique">Boutique</NavLink>
          <NavLink to="/a-propos">Notre histoire</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="header-actions">
          <Link to="/boutique" className="icon-button hide-mobile" aria-label="Rechercher"><Search /></Link>
          <LanguagePicker />
          <button className="cart-button" onClick={() => setOpen(true)} aria-label={`Panier, ${count} produits`}>
            <ShoppingCart />
            <span data-no-translate>{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function CartDrawer() {
  const { lines, total, open, setOpen, change, remove } = useCart();
  const { isArabic } = useLanguage();
  return (
    <>
      <button className={`drawer-backdrop ${open ? "visible" : ""}`} onClick={() => setOpen(false)} aria-label="Fermer le panier" />
      <aside className={`cart-drawer ${open ? "visible" : ""}`} aria-hidden={!open}>
        <div className="drawer-head">
          <div><span className="eyebrow">Votre sélection</span><h2>Mon panier</h2></div>
          <button className="icon-button" onClick={() => setOpen(false)}><X /></button>
        </div>
        <div className="cart-lines">
          {lines.length === 0 ? (
            <div className="empty-cart"><ShoppingCart /><h3>Votre panier attend son premier jouet</h3><p>Découvrez nos favoris classés par âge.</p><Link className="button primary" to="/boutique" onClick={() => setOpen(false)}>Explorer la boutique</Link></div>
          ) : lines.map((line) => (
            <article className="cart-line" key={`${line.product.id}-${line.selectedColor || "default"}-${pieceKey(line.selectedPiece)}`}>
              <ProductArt product={line.product} />
              <div><Link to={`/produit/${line.product.id}`} onClick={() => setOpen(false)}>{productName(line.product, isArabic)}</Link><small>{line.product.age}{line.selectedColor ? ` · Couleur ${line.selectedColor}` : ""}{line.selectedPiece ? ` · ${line.selectedPiece.pieces} pièces ${line.selectedPiece.name}` : ""}</small><strong data-no-translate>{money(line.selectedPiece?.price || line.product.price)}</strong>
                <div className="quantity-mini" data-no-translate><button type="button" aria-label="Diminuer la quantité" onClick={() => change(line.product.id, line.quantity - 1, line.selectedColor, line.selectedPiece)}><Minus /></button><span>{line.quantity}</span><button type="button" aria-label="Augmenter la quantité" onClick={() => change(line.product.id, line.quantity + 1, line.selectedColor, line.selectedPiece)}><Plus /></button></div>
              </div>
              <button className="remove-line" onClick={() => remove(line.product.id, line.selectedColor, line.selectedPiece)} aria-label="Supprimer"><Trash2 /></button>
            </article>
          ))}
        </div>
        {lines.length > 0 && <div className="drawer-total"><div><span>Sous-total</span><strong data-no-translate>{money(total)}</strong></div><p>Livraison calculée à l'étape suivante.</p><Link to="/commande" className="button primary full" onClick={() => setOpen(false)}>Passer la commande <ArrowRight /></Link><button type="button" className="text-button" onClick={() => setOpen(false)}>Continuer mes achats</button></div>}
      </aside>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { isArabic } = useLanguage();
  return (
    <article className="product-card">
      <Link to={`/produit/${product.id}`} className="product-visual">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="heart" onClick={(event) => event.preventDefault()} aria-label="Ajouter aux favoris"><Heart /></button>
        <ProductArt product={product} />
      </Link>
      <div className="product-copy">
        <div className="product-meta"><span>{product.category}</span><span><Star fill="currentColor" /> {product.rating}</span></div>
        <Link to={`/produit/${product.id}`}><h3>{productName(product, isArabic)}</h3></Link>
        <p>{product.age}</p>
        <div className="product-bottom"><div><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div><button className="add-button" onClick={() => add(product)} aria-label="Ajouter au panier"><span className="cart-add-icon"><ShoppingCart /><Plus /></span></button></div>
      </div>
    </article>
  );
}

function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return <div className="section-title"><span className="eyebrow">{kicker}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>;
}

function MagnetBlock() {
  const sectionRef = useRef<HTMLElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end center"],
  });

  useEffect(() => {
    const media = window.matchMedia("(max-width: 780px)");
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const leftX = useTransform(scrollYProgress, [0, 1], isMobile ? [-320, -62] : [-320, -96]);
  const rightX = useTransform(scrollYProgress, [0, 1], isMobile ? [320, 62] : [320, 96]);

  return (
    <section ref={sectionRef} className="magnet-block">
      <div className="shell magnet-inner">
        <motion.div
          className="magnet-copy"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="magnet-pill">Stick-O</span>
          <h2>La magie des aimants</h2>
          <p>Ce jouet fascinant attire les enfants vers la construction, l'imagination et le jeu libre. Avec 33 elements Stick-O differents, ils creent des formes, inventent des roles et developpent leur coordination oeil-main, leur pensee spatiale et leurs competences sociales.</p>
        </motion.div>
        <div className="magnet-assembly" aria-label="Assemblage magnetique Stick-O">
          <motion.div className="magnet-piece side" style={{ x: leftX }}>
            <img src={stickLeft} alt="Partie gauche Stick-O" draggable={false} />
          </motion.div>
          <div className="magnet-piece center">
            <img src={stickCenter} alt="Boule centrale Stick-O" draggable={false} />
          </div>
          <motion.div className="magnet-piece side" style={{ x: rightX }}>
            <img src={stickRight} alt="Partie droite Stick-O" draggable={false} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function HomePage() {
  const { products } = useStore();
  const { isArabic } = useLanguage();
  return (
    <>
      <section className={isArabic ? "hero hero-ar" : "hero"}>
        <img src={hero} alt="Sélection de jouets BECOM" />
        <div className="shell hero-content">
          <h1>De petits jeux.<br /><em>De grandes histoires.</em></h1>
          <p>Des jouets beaux, durables et malins pour éveiller la curiosité des enfants à chaque âge.</p>
          <div className="hero-actions"><PressButton to="/boutique" size="lg"><span className="press-button-content">Découvrir la boutique <ArrowRight size={20} /></span></PressButton><PressButton label="Notre histoire" to="/a-propos" size="lg" variant="secondary" /></div>
        </div>
      </section>

      <section className="benefit-bar shell">
        <div><Truck /><span><strong>Livraison rapide</strong><small>Partout en Algérie</small></span></div>
        <div><ShieldCheck /><span><strong>Jouets contrôlés</strong><small>Sûrs et adaptés</small></span></div>
        <div><Gift /><span><strong>Emballage cadeau</strong><small>Préparé avec amour</small></span></div>
        <div><CircleHelp /><span><strong>Conseils personnalisés</strong><small>On vous guide</small></span></div>
      </section>

      <MagnetBlock />

      <section className="section products-section">
        <div className="shell">
          <div className="title-row"><SectionTitle kicker="Les chouchous du moment" title="Jouets qui font waouh" /><Link to="/boutique">Voir toute la boutique <ArrowRight /></Link></div>
          <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="section shell story-band">
        <div className="story-visual"><img src={whyBecomChild} alt="Enfant jouant avec un jouet éducatif BECOM" /></div>
        <div className="story-copy"><span className="eyebrow">Pourquoi BECOM ?</span><h2>Les enfants ne font pas que jouer.<br />Ils deviennent.</h2><p>Chaque jeu peut ouvrir une porte : vers l'autonomie, l'imagination, la confiance ou le plaisir d'apprendre. Nous sélectionnons moins, mais mieux.</p><ul><li><Check /> Des matières agréables et durables</li><li><Check /> Des jeux choisis pour leur vraie valeur</li><li><Check /> Une sélection joyeuse, jamais bruyante</li></ul><Link className="button dark" to="/a-propos">Découvrir notre histoire <ArrowRight /></Link></div>
      </section>

      <section className="section shell reviews">
        <SectionTitle kicker="Testé par les enfants, validé par les parents" title="Des familles heureuses" />
        <div className="review-grid">
          {["Enfin une boutique qui aide vraiment à choisir selon l'âge. Le colis était magnifique.", "La qualité du bois est superbe et le service m'a conseillé en quelques minutes.", "Mon fils ne quitte plus sa fusée. Beau produit, livraison rapide et emballage soigné."].map((text, index) => <blockquote key={text}><div>{Array.from({ length: 5 }).map((_, i) => <Star key={i} fill="currentColor" />)}</div><p>“{text}”</p><footer><span>{["SA", "LM", "NK"][index]}</span><strong>{["Sarah A.", "Lina M.", "Nadir K."][index]}<small>Parent vérifié</small></strong></footer></blockquote>)}
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function ShopPage() {
  const { products } = useStore();
  const [category, setCategory] = useState("Toutes");
  const [query, setQuery] = useState("");
  const categories = ["Toutes", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = products.filter((product) => (category === "Toutes" || product.category === category) && `${product.name} ${product.nameAr || ""}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="page-shell shell">
      <div className="shop-heading"><div><span className="eyebrow">La boutique BECOM</span><h1>Trouver leur prochain <em>coup de cœur.</em></h1></div><p>{filtered.length} jouets sélectionnés</p></div>
      <div className="shop-toolbar">
        <div className="search-field"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un jouet..." /></div>
        <button className="filter-label"><Filter /> Filtrer</button>
      </div>
      <div className="filter-block"><span>Univers</span><div className="filter-chips compact">{categories.map((item) => <button className={category === item ? "active" : ""} onClick={() => setCategory(item)} key={item}>{item}</button>)}</div></div>
      {filtered.length > 0 ? <div className="product-grid shop-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="no-results"><Search /><h2>Aucun jouet ne correspond</h2><p>Essayez un autre âge ou un autre univers.</p></div>}
    </main>
  );
}

function ProductPage() {
  const { products } = useStore();
  const { isArabic } = useLanguage();
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const product = products.find((item) => item.id === id);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string | undefined>();
  const [selectedColor, setSelectedColor] = useState<string | undefined>();
  const [selectedPieceKey, setSelectedPieceKey] = useState("");
  const [optionError, setOptionError] = useState("");
  useEffect(() => {
    setQuantity(1);
    setSelectedImage(undefined);
    setSelectedColor(undefined);
    setSelectedPieceKey("");
    setOptionError("");
  }, [id]);
  if (!product) return <NotFound />;
  const recommendations = products.filter((item) => item.id !== product.id && item.age === product.age).slice(0, 3);
  const galleryImages = product.imageUrls?.length ? product.imageUrls : product.imageUrl ? [product.imageUrl] : [];
  const availableColors = productColors(product);
  const availablePieces = product.showPieces ? productPieceOptions(product) : [];
  const selectedPiece = availablePieces.find((option) => pieceKey(option) === selectedPieceKey);
  const displayPrice = selectedPiece?.price ?? product.price;
  const activeImage = selectedImage && galleryImages.includes(selectedImage) ? selectedImage : galleryImages[0];
  const activeColor = selectedColor && availableColors.includes(selectedColor) ? selectedColor : availableColors[0];
  const addToCart = () => {
    if (availablePieces.length && !selectedPiece) {
      setOptionError(isArabic ? "اختر خيار عدد القطع قبل الإضافة إلى السلة." : "Choisissez une option de pièces avant d'ajouter au panier.");
      return;
    }
    add(product, quantity, product.showColor ? activeColor : undefined, selectedPiece);
  };

  return (
    <main className="product-page shell">
      <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft /> Retour à la boutique</button>
      <div className="product-detail">
        <div className="detail-gallery"><ProductArt product={product} imageUrl={activeImage} /><div className="thumbnail-row">{galleryImages.length ? galleryImages.map((url, index) => <button type="button" className={url === activeImage ? "active" : ""} key={`${url}-${index}`} onClick={() => setSelectedImage(url)} aria-label={`Afficher la photo ${index + 1}`}><span className="gallery-thumb" style={{ backgroundImage: `url(${url})` }} /></button>) : <><button type="button" className="active"><ProductArt product={product} /></button><button type="button"><ProductArt product={product} /></button><button type="button"><ProductArt product={product} /></button></>}</div></div>
        <div className="detail-copy"><div className="detail-top"><span className="product-badge static">{product.badge || "Sélection BECOM"}</span><button className="icon-button"><Heart /></button></div><span className="eyebrow">{productCategory(product.category, isArabic)} · {product.age}</span><h1>{productName(product, isArabic)}</h1><div className="rating"><span><Star fill="currentColor" /> {product.rating}</span></div><p className="detail-description">{productDescription(product, isArabic)}</p><div className="skill-list">{product.skills.map((skill) => <span key={skill}><Sparkles /> {skill}</span>)}</div>{product.showColor && availableColors.length > 0 && <div className="color-choice"><p>{isArabic ? "اختر اللون" : "Choisir la couleur"}</p><div>{availableColors.map((color) => <button type="button" className={activeColor === color ? "active" : ""} key={color} onClick={() => setSelectedColor(color)}><i style={{ background: resolveProductColor(color) }} />{productColorName(color, isArabic)}</button>)}</div></div>}{availablePieces.length > 0 && <div className="piece-choice"><p>{isArabic ? "اختر خيارا" : "Choisir une option"}</p><div>{availablePieces.map((option) => <button type="button" className={selectedPieceKey === pieceKey(option) ? "active" : ""} key={pieceKey(option)} onClick={() => { setSelectedPieceKey(pieceKey(option)); setOptionError(""); }}><span><strong data-no-translate>{option.pieces}</strong> {isArabic ? "قطعة" : "pièces"}</span><b>{option.name}</b><em data-no-translate>{money(option.price)}</em></button>)}</div>{optionError && <small>{optionError}</small>}</div>}<div className="detail-price" aria-live="polite" data-no-translate><strong>{money(displayPrice)}</strong>{product.oldPrice && !selectedPiece && <del>{money(product.oldPrice)}</del>}</div><div className="stock"><i /> En stock · expédition sous 24/48h</div><div className="purchase-row"><div className="quantity" data-no-translate><button type="button" aria-label="Diminuer la quantité" onClick={() => setQuantity((current) => Math.max(1, current - 1))}><Minus /></button><span className="quantity-value">{quantity}</span><button type="button" aria-label="Augmenter la quantité" onClick={() => setQuantity((current) => current + 1)}><Plus /></button></div><button type="button" className="button primary purchase" onClick={addToCart}>Ajouter au panier <ShoppingBag /></button></div><div className="detail-assurances"><div><Truck /><span><strong>Livraison rapide</strong><small>À partir de 500 DA</small></span></div><div><ShieldCheck /><span><strong>Paiement sécurisé</strong><small>Ou à la livraison</small></span></div><div><Gift /><span><strong>Option cadeau</strong><small>Message personnalisé</small></span></div></div></div>
      </div>
      <section className="detail-story"><div><span className="eyebrow">Dans la boîte</span><h2>Un jeu qui grandit avec eux</h2><p>{isArabic ? "يشجع التصميم البسيط والمدروس الطفل على ابتكار قواعده الخاصة. بلا شاشة ولا سيناريو مفروض، فقط ما يكفي لتنمية فضوله وإطلاق خياله." : "Le design volontairement simple encourage l'enfant à inventer ses propres règles. Sans écran, sans scénario imposé, avec juste ce qu'il faut pour nourrir sa curiosité."}</p></div><div className="detail-stats"><span><strong>+3</strong>compétences stimulées</span><span><strong>100%</strong>jeu libre</span><span><strong>4.9</strong>note familles</span></div></section>
      {recommendations.length > 0 && <section className="section recommendations"><div className="title-row"><SectionTitle kicker="Dans le même univers" title="Ils pourraient aussi aimer" /></div><div className="product-grid">{recommendations.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  );
}

function AboutPage() {
  const { products } = useStore();
  const { isArabic } = useLanguage();
  const featured = products[1] || products[0];
  const showcaseProducts = products.slice(0, 3);
  return (
    <main>
      <section className="about-orange-block">
        <div className="shell about-orange-inner">
          <div className="about-orange-copy">
            <span className="eyebrow">BECOM Store</span>
            <h2>Jouets originaux<br />et innovants</h2>
            <p>Chez BECOM, nous aimons les jouets et les enfants. Alors nous choisissons des pieces belles, solides et utiles, capables de nourrir l'imagination sans remplir la maison de bruit.</p>
            <p>Notre mission est simple : aider les parents a trouver le bon jouet, au bon moment, avec une selection claire, joyeuse et vraiment adaptee aux familles.</p>
          </div>
          <div className="about-orange-visual">
            {showcaseProducts.map((product, index) => (
              <article className={`about-orange-card card-${index + 1}`} key={product.id}>
                <ProductArt product={product} />
                <span>{productName(product, isArabic)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="editorial-hero shell about-after-orange">
        <span className="eyebrow">Notre histoire</span>
        <h1>Grandir, c'est devenir<br /><em>un peu plus soi.</em></h1>
        <p>BECOM est née d'une idée simple : proposer aux familles des jouets que l'on aime regarder, offrir et transmettre.</p>
      </section>

      <section className="about-grid shell">
        {featured && <div className="about-art"><ProductArt product={featured} /><span>Depuis<br /><strong>2026</strong></span></div>}
        <div><span className="eyebrow">Notre manifeste</span><h2>Moins de bruit.<br />Plus d'imagination.</h2><p>Nous croyons aux jeux ouverts, aux objets qui durent et aux moments où l'enfant oublie le temps. Notre sélection privilégie la qualité d'usage, la sécurité et une esthétique joyeuse qui trouve sa place dans la maison.</p><div className="values"><div><strong>01</strong><h3>Bien choisir</h3><p>Chaque produit est évalué pour son intérêt, sa finition et son âge réel d'utilisation.</p></div><div><strong>02</strong><h3>Faire durer</h3><p>Nous préférons les matières solides et les designs qui traversent les années.</p></div><div><strong>03</strong><h3>Rester proches</h3><p>Une équipe disponible pour conseiller, rassurer et trouver le cadeau juste.</p></div></div></div>
      </section>
      <Newsletter />
    </main>
  );
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true); };
  return <main className="contact-page shell"><div className="contact-intro"><span className="eyebrow">On est là pour vous</span><h1>Une question ?<br /><em>Parlons jouets.</em></h1><p>Besoin d'un conseil selon l'âge, d'une information sur une commande ou d'une idée cadeau ? Écrivez-nous.</p><div className="contact-cards"><a href={`tel:${sitePhone}`}><Phone /><span><strong>Appelez-nous</strong><small>{sitePhone}</small></span></a><a href={`mailto:${siteEmail}`}><Mail /><span><strong>Écrivez-nous</strong><small>{siteEmail}</small></span></a><div><Clock3 /><span><strong>Horaires</strong><small>Sam - Jeu, 9h à 18h</small></span></div><div><MapPin /><span><strong>Nous trouver</strong><small>Alger, Algérie</small></span></div></div></div><form className="contact-form" onSubmit={submit}>{sent ? <div className="success-message"><Check /><h2>Message bien reçu</h2><p>Notre équipe vous répondra très vite.</p><PressButton label="Envoyer un autre message" type="button" variant="secondary" onClick={() => setSent(false)} /></div> : <><div className="form-title"><span>Bonjour !</span><h2>Comment pouvons-nous aider ?</h2></div><label>Votre nom<input required placeholder="Nom et prénom" /></label><label>Votre email<input required type="email" placeholder="vous@email.com" /></label><label>Sujet<select defaultValue="Conseil produit"><option>Conseil produit</option><option>Suivi de commande</option><option>Retour ou échange</option><option>Autre demande</option></select></label><label>Votre message<textarea required rows={5} placeholder="Dites-nous tout..." /></label><PressButton label="Envoyer" type="submit" size="lg" full /></>}</form></main>;
}

function CheckoutPage() {
  const { lines, total, clear } = useCart();
  const { createOrder, shippingRates } = useStore();
  const { isArabic } = useLanguage();
  const [done, setDone] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<"domicile" | "bureau">("domicile");
  const [selectedWilaya, setSelectedWilaya] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const selectedRate = shippingRates.find((rate) => rate.wilaya === selectedWilaya);
  const shipping = selectedRate ? selectedRate[deliveryMethod] : 0;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!lines.length) return;
    const form = new FormData(event.currentTarget);
    const order: CustomerOrder = {
      id: crypto.randomUUID(),
      customerName: String(form.get("customerName") || ""),
      phone: String(form.get("phone") || ""),
      wilaya: String(form.get("wilaya") || ""),
      address: String(form.get("address") || ""),
      commune: String(form.get("commune") || "") || undefined,
      deliveryMethod,
      subtotal: total,
      shipping,
      total: total + shipping,
      status: "new",
      items: lines.map((line) => ({ productId: line.product.id, name: productName(line.product, isArabic), selectedColor: line.selectedColor, selectedPiece: line.selectedPiece, quantity: line.quantity, price: line.selectedPiece?.price || line.product.price })),
      createdAt: new Date().toISOString(),
    };
    setSaving(true);
    setError("");
    try {
      await createOrder(order);
      clear();
      setDone(true);
    } catch {
      setError("La commande n'a pas pu être envoyée. Vérifiez les règles SQL de la table orders dans Supabase.");
    } finally {
      setSaving(false);
    }
  };
  if (done) return <main className="order-success shell"><div><PackageCheck /><span className="eyebrow">Commande confirmée</span><h1>Merci pour votre confiance.</h1><p>Votre commande BECOM est en préparation. Un message de confirmation vous sera envoyé.</p><Link className="button primary" to="/">Retour à l'accueil</Link></div></main>;
  return (
    <main className="checkout shell">
      <form className="checkout-form" onSubmit={submit}>
        <span className="eyebrow">Finaliser la commande</span>
        <h1>Confirmation de commande</h1>
        <div className="form-grid">
          <label className="wide">Nom et prénom<input required name="customerName" placeholder="Nom et prénom" /></label>
          <label className="wide">Numéro de téléphone<input required name="phone" inputMode="numeric" maxLength={10} placeholder="05 50 00 00 00" /></label>
          <label className="wide">Wilaya<select required name="wilaya" value={selectedWilaya} onChange={(event) => setSelectedWilaya(event.target.value)}><option value="" disabled>Choisir la wilaya</option>{algeriaWilayas.map((wilaya) => <option key={wilaya}>{wilaya}</option>)}</select></label>
          <label className="wide">Adresse précise<input required name="address" placeholder="Rue, quartier, bâtiment, étage..." /></label>
          <label className="wide">Commune<input name="commune" placeholder="Commune ou point de repère" /></label>
        </div>
        <div className="delivery-methods">
          <p>Méthode de livraison</p>
          <label><input type="radio" name="deliveryMethod" checked={deliveryMethod === "domicile"} onChange={() => setDeliveryMethod("domicile")} /> Livraison à domicile {selectedRate && <strong>{money(selectedRate.domicile)}</strong>}</label>
          <label><input type="radio" name="deliveryMethod" checked={deliveryMethod === "bureau"} onChange={() => setDeliveryMethod("bureau")} /> Livraison au bureau {selectedRate && <strong>{money(selectedRate.bureau)}</strong>}</label>
        </div>
        <div className="payment-card"><span><Truck /> Paiement à la livraison</span><Check /></div>
        <div className="checkout-total-card"><span>Total à payer</span><strong>{money(total + shipping)}</strong></div>
        {error && <div className="admin-login-error">{error}</div>}
        <PressButton disabled={!lines.length || saving} full size="lg" type="submit">{saving ? "Envoi de la commande..." : "Confirmer la commande"} <ArrowRight /></PressButton>
      </form>
      <aside className="order-summary">
        <h2>Votre commande</h2>
        {lines.map((line) => <div className="summary-line" key={`${line.product.id}-${line.selectedColor || "default"}-${pieceKey(line.selectedPiece)}`}><ProductArt product={line.product} /><span><strong>{productName(line.product, isArabic)}</strong><small>Quantité : {line.quantity}{line.selectedColor ? ` · Couleur ${line.selectedColor}` : ""}{line.selectedPiece ? ` · ${line.selectedPiece.pieces} pièces ${line.selectedPiece.name}` : ""}</small></span><b>{money((line.selectedPiece?.price || line.product.price) * line.quantity)}</b></div>)}
        <div className="summary-totals"><p><span>Sous-total</span><strong>{money(total)}</strong></p><p><span>Livraison</span><strong>{money(shipping)}</strong></p><p><span>Méthode</span><strong>{deliveryMethod === "domicile" ? "Domicile" : "Bureau"}</strong></p><p className="grand-total"><span>Total</span><strong>{money(total + shipping)}</strong></p></div>
      </aside>
    </main>
  );
}

function AdminPage() {
  const [session, setSession] = useState(() => getAdminSession());
  const [section, setSection] = useState("dashboard");
  const { refreshData } = useStore();
  const isAdmin = session?.user.user_metadata?.role === "admin";
  const currentSection = !isAdmin && section === "team" ? "dashboard" : section;
  useEffect(() => { if (session) refreshData(); }, [currentSection, refreshData, session]);
  if (!session) return <AdminLogin onSuccess={() => window.location.reload()} />;
  const navigationItems = [["dashboard", LayoutDashboard, "Vue d'ensemble"], ["products", Box, "Produits"], ["orders", ShoppingCart, "Commandes"], ["shipping", Truck, "Livraison"], ...(isAdmin ? [["team", Users, "Équipe"]] : [])] as const;
  const titles: Record<string, string> = { dashboard: "Vue d'ensemble", products: "Catalogue produits", orders: "Commandes", shipping: "Prix de livraison", team: "Utilisateurs et accès" };
  return <main className="admin-shell"><aside className="admin-sidebar"><Logo /><nav>{navigationItems.map(([id, Icon, label]) => <button className={currentSection === id ? "active" : ""} onClick={() => setSection(id as string)} key={id as string}><Icon /> {label as string}</button>)}</nav><button className="admin-logout" onClick={() => { signOutAdmin(); setSession(null); }}><X /> Déconnexion</button><Link to="/"><Store /> Voir la boutique</Link></aside><section className="admin-content"><header><div><span className="eyebrow">Administration BECOM</span><h1>{titles[currentSection]}</h1><AdminSyncStatus /></div></header>{currentSection === "dashboard" && <Dashboard />}{currentSection === "products" && <AdminProducts />}{currentSection === "orders" && <AdminOrders />}{currentSection === "shipping" && <AdminShipping />}{isAdmin && currentSection === "team" && <AdminUsers />}</section></main>;
}

function AdminSyncStatus() {
  return <p className="sync-status supabase">actif</p>;
}

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const submit = async (event: FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try { await signInAdmin(email, password); onSuccess(); } catch (reason) { setError(reason instanceof Error ? reason.message : "Connexion impossible"); } finally { setLoading(false); }
  };
  return <main className="admin-login"><form onSubmit={submit}><Logo /><span className="eyebrow">Espace sécurisé</span><h1>Administration BECOM</h1><p>Connectez-vous pour gérer les produits, les commandes et l'équipe.</p><label>Adresse email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label><label>Mot de passe<input required type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>{error && <div className="admin-login-error">{error}</div>}<PressButton full size="lg" type="submit" disabled={loading} label={loading ? "Connexion..." : "Se connecter"} /><Link to="/">Retour à la boutique</Link></form></main>;
}

function Dashboard() {
  const { orders, products, refreshData } = useStore();
  useEffect(() => {
    void refreshData();
    const retry = window.setTimeout(() => { void refreshData(); }, 650);
    return () => window.clearTimeout(retry);
  }, [refreshData]);
  const statusLabels: Record<OrderStatus, string> = { new: "Nouvelles", progress: "En cours", done: "Terminées", return: "Retours", cancelled: "Annulées" };
  const statusCounts = orders.reduce<Record<OrderStatus, number>>((counts, order) => {
    counts[order.status] += 1;
    return counts;
  }, { new: 0, progress: 0, done: 0, return: 0, cancelled: 0 });
  const completedOrders = orders.filter((order) => order.status === "done");
  const revenue = completedOrders.reduce((sum, order) => sum + order.total, 0);
  const average = completedOrders.length ? Math.round(revenue / completedOrders.length) : 0;
  const pending = statusCounts.new + statusCounts.progress;
  const lowStock = products.filter((product) => product.stock <= 3).length;
  const latestOrders = orders.slice(0, 4);
  return <>
    <div className="metric-grid">
      <div><span>Chiffre d'affaires</span><strong>{money(revenue)}</strong><small>{completedOrders.length ? "Commandes terminées uniquement" : "Aucune commande terminée"}</small></div>
      <div><span>Commandes</span><strong>{orders.length}</strong><small>{pending ? `${pending} à traiter` : orders.length ? "Toutes traitées" : "Aucune commande"}</small></div>
      <div><span>Panier moyen</span><strong>{money(average)}</strong><small>{completedOrders.length ? "Sur les commandes terminées" : "Pas encore calculé"}</small></div>
      <div><span>Alertes</span><strong>{lowStock}</strong><small>{lowStock ? "Stocks faibles" : "Tout est prêt"}</small></div>
    </div>
    <div className="status-summary-grid">
      {(Object.keys(statusLabels) as OrderStatus[]).map((status) => (
        <div className={status} key={status}>
          <span>{statusLabels[status]}</span>
          <strong>{statusCounts[status]}</strong>
          <small>{statusCounts[status] === 1 ? "commande" : "commandes"}</small>
        </div>
      ))}
    </div>
    <div className="admin-empty-state dashboard-orders">
      <PackageCheck />
      <h2>{orders.length ? "Dernières commandes" : "Aucune commande pour le moment"}</h2>
      {latestOrders.length ? (
        <div className="dashboard-order-list">
          {latestOrders.map((order) => (
            <div key={order.id}>
              <strong>{order.customerName}</strong>
              <span>{order.wilaya} · {money(order.total)}</span>
              <em className={order.status}>{order.status === "new" ? "Nouvelle" : order.status === "progress" ? "En cours" : order.status === "done" ? "Terminée" : order.status === "return" ? "Retour" : "Annulée"}</em>
            </div>
          ))}
        </div>
      ) : <p>Les nouvelles commandes apparaîtront ici automatiquement après validation.</p>}
    </div>
  </>;
}

function AdminProducts() {
  const { products, saveProduct, deleteProduct } = useStore();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Product | null>(null);
  const filtered = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  const emptyProduct = (): Product => ({ id: "", name: "", nameAr: "", category: "BECOM", age: "Tous les âges", price: 0, rating: 5, reviews: 0, color: "#e8f1fb", colorLabel: "", colorLabels: [], showColor: false, sprite: 0, stock: 0, piecesCount: 0, pieceOptions: [], showPieces: false, description: "", descriptionAr: "", skills: [] });
  const close = () => setDraft(null);
  const colorInputs = draft ? (draft.colorLabels?.length ? draft.colorLabels : draft.colorLabel ? [draft.colorLabel] : [""]) : [""];
  const updateColorInputs = (colors: string[]) => {
    if (!draft) return;
    const firstColor = colors.find((color) => color.trim())?.trim() || "";
    setDraft({ ...draft, colorLabel: firstColor, colorLabels: colors });
  };
  const updateColorInput = (index: number, value: string) => {
    const next = [...colorInputs];
    next[index] = value;
    updateColorInputs(next);
  };
  const addColorInput = () => {
    if (!draft) return;
    setDraft({ ...draft, colorLabels: [...colorInputs, ""], colorLabel: draft.colorLabel || "" });
  };
  const removeColorInput = (index: number) => updateColorInputs(colorInputs.filter((_, itemIndex) => itemIndex !== index));
  const pieceInputs = draft ? (draft.pieceOptions?.length ? draft.pieceOptions : [{ pieces: 0, name: "", price: 0 }]) : [];
  const updatePieceInputs = (options: PieceOption[]) => {
    if (!draft) return;
    setDraft({ ...draft, pieceOptions: options });
  };
  const updatePieceInput = (index: number, patch: Partial<PieceOption>) => updatePieceInputs(pieceInputs.map((option, itemIndex) => itemIndex === index ? { ...option, ...patch } : option));
  const addPieceInput = () => updatePieceInputs([...pieceInputs, { pieces: 0, name: "", price: 0 }]);
  const removePieceInput = (index: number) => updatePieceInputs(pieceInputs.filter((_, itemIndex) => itemIndex !== index));
  const uploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !draft) return;
    const currentImages = draft.imageUrls?.length ? draft.imageUrls : draft.imageUrl ? [draft.imageUrl] : [];
    const previews = files.map((file) => URL.createObjectURL(file));
    setDraft({ ...draft, imageUrl: currentImages[0] || previews[0], imageUrls: [...currentImages, ...previews] });
    try {
      const uploaded = await Promise.all(files.map((file) => uploadProductImage(file)));
      const nextImages = [...currentImages, ...uploaded];
      setDraft({ ...draft, imageUrl: nextImages[0], imageUrls: nextImages });
    } catch {
      const nextImages = [...currentImages, ...previews];
      setDraft({ ...draft, imageUrl: nextImages[0], imageUrls: nextImages });
    }
    event.target.value = "";
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const id = draft.id || draft.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const cleanColors = (draft.colorLabels?.length ? draft.colorLabels : draft.colorLabel ? [draft.colorLabel] : []).map((color) => color.trim()).filter(Boolean);
    const cleanPieces = (draft.pieceOptions || []).map((option) => ({ pieces: Number(option.pieces), name: option.name.trim(), price: Number(option.price) })).filter((option) => option.pieces > 0 && option.name && option.price > 0);
    await saveProduct({ ...draft, id, colorLabel: cleanColors[0] || "", colorLabels: cleanColors, pieceOptions: cleanPieces, price: cleanPieces.length ? cleanPieces[0].price : draft.price });
    close();
  };

  return (
    <>
      <section className="admin-table-card">
        <div className="admin-table-head">
          <div className="search-field"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher dans le catalogue" /></div>
          <PressButton onClick={() => setDraft(emptyProduct())}><Plus /> Nouveau produit</PressButton>
        </div>
        <div className="admin-table">
          {filtered.map((product) => (
            <div className="table-row" key={product.id}>
              <ProductArt product={product} />
              <div><strong>{product.name}</strong><small>{product.category} · {product.age}</small></div>
              <span>{money(product.price)}</span>
              <span className={product.stock < 8 ? "stock-low" : "stock-ok"}>{product.stock} en stock</span>
              <div className="table-actions">
                <button onClick={() => setDraft(product)} aria-label={`Modifier ${product.name}`}><Pencil /></button>
                <button className="danger" onClick={() => deleteProduct(product.id)} aria-label={`Supprimer ${product.name}`}><Trash2 /></button>
              </div>
            </div>
          ))}
        </div>
      </section>
      {draft && (
        <div className="admin-modal-backdrop">
          <form className="admin-modal" onSubmit={submit}>
            <div className="admin-modal-head">
              <div><span className="eyebrow">Catalogue</span><h2>{draft.id ? "Modifier le produit" : "Ajouter un produit"}</h2></div>
              <button type="button" onClick={close} aria-label="Fermer"><X /></button>
            </div>
            <div className="admin-product-media">
              <ProductArt product={draft} />
              <div>
                <strong>Photo du produit</strong>
                <p>Téléversez une ou plusieurs photos depuis ordinateur ou téléphone. La première photo devient l'image principale.</p>
                <label className="upload-button"><ImagePlus /> Téléverser des photos<input accept="image/*" type="file" multiple onChange={uploadImage} /></label>
                {!!(draft.imageUrls?.length || draft.imageUrl) && (
                  <div className="admin-photo-strip">
                    {(draft.imageUrls?.length ? draft.imageUrls : draft.imageUrl ? [draft.imageUrl] : []).map((url, index) => (
                      <button type="button" key={`${url}-${index}`} onClick={() => {
                        const source = draft.imageUrls?.length ? draft.imageUrls : draft.imageUrl ? [draft.imageUrl] : [];
                        const next = source.filter((_, itemIndex) => itemIndex !== index);
                        setDraft({ ...draft, imageUrl: next[0], imageUrls: next.length ? next : undefined });
                      }} aria-label={`Retirer la photo ${index + 1}`}>
                        <img src={url} alt="" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="admin-form-grid">
              <label>Nom<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label>Nom arabe<input dir="rtl" value={draft.nameAr || ""} onChange={(event) => setDraft({ ...draft, nameAr: event.target.value })} /></label>
              <label>Prix (DA)<input required min="0" type="number" disabled={!!draft.showPieces} value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label>
              <label>Ancien prix<input min="0" type="number" value={draft.oldPrice || ""} onChange={(event) => setDraft({ ...draft, oldPrice: event.target.value ? Number(event.target.value) : undefined })} /></label>
              <label>Stock<input required min="0" type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} /></label>
              <label>Badge<input value={draft.badge || ""} onChange={(event) => setDraft({ ...draft, badge: event.target.value || undefined })} /></label>
              <label className="feature-toggle"><input type="checkbox" checked={!!draft.showColor} onChange={(event) => setDraft({ ...draft, showColor: event.target.checked })} /> Activer la couleur</label>
              <div className="color-field-list">
                <span>Couleurs</span>
                {colorInputs.map((color, index) => (
                  <div className="color-line" key={index}>
                    <input value={color} onChange={(event) => updateColorInput(index, event.target.value)} placeholder="Rouge, bleu, #ff3c38..." />
                    <i style={{ background: resolveProductColor(color) }} />
                    {index === colorInputs.length - 1 ? <button type="button" onClick={addColorInput} aria-label="Ajouter une couleur"><Plus /></button> : <button type="button" className="danger" onClick={() => removeColorInput(index)} aria-label="Retirer cette couleur"><X /></button>}
                  </div>
                ))}
              </div>
              <label className="feature-toggle"><input type="checkbox" checked={!!draft.showPieces} onChange={(event) => setDraft({ ...draft, showPieces: event.target.checked })} /> Activer le nombre de pièces</label>
              {draft.showPieces && <div className="piece-field-list">
                <span>Options de pièces</span>
                {pieceInputs.map((option, index) => (
                  <div className="piece-line" key={index}>
                    <input min="0" type="number" value={option.pieces || ""} onChange={(event) => updatePieceInput(index, { pieces: Number(event.target.value) })} placeholder="Nombre" />
                    <input value={option.name} onChange={(event) => updatePieceInput(index, { name: event.target.value })} placeholder="Nom de la pièce" />
                    <input min="0" type="number" value={option.price || ""} onChange={(event) => updatePieceInput(index, { price: Number(event.target.value) })} placeholder="Prix DA" />
                    {index === pieceInputs.length - 1 ? <button type="button" onClick={addPieceInput} aria-label="Ajouter une option pièces"><Plus /></button> : <button type="button" className="danger" onClick={() => removePieceInput(index)} aria-label="Retirer cette option"><X /></button>}
                  </div>
                ))}
              </div>}
              <label className="wide">Description<textarea required rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
              <label className="wide">Description arabe<textarea dir="rtl" rows={4} value={draft.descriptionAr || ""} onChange={(event) => setDraft({ ...draft, descriptionAr: event.target.value })} /></label>
              <label className="wide">Compétences, séparées par des virgules<input value={draft.skills.join(", ")} onChange={(event) => setDraft({ ...draft, skills: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) })} /></label>
            </div>
            <div className="admin-modal-actions"><PressButton label="Annuler" type="button" variant="secondary" onClick={close} /><PressButton label="Enregistrer le produit" type="submit" /></div>
          </form>
        </div>
      )}
    </>
  );
}

function AdminUsers() {
  const { users, saveUser, createUser, deleteUser } = useStore();
  const [draft, setDraft] = useState<AdminUser | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    setError("");
    try {
      if (draft.id) await saveUser(draft);
      else await createUser({ ...draft, id: crypto.randomUUID() }, password);
      setDraft(null);
      setPassword("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Création utilisateur impossible");
    }
  };
  const close = () => { setDraft(null); setPassword(""); setError(""); };
  return <><section className="admin-table-card"><div className="admin-table-head"><div><span className="eyebrow">Accès internes</span><h2>{users.length} utilisateur{users.length > 1 ? "s" : ""}</h2></div><PressButton onClick={() => { setError(""); setDraft({ id: "", name: "", email: "", role: "employe", active: true }); }}><UserPlus /> Ajouter un utilisateur</PressButton></div><div className="user-table">{users.map((user) => <div className="user-row" key={user.id}><span>{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><em className={user.role}>{user.role === "admin" ? "Administrateur" : "Employé"}</em><b className={user.active ? "active" : "inactive"}>{user.active ? "Actif" : "Suspendu"}</b><div className="table-actions"><button onClick={() => setDraft(user)} aria-label={`Modifier ${user.name}`}><Pencil /></button><button className="danger" disabled={user.id === "yacine-admin"} onClick={() => deleteUser(user.id)} aria-label={`Supprimer ${user.name}`}><Trash2 /></button></div></div>)}</div></section>{draft && <div className="admin-modal-backdrop"><form className="admin-modal compact" onSubmit={submit}><div className="admin-modal-head"><div><span className="eyebrow">Équipe</span><h2>{draft.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2></div><button type="button" onClick={close} aria-label="Fermer"><X /></button></div><div className="admin-form-grid"><label className="wide">Nom complet<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="wide">Adresse email<input required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>{!draft.id && <label className="wide">Mot de passe<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" /></label>}<label>Rôle<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as AdminRole })}><option value="admin">Administrateur</option><option value="employe">Employé</option></select></label><label>Statut<select value={draft.active ? "active" : "inactive"} onChange={(event) => setDraft({ ...draft, active: event.target.value === "active" })}><option value="active">Actif</option><option value="inactive">Suspendu</option></select></label></div>{error && <div className="admin-login-error">{error}</div>}<div className="role-note">Le compte est créé directement avec le mot de passe défini ici. Aucun mot de passe n'est enregistré dans le navigateur.</div><div className="admin-modal-actions"><PressButton label="Annuler" type="button" variant="secondary" onClick={close} /><PressButton label="Créer l'utilisateur" type="submit" /></div></form></div>}</>;
}

function AdminOrders() {
  const { orders, updateOrderStatus } = useStore();
  const [editing, setEditing] = useState<CustomerOrder | null>(null);
  const statusLabel = (status: OrderStatus) => status === "new" ? "Nouvelle" : status === "progress" ? "En cours" : status === "done" ? "Terminée" : status === "return" ? "Retour" : "Annulée";
  return (
    <>
      <section className="admin-table-card">
        <div className="admin-table-head"><h2>{orders.length} commande{orders.length > 1 ? "s" : ""}</h2></div>
        {orders.length ? (
          <div className="orders-table">
            {orders.map((order) => (
              <div key={order.id}>
                <strong>#{order.id.slice(0, 8)}</strong>
                <span>{order.customerName}<small>{order.phone}</small></span>
                <span>{order.wilaya}<small>{order.deliveryMethod === "domicile" ? "Domicile" : "Bureau"} · {order.commune || order.address}</small></span>
                <span>{order.items.reduce((sum, item) => sum + item.quantity, 0)} produit{order.items.reduce((sum, item) => sum + item.quantity, 0) > 1 ? "s" : ""}<small>{order.items.map((item) => `${item.quantity}x ${item.name}${item.selectedColor ? ` (${item.selectedColor})` : ""}${item.selectedPiece ? ` - ${item.selectedPiece.pieces} pièces ${item.selectedPiece.name}` : ""}`).join(", ")}</small></span>
                <strong>{money(order.total)}</strong>
                <div className="order-actions">
                  <select className={`status-select ${order.status}`} value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as OrderStatus)} aria-label={`Statut commande ${order.id.slice(0, 8)}`}>
                    <option value="new">Nouvelle</option>
                    <option value="progress">En cours</option>
                    <option value="done">Terminée</option>
                    <option value="return">Retour</option>
                    <option value="cancelled">Annulée</option>
                  </select>
                  <button onClick={() => setEditing(order)} aria-label={`Voir la commande ${order.id.slice(0, 8)}`}><Pencil /></button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-empty-state small"><ShoppingCart /><h2>Aucune commande</h2><p>Les commandes des clients apparaîtront automatiquement ici après validation.</p></div>
        )}
      </section>
      {editing && (
        <div className="admin-modal-backdrop">
          <div className="admin-modal compact">
            <div className="admin-modal-head">
              <div><span className="eyebrow">Commande #{editing.id.slice(0, 8)}</span><h2>{editing.customerName}</h2></div>
              <button type="button" onClick={() => setEditing(null)} aria-label="Fermer"><X /></button>
            </div>
            <div className="order-detail">
              <p><strong>Téléphone</strong><span>{editing.phone}</span></p>
              <p><strong>Adresse</strong><span>{editing.address}</span></p>
              <p><strong>Commune</strong><span>{editing.commune || "-"}</span></p>
              <p><strong>Wilaya</strong><span>{editing.wilaya}</span></p>
              <p><strong>Livraison</strong><span>{editing.deliveryMethod === "domicile" ? "Domicile" : "Bureau"} · {money(editing.shipping)}</span></p>
              <label>Statut<select className={`status-select ${editing.status}`} value={editing.status} onChange={async (event) => {
                const status = event.target.value as OrderStatus;
                await updateOrderStatus(editing.id, status);
                setEditing({ ...editing, status });
              }}><option value="new">Nouvelle</option><option value="progress">En cours</option><option value="done">Terminée</option><option value="return">Retour</option><option value="cancelled">Annulée</option></select></label>
              <div className="order-items-detail">
                {editing.items.map((item) => <div key={`${item.productId}-${item.name}-${item.selectedColor || "default"}-${pieceKey(item.selectedPiece)}`}><span>{item.quantity}x {item.name}{item.selectedColor ? ` · Couleur ${item.selectedColor}` : ""}{item.selectedPiece ? ` · ${item.selectedPiece.pieces} pièces ${item.selectedPiece.name}` : ""}</span><strong>{money(item.price * item.quantity)}</strong></div>)}
              </div>
              <p className="order-total"><strong>Total</strong><span>{money(editing.total)}</span></p>
              <em className={editing.status}>{statusLabel(editing.status)}</em>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AdminShipping() {
  const { shippingRates, saveShippingRates } = useStore();
  const [draft, setDraft] = useState<ShippingRate[]>(shippingRates);
  const [saved, setSaved] = useState(false);
  useEffect(() => setDraft(shippingRates), [shippingRates]);
  const updateRate = (wilaya: string, field: "domicile" | "bureau", value: number) => {
    setDraft((current) => current.map((rate) => rate.wilaya === wilaya ? { ...rate, [field]: Math.max(0, value) } : rate));
    setSaved(false);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    await saveShippingRates(draft);
    setSaved(true);
  };
  return (
    <form className="admin-table-card" onSubmit={submit}>
      <div className="admin-table-head">
        <div><span className="eyebrow">Tarifs par wilaya</span><h2>Domicile et bureau</h2></div>
        <PressButton type="submit"><Check /> Enregistrer</PressButton>
      </div>
      {saved && <div className="admin-save-note">Les prix de livraison sont enregistrés et utilisés dans le formulaire commande.</div>}
      <div className="shipping-table">
        <div className="shipping-head"><span>Wilaya</span><span>Domicile</span><span>Bureau</span></div>
        {draft.map((rate) => (
          <div className="shipping-row" key={rate.wilaya}>
            <strong>{rate.wilaya}</strong>
            <label><input min="0" type="number" value={rate.domicile} onChange={(event) => updateRate(rate.wilaya, "domicile", Number(event.target.value))} /> DA</label>
            <label><input min="0" type="number" value={rate.bureau} onChange={(event) => updateRate(rate.wilaya, "bureau", Number(event.target.value))} /> DA</label>
          </div>
        ))}
      </div>
    </form>
  );
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  return <section className="newsletter"><div className="shell"><div><span className="eyebrow">Le petit courrier BECOM</span><h2>Des idées de jeux,<br />pas des emails ennuyeux.</h2></div>{joined ? <div className="newsletter-thanks"><Check /> Bienvenue dans la famille BECOM !</div> : <form onSubmit={(event) => { event.preventDefault(); if (email) setJoined(true); }}><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre adresse email" /><button className="button dark">Je m'inscris <ArrowRight /></button><small>Promis, seulement les belles nouvelles.</small></form>}</div></section>;
}

function Footer() {
  return <footer className="footer"><div className="shell footer-grid"><div className="footer-brand"><Logo /><p>Des jouets qui font grandir l'imagination, la confiance et les beaux souvenirs.</p><div><a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook"><span className="footer-social-letter">f</span></a><a href={instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram /></a><a href={`mailto:${siteEmail}`} aria-label="Email"><Mail /></a></div></div><div><strong>Boutique</strong><Link to="/boutique">Tous les jouets</Link></div><div><strong>BECOM</strong><Link to="/a-propos">Notre histoire</Link><Link to="/contact">Contact</Link><Link to="/admin">Espace admin</Link><a href="#faq">Questions fréquentes</a></div><div><strong>Besoin d'aide ?</strong><a href={`tel:${sitePhone}`}>{sitePhone}</a><a href={`mailto:${siteEmail}`}>{siteEmail}</a><span>Sam - Jeu · 9h - 18h</span></div></div><div className="shell footer-bottom"><span>© 2026 BECOM Store. Tous droits réservés.</span><span>developed by SITEMAGIQUE</span></div></footer>;
}

function NotFound() {
  return <main className="not-found shell"><span>404</span><h1>Cette page est partie jouer.</h1><p>Revenons à un endroit que nous connaissons.</p><Link className="button primary" to="/">Retour à l'accueil</Link></main>;
}

function StoreLayout() {
  const location = useLocation();
  useEffect(() => window.scrollTo({ top: 0, behavior: "smooth" }), [location.pathname]);
  return <><Header /><Routes><Route path="/" element={<HomePage />} /><Route path="/boutique" element={<ShopPage />} /><Route path="/produit/:id" element={<ProductPage />} /><Route path="/a-propos" element={<AboutPage />} /><Route path="/contact" element={<ContactPage />} /><Route path="/commande" element={<CheckoutPage />} /><Route path="*" element={<NotFound />} /></Routes><Footer /><CartDrawer /></>;
}

export default function App() {
  const isAdmin = useLocation().pathname.startsWith("/admin");
  return <LanguageProvider><CartProvider>{isAdmin ? <Routes><Route path="/admin/*" element={<AdminPage />} /></Routes> : <StoreLayout />}</CartProvider></LanguageProvider>;
}
