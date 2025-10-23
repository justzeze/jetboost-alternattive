# 🚀 Guide de Démarrage Rapide

## En 5 minutes, ajoutez l'authentification et les wishlists à votre site Webflow!

### Étape 1: Créer les tables Supabase (2 min)

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet
3. Cliquez sur "SQL Editor" dans le menu de gauche
4. Copiez tout le contenu du fichier `SUPABASE_SCHEMA.sql`
5. Collez-le dans l'éditeur SQL
6. Cliquez sur "Run" ou appuyez sur Ctrl+Enter
7. ✅ Vos tables sont créées!

### Étape 2: Tester localement (1 min)

```bash
cd dashboard
npm install
npm run dev
```

Ouvrez http://localhost:3000 et créez votre premier projet!

### Étape 3: Déployer sur Netlify (2 min)

#### Option rapide - Netlify CLI:

```bash
npm install -g netlify-cli
netlify login
cd dashboard
netlify deploy --prod
```

Quand demandé, configurez:
- Build command: `npm run build`
- Publish directory: `.next`

#### Option GitHub:

1. Poussez votre code sur GitHub
2. Allez sur https://app.netlify.com
3. "Add new site" > "Import from Git"
4. Sélectionnez votre repo
5. Build settings:
   - Base directory: `dashboard`
   - Build command: `npm run build`
   - Publish directory: `dashboard/.next`

### Étape 4: Configurer les variables d'environnement

Dans Netlify (Site settings > Environment variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=generer-une-cle-securisee-32-caracteres
```

💡 **Générer un JWT_SECRET sécurisé:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Étape 5: Intégrer dans Webflow (30 sec)

1. Dans votre dashboard déployé, créez un projet
2. Copiez le code d'intégration (onglet "Integration Code")
3. Dans Webflow: Project Settings > Custom Code > Footer Code
4. Collez le code
5. Publiez!

## 🎉 C'est tout!

Votre site Webflow a maintenant:
- ✅ Authentification complète
- ✅ Système de wishlists
- ✅ Dashboard de gestion
- ✅ Statistiques en temps réel

## 📖 Exemples de code

### Formulaire de connexion

```html
<form id="login-form">
  <input type="email" id="email" placeholder="Email">
  <input type="password" id="password" placeholder="Mot de passe">
  <button type="submit">Se connecter</button>
</form>

<script>
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const result = await Jetboost.login(
    document.getElementById('email').value,
    document.getElementById('password').value
  );
  if (result.success) {
    window.location.href = '/dashboard';
  } else {
    alert(result.error);
  }
});
</script>
```

### Bouton Wishlist

```html
<button onclick="toggleWishlist('product-123')" id="wishlist-btn">
  ❤️ Ajouter à la wishlist
</button>

<script>
async function toggleWishlist(itemId) {
  if (!Jetboost.isAuthenticated()) {
    alert('Connectez-vous d\'abord!');
    return;
  }
  
  if (await Jetboost.isInWishlist(itemId)) {
    await Jetboost.removeFromWishlist(itemId);
    document.getElementById('wishlist-btn').textContent = '❤️ Ajouter à la wishlist';
  } else {
    await Jetboost.addToWishlist(itemId, {
      name: 'Nom du produit',
      price: 99.99
    });
    document.getElementById('wishlist-btn').textContent = '💔 Retirer de la wishlist';
  }
}
</script>
```

### Afficher la wishlist

```html
<div id="wishlist-container"></div>

<script>
window.addEventListener('jetboost:ready', async () => {
  if (Jetboost.isAuthenticated()) {
    const items = await Jetboost.getWishlist();
    const container = document.getElementById('wishlist-container');
    
    container.innerHTML = items.map(item => `
      <div class="wishlist-item">
        <h3>${item.itemData.name}</h3>
        <p>${item.itemData.price}€</p>
        <button onclick="Jetboost.removeFromWishlist('${item.itemId}')">
          Retirer
        </button>
      </div>
    `).join('');
  }
});
</script>
```

## 🆘 Besoin d'aide?

- 📚 Consultez le [README.md](README.md) pour la documentation complète
- 🚀 Voir [DEPLOYMENT.md](DEPLOYMENT.md) pour le guide de déploiement détaillé
- 🐛 Vérifiez la console du navigateur pour les erreurs
- 📊 Consultez les logs Supabase et Netlify

## 💡 Astuces

1. **Testez d'abord localement** avant de déployer
2. **Utilisez les événements** pour réagir aux changements d'état
3. **Personnalisez le style** des formulaires selon votre design
4. **Ajoutez des validations** côté client pour une meilleure UX
5. **Utilisez itemData** pour stocker des infos supplémentaires dans les wishlists

## 🎯 Prochaines étapes

- Personnalisez le dashboard avec votre branding
- Ajoutez des champs personnalisés aux utilisateurs
- Créez des pages protégées dans Webflow
- Ajoutez des notifications email
- Intégrez avec d'autres services (Stripe, Mailchimp, etc.)

Bon développement! 🚀
