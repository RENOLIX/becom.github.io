alter table public.products
  add column if not exists color_label text,
  add column if not exists color_labels text,
  add column if not exists show_color boolean not null default false,
  add column if not exists pieces_count integer,
  add column if not exists show_pieces boolean not null default false;
