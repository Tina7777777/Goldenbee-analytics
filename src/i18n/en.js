export const en = {
  app: {
    name: 'GoldenBee Analytics',
    loading: 'Loading...'
  },
  nav: {
    home: 'Home',
    apiaries: 'Apiaries',
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
    error: 'Error',
    loading: 'Loading...',
    save: 'Save',
    cancel: 'Cancel'
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
      description: 'Public directory of beekeepers who chose to share data.'
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
    apiaries: {
      title: 'Apiaries'
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
  },
  profile: {
    photo: {
      title: 'Profile photo',
      alt: 'Profile photo',
      noPhoto: 'No photo uploaded yet.',
      upload: 'Upload photo',
      uploading: 'Uploading...',
      download: 'Open photo',
      toasts: {
        uploadSuccess: 'Photo uploaded successfully.'
      },
      errors: {
        required: 'Please choose a photo to upload.',
        invalidType: 'Only image files are allowed.',
        fileTooLarge: 'File is too large (max 5MB).',
        generic: 'An error occurred while uploading photo.'
      }
    },
    form: {
      displayName: 'Display name',
      about: 'About',
      location: 'Location',
      contacts: 'Contacts',
      isPublicProfile: 'Public profile',
      showLocation: 'Show location',
      showHiveCount: 'Show hive count',
      showContacts: 'Show contacts'
    },
    actions: {
      saving: 'Saving...'
    },
    toasts: {
      saveSuccess: 'Profile saved successfully.'
    },
    errors: {
      generic: 'An error occurred while working with profile.',
      notAuthenticated: 'You must be signed in.',
      missingConfig: 'Supabase configuration is missing. Check .env settings.'
    }
  },
  home: {
    directory: {
      searchLabel: 'Search by name or location',
      searchPlaceholder: 'Enter name or location...',
      empty: 'No public profiles',
      fields: {
        photoAlt: 'Profile photo',
        location: 'Location',
        contacts: 'Contacts',
        hiveCount: 'Public hive count'
      }
    },
    summary: {
      apiaries: 'Apiaries',
      hives: 'Hives',
      currentHoney: 'Current honey (kg)',
      lastUpdated: 'Last updated',
      noData: 'No data'
    },
    activity: {
      empty: 'No recent activity yet.',
      unknownApiary: 'Unknown apiary',
      snapshots: {
        title: 'Recent super snapshots',
        fullness: 'Honey (kg)'
      },
      inspections: {
        title: 'Recent inspections'
      },
      harvests: {
        title: 'Recent harvests',
        actualKg: 'Actual harvest'
      }
    },
    quickActions: {
      title: 'Quick actions',
      openApiaries: 'Open apiaries',
      newApiary: 'Add apiary'
    },
    errors: {
      generic: 'An error occurred while loading the home dashboard.',
      notAuthenticated: 'You must be signed in.',
      missingConfig: 'Supabase configuration is missing. Check .env settings.'
    }
  },
  admin: {
    publicDirectory: {
      title: 'Public profiles',
      empty: 'No public profiles to review.',
      unknownName: 'Unknown beekeeper',
      photoAlt: 'Profile photo'
    },
    actions: {
      unpublish: 'Hide',
      processing: 'Hiding...'
    },
    toasts: {
      unpublishSuccess: 'Profile was removed from public directory.'
    },
    errors: {
      generic: 'An error occurred while moderating public profiles.',
      notAuthenticated: 'You must be signed in.',
      missingConfig: 'Supabase configuration is missing. Check .env settings.'
    }
  },
  board: {
    noData: 'No data',
    table: {
      title: 'Latest apiary state',
      apiaryFilter: 'Selected apiary',
      emptyRows: 'No hives in the selected apiary.',
      columns: {
        hiveCode: 'Hive code',
        broodFrames: 'Brood frames',
        honeyPollenFrames: 'Honey/pollen frames',
        totalFrames: 'Total frames',
        eggsPresent: 'Eggs present',
        queenSeen: 'Queen seen',
        supersCount: 'Supers count',
        totalHoneyKg: 'Total honey (kg)',
        superSnapshots: 'Super snapshots'
      }
    },
    summary: {
      apiaries: 'Apiaries',
      hives: 'Hives',
      currentHoney: 'Current honey (kg)',
      importantInspections14d: 'Important inspections (14 days)'
    },
    labels: {
      hivesCount: 'Hives',
      currentHoney: 'Current honey',
      lastUpdated: 'Last updated'
    },
    actions: {
      open: 'Open',
      addInspection: 'Add inspection',
      addSnapshot: 'Add honey kg',
      addHarvest: 'Add harvest'
    },
    empty: {
      message: 'No apiaries created yet.',
      link: 'Go to apiaries'
    },
    errors: {
      generic: 'An error occurred while loading the board.',
      notAuthenticated: 'You must be signed in.',
      missingConfig: 'Supabase configuration is missing. Check .env settings.'
    }
  },
  analyticsReports: {
    noData: 'No data',
    calibration: {
      title: 'Calibration: estimated vs actual harvest',
      caption: 'Last up to 20 harvests'
    },
    trend: {
      title: 'Super honey trend',
      caption: 'Average values per apiary'
    },
    filters: {
      title: 'Period filter',
      period: 'Period',
      days7: '7 days',
      days14: '14 days',
      days30: '30 days',
      days365: '1 year',
      all: 'All time'
    },
    columns: {
      date: 'Date',
      apiary: 'Apiary',
      hive: 'Hive',
      estimatedKg: 'Yield (kg)',
      actualKg: 'Actual (kg)',
      deltaKg: 'Delta',
      avgFullness: 'Avg kg',
      avgKgEstimate: 'Avg estimate (kg)',
      snapshotsCount: 'Snapshots',
      lastUpdated: 'Last updated'
    },
    empty: {
      calibration: 'No harvest calibration data for this period.',
      trend: 'No super honey data for this period.'
    },
    errors: {
      generic: 'An error occurred while loading analytics.',
      notAuthenticated: 'You must be signed in.',
      missingConfig: 'Supabase configuration is missing. Check .env settings.'
    }
  },
  apiaries: {
    addButton: 'Add apiary',
    cardStats: {
      hives: 'Hives',
      hivesWithSupers: 'Hives with supers',
      activeSupers: 'Active supers',
      latestHoneyKg: 'Latest total honey',
      lastUpdated: 'Last updated'
    },
    honeySummary: {
      title: 'Current honey estimate',
      activeSupers: 'Active supers',
      withData: 'With data',
      lastUpdated: 'Last updated',
      noData: 'No data'
    },
    createdAt: 'Created at',
    empty: 'No apiaries added yet.',
    confirmDelete: 'Are you sure you want to delete this apiary?',
    hivesTitle: 'Hives',
    hivesEmpty: 'No hives added yet.',
    hivesAddButton: 'Add hive',
    form: {
      name: 'Apiary name',
      location: 'Location',
      notes: 'Notes'
    },
    actions: {
      open: 'Open',
      edit: 'Edit',
      delete: 'Delete',
      back: 'Back to apiaries'
    },
    toasts: {
      createSuccess: 'Apiary created successfully.',
      updateSuccess: 'Apiary updated successfully.',
      deleteSuccess: 'Apiary deleted successfully.'
    },
    errors: {
      generic: 'An error occurred while working with apiaries.',
      notFound: 'Apiary was not found.',
      nameRequired: 'Apiary name is required.',
      notAuthenticated: 'You must be signed in.',
      missingConfig: 'Supabase configuration is missing. Check .env settings.'
    },
    hives: {
      title: 'Hives',
      empty: 'No hives added yet.',
      addButton: 'Add hive',
      editButton: 'Edit',
      deleteButton: 'Delete',
      codeLabel: 'Code',
      search: {
        label: 'Search hive by code',
        placeholder: 'Example: BG-BS-002',
        noMatches: 'No hive with this code was found in this apiary.'
      },
      quickStats: {
        activeSupers: 'Active supers',
        fullSupers: 'Full supers',
        totalHoneyKg: 'Total honey kg',
        noData: 'No data'
      },
      confirmDelete: 'Are you sure you want to delete this hive?',
      form: {
        code: 'Hive code',
        notes: 'Notes'
      },
      actions: {
        saving: 'Saving...'
      },
      toasts: {
        createSuccess: 'Hive created successfully.',
        updateSuccess: 'Hive updated successfully.',
        deleteSuccess: 'Hive deleted successfully.'
      },
      errors: {
        generic: 'An error occurred while working with hives.',
        codeRequired: 'Hive code is required.',
        codeExists: 'A hive with this code already exists.',
        notAuthenticated: 'You must be signed in.',
        missingConfig: 'Supabase configuration is missing. Check .env settings.'
      },
      supers: {
        title: 'Supers',
        addButton: 'Add super',
        removeButton: 'Remove super',
        saveSnapshot: 'Save',
        positionLabel: 'Position',
        installedAt: 'Installed at',
        lastFullness: 'Last entered kg',
        estimatedKg: 'Last honey amount',
        kgUnit: 'kg',
        fullnessInput: 'Honey amount (kg)',
        snapshotNotes: 'Notes',
        emptyActive: 'No active supers.',
        noFreePositions: 'No free positions (1-5).',
        confirmRemove: 'Are you sure you want to remove this super?',
        install: {
          position: 'Position',
          choosePosition: 'Choose position',
          notes: 'Notes'
        },
        actions: {
          expand: 'Show details',
          collapse: 'Hide details',
          saving: 'Saving...'
        },
        toasts: {
          installSuccess: 'Super installed successfully.',
          removeSuccess: 'Super removed successfully.',
          snapshotSuccess: 'Honey amount saved successfully.'
        },
        errors: {
          generic: 'An error occurred while working with supers.',
          positionRequired: 'Position is required.',
          positionTaken: 'Selected position is already taken.',
          fullnessRequired: 'Honey amount is required.',
          fullnessRange: 'Honey amount must be 0 or greater.',
          notAuthenticated: 'You must be signed in.',
          missingConfig: 'Supabase configuration is missing. Check .env settings.'
        }
      },
      inspections: {
        title: 'Inspections',
        newButton: 'New inspection',
        deleteButton: 'Delete',
        empty: 'No inspections added.',
        importantBadge: 'Important',
        confirmDelete: 'Are you sure you want to delete this inspection?',
        form: {
          broodFrames: 'Brood frames',
          honeyPollenFrames: 'Honey/pollen frames',
          totalFrames: 'Total frames',
          swarmingState: 'Swarming state',
          eggsPresent: 'Eggs present',
          queenSeen: 'Queen seen',
          important: 'Mark as important',
          notes: 'Notes'
        },
        swarming: {
          none: 'None',
          suspected: 'Suspected',
          swarmed: 'Swarmed',
          split: 'Split'
        },
        summary: {
          brood: 'Brood',
          honeyPollen: 'Honey/pollen',
          total: 'Total',
          swarming: 'Swarming',
          flags: 'Eggs / Queen',
          yes: 'Yes',
          no: 'No'
        },
        actions: {
          saving: 'Saving...'
        },
        toasts: {
          createSuccess: 'Inspection created successfully.',
          deleteSuccess: 'Inspection deleted successfully.'
        },
        errors: {
          generic: 'An error occurred while working with inspections.',
          notAuthenticated: 'You must be signed in.',
          missingConfig: 'Supabase configuration is missing. Check .env settings.'
        }
      },
      harvests: {
        title: 'Harvests',
        newButton: 'New harvest',
        deleteButton: 'Delete',
        empty: 'No harvests added.',
        groupedItems: 'Grouped frames',
        itemLabel: 'Group',
        addRow: 'Add group',
        removeRow: 'Remove',
        framesCount: 'Frames count',
        fillLevel: 'Fill level',
        rowEstimated: 'Estimated',
        computedTotal: 'Computed total',
        estimatedTotal: 'Estimated total',
        actualTotal: 'Actual total',
        actualTotalOptional: 'Actual total (kg, optional)',
        notes: 'Notes',
        itemNotes: 'Group notes',
        confirmDelete: 'Are you sure you want to delete this harvest?',
        fillLevels: {
          very_full: 'Very full',
          full: 'Full',
          medium: 'Medium',
          low: 'Low',
          almost_empty: 'Almost empty'
        },
        actions: {
          saving: 'Saving...'
        },
        toasts: {
          createSuccess: 'Harvest created successfully.',
          deleteSuccess: 'Harvest deleted successfully.'
        },
        errors: {
          generic: 'An error occurred while working with harvests.',
          itemRequired: 'Please add at least one valid grouped item.',
          notAuthenticated: 'You must be signed in.',
          missingConfig: 'Supabase configuration is missing. Check .env settings.'
        }
      }
    }
  }
};