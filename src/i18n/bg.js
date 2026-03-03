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
      description: 'Публичен регистър на пчелари, които са избрали да споделят данни.'
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
  profile: {
    photo: {
      title: 'Профилна снимка',
      alt: 'Профилна снимка',
      noPhoto: 'Все още няма качена снимка.',
      upload: 'Качи снимка',
      uploading: 'Качване...',
      download: 'Отвори снимката',
      toasts: {
        uploadSuccess: 'Снимката е качена успешно.'
      },
      errors: {
        required: 'Моля, избери снимка за качване.',
        invalidType: 'Позволени са само изображения.',
        fileTooLarge: 'Файлът е твърде голям (макс. 5MB).',
        generic: 'Възникна грешка при качване на снимката.'
      }
    },
    form: {
      displayName: 'Име за показване',
      about: 'За мен',
      location: 'Локация',
      contacts: 'Контакти',
      isPublicProfile: 'Публичен профил',
      showLocation: 'Покажи локация',
      showHiveCount: 'Покажи брой кошери',
      showContacts: 'Покажи контакти'
    },
    actions: {
      saving: 'Запазване...'
    },
    toasts: {
      saveSuccess: 'Профилът е запазен успешно.'
    },
    errors: {
      generic: 'Възникна грешка при работа с профила.',
      notAuthenticated: 'Трябва да влезете в профила си.',
      missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
    }
  },
  home: {
    directory: {
      searchLabel: 'Търсене по име или локация',
      searchPlaceholder: 'Въведете име или локация...',
      empty: 'Няма публични профили',
      fields: {
        photoAlt: 'Профилна снимка',
        location: 'Локация',
        contacts: 'Контакти',
        hiveCount: 'Публичен брой кошери'
      }
    },
    summary: {
      apiaries: 'Пчелини',
      hives: 'Кошери',
      currentHoney: 'Текущ мед (кг)',
      lastUpdated: 'Последно обновяване',
      noData: 'Няма данни'
    },
    activity: {
      empty: 'Няма последни активности.',
      unknownApiary: 'Неизвестен пчелин',
      snapshots: {
        title: 'Последни снимки на магазини',
        fullness: 'Пълнота'
      },
      inspections: {
        title: 'Последни прегледи'
      },
      harvests: {
        title: 'Последни добиви',
        actualKg: 'Реален добив'
      }
    },
    quickActions: {
      title: 'Бързи действия',
      openApiaries: 'Към пчелини',
      newApiary: 'Добави пчелин'
    },
    errors: {
      generic: 'Възникна грешка при зареждане на началното табло.',
      notAuthenticated: 'Трябва да влезете в профила си.',
      missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
    }
  },
  admin: {
    publicDirectory: {
      title: 'Публични профили',
      empty: 'Няма публични профили за преглед.',
      unknownName: 'Неизвестен пчелар',
      photoAlt: 'Профилна снимка'
    },
    actions: {
      unpublish: 'Скрий',
      processing: 'Скриване...'
    },
    toasts: {
      unpublishSuccess: 'Профилът е скрит от публичния списък.'
    },
    errors: {
      generic: 'Възникна грешка при модериране на публичните профили.',
      notAuthenticated: 'Трябва да влезете в профила си.',
      missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
    }
  },
  board: {
    noData: 'Няма данни',
    summary: {
      apiaries: 'Пчелини',
      hives: 'Кошери',
      currentHoney: 'Текущ мед (кг)',
      importantInspections14d: 'Важни прегледи (14 дни)'
    },
    labels: {
      hivesCount: 'Кошери',
      currentHoney: 'Текущ мед',
      lastUpdated: 'Последно обновяване'
    },
    actions: {
      open: 'Отвори',
      addInspection: 'Добави преглед',
      addSnapshot: 'Добави пълнота',
      addHarvest: 'Добави добив'
    },
    empty: {
      message: 'Все още няма създадени пчелини.',
      link: 'Към пчелини'
    },
    errors: {
      generic: 'Възникна грешка при зареждане на таблото.',
      notAuthenticated: 'Трябва да влезете в профила си.',
      missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
    }
  },
  analyticsReports: {
    noData: 'Няма данни',
    calibration: {
      title: 'Калибрация: оценка срещу реален добив',
      caption: 'Последни до 20 добива'
    },
    trend: {
      title: 'Тренд на пълнотата',
      caption: 'Средни стойности по пчелин'
    },
    filters: {
      title: 'Филтър период',
      period: 'Период',
      days7: '7 дни',
      days14: '14 дни',
      days30: '30 дни',
      days365: '1 година',
      all: 'Целият период'
    },
    columns: {
      date: 'Дата',
      apiary: 'Пчелин',
      hive: 'Кошер',
      estimatedKg: 'Оценка (кг)',
      actualKg: 'Реално (кг)',
      deltaKg: 'Разлика',
      avgFullness: 'Средна пълнота',
      avgKgEstimate: 'Средна оценка (кг)',
      snapshotsCount: 'Снимки',
      lastUpdated: 'Последно обновяване'
    },
    empty: {
      calibration: 'Няма данни за добиви за избрания период.',
      trend: 'Няма данни за пълнота за избрания период.'
    },
    errors: {
      generic: 'Възникна грешка при зареждане на анализите.',
      notAuthenticated: 'Трябва да влезете в профила си.',
      missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
    }
  },
  apiaries: {
    addButton: 'Добави пчелин',
    cardStats: {
      hives: 'Кошери',
      hivesWithSupers: 'Кошери с магазини',
      activeSupers: 'Активни магазини',
      latestHoneyKg: 'Последен общ мед',
      lastUpdated: 'Последно обновяване'
    },
    honeySummary: {
      title: 'Текуща оценка мед',
      activeSupers: 'Активни магазини',
      withData: 'С данни',
      lastUpdated: 'Последно обновено',
      noData: 'Няма данни'
    },
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
      quickStats: {
        activeSupers: 'Активни магазини',
        fullSupers: 'Пълни магазини',
        averageFullness: 'Средна пълнота',
        noData: 'Няма данни'
      },
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
          fullnessRange: 'Пълнотата трябва да е между 0 и 130.',
          notAuthenticated: 'Трябва да влезете в профила си.',
          missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
        }
      },
      inspections: {
        title: 'Прегледи',
        newButton: 'Нов преглед',
        deleteButton: 'Изтрий',
        empty: 'Няма въведени прегледи.',
        importantBadge: 'Важно',
        confirmDelete: 'Сигурни ли сте, че искате да изтриете този преглед?',
        form: {
          broodFrames: 'Рамки с пило',
          honeyPollenFrames: 'Рамки с мед/прашец',
          totalFrames: 'Общо рамки',
          swarmingState: 'Роево състояние',
          eggsPresent: 'Има яйца',
          queenSeen: 'Видяна майка',
          important: 'Маркирай като важно',
          notes: 'Бележки'
        },
        swarming: {
          none: 'Няма',
          suspected: 'Съмнение',
          swarmed: 'Роил се',
          split: 'Отводка'
        },
        summary: {
          brood: 'Пило',
          honeyPollen: 'Мед/прашец',
          total: 'Общо',
          swarming: 'Роене',
          flags: 'Яйца / Майка',
          yes: 'Да',
          no: 'Не'
        },
        actions: {
          saving: 'Запазване...'
        },
        toasts: {
          createSuccess: 'Прегледът е добавен успешно.',
          deleteSuccess: 'Прегледът е изтрит успешно.'
        },
        errors: {
          generic: 'Възникна грешка при работа с прегледите.',
          notAuthenticated: 'Трябва да влезете в профила си.',
          missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
        }
      },
      harvests: {
        title: 'Добив',
        newButton: 'Нов добив',
        deleteButton: 'Изтрий',
        empty: 'Няма въведени добиви.',
        groupedItems: 'Групи рамки',
        itemLabel: 'Група',
        addRow: 'Добави група',
        removeRow: 'Премахни',
        framesCount: 'Брой рамки',
        fillLevel: 'Ниво на запълване',
        rowEstimated: 'Оценка',
        computedTotal: 'Изчислен общ добив',
        estimatedTotal: 'Оценка общо',
        actualTotal: 'Реален добив',
        actualTotalOptional: 'Реален добив (кг, по избор)',
        notes: 'Бележки',
        itemNotes: 'Бележки за групата',
        confirmDelete: 'Сигурни ли сте, че искате да изтриете този добив?',
        fillLevels: {
          very_full: 'Много пълни',
          full: 'Пълни',
          medium: 'Средни',
          low: 'Ниски',
          almost_empty: 'Почти празни'
        },
        actions: {
          saving: 'Запазване...'
        },
        toasts: {
          createSuccess: 'Добивът е добавен успешно.',
          deleteSuccess: 'Добивът е изтрит успешно.'
        },
        errors: {
          generic: 'Възникна грешка при работа с добивите.',
          itemRequired: 'Добавете поне една валидна група рамки.',
          notAuthenticated: 'Трябва да влезете в профила си.',
          missingConfig: 'Липсва конфигурация за Supabase. Провери .env настройките.'
        }
      }
    }
  }
};