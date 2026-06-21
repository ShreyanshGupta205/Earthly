import {
  signInWithGoogle,
  signUpWithEmail,
  signInWithEmail,
  signOut,
  onAuthChange,
  getCurrentUser,
} from '@/lib/firebase/auth'

const mockSignInWithEmailAndPassword = jest.fn()
const mockCreateUserWithEmailAndPassword = jest.fn()
const mockSignInWithPopup = jest.fn()
const mockSignOut = jest.fn()
const mockUpdateProfile = jest.fn()
const mockOnAuthStateChanged = jest.fn()

jest.mock('firebase/auth', () => {
  return {
    signInWithEmailAndPassword: (...args: any[]) => mockSignInWithEmailAndPassword(...args),
    createUserWithEmailAndPassword: (...args: any[]) => mockCreateUserWithEmailAndPassword(...args),
    signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
    signOut: (...args: any[]) => mockSignOut(...args),
    updateProfile: (...args: any[]) => mockUpdateProfile(...args),
    onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
    GoogleAuthProvider: jest.fn().mockImplementation(() => {
      return {
        setCustomParameters: jest.fn(),
      }
    }),
  }
})

const mockCreateUserProfile = jest.fn()
jest.mock('@/lib/firebase/firestore', () => ({
  createUserProfile: (...args: any[]) => mockCreateUserProfile(...args),
}))

const mockAuthInstance = {
  currentUser: { uid: 'test-uid', email: 'test@example.com', displayName: 'Test User' },
}

jest.mock('@/lib/firebase/config', () => {
  return {
    get auth() {
      return (global as any).__mockAuth
    },
  }
})

describe('lib/firebase/auth', () => {
  beforeAll(() => {
    ;(global as any).__mockAuth = mockAuthInstance
  })

  afterAll(() => {
    delete (global as any).__mockAuth
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('when configured', () => {
    it('signInWithGoogle should invoke signInWithPopup and create user profile', async () => {
      const mockResult = {
        user: {
          uid: 'google-uid',
          email: 'google@example.com',
          displayName: 'Google User',
          photoURL: 'https://avatar.url',
        },
      }
      mockSignInWithPopup.mockResolvedValueOnce(mockResult)

      const result = await signInWithGoogle()
      expect(mockSignInWithPopup).toHaveBeenCalledWith(mockAuthInstance, expect.any(Object))
      expect(mockCreateUserProfile).toHaveBeenCalledWith('google-uid', expect.objectContaining({
        username: 'google',
        fullName: 'Google User',
        avatarUrl: 'https://avatar.url',
      }))
      expect(result).toBe(mockResult)
    })

    it('signInWithGoogle fallback username/photoURL when they are missing', async () => {
      const mockResult = {
        user: {
          uid: 'google-uid-no-info',
        },
      }
      mockSignInWithPopup.mockResolvedValueOnce(mockResult)

      await signInWithGoogle()
      expect(mockCreateUserProfile).toHaveBeenCalledWith('google-uid-no-info', expect.objectContaining({
        username: 'google-u', // fallback uid slice
        fullName: '',
        avatarUrl: '',
      }))
    })

    it('signUpWithEmail should create user and update profile', async () => {
      const mockResult = {
        user: {
          uid: 'email-uid',
        },
      }
      mockCreateUserWithEmailAndPassword.mockResolvedValueOnce(mockResult)

      const result = await signUpWithEmail('user@test.com', 'password123', 'John Doe', 'johndoe')
      expect(mockCreateUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuthInstance, 'user@test.com', 'password123')
      expect(mockUpdateProfile).toHaveBeenCalledWith(mockResult.user, { displayName: 'John Doe' })
      expect(mockCreateUserProfile).toHaveBeenCalledWith('email-uid', expect.objectContaining({
        username: 'johndoe',
        fullName: 'John Doe',
        avatarUrl: '',
      }))
      expect(result).toBe(mockResult)
    })

    it('signInWithEmail should sign in user', async () => {
      mockSignInWithEmailAndPassword.mockResolvedValueOnce({ user: { uid: 'user-id' } })
      const result = await signInWithEmail('user@test.com', 'password123')
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(mockAuthInstance, 'user@test.com', 'password123')
      expect(result.user.uid).toBe('user-id')
    })

    it('signOut should invoke firebase signOut', async () => {
      mockSignOut.mockResolvedValueOnce(undefined)
      await signOut()
      expect(mockSignOut).toHaveBeenCalledWith(mockAuthInstance)
    })

    it('onAuthChange should listen to auth state changes', () => {
      const mockCallback = jest.fn()
      mockOnAuthStateChanged.mockReturnValueOnce(() => 'unsubscribe-fn')

      const unsubscribe = onAuthChange(mockCallback)
      expect(mockOnAuthStateChanged).toHaveBeenCalledWith(mockAuthInstance, mockCallback)
      expect(unsubscribe()).toBe('unsubscribe-fn')
    })

    it('getCurrentUser should return current auth user', () => {
      const user = getCurrentUser()
      expect(user).toEqual(mockAuthInstance.currentUser)
    })
  })

  describe('when not configured', () => {
    beforeAll(() => {
      ;(global as any).__mockAuth = null
    })

    afterAll(() => {
      ;(global as any).__mockAuth = mockAuthInstance
    })

    it('signInWithGoogle should throw error', async () => {
      await expect(signInWithGoogle()).rejects.toThrow('Firebase not configured')
    })

    it('signUpWithEmail should throw error', async () => {
      await expect(signUpWithEmail('a@b.com', '123', 'Name', 'user')).rejects.toThrow('Firebase not configured')
    })

    it('signInWithEmail should throw error', async () => {
      await expect(signInWithEmail('a@b.com', '123')).rejects.toThrow('Firebase not configured')
    })

    it('signOut should throw error', async () => {
      await expect(signOut()).rejects.toThrow('Firebase not configured')
    })

    it('onAuthChange should invoke callback with null immediately and return empty function', () => {
      const callback = jest.fn()
      const unsubscribe = onAuthChange(callback)
      expect(callback).toHaveBeenCalledWith(null)
      expect(() => unsubscribe()).not.toThrow()
    })

    it('getCurrentUser should return null', () => {
      expect(getCurrentUser()).toBeNull()
    })
  })
})
