export const getAuth = jest.fn(() => ({
  currentUser: null,
  onAuthStateChanged: jest.fn(),
}));
export const signInWithPhoneNumber = jest.fn();
export const signInWithPopup = jest.fn();
export const GoogleAuthProvider = jest.fn();
export const RecaptchaVerifier = jest.fn();
export const signOut = jest.fn();
export const onAuthStateChanged = jest.fn();
