# Guide de Déploiement sur Netlify

## Prérequis

- Un compte [Netlify](https://netlify.com)
- Un compte [Supabase](https://supabase.com) avec les tables créées
- Un repository GitHub avec ce code

## Étape 1: Préparer Supabase

1. Connectez-vous à [Supabase](https://supabase.com/dashboard)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Allez dans "SQL Editor"
4. Copiez le contenu du fichier `SUPABASE_SCHEMA.sql`
5. Collez-le dans l'éditeur SQL et cliquez sur "Run"
6. Vérifiez que les tables ont été créées dans "Table Editor"

## Étape 2: Récupérer les credentials Supabase

1. Dans votre projet Supabase, allez dans "Settings" > "API"
2. Notez:
   - **Project URL** (ex: https://xxxxx.supabase.co)
   - **anon/public key** (commence par eyJ...)

## Étape 3: Déployer sur Netlify

### Option A: Déploiement via GitHub

1. Poussez votre code sur GitHub
2. Connectez-vous à [Netlify](https://app.netlify.com)
3. Cliquez sur "Add new site" > "Import an existing project"
4. Sélectionnez "GitHub" et autorisez Netlify
5. Choisissez votre repository
6. Configurez les paramètres de build:
   - **Base directory**: `dashboard`
   - **Build command**: `npm run build`
   - **Publish directory**: `dashboard/.next`
7. Ajoutez les variables d'environnement:
   - `NEXT_PUBLIC_SUPABASE_URL`: votre URL Supabase
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: votre clé anon Supabase
   - `JWT_SECRET`: générez une chaîne aléatoire sécurisée (32+ caractères)
8. Cliquez sur "Deploy site"

### Option B: Déploiement via Netlify CLI

1. Installez Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Connectez-vous:
   ```bash
   netlify login
   ```

3. Dans le dossier `dashboard`, créez un fichier `netlify.toml`:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"
   ```

4. Déployez:
   ```bash
   cd dashboard
   netlify deploy --prod
   ```

5. Configurez les variables d'environnement via le dashboard Netlify

## Étape 4: Configurer les variables d'environnement

Dans le dashboard Netlify:

1. Allez dans "Site settings" > "Environment variables"
2. Ajoutez les variables suivantes:

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=votre-secret-jwt-tres-securise-32-caracteres-minimum
```

**Important**: Le `JWT_SECRET` doit être une chaîne aléatoire sécurisée. Vous pouvez en générer une avec:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Étape 5: Vérifier le déploiement

1. Une fois le déploiement terminé, Netlify vous donnera une URL (ex: https://votre-site.netlify.app)
2. Ouvrez cette URL dans votre navigateur
3. Créez un projet de test
4. Vérifiez que vous pouvez générer le code d'intégration

## Étape 6: Intégrer dans Webflow

1. Dans votre dashboard déployé, créez un projet pour votre site Webflow
2. Copiez le code d'intégration
3. Dans Webflow:
   - Allez dans Project Settings > Custom Code
   - Collez le code dans "Footer Code"
   - **Important**: Remplacez `window.location.origin` dans le code par votre URL Netlify réelle
4. Publiez votre site Webflow

## Dépannage

### Le site ne se charge pas

- Vérifiez que toutes les variables d'environnement sont correctement configurées
- Vérifiez les logs de build dans Netlify
- Assurez-vous que le fichier `netlify.toml` est correct

### Erreurs 400/500 lors de la création de projets

- Vérifiez que les tables Supabase ont été créées correctement
- Vérifiez que l'URL et la clé Supabase sont correctes
- Vérifiez les logs dans Supabase Dashboard > Logs

### Le widget ne fonctionne pas dans Webflow

- Vérifiez que le code du widget utilise la bonne URL (votre URL Netlify, pas localhost)
- Ouvrez la console du navigateur pour voir les erreurs
- Vérifiez que l'API key du projet est correcte

## Mises à jour

Pour mettre à jour votre déploiement:

1. Poussez vos changements sur GitHub
2. Netlify redéploiera automatiquement
3. Ou utilisez `netlify deploy --prod` avec la CLI

## Domaine personnalisé

Pour utiliser votre propre domaine:

1. Dans Netlify, allez dans "Domain settings"
2. Cliquez sur "Add custom domain"
3. Suivez les instructions pour configurer vos DNS
4. Netlify configurera automatiquement HTTPS

## Performance

Netlify offre:
- CDN global
- HTTPS automatique
- Déploiements atomiques
- Rollback instantané
- Edge functions (si nécessaire)

## Limites gratuites

Netlify gratuit inclut:
- 100 GB de bande passante/mois
- 300 minutes de build/mois
- Déploiements illimités
- HTTPS automatique

Supabase gratuit inclut:
- 500 MB de base de données
- 50,000 utilisateurs actifs mensuels
- 2 GB de stockage
- 5 GB de bande passante

## Support

Si vous rencontrez des problèmes:
1. Vérifiez les logs Netlify
2. Vérifiez les logs Supabase
3. Vérifiez la console du navigateur
4. Consultez la documentation Netlify et Supabase
