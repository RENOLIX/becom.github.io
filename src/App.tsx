import {
  ArrowLeft,
  ArrowRight,
  Blocks,
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
import { createContext, useContext, useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import logo from "./assets/becom-logo.png";
import hero from "./assets/becom-hero.jpg";
import sprite from "./assets/product-sprite.jpg";
import { PressButton } from "./components/PressButton";
import { ageGroups, type Product } from "./data";
import { useStore, type AdminRole, type AdminUser } from "./store";

const money = (value: number) => `${value.toLocaleString("fr-DZ")} DA`;

type CartLine = { product: Product; quantity: number };
type CartValue = {
  lines: CartLine[];
  count: number;
  total: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (product: Product, quantity?: number) => void;
  change: (id: string, quantity: number) => void;
  remove: (id: string) => void;
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
  const total = lines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const add = (product: Product, quantity = 1) => {
    setLines((current) => {
      const found = current.find((line) => line.product.id === product.id);
      return found
        ? current.map((line) => line.product.id === product.id ? { ...line, quantity: line.quantity + quantity } : line)
        : [...current, { product, quantity }];
    });
    setOpen(true);
  };
  const change = (id: string, quantity: number) => setLines((current) => current
    .map((line) => line.product.id === id ? { ...line, quantity } : line)
    .filter((line) => line.quantity > 0));
  const remove = (id: string) => setLines((current) => current.filter((line) => line.product.id !== id));

  return <CartContext.Provider value={{ lines, count, total, open, setOpen, add, change, remove }}>{children}</CartContext.Provider>;
}

function ProductArt({ product, className = "" }: { product: Product; className?: string }) {
  const x = [0, 33.333, 66.667, 100][product.sprite % 4];
  const y = product.sprite < 4 ? 0 : 100;
  return (
    <div
      className={`product-art ${className}`}
      style={{ backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : `url(${sprite})`, backgroundPosition: product.imageUrl ? "center" : `${x}% ${y}%`, backgroundColor: product.color }}
      role="img"
      aria-label={product.name}
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
          <button className="cart-button" onClick={() => setOpen(true)} aria-label={`Panier, ${count} produits`}>
            <ShoppingCart />
            <span>{count}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

function CartDrawer() {
  const { lines, total, open, setOpen, change, remove } = useCart();
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
            <article className="cart-line" key={line.product.id}>
              <ProductArt product={line.product} />
              <div><Link to={`/produit/${line.product.id}`} onClick={() => setOpen(false)}>{line.product.name}</Link><small>{line.product.age}</small><strong>{money(line.product.price)}</strong>
                <div className="quantity-mini"><button onClick={() => change(line.product.id, line.quantity - 1)}><Minus /></button><span>{line.quantity}</span><button onClick={() => change(line.product.id, line.quantity + 1)}><Plus /></button></div>
              </div>
              <button className="remove-line" onClick={() => remove(line.product.id)} aria-label="Supprimer"><Trash2 /></button>
            </article>
          ))}
        </div>
        {lines.length > 0 && <div className="drawer-total"><div><span>Sous-total</span><strong>{money(total)}</strong></div><p>Livraison calculée à l'étape suivante.</p><Link to="/commande" className="button primary full" onClick={() => setOpen(false)}>Passer la commande <ArrowRight /></Link><button className="text-button" onClick={() => setOpen(false)}>Continuer mes achats</button></div>}
      </aside>
    </>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  return (
    <article className="product-card">
      <Link to={`/produit/${product.id}`} className="product-visual">
        {product.badge && <span className="product-badge">{product.badge}</span>}
        <button className="heart" onClick={(event) => event.preventDefault()} aria-label="Ajouter aux favoris"><Heart /></button>
        <ProductArt product={product} />
      </Link>
      <div className="product-copy">
        <div className="product-meta"><span>{product.category}</span><span><Star fill="currentColor" /> {product.rating}</span></div>
        <Link to={`/produit/${product.id}`}><h3>{product.name}</h3></Link>
        <p>{product.age}</p>
        <div className="product-bottom"><div><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div><button className="add-button" onClick={() => add(product)} aria-label="Ajouter au panier"><span className="cart-add-icon"><ShoppingCart /><Plus /></span></button></div>
      </div>
    </article>
  );
}

function SectionTitle({ kicker, title, copy }: { kicker: string; title: string; copy?: string }) {
  return <div className="section-title"><span className="eyebrow">{kicker}</span><h2>{title}</h2>{copy && <p>{copy}</p>}</div>;
}

function HomePage() {
  const { products } = useStore();
  const storyProduct = products[4] || products[0];
  return (
    <>
      <section className="hero">
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

      <section className="section products-section">
        <div className="shell">
          <div className="title-row"><SectionTitle kicker="Les chouchous du moment" title="Jouets qui font waouh" /><Link to="/boutique">Voir toute la boutique <ArrowRight /></Link></div>
          <div className="product-grid">{products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}</div>
        </div>
      </section>

      <section className="section shell story-band">
        {storyProduct && <div className="story-visual"><ProductArt product={storyProduct} /><span className="orbit one"><Blocks strokeWidth={1.8} /></span><span className="orbit two"><Sparkles strokeWidth={1.8} /></span></div>}
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
  const filtered = products.filter((product) => (category === "Toutes" || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase()));

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
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const product = products.find((item) => item.id === id);
  const [quantity, setQuantity] = useState(1);
  if (!product) return <NotFound />;
  const recommendations = products.filter((item) => item.id !== product.id && item.age === product.age).slice(0, 3);

  return (
    <main className="product-page shell">
      <button className="back-link" onClick={() => navigate(-1)}><ArrowLeft /> Retour à la boutique</button>
      <div className="product-detail">
        <div className="detail-gallery"><ProductArt product={product} /><div className="thumbnail-row"><button className="active"><ProductArt product={product} /></button><button><ProductArt product={product} /></button><button><ProductArt product={product} /></button></div></div>
        <div className="detail-copy"><div className="detail-top"><span className="product-badge static">{product.badge || "Sélection BECOM"}</span><button className="icon-button"><Heart /></button></div><span className="eyebrow">{product.category} · {product.age}</span><h1>{product.name}</h1><div className="rating"><span><Star fill="currentColor" /> {product.rating}</span><a href="#avis">{product.reviews} avis vérifiés</a></div><p className="detail-description">{product.description}</p><div className="skill-list">{product.skills.map((skill) => <span key={skill}><Sparkles /> {skill}</span>)}</div><div className="detail-price"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}</div><div className="stock"><i /> En stock · expédition sous 24/48h</div><div className="purchase-row"><div className="quantity"><button onClick={() => setQuantity(Math.max(1, quantity - 1))}><Minus /></button><span>{quantity}</span><button onClick={() => setQuantity(quantity + 1)}><Plus /></button></div><button className="button primary purchase" onClick={() => add(product, quantity)}>Ajouter au panier <ShoppingBag /></button></div><div className="detail-assurances"><div><Truck /><span><strong>Livraison rapide</strong><small>À partir de 500 DA</small></span></div><div><ShieldCheck /><span><strong>Paiement sécurisé</strong><small>Ou à la livraison</small></span></div><div><Gift /><span><strong>Option cadeau</strong><small>Message personnalisé</small></span></div></div></div>
      </div>
      <section className="detail-story"><div><span className="eyebrow">Dans la boîte</span><h2>Un jeu qui grandit avec eux</h2><p>Le design volontairement simple encourage l'enfant à inventer ses propres règles. Sans écran, sans scénario imposé, avec juste ce qu'il faut pour nourrir sa curiosité.</p></div><div className="detail-stats"><span><strong>+3</strong>compétences stimulées</span><span><strong>100%</strong>jeu libre</span><span><strong>4.9</strong>note familles</span></div></section>
      {recommendations.length > 0 && <section className="section recommendations"><div className="title-row"><SectionTitle kicker="Dans le même univers" title="Ils pourraient aussi aimer" /></div><div className="product-grid">{recommendations.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    </main>
  );
}

function AboutPage() {
  const { products } = useStore();
  const featured = products[1] || products[0];
  return <main><section className="editorial-hero shell"><span className="eyebrow">Notre histoire</span><h1>Grandir, c'est devenir<br /><em>un peu plus soi.</em></h1><p>BECOM est née d'une idée simple : proposer aux familles des jouets que l'on aime regarder, offrir et transmettre.</p></section><section className="about-grid shell">{featured && <div className="about-art"><ProductArt product={featured} /><span>Depuis<br /><strong>2026</strong></span></div>}<div><span className="eyebrow">Notre manifeste</span><h2>Moins de bruit.<br />Plus d'imagination.</h2><p>Nous croyons aux jeux ouverts, aux objets qui durent et aux moments où l'enfant oublie le temps. Notre sélection privilégie la qualité d'usage, la sécurité et une esthétique joyeuse qui trouve sa place dans la maison.</p><div className="values"><div><strong>01</strong><h3>Bien choisir</h3><p>Chaque produit est évalué pour son intérêt, sa finition et son âge réel d'utilisation.</p></div><div><strong>02</strong><h3>Faire durer</h3><p>Nous préférons les matières solides et les designs qui traversent les années.</p></div><div><strong>03</strong><h3>Rester proches</h3><p>Une équipe disponible pour conseiller, rassurer et trouver le cadeau juste.</p></div></div></div></section><Newsletter /></main>;
}

function ContactPage() {
  const [sent, setSent] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); setSent(true); };
  return <main className="contact-page shell"><div className="contact-intro"><span className="eyebrow">On est là pour vous</span><h1>Une question ?<br /><em>Parlons jouets.</em></h1><p>Besoin d'un conseil selon l'âge, d'une information sur une commande ou d'une idée cadeau ? Écrivez-nous.</p><div className="contact-cards"><a href="tel:+213550000000"><Phone /><span><strong>Appelez-nous</strong><small>+213 550 00 00 00</small></span></a><a href="mailto:bonjour@becom.store"><Mail /><span><strong>Écrivez-nous</strong><small>bonjour@becom.store</small></span></a><div><Clock3 /><span><strong>Horaires</strong><small>Sam - Jeu, 9h à 18h</small></span></div><div><MapPin /><span><strong>Nous trouver</strong><small>Alger, Algérie</small></span></div></div></div><form className="contact-form" onSubmit={submit}>{sent ? <div className="success-message"><Check /><h2>Message bien reçu</h2><p>Notre équipe vous répondra très vite.</p><PressButton label="Envoyer un autre message" type="button" variant="secondary" onClick={() => setSent(false)} /></div> : <><div className="form-title"><span>Bonjour !</span><h2>Comment pouvons-nous aider ?</h2></div><label>Votre nom<input required placeholder="Nom et prénom" /></label><label>Votre email<input required type="email" placeholder="vous@email.com" /></label><label>Sujet<select defaultValue="Conseil produit"><option>Conseil produit</option><option>Suivi de commande</option><option>Retour ou échange</option><option>Autre demande</option></select></label><label>Votre message<textarea required rows={5} placeholder="Dites-nous tout..." /></label><PressButton label="Envoyer" type="submit" size="lg" full /></>}</form></main>;
}

function CheckoutPage() {
  const { lines, total } = useCart();
  const [done, setDone] = useState(false);
  if (done) return <main className="order-success shell"><div><PackageCheck /><span className="eyebrow">Commande confirmée</span><h1>Merci pour votre confiance.</h1><p>Votre commande BECOM est en préparation. Un message de confirmation vous sera envoyé.</p><Link className="button primary" to="/">Retour à l'accueil</Link></div></main>;
  return <main className="checkout shell"><div className="checkout-form"><span className="eyebrow">Finaliser la commande</span><h1>Livraison</h1><div className="form-grid"><label>Prénom<input placeholder="Prénom" /></label><label>Nom<input placeholder="Nom" /></label><label className="wide">Téléphone<input placeholder="05 50 00 00 00" /></label><label className="wide">Adresse<input placeholder="Rue, quartier..." /></label><label>Wilaya<select><option>Alger</option><option>Oran</option><option>Blida</option><option>Constantine</option></select></label><label>Commune<input placeholder="Commune" /></label></div><div className="payment-card"><span><Truck /> Paiement à la livraison</span><Check /></div><PressButton disabled={!lines.length} full size="lg" onClick={() => setDone(true)}>Confirmer la commande <ArrowRight /></PressButton></div><aside className="order-summary"><h2>Votre commande</h2>{lines.map((line) => <div className="summary-line" key={line.product.id}><ProductArt product={line.product} /><span><strong>{line.product.name}</strong><small>Quantité : {line.quantity}</small></span><b>{money(line.product.price * line.quantity)}</b></div>)}<div className="summary-totals"><p><span>Sous-total</span><strong>{money(total)}</strong></p><p><span>Livraison</span><strong>500 DA</strong></p><p className="grand-total"><span>Total</span><strong>{money(total + 500)}</strong></p></div></aside></main>;
}

function AdminPage() {
  const [section, setSection] = useState("dashboard");
  const { syncMode } = useStore();
  const titles: Record<string, string> = { dashboard: "Vue d'ensemble", products: "Catalogue produits", orders: "Commandes", team: "Utilisateurs et accès" };
  return <main className="admin-shell"><aside className="admin-sidebar"><Logo /><nav>{[["dashboard", LayoutDashboard, "Vue d'ensemble"], ["products", Box, "Produits"], ["orders", ShoppingCart, "Commandes"], ["team", Users, "Équipe"]].map(([id, Icon, label]) => <button className={section === id ? "active" : ""} onClick={() => setSection(id as string)} key={id as string}><Icon /> {label as string}</button>)}</nav><Link to="/"><Store /> Voir la boutique</Link></aside><section className="admin-content"><header><div><span className="eyebrow">Administration BECOM</span><h1>{titles[section]}</h1><p className={`sync-status ${syncMode}`}>{syncMode === "supabase" ? "Synchronisé avec Supabase" : "Mode local, en attente des tables Supabase"}</p></div></header>{section === "dashboard" && <Dashboard />}{section === "products" && <AdminProducts />}{section === "orders" && <AdminOrders />}{section === "team" && <AdminUsers />}</section></main>;
}

function Dashboard() {
  return <><div className="metric-grid"><div><span>Chiffre d'affaires</span><strong>0 DA</strong><small>Aucune vente</small></div><div><span>Commandes</span><strong>0</strong><small>Aucune commande</small></div><div><span>Panier moyen</span><strong>0 DA</strong><small>Pas encore calculé</small></div><div><span>Alertes</span><strong>0</strong><small>Tout est prêt</small></div></div><div className="admin-empty-state"><PackageCheck /><h2>Administration prête à démarrer</h2><p>Les nouvelles commandes et les données d'activité apparaîtront ici.</p></div></>;
}

function AdminProducts() {
  const { products, saveProduct, deleteProduct } = useStore();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Product | null>(null);
  const filtered = products.filter((product) => product.name.toLowerCase().includes(query.toLowerCase()));
  const emptyProduct = (): Product => ({ id: "", name: "", category: "Éveil", age: "0-2 ans", price: 0, rating: 5, reviews: 0, color: "#e8f1fb", sprite: 0, stock: 0, description: "", skills: [] });
  const close = () => setDraft(null);
  const uploadImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !draft) return;
    const reader = new FileReader();
    reader.onload = () => setDraft({ ...draft, imageUrl: String(reader.result) });
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    const id = draft.id || draft.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await saveProduct({ ...draft, id });
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
                <p>Téléversez une photo depuis ordinateur ou téléphone. Elle remplacera le visuel modèle.</p>
                <label className="upload-button"><ImagePlus /> Téléverser une photo<input accept="image/*" type="file" onChange={uploadImage} /></label>
                {draft.imageUrl && <button type="button" className="remove-photo" onClick={() => setDraft({ ...draft, imageUrl: undefined })}>Retirer la photo</button>}
              </div>
            </div>
            <div className="admin-form-grid">
              <label>Nom<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
              <label>Catégorie<input required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /></label>
              <label>Âge<select value={draft.age} onChange={(event) => setDraft({ ...draft, age: event.target.value })}>{ageGroups.slice(1).map((age) => <option key={age}>{age}</option>)}</select></label>
              <label>Prix (DA)<input required min="0" type="number" value={draft.price} onChange={(event) => setDraft({ ...draft, price: Number(event.target.value) })} /></label>
              <label>Ancien prix<input min="0" type="number" value={draft.oldPrice || ""} onChange={(event) => setDraft({ ...draft, oldPrice: event.target.value ? Number(event.target.value) : undefined })} /></label>
              <label>Stock<input required min="0" type="number" value={draft.stock} onChange={(event) => setDraft({ ...draft, stock: Number(event.target.value) })} /></label>
              <label>Badge<input value={draft.badge || ""} onChange={(event) => setDraft({ ...draft, badge: event.target.value || undefined })} /></label>
              <label>Visuel de secours<select value={draft.sprite} onChange={(event) => setDraft({ ...draft, sprite: Number(event.target.value) })}>{Array.from({ length: 8 }).map((_, index) => <option value={index} key={index}>Image produit {index + 1}</option>)}</select></label>
              <label className="wide">Description<textarea required rows={4} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label>
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
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft) return;
    if (draft.id) await saveUser(draft);
    else await createUser({ ...draft, id: crypto.randomUUID() }, password);
    setDraft(null);
    setPassword("");
  };
  const close = () => { setDraft(null); setPassword(""); };
  return <><section className="admin-table-card"><div className="admin-table-head"><div><span className="eyebrow">Accès internes</span><h2>{users.length} utilisateur{users.length > 1 ? "s" : ""}</h2></div><PressButton onClick={() => setDraft({ id: "", name: "", email: "", role: "employe", active: true })}><UserPlus /> Ajouter un utilisateur</PressButton></div><div className="user-table">{users.map((user) => <div className="user-row" key={user.id}><span>{user.name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div><em className={user.role}>{user.role === "admin" ? "Administrateur" : "Employé"}</em><b className={user.active ? "active" : "inactive"}>{user.active ? "Actif" : "Suspendu"}</b><div className="table-actions"><button onClick={() => setDraft(user)} aria-label={`Modifier ${user.name}`}><Pencil /></button><button className="danger" disabled={user.id === "yacine-admin"} onClick={() => deleteUser(user.id)} aria-label={`Supprimer ${user.name}`}><Trash2 /></button></div></div>)}</div></section>{draft && <div className="admin-modal-backdrop"><form className="admin-modal compact" onSubmit={submit}><div className="admin-modal-head"><div><span className="eyebrow">Équipe</span><h2>{draft.id ? "Modifier l'utilisateur" : "Nouvel utilisateur"}</h2></div><button type="button" onClick={close} aria-label="Fermer"><X /></button></div><div className="admin-form-grid"><label className="wide">Nom complet<input required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="wide">Adresse email<input required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>{!draft.id && <label className="wide">Mot de passe<input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="8 caractères minimum" /></label>}<label>Rôle<select value={draft.role} onChange={(event) => setDraft({ ...draft, role: event.target.value as AdminRole })}><option value="admin">Administrateur</option><option value="employe">Employé</option></select></label><label>Statut<select value={draft.active ? "active" : "inactive"} onChange={(event) => setDraft({ ...draft, active: event.target.value === "active" })}><option value="active">Actif</option><option value="inactive">Suspendu</option></select></label></div><div className="role-note">Le compte est créé directement avec le mot de passe défini ici. Aucun mot de passe n'est enregistré dans le navigateur.</div><div className="admin-modal-actions"><PressButton label="Annuler" type="button" variant="secondary" onClick={close} /><PressButton label="Créer l'utilisateur" type="submit" /></div></form></div>}</>;
}

function AdminOrders() {
  return <section className="admin-table-card"><div className="admin-table-head"><h2>Commandes</h2></div><div className="admin-empty-state small"><ShoppingCart /><h2>Aucune commande</h2><p>Les commandes des clients apparaîtront automatiquement ici.</p></div></section>;
}

function Newsletter() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  return <section className="newsletter"><div className="shell"><div><span className="eyebrow">Le petit courrier BECOM</span><h2>Des idées de jeux,<br />pas des emails ennuyeux.</h2></div>{joined ? <div className="newsletter-thanks"><Check /> Bienvenue dans la famille BECOM !</div> : <form onSubmit={(event) => { event.preventDefault(); if (email) setJoined(true); }}><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre adresse email" /><button className="button dark">Je m'inscris <ArrowRight /></button><small>Promis, seulement les belles nouvelles.</small></form>}</div></section>;
}

function Footer() {
  return <footer className="footer"><div className="shell footer-grid"><div className="footer-brand"><Logo /><p>Des jouets qui font grandir l'imagination, la confiance et les beaux souvenirs.</p><div><a href="#instagram" aria-label="Instagram"><Instagram /></a><a href="mailto:bonjour@becom.store" aria-label="Email"><Mail /></a></div></div><div><strong>Boutique</strong><Link to="/boutique">Tous les jouets</Link></div><div><strong>BECOM</strong><Link to="/a-propos">Notre histoire</Link><Link to="/contact">Contact</Link><Link to="/admin">Espace admin</Link><a href="#faq">Questions fréquentes</a></div><div><strong>Besoin d'aide ?</strong><a href="tel:+213550000000">+213 550 00 00 00</a><a href="mailto:bonjour@becom.store">bonjour@becom.store</a><span>Sam - Jeu · 9h - 18h</span></div></div><div className="shell footer-bottom"><span>© 2026 BECOM Store. Tous droits réservés.</span><span>Fait avec soin à Alger.</span></div></footer>;
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
  return <CartProvider>{isAdmin ? <Routes><Route path="/admin/*" element={<AdminPage />} /></Routes> : <StoreLayout />}</CartProvider>;
}
