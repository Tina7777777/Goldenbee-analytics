export const en = {
  app: {
    name: 'GoldenBee Analytics'
  },
  nav: {
    home: 'Home',
    dashboard: 'Dashboard',
    analytics: 'Analytics',
    profile: 'Profile',
    admin: 'Admin',
    login: 'Login',
    register: 'Register',
    logout: 'Logout'
  },
  footer: {
    tagline: 'Capstone multi-page structure'
  },
  common: {
    guest: 'Guest',
    user: 'User',
    admin: 'Admin',
    info: 'Info',
    success: 'Success',
    error: 'Error'
  },
  auth: {
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    createAccount: 'Create account',
    login: 'Login',
    registerSuccess: 'Registration is successful. Please check your email if confirmation is required.',
    loginSuccess: 'Successful login.',
    logoutSuccess: 'Successful logout.',
    genericError: 'An error occurred. Please try again.',
    errors: {
      requiredFields: 'Please fill in all required fields.',
      passwordMinLength: 'Password must be at least 6 characters long.',
      passwordsMismatch: 'Passwords do not match.',
      invalidCredentials: 'Invalid email or password.',
      emailNotConfirmed: 'Email is not confirmed. Please check your inbox.',
      userExists: 'An account with this email already exists.',
      weakPassword: 'Password does not meet the security requirements.',
      missingConfig: 'Supabase configuration is missing. Check your .env settings.'
    }
  },
  pages: {
    home: {
      title: 'Home',
      description: 'Public home screen for GoldenBee Analytics.'
    },
    login: {
      title: 'Login',
      description: 'Enter your email and password to access your account.'
    },
    register: {
      title: 'Register',
      description: 'Create a new account to manage apiaries and hives.'
    },
    dashboard: {
      title: 'Dashboard',
      description: 'Overview of apiaries, hives, and latest inspections (placeholder).',
      apiaryLink: 'Open apiary #123',
      hiveLink: 'Open hive #123'
    },
    apiary: {
      title: 'Apiary',
      description: 'Apiary details (placeholder).'
    },
    hive: {
      title: 'Hive',
      description: 'Hive details (placeholder).'
    },
    analytics: {
      title: 'Analytics',
      description: 'Brood frames, queen status, and honey levels overview (placeholder).'
    },
    admin: {
      title: 'Admin Panel',
      description: 'Administrative screen (placeholder).'
    },
    profile: {
      title: 'Profile',
      description: 'Profile with public visibility settings (placeholder).'
    },
    notfound: {
      title: '404 - Page Not Found',
      description: 'The page you requested does not exist.'
    }
  }
};