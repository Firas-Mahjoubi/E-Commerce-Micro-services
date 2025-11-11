# Améliorations Reviews - Un Avis par Produit + Modification

## ✅ Fonctionnalités Implémentées

### 1. 🔒 **Un Seul Avis par Produit**
Un utilisateur **ne peut créer qu'un seul avis par produit**. S'il essaie d'en créer un second, le système :
- ✅ Détecte automatiquement son avis existant
- ✅ Pré-remplit le formulaire avec ses données
- ✅ Passe en **mode modification** au lieu de création

### 2. ✏️ **Modification d'Avis Existant**
Quand un utilisateur a déjà fait un avis :
- ✅ Le titre change : "Modifier votre avis" (au lieu de "Rédiger un avis")
- ✅ Message info bleu : "Vous modifiez votre avis existant..."
- ✅ Bouton change : "Mettre à jour" (au lieu de "Publier l'avis")
- ✅ Les champs sont pré-remplis avec les valeurs actuelles
- ✅ L'API appelle `updateReview()` au lieu de `createReview()`

### 3. 👤 **Affichage du Nom et Email**
Au lieu de "Anonymous" :
- ✅ Affiche le **nom d'utilisateur** (userName)
- ✅ Affiche l'**email** (userEmail) en italique sous le nom
- ✅ Avatar avec la première lettre du nom ou email

## 🎯 Flux Utilisateur

### Scénario 1 : Premier Avis (Création)

1. **Client va sur un produit** → `/products/123`
2. **Clique sur "Write a Review"** → `/reviews/create/123`
3. **Voit le formulaire vide** :
   - Titre : "Rédiger un avis"
   - Pas de message info
   - Bouton : "Publier l'avis"
4. **Remplit le formulaire** :
   - Note : 5 étoiles
   - Titre : "Excellent produit"
   - Commentaire : "Très satisfait, je recommande"
5. **Soumet** → API: `POST /review`
6. **Succès** → Redirection vers le produit

### Scénario 2 : Modification d'Avis Existant

1. **Client a déjà fait un avis sur ce produit**
2. **Clique sur "Write a Review"** → `/reviews/create/123`
3. **Le système détecte l'avis existant** :
   - ✅ Charge l'avis : `getReviewsByProductId()` → Filtre par `userId`
   - ✅ Trouve l'avis : `existingReview = { id: 456, rating: 4, title: "Bon", ... }`
   - ✅ Active le mode édition : `isEditMode = true`
4. **Voit le formulaire pré-rempli** :
   - Titre : "Modifier votre avis"
   - Message info : "Vous modifiez votre avis existant. Vous ne pouvez avoir qu'un seul avis par produit."
   - Note : ★★★★☆ (4 étoiles déjà sélectionnées)
   - Titre : "Bon" (pré-rempli)
   - Commentaire : Texte existant (pré-rempli)
   - Bouton : "Mettre à jour"
5. **Modifie** :
   - Note : 5 étoiles (au lieu de 4)
   - Titre : "Excellent !" (au lieu de "Bon")
6. **Soumet** → API: `PUT /review/456`
7. **Succès** → Redirection vers le produit

## 🔍 Détection de l'Avis Existant

### Code TypeScript
```typescript
checkExistingReview(): void {
  const userId = this.currentUser?.sub || this.currentUser?.id;
  if (!userId) return;

  this.reviewService.getReviewsByProductId(this.productId).subscribe({
    next: (reviews) => {
      // Chercher un avis de cet utilisateur
      this.existingReview = reviews.find(r => r.userId === userId) || null;
      
      if (this.existingReview) {
        this.isEditMode = true;
        // Pré-remplir le formulaire
        this.reviewForm.patchValue({
          rating: this.existingReview.rating,
          title: this.existingReview.title,
          comment: this.existingReview.comment
        });
      }
    }
  });
}
```

### Soumission Intelligente
```typescript
// Détecte automatiquement si création ou modification
const apiCall = this.isEditMode && this.existingReview
  ? this.reviewService.updateReview(this.existingReview.id, reviewRequest)
  : this.reviewService.createReview(reviewRequest);
```

## 👥 Affichage Nom et Email

### Modèle de Données
```typescript
export interface Review {
  id: number;
  product: ProductInfo;
  userId: string;
  userName: string;
  userEmail?: string;  // ← NOUVEAU
  rating: number;
  // ...
}
```

### Template HTML
```html
<div class="user-info">
  <!-- Avatar avec première lettre -->
  <div class="avatar">{{ (review.userName || review.userEmail || 'A').charAt(0) }}</div>
  
  <div>
    <!-- Nom d'utilisateur -->
    <h4>{{ review.userName || 'Utilisateur' }}</h4>
    
    <!-- Email (si disponible) -->
    <p class="user-email" *ngIf="review.userEmail">{{ review.userEmail }}</p>
    
    <!-- Étoiles -->
    <div class="stars">...</div>
  </div>
</div>
```

### Style CSS
```css
.user-email {
  margin: 0 0 8px 0;
  font-size: 13px;
  color: #666;
  font-style: italic;
}
```

## 🎨 Interface Visuelle

### Mode Création (Nouveau)
```
┌─────────────────────────────────────────┐
│ Rédiger un avis                         │
├─────────────────────────────────────────┤
│ [Product Info]                          │
│                                         │
│ Votre note *                            │
│ ☆ ☆ ☆ ☆ ☆                               │
│                                         │
│ Titre de votre avis *                   │
│ [_____________________________]         │
│                                         │
│ Votre avis *                            │
│ [_____________________________]         │
│ [_____________________________]         │
│                                         │
│ [Annuler] [Publier l'avis]             │
└─────────────────────────────────────────┘
```

### Mode Modification (Existant)
```
┌─────────────────────────────────────────┐
│ Modifier votre avis                     │
├─────────────────────────────────────────┤
│ ℹ️ Vous modifiez votre avis existant.   │
│   Vous ne pouvez avoir qu'un seul avis  │
│   par produit.                          │
├─────────────────────────────────────────┤
│ [Product Info]                          │
│                                         │
│ Votre note *                            │
│ ★ ★ ★ ★ ☆  [4 / 5 étoiles]             │
│                                         │
│ Titre de votre avis *                   │
│ [Bon produit___________________]        │
│                                         │
│ Votre avis *                            │
│ [Je suis satisfait de mon achat]        │
│ [mais il y a quelques petits...]        │
│                                         │
│ [Annuler] [Mettre à jour]              │
└─────────────────────────────────────────┘
```

### Affichage de l'Avis (Avant/Après)

**❌ Avant (Anonymous)**
```
┌─────────────────────────────────────────┐
│ A   Anonymous                           │
│     ★★★★☆                               │
│                                         │
│     Excellent produit                   │
│     Je recommande vivement...           │
└─────────────────────────────────────────┘
```

**✅ Après (Nom + Email)**
```
┌─────────────────────────────────────────┐
│ J   Jean Dupont                         │
│     jean.dupont@example.com             │
│     ★★★★☆                               │
│                                         │
│     Excellent produit                   │
│     Je recommande vivement...           │
└─────────────────────────────────────────┘
```

## 📋 API Calls

### Vérification de l'Avis Existant
```
GET /api/review/product/{productId}
→ Retourne tous les avis du produit
→ Frontend filtre par userId
```

### Création (Premier Avis)
```
POST /api/review
Body: {
  productId: "123",
  userId: "user-456",
  rating: 5,
  title: "Excellent",
  comment: "Je recommande",
  verified: false
}
```

### Modification (Avis Existant)
```
PUT /api/review/{reviewId}
Body: {
  productId: "123",
  userId: "user-456",
  rating: 5,
  title: "Excellent !", 
  comment: "Je recommande fortement",
  verified: false
}
```

## 🧪 Tests

### Test 1 : Premier Avis
1. Connexion en tant que `user@test.com`
2. Aller sur produit 123 (jamais évalué)
3. Cliquer "Write a Review"
4. **Vérifier** : Titre = "Rédiger un avis"
5. **Vérifier** : Pas de message info bleu
6. **Vérifier** : Champs vides
7. Remplir et soumettre
8. **Résultat** : Avis créé avec `POST /review`

### Test 2 : Modification d'Avis
1. Connexion en tant que `user@test.com`
2. Aller sur produit 123 (déjà évalué par cet user)
3. Cliquer "Write a Review"
4. **Vérifier** : Titre = "Modifier votre avis"
5. **Vérifier** : Message info bleu visible
6. **Vérifier** : Champs pré-remplis
7. **Vérifier** : Bouton = "Mettre à jour"
8. Modifier la note et soumettre
9. **Résultat** : Avis modifié avec `PUT /review/456`

### Test 3 : Affichage Nom/Email
1. Créer un avis avec user "John Doe" (john@test.com)
2. Aller sur la liste des avis
3. **Vérifier** : Avatar = "J"
4. **Vérifier** : Nom = "John Doe"
5. **Vérifier** : Email = "john@test.com" (en italique)
6. **Vérifier** : Pas de "Anonymous"

## 🔒 Sécurité

### Validation Backend Requise
⚠️ **Important** : Le backend doit aussi vérifier :
```java
// Exemple Java Spring Boot
@PostMapping("/review")
public ResponseEntity<Review> createReview(@RequestBody ReviewRequest request) {
    // Vérifier si l'utilisateur a déjà un avis sur ce produit
    Optional<Review> existing = reviewRepository
        .findByProductIdAndUserId(request.getProductId(), request.getUserId());
    
    if (existing.isPresent()) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(null); // 409 Conflict
    }
    
    // Créer le nouvel avis
    Review review = reviewService.createReview(request);
    return ResponseEntity.ok(review);
}
```

### Contrainte Base de Données
```sql
-- PostgreSQL
ALTER TABLE reviews 
ADD CONSTRAINT unique_user_product 
UNIQUE (user_id, product_id);
```

## 📊 Résumé des Changements

### Fichiers Modifiés

1. **review.model.ts**
   - ✅ Ajout `userEmail?: string`

2. **create-review.component.ts**
   - ✅ Ajout `existingReview: Review | null`
   - ✅ Ajout `isEditMode: boolean`
   - ✅ Nouvelle méthode `checkExistingReview()`
   - ✅ Modification `onSubmit()` pour gérer création/modification

3. **create-review.component.html**
   - ✅ Titre dynamique : `{{ isEditMode ? 'Modifier' : 'Rédiger' }}`
   - ✅ Message info si `isEditMode`
   - ✅ Bouton dynamique : `{{ isEditMode ? 'Mettre à jour' : 'Publier' }}`

4. **create-review.component.css**
   - ✅ Ajout style `.info-message` (bleu clair)

5. **product-reviews.component.html**
   - ✅ Affichage `userName` et `userEmail`
   - ✅ Avatar avec première lettre

6. **product-reviews.component.css**
   - ✅ Ajout style `.user-email` (italique, gris)

## 🎯 Avantages

✅ **Pas de doublons** : Un user = un avis par produit  
✅ **UX fluide** : Modification transparente sans navigation complexe  
✅ **Données complètes** : Nom + Email au lieu de "Anonymous"  
✅ **Feedback clair** : Message info explicite en mode édition  
✅ **API RESTful** : POST pour créer, PUT pour modifier  
✅ **Code maintenable** : Logique centralisée dans `checkExistingReview()`  

---

**Version** : Multi-Avis Prevention + Edit Mode - Novembre 2025
