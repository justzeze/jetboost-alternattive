# Jetboost Alternative - Free Webflow Authentication & Wishlists

Une alternative 100% gratuite à Jetboost pour ajouter l'authentification et les wishlists à vos sites Webflow.

## 🎯 Caractéristiques

- ✅ Authentification utilisateur complète (inscription, connexion, déconnexion)
- ✅ Système de wishlists
- ✅ Dashboard de gestion avec statistiques en temps réel
- ✅ Générateur de code d'intégration
- ✅ Widget JavaScript facile à intégrer
- ✅ 100% gratuit et hébergeable sur votre propre infrastructure
- ✅ Données stockées dans votre propre base Supabase

## 💰 Économies

- **Jetboost**: 30-150€/mois
- **Cette solution**: 0€/mois (jusqu'à 50k utilisateurs avec Supabase gratuit)
- **Économie annuelle**: 350-1,800€

## 🚀 Installation

### 1. Configuration de Supabase

1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Allez dans "SQL Editor" et exécutez le script `SUPABASE_SCHEMA.sql`
4. Notez votre URL Supabase et votre clé anon

### 2. Configuration de l'application

1. Clonez ce repository
2. Installez les dépendances:
   ```bash
   cd dashboard
   npm install
   ```

3. Créez un fichier `.env.local` avec vos credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre-url-supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre-cle-anon
   JWT_SECRET=votre-secret-jwt-securise
   ```

4. Lancez le serveur de développement:
   ```bash
   npm run dev
   ```

5. Ouvrez http://localhost:3000

### 3. Déploiement sur Netlify

1. Connectez votre repository GitHub à Netlify
2. Configurez les variables d'environnement dans Netlify:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `JWT_SECRET`

3. Build settings:
   - Build command: `cd dashboard && npm run build`
   - Publish directory: `dashboard/.next`

4. Déployez!

## 📝 Utilisation

### 1. Créer un projet

1. Ouvrez votre dashboard
2. Cliquez sur "New Project"
3. Entrez le nom et le domaine de votre site Webflow
4. Copiez l'API key générée

### 2. Intégrer le widget dans Webflow

1. Dans votre dashboard, allez dans l'onglet "Integration Code"
2. Copiez le code du widget
3. Dans Webflow, allez dans Project Settings > Custom Code
4. Collez le code avant la balise `</body>`
5. Publiez votre site

### 3. Ajouter l'authentification

```html
<!-- Formulaire de connexion -->
<form id="login-form">
  <input type="email" id="email" placeholder="Email" required>
  <input type="password" id="password" placeholder="Mot de passe" required>
  <button type="submit">Se connecter</button>
</form>

<script>
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  const result = await Jetboost.login(email, password);
  if (result.success) {
    console.log('Connecté!', result.user);
    // Rediriger ou afficher un message
  }
});
</script>
```

### 4. Ajouter des wishlists

```html
<!-- Bouton wishlist -->
<button onclick="toggleWishlist('product-123')" id="wishlist-btn">
  Ajouter à la wishlist
</button>

<script>
async function toggleWishlist(itemId) {
  if (!Jetboost.isAuthenticated()) {
    alert('Veuillez vous connecter');
    return;
  }
  
  const inWishlist = await Jetboost.isInWishlist(itemId);
  
  if (inWishlist) {
    await Jetboost.removeFromWishlist(itemId);
    document.getElementById('wishlist-btn').textContent = 'Ajouter à la wishlist';
  } else {
    await Jetboost.addToWishlist(itemId, { 
      name: 'Nom du produit',
      price: 99.99,
      image: 'url-image.jpg'
    });
    document.getElementById('wishlist-btn').textContent = 'Retirer de la wishlist';
  }
}
</script>
```

## 🔧 API Widget

### Méthodes disponibles

#### Authentification

- `Jetboost.register(email, password, firstName, lastName)` - Inscription
- `Jetboost.login(email, password)` - Connexion
- `Jetboost.logout()` - Déconnexion
- `Jetboost.isAuthenticated()` - Vérifier si l'utilisateur est connecté
- `Jetboost.getUser()` - Obtenir l'utilisateur actuel
- `Jetboost.getCurrentUser()` - Recharger les données utilisateur

#### Wishlists

- `Jetboost.addToWishlist(itemId, itemData)` - Ajouter un item
- `Jetboost.removeFromWishlist(itemId)` - Retirer un item
- `Jetboost.isInWishlist(itemId)` - Vérifier si un item est dans la wishlist
- `Jetboost.getWishlist()` - Obtenir tous les items de la wishlist
- `Jetboost.loadWishlist()` - Recharger la wishlist

### Événements

Écoutez les événements du widget:

```javascript
// Quand le widget est prêt
window.addEventListener('jetboost:ready', (e) => {
  console.log('Widget prêt', e.detail);
});

// Quand l'utilisateur se connecte
window.addEventListener('jetboost:auth:login', (e) => {
  console.log('Utilisateur connecté', e.detail);
});

// Quand l'utilisateur se déconnecte
window.addEventListener('jetboost:auth:logout', () => {
  console.log('Utilisateur déconnecté');
});

// Quand la wishlist est mise à jour
window.addEventListener('jetboost:wishlist:updated', (e) => {
  console.log('Wishlist mise à jour', e.detail);
});

// Quand un item est ajouté
window.addEventListener('jetboost:wishlist:added', (e) => {
  console.log('Item ajouté', e.detail);
});

// Quand un item est retiré
window.addEventListener('jetboost:wishlist:removed', (e) => {
  console.log('Item retiré', e.detail);
});
```

## 📊 Dashboard

Le dashboard vous permet de:

- Gérer plusieurs projets Webflow
- Voir les statistiques en temps réel (utilisateurs, wishlists, connexions)
- Générer le code d'intégration
- Copier facilement les exemples de code

## 🔒 Sécurité

- Mots de passe hashés avec bcrypt
- Sessions JWT avec expiration
- Tokens stockés de manière sécurisée
- Row Level Security sur Supabase
- CORS configuré correctement

## 🆘 Support

Pour toute question ou problème:
1. Vérifiez que le script SQL a été exécuté dans Supabase
2. Vérifiez que les variables d'environnement sont correctement configurées
3. Vérifiez la console du navigateur pour les erreurs

## 📄 Licence

MIT - Utilisez librement pour vos projets personnels et commerciaux!
