# API Documentation - Authentication & User Management

Cette documentation décrit tous les endpoints API pour l'authentification et la gestion des utilisateurs.

## Authentification requise

Tous les endpoints (sauf ceux dans `/api/auth/`) nécessitent une authentification. Le middleware vérifie automatiquement :
- La présence d'une session valide
- Les permissions basées sur les rôles
- Le statut de ban de l'utilisateur

## Endpoints d'administration

### GET `/api/admin/users`

Récupère la liste des utilisateurs avec pagination et filtres.

**Permissions requises :** `admin`

**Paramètres de requête :**
```
page: number = 1           # Numéro de page
pageSize: number = 20      # Taille de page (max 100)
role: string = null        # Filtre par rôle (admin, user, member, guest)
banned: boolean = null     # Filtre par statut (true/false)
search: string = null      # Recherche dans nom et email
```

**Réponse :**
```json
{
  "users": [
    {
      "id": "user123",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "banned": false,
      "banReason": null,
      "banExpires": null,
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-02T00:00:00Z"
    }
  ],
  "totalCount": 150,
  "totalPages": 8,
  "currentPage": 1,
  "pageSize": 20
}
```

### POST `/api/admin/users/ban`

Ban un utilisateur avec une raison et une date d'expiration optionnelle.

**Permissions requises :** `admin`

**Corps de la requête :**
```json
{
  "userId": "user123",
  "reason": "Violation des conditions d'utilisation",
  "expires": "2024-12-31T23:59:59Z"  // null pour permanent
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur banni avec succès"
}
```

**Erreurs :**
- `400` : Paramètres manquants ou invalides
- `404` : Utilisateur non trouvé
- `400` : Utilisateur déjà banni

### POST `/api/admin/users/unban`

Déban un utilisateur et supprime la raison du ban.

**Permissions requises :** `admin`

**Corps de la requête :**
```json
{
  "userId": "user123"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Utilisateur débanni avec succès"
}
```

### POST `/api/admin/users/role`

Change le rôle d'un utilisateur.

**Permissions requises :** `admin`

**Corps de la requête :**
```json
{
  "userId": "user123",
  "role": "admin"  // admin, user, member, guest
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Rôle mis à jour vers \"admin\" avec succès"
}
```

## Endpoints utilisateur

### GET `/api/user/profile`

Récupère le profil complet de l'utilisateur connecté.

**Permissions requises :** `admin`, `user`, `member`

**Réponse :**
```json
{
  "user": {
    "id": "user123",
    "name": "John Doe",
    "email": "john@example.com",
    "emailVerified": "2024-01-01T00:00:00Z",
    "role": "user",
    "banned": false,
    "banReason": null,
    "banExpires": null,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-02T00:00:00Z",
    "username": "johndoe",
    "displayUsername": "johndoe"
  },
  "sessionCount": 3,
  "isActive": true
}
```

### PUT `/api/user/profile`

Met à jour le profil de l'utilisateur connecté.

**Permissions requises :** `admin`, `user`, `member`

**Corps de la requête :**
```json
{
  "name": "John Smith"
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Profil mis à jour avec succès"
}
```

**Validations :**
- `name` : Minimum 2 caractères, maximum 100 caractères
- Les utilisateurs bannis ne peuvent pas modifier leur profil

### GET `/api/user/sessions`

Récupère toutes les sessions actives de l'utilisateur connecté.

**Permissions requises :** `admin`, `user`, `member`

**Réponse :**
```json
{
  "sessions": [
    {
      "id": "session123",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T01:00:00Z",
      "expiresAt": "2024-01-08T00:00:00Z",
      "ipAddress": "192.168.1.1",
      "userAgent": "Mozilla/5.0 ...",
      "isCurrent": false
    }
  ],
  "totalCount": 3
}
```

### DELETE `/api/user/sessions`

Révoque une ou toutes les sessions de l'utilisateur.

**Permissions requises :** `admin`, `user`, `member`

**Corps de la requête (option 1 - session spécifique) :**
```json
{
  "sessionId": "session123"
}
```

**Corps de la requête (option 2 - toutes les sessions) :**
```json
{
  "revokeAll": true
}
```

**Réponse :**
```json
{
  "success": true,
  "message": "Session révoquée avec succès"
}
```

## Gestion des erreurs

Tous les endpoints retournent des erreurs dans ce format :

```json
{
  "error": "Message d'erreur descriptif"
}
```

### Codes d'erreur courants

- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Permissions insuffisantes ou compte suspendu
- `404 Not Found` : Ressource non trouvée
- `400 Bad Request` : Paramètres invalides
- `500 Internal Server Error` : Erreur serveur

### Messages d'erreur spécifiques

**Authentification :**
- `"Authentification requise"` - Session expirée ou invalide
- `"Permissions insuffisantes"` - Rôle insuffisant pour l'action
- `"Compte suspendu"` - Utilisateur banni

**Validation :**
- `"userId et reason sont requis"` - Paramètres manquants pour le ban
- `"Date d'expiration invalide"` - Format de date incorrect
- `"Nom invalide (minimum 2 caractères)"` - Validation du nom

**Logique métier :**
- `"Utilisateur non trouvé"` - ID utilisateur inexistant
- `"Utilisateur déjà banni"` - Tentative de ban d'un utilisateur déjà banni
- `"L'utilisateur a déjà ce rôle"` - Tentative d'assignation du même rôle

## Exemples d'utilisation

### JavaScript/Fetch

```javascript
// Récupérer la liste des utilisateurs (admin)
const response = await fetch('/api/admin/users?page=1&role=user&search=john');
const data = await response.json();

// Bannir un utilisateur
await fetch('/api/admin/users/ban', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user123',
    reason: 'Spam',
    expires: null // ban permanent
  })
});

// Mettre à jour son profil
await fetch('/api/user/profile', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nouveau nom'
  })
});
```

### cURL

```bash
# Lister les utilisateurs bannis (admin requis)
curl -X GET "/api/admin/users?banned=true" \
  -H "Cookie: your-session-cookie"

# Débannir un utilisateur
curl -X POST "/api/admin/users/unban" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie" \
  -d '{"userId": "user123"}'

# Récupérer son profil
curl -X GET "/api/user/profile" \
  -H "Cookie: your-session-cookie"
```

## Sécurité

### Protection CSRF
- Utilisez les cookies de session pour l'authentification
- Évitez les tokens dans les headers pour les requêtes sensibles

### Rate Limiting
- Implémentez un rate limiting sur les endpoints sensibles
- Limitez les tentatives de ban/unban par IP

### Validation des données
- Tous les endpoints valident les paramètres d'entrée
- Les erreurs de validation sont détaillées pour le debug

### Audit Trail
- Les actions d'administration sont loggées
- Surveillez les logs pour les actions suspectes

## Intégration frontend

### React/Vue/Angular

```javascript
// Service API générique
class UserAPI {
  async getUsers(filters = {}) {
    const params = new URLSearchParams(filters);
    const response = await fetch(`/api/admin/users?${params}`);
    return response.json();
  }
  
  async banUser(userId, reason, expires = null) {
    const response = await fetch('/api/admin/users/ban', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, reason, expires })
    });
    return response.json();
  }
  
  async updateProfile(data) {
    const response = await fetch('/api/user/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
}
```

### Gestion des erreurs

```javascript
async function handleAPICall(apiCall) {
  try {
    const response = await apiCall();
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur inconnue');
    }
    return await response.json();
  } catch (error) {
    console.error('API Error:', error.message);
    // Afficher un message d'erreur à l'utilisateur
    showError(error.message);
  }
}
```