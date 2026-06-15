# BECOM Store

Boutique de jouets React avec catalogue, panier, pages produits et espace d'administration.

## Fonctionnalités

- Boutique responsive avec filtres par âge et catégorie
- Panier persistant et parcours de commande
- Administration des produits : ajout, modification et suppression
- Gestion des utilisateurs internes avec rôles administrateur et employé
- Synchronisation Supabase REST avec repli local tant que les tables ne sont pas installées
- Déploiement automatique sur GitHub Pages

## Installation

```bash
npm install
npm run dev
```

## Supabase

1. Copier `.env.example` vers `.env.local` si nécessaire.
2. Exécuter `supabase/schema.sql` dans l'éditeur SQL Supabase.
3. Déployer la fonction `supabase/functions/create-admin-user` avec la variable secrète `SUPABASE_SERVICE_ROLE_KEY`.
4. Remplacer les politiques temporaires par des politiques liées à Supabase Auth avant la mise en production finale.

La fonction crée les comptes avec `email_confirm: true` : aucun email de confirmation n'est envoyé aux utilisateurs ajoutés depuis l'administration.

Le site reste fonctionnel en stockage local lorsque les tables Supabase ne sont pas encore disponibles.
