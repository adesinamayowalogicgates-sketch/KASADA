export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write'
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

export function handleFirestoreError(error: any, operationType: OperationType, path: string | null = null, auth?: any) {
  const errorInfo: FirestoreErrorInfo = {
    error: error.message || String(error),
    operationType,
    path,
    authInfo: {
      userId: auth?.currentUser?.uid || 'anonymous',
      email: auth?.currentUser?.email || 'none',
      emailVerified: auth?.currentUser?.emailVerified || false,
      isAnonymous: auth?.currentUser?.isAnonymous || true,
      providerInfo: auth?.currentUser?.providerData?.map((p: any) => ({
        providerId: p.providerId,
        displayName: p.displayName || '',
        email: p.email || ''
      })) || []
    }
  };

  const errorString = JSON.stringify(errorInfo);
  console.error("Firestore Error:", errorString);
  throw new Error(errorString);
}
