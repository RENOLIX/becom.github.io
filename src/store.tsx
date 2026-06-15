import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { products as initialProducts, type Product } from "./data";
import { createSupabaseAdminUser, getAdminSession, supabaseRequest } from "./lib/supabase";

export type AdminRole = "admin" | "employe";
export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  active: boolean;
};

type StoreValue = {
  products: Product[];
  users: AdminUser[];
  syncMode: "local" | "supabase";
  saveProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  saveUser: (user: AdminUser) => Promise<void>;
  createUser: (user: AdminUser, password: string) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
};

const defaultUsers: AdminUser[] = [];

const StoreContext = createContext<StoreValue | null>(null);
const readLocal = <T,>(key: string, fallback: T): T => {
  try { return JSON.parse(localStorage.getItem(key) || "") as T; } catch { return fallback; }
};

const normalizeImageUrl = (product: Product) => product.imageUrls?.length
  ? JSON.stringify(product.imageUrls)
  : product.imageUrl ?? null;

const parseImageUrls = (value: unknown) => {
  if (!value) return { imageUrl: undefined, imageUrls: undefined };
  const raw = String(value);
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) {
      const urls = parsed.map(String).filter(Boolean);
      return { imageUrl: urls[0], imageUrls: urls.length ? urls : undefined };
    }
  } catch {
    // Plain URL from older products.
  }
  return { imageUrl: raw, imageUrls: undefined };
};

const toProductRow = (product: Product) => ({
  id: product.id, name: product.name, category: product.category, age: product.age,
  price: product.price, old_price: product.oldPrice ?? null, rating: product.rating,
  reviews: product.reviews, badge: product.badge ?? null, color: product.color,
  image_url: normalizeImageUrl(product), sprite: product.sprite, stock: product.stock, description: product.description, skills: product.skills,
});

const fromProductRow = (row: Record<string, unknown>): Product => {
  const images = parseImageUrls(row.image_url);
  return {
    id: String(row.id), name: String(row.name), category: String(row.category), age: String(row.age),
    price: Number(row.price), oldPrice: row.old_price == null ? undefined : Number(row.old_price),
    rating: Number(row.rating), reviews: Number(row.reviews), badge: row.badge ? String(row.badge) : undefined,
    color: String(row.color), ...images, sprite: Number(row.sprite), stock: Number(row.stock),
    description: String(row.description), skills: Array.isArray(row.skills) ? row.skills.map(String) : [],
  };
};

export function StoreProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => readLocal("becom-products", initialProducts));
  const [users, setUsers] = useState<AdminUser[]>(() => readLocal("becom-admin-users-v2", defaultUsers));
  const [syncMode, setSyncMode] = useState<"local" | "supabase">("local");

  useEffect(() => {
    supabaseRequest<Record<string, unknown>[]>("products?select=*&order=name")
      .then((remoteProducts) => {
        if (remoteProducts.length) setProducts(remoteProducts.map(fromProductRow));
        setSyncMode("supabase");
      })
      .catch(() => setSyncMode("local"));

    if (getAdminSession()) {
      supabaseRequest<AdminUser[]>("admin_users?select=*&order=name")
        .then((remoteUsers) => {
          if (remoteUsers.length) setUsers(remoteUsers);
        })
        .catch(() => undefined);
    }
  }, []);

  useEffect(() => localStorage.setItem("becom-products", JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem("becom-admin-users-v2", JSON.stringify(users)), [users]);

  const saveProduct = async (product: Product) => {
    setProducts((current) => current.some((item) => item.id === product.id)
      ? current.map((item) => item.id === product.id ? product : item)
      : [product, ...current]);
    try {
      await supabaseRequest("products?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(toProductRow(product)) });
      setSyncMode("supabase");
    } catch { setSyncMode("local"); }
  };

  const deleteProduct = async (id: string) => {
    setProducts((current) => current.filter((item) => item.id !== id));
    try { await supabaseRequest(`products?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" }); } catch { setSyncMode("local"); }
  };

  const saveUser = async (user: AdminUser) => {
    setUsers((current) => current.some((item) => item.id === user.id)
      ? current.map((item) => item.id === user.id ? user : item)
      : [user, ...current]);
    try {
      await supabaseRequest("admin_users?on_conflict=id", { method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=representation" }, body: JSON.stringify(user) });
      setSyncMode("supabase");
    } catch { setSyncMode("local"); }
  };

  const createUser = async (user: AdminUser, password: string) => {
    let nextUser = user;
    try {
      const account = await createSupabaseAdminUser({ name: user.name, email: user.email, password, role: user.role });
      nextUser = { ...user, id: account.id };
      setSyncMode("supabase");
    } catch { setSyncMode("local"); }
    await saveUser(nextUser);
  };

  const deleteUser = async (id: string) => {
    setUsers((current) => current.filter((item) => item.id !== id));
    try { await supabaseRequest(`admin_users?id=eq.${encodeURIComponent(id)}`, { method: "DELETE" }); } catch { setSyncMode("local"); }
  };

  return <StoreContext.Provider value={{ products, users, syncMode, saveProduct, deleteProduct, saveUser, createUser, deleteUser }}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) throw new Error("StoreProvider absent");
  return value;
}
