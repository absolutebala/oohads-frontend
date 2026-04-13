# Firebase Security Rules

Copy these rules into the Firebase Console to secure your project.

## Firebase Storage Rules

Go to **Firebase Console → Storage → Rules** and replace with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /owners/{ownerId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == ownerId;
    }
    match /campaigns/{campaignId}/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

> **Important:** The `ownerId` path segment must exactly match `request.auth.uid`.
> The app now uses `firebaseUser.uid` directly as the owner storage path, so uploads will succeed once these rules are published.

## Firestore Rules

Go to **Firebase Console → Firestore Database → Rules** and replace with:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /owners/{ownerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == ownerId;
    }
    match /campaigns/{campaignId} {
      allow read, write: if request.auth != null;
    }
    match /adminUsers/{userId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## How to Publish

1. Open [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Storage → Rules** (or **Firestore Database → Rules**)
4. Paste the rules above
5. Click **Publish**

> Rules changes take effect immediately after publishing. They are **not** applied automatically — you must publish them manually.
