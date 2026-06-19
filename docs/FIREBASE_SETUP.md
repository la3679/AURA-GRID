# Firebase Setup

AURA-GRID uses Firebase for **Authentication** (client SDK) and **Firestore** (via the
backend Admin SDK). The app runs without Firebase — guest mode works and the API uses
an ephemeral in-memory store — but accounts, persistence, and the leaderboard require it.

## 1. Create a project
1. Go to the [Firebase console](https://console.firebase.google.com) → **Add project**.
2. Disable or enable Analytics as you prefer.

## 2. Enable Authentication
1. **Build → Authentication → Get started**.
2. Enable **Email/Password**.
3. (Optional) Enable **Google** sign-in.

## 3. Create Firestore
1. **Build → Firestore Database → Create database** (start in production mode).
2. Choose a region close to your users.

## 4. Collections
The backend creates documents on demand, but the model is:

```
users/{uid}
matches/{matchId}
leaderboards/global/entries/{uid}
aiLogs/{logId}
dailyChallenges/{challengeId}
```

## 5. Register the web app
1. Project settings → **Your apps → Web (</>)**.
2. Copy the config into `apps/web/.env.local`:

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...
```

> The web config is public by design. It is safe in the browser bundle.

## 6. Generate an Admin service account (backend only)
1. Project settings → **Service accounts → Generate new private key**.
2. Put the values into `apps/api/.env` (never commit them):

```
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

> Keep the `\n` escapes — the API converts them to real newlines at runtime.
> `serviceAccount*.json` / `firebase-adminsdk*.json` are git-ignored.

## 7. Firestore security rules (recommended)
The backend writes with the Admin SDK (which bypasses rules), so rules protect any
direct client access. Deny-by-default with owner-scoped reads/writes:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{db}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
    match /matches/{matchId} {
      allow read, write: if request.auth != null
        && request.auth.uid == resource.data.userId;
    }
    match /leaderboards/global/entries/{uid} {
      allow read: if true;            // public leaderboard
      allow write: if request.auth != null && request.auth.uid == uid;
    }
    match /{document=**} { allow read, write: if false; }
  }
}
```

## 8. Test locally
1. `npm run dev`
2. Sign up at `/signup`, then sign in at `/login`.
3. `GET http://localhost:4000/api/health` should report `"firebase":"configured"`.

## Account deletion (documented flow)
Deleting an account requires removing the Firebase Auth user **and** the
`users/{uid}` + related documents. Implement an admin-only backend route that calls
`admin.auth().deleteUser(uid)` and deletes the user's Firestore docs, or perform it
manually from the console. Never expose deletion of arbitrary UIDs to clients.

## Avatar upload (optional)
Enable **Storage**, add `firebase/storage` to the web client, upload to
`avatars/{uid}`, and store the download URL in `photoURL`. The profile page already
has the structural slot for this.
