# Flavora — API Reference

REST API for the Flavora recipe platform. Base URL: `http://localhost:5000/api`.

## Conventions

### Authentication

- Most endpoints require an `Authorization: Bearer <token>` header.
- Tokens are issued by `POST /api/auth/register` and `POST /api/auth/login`.
- **401 Unauthorized** — missing or invalid token.
- **403 Forbidden** — valid token, but insufficient role or ownership.

### Response Envelope

Every endpoint returns the same shape:

```json
{
  "success": true,
  "message": "Human-readable message",
  "data": {}
}
```

- `success: false` on errors with `data: null`.
- Roles: `USER` | `ADMIN`. Statuses: `ACTIVE` | `INACTIVE` | `ARCHIVED`. Visibility: `PUBLIC` | `PRIVATE`.
- All deletes are **soft deletes** (`isDeleted = true`) unless noted; deleted rows are excluded from default queries.

### Common errors

| Status | Meaning |
|---|---|
| `400` | Validation failed / bad body |
| `401` | No token / invalid token |
| `403` | Wrong role or not the resource owner |
| `404` | Resource not found or soft-deleted |
| `409` | Duplicate (e.g. email, category name) |
| `500` | Unexpected server error |

---

## Auth

### `POST /api/auth/register`

Create a user. If `email` matches `ADMIN_EMAIL` (case-insensitive), role is `ADMIN`, otherwise `USER`.

**Request body:**

```json
{ "name": "Alice", "email": "alice@example.com", "password": "secret123" }
```

**Success `201`:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": { "token": "<jwt>", "user": { "id": "...", "name": "Alice", "email": "alice@example.com", "role": "USER", "status": "ACTIVE", "isDeleted": false, "createdAt": "...", "updatedAt": "..." } }
}
```

**Errors:** `400` missing name/email/password · `409` email already registered.

### `POST /api/auth/login`

Authenticate and receive a token. Wrong credentials return a generic `401` (no user-enumeration hints). Role is re-synced against `ADMIN_EMAIL` on each login.

**Request body:**

```json
{ "email": "alice@example.com", "password": "secret123" }
```

**Success `200`:** same `data` shape as register (`{ token, user }`).

**Errors:** `400` missing email/password · `401` invalid credentials.

---

## Users

All user routes are prefixed `/api/users`. `verifyUser` allows the resource owner **or** any `ADMIN`.

### `GET /api/users` — [ADMIN]

List non-deleted users, paginated.

**Query params:** `?page=` (default 1) · `?limit=` (default 10, max 100).

**Success `200`:**

```json
{ "success": true, "message": "Users retrieved successfully", "data": { "users": [ { "id": "...", "name": "Alice", "email": "alice@example.com", "role": "USER", "status": "ACTIVE", "isDeleted": false, "createdAt": "...", "updatedAt": "..." } ], "total": 1, "page": 1, "limit": 10 } }
```

**Errors:** `401` · `403` non-admin.

### `GET /api/users/:id` — [AUTH, self or admin]

Fetch one non-deleted user (password excluded).

**Success `200`:** `data` is the user object (no `token`).

**Errors:** `401` · `403` not self and not admin · `404` missing/deleted.

### `PUT /api/users/:id` — [AUTH, self or admin]

Update own profile fields. `role` cannot be changed here.

**Request body:**

```json
{ "name": "Alicia" }
```

**Success `200`:** `data` is the updated user object.

**Errors:** `401` · `403` · `404`.

### `PUT /api/users/:id/role` — [ADMIN]

Change a target user's role.

**Request body:**

```json
{ "role": "ADMIN" }
```

**Success `200`:** `data` is the updated user object.

**Errors:** `400` invalid role / cannot demote the last admin / admin cannot demote self · `401` · `403` · `404`.

### `DELETE /api/users/:id` — [ADMIN]

Soft delete a user (`isDeleted = true`, `status = ARCHIVED`). Deleted users can no longer log in and are excluded from listings.

**Success `200`:**

```json
{ "success": true, "message": "User deleted successfully", "data": null }
```

**Errors:** `401` · `403` · `404`.

---

## Categories

All category routes are prefixed `/api/categories`.

### `POST /api/categories` — [ADMIN]

**Request body:**

```json
{ "name": "Desserts" }
```

**Success `201`:** `data` is the created category (`{ id, name, status: "ACTIVE", ... }`).

**Errors:** `400` missing name · `401` · `403` · `409` duplicate name.

### `GET /api/categories` — [PUBLIC]

List non-deleted, `ACTIVE` categories, ordered by name.

**Query params:** `?includeInactive=true` (admin only — returns inactive/archived too; `403` for non-admin).

**Success `200`:** `data` is an array of category objects.

### `GET /api/categories/:id` — [PUBLIC]

**Success `200`:** `data` is the category.

**Errors:** `404` missing/deleted.

### `PUT /api/categories/:id` — [ADMIN]

Update `name` and/or `status`.

**Request body:**

```json
{ "name": "Desserts & Sweets", "status": "ACTIVE" }
```

**Success `200`:** `data` is the updated category.

**Errors:** `400` invalid status · `401` · `403` · `404` · `409` name in use.

### `DELETE /api/categories/:id` — [ADMIN]

Soft delete. Recipes referencing the category remain intact (no cascade).

**Success `200`:** `data: null`.

**Errors:** `401` · `403` · `404`.

---

## Recipes

All recipe routes are prefixed `/api/recipes`.

### `POST /api/recipes` — [AUTH]

Create a recipe. `authorId` is taken from the token.

**Request body:**

```json
{
  "title": "Chicken Curry",
  "description": "A spicy classic",
  "ingredients": ["chicken", "spices"],
  "instructions": "Cook and serve",
  "categoryId": "<category-id>",
  "image": "https://..." 
}
```

`visibility` defaults to `PUBLIC`; `isUnpublishedByAdmin` defaults to `false`.

**Success `201`:** `data` is the created recipe (includes `author: { id, name, email }` and `category: { id, name }`).

**Errors:** `400` missing/invalid fields · `401` · `404` category not found.

### `GET /api/recipes` — [PUBLIC]

List public recipes. **Base filter is always applied:** `isDeleted = false AND visibility = 'PUBLIC' AND isUnpublishedByAdmin = false`.

**Query params** (all combinable):

| Param | Description |
|---|---|
| `search` | Case-insensitive title `contains` |
| `categoryId` | Filter by category |
| `sort` | `newest` (default) or `oldest` |
| `page` | Default 1 |
| `limit` | Default 10, max 100 |

**Success `200`:**

```json
{ "success": true, "message": "Recipes retrieved successfully", "data": { "recipes": [ { "id": "...", "title": "Chicken Curry", "description": "...", "ingredients": ["chicken", "spices"], "instructions": "...", "image": null, "visibility": "PUBLIC", "isUnpublishedByAdmin": false, "status": "ACTIVE", "authorId": "...", "createdAt": "...", "updatedAt": "...", "author": { "id": "...", "name": "Alice", "email": "alice@example.com" }, "category": { "id": "...", "name": "Chicken" } } ], "total": 1, "page": 1, "limit": 10 } }
```

**Errors:** `400` invalid page/limit or `sort` not `newest`/`oldest`.

### `GET /api/recipes/:id` — [PUBLIC*]

Fetch a recipe. Includes `reviews` (non-deleted, newest first). Public recipes are visible to anyone; private or admin-unpublished recipes require owner or admin (else `403`).

**Success `200`:** `data` is the recipe with a `reviews` array.

**Errors:** `403` private/unpublished and not owner/admin · `404` missing/deleted.

### `GET /api/recipes/mine` — [AUTH]

List the caller's non-deleted recipes, regardless of visibility.

**Success `200`:** `data` is an array of the caller's recipes.

**Errors:** `401`.

### `GET /api/recipes/favorites/mine` — [AUTH]

List the caller's favorited recipes (joined through `Favorite`, newest favorite first). Excludes any recipe now soft-deleted.

**Success `200`:** `data` is an array of favorited recipes (full recipe shape).

**Errors:** `401`.

### `GET /api/recipes/admin` — [ADMIN]

List ALL non-deleted recipes regardless of visibility or unpublished state, with author, category, and counts.

**Query params:** `?page=` · `?limit=`.

**Success `200`:** `data` is `{ recipes: [...each recipe with _count: { reviews, favoritedBy }], total, page, limit }`.

**Errors:** `401` · `403` non-admin.

### `PUT /api/recipes/:id` — [AUTH, owner]

Update recipe content fields. Only the owner (or admin) may edit.

**Request body** (any subset):

```json
{ "title": "...", "description": "...", "ingredients": ["..."], "instructions": "...", "categoryId": "...", "image": "..." }
```

**Success `200`:** `data` is the updated recipe.

**Errors:** `400` at least one field / empty title or description / empty instructions / bad ingredients / bad image · `401` · `403` · `404`.

### `PUT /api/recipes/:id/visibility` — [AUTH, owner]

Change visibility.

**Request body:**

```json
{ "visibility": "PRIVATE" }
```

**Success `200`:** `data` is the updated recipe.

**Errors:** `400` visibility not `PUBLIC`/`PRIVATE` · `401` · `403` not owner, or recipe is admin-unpublished (visibility locked) · `404`.

> **Lock:** if `isUnpublishedByAdmin === true`, this endpoint always returns `403`, even for the owner. Only `PUT /:id/admin-visibility` can clear it.

### `PUT /api/recipes/:id/admin-visibility` — [ADMIN]

Force unpublish / republish a recipe.

**Request body:**

```json
{ "isUnpublishedByAdmin": true }
```

Setting `true` immediately removes the recipe from the public listing and locks the owner's visibility toggle. Setting `false` restores normal owner control.

**Success `200`:** `data` is the updated recipe.

**Errors:** `400` body not a boolean · `401` · `403` non-admin · `404`.

### `POST /api/recipes/:id/favorite` — [AUTH]

Toggle favorite. Creates the `Favorite` row if absent; hard-deletes it if present (the join row is not a soft-delete-tracked entity). 

**Success `200`:**

```json
{ "success": true, "message": "Favorite toggled successfully", "data": { "isFavorited": true } }
```

**Errors:** `401` · `404` recipe missing/deleted.

### `DELETE /api/recipes/:id` — [AUTH, owner or admin]

Soft delete a recipe (`isDeleted = true`).

**Success `200`:** `data: null`.

**Errors:** `401` · `403` · `404`.

---

## Reviews

All review routes are prefixed `/api/reviews`.

### `POST /api/reviews` — [AUTH]

**Request body:**

```json
{ "recipeId": "<id>", "rating": 5, "comment": "Delicious!" }
```

`rating` must be an integer `1-5`. `userId` is taken from the token.

**Success `201`:** `data` is the created review (`{ id, rating, comment, status, createdAt, updatedAt, user: { id, name }, recipe: { id, title } }`).

**Errors:** `400` missing/invalid fields · `401` · `404` recipe not found.

### `GET /api/reviews` — [PUBLIC]

List non-deleted reviews, newest first.

**Query params:** `?recipeId=` to scope to one recipe.

**Success `200`:** `data` is an array of review objects.

### `GET /api/reviews/:id` — [PUBLIC]

**Success `200`:** `data` is the review.

**Errors:** `404` missing/deleted.

### `PUT /api/reviews/:id` — [AUTH, owner]

Edit `rating` and/or `comment`.

**Request body** (any subset):

```json
{ "rating": 4, "comment": "Updated comment" }
```

**Success `200`:** `data` is the updated review.

**Errors:** `400` empty body / invalid rating / empty comment · `401` · `403` · `404`.

### `DELETE /api/reviews/:id` — [AUTH, owner or admin]

Soft delete a review (`isDeleted = true`).

**Success `200`:** `data: null`.

**Errors:** `401` · `403` · `404`.

---

## Health

### `GET /api/health`

**Success `200`:**

```json
{ "success": true, "message": "ok", "data": null }
```

## Endpoint summary

| Method | Path | Auth | Epic |
|---|---|---|---|
| POST | `/api/auth/register` | Public | 5 |
| POST | `/api/auth/login` | Public | 5 |
| GET | `/api/users` | ADMIN | 5 |
| GET | `/api/users/:id` | AUTH (self/admin) | 5 |
| PUT | `/api/users/:id` | AUTH (self/admin) | 5 |
| PUT | `/api/users/:id/role` | ADMIN | 5 |
| DELETE | `/api/users/:id` | ADMIN | 5 |
| POST | `/api/categories` | ADMIN | 6 |
| GET | `/api/categories` | Public | 6 |
| GET | `/api/categories/:id` | Public | 6 |
| PUT | `/api/categories/:id` | ADMIN | 6 |
| DELETE | `/api/categories/:id` | ADMIN | 6 |
| POST | `/api/recipes` | AUTH | 7 |
| GET | `/api/recipes` | Public | 7 |
| GET | `/api/recipes/:id` | Public* | 7 |
| GET | `/api/recipes/mine` | AUTH | 7 |
| GET | `/api/recipes/favorites/mine` | AUTH | 9 |
| GET | `/api/recipes/admin` | ADMIN | 11 |
| PUT | `/api/recipes/:id` | AUTH (owner) | 7 |
| PUT | `/api/recipes/:id/visibility` | AUTH (owner) | 7 |
| PUT | `/api/recipes/:id/admin-visibility` | ADMIN | 11 |
| POST | `/api/recipes/:id/favorite` | AUTH | 9 |
| DELETE | `/api/recipes/:id` | AUTH (owner/admin) | 7 |
| POST | `/api/reviews` | AUTH | 10 |
| GET | `/api/reviews` | Public | 10 |
| GET | `/api/reviews/:id` | Public | 10 |
| PUT | `/api/reviews/:id` | AUTH (owner) | 10 |
| DELETE | `/api/reviews/:id` | AUTH (owner/admin) | 10 |
| GET | `/api/health` | Public | 3 |
