# 🚀 Guide de Déploiement sur Netlify

## Méthode 1 : Via GitHub (RECOMMANDÉ)

### Étape 1 : Créer un repository GitHub

1. Allez sur https://github.com et connectez-vous
2. Cliquez sur le bouton **"New"** (ou "+" en haut à droite → "New repository")
3. Donnez un nom au repo (exemple : `jetboost-alternative`)
4. Laissez en **Public** ou **Private** (peu importe)
5. **NE COCHEZ PAS** "Add a README file"
6. Cliquez sur **"Create repository"**

### Étape 2 : Pousser votre code sur GitHub

Ouvrez votre terminal et copiez-collez ces commandes **UNE PAR UNE** :

```bash
cd ~/jetboost-alternative
git init
git add .
git commit -m "Initial commit"
```

Ensuite, GitHub vous donnera des commandes qui ressemblent à ça :

```bash
git remote add origin https://github.com/VOTRE-USERNAME/jetboost-alternative.git
git branch -M main
git push -u origin main
```

**Remplacez** `VOTRE-USERNAME` par votre nom d'utilisateur GitHub et exécutez ces commandes.

### Étape 3 : Connecter à Netlify

1. Allez sur https://app.netlify.com
2. Cliquez sur **"Add new site"** → **"Import an existing project"**
3. Choisissez **"Deploy with GitHub"**
4. Autorisez Netlify à accéder à GitHub
5. Sélectionnez votre repository `jetboost-alternative`
6. Configurez le build :
   - **Base directory** : `dashboard`
   - **Build command** : `npm run build`
   - **Publish directory** : `dashboard/.next`
   
7. **IMPORTANT** - Ajoutez les variables d'environnement :
   - Cliquez sur **"Show advanced"** → **"New variable"**
   - Ajoutez ces 3 variables :

   ```
   NEXT_PUBLIC_SUPABASE_URL = https://gxirlygjfsgnmwrmfhvt.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aXJseWdqZnNnbm13cm1maHZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExNTUxNzEsImV4cCI6MjA3NjczMTE3MX0.-JElZ1I6tTpO8U5WGOZESV5VyqN-RJp-YGk5qSZqnRM
   JWT_SECRET = super-secret-jwt-key-change-this-in-production-123456789
   ```

8. Cliquez sur **"Deploy site"**

⏳ Attendez 2-3 minutes... Et voilà ! Votre site sera en ligne !

---

## Méthode 2 : Déploiement Manuel (Plus simple mais moins pro)

### Option A : Via l'interface Netlify

1. Compressez le dossier `dashboard` en ZIP
2. Allez sur https://app.netlify.com
3. Glissez-déposez le ZIP sur la page

⚠️ **Problème** : Cette méthode ne marchera pas bien pour Next.js, il faut que Netlify builde le projet.

### Option B : Via Netlify CLI

```bash
# Installer Netlify CLI
npm install -g netlify-cli

# Se connecter
netlify login

# Déployer
cd ~/jetboost-alternative/dashboard
netlify deploy --prod
```

Suivez les instructions à l'écran.

---

## ⚠️ Problèmes fréquents

### "Build failed"
- Vérifiez que vous avez bien ajouté les 3 variables d'environnement
- Vérifiez que **Base directory** = `dashboard`

### "Page not found"
- Vérifiez que **Publish directory** = `dashboard/.next`

### "API errors"
- Vérifiez vos clés Supabase dans les variables d'environnement

---

## 📞 Besoin d'aide ?

Si ça ne marche pas, envoyez-moi :
1. Le message d'erreur exact
2. Des captures d'écran de votre configuration Netlify
3. L'URL de votre site Netlify

Bon déploiement ! 🎉
