export const bg = {
  app: {
    name: 'GoldenBee Analytics'
  },
  nav: {
    home: 'Начало',
    apiaries: 'Пчелини',
    dashboard: 'Табло',
    analytics: 'Анализи',
    profile: 'Профил',
    admin: 'Админ',
    login: 'Вход',
    register: 'Регистрация',
    logout: 'Изход'
  },
  footer: {
    tagline: 'Капстoун multi-page структура'
  },
  common: {
    guest: 'Гост',
    user: 'Потребител',
    admin: 'Админ',
    info: 'Инфо',
    success: 'Успех',
    error: 'Грешка',
    save: 'Запази',
    cancel: 'Отказ'
  },
  auth: {
    email: 'Имейл',
    password: 'Парола',
    confirmPassword: 'Потвърди паролата',
    createAccount: 'Създай акаунт',
    login: 'Вход',
    registerSuccess: 'Регистрацията е успешна. Моля, провери имейла си, ако е нужно потвърждение.',
    loginSuccess: 'Успешен вход.',
    logoutSuccess: 'Успешен изход.',
    genericError: 'Възникна грешка. Моля, опитай отново.',
    errors: {
      requiredFields: 'Моля, попълни всички задължителни полета.',
      passwordMinLength: 'Паролата трябва да е поне 6 символа.',
      passwordsMismatch: 'Паролите не съвпадат.',
      invalidCredentials: 'Невалиден имейл или парола.',
      emailNotConfirmed: 'Имейлът не е потвърден. Моля, провери пощата си.',
      userExists: 'Вече има акаунт с този имейл.',
      weakPassword: 'Паролата не отговаря на изискванията за сигурност.',
      missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
    }
  },
  pages: {
    home: {
      title: 'Начало',
      description: 'Публичен начален екран за GoldenBee Analytics.'
    },
    login: {
      title: 'Вход',
      description: 'Въведи имейл и парола за достъп до профила си.'
    },
    register: {
      title: 'Регистрация',
      description: 'Създай нов акаунт за управление на пчелини и кошери.'
    },
    dashboard: {
      title: 'Табло',
      description: 'Преглед на пчелини, кошери и последни инспекции (placeholder).',
      apiaryLink: 'Отвори пчелин #123',
      hiveLink: 'Отвори кошер #123'
    },
    apiaries: {
      title: 'Пчелини'
    },
    apiary: {
      title: 'Пчелин',
      description: 'Детайли за пчелин (placeholder).'
    },
    hive: {
      title: 'Кошер',
      description: 'Детайли за кошер (placeholder).'
    },
    analytics: {
      title: 'Анализи',
      description: 'Разпределение на пило, статус на майка и нива на мед (placeholder).'
    },
    admin: {
      title: 'Админ панел',
      description: 'Административен екран (placeholder).'
    },
    profile: {
      title: 'Профил',
      description: 'Профил с настройка за публична видимост (placeholder).'
    },
    notfound: {
      title: '404 - Страницата не е намерена',
      description: 'Страницата, която търсите, не съществува.'
    }
  },
  apiaries: {
    addButton: 'Добави пчелин',
    createdAt: 'Създаден на',
    empty: 'Няма добавени пчелини.',
    confirmDelete: 'Сигурни ли сте, че искате да изтриете този пчелин?',
    hivesTitle: 'Кошери',
    hivesEmpty: 'Няма добавени кошери.',
    hivesAddButton: 'Добави кошер',
    form: {
      name: 'Име на пчелин',
      location: 'Локация',
      notes: 'Бележки'
    },
    actions: {
      open: 'Отвори',
      edit: 'Редактирай',
      delete: 'Изтрий',
      back: 'Към пчелини'
    },
    toasts: {
      createSuccess: 'Пчелинът е създаден успешно.',
      updateSuccess: 'Пчелинът е обновен успешно.',
      deleteSuccess: 'Пчелинът е изтрит успешно.'
    },
    errors: {
      generic: 'Възникна грешка при работа с пчелините.',
      notFound: 'Пчелинът не е намерен.',
      nameRequired: 'Името на пчелина е задължително.',
      notAuthenticated: 'Трябва да влезете в профила си.',
      missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
    }
  }
};