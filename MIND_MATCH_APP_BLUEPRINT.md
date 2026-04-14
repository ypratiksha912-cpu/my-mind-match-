# Mind Match App Blueprint & Recreation Prompt

This document provides a comprehensive blueprint for recreating the "Mind Match" web application. It is intended to be used as a detailed prompt for an advanced AI coding assistant.

## 1. Core Concept & Tech Stack

**Mind Match** is a web application that provides personalized media recommendations (books, movies, series) based on a user's current mood and narrative. It uses AI to generate tailored suggestions and aims to provide a high-quality, engaging user experience.

**Tech Stack:**
*   **Framework:** Next.js 15 (App Router)
*   **Language:** TypeScript
*   **UI Library:** React, ShadCN UI
*   **Styling:** Tailwind CSS
*   **AI/Generative:** Genkit (with Google's Gemini models)
*   **Backend & Database:** Firebase (Authentication, Firestore)

## 2. Core Features

*   **AI-Powered Recommendation Flow:**
    *   A multi-step form where users select their "vibe" (moods), preferred media format, genre, region of origin, and write a short personal narrative.
    *   On submission, the app calls a Genkit AI flow to generate 6 relevant media recommendations.
    *   The AI is instructed to provide real, popular media and generate detailed, enticing synopses and other metadata.
*   **Dynamic Results Display:**
    *   Results are displayed in a responsive grid of cards.
    *   Each card features a poster image (fetched from OMDb), title, author/creator.
    *   An accordion on each card reveals:
        *   A personalized explanation of *why* the item was recommended.
        *   The detailed synopsis.
        *   "Takeaways" or theme tags.
        *   A "Where to Find It" section with dynamically generated search links for various streaming platforms and a permanently featured, highlighted "Search on Amazon" button.
*   **User Authentication:**
    *   Supports both Google Sign-In and traditional Email/Password sign-up/sign-in.
    *   User profiles are automatically created and updated in Firestore upon successful authentication.
    *   UI includes a login page and a user dropdown menu in the header for profile actions.
*   **"Pro" Subscription & Feature Gating:**
    *   The app includes a concept of a "Pro" subscription.
    *   **Ad-Free Experience:** Pro users do not see ad placeholders.
    *   **Recommendation History:** Pro users have their recommendation sessions automatically saved to their profile.
    *   A dedicated `/subscribe` page allows users to "upgrade" (simulated, no real payment).
*   **Recommendation History Page:**
    *   A protected route (`/history`) accessible only to logged-in Pro users.
    *   Displays a list of past recommendation sessions in an accordion.
    *   Expanding an item shows the full set of recommendations from that session.
*   **Professional UI/UX:**
    *   A clean, dark-themed, and aesthetically pleasing design using ShadCN components.
    *   Custom fonts (`Alegreya`, `Belleza`).
    *   A custom logo used as a component and as the site's favicon.
    *   Responsive design for both desktop and mobile.

## 3. Project Structure (Key Files)

```
/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── page.tsx          # Home page (RecommendationFlow)
│   │   ├── login/page.tsx    # Login/Sign-up page
│   │   ├── history/page.tsx  # Pro feature: Recommendation history
│   │   ├── subscribe/page.tsx# Pro feature: Upgrade page
│   │   ├── layout.tsx        # Root layout, includes fonts and Firebase provider
│   │   └── globals.css       # Tailwind CSS and ShadCN theme variables
│   │
│   ├── ai/
│   │   ├── flows/
│   │   │   └── generate-recommendations.ts # The core Genkit flow for getting recommendations
│   │   └── genkit.ts         # Genkit configuration
│   │
│   ├── components/
│   │   ├── recommendation-flow.tsx   # Main component orchestrating the form and results
│   │   ├── recommendation-form.tsx   # The multi-step input form
│   │   ├── recommendation-results.tsx  # The component to display result cards
│   │   ├── login-form.tsx            # Email/Password and Google login logic
│   │   ├── auth-button.tsx           # Header button showing user state and dropdown menu
│   │   └── ui/                     # ShadCN UI components
│   │
│   ├── firebase/
│   │   ├── config.ts         # Firebase project configuration keys
│   │   ├── provider.tsx      # Core React context provider for Firebase services and auth state
│   │   ├── client-provider.tsx # Ensures Firebase initializes once on the client
│   │   ├── firestore/        # Firestore-specific hooks
│   │   │   ├── use-collection.tsx
│   │   │   └── use-doc.tsx
│   │   └── errors.ts         # Custom error classes for security rule debugging
│   │
│   └── lib/
│       └── utils.ts          # ShadCN utility functions (cn)
│
├── docs/
│   └── backend.json          # The single source of truth for Firebase data structures
│
├── firestore.rules           # Firestore security rules
│
└── public/
    └── favicon.ico           # The application's favicon
```

## 4. Backend & Data Blueprint (`docs/backend.json`)

The `backend.json` file defines all data entities and their structure within Firestore.

```json
{
  "entities": {
    "UserProfile": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "UserProfile",
      "type": "object",
      "description": "Represents a user's profile and their general preferences within the VibeFlow application. Authentication details are handled externally.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the UserProfile entity."
        },
        "username": {
          "type": "string",
          "description": "A public-facing username chosen by the user."
        },
        "email": {
          "type": "string",
          "description": "The user's email address, primarily for display and communication, not for authentication. (Security Best Practice: Do not store authentication credentials directly).",
          "format": "email"
        },
        "createdAt": {
          "type": "string",
          "description": "Timestamp when the user profile was created.",
          "format": "date-time"
        },
        "lastLoginAt": {
          "type": "string",
          "description": "Timestamp of the user's last login.",
          "format": "date-time"
        },
        "preferredMediaFormat": {
          "type": "string",
          "description": "The user's default preferred media format (e.g., Book, Series, Movie). This can be overridden per recommendation request.",
          "format": "string"
        },
        "preferredRealityType": {
          "type": "string",
          "description": "The user's default preference for reality-based content (e.g., Fiction, Based on a Real Story). This can be overridden per recommendation request.",
          "format": "string"
        },
        "bio": {
          "type": "string",
          "description": "An optional short biographical text provided by the user."
        },
        "moodArchetypePreferenceIds": {
          "type": "array",
          "description": "References to MoodArchetype entities that represent the user's generally preferred moods. (Relationship: UserProfile N:N MoodArchetype)",
          "items": {
            "type": "string"
          }
        },
        "photoURL": {
          "type": "string",
          "format": "uri",
          "description": "URL of the user's profile picture."
        },
        "subscriptionStatus": {
          "type": "string",
          "description": "The user's subscription status, typically 'free' or 'pro'. Managed by the backend in a real application.",
          "enum": [
            "free",
            "pro"
          ]
        }
      },
      "required": [
        "id",
        "username",
        "email",
        "createdAt",
        "lastLoginAt",
        "preferredMediaFormat",
        "preferredRealityType",
        "subscriptionStatus"
      ]
    },
    "MoodArchetype": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "MoodArchetype",
      "type": "object",
      "description": "Defines a predefined emotional or thematic archetype that users can select to guide media recommendations.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the MoodArchetype entity."
        },
        "name": {
          "type": "string",
          "description": "The display name of the mood archetype (e.g., 'Adventure', 'Calm', 'Thoughtful')."
        },
        "description": {
          "type": "string",
          "description": "A brief description explaining the essence of the mood archetype."
        },
        "iconUrl": {
          "type": "string",
          "description": "URL to an icon image representing this mood archetype.",
          "format": "uri"
        }
      },
      "required": [
        "id",
        "name",
        "description"
      ]
    },
    "MediaItem": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "MediaItem",
      "type": "object",
      "description": "Represents a single piece of media content, such as a book, movie, or series, available for recommendation.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the MediaItem entity."
        },
        "title": {
          "type": "string",
          "description": "The title of the media item."
        },
        "authorCreator": {
          "type": "string",
          "description": "The author for books, or creator/director for movies/series."
        },
        "coverImageUrl": {
          "type": "string",
          "description": "URL to the cover image of the media item.",
          "format": "uri"
        },
        "synopsis": {
          "type": "string",
          "description": "A brief summary or overview of the media item's plot or content."
        },
        "mediaType": {
          "type": "string",
          "description": "The type of media (e.g., 'Book', 'Series', 'Movie')."
        },
        "realityType": {
          "type": "string",
          "description": "Indicates if the media is fictional or based on a real story (e.g., 'Fiction', 'Based on a Real Story')."
        },
        "price": {
          "type": "number",
          "description": "The standardized current price of the media item."
        },
        "conclusionTakeaways": {
          "type": "array",
          "description": "A list of tags or brief summaries describing the media item's core themes or emotional 'aftertaste' (e.g., 'Life-affirming', 'Bittersweet').",
          "items": {
            "type": "string"
          }
        },
        "moodArchetypeIds": {
          "type": "array",
          "description": "References to MoodArchetype entities that this media item is associated with or is likely to evoke. (Relationship: MoodArchetype N:N MediaItem)",
          "items": {
            "type": "string"
          }
        },
        "averageRating": {
          "type": "number",
          "description": "The denormalized average rating calculated from all user reviews for this media item."
        }
      },
      "required": [
        "id",
        "title",
        "authorCreator",
        "coverImageUrl",
        "synopsis",
        "mediaType",
        "realityType",
        "price"
      ]
    },
    "RecommendationSession": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "RecommendationSession",
      "type": "object",
      "description": "Records a specific instance of a user requesting media recommendations, including their inputs and the list of media items suggested.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the RecommendationSession entity."
        },
        "userId": {
          "type": "string",
          "description": "Reference to the UserProfile who initiated this recommendation session. (Relationship: UserProfile 1:N RecommendationSession)"
        },
        "selectedMoodId": {
          "type": "string",
          "description": "Reference to the MoodArchetype selected by the user for this session. (Relationship: MoodArchetype 1:N RecommendationSession)"
        },
        "selectedFormat": {
          "type": "string",
          "description": "The media format chosen by the user for this specific recommendation request."
        },
        "selectedRealityType": {
          "type": "string",
          "description": "The reality preference (Fiction/Based on a Real Story) chosen by the user for this specific recommendation request."
        },
        "narrativeInput": {
          "type": "string",
          "description": "The user's brief personal narrative or desired emotional outcome provided for this session."
        },
        "timestamp": {
          "type": "string",
          "description": "The date and time when this recommendation session was initiated.",
          "format": "date-time"
        },
        "recommendedMediaItemIds": {
          "type": "array",
          "description": "An ordered list of references to MediaItem entities that were recommended to the user in this session. (Relationship: RecommendationSession 1:N MediaItem)",
          "items": {
            "type": "string"
          }
        }
      },
      "required": [
        "id",
        "userId",
        "selectedMoodId",
        "selectedFormat",
        "selectedRealityType",
        "narrativeInput",
        "timestamp",
        "recommendedMediaItemIds"
      ]
    },
    "RecommendationDetail": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "RecommendationDetail",
      "type": "object",
      "description": "Stores the specific 'why' explanation for a recommended media item within a particular recommendation session, as this explanation is dynamic and user-context specific.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the RecommendationDetail entity."
        },
        "recommendationSessionId": {
          "type": "string",
          "description": "Reference to the RecommendationSession this detail belongs to. (Relationship: RecommendationSession 1:N RecommendationDetail)"
        },
        "mediaItemId": {
          "type": "string",
          "description": "Reference to the MediaItem that was recommended. (Relationship: MediaItem 1:N RecommendationDetail)"
        },
        "recommendationWhy": {
          "type": "string",
          "description": "The AI-generated or community-voted summary explaining why this specific media item matches the user's inputs for this session."
        }
      },
      "required": [
        "id",
        "recommendationSessionId",
        "mediaItemId",
        "recommendationWhy"
      ]
    },
    "Review": {
      "$schema": "http://json-schema.org/draft-07/schema#",
      "title": "Review",
      "type": "object",
      "description": "Represents a user-submitted review and rating for a specific media item.",
      "properties": {
        "id": {
          "type": "string",
          "description": "Unique identifier for the Review entity."
        },
        "userId": {
          "type": "string",
          "description": "Reference to the UserProfile who submitted this review. (Relationship: UserProfile 1:N Review)"
        },
        "mediaItemId": {
          "type": "string",
          "description": "Reference to the MediaItem being reviewed. (Relationship: MediaItem 1:N Review)"
        },
        "rating": {
          "type": "number",
          "description": "The star rating given by the user (e.g., 1-5)."
        },
        "reviewText": {
          "type": "string",
          "description": "The detailed text content of the user's review."
        },
        "createdAt": {
          "type": "string",
          "description": "Timestamp when the review was originally created.",
          "format": "date-time"
        },
        "updatedAt": {
          "type": "string",
          "description": "Timestamp when the review was last updated. Can be null if never updated.",
          "format": "date-time"
        }
      },
      "required": [
        "id",
        "userId",
        "mediaItemId",
        "rating",
        "reviewText",
        "createdAt"
      ]
    },
    "RecommendationHistory": {
      "title": "RecommendationHistory",
      "type": "object",
      "description": "Represents a saved recommendation session for a user, including their inputs and the generated recommendations. This is a premium feature.",
      "properties": {
        "inputs": {
          "type": "object",
          "description": "The inputs provided by the user for the recommendation."
        },
        "outputs": {
          "type": "object",
          "description": "The recommendations generated by the AI."
        },
        "createdAt": {
          "type": "string",
          "format": "date-time",
          "description": "Timestamp when the history item was created."
        }
      },
      "required": [
        "inputs",
        "outputs",
        "createdAt"
      ]
    }
  },
  "auth": {
    "providers": [
      "google.com",
      "password"
    ]
  },
  "firestore": {
    "structure": [
      {
        "path": "/users/{userId}",
        "definition": {
          "entityName": "UserProfile",
          "schema": {
            "$ref": "#/backend/entities/UserProfile"
          },
          "description": "Stores user profiles. The document ID (`userId`) MUST match the Firebase Authentication UID of the user. This path enables private, user-owned data."
        }
      },
      {
        "path": "/moodArchetypes/{moodId}",
        "definition": {
          "entityName": "MoodArchetype",
          "schema": {
            "$ref": "#/backend/entities/MoodArchetype"
          },
          "description": "Stores predefined mood archetypes. These are global, publicly readable, and managed by administrators.",
          "params": [
            {
              "name": "moodId",
              "description": "The unique identifier for a specific mood archetype."
            }
          ]
        }
      },
      {
        "path": "/mediaItems/{mediaItemId}",
        "definition": {
          "entityName": "MediaItem",
          "schema": {
            "$ref": "#/backend/entities/MediaItem"
          },
          "description": "Stores all media content available for recommendations. These are global, publicly readable, and managed by administrators.",
          "params": [
            {
              "name": "mediaItemId",
              "description": "The unique identifier for a specific media item (book, series, movie)."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/recommendationSessions/{sessionId}",
        "definition": {
          "entityName": "RecommendationSession",
          "schema": {
            "$ref": "#/backend/entities/RecommendationSession"
          },
          "description": "Stores a history of individual recommendation sessions for each user. The `userId` in the document MUST match the path's `userId`. This ensures user-specific access and Authorization Independence.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user who initiated the recommendation session."
            },
            {
              "name": "sessionId",
              "description": "The unique identifier for a specific recommendation session."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/recommendationHistory/{historyId}",
        "definition": {
          "entityName": "RecommendationHistory",
          "schema": {
            "$ref": "#/backend/entities/RecommendationHistory"
          },
          "description": "Stores a user's recommendation history. Access is private to the user.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user."
            },
            {
              "name": "historyId",
              "description": "The unique identifier for a specific history entry."
            }
          ]
        }
      },
      {
        "path": "/users/{userId}/recommendationSessions/{sessionId}/recommendationDetails/{detailId}",
        "definition": {
          "entityName": "RecommendationDetail",
          "schema": {
            "$ref": "#/backend/entities/RecommendationDetail"
          },
          "description": "Stores the specific 'why' explanations for recommended media items within a recommendation session. `recommendationSessionId` in the document MUST match the path's `sessionId`. Authorization is inherited from the parent `RecommendationSession` through the path.",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user who owns the parent recommendation session."
            },
            {
              "name": "sessionId",
              "description": "The unique identifier for the parent recommendation session."
            },
            {
              "name": "detailId",
              "description": "The unique identifier for a specific recommendation detail."
            }
          ]
        }
      },
      {
        "path": "/mediaItems/{mediaItemId}/reviews/{reviewId}",
        "definition": {
          "entityName": "Review",
          "schema": {
            "$ref": "#/backend/entities/Review"
          },
          "description": "Stores user-submitted reviews and ratings for media items. Documents include denormalized `userId` (for ownership checks during writes) and `mediaItemId` (to match the parent path). This structure supports public reading of all reviews for a media item (QAP) and user-specific write access (Authorization Independence).",
          "params": [
            {
              "name": "mediaItemId",
              "description": "The unique identifier of the media item being reviewed."
            },
            {
              "name": "reviewId",
              "description": "The unique identifier for a specific review."
            }
          ]
        }
      },
      {
        "path": "/roles_admin/{userId}",
        "definition": {
          "entityName": "RoleAdmin",
          "schema": {
            "$ref": "#/backend/entities/UserProfile"
          },
          "description": "A dedicated collection for managing administrator roles. The document ID (`userId`) is the Firebase Authentication UID of an admin user. The existence of a document signifies admin status (DBAC).",
          "params": [
            {
              "name": "userId",
              "description": "The unique identifier of the user designated as an administrator."
            }
          ]
        }
      }
    ],
    "reasoning": "The VibeFlow Firestore structure is designed to be secure, scalable, and highly debuggable by strictly adhering to the core design principles and strategy mandates. \n\n**Authorization Independence:** This is achieved primarily through structural segregation and strategic denormalization. For user-specific data like `UserProfile` and `RecommendationSession` (and its subcollection `RecommendationDetail`), a path-based ownership model is used: `/users/{userId}/...`. This ensures that the `userId` in the path directly corresponds to `request.auth.uid`, eliminating the need for `get()` calls to a parent document for authorization. For `Review` documents, which are public-readable but user-writeable, they are placed under `/mediaItems/{mediaItemId}/reviews/{reviewId}`. To maintain authorization independence for write operations, the `userId` of the review's author is denormalized within the `Review` document itself, allowing rules to directly check `request.auth.uid == resource.data.userId` without needing to fetch the user profile or any other parent data. Admin roles are managed via a dedicated top-level collection `/roles_admin/{userId}`, allowing for a simple `exists()` check rather than relying on custom claims or complex hierarchical data lookups.\n\n**Queryable Access Patterns (QAPs):**\n\n1.  **Publicly Accessible Data (e.g., browsing moods, media items):** Collections like `/moodArchetypes` and `/mediaItems` are top-level and have a uniform 'public read, admin write' security posture. This allows for efficient `list` operations (e.g., `db.collection('mediaItems').get()`) without security rules needing to filter results, as all documents are equally readable by anyone.\n2.  **User-Specific Private Data (e.g., user profiles, recommendation history):** The `/users/{userId}` collection and its subcollections (`/users/{userId}/recommendationSessions`, `/users/{userId}/recommendationSessions/{sessionId}/recommendationDetails`) enforce strict ownership. `list` operations on these paths will inherently be constrained to the authenticated user's data, as the `userId` in the path matches `request.auth.uid`. This satisfies QAPs by ensuring that `list` queries within these paths only return data the user is authorized to see.\n3.  **Mixed Access Data (e.g., reviews):** The `/mediaItems/{mediaItemId}/reviews` subcollection is designed for public `list` access (to view all reviews for a specific media item) while maintaining user-specific write access. A `list` query on `db.collection('mediaItems').doc(mediaItemId).collection('reviews')` will return all reviews for that media item, as they all share the 'public read' posture. Write access is then governed by the denormalized `userId` field within each `Review` document, ensuring only the author can modify their own review.\n\n**Structural Segregation:** Each collection/subcollection (`users`, `moodArchetypes`, `mediaItems`, `recommendationSessions`, `recommendationDetails`, `reviews`, `roles_admin`) serves a distinct purpose and has a homogenous security posture, making rules simpler and easier to reason about.\n\n**Access Modeling:** Path-based ownership is utilized for `UserProfile`, `RecommendationSession`, and `RecommendationDetail`. Global roles are handled by the `roles_admin` collection (Existence over Content). Collaborative data for `Review` entities is handled by public read access on the subcollection and denormalized `userId` for write access.\n\n**Data Clarity:** Wildcards are descriptive (e.g., `{userId}`, `{mediaItemId}`). Authorization fields (`userId`, `recommendationSessionId`, `mediaItemId`) are explicitly present in documents where needed for security rules, making the intent clear. `createdAt` and `updatedAt` fields facilitate auditing and integrity checks. The overall structure prioritizes predictability and maintainability."
  }
}
```

## 5. Firestore Security Rules (`firestore.rules`)

The security rules are designed to be robust and secure, following these principles:
*   **Private by Default:** Users can only access their own data.
*   **Public Read-Only Data:** Global data like media items and mood archetypes are publicly readable but only writable by admins.
*   **Ownership-based Writes:** Users can only create/update/delete content they own (e.g., their own reviews or history).
*   **Role-Based Access Control:** An `/roles_admin` collection manages administrator privileges.

```rules
/**
 * Core Philosophy: This ruleset enforces a security model with three distinct access tiers:
 * 1.  Private User Data: All information unique to a user (profile, recommendation history) is strictly confined to their own data tree, accessible only by them.
 * 2.  Public Global Data: Core application content (media items, mood archetypes) is publicly readable by anyone but can only be modified by designated administrators.
 * 3.  Shared User-Generated Content: Content created by users but intended for public viewing (like reviews) is publicly readable, but write access (create, update, delete) is restricted to the original author.
 *
 * Data Structure: The data is organized into top-level collections for global data (`mediaItems`, `moodArchetypes`) and private user data (`users`). User-specific subcollections (`recommendationSessions`) are nested under `/users/{userId}` to enforce ownership through path hierarchy. Public user-generated content (`reviews`) is nested under the content it relates to (e.g., `/mediaItems/{mediaItemId}/reviews/{reviewId}`) for easy querying.
 *
 * Key Security Decisions:
 * -   User data is strictly isolated; users cannot read or even list other users' profiles or private data.
 * -   Administrator privileges are managed by the existence of a document in a dedicated `/roles_admin/{userId}` collection. This provides a clear, queryable source of truth for admin status.
 * -   Reviews are nested under the media they belong to, enabling public queries for all reviews of an item while still securing write operations to the review's author.
 * -   Subscription status (`subscriptionStatus`) is protected. Users can only be created with a 'free' status, and for this demo, can upgrade to 'pro'. In a real app, this should be controlled by a secure backend.
 *
 * Denormalization for Authorization: To ensure fast and secure authorization checks, ownership data is denormalized. For example, a `Review` document under `/mediaItems/{mediaItemId}/reviews/{reviewId}` contains a `userId` field. This allows write-access rules to directly check `resource.data.userId == request.auth.uid` without performing slow and costly `get()` calls to other documents.
 *
 * Structural Segregation: Each collection has a distinct and uniform security purpose. Private data is kept entirely separate from public data, which simplifies the rules for `list` operations and prevents accidental data leakage. For instance, `/users/{userId}/recommendationSessions` is private, while `/mediaItems` is public, avoiding the need for complex, query-based rules within a single collection.
 */
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // -------------------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------------------

    /**
     * Checks if a user is authenticated.
     */
    function isSignedIn() {
      return request.auth != null;
    }

    /**
     * Checks if the currently authenticated user is the owner of a document,
     * based on a matching userId in the path.
     */
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }

    /**
     * Checks if the currently authenticated user is the owner of an *existing* document.
     * Crucial for secure update and delete operations.
     */
    function isExistingOwner(userId) {
      return isOwner(userId) && resource != null;
    }

    /**
     * Checks if the currently authenticated user is an administrator.
     * Admin status is granted by the existence of a document in the /roles_admin collection.
     */
    function isAdmin() {
      return isSignedIn() && exists(/databases/$(database)/documents/roles_admin/$(request.auth.uid));
    }

    /**
     * On create, validates that the new user profile's internal `id` field
     * matches the document's ID (which is the user's auth UID) and that the
     * subscription status is set to 'free'.
     */
    function newProfileDataIsValid(userId) {
      return request.resource.data.id == userId
          && request.resource.data.subscriptionStatus == 'free';
    }

    /**
     * On update, ensures the user profile's internal `id` field is immutable
     * and that subscription status changes are valid.
     */
    function existingProfileDataIsValid() {
      return request.resource.data.id == resource.data.id
          && subscriptionChangeIsValid();
    }
    
    /**
     * FOR DEMONSTRATION PURPOSES: This rule allows a user to upgrade themselves
     * from 'free' to 'pro'. In a real-world application, this logic MUST be
     * handled by a secure backend process (e.g., a Cloud Function triggered by
     * a payment provider like Stripe) that verifies payment before updating the status.
     * A user should never be allowed to change their own subscription status directly.
     */
    function subscriptionChangeIsValid() {
      // Check if subscriptionStatus exists on the old resource, default to 'free'
      let oldStatus = 'subscriptionStatus' in resource.data ? resource.data.subscriptionStatus : 'free';
      let newStatus = request.resource.data.subscriptionStatus;

      // A user can upgrade from 'free' to 'pro' for this demo.
      // They cannot downgrade from 'pro' to 'free'.
      // The status can also remain unchanged.
      let isUpgrading = oldStatus == 'free' && newStatus == 'pro';
      let isUnchanged = oldStatus == newStatus;

      return isUpgrading || isUnchanged || isAdmin();
    }
    
    /**
     * On create, validates that a new session's internal `userId`
     * matches the owner's UID from the path.
     */
    function newSessionDataIsValid(userId) {
      return request.resource.data.userId == userId;
    }

    /**
     * On update, ensures the session's internal `userId` is immutable.
     */
    function existingSessionDataIsValid() {
      return request.resource.data.userId == resource.data.userId;
    }

    /**
     * On create, validates that a new detail's `recommendationSessionId`
     * matches the session's ID from the path.
     */
    function newDetailDataIsValid(sessionId) {
      return request.resource.data.recommendationSessionId == sessionId;
    }
    
    /**
     * On update, ensures the detail's internal `recommendationSessionId` is immutable.
     */
    function existingDetailDataIsValid() {
      return request.resource.data.recommendationSessionId == resource.data.recommendationSessionId;
    }
    
    /**
     * On create, validates a new review's ownership and path relationship.
     */
    function newReviewDataIsValid(mediaItemId) {
      return request.resource.data.userId == request.auth.uid
        && request.resource.data.mediaItemId == mediaItemId;
    }

    /**
     * On update, ensures a review's core relational fields are immutable.
     */
    function existingReviewDataIsValid() {
      return request.resource.data.userId == resource.data.userId
        && request.resource.data.mediaItemId == resource.data.mediaItemId;
    }

    // -------------------------------------------------------------------------
    // Collection Rules
    // -------------------------------------------------------------------------

    /**
     * @description Controls access to user profiles. Users can create, read, and update their own profile, but cannot see or list others.
     * @path /users/{userId}
     * @allow (create) An authenticated user with UID 'user123' creating their own profile at `/users/user123`.
     * @deny (get) User 'user123' trying to read the profile at `/users/user456`.
     * @principle Restricts access to a user's own data tree.
     */
    match /users/{userId} {
      allow get: if isOwner(userId);
      allow list: if false;
      allow create: if isOwner(userId) && newProfileDataIsValid(userId);
      allow update: if isExistingOwner(userId) && existingProfileDataIsValid();
      allow delete: if isExistingOwner(userId);
    }

    /**
     * @description Controls access to predefined mood archetypes. This data is public for all to read but writable only by administrators.
     * @path /moodArchetypes/{moodId}
     * @allow (get) Any user, signed in or not, reading a document at `/moodArchetypes/adventure`.
     * @deny (create) A non-admin user trying to create a new mood archetype.
     * @principle Segregates public read-only data from protected write operations.
     */
    match /moodArchetypes/{moodId} {
      allow get: if true;
      allow list: if true;
      allow create: if isAdmin();
      allow update: if isAdmin() && resource != null;
      allow delete: if isAdmin() && resource != null;
    }

    /**
     * @description Controls access to media items (books, movies, etc.). This data is public for all to read but writable only by administrators.
     * @path /mediaItems/{mediaItemId}
     * @allow (list) Any user, signed in or not, listing all documents in the `mediaItems` collection.
     * @deny (update) A non-admin user trying to change the title of a movie.
     * @principle Segregates public read-only data from protected write operations.
     */
    match /mediaItems/{mediaItemId} {
      allow get: if true;
      allow list: if true;
      allow create: if isAdmin();
      allow update: if isAdmin() && resource != null;
      allow delete: if isAdmin() && resource != null;
    }

    /**
     * @description Controls access to a user's recommendation session history. Only the user who owns the session can access it.
     * @path /users/{userId}/recommendationSessions/{sessionId}
     * @allow (list) User 'user123' listing their own past sessions at `/users/user123/recommendationSessions`.
     * @deny (get) User 'user456' trying to read a session at `/users/user123/recommendationSessions/sessionABC`.
     * @principle Enforces strict ownership on nested user-private data.
     */
    match /users/{userId}/recommendationSessions/{sessionId} {
      allow get: if isOwner(userId);
      allow list: if isOwner(userId);
      allow create: if isOwner(userId) && newSessionDataIsValid(userId);
      allow update: if isExistingOwner(userId) && existingSessionDataIsValid();
      allow delete: if isExistingOwner(userId);
    }
    
    /**
     * @description Controls access to a user's recommendation history. This is a premium feature, access is private to the user.
     * @path /users/{userId}/recommendationHistory/{historyId}
     * @allow (list) User 'user123' listing their own history at `/users/user123/recommendationHistory`.
     * @deny (get) User 'user456' trying to read history at `/users/user123/recommendationHistory/historyABC`.
     * @principle Enforces strict ownership on nested user-private data.
     */
    match /users/{userId}/recommendationHistory/{historyId} {
        allow get, list: if isOwner(userId);
        allow create: if isOwner(userId);
        allow update, delete: if isExistingOwner(userId);
    }

    /**
     * @description Controls access to the detailed explanations within a recommendation session. Access is inherited from the parent session.
     * @path /users/{userId}/recommendationSessions/{sessionId}/recommendationDetails/{detailId}
     * @allow (create) User 'user123' creating a new detail document within their own session.
     * @deny (update) User 'user456' trying to update a detail within user 'user123's session.
     * @principle Enforces strict ownership inherited from the parent document's path.
     */
    match /users/{userId}/recommendationSessions/{sessionId}/recommendationDetails/{detailId} {
      allow get: if isOwner(userId);
      allow list: if isOwner(userId);
      allow create: if isOwner(userId) && newDetailDataIsValid(sessionId);
      allow update: if isExistingOwner(userId) && existingDetailDataIsValid();
      allow delete: if isExistingOwner(userId);
    }

    /**
     * @description Controls access to user-submitted reviews. Reviews are public to read but can only be written or modified by their original author.
     * @path /mediaItems/{mediaItemId}/reviews/{reviewId}
     * @allow (list) Any user listing all reviews for a given media item.
     * @deny (delete) User 'user456' trying to delete a review written by 'user123'.
     * @principle Enforces document ownership for writes on a publicly readable collection.
     */
    match /mediaItems/{mediaItemId}/reviews/{reviewId} {
      allow get: if true;
      allow list: if true;
      allow create: if isSignedIn() && newReviewDataIsValid(mediaItemId);
      allow update: if isExistingOwner(resource.data.userId) && existingReviewDataIsValid();
      allow delete: if isExistingOwner(resource.data.userId);
    }

    /**
     * @description Manages administrator roles. Only existing admins can read or modify this collection. Listing is disabled for security.
     * @path /roles_admin/{userId}
     * @allow (create) An existing admin granting another user admin rights by creating a document at `/roles_admin/newUserUID`.
     * @deny (get) A non-admin user trying to check if another user is an admin.
     * @principle Restricts high-privilege operations to a specific role (admin).
     */
    match /roles_admin/{userId} {
      allow get: if isAdmin();
      allow list: if false;
      allow create: if isAdmin();
      allow update: if isAdmin() && resource != null;
      allow delete: if isAdmin() && resource != null;
    }
  }
}
```

## 6. Genkit AI Flow (`src/ai/flows/generate-recommendations.ts`)

This is the core AI logic. It defines the inputs, the prompt sent to the LLM, and the post-processing steps.

**Input Schema (Zod):**
*   `moodArchetype`: Array of strings.
*   `preferredFormat`: Enum of 'Book', 'Series', 'Movie'.
*   `realityPreference`: Enum of "Fiction", "Non-Fiction", "Documentary", "Animation".
*   `region`: String for region of origin.
*   `narrativeInput`: String (max 280 chars).

**AI Prompt:**
The prompt instructs the AI to act as an expert media recommender. Key instructions include:
*   Only recommend real, popular media.
*   Provide a **detailed, attractive, and engaging synopsis** that captures the tone of the media, not just a summary.
*   Identify multiple, diverse streaming services (e.g., Netflix, Prime Video, Hulu) or "Rent/Buy".
*   Generate a list of 6 recommendations in a specific JSON format.

**Post-processing Logic:**
*   After receiving the creative text from the AI, the flow iterates through each recommendation.
*   It calls the OMDb API (`https://www.omdbapi.com/`) to fetch a `posterUrl` for the media title.
*   It programmatically generates an Amazon search URL (`https://www.amazon.com/s?k=[title]`) with a hardcoded affiliate tag.
*   It combines the AI-generated data with the programmatically fetched URLs to create the final output.

## 7. Favicon

A `favicon.ico` file, derived from the `MindMatchLogo` SVG, is placed in the `/public` directory. The root layout (`src/app/layout.tsx`) is configured to automatically use it, as Next.js will automatically detect a file named `favicon.ico` in the `app/` directory or the `public/` directory as a fallback.
