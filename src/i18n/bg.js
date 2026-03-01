export const bg = {
  app: {
    name: 'GoldenBee Analytics',
    loading: 'Зареждане...'
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
    loading: 'Зареждане...',
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
    },
    hives: {
      title: 'Кошери',
      empty: 'Няма добавени кошери.',
      addButton: 'Добави кошер',
      editButton: 'Редактирай',
      deleteButton: 'Изтрий',
      codeLabel: 'Код',
      confirmDelete: 'Сигурни ли сте, че искате да изтриете този кошер?',
      form: {
        code: 'Код на кошер',
        notes: 'Бележки'
      },
      actions: {
        saving: 'Запазване...'
      },
      toasts: {
        createSuccess: 'Кошерът е създаден успешно.',
        updateSuccess: 'Кошерът е обновен успешно.',
        deleteSuccess: 'Кошерът е изтрит успешно.'
      },
      errors: {
        generic: 'Възникна грешка при работа с кошерите.',
        codeRequired: 'Кодът на кошера е задължителен.',
        codeExists: 'Вече съществува кошер с този код.',
        notAuthenticated: 'Трябва да влезете в профила си.',
        missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
      },
      supers: {
        title: 'Магазини',
        addButton: 'Добави магазин',
        removeButton: 'Махни магазин',
        saveSnapshot: 'Запиши',
        positionLabel: 'Позиция',
        installedAt: 'Поставен на',
        lastFullness: 'Последна пълнота',
        estimatedKg: 'Оценка кг',
        kgUnit: 'кг',
        fullnessInput: 'Пълнота (%)',
        snapshotNotes: 'Бележки',
        emptyActive: 'Няма активни магазини.',
        noFreePositions: 'Няма свободни позиции (1-5).',
        confirmRemove: 'Сигурни ли сте, че искате да махнете този магазин?',
        install: {
          position: 'Позиция',
          choosePosition: 'Избери позиция',
          notes: 'Бележки'
        },
        actions: {
          expand: 'Покажи детайли',
          collapse: 'Скрий детайли',
          saving: 'Запазване...'
        },
        toasts: {
          installSuccess: 'Магазинът е добавен успешно.',
          removeSuccess: 'Магазинът е махнат успешно.',
          snapshotSuccess: 'Пълнотата е записана успешно.'
        },
        errors: {
          generic: 'Възникна грешка при работа с магазините.',
          positionRequired: 'Позицията е задължителна.',
          positionTaken: 'Избраната позиция е заета.',
          fullnessRequired: 'Пълнотата е задължителна.',
          fullnessRange: 'Пълнотата трябва да е между 0 и 200.',
          notAuthenticated: 'Трябва да влезете в профила си.',
          missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
        }
      }
    }
  }
};